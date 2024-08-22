# simple retrieve query by elementId
curl -X POST http://localhost:7474/db/neo4j/tx/commit \
-H "Content-Type: application/json" \
-d '{ "statements": [ { "statement": "MATCH (a:Author) WHERE elementId(a)=\"4:e66b4524-0f12-4d86-97bd-cdd415ec2bfe:182\" RETURN a"} ] }'

# find shortest path
curl -X POST http://localhost:7474/db/neo4j/tx/commit \
-H "Content-Type: application/json" \
-d '{ "statements": [ { "statement": "MATCH (p:Person {name: \"Kofi\"}), (g:GrapeType {name: \"Riesling\"}), s = shortestPath((p)-[*]-(g)) RETURN s"} ] }'

#, "parameters": { "personName": "Kofi", "grapeName": "Riesling"

# find shortestPath below some range
curl -X POST http://localhost:7474/db/neo4j/tx/commit \
-H "Content-Type: application/json" \
-d '{ "statements": [ { "statement": "MATCH (p:Person {name: \"Kofi\"}), (g:GrapeType {name: \"Riesling\"}), s = shortestPath((p)-[*..5]-(g)) RETURN s" } ] }'
