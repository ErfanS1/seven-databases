```bash
# general commands
mongosh --host <host> --port <port> -u <username> -p <password> --authenticationDatabase <auth_db>

# Im using mongosh, there are different clients for mongo, inside container it was installed
mongosh -u userName -p passWord

# to use a different db
use dbName

# to list dbs
show dbs

# to list collections
show collections

# to get help
help

# to show users
show users

# to show roles
show roles
```

# Crud

### create
```js
// to insert you can use db.collectionName.insertOne or insertMany or bulkWrite. it will create the collection if its not there
db.towns.insertOne({  
name: "New York",  
population: 22200000,  
lastCensus: ISODate("2016-07-01"),  
famousFor: [ "the MOMA", "food", "Derek Jeter" ], mayor : {
	name : "Bill de Blasio",
	party : "D" }
})

// to list content of a collection
db.towns.find()

// mongo tounge is js
db.help()
db.towns.help()
```

- Tip: The ObjectId is always 12 bytes, composed of a timestamp, client machine ID, client process ID, and a 3-byte incremented counter. What’s great about this autonumbering scheme is that each process on every machine can handle its own ID generation without colliding with other mongod instances.
![Object-ID](ObjectId.png)

```js
// helper commands
typeof db
// object

typeof db.towns
// object

typeof db.towns.insertOne
// function

// to view source code of a function
db.towns.insertOne

// you can add js functions
function insertCity(  
name, population, lastCensus, famousFor, mayorInfo

){ db.towns.insert({

    name: name,
    population: population,
    lastCensus: ISODate(lastCensus),
    famousFor: famousFor,
    mayor : mayorInfo

}); }

// now use the function
insertCity("Punxsutawney", 6200, '2016-01-31', ["Punxsutawney Phil"], { name : "Richard Alexander" })

// a nice UI for mongo visualising data and monitor is Robo 3T
```

### read
```js
// random queries

// to find a specific value
db.towns.find({ "_id" : ObjectId("59094288afbc9350ada6b807") })

// to get only the name and id of a town
db.towns.find({ _id : ObjectId("66966600bc11f78282f3f550") }, { name : 1 })

// to get all fields except name
db.towns.find({ _id : ObjectId("59094288afbc9350ada6b807") }, { name : 0 })

// To find all towns that begin with the letter P and have a population less than 10,000, you can use a Perl-compatible regular expression (PCRE)2 and a range operator.
db.towns.find(  
{ name : /^P/, population : { $lt : 10000 } }, { _id: 0, name : 1, population : 1 })

// Tip: Conditional operators in Mongo follow the format of field : { $op : value }, where $op is an operation like $ne (not equal to) or $gt (greater than)

// you can define values and use later
var population_range = { $lt: 1000000,  
$gt: 10000
}

// how to use variables
db.towns.find(
{ name : /^P/, population : population_range },
{ name: 1 })

// you can also query date range
db.towns.find(  
{ lastCensus : { $gte : ISODate('2016-06-01') } }, { _id : 0, name: 1 })

// query array values, it checks if food exist in the array
db.towns.find(  
{ famousFor : 'food' },  
{ _id : 0, name : 1, famousFor : 1 })

// to query array with partial values
db.towns.find(  
	{ famousFor : /moma/ },  
	{ _id : 0, name : 1, famousFor : 1 }
)

// to query all matchings inside of array
db.towns.find(  
	{ famousFor : { $all : ['food', 'beer'] } }, { _id : 0, name:1, famousFor:1 }
)

// to query lack of matching values
db.towns.find(  
{ famousFor : { $nin : ['food', 'beer'] } }, { _id : 0, name : 1, famousFor : 1 }
)

// real power of mongo! dig down into a document! to query where mayor->party is 'D'
db.towns.find(  
{ 'mayor.party' : 'D' },  
{ _id : 0, name : 1, mayor : 1 }
)

// to query those who dont have a party
db.towns.find(  
{ 'mayor.party' : { $exists : false } }, { _id : 0, name : 1, mayor : 1 }
)
```
### some useful conditions
![conditions](conditions.png)

