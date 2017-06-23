import { Mongo } from '../../../mongodb-pool'
import { helper } from './auxiliary'

(async () => {
  await Mongo.connect('mongodb://localhost:27017/admin', { poolSize: 3 })
  helper()
})()
