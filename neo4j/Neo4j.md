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