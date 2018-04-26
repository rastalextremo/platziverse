'use strict'

const debug = require('debug')('platziverse:db:setup')

module.exports = function (setup = true ) {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USERNAME || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup
  }

  return config
}