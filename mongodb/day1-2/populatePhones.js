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