import { Pongo } from '../../../pongo'
import { helper } from './helper'

(async () => {
  await Pongo.connect('mongodb://localhost:27017/admin', { poolSize: 3 })
  helper()
})()
