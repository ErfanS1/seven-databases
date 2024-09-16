### Day 1

```bash
docker run --publish=7474:7474 --publish=7687:7687 --env NEO4J_AUTH=none neo4j:5.22.0

# access its dashboard
http://localhost:7474/browser/

# to create a new node, enter this in the console
CREATE (w:Wine {name:"Prancing Wolf", style: "ice wine", vintage: 2015})
# Added 1 label, created 1 node, set 3 properties, completed after 41 ms.

# to get all nodes
match(n) return(n);
{
  "identity": 0,
  "labels": [
    "Wine"
  ],
  "properties": {
    "vintage": 2015,
    "name": "Prancing Wolf",
    "style": "ice wine"
  },
  "elementId": "4:f3c57030-5d7b-44e5-8a71-07f9f3e4112f:0"
}

# add a publication node
CREATE (p:Publication {name: "Wine Expert Monthly"})

# now create a relationship between these 2 from p to w
MATCH (p:Publication {name: "Wine Expert Monthly"}), (w:Wine {name: "Prancing Wolf", vintage: 2015}) CREATE (p)-[r:reported_on]->(w)
# Created 1 relationship, completed after 63 ms.

# how to get relations of r
MATCH ()-[r]-() WHERE id(r) = 0 RETURN r

# you can store data on relations as well, how to update a relation?
MATCH ()-[r]-() WHERE id(r) = 0 SET r.rating = 97 RETURN r

# how to create a relation with data stored on it?
MATCH (p:Publication {name: "Wine Expert Monthly"}), (w:Wine {name: "Prancing Wolf"}) CREATE (p)-[r:reported_on {rating: 97}]->(w)

# add a new node
CREATE (g:GrapeType {name: "Riesling"})

# connect w to this new node
MATCH (w:Wine {name: "Prancing Wolf"}),(g:GrapeType {name: "Riesling"}) CREATE (w)-[r:grape_type]->(g)

```

### delete a node/graph
```bash
# HOW TO DELETE NODES?
# Tip: you can’t delete a node that still has relationships associated with it.
CREATE (e: EphemeralNode {name: "short lived"})

MATCH (w:Wine {name: "Prancing Wolf"}), (e:EphemeralNode {name: "short lived"}) CREATE (w)-[r:short_lived_relationship]->(e)

MATCH ()-[r:short_lived_relationship]-() DELETE r

MATCH (e:EphemeralNode) DELETE e

# how to delete the whole graph
MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r
```
### build the graph again
```bash
CREATE (wr:Winery {name: "Prancing Wolf Winery"})

MATCH (w:Wine {name: "Prancing Wolf"}), (wr:Winery {name: "Prancing Wolf Winery"}) CREATE (wr)-[r:produced]->(w)

CREATE (w:Wine {name:"Prancing Wolf", style: "Kabinett", vintage: 2002})
CREATE (w:Wine {name: "Prancing Wolf", style: "Spätlese", vintage: 2010})
MATCH (wr:Winery {name: "Prancing Wolf"}),(w:Wine {name: "Prancing Wolf"}) CREATE (wr)-[r:produced]->(w)

MATCH (w:Wine),(g:GrapeType {name: "Riesling"}) CREATE (w)-[r:grape_type]->(g)
```

### how to get all relations of a node?
```bash
# return all relations from Alice to other nodes using --> operator
MATCH (p:Person {name: "Alice"})-->(n) RETURN n;

# return all relations to alice
MATCH (n) --> (p:Person {name: "Alice"}) RETURN n;

# how to get names of Person nodes Patty has relation to
MATCH (p:Person {name: "Patty"})-->(other: Person) RETURN other.name;
# |other.name|
# |---|
# |1|"Alice"|
# |2|"Tom"|

# query all Persons except Patty, notice <> instead of !=
MATCH (p:Person)
WHERE p.name <> 'Patty'
RETURN p;

# how to get friends of friends of Patty?
MATCH
(fof:Person)-[:friends]-(f:Person)-[:friends]-(p:Person {name: "Patty"})
RETURN fof.name;
# |fof.name|
# |---|
# |1|"Ahmed"|
# |2|"Kofi"|
```

