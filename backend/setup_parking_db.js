const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function setupParkingDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('Connected to database.');

        // 1. ParkingSlots
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ParkingSlots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slot_number VARCHAR(50) UNIQUE NOT NULL,
                status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available'
            )
        `);
        console.log('ParkingSlots table created.');

        // 2. Vehicles
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Vehicles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plate_number VARCHAR(50) UNIQUE NOT NULL,
                vehicle_type VARCHAR(50) NOT NULL
            )
        `);
        console.log('Vehicles table created.');

        // 3. Pricing
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Pricing (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_type VARCHAR(50) UNIQUE NOT NULL,
                price_per_hour DECIMAL(10, 2) NOT NULL
            )
        `);
        console.log('Pricing table created.');

        // 4. ParkingSessions
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ParkingSessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT NOT NULL,
                slot_id INT NOT NULL,
                entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                exit_time DATETIME,
                duration DECIMAL(10, 2),
                status ENUM('active', 'completed') DEFAULT 'active',
                FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id),
                FOREIGN KEY (slot_id) REFERENCES ParkingSlots(id)
            )
        `);
        console.log('ParkingSessions table created.');

        // 5. Transactions
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50),
                status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                created_by INT, -- User ID
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES ParkingSessions(id)
            )
        `);
        console.log('Transactions table created.');

        // 6. AuditLogs
        await connection.query(`
            CREATE TABLE IF NOT EXISTS AuditLogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(255) NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('AuditLogs table created.');

        // Seed Pricing
        const prices = [
            ['Car', 500.00],
            ['Truck', 1000.00],
            ['Bike', 200.00]
        ];

        for (const [type, price] of prices) {
            await connection.query(`
                INSERT INTO Pricing (vehicle_type, price_per_hour)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE price_per_hour = VALUES(price_per_hour)
            `, [type, price]);
        }
        console.log('Pricing data seeded.');

        // Seed Slots
        const slots = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1'];
        for (const slot of slots) {
            await connection.query(`
                INSERT INTO ParkingSlots (slot_number)
                VALUES (?)
                ON DUPLICATE KEY UPDATE status = status
            `, [slot]);
        }
        console.log('ParkingSlots seeded.');

    } catch (err) {
        console.error('Error setting up parking DB:', err);
    } finally {
        connection.end();
    }
}

setupParkingDB();
