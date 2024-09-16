from neo4j import GraphDatabase

uri = "neo4j://localhost:7687"  # Adjust the URI to your Neo4j instance
driver = GraphDatabase.driver(uri, auth=None)


# Example query function
def execute_query(query):
    with driver.session() as session:
        result = session.run(query)
        return [record for record in result]

# query1 = """
# MATCH p=shortestPath((bacon:Person {name: 'Kevin Bacon'})-[:ACTED_IN*1..2]-(other:Person))
#  WHERE bacon <> other
#  RETURN count(p) / 113.0
# """
query2 = """
MATCH p=shortestPath((bacon:Person {name:"Kevin Bacon"})-[*]-(meg:Person {name:"Meg Ryan"}))
RETURN p
"""
nodes = execute_query(query2)
print('nodes', nodes)

# Close the driver connection when done
driver.close()
