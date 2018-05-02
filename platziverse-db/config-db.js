'use strict'

const debug = require('debug')('platziverse:db:setup')

module.exports = function (setup = true ) {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASS || 'system32',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: s => debug(s),
    setup
  }

  return config
}