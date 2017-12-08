# CS129.1-Project

This repository contains the files used for the CS 129.1 Project of Mikee Jazmines, Cher Panlilio, and Leina Santiago for the School Year 2017-2018.

This README will contain two methods on how to achieve the results.
* The first method uses docker. It will replicate, import, map reduce, then shard in the end.
* The second methos uses mongodb. It can do everything that docker does, however, we were unable to make the sharding work for this method.

## Big Data Problem

Given tweets regarding pineapple on pizza, how many users believe that pineapple should or should not belong on pizza?

## Dataset

### How to retrieve the data set

Initially, the group wanted to use the API of twitter to retrieve the data set, however, twitter’s API allows the user to scrape tweets within 7 days only.
To acquire a better data set, we used a twitterscraper found on github by taspinar. It can be found here: https://github.com/taspinar/twitterscraper .
Instructions can be found there as to how to use install and use the twitterscraper.

### Description of the Data Set

The following phrases were used as a datasource:

1. Positive:
	```
	a) “I like pineapples on pizza”
	```
2. Negative:
	```
	a) “I don’t like pineapples on pizza”
	b) “I do not like pineapples on pizza”
	```

Tweets will be scraped and the following data will be taken from each tweet:
1. Username and Full Name
2. Tweet-id
3. Tweet text
4. Tweet timestamp
5. No. of likes
6. No. of replies
7. No. of retweets

Note: Each like and each retweet of a tweet may also be recorded to see how many people agree with the tweet

## Docker Method
The complete code can be found in the dockerMethod.txt file.

### Start mongo and create a network
```
docker pull mongo
docker network create pizza
```

### Create the replicate sets
```
docker run --name mongo1 -d --network pizza --hostname mongo1 mongo --replSet pizza --shardsvr --port 27017
docker run --name mongo2 -d --network pizza --hostname mongo2 mongo --replSet pizza --shardsvr --port 27017
docker run --name mongo3 -d --network pizza --hostname mongo3 mongo --replSet pizza --shardsvr --port 27017
```

### Set up the configuration for the mongo container
```
docker exec -it mongo1 mongo
var cfg = {
		"_id" : "pizza",
		"version" : 1,
		"members" : [
			{
				"_id" : 0,
				"host" : "mongo1:27017",
				"priority" : 1
			},
			{
				"_id" : 1,
				"host" : "mongo2:27017",
				"priority" : 0
			},
			{
				"_id" : 2,
				"host" : "mongo3:27017",
				"priority" : 0
			}
		]
}
rs.initiate(cfg)
rs.status()
```
The container should become the primary container after.

### Import the files into the db
```
docker cp like2016.json mongo1:/
docker cp like2017.json mongo1:/
docker cp dislike2016.json mongo1:/
docker cp dislike2017.json mongo1:/
docker cp 2016donot.json mongo1:/
docker cp donot2017.json mongo1:/
docker exec -it mongo1 bash
mongoimport --db pizza --collection like --type json --file like2016.json --jsonArray
mongoimport --db pizza --collection like --type json --file like2017.json --jsonArray
mongoimport --db pizza --collection dislike --type json --file dislike2016.json --jsonArray
mongoimport --db pizza --collection dislike --type json --file dislike2017.json --jsonArray
mongoimport --db pizza --collection dislike --type json --file 2016donot.json --jsonArray
mongoimport --db pizza --collection dislike --type json --file donot2017.json --jsonArray
```

### Remove the dislikes from the like database
```
mongo
use pizza
db.like.remove({text:{$in: [/do not like/,/don’t like/, /if you like/,/if you do not like/, /if you don’t like/, /does not belong on pizza/]}},{_id:0, user:1, text:1})
```

### Test the replication
You can test if it replicated successfully by using these codes. Ensure that you are using the mongo2 container, so exit from the mongo1 container first.
```
exit
exit
docker exec -it mongo2 mongo
rs.slaveOk()
use pizza
db.like.find()
```

### Map Reduce

To do the map reduce, copy paste the code found in the mapreduce.js file.

### Sharding
Create a config server
```
docker run --name config1 -d --network pizza --hostname config1 mongo --configsvr --port 27017 --replSet configset
```

Configure the server
```
docker exec -it config1 mongo
var cfg = {
		"_id" : "configset",
		"version" : 1,
		"members" : [
		{
			"_id" : 0,
			"host" : "config1:27017",
			"priority" : 1
		}
		]
}
rs.initiate(cfg)
```

