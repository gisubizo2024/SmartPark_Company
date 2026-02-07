const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all departments
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Department');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new department
router.post('/', async (req, res) => {
    const { DepartmentCode, DepartmentName, GrossSalary, TotalDeduction } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Department (DepartmentCode, DepartmentName, GrossSalary, TotalDeduction) VALUES (?, ?, ?, ?)',
            [DepartmentCode, DepartmentName, GrossSalary, TotalDeduction]
        );
        res.status(201).json({ DepartmentCode, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update department
router.put('/:id', async (req, res) => {
    const { DepartmentName, GrossSalary, TotalDeduction } = req.body;
    const { id } = req.params; // DepartmentCode
    try {
        await db.query(
            'UPDATE Department SET DepartmentName=?, GrossSalary=?, TotalDeduction=? WHERE DepartmentCode=?',
            [DepartmentName, GrossSalary, TotalDeduction, id]
        );
        res.json({ message: 'Department updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE department
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Department WHERE DepartmentCode = ?', [id]);
        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
