const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Connected to MySQL server.');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Database ${process.env.DB_NAME} created or already exists.`);

    await connection.changeUser({ database: process.env.DB_NAME });

    // Create Employees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Employee (
        employeeNumber INT AUTO_INCREMENT PRIMARY KEY,
        FirstName VARCHAR(255) NOT NULL,
        LastName VARCHAR(255) NOT NULL,
        Position VARCHAR(255),
        Address VARCHAR(255),
        Telephone VARCHAR(20),
        Gender VARCHAR(10),
        hiredDate DATE,
        DepartmentCode VARCHAR(50)
      )
    `);
    console.log('Employee table checked/created.');

    // Create Departments table
    // Note: Added TotalDeduction to store the default deduction value provided in initial data
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Department (
        DepartmentCode VARCHAR(50) PRIMARY KEY,
        DepartmentName VARCHAR(255) NOT NULL,
        GrossSalary DECIMAL(10, 2),
        TotalDeduction DECIMAL(10, 2)
      )
    `);
    console.log('Department table checked/created.');

    // Create Salary table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Salary (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employeeNumber INT,
        GrossSalary DECIMAL(10, 2),
        TotalDeduction DECIMAL(10, 2),
        NetSalary DECIMAL(10, 2),
        month DATE,
        FOREIGN KEY (employeeNumber) REFERENCES Employee(employeeNumber) ON DELETE CASCADE
      )
    `);
    console.log('Salary table checked/created.');

    // Seed Departments
    const departments = [
      ['CW', 'Carwash', 300000, 20000],
      ['ST', 'Stock', 200000, 5000],
      ['MC', 'Mechanic', 450000, 40000],
      ['ADMS', 'Administration Staff', 600000, 70000]
    ];

    for (const dept of departments) {
      await connection.query(`
        INSERT INTO Department (DepartmentCode, DepartmentName, GrossSalary, TotalDeduction)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE DepartmentName=VALUES(DepartmentName), GrossSalary=VALUES(GrossSalary), TotalDeduction=VALUES(TotalDeduction)
      `, dept);
    }
    console.log('Department data seeded.');

    // Create Users table for login
    await connection.query(`
        CREATE TABLE IF NOT EXISTS Users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `);

    // Seed default admin
    await connection.query(`
        INSERT INTO Users (username, password) VALUES ('admin', 'admin123') ON DUPLICATE KEY UPDATE password=VALUES(password)
    `);
    console.log('Users table created and admin seeded.');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    connection.end();
  }
}

setup();