Check the status to see if there is no errors
```
rs.status()
```

### Create a shard and a mongos instance
```
docker run --name shard1 -d --network pizza --hostname shard1 mongo --shardsvr --port 27017
docker run --name mongos -d --network pizza --hostname mongos --entrypoint /usr/bin/mongos mongo --configdb "configset/config1:27017"
```

### Create a shard and an index
```
docker exec -it mongos mongo
sh.addShard("shard1:27017")
db.settings.save( { _id:"chunksize", value: 1 } )
sh.enableSharding("pizza")
use pizza
db.like.createIndex({_id: 1})
sh.shardCollection("pizza.like",{_id: 1})
// Check the status
sh.status()
db.like.find().count()
exit
```

### Check if the sharding was successful
```
docker exec -it shard1 mongo
use pizza
db.like.find().count()
exit
docker exec -it mongo1 mongo
use pizza
db.like.find().count()
exit
```

## MongoDB Method
The complete code can be found in the MongoDBMethod.txt file.

### Create a folder for sharding, as well as subfolders for the config server and shard nodes

```
mkdir sharding
cd sharding
mkdir config1 config2 node2 node1
```

### Create a Config Server Replica set

Start each member of the Config Server Replica Set, run each line on a different terminal

```
mongod --configsvr --replSet config --dbpath config1 --bind_ip localhost --port 27013
mongod --configsvr --replSet config --dbpath config2 --bind_ip localhost --port 27014
```

### Connect a mongo shell to one of the config servers on a different terminal
```
mongo --host localhost --port 27014
```

### Initiate the Replica Set in the mongo shell
```
rs.initiate(
  {
    _id : "config",
    members: [
      { _id : 1, host : "127.0.0.1:27013" }
    ]
  }
  )
```

### Add a Secondary in the mongo shell
```
rs.add("127.0.0.1:27013")
```

### Importing data
```
mongoimport --db pizza --collection like --type json --file /data/seeds/like2016.json --jsonArray
mongoimport --db pizza --collection like --type json --file /data/seeds/like2017.json --jsonArray
mongoimport --db pizza --collection dislike --type json --file /data/seeds/dislike2016.json --jsonArray
mongoimport --db pizza --collection dislike --type json --file /data/seeds/dislike2017.json --jsonArray
mongoimport --db pizza --collection dislike --type json --file /data/seeds/donot2017.json --jsonArray
mongoimport --db pizza --collection dislike --type json --file /data/seeds/2016donot.json --jsonArray
```

### Create the Shard Replica Sets

Start each member of the Shard Replica Set, run each line on a different terminal
```
mongod --shardsvr --replSet shard1 --dbpath node1 --bind_ip localhost --port 27015
mongod --shardsvr --replSet shard2 --dbpath node2 --bind_ip localhost --port 27016
```

Connect a mongo shell to a member of the shard replica set on a different terminal
```
mongo --host localhost --port 27016
```

Initiate the shard replica set in the mongo shell
```
rs.initiate(
  {
    _id : 'shard',
    members: [
      { _id : 1, host : "localhost:27016" }
    ]
  }
  )
```

Add a Secondary in the mongo shell
```  
rs.add("localhost:27015")
```

Connect a mongos to the sharded cluster on a different terminal
```
mongos --configdb config/127.0.0.1:27013,127.0.0.1:27014 --bind_ip localhost --port 27010
```

Connect a mongo shell to the mongos on a different terminal
```
mongo --host localhost --port 27010
```

On the mongo shell, add shards to the cluster
```
sh.addShard( "shard/localhost:27015")
sh.addShard( "shard/localhost:27016")
```

Enable sharding for the database -- pizza
```
sh.enableSharding("pizza")
```

log in to the database
```
use pineapplepizza
```
Create a collection -- pineapplepizza
```
db.createCollection('pineapplepizza')
```
Create an Index for the collection
```
db.pineapplepizza.createIndex({id:1}, {unique: true})
```
Shard the collection
```
sh.shardCollection("pizza.pineapplepizza", { _id : "hashed" } )
```

NOTE: This was done using Mongodb 3.4, where having replicates of the sharded nodes was necessary. Therefore, the sharding is not functioning. 

## To clean docker
```
docker stop shard1 config1 mongo1 mongo2 mongo3 mongos
docker rm shard1 config1 mongo1 mongo2 mongo3 mongos
```

To clean everything in docker itself
```
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
```
