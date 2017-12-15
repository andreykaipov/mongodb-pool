# mongodb-pool

This is a small wrapper around the native node MongoDB driver to make managing the internal connection pool easier.

## why? 
Here's a snippet from the [connection pooling section](https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling) of the MongoDB docs --

> A Connection Pool is a cache of database connections maintained by the driver so that connections can be re-used when new connections to the database are required. To reduce the number of connection pools created by your application, **we recommend calling MongoClient.connect once and reusing the database variable returned by the callback _(or promise)_**.

That sounds crazy! As our apps grow, it often becomes a hassle to pass along that database variable around every module! What harm can one more connection do, right? Unfortunately, `MongoClient.connect` doesn't create one more connection, it creates one more connection _pool_.

Instead of creating unnecessary extra pools, this wrapper takes care of reusing that database variable across different modules. Now we might do something like this --

```javascript
// app.js
const { Mongo } = require('mongodb-pool')
const aux = require('./auxiliary.js')

Mongo.getConnection('mongodb://localhost:27017/my_db', {
  poolSize: 3
}).then(() => {
  ...
  aux.startApp()
})
```

```javascript
// auxiliary.js
const { Mongo } = require('mongodb-pool')

exports.startApp = () => {
  const db = Mongo.getDb()
  // now we can use our `db` as usual without having to connect again!
  // the MongoDB driver picks a connection for you out of its internal connection pool!
}
```

By default, this wrapper's API is promise-based. By requiring `mongodb-pool/callback_api`, we can use the callback-based API instead. See the API docs below for more details.


## how can i use it?

Simply run `npm i --save mongodb-pool` in your terminal to install this package as a dependency in your project. As this package is a wrapper around `mongodb`, no need to install or import `mongodb` manually. Check out the quick comparison example below and get rolling.

TypeScript type definitions for this wrapper are included with the package if you need them, but not the types for `mongodb`! Please install those manually via `npm i --save-dev @types/mongodb` as this package doesn't do it.


## comaprison example - does it really work?

Let's test it! We'll compare connecting to a Mongo instance using both the original `mongodb` package and the `mongodb-pool` package. We create a file `app.js` with the following contents. It can also be found under `examples/js/comparison/app.js`.

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

Here we're loading both packages, connecting to the database, and executing the `whatsmyuri` command against the database three times. Let's start up `mongod` locally and run through both branches of that `if-else` statement. Take note of our connection option -- `poolSize: 1`!

Running the above script with the `mongoclient` argument, i.e. `node app.js mongoclient`, our output is...
```
$ node examples/js/comparison/app.js mongoclient
127.0.0.1:63218
127.0.0.1:63219
127.0.0.1:63220
```

The internal `whatsmyuri` command returns information on the current client connected to the Mongo instance. We can see my local computer has connections open on ports 63218, 63218, and 63218 to Mongo. Since the original `mongodb` package creates a new connection pool each time we call `MongoClient.connect`, and each of our pools have size 1, we have three connections.

Let's try running the script without any arguments, i.e. `node app.js`, our output is as expected!
```
$ node examples/js/comparison/app.js
127.0.0.1:63217
127.0.0.1:63217
127.0.0.1:63217
```

The MongoDB driver is properly using the only connection from the pool we created to run our commands against the database. This library is reusing the hidden `db` variable under the hood! Try increasing the poolsize and connecting a lot more to the database and see what is logged!

We can verify even further by checking the TCP ports using `27017`.
```
$ lsof -i tcp:27017 -Fn
p46940
n*:27017
nlocalhost:27017->localhost:63217
p56831
nlocalhost:63217->localhost:27017
```

More small and similar examples in both JavaScript and TypeScript are available at the [GitHub repo](https://github.com/andreykaipov/mongodb-pool-examples) (if you're not already reading this `README` on GitHub). Just checkout this project, run `npm run examples` to build the package locally, start a local MongoDB instance, read through the example files, and run one of the `app.{js,ts}` files under the `examples` directory.

## api

##### Promise-based API

+ `Mongo.getConnection(uri?: string, options?: MongoClientOptions): Promise<Db>`

	Gets a connection from the pool to the provided MongoDB instance via a returned `db` object. If we're not yet connected, it'll establish a connection via the `uri` using any given `options`. Upon calling this method after a connection is established, the `uri` and `options` arguments are ignored, in which case we can omit them so that the call is equivalent to `Mongo.getConnection()`, returning a promise with our `db` object.

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

	Gets a connection from the pool to the provided MongoDB instance via a `db` object that can be accessed via the `cb` argument. If we're not yet connected, it'll establish a connection via the `uri` using any given `options`. Upon calling this method after a connection is established, the `uri` and `options` arguments are ignored, in which case we can ignore them so that the call is equivalent to `Mongo.getConnection(db => { ... })`, exposing the `db` object for use.

	This function is also aliased to `Mongo.connect`.

+ `Mongo.getDb(): Db`

	Alternatively, after a connection is established, the action of getting the `db` object is no longer asynchronous, so there is really no need to use `Mongo.getConnection(db => { ... })` to access the `db` object. We can now just call `Mongo.getDb()` to return the `db` object. If we are not connected yet, this will return `null`. 

+ `Mongo.getCollection<T>(name: string): Collection<T>`

	This is just `Mongo.getDb().collection(name: string)`.

+ `Mongo.closePool(forceClose?: boolean, cb?: MongoCallback<void>): void`

	Closes the pool.


## limitations

This library maintains a singleton around the instantiated `db` object created when connecting to a Mongo instance for the first time. Of course, the drawback here is that we're no longer able to create another connection pool (whether it is to the same Mongo instance or to another). If this is not a requirement in your application, then there are no limitations!

Lemme know if there's a demand for multiple connection pool management though!
