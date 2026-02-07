const db = require('./db');

async function testConnection() {
    try {
        console.log('Testing connection...');
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('Connection successful:', rows[0].solution);

        console.log('Testing Users table access...');
        const [users] = await db.query('SELECT * FROM Users LIMIT 1');
        console.log('Users table accessible. Found users:', users.length);

    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        process.exit();
    }
}

testConnection();
