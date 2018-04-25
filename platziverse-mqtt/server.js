'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')

const backend = {
  type: "redis",
  redis,
  return_buffers: true
}

const settings = {
  port: 1883, //Por Defecto
  backend
}

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USERNAME || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s),
}

const server = new mosca.Server(settings)

let Agent, Metric

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqtt]')} server esta corriendo`)
})

server.on('clientConnected', client => {
  debug(`Cliente Conectado: ${client.id}`) //id generado automaticamente
})

server.on('clientDisconnected', client => {
  debug(`Cliente Desconectado: ${client.id}`) //id generado automaticamente
})

server.on('published', (packet, client) => {
  debug(`Recibido: ${packet.topic}`)
  debug(`Payload: ${packet.payload}`)
})

server.on('error', handleFatalError)

function handleFatalError () {
  console.error(`${chalk.red('Error Fatal')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)