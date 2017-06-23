const { Mongo } = require('../../../mongodb-pool/callback_api')
const aux = require('./auxiliary.js')

Mongo.getConnection('mongodb://localhost:27017/admin', {
  poolSize: 3
}, (err, db) => {
  if (!err) {
    aux.helper()
  }
})
