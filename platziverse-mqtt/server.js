import { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } from 'constants';

'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')
const conf = require('../platziverse-db/config-db.js')
const { parsePayload } = require('./utils.js')

const backend = {
  type: "redis",
  redis,
  return_buffers: true
}

const settings = {
  port: 1883, //Por Defecto
  backend
}

const config = conf(false)
const server = new mosca.Server(settings)
const clients = new Map()

let Agent, Metric

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqtt]')} server esta corriendo`)
})

server.on('clientConnected', client => {
  debug(`Cliente Conectado: ${client.id}`) //id generado automaticamente
  clients.set(client.id, null)
})

server.on('clientDisconnected', client => {
  debug(`Cliente Desconectado: ${client.id}`) //id generado automaticamente
})

server.on('published', async (packet, client) => {
  debug(`Recibido: ${packet.topic}`)

  switch (package.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
        debug(`Payload ${packet.payload}`)
        const payload = parsePayload(packet.payload)

      if(payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }

        debug(`Agent ${agent.uuid} guardado`)

        //Notificar que el agente esta conectado
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid:agent,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }
      }
      break
  }
})

server.on('error', handleFatalError)

function handleFatalError () {
  console.error(`${chalk.red('Error Fatal')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

function handleError () {
  console.error(`${chalk.red('Error')} ${err.message}`)
  console.error(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)