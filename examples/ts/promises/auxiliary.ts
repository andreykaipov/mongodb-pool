import { Mongo } from '../../../mongodb-pool'

// Runs the serverStatus command against MongoDB and looks at
// the current connections. Notice how the current connections
// never exceed our previously given pool size of 3.
export function helper() {
  Array(10).fill(0).forEach(_ => {
    getMongoServerStatus()
  })
}

async function getMongoServerStatus() {
  const db = Mongo.getDb()
  const status = await db.command({ serverStatus: 1 })
  console.log(status.connections)
}
