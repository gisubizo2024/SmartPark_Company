const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    try {
        console.log('Connected to MySQL server.');
        const sqlPath = path.join(__dirname, 'pssms_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing schema script...');
        await connection.query(sql);
        console.log('Database and tables created successfully.');

    } catch (err) {
        console.error('Error setting up database:', err.message);
    } finally {
        await connection.end();
    }
}

setupDatabase();
