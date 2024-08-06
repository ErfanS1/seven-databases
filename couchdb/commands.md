```bash
# update document
curl -i -XPUT \
"${COUCH_ROOT_URL}/music/25a4387846eb1ba6c390faed6f009067" \
-u erf:123 \
-H "Content-Type: application/json" \
-d '{
"_rev": "1-2fe1dd1911153eb9df8460747dfe75a0",
"name": "Wings",
"albums": ["Wild Life", "Band on the Run", "London Town", "ERF"]
}'
# result {"ok":true,"id":"25a4387846eb1ba6c390faed6f009067","rev":"3-d2c8479d00895a89e763c4cca94b6dd6"}

# delete doc
curl -i -XDELETE \
  "${COUCH_ROOT_URL}/music/25a4387846eb1ba6c390faed6f009067" \
  -u erf:123 \
  -H "If-Match: 3-d2c8479d00895a89e763c4cca94b6dd6"
  
# copy
curl -X COPY http://localhost:5984/music/25a4387846eb1ba6c390faed6f0005e4 -H "Destination: new-doc-id" -u erf:123

# day1Hw1
curl -XPOST "${COUCH_ROOT_URL}/music/" \
 -u erf:123 \
 -H "content-type: application/json" \
 -d '{"name": "day1hw1", "_id": "id123"}'
 

# day1Hw3
curl -i -XPUT \                         
"${COUCH_ROOT_URL}/music/25a4387846eb1ba6c390faed6f011d07/attachment.txt?rev=1-47d10b3bc44d7b320c827cacc92d9004" \
-u erf:123 \
--data-binary @attachment.txt \
-H "content-type: text/plain"

curl "${COUCH_ROOT_URL}/music/25a4387846eb1ba6c390faed6f011d07/attachment.txt" -u erf:123
```
