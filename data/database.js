const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;

let database;

async function connect() {
    if (!database) {
        const client = await MongoClient.connect('mongodb://127.0.0.1:27017');
        database = client.db('blog');
    }
}

function getDB() {
    if (!database) {
        throw { message: 'Database is not established!!' };
    }
    return database;
}

module.exports = {
    connectToDatabase: connect,
    getDB: getDB,
};
