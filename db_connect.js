// require('dotenv').config();
// const mysql = require('mysql2');

// const con = mysql.createPool({
//     host: process.env.MYSQL_HOST, 
//     user: process.env.MYSQL_USERNAME, 
//     password: process.env.MYSQL_PSWD, 
//     database: process.env.MYSQL_DB
// });

// const query = (sql, binding) => {
//     return new Promise((resolve, reject) => {
//         con.query(sql, binding, (err, result, fields) => {
//             if (err) reject(err);
//             resolve(reject);
//         });
//     });
// };

// const createQuery = "CREATE DATABASE IF NOT EXISTS all_songs;";
// con.query(createQuery);

// module.exports = { con, query }; 
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