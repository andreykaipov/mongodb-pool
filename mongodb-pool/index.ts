import { Db, MongoClient, MongoClientOptions } from 'mongodb'

/**
 * The native MongoDB driver does connection pooling for us, so we typically only want to
 * have one instance of the `Db` object returned from MongoClient#connect in our application.
 * For this reason, we use TypeScript modules to mimic a singleton pattern.
 * See https://github.com/basarat/typescript-book/blob/master/docs/tips/singleton.md
 */
export namespace MongoDbPool {

  const dbPromise = (uri: string, options?: MongoClientOptions) => {
    return MongoClient.connect(uri, options)
  }

  let db: Db = null

  /**
   * Opens up a connection to the provided MongoDB server, replacing the current `Db` instance!
   * Be careful with this one.
   * @param uri The MongoDB connection string.
   * @param options The client options as specified by the native Node driver for MongoDB.
   */
  export async function connect(uri?: string, options?: MongoClientOptions) {
    await this.closePool()
    return db = await dbPromise(uri, options)
  }

  export async function getConnection(uri?: string, options?: MongoClientOptions) {
    return db ? db : (db = await dbPromise(uri, options))
  }

  export function getDb() {
    return db
  }

  export async function closePool(forceClose?: boolean) {
    if (db) {
      await db.close(forceClose)
    }
  }

}
