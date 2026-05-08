const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all payments
router.get('/', async (req, res) => {
    try {
        const [payments] = await db.query('SELECT * FROM Payment');
        res.json(payments);
    } catch (err) {
        console.error('Get Payments Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Get bill for a specific record
router.get('/bill/:recordId', async (req, res) => {
    const { recordId } = req.params;
    try {
        const [bill] = await db.query('SELECT * FROM BillView WHERE RecordID = ?', [recordId]);
        if (bill.length === 0) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill[0]);
    } catch (err) {
        console.error('Get Bill Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Manual Payment Insert (Required by Checklist)
router.post('/', async (req, res) => {
    const { recordId, amountPaid } = req.body;
    try {
        await db.query('INSERT INTO Payment (RecordID, AmountPaid) VALUES (?, ?)', [recordId, amountPaid]);
        res.status(201).json({ message: 'Payment recorded successfully' });
    } catch (err) {
        console.error('Create Payment Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

module.exports = router;

