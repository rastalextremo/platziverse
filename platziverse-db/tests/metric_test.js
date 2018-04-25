'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const agentFixtures = require('./fixtures/fx_agent')
const metricFixtures = require('./fixtures/fx_metric')

let config = {
  logging: function () {}
}

let AgentStub = null
let MetricStub = null

let db = null
let uuid = 'yyy-yyy-yyy'
let type = 'CPU'

let sandbox = null

let uuidArgs = {
  where: {
    uuid
  }
}

let newMetric = {
  agentId: 1,
  type: 'CPU',
  value: '23%'
}

let metricUuidArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let typeUuidArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  MetricStub = {
    belongsTo: sandbox.spy()
  }

  // Modelo findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.findByUuid))

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({toJSON () {return newMetric}}))

  metricUuidArgs.include[0].model = AgentStub
  typeUuidArgs.include[0].model = AgentStub
  
  // Modelo findAll Stub
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all))
  MetricStub.findAll.withArgs(metricUuidArgs).returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)))
  MetricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.findByTypeUuid(type, uuid)))

  const setupDatabase = proxyquire('../index.js', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Servicio Metric Existe')
})

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'Funcion findOne esta siendo llamada')
  t.true(AgentStub.findOne.calledOnce, 'Funcion findOne esta siento llamada una vez')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'Funcion findOne esta siento llamada con parametros')
  t.true(MetricStub.create.called, 'Funcion create esta siendo llamada')
  t.true(MetricStub.create.calledOnce, 'Funcion create esta siento llamada una vez')

  t.deepEqual(metric, newMetric, 'La Metrica creada es perfectamente igual al que le envié')
})

test.serial('Metric#findByAgentUuid', async t => {
  let metric = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'Funcion findAll esta siendo llamada')
  t.true(MetricStub.findAll.calledOnce, 'Funcion findAll esta siendo llamada una vez')
  t.true(MetricStub.findAll.calledWith(metricUuidArgs), 'Funcion findAll esta siendo llamada con los argumentos correctos')
  
  t.deepEqual(metric, metricFixtures.findByAgentUuid(uuid), 'La Metrica buscada es perfectamente igual al que devuelve')
})

test.serial('Metric#findByTypeUuid', async t => {
  let metric = await db.Metric.findByTypeUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'Funcion findAll esta siendo llamada')
  t.true(MetricStub.findAll.calledOnce, 'Funcion findAll esta siendo llamada una vez')
  t.true(MetricStub.findAll.calledWith(typeUuidArgs), 'Funcion findAll esta siendo llamada con los argumentos correctos')
  
  t.deepEqual(metric, metricFixtures.findByTypeUuid(type, uuid), 'La Metrica buscada es perfectamente igual al que devuelve')
})
