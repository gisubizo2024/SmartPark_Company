const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function setup() {
    // 1. Connect without a database first to create it
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    try {
        console.log('--- PSSMS Database Setup ---');
        console.log('Connected to MySQL server.');

        // 2. Read the full schema SQL file
        const sqlPath = path.join(__dirname, 'pssms_schema.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error('pssms_schema.sql not found! Please ensure it exists in the backend directory.');
        }
        
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // 3. Execute the schema (This will drop/create PSSMS database and all tables/procedures)
        console.log('Executing PSSMS schema script...');
        await connection.query(sql);
        console.log('Database, Tables, Views, and Procedures created successfully.');

        // 4. Verify tables
        await connection.query(`USE PSSMS`);
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Current tables in PSSMS:', tables.map(t => Object.values(t)[0]).join(', '));

    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error('\n❌ ERROR: Could not connect to MySQL.');
            console.error('👉 Please make sure MySQL is running (e.g., via XAMPP Control Panel) on port ' + (process.env.DB_PORT || 3306));
        } else {
            console.error('\n❌ Error during setup:', err.message);
        }
        process.exit(1);
    } finally {
        await connection.end();
        console.log('----------------------------');
    }
}

setup();