### move on to another collection
```js
// override the auto generated key!
db.countries.insert({ _id : "us",  
name : "United States", exports : {
foods : [  
{ name : "bacon", tasty : true }, { name : "burgers" }
] }
})

db.countries.insert({
_id : "ca",  
name : "Canada", exports : {
foods : [  
{ name : "bacon", tasty : false }, { name : "syrup", tasty : true }
] }
})

db.countries.insert({ _id : "mx",  
name : "Mexico", exports : {
foods : [{  
name : "salsa", tasty : true, condiment : true
}] }
})


// to get count of a collection
db.countries.countDocuments()

// find a country that not only exports bacon but exports tasty bacon. we need to use $elemMatch
// but this is wrong because it returns all matching food bacon, and exist a food tasty true !
db.countries.find(  
{ 'exports.foods.name' : 'bacon', 'exports.foods.tasty' : true }, { _id : 0, name : 1 })

// the right answer for above query is
db.countries.find({
'exports.foods' : { $elemMatch : {
name : 'bacon',
tasty : true }
} },
  { _id : 0, name : 1 }
)


// to find any country that exports a tasty food that also has a condiment label
db.countries.find(
  {
'exports.foods' : { $elemMatch : {
tasty : true,
condiment : { $exists : true } }
} },
  { _id : 0, name : 1 }
)

// so far everything we query were using AND operations, if you want to use OR
db.countries.find({
	$or : [  
			{ _id : "mx" },  
			{ name : "United States" }
		]},
	{ _id:1 }
)

```

### update
```js
// this is how to update in mongo. update(criteria, operation) but this update is deprecated so use updateOne or updateMany instead
// example
db.towns.update(  
{ _id : ObjectId("4d0ada87bb30773266f39fe5") }, { $set : { "state" : "OR" } }
);

// this returns error!!! MongoInvalidArgumentError: Update document requires atomic operators.
db.towns.update(  
{ _id : ObjectId("4d0ada87bb30773266f39fe5") }, { state : "OR" }
);


// another operator is $inc to incerement
db.towns.update( { _id: ObjectId("66966607bc11f78282f3f551") }, { $inc: { population: 1000 } } )



```

### some useful directives
![commands](commands.png)

### joins?
```js
// mongo isn't built for joins because of its distributed nature
// but you can still do it like this { $ref : "collection_name", $id : "reference_id" }

// lets update a town to reference a country
db.towns.update(  
{ _id : ObjectId("59094292afbc9350ada6b808") },  
{ $set : { country: { $ref: "countries", $id: "us" } } }
)
// result: country: DBRef('countries', 'us')

// in mongosh version 2.2.10 and mongo version 7.0.12, some commands in the book didnt work. to get values from DBRef use dbref.oid and dbref.namespace and dbref.db
var portland = db.towns.findOne(  
{ _id : ObjectId("59094292afbc9350ada6b808") }
)
portland.country.oid

// to find the refrenced country
db.countries.findOne({ _id: portland.country.oid })

// more dynamic way of retrieving the refrenced object
var portlandCountryRef = portland.country.namespace;
db[portlandCountryRef].findOne({ _id: portland.country.oid })
```
### delete
```js
// use .remove() to delete a document. its deprecated so better to use deleteOne, deleteMany, findOneAndDelete, or bulkWrite.
var badBacon = { 'exports.foods' : {
		$elemMatch : { name : 'bacon', tasty : false}
	}
}
db.countries.find(badBacon)

db.countries.deleteOne(badBacon)
db.countries.count()

```

