const db = require('./data/database');

async function startApp() {
    try {
        await db.connectToDatabase();
        // Now you can access the database using db.getDB()
        const authors = await db.getDB().collection('authors').find().toArray();
        console.log(authors);
        
        // ... the rest of your application logic
    } catch (error) {
        console.error('An error occurred while connecting to the database:', error);
    }
}

startApp();
