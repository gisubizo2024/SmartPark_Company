const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all salaries
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT s.*, e.FirstName, e.LastName 
      FROM Salary s 
      JOIN Employee e ON s.employeeNumber = e.employeeNumber
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new salary
router.post('/', async (req, res) => {
    const { employeeNumber, GrossSalary, TotalDeduction, NetSalary, month } = req.body;
    try {
        // If NetSalary is not provided, calculate it? 
        // Requirements say "Salary form" allows inputs. Let's assume frontend sends it or we calculate.
        // Ideally calculated: Net = Gross - Deduction.
        const calculatedNet = NetSalary || (GrossSalary - TotalDeduction);

        const [result] = await db.query(
            'INSERT INTO Salary (employeeNumber, GrossSalary, TotalDeduction, NetSalary, month) VALUES (?, ?, ?, ?, ?)',
            [employeeNumber, GrossSalary, TotalDeduction, calculatedNet, month]
        );
        res.status(201).json({ id: result.insertId, ...req.body, NetSalary: calculatedNet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update salary
router.put('/:id', async (req, res) => {
    const { GrossSalary, TotalDeduction, NetSalary, month } = req.body;
    const { id } = req.params;
    const calculatedNet = NetSalary || (GrossSalary - TotalDeduction);

    try {
        await db.query(
            'UPDATE Salary SET GrossSalary = ?, TotalDeduction = ?, NetSalary = ?, month = ? WHERE id = ?',
            [GrossSalary, TotalDeduction, calculatedNet, month, id]
        );
        res.json({ message: 'Salary updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE salary
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Salary WHERE id = ?', [id]);
        res.json({ message: 'Salary deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
