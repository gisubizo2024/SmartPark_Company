const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function debug() {
    console.log('--- DB CONNECTION DEBUG ---');
    console.log('Host:', '127.0.0.1');
    console.log('User:', process.env.DB_USER);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);

    try {
        console.log('Attempting to connect to MySQL server...');
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306
        });
        console.log('✅ SUCCESS: Connected to MySQL server.');

        const [databases] = await connection.query('SHOW DATABASES');
        const dbList = databases.map(d => d.Database);
        console.log('Available databases:', dbList.join(', '));

        if (dbList.includes(process.env.DB_NAME)) {
            console.log(`✅ SUCCESS: Database "${process.env.DB_NAME}" exists.`);
            await connection.query(`USE ${process.env.DB_NAME}`);
            const [tables] = await connection.query('SHOW TABLES');
            console.log(`Tables in ${process.env.DB_NAME}:`, tables.map(t => Object.values(t)[0]).join(', '));
        } else {
            console.log(`❌ ERROR: Database "${process.env.DB_NAME}" NOT FOUND.`);
            console.log(`👉 Run "node setup_database.js" to create it.`);
        }

        await connection.end();
    } catch (err) {
        console.error('❌ CONNECTION FAILED:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log('👉 MySQL is not running. Please start it in XAMPP.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('👉 Password or User is incorrect.');
        }
    }
}

debug();