### reading with code
```js
// book says you can pass function inside find, but its wrong and you cant!
db.towns.find(function() {  
	return this.population > 6000 && this.population < 600000;
})
// MongoInvalidArgumentError: Query filter must be a plain object or ObjectId

db.towns.find("this.population > 6000 && this.population < 600000")
// MongoInvalidArgumentError: Query filter must be a plain object or ObjectId

// but you could do this with $where
db.towns.find({ $where: "this.population > 6000 && this.population < 600000"})

// even more complex where
db.towns.find({ $where: "this.population > 6000 && this.population < 600000", famousFor: /Phil/
})

// Tip: mongo would fail on this query if there is only one document without population, so becareful using custom js functions. in general avoid them in production!
```

### dump and mount
```bash
# I didn't use a volume at first so I need to get backup of its data
# inside container you can use these commands
mongodump -u userName -p pass --out /backup # some address

# from outside of container
docker cp containerName:/backup ~/data/

# to mount ? lets say we use docker compose down then up
docker cp ~/data/ containerName:/backup

# go inside it and use mongorestore!
mongorestore -u userName -p pass /backup
```

### homework
```js
// Find 4.pymongo 

// Do
// 1
db.tmp.insertOne({"hello": "world"})
db.tmp.findOne( {"hello": "world"}, {"_id": 0})

// 2
db.towns.findOne( {"name": {$regex: /new/i }} )

// 3
db.towns.find(
	{"name": {$regex: /e/}, $or: [{"famousFor":'beer'}, {"famousFor":'food'}]} 
)

// 4
use blogger

db.articles.insertOne( {"author name": "Erf", "email": "mre.soltanloo@gmail.com", "creation date": ISODate("2024-07-18"), "text": "How to Mongo"} )

// 5
db.articles.update({'author name': 'Erf'}, {$set: {"comments": [{'text': 'best book ever!', 'author': 'mr_beast'}]}} )

// 6
// day1-h6.js
print("Running script...");  
print(db.towns.find( {'name': {$regex: /port/i}} ))  
print("End !!");

docker exec -it mongo-7db mongosh -u root -p 123 --authenticationDatabase admin book day1-h6.js
```

## Day 2

### indexes
```js
// add populatePhones function
populatePhones = function (area, start, stop) {  
    for (var i = start; i < stop; i++) {  
        var country = 1 + ((Math.random() * 8) << 0);  
        var num = (country * 1e10) + (area * 1e7) + i;  
        var fullNumber = "+" + country + " " + area + "-" + i;  
        db.phones.insert({  
            _id: num,  
            components: {  
                country: country,  
                area: area,  
                prefix: (i * 1e-4) << 0,  
                number: i  
            },  
            display: fullNumber  
        });  
        print("Inserted number " + fullNumber);  
    }  
    print("Done!");  
}

populatePhones(800, 5550000, 5650000) // This could take a minute

// mongo automatically create index on _id
db.phones.find().limit(10)

// to get all collections: db.getCollectionNames
db.getCollectionNames()

// to get all indexes of db
db.getCollectionNames().forEach(function(collection) { print("Indexes for the " + collection + " collection:"); printjson(db[collection].getIndexes()); });

// to get explain of a query add .explain("executionStats").executionStats to query
db.phones.find({display: "+1 800-5650001"}). explain("executionStats").executionStats
// executionTimeMillis: 44, totalDocsExamined: 100000

// to add index, use ensureIndex(fields, option)
db.phones.ensureIndex( { display : 1 }, { unique : true, dropDups : true } )

// if you run the query again you see docsExamined: 0!

// Tip: explain is useful in testing, but you need system profiler for production.
// to set profiler
db.setProfilingLevel(2)
// level 1 is for storing only slow queries more than 100ms
// level 2 stores every query

// you can see stored queries in db.system.profile
db.system.profile.find()

// to get first query stats
db.system.profile.find().limit(1).toArray()[0].execStats

// you can also create index on nested values
// in production, you should always build indexes in the background using the { background : 1 } option.
db.phones.ensureIndex({ "components.area": 1 }, { background : 1 })
```

