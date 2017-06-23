import { Mongo } from '../../../mongodb-pool/callback_api'
import { helper } from './auxiliary'

Mongo.getConnection('mongodb://localhost:27017/admin', {
  poolSize: 3
}, (err, db) => {
  if (!err) {
    helper()
  }
})
