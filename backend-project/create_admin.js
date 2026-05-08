const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        const username = 'admin1';
        const password = 'admin1123';
        const role = 'Admin';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await connection.query(
            'INSERT INTO User (Username, PasswordHash, Role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE PasswordHash = VALUES(PasswordHash), Role = VALUES(Role)',
            [username, hashedPassword, role]
        );

        console.log(`✅ Success: User "${username}" created/updated as ${role}.`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

createAdmin();
