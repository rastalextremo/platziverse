'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const agentFixtures = require('./fixtures/fx_agent')

let db = null
let id = 1
let uuid = 'yyy-yyy-yyy'

let config = {
  logging: function () {}
}

let AgentStub = null

let MetricStub = {
  belongsTo: sinon.spy()
}

let sandbox = null
let single = Object.assign({}, agentFixtures.single)

let uuidArgs = {
  where: {
    uuid
  }
}

let connectedArgs = {
  where: {
    connected: true
  }
}

let usernameArgs = {
  where: {
    username: 'platzi',
    connected: true
  }
}

let newAgentArgs = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Modelo create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgentArgs).returns(Promise.resolve({toJSON () { return newAgentArgs }}))

  // Modelo update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(agentFixtures.single))

  // Modelo findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.findByUuid(uuid)))

  // Modelo findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.findById(id)))

  // Modelo findByUuid Stub
  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.findByUuid(uuid)))

  // Modelo findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

  const setupDatabase = proxyquire('../index.js', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Servicio Agente Existe')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany fué ejecutada')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argumento MetricModel bien recibido')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongTo fué ejecutado')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argumento AgentModel bien recibido')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)
  t.true(AgentStub.findById.called, 'Funcion findById esta siendo llamada')
  t.true(AgentStub.findById.calledOnce, 'Funcion findById esta siendo llamada una sola vez')
  t.true(AgentStub.findById.calledWith(id), 'Funcion findById esta siendo llamada con un id de argumento')

  t.deepEqual(agent, agentFixtures.findById(id), 'Todo Perfecto')
})

test.serial('Agent#createOrUpdate - Exist', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'Funcion findOne esta siendo llamada')
  t.true(AgentStub.findOne.calledTwice, 'Funcion findOne esta siento llamada dos veces')
  t.true(AgentStub.update.called, 'Funcion update esta siendo llamada')
  t.true(AgentStub.update.calledOnce, 'Funcion update esta siento llamada una vez')

  t.deepEqual(agent, single, 'El agente creado es perfectamente igual al que le envié')
})

test.serial('Agent#createOrUpdate - New', async t => {
  let agent = await db.Agent.createOrUpdate(newAgentArgs)

  t.true(AgentStub.findOne.called, 'Funcion findOne esta siendo llamada')
  t.true(AgentStub.findOne.calledOnce, 'Funcion findOne esta siendo llamada una sola vez')
  t.true(AgentStub.findOne.calledWith({where: {uuid: newAgentArgs.uuid}}), 'Funcion findOne esta siendo llamada con los argumentos de newAgentArgs')
  t.true(AgentStub.create.called, 'Funcion create esta siendo llamada')
  t.true(AgentStub.create.calledOnce, 'Funcion create esta siendo llamada una sola vez')
  t.true(AgentStub.create.calledWith(newAgentArgs), 'Funcion create esta siendo llamada con los argumentos de newAgentArgs')

  t.deepEqual(agent, newAgentArgs, 'El agente creado es perfectamente igual al que le envié')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'Funcion findAll esta siendo llamada')
  t.true(AgentStub.findAll.calledOnce, 'Funcion findAll esta siendo llamada una sola vez')
  t.true(AgentStub.findAll.calledWith(), 'Funcion findAll esta siendo llamada con los argumentos de newAgentArgs')

  t.is(agents.length, agentFixtures.all.length, 'El tamaño de las respuestas son identicos')
  t.deepEqual(agents, agentFixtures.all, 'La respuesta es identica a la esperada')
})

test.serial('Agent#username', async t => {
  let agents = await db.Agent.findByUsername('platzi')

  t.true(AgentStub.findAll.called, 'Funcion findAll esta siendo llamada')
  t.true(AgentStub.findAll.calledOnce, 'Funcion findAll esta siendo llamada una sola vez')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'Funcion findAll esta siendo llamada con los argumentos de usernameArgs')

  t.is(agents.length, agentFixtures.platzi.length, 'El tamaño de las respuestas son identicos')
  t.deepEqual(agents, agentFixtures.platzi, 'La respuesta es identica a la esperada')
})
