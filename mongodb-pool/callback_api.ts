import { Db, MongoCallback, MongoClient, MongoClientOptions } from 'mongodb'

/**
 * The native MongoDB driver does connection pooling for us, so we typically only
 * want to have one instance of the `Db` object returned from MongoClient#connect.
 * For this reason, we use TypeScript namespaces to mimic a singleton pattern.
 */
namespace MongoDbPool {

  let db: Db = null

  export function getConnection(uri: string, options: MongoClientOptions, cb: MongoCallback<Db>): void
  export function getConnection(uri: string, cb: MongoCallback<Db>): void
  export function getConnection(cb: (a: Db) => void): void
  export function getConnection(first: any, second?: any, third?: MongoCallback<Db>) {
    if (typeof first === 'string') {
      if (typeof second === 'object') {
        getConnection_1(first, second, third)
      } else if (typeof second === 'function') {
        getConnection_2(first, second)
      }
    } else if (typeof first === 'function') {
      getConnection_3(first)
    }
  }

  export function getDb() {
    return db
  }

  export function closePool() {
    if (db) {
      db.close()
    }
  }

  function getConnection_1(uri: string, options: MongoClientOptions, cb: MongoCallback<Db>) {
    if (!db) {
      MongoClient.connect(uri, options, (err, _db) => {
        db = _db
        cb(err, db)
      })
    } else {
      cb(null, db)
    }
  }

  function getConnection_2(uri: string, cb: MongoCallback<Db>) {
    getConnection_1(uri, {}, cb)
  }

  function getConnection_3(cb: (a: Db) => void) {
    cb(db)
  }

}
