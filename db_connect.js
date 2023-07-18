const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB immediately when the module is imported
(async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
})();

module.exports = { client, dbName };