require('dotenv').config();
const mysql = require('mysql2');

const con = mysql.createPool({
    host: process.env.MYSQL_HOST, 
    user: process.env.MYSQL_USERNAME, 
    password: process.env.MYSQL_PSWD, 
    database: process.env.MYSQL_DB
});

const query = (sql, binding) => {
    return new Promise((resolve, reject) => {
        con.query(sql, binding, (err, result, fields) => {
            if (err) reject(err);
            resolve(reject);
        });
    });
};

const createQuery = "CREATE DATABASE IF NOT EXISTS all_songs;";
con.query(createQuery);

module.exports = { con, query }; 