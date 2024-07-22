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
