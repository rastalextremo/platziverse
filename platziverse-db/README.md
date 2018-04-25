# Platziverse-db

## Uso
``` js
const setupDatabase = require('platziverse-db')

setpDatabase(conf).then(db => {
    const {Agent, Metric} = db
}).catch(err => console.error(err))

```