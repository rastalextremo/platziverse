'use strict'

const agentFixtures = require('./fx_agent')
const utils = require('../../utils/utils')

let id = 1

const metric = {
  id: 1,
  agentId: 'yyy-yyy-yyy',
  type: 'CPU',
  value: '23%',
  createdAt: new Date(),
  updatedAt: new Date(),
  agent: agentFixtures.findById(1)
}

const metrics = [
  metric,
  extend(metric, { id: 2, uuid: 'yyy-yyy-yyw', type: 'MEMORY', value: '8GB' }),
  extend(metric, { id: 3, uuid: 'yyy-yyy-yyx' }),
  extend(metric, { id: 4, uuid: 'yyy-yyy-yyz', type: 'CPU', value: '80%' })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function findByAgentUuid (uuid) {
  return metrics.filter(m => m.agent ? m.agent.uuid === uuid : false).map(m => {
    const clone = Object.assign({}, m)
    delete clone.agent
    return clone
  })
}

function findByTypeUuid (type, uuid) {
  return metrics.filter(m => m.type === type && (m.agent ? m.agent.uuid === uuid : false)).map(m => {
    const clone = Object.assign({}, m)
    delete clone.agentId
    delete clone.agent
    return clone
  }).sort(utils.sortBy('createdAt')).reverse()
}

module.exports = {
  all: metrics,
  findByAgentUuid,
  findByTypeUuid
}