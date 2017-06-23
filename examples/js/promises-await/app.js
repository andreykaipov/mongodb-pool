const { Mongo } = require('../../../mongodb-pool')
const aux = require('./auxiliary.js')

;(async () => {
  await Mongo.connect('mongodb://localhost:27017/admin', { poolSize: 3 })
  aux.helper()
})()
