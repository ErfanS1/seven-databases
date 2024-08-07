```bash
# to start
docker run --name couch_7db -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=pass \
-p 5984:5984 couchdb:3.3.3

# couchdb image comes with a nice GUI, to open it
http://localhost:5984/_utils/
# login with user pass

# to create DB click on Create Database
# to add Documents click on `+` sign over All Documents

# all Commiunications to couchDB is REST-based
export COUCH_ROOT_URL=http://localhost:5984
curl ${COUCH_ROOT_URL}
# welcome message and version

# to get data about music db we created earlier
curl "${COUCH_ROOT_URL}/music/"
# {"error":"unauthorized","reason":"You are not authorized to access this db."}

# need access?
curl -u admin:pass "${COUCH_ROOT_URL}/music/"
# This returns some information about how many documents are in the database, how long the server has been up, how many operations have been performed, disk size, and more.
```

### Crud Operations
```bash
# to get a result
curl "${COUCH_ROOT_URL}/music/{_id}"

# to create a document. you must specify content-type and use POST
curl -u erf:123 -i -XPOST "${COUCH_ROOT_URL}/music/" \
-H "Content-Type: application/json" \
-d '{ "name": "Wings" }'
# HTTP/1.1 201 Created
# {"ok":true,"id":"25a4387846eb1ba6c390faed6f009067","rev":"1-2fe1dd1911153eb9df8460747dfe75a0"}

# Update a document with PUT request.
curl -i -XPUT \  
"${COUCH_ROOT_URL}/music/25a4387846eb1ba6c390faed6f009067" \  
-u erf:123 \  
-H "Content-Type: application/json" \  
-d '{  
"_id": "74c7a8d2a8548c8b97da748f43000f1b",  
"_rev": "1-2fe1dd1911153eb9df8460747dfe75a0",  
"name": "Wings",  
"albums": ["Wild Life", "Band on the Run", "London Town"]  
}'
# Tip: Unlike MongoDB, in which you modify documents in place, with CouchDB you always overwrite the entire document to make any change

# Delete a document with Delete request.
curl -i -XDELETE \  
"${COUCH_ROOT_URL}/music/2ac58771c197f70461056f7c7e002eda" \
-u erf:123 \  
-H "If-Match: 2-17e4ce41cd33d6a38f04a8452d5a860b"
# {"ok":true,"id":"25a4387846eb1ba6c390faed6f009067","rev":"4-a96500f4298fba35eecf82db6716771d"}

# Tip: The DELETE operation will supply a new revision number, even though the document is gone. It’s worth noting that the document wasn’t really removed from disk, but rather a new empty document was appended, flagging the document as deleted.
```

### Day 1 Find + Homework
```bash
# FIND
# 2. Other HTTP methods 
# HEAD to see if some result exist
curl -I http://localhost:5984/music

# COPY to copy a doc to another one.
curl -X COPY http://localhost:5984/music/25a4387846eb1ba6c390faed6f009067 -H "Destination: new-doc-id"

# OPTIONS to get methods of a resource. maybe its not right!
curl -X OPTIONS http://localhost:5984/music
# {"error":"method_not_allowed","reason":"Only DELETE,GET,HEAD,POST allowed"}

# DO
# 1. put a data with some id in music table
curl -XPOST "${COUCH_ROOT_URL}/music/" \
-u erf:123 \
-H "content-type: application/json" \
-d '{"name": "day1hw1", "_id": "id123"}'

# 2. create db and delete it via curl
# to create
curl -X PUT "${COUCH_ROOT_URL}/cities" -u erf:123

# to delete
curl -X DELETE "${COUCH_ROOT_URL}/cities" -u erf:123

# 3. attach a file to document
# attach a file to a doc
curl -XPUT \                         "${COUCH_ROOT_URL}/music/25a4387846eb1ba6c390faed6f011d07/attachment.txt?rev=1-47d10b3bc44d7b320c827cacc92d9004" \  
-u erf:123 \  
--data-binary @attachment.txt \  
-H "content-type: text/plain"

# retrieve the file, using filename in url
curl "${COUCH_ROOT_URL}/music/25a4387846eb1ba6c390faed6f011d07/attachment.txt" -u erf:123
```

### Day 2
```bash
# to get all docs
curl "${COUCH_ROOT_URL}/music/_all_docs" -u erf:123
# it will output a json which includes an array of rows, consist of id, key, value. which in this query id and key match and value is {rev}

# but in general, 
# • id is the document’s _id.
# • key is the JSON key produced by the mapreduce functions. 
# • value is the associated JSON value, also produced through mapreduce.

# to see the docs as well
curl "${COUCH_ROOT_URL}/music/_all_docs?include_docs=true" -u erf:123

# to create a view
# click on + sign of Design Documents, then click on New View
# for every view there is a function that emits key value simillar to Mongo map, that map docs to key values
# this function is simillar to _all_docs function
function(doc) {
  emit(doc._id, { rev: doc._rev });
}

# function for artists to query by name, DesignDoc=artists, view_name=by_name
function(doc) {
  if ('name' in doc) {
    emit(doc.name, doc._id);
  }
}

# function for albums, its not one to one like the ones above. DesignDoc=albums, view_name=by_name
function(doc) {
  if ('name' in doc && 'albums' in doc) {
    doc.albums.forEach(function(album){
      var
        key = album.title || album.name,
        value = { by: doc.name, album: album };
      emit(key, value);
    });
  }
}
curl "${COUCH_ROOT_URL}/music/_design/albums/_view/by_name" -u erf:123
# result is something like this except it had more rows.
{  
  "total_rows": 1,  
  "offset": 0,  
  "rows": [{  
      "id": "25a4387846eb1ba6c390faed6f0005e4",  
      "key": "Abbey Road",  
      "value": {  
        "by": "The Beatles",  
        "album": {  
          "title": "Abbey Road",  
          "year": 1969  
        }  
      }  
    }]  
}

# to query a view path is like {db_name}/_design/{design_doc}/_view/{view_name}

# Tip: CouchDB will ensure that the records are presented in alphanumerical order by the emitted keys. In effect, this is the indexing that CouchDB offers. When designing your views, it’s important to pick emitted keys that will make sense when ordered

# what if you want to query a subset not the whole view?
# in my terminal zsh I had to skip characters of `!` and `"`
curl "${COUCH_ROOT_URL}/music/_design/albums/_view/by_name?key=\"Help\!\"" -u erf:123
# "total_rows": 6,  "offset": 2, total rows is for the whole view, offset is where was the first returned value
```
