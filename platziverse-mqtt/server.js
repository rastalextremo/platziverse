'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')

const backend = {
  type: "redis",
  redis,
  return_buffers: true
}

const settings = {
  port: 1883, //Por Defecto
  backend
}

const server = new mosca.Server(settings)

server.on('ready', () => {
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

server-on('error', handleFatalError)

function handleFatalError () {
  console.error(`${chalk.red('Error Fatal')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)