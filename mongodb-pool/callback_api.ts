import { Collection, Db, MongoCallback, MongoClient, MongoClientOptions } from 'mongodb'

/**
 * The native MongoDB driver does connection pooling for us, so we typically only want to
 * have one instance of the `Db` object returned from MongoClient#connect in our application.
 * For this reason, we use TypeScript modules to mimic a singleton pattern.
 * See https://github.com/basarat/typescript-book/blob/master/docs/tips/singleton.md
 */
export namespace Mongo {

  let db: Db = null

  export function getConnection(uri: string, options: MongoClientOptions, cb: MongoCallback<Db>): void
  export function getConnection(uri: string, cb: MongoCallback<Db>): void
  export function getConnection(cb: (a: Db) => void): void
  export function getConnection(first: any, second?: any, third?: MongoCallback<Db>) {
    if (typeof first === 'string') {
      const uri = first
      let options = {}
      let cb = third
      if (typeof second === 'object') {
        options = second
      } else if (typeof second === 'function') {
        cb = second
      }
      if (!db) {
        MongoClient.connect(uri, options, (err, _db) => {
          db = _db
          cb(err, db)
        })
      } else {
        cb(null, db)
      }
    } else if (typeof first === 'function') {
      const cb = first
      cb(db)
    }
  }

  /* alias to getConnection() */
  export function connect(first: any, second?: any, third?: MongoCallback<Db>) {
    getConnection(first, second, third)
  }

  export function getCollection<T = any>(name: string): Collection<T> {
    return db ? db.collection(name) : null
  }

  export function getDb() {
    return db
  }

  export function closePool(cb: MongoCallback<void>): void
  export function closePool(forceClose: boolean, cb: MongoCallback<void>): void
  export function closePool(first: any, second?: MongoCallback<void>) {
    if (db) {
      if (typeof first === 'function') {
        db.close(first)
      } else if (typeof first === 'boolean') {
        db.close(first, second)
      }
    }
  }

}
