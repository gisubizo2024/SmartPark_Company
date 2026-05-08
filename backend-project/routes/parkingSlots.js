const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all parking slots
router.get('/', async (req, res) => {
    try {
        const [slots] = await db.query('SELECT * FROM ParkingSlot');
        res.json(slots);
    } catch (err) {
        console.error('Get Slots Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Create a new slot
router.post('/', async (req, res) => {
    const { slotNumber } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [slotNumber]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Slot already exists' });
        }
        await db.query('INSERT INTO ParkingSlot (SlotNumber) VALUES (?)', [slotNumber]);
        res.status(201).json({ message: 'Slot created successfully' });
    } catch (err) {
        console.error('Create Slot Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Update a slot status or number
router.put('/:slotNumber', async (req, res) => {
    const { slotNumber } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE ParkingSlot SET SlotStatus = ? WHERE SlotNumber = ?', [status, slotNumber]);
        res.json({ message: 'Slot updated' });
    } catch (err) {
        console.error('Update Slot Error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a slot
router.delete('/:slotNumber', async (req, res) => {
    const { slotNumber } = req.params;
    try {
        await db.query('DELETE FROM ParkingSlot WHERE SlotNumber = ?', [slotNumber]);
        res.json({ message: 'Slot deleted' });
    } catch (err) {
        console.error('Delete Slot Error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