### Indexes, Constraints, and "Schemas" in Cypher
```bash
# Neo4j doesn’t enable you to enforce hard schemas the way that relational databases do, but it does enable you to provide some structure to nodes in your graphs by creating indexes and constraints for specified labels.

# You can create an index on that type/property combination like this:
CREATE INDEX ON :Wine(name);

# remove index
DROP INDEX ON :Wine(name);

# query like before
MATCH (w:Wine {name: 'Some Name'}) RETURN w;

# While indexes can help speed up queries, constraints can help you sanitize your data inputs by preventing writes that don’t satisfy criteria that you specify. If you wanted to ensure that every Wine node in your graph had a unique name, for example, you could create this constraint:
CREATE CONSTRAINT FOR (w:Wine) REQUIRE w.name IS UNIQUE;
# above query syntax works but the one in book is deprecated. also this query is not working because multiple wines with name Prancing Wolf

# so we its better to use multiple collumn constraint
CREATE CONSTRAINT FOR (w:Wine) REQUIRE (w.name, w.style, w.vintage) IS UNIQUE;

# to drop a constraint
DROP CONSTRAINT ON (w:Wine) ASSERT w.name IS UNIQUE;

# Tip for constraints: you cannot apply a constraint to a label that already has an index, and if you do create a constraint on a specific label/property pair, an index will be created automatically. So usually you’ll only need to explicitly create a constraint or an index.

# to see all constraints, (schema ls -l :Wine) this query in book is not working anymroe. so use below queries.
SHOW CONSTRAINTS;
SHOW CONSTRAINTS YIELD name, type, entityType, labelsOrTypes, properties;

# This will specifically show the constraints that are associated with the `:Wine` label.
SHOW CONSTRAINTS YIELD name, type, entityType, labelsOrTypes, properties WHERE labelsOrTypes = ['Wine'];
```

### Find + Homework Day 1
```cypher
// Find 1. t https://neo4j.com/docs
()                  //anonymous node (no label or variable) can refer to any node in the database
(p:Person)          //using variable p and label Person
(:Technology)       //no variable, label Technology
(work:Company)      //using variable work and label Company

//data stored with this direction
CREATE (p:Person)-[:LIKES]->(t:Technology)

//query relationship backwards will not return results
MATCH (p:Person)<-[:LIKES]-(t:Technology)

//better to query with undirected relationship unless sure of direction
MATCH (p:Person)-[:LIKES]-(t:Technology)

// Find 2. type :play and go to movie play ground
MATCH (people:Person) RETURN people.name LIMIT 10
MATCH (nineties:Movie) WHERE nineties.released >= 1990 AND nineties.released < 2000 RETURN nineties.title

// Do. 1 create some nodes and relationships! easy
```

### Day 2

### REST interface
```bash
curl http://localhost:7474/
{"bolt_routing":"neo4j://localhost:7687","transaction":"http://localhost:7474/db/{databaseName}/tx","bolt_direct":"bolt://localhost:7687","neo4j_version":"5.22.0","neo4j_edition":"community"}

# create a node, API in book for creating node is deprecated
curl -i -X POST http://localhost:7474/db/neo4j/tx/commit \
-H "Content-Type: application/json" \
-d '{ "statements" : [ { "statement" : "CREATE (n:Author {name: $name, genre: $genre}) RETURN n", "parameters" : { "name": "P.G. Wodehouse", "genre": "British Humour" } } ] }'
# {"results":[{"columns":["n"],"data":[{"row":[{"genre":"British Humour","name":"P.G. Wodehouse"}],"meta":[{"id":182,"elementId":"4:e66b4524-0f12-4d86-97bd-cdd415ec2bfe:182","type":"node","deleted":false}]}]}],"errors":[],"lastBookmarks":["FB:kcwQ5mtFJA8STYaXvc3UFewr/keQ"]}


# how to get it
match(n:Author) return n
curl -X POST http://localhost:7474/db/neo4j/tx/commit \
-H "content-type: application/json" \
-d '{
	"statements": [{"statement": "match(n:Author) return n"}]
}'
# {"results":[{"columns":["n"],"data":[{"row":[{"genre":"British Humour","name":"P.G. Wodehouse"}],"meta":[{"id":182,"elementId":"4:e66b4524-0f12-4d86-97bd-cdd415ec2bfe:182","type":"node","deleted":false}]}]}],"errors":[],"lastBookmarks":["FB:kcwQ5mtFJA8STYaXvc3UFewr/keQ"]}

# this is the url in new versions of neo4j for cypher HTTP API http://localhost:7474/db/neo4j/tx/commit

# how to get only properties of nodes? use this inside query
return properties(n)

# Create NODE
curl -X POST http://localhost:7474/db/neo4j/tx/commit \ -H "Content-Type: application/json" \ -d '{ "statements": [ { "statement": "CREATE (a:Author {name: $name}), (b:Book {title: $title}) RETURN a, b", "parameters": { "name": "P.G. Wodehouse", "title": "Jeeves and Wooster" } } ] }'

# Create a Relationship
curl -X POST http://localhost:7474/db/neo4j/tx/commit \ -H "Content-Type: application/json" \ -d '{ "statements": [ { "statement": "MATCH (a:Author {name: $name}), (b:Book {title: $title}) CREATE (a)-[:WROTE]->(b) RETURN a, b", "parameters": { "name": "P.G. Wodehouse", "title": "Jeeves and Wooster" } } ] }'

# using id in query returns result + a warning about it being deprecated, so it says use elementId instead
curl -X POST http://localhost:7474/db/neo4j/tx/commit \  
-H "Content-Type: application/json" \  
-d '{ "statements": [ { "statement": "MATCH (a:Author) WHERE elementId(a)=\"4:e66b4524-0f12-4d86-97bd-cdd415ec2bfe:182\" RETURN a"} ] }'


# how to find shortest path between two nodes?
curl -X POST http://localhost:7474/db/neo4j/tx/commit \ 
-H "Content-Type: application/json" \ 
-d '{ "statements": [ { "statement": " MATCH (a:Author {name: $authorName}), (b:Book {title: $bookTitle}), p = shortestPath((a)-[*]-(b)) RETURN p", "parameters": { "authorName": "Author A", "bookTitle": "Book B" } } ] }'

# The other path algorithm choices are allPaths, allSimplePaths, and dijkstra. You can find information on these algorithms in the online documentation. https://neo4j.com/blog/graph-search-algorithm-basics/
```