### Aggregated Queries
```js
// count
db.phones.count({'components.number': { $gt : 5599999 } })

// 
db.phones.distinct('components.number', {'components.number': { $lt : 5550005 } })


// lol good old days?
load('mongoCities100000.js')
// FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory

// get avg population
db.cities.aggregate([ { $match: { 'timezone': { $eq: 'Asia/Dubai' } } }, { $group: { _id: 'averagePopulation', avgPop: { $avg: '$population' } } }] )

// get population of cities in some region, sorted
db.cities.aggregate([ { $match: { 'timezone': { $eq: 'Asia/Dubai' } } },
{ $sort: { population: -1 } }, { $project: { _id: 0, name: 1, population: 1 } } ])

// drop a collection
db.cities.drop()
```

### server side commands
```js
// In addition to evaluating JavaScript functions, there are several pre-built commands in Mongo. you need to be in admin to run most of them.
use admin

// to output all access details(running queries, locks, etc) of all collections of the server
db.runCommand('top')

// to list commands of a db for example admin or book
db.listCommands()

// you can use all previous commands like this, the thing is db.phones.find() is a wrapper for this. but its slightly different when you run it like this, it returns a cursor!
db.runCommand({ "find" : "phones" })

// book says if you want to see the wrapper write
db.phones.find 
// this didnt work for me a better version is
db.phones.find.toString()
// but its not good enough. the real codes are written in c++ so

// THIS IS DEPRECATED
// Any JavaScript function can be stored in a special collection named system.js. This is just a normal collection; you save the function by setting the name as the _id and a function object as the value
db.system.js.save({_id: 'getLast', value: function(collection) 
 { return collection.find({}).sort({'_id':1}).limit(1)[0]; } })
 
// Now you can use that function by loading it into the current namespace: 
use book
db.loadServerScripts()
getLast(db.phones).display 
// +1 800-5550010

// HERE IS HOW YOU CAN DO THE SAME
db.system.js.insertOne({ _id: "getLast", value: function(collectionName) { return db[collectionName].find({}).sort({ '_id': 1 }).limit(1).toArray()[0]; } });

// but to use it with db.loadServerScripts(), this is also deprecated
```

### map + reduce + finalize(optional)
```js
// write a function to get distinct values of a number: [1132900] => [0,1,2,3,9]
distinctDigits = function (phone) {  
    var number = phone.components.number + '',  
        seen = [],  
        result = [],  
        i = number.length;  
    while (i--) {  
        seen[+number[i]] = 1;  
    }  
    for (var i = 0; i < 10; i++) {  
        if (seen[i]) {  
            result[result.length] = i;  
        }  
    }  
    return result;  
}
db.system.js.insertOne({_id: 'distinctDigits', value: distinctDigits})

// a mapper that changes a phone into 3 component: distinctDigits, country-code, count=1
map = function () {  
    var digits = distinctDigits(this);  
    emit({  
        digits: digits,  
        country: this.components.country  
    }, {  
        count: 1  
    });  
}

// to reduce for key, values
reduce = function (key, values) {  
    var total = 0;  
    for (var i = 0; i < values.length; i++) {  
        
        total += values[i].count;  
    }  
    return {count: total};  
}

// to run mapReduce over phones and write them into phones.report
results = db.runCommand({ mapReduce: 'phones', 
						 map: map, 
						 reduce: reduce, 
						 out: 'phones.report' })

// to get result of mapReduce
db.phones.report.find()
//   [{ _id: { digits: [ 3, 5, 7 ], country: 6 }, value: { count: 17 } },
//    { _id: { digits: [ 0, 2, 3, 5 ], country: 3 }, value: { count: 12 } }, ...]

// phones.report is a materialized view that you can see in show tables;

// in order to get all values and not iterator
db.phones.mapReduce(map, reduce, {out: {"inline": 1}})
// it has a limitation on size. As of Mongo 2.0, that limit is 16 MB.

// what to do in a multi server scenario ? Reducers can have either mapped (emitted) results or other reducer results as inputs.
reduce = function (key, values) {  
    var total = 0;  
    for (var i = 0; i < values.length; i++) {  
        var data = values[i];  
        if ('total' in data) {  
            total += data.total;  
        } else {  
            total += data.count;  
        }  
    }  
    return {total: total};  
}

// to do some final changes or renaming, calculation, etc. you can implement a finalize() function, which works the same way as the finalize function under group()
```

