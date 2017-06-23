const { Mongo } = require('../../../mongodb-pool')

// Runs the serverStatus command against MongoDB and looks at
// the current connections. Notice how the current connections
// never exceed our provided pool size of 3 in `app.js`.
exports.helper = () => {
  Array(10).fill(0).forEach(_ => {
    getMongoServerStatus()
  })
}

getMongoServerStatus = async () => {
  const status = await Mongo.getDb().command({ serverStatus: 1 })
  console.log(status.connections)
}
