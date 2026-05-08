const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new car record
router.post('/', async (req, res) => {
  const { plateNumber, driverName, phoneNumber } = req.body;
  if (!plateNumber || !driverName || !phoneNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const [existing] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Car with this Plate Number already exists' });
    }
    await db.query('INSERT INTO Car (PlateNumber, DriverName, PhoneNumber) VALUES (?, ?, ?)', [plateNumber, driverName, phoneNumber]);
    res.status(201).json({ message: 'Car added successfully' });
  } catch (err) {
    console.error('Add Car Error:', err.message);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// Get all cars
router.get('/', async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM Car');
    res.json(cars);
  } catch (err) {
    console.error('Get Cars Error:', err.message);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// Delete a car by plate number
router.delete('/:plateNumber', async (req, res) => {
  const { plateNumber } = req.params;
  try {
    const [result] = await db.query('DELETE FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Delete Car Error:', err.message);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// Update a car
router.put('/:plateNumber', async (req, res) => {
  const { plateNumber } = req.params;
  const { driverName, phoneNumber } = req.body;
  try {
    await db.query('UPDATE Car SET DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?', [driverName, phoneNumber, plateNumber]);
    res.json({ message: 'Car updated successfully' });
  } catch (err) {
    console.error('Update Car Error:', err.message);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

module.exports = router;

