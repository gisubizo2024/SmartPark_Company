const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

dotenv.config();

console.log('DB Config - Host:', process.env.DB_HOST, 'Port:', process.env.DB_PORT);

const pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST,
    user: process.env.DB_USER || process.env.MYSQL_ADDON_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB,
    port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
