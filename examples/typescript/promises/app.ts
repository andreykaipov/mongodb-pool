import { MongoDbPool } from '../../../mongodb-pool'
import { helper } from './helper'

(async () => {
  await MongoDbPool.connect('mongodb://localhost:27017/admin', { poolSize: 3 })
  helper()
})()
