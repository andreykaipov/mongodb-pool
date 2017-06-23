const MongoClient = require('mongodb')
const { Mongo } = require('../../../mongodb-pool')

const connectionParams = [ 'mongodb://localhost:27017/admin', { poolSize: 1 } ]

async function connectViaMongoClient() {
  await MongoClient.connect(...connectionParams).then(whatsMyUri)
}

async function connectViaMongoDbPool() {
  await Mongo.connect(...connectionParams).then(whatsMyUri)
}

function whatsMyUri(db) {
  db.command({ whatsmyuri: 1 }).then(result => {
    console.log(result.you)
  })
}

;(async () => {
  if (process.argv[2] == 'mongoclient') {
    await connectViaMongoClient()
    await connectViaMongoClient()
    await connectViaMongoClient()
  } else {
    await connectViaMongoDbPool()
    await connectViaMongoDbPool()
    await connectViaMongoDbPool()
  }
})()
