'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const defaults = require('defaults')
const setupAgent = require('./lib/lib_agent')
const setupMetric = require('./lib/lib_metric')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)
  
  await sequelize.authenticate()

  if (config.setup) {
    await sequelize.sync({force: true})
  }

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetricModel, AgentModel)

  return {Agent, Metric}
}
