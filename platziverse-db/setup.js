'use strict'

const debug = require('debug')('platziverse:db:setup')
const conf = require('./config-db.js')
const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')
const prompt = inquirer.createPromptModule()

async function setup () {
  let flag = false
  
  process.argv.forEach(e => {
    if (e === '--Y') {
      flag = true
    }
  })

  if(!flag) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'confirmacion',
        message: 'Esto va a destruir la base de datos, está seguro ?'
      }
    ])
  
    if (!answer.confirmacion) {
      return console.log('No hacemos nada entonces...')
    }
  }

  const config = conf(true)

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal Error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
