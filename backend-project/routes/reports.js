const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/payroll', async (req, res) => {
    const { month } = req.query; // Optional filter by month
    let query = `
    SELECT e.FirstName, e.LastName, e.Position, d.DepartmentName, s.NetSalary, s.month
    FROM Salary s
    JOIN Employee e ON s.employeeNumber = e.employeeNumber
    JOIN Department d ON e.DepartmentCode = d.DepartmentCode
  `;
    const params = [];

    if (month) {
        query += ' WHERE s.month LIKE ?';
        params.push(`${month}%`);
    }

    try {
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
