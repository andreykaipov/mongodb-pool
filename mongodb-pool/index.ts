import { Db, MongoCallback, MongoClient, MongoClientOptions } from 'mongodb'

/**
 * The native MongoDB driver does connection pooling for us, so we typically only want to
 * have one instance of the `Db` object returned from MongoClient#connect in our application.
 * For this reason, we use TypeScript namespaces to mimic a singleton pattern.
 */
export namespace MongoDbPool {

  const dbPromise = (uri: string, options?: MongoClientOptions) => {
    return MongoClient.connect(uri, options)
  }

  let db: Db = null

  export async function connect(uri?: string, options?: MongoClientOptions) {
    return db = await dbPromise(uri, options)
  }

  export async function getConnection(uri?: string, options?: MongoClientOptions) {
    return db ? db : (db = await dbPromise(uri, options))
  }

  export function getDb() {
    return db
  }

  export async function closePool() {
    if (db) {
      await db.close()
    }
  }

}
