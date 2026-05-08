const express = require('express');
const router = express.Router();
const db = require('../db');

// Get daily report
router.get('/daily', async (req, res) => {
    try {
        const [report] = await db.query('SELECT * FROM DailyReport');
        res.json(report);
    } catch (err) {
        console.error('Get Daily Report Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

module.exports = router;
