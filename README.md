# mongodb-pool

This is a small wrapper around the native node MongoDB driver to make managing the internal connection pool easier.

### why? 
Here's a snippet from the [connection pooling section](https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling) of their docs --

> A Connection Pool is a cache of database connections maintained by the driver so that connections can be re-used when new connections to the database are required. To reduce the number of connection pools created by your application, we recommend calling MongoClient.connect once and reusing the database variable returned by the callback _(or promise)_.

However, if your app has many modules, it might start to become a hassle to pass along that database variable to every module!

Instead, this wrapper allows you to do something like this --

```
// app.js
const { MongoDbPool } = require('mongodb-pool')
const aux = require('./auxiliary.js')

MongoDbPool.getConnection('mongodb://localhost:27017', {
  poolSize: 3
}).then(db => {
  ...
  aux.startApp()
})
```

```
// auxiliary.js
const { MongoDbPool } = require('mongodb-pool')

exports.startApp = () => {
  const db = MongoDbPool.getDb()
  // now we can use our `db` as usual!
}
```

More small examples are at https://github.com/andreykaipov/mongodb-pool-examples!