### Find + Homework
```js
// f1: define functions and load them, use alias, ...

// Do:
// h1: Implement a finalize method to output the count as the total
 var finalize = function (key, value) { return { 'total': value.count }; }
```

```python
# h2: python!
import pymongo  
  
mongo_uri = 'mongodb://root:123@localhost:27017'  
client = pymongo.MongoClient(mongo_uri)  
  
db = client.book  
collection = db.users  
collection.insert_many([{'name': 'john', 'lastname': 'wick'}, {'name': 'jack', 'lastname': 'reacher'}])  
collection.create_index([("name", pymongo.DESCENDING)], background=True)  
users = collection.find()  
for user in users:  
    print(user)  
  
print('indexes on users', db.users.index_information())
```

## Day 3

### ReplicaSet, Cluster
```js
// after docker compose up, connect to one of the containers and run this command
rs.initiate({
     _id: 'book',
     members: [
         {_id: 1, host: 'localhost:27017'},
         {_id: 2, host: 'localhost:27017'},
         {_id: 3, host: 'localhost:27017'}
	]
})

// to verify if its okay
rs.status()

// to connect it from uri, use this mongodb://mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=book

// to check if its master, also its obvious in mongosh with primary and secondary keyword leftside of the command line.
db.isMaster()

// insert something in the master node, and then stop its container.
// check if that thing is in other nodes ! which is true

// try to insert in secondary node
db.echo.insert({ say : 'is this thing on?' })
// it returns error: MongoBulkWriteError[NotWritablePrimary]: not primary

// book says you cant neither read or write from secondary nodes. but as I can see its wrong and you can read from them. there are different modes you can set. you can always use secondary nodes for read or always use primary.
// modes: primary, primaryPreferred, secondary, secondaryPreferred, nearest

// Tip: Because it’s a CP(CAP) system, Mongo always knows the most recent value; the client needn’t decide. Mongo’s concern is strong consistency on writes, and preventing a multimaster scenario is not a bad method for achieving it.

// Tip: Use Odd number of replicas, with even numbers you should use arbiters(voter on tie)
```

### Sharding
```bash
# after running sharding docker compose to initialize config server replica set
docker exec -it <configsvr1_container_id> mongo --port 27019
rs.initiate(
  {
    _id: "configReplSet",
    configsvr: true,
    members: [
      { _id: 0, host: "configsvr1:27019" },
      { _id: 1, host: "configsvr2:27019" },
      { _id: 2, host: "configsvr3:27019" }
    ]
  }
)

# to init shard1 replica set
docker exec -it <shard1svr1_container_id> mongo --port 27018
rs.initiate(
  {
    _id: "shard1",
    members: [
      { _id: 0, host: "shard1svr1:27018" },
      { _id: 1, host: "shard1svr2:27018" },
      { _id: 2, host: "shard1svr3:27018" }
    ]
  }
)

# to init shard2 replica set
docker exec -it <shard2svr1_container_id> mongo --port 27018
rs.initiate(
  {
    _id: "shard2",
    members: [
      { _id: 0, host: "shard2svr1:27018" },
      { _id: 1, host: "shard2svr2:27018" },
      { _id: 2, host: "shard2svr3:27018" }
    ]
  }
)

# Connect to the mongos router and add the shards
docker exec -it <mongos_container_id> mongo --port 27017
sh.addShard("shard1/shard1svr1:27018,shard1svr2:27018,shard1svr3:27018")
sh.addShard("shard2/shard2svr1:27018,shard2svr2:27018,shard2svr3:27018")

# still inside mongos, use these commands
use admin
db.runCommand({ enablesharding : "test" })
db.runCommand({ shardcollection : "test.cities", key : {name : 1} })

# copy mongoCities file into mongos container then run
mongo mongoCities100000.js
```
