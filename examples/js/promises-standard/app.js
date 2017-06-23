const { Mongo } = require('../../../mongodb-pool')
const aux = require('./auxiliary.js')

Mongo.getConnection('mongodb://localhost:27017/admin', {
  poolSize: 3
}).then(db => {
  aux.helper()
})
