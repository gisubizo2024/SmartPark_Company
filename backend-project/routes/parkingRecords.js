const express = require('express');
const router = express.Router();
const db = require('../db');

// Car Entry (Create Record) - Uses Stored Procedure
router.post('/entry', async (req, res) => {
    const { plateNumber, slotNumber } = req.body;
    try {
        await db.query('CALL CarEntry(?, ?)', [plateNumber, slotNumber]);
        res.status(201).json({ message: 'Car entered and slot updated' });
    } catch (err) {
        console.error('Car Entry Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Car Exit (Update Record & Bill) - Uses Stored Procedure
router.post('/exit/:recordId', async (req, res) => {
    const { recordId } = req.params;
    try {
        await db.query('CALL CarExit(?)', [recordId]);
        res.json({ message: 'Car exited, bill generated and slot freed' });
    } catch (err) {
        console.error('Car Exit Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Get all parking records
router.get('/', async (req, res) => {
    try {
        const [records] = await db.query('SELECT * FROM ParkingRecord');
        res.json(records);
    } catch (err) {
        console.error('Get Records Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Update a record
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { entryTime, exitTime, durationHours } = req.body;
    try {
        await db.query('UPDATE ParkingRecord SET EntryTime = ?, ExitTime = ?, DurationHours = ? WHERE RecordID = ?', 
            [entryTime, exitTime, durationHours, id]);
        res.json({ message: 'Record updated' });
    } catch (err) {
        console.error('Update Record Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Delete a record
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userRole = req.headers['x-user-role']; // Simple simulation for practical exam
    
    if (userRole !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    try {
        await db.query('DELETE FROM ParkingRecord WHERE RecordID = ?', [id]);
        res.json({ message: 'Record deleted' });
    } catch (err) {
        console.error('Delete Record Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

module.exports = router;
