# mongodb-pool

This is a small wrapper around the native node MongoDB driver to make managing the internal connection pool easier.

## why? 
Here's a snippet from the [connection pooling section](https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling) of the MongoDB docs --

> A Connection Pool is a cache of database connections maintained by the driver so that connections can be re-used when new connections to the database are required. To reduce the number of connection pools created by your application, we recommend calling MongoClient.connect once and reusing the database variable returned by the callback _(or promise)_.

However, as our apps grow, it often becomes a hassle to pass along that database variable around every module! Instead, this wrapper can take care of that for you!

Now we can do something like this --

```javascript
// app.js
const { Mongo } = require('mongodb-pool')
const aux = require('./auxiliary.js')

Mongo.getConnection('mongodb://localhost:27017/my_db', {
  poolSize: 3
}).then(db => {
  ...
  aux.startApp()
})
```

```javascript
// auxiliary.js
const { Mongo } = require('mongodb-pool')

exports.startApp = () => {
  const db = Mongo.getDb()
  // now we can use our `db` as usual!
}
```

By default, this wrapper's API is promise-based. By requiring `mongodb-pool/callback_api`, we can use the callback-based API instead. See the API docs below for more details.

## how can i use it?

Simply run `npm i --save mongodb-pool` in your terminal to install this package as a dependency in your project. As this package is a wrapper to `mongodb`, no need to install `mongodb` manually. Check out the small examples linked above and get rolling.

TypeScript type definitions for this wrapper are included with the package if you need them, but not the types for `mongodb`! Please install those manually via `npm i --save-dev @types/mongodb` as this package doesn't do it.


## examples

More small and similar examples in both JavaScript and TypeScript are available at the [GitHub repo](https://github.com/andreykaipov/mongodb-pool-examples) (if you're not already reading this `README` on GitHub). Just checkout this project, run `npm run examples` to build the package locally, start a local MongoDB instance, look through the examples, and run `node examples/js/promises-await/app.js` (for example).

Or see below for a detailed example.

## api

##### Promise-based API

+ `Mongo.getConnection(uri?: string, options?: MongoClientOptions): Promise<Db>`

	Gets a connection from the pool to the provided MongoDB instance via a returned `db` object. If we're not yet connected, it'll establish a connection via the `uri` using any given `options`. Upon calling this method after a connection is established, the `uri` and `options` arguments are ignored, in which case we can omit them so that `Mongo.getConnection()` will return a promise with our `db` object.

	This function is also aliased to `Mongo.connect`.

+ `Mongo.getDb(): Db`

	Alternatively, after a connection is established, the action of getting the `db` object is no longer asynchronous, so there is really no need to call `Mongo.getConnection()` to get a _promise_ with the `db` object. We can now just call `Mongo.getDb()` to return the `db` object. If we are not connected yet, this will return `null`.

+ `Mongo.getCollection<T>(name: string): Collection<T>`

	This is just `Mongo.getDb().collection(name: string)`.

+ `Mongo.closePool(forceClose?: boolean): Promise<void>`

	Closes the pool. 


##### Callback-based API

In the following `MongoCallback<T>` is a function of the form `(err: MongoError, result: T) => void`.

+ `Mongo.getConnection(uri?: string, options?: MongoClientOptions, cb: MongoCallback<Db>): Promise<Db>`

	Gets a connection from the pool to the provided MongoDB instance via a `db` object that can be accessed via the `cb` argument. If we're not yet connected, it'll establish a connection via the `uri` using any given `options`. Upon calling this method after a connection is established, the `uri` and `options` arguments are ignored, in which case we can ignore them, so that `Mongo.getConnection(db => { ... })` will expose the `db` object.

	This function is also aliased to `Mongo.connect`.

+ `Mongo.getDb(): Db`

	Alternatively, after a connection is established, the action of getting the `db` object is no longer asynchronous, so there is really no need to use `Mongo.getConnection(db => { ... })` to access the `db` object. We can now just call `Mongo.getDb()` to return the `db` object. If we are not connected yet, this will return `null`. 

+ `Mongo.getCollection<T>(name: string): Collection<T>`

	This is just `Mongo.getDb().collection(name: string)`.

+ `Mongo.closePool(forceClose?: boolean, cb?: MongoCallback<void>): void`

	Closes the pool.



## okay - but does it really work?

Let's test it! We create a file `app.js` with the following contents.

```javascript
const MongoClient = require('mongodb')
const { Mongo } = require('mongodb-pool')

const connectionParams = [
  'mongodb://localhost:27017/admin',
  { poolSize: 1 }
]

async function connectViaMongoClient() {
  await MongoClient.connect(...connectionParams).then(whatsMyUri)
}

async function connectViaMongoDbPool() {
  await Mongo.connect(...connectionParams).then(whatsMyUri)
}

function whatsMyUri(db) {
  db.command({ whatsmyuri: 1 }).then(result => {
    console.log(result.you)
  })
}

;(async () => {
  if (process.argv[2] == 'mongoclient') {
    await connectViaMongoClient()
    await connectViaMongoClient()
    await connectViaMongoClient()
  } else {
    await connectViaMongoDbPool()
    await connectViaMongoDbPool()
    await connectViaMongoDbPool()
  }
})()
```

Here we're loading both the `mongodb` package, and this wrapper. If we start up `mongod` locally and run this script, we can see what connections have been accepted by Mongo via the `uri`. We do this by running the `whatsmyuri` command against each `db` object. Take note of our connection option -- `poolSize: 1`!

Running the above script without any arguments -- `node app.js`, our output is as expected!
```
$ node examples/js/comparison/app.js
127.0.0.1:63217
127.0.0.1:63217
127.0.0.1:63217
```

The driver is properly using only one connection to run our commands against the database.

On the other hand, running the above script with the `mongoclient` argument, i.e. `node app.js mongoclient`, our output is as follows!
```
$ node examples/js/comparison/app.js mongoclient
127.0.0.1:63218
127.0.0.1:63219
127.0.0.1:63220
```

Here each time we connected and ran our command, the driver never reused any existing connections!
