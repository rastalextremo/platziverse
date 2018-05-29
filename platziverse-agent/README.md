# Platziverse - Agent

## Uso


``` js
const PlatziverseAgent = require('platziverse-agent')

const agent = new PlatziverseAgent({
    name: 'myapp',
    username: 'admin'
    interval : 2000
})

agent.addMetrics('rss', function getRss () {
    return process.memoryUsage().rss
})

agent.addMetrics('promiseMetric', function getRandomPromises() {
    return Promise.resolve(Math.random())
})

agent.addMetrics('callbackMetric', function getRandomCallback (callback) {
    setTimeout(() => {
        callback(null, Math.random())
    },1000)
})

agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', payload => {
    console.log(payload)
})

agent.connect()

setTimeout(() => agent.disconnect(), 20000)

```