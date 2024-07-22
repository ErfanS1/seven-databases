print("Running script...");
print(db.towns.find( {'name': {$regex: /port/i}} ))
print("End !!");