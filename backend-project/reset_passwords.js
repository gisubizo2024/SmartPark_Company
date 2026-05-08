const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function resetAdminPasswords() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update 'admin'
        await connection.query(
            'UPDATE User SET PasswordHash = ? WHERE Username = ?',
            [hashedPassword, 'admin']
        );
        console.log(`✅ Password for "admin" set to "${password}"`);

        // Update 'admin1' (optional but helpful)
        await connection.query(
            'UPDATE User SET PasswordHash = ? WHERE Username = ?',
            [hashedPassword, 'admin1']
        );
        console.log(`✅ Password for "admin1" set to "${password}"`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

resetAdminPasswords();
