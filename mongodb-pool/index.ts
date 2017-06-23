import { Collection, Db, MongoClient, MongoClientOptions } from 'mongodb'

/**
 * The native MongoDB driver does connection pooling for us, so we typically only want to
 * have one instance of the `Db` object returned from MongoClient#connect in our application.
 * For this reason, we use TypeScript modules to mimic a singleton pattern.
 * See https://github.com/basarat/typescript-book/blob/master/docs/tips/singleton.md
 */
export namespace Mongo {

  const dbPromise = (uri: string, options?: MongoClientOptions) => {
    return MongoClient.connect(uri, options)
  }

  let db: Db = null

  export async function getConnection(uri?: string, options?: MongoClientOptions) {
    return db ? db : (db = await dbPromise(uri, options))
  }

  /* alias to getConnection() */
  export async function connect(uri?: string, options?: MongoClientOptions) {
    return getConnection(uri, options)
  }

  export function getCollection<T = any>(name: string): Collection<T> {
    return db ? db.collection(name) : null
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