### Index
```bash
curl -X POST http://localhost:7474/db/neo4j/tx/commit \
-H "Content-Type: application/json" \
-d '{ "statements": [ { "statement": "CREATE INDEX FOR (a:Author) ON (a.name)" } ] }'

## list indexes
show index
```

### Example of Movie Recommendation

since book example data was not working and it was too old, I used another example
[Recommendation-Data](https://github.com/neo4j-graph-examples/recommendations)
```cypher
MATCH (m:Movie {title:"Crimson Tide"})<-[:RATED]-(u:User)-[:RATED]->(rec:Movie) RETURN distinct rec.title AS recommendation LIMIT 20
```
### Movie example
```cypher
// type :play and then select movies data.
// 1. insert all data

// create a unique constraint on movie title
CREATE CONSTRAINT FOR (n:Movie) REQUIRE (n.title) IS UNIQUE

// create constraint for person names
CREATE CONSTRAINT FOR (n:Person) REQUIRE (n.name) IS UNIQUE

// create index for release time of a movie which here is a year.
CREATE INDEX FOR (m:Movie) ON (m.released)

// return a person named Tom Hanks
MATCH (tom:Person {name: "Tom Hanks"}) RETURN tom

// return a movie with title Cloud Atlas
MATCH (cloudAtlas:Movie {title: "Cloud Atlas"}) RETURN cloudAtlas

// return people with limit
MATCH (people:Person) RETURN people.name LIMIT 10

// return some movies with condition
MATCH (nineties:Movie) WHERE nineties.released >= 1990 AND nineties.released < 2000 RETURN nineties.title

// Use the type of the relationship to find patterns within the graph, for example, `ACTED_IN` or `DIRECTED`.
// return movies that tom hanks Acted_in them
MATCH (tom:Person {name: "Tom Hanks"})-[:ACTED_IN]->(tomHanksMovies) RETURN tom,tomHanksMovies

// return tom hanks movies count
MATCH (a:Person {name: "Tom Hanks"})-[:ACTED_IN]-(m:Movie) RETURN count(m);

// return directors of Cloud Atlas
MATCH (cloudAtlas:Movie {title: "Cloud Atlas"})<-[:DIRECTED]-(directors) RETURN directors.name

// return tom hanks co-actors
MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors) RETURN DISTINCT coActors.name
// same query if you want to nicely visualise it in graph
MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors) RETURN DISTINCT coActors, m, tom

// return people who has a relation with Cloud Atlas. name, type of relation and roles they played.
MATCH (people:Person)-[relatedTo]-(:Movie {title: "Cloud Atlas"}) RETURN people.name, Type(relatedTo), relatedTo.roles
// same query for graph
MATCH (people:Person)-[relatedTo]-(m:Movie {title: "Cloud Atlas"}) RETURN people, relatedTo, m

// find number of actors who plyed in movies together with Kevin Bacon
MATCH (kevin:Person {name: "Kevin Bacon"})-[:ACTED_IN]->(Movie)<-[:ACTED_IN]-(other:Person) RETURN count(DISTINCT other); // 19
			
																				// same query as above 
MATCH (:Person {name: "Kevin Bacon"})-[:ACTED_IN*1..2]-(other:Person) RETURN count(DISTINCT other); // 19

// Use variable length patterns to find movies and actors up to 4 "hops" away from Kevin Bacon.
MATCH (bacon:Person {name:"Kevin Bacon"})-[*1..4]-(hollywood) RETURN DISTINCT hollywood
// to visualise it use less length and add bacon to answer

// Use the built-in `shortestPath()` algorithm to find the "Bacon Path" to Meg Ryan. if you want to get length of the path you can use return length(p)
MATCH p=shortestPath(
(bacon:Person {name:"Kevin Bacon"})-[*]-(meg:Person {name:"Meg Ryan"}))
RETURN p

// Extend Tom Hanks co-actors to find co-co-actors who have nоt worked with Tom Hanks. to recommend actors to play with tom hanks.
MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors), (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cocoActors)
WHERE NOT (tom)-[:ACTED_IN]->()<-[:ACTED_IN]-(cocoActors) AND tom <> cocoActors
RETURN cocoActors.name AS Recommended, count(*) AS Strength ORDER BY Strength DESC

// Find people where have a movie with tom hanks and a movie with tom cruise
// in other word someone who can introduce Tom Hanks to his potential co-actor, in this case Tom Cruise.
MATCH (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors), (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cruise:Person {name:"Tom Cruise"})
RETURN tom, m, coActors, m2, cruise

// return actors whom plyed more than 3 movies
MATCH (a:Person)-[:ACTED_IN]->(m:Movie) WITH a, count(m) AS movie_count
WHERE movie_count > 3
RETURN a.name, movie_count ORDER BY movie_count DESC

// to get ratio of actors in one degree of Bacon, 113.0 this .0 is because we want a float number returned.
MATCH p=shortestPath(
(bacon:Person {name: "Kevin Bacon"})-[:ACTED_IN*1..2]-(other:Person))
WHERE bacon <> other
RETURN count(p) / 113.0; // 0.168 if we change it to 1..4 it becomes 0.637

// to find out all the actors with relation to Bacon, remove the 1..x part
MATCH p=shortestPath(
(bacon:Person {name: "Kevin Bacon"})-[:ACTED_IN*]-(other:Person))
WHERE bacon <> other
RETURN count(p) / 113.0;

// delete movie dataset
MATCH (n) DETACH DELETE n											   
```

## Day 3: Distributed High Availability

Neo4j is an Atomic, Consistent, Isolated, Durable (ACID) transaction database, similar to PostgreSQL.
If you’re using Cypher from a non-shell client, all queries are automatically treated as transactions and thus completely succeed or completely fail. Explicit transaction logic is necessary only in the shell.

#### High Availability
A write to one slave is not immediately synchronized with all other slaves, so there is a danger of losing consistency (in the CAP sense) for a brief moment (making it eventually con- sistent).
HA will lose pure ACID-compliant transactions. It’s for this reason that Neo4j HA is touted as a solution largely for increasing capacity for reads.

Just like Mongo, the servers in the cluster will elect a master that holds primary responsibility for managing data distribution in the cluster. Unlike in Mongo, however, slaves in Neo4j accept writes. Slave writes will synchronize with the master node, which will then propagate those changes to the other slaves.

##### Master Election
In HA Neo4j clusters, master election happens automatically. If the master ser- ver goes offline, other servers will notice and elect a leader from among them- selves. Starting the previous master server again will add it back to the cluster, but now the old master will remain a slave (until another server goes down).

```bash
### Backups
neo4j-1.local/bin/neo4j-admin backup \
  --from 127.0.0.1:6366 \
  --name neo4j-`date +%Y.%m.%d`.db \
  --backup-dir /mnt/backups

```

#### Neo4j on CAP
The term “high availability cluster" should be enough to give away Neo4j’s strategy. Neo4j HA is available and partition tolerant (AP). Each slave will return only what it currently has, which may be out of sync with the master node temporarily. Although you can reduce the update latency by increasing a slave’s pull interval, it’s still technically eventually consistent. This is why Neo4j HA is recommended for read-mostly requirements.