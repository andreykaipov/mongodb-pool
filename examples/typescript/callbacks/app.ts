import { MongoDbPool } from '../../../mongodb-pool/callback_api'
import { helper } from './helper'

MongoDbPool.getConnection('mongodb://localhost:27017/admin', { poolSize: 3 }, (err, db) => {
  if (err == null) {
    helper()
  }
})
