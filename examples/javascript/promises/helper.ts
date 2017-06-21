// tslint:disable:no-console
import { Pongo } from '../../../pongo'

// Runs the serverStatus command against MongoDB and looks at
// the current connections. Notice how the current connections
// never exceed our previously given pool size of 3.
export function helper() {
  Array(10).fill(0).forEach(_ => {
    getMongoConnectionStatus()
  })
}

export async function getMongoConnectionStatus() {
  const db = Pongo.getDb()
  const status = await db.command({ serverStatus: 1 })
  console.log(status.connections)
}
