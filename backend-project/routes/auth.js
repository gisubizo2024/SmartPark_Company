const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = users[0];
        // In a real app, use bcrypt. Here we compare plain text as per simple requirements/time.
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        await db.query('INSERT INTO Users (username, password) VALUES (?, ?)', [username, password]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
