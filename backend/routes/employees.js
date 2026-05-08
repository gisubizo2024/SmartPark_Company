const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all employees
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Employee');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new employee
router.post('/', async (req, res) => {
    const { FirstName, LastName, Position, Address, Telephone, Gender, hiredDate, DepartmentCode } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Employee (FirstName, LastName, Position, Address, Telephone, Gender, hiredDate, DepartmentCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [FirstName, LastName, Position, Address, Telephone, Gender, hiredDate, DepartmentCode]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update employee
router.put('/:id', async (req, res) => {
    const { FirstName, LastName, Position, Address, Telephone, Gender, hiredDate, DepartmentCode } = req.body;
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE Employee SET FirstName=?, LastName=?, Position=?, Address=?, Telephone=?, Gender=?, hiredDate=?, DepartmentCode=? WHERE employeeNumber=?',
            [FirstName, LastName, Position, Address, Telephone, Gender, hiredDate, DepartmentCode, id]
        );
        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Employee WHERE employeeNumber = ?', [id]);
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
