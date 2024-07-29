async function downloadFile() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('myGridFSDB');
    const bucket = new GridFSBucket(db);

    const downloadStream = bucket.openDownloadStreamByName('myFile');
    const fileStream = fs.createWriteStream('<output_path>');

    downloadStream.pipe(fileStream)
        .on('error', (error) => {
            console.error('Error downloading file:', error);
        })
        .on('finish', () => {
            console.log('File downloaded successfully');
        });
}

downloadFile();
