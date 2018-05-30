'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')

const api = express.Router()

api.get('/agents', (req, res) => {
	debug('Un llamado a /agents')
	res.send({})
})

api.get('/agent/:uuid', (req, res, next) => {
	debug('Un llamado a /agent')
	const { uuid } = req.params

	if (uuid != 'yyy') {
		return next(new Error('Agent not found'))
	}

	res.send({ uuid })
})

api.get('/metrics/:uuid', (req, res) => {
	debug('Un llamado a /metrics/uuid')
	const { uuid } = req.params
	res.send({ uuid })
})

api.get('/metrics/:uuid/:type', (req, res) => {
	debug('Un llamado a /metrics/uuid/type')
	const { uuid, type } = req.params
	res.send({ uuid, type })
})

module.exports = api