const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, passwordPresent: !!password }); // Debug log

    try {
        const [users] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = users[0];

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Check if password matches hash
        let isMatch = await bcrypt.compare(password, user.password);

        // Fallback: Check plain text for legacy users and migrate them
        if (!isMatch && user.password === password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
            isMatch = true; // Allow login and updated DB
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Profile
router.put('/update', async (req, res) => {
    const { currentUsername, username, currentPassword, newPassword } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM Users WHERE username = ?', [currentUsername]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        // Verify current password
        let isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch && user.password === currentPassword) isMatch = true; // Legacy fallback

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Prepare updates
        const updates = [];
        const params = [];

        if (username && username !== user.username) {
            // Check availability
            const [existing] = await db.query('SELECT * FROM Users WHERE username = ? AND id != ?', [username, user.id]);
            if (existing.length > 0) return res.status(400).json({ message: 'Username already taken' });

            updates.push('username = ?');
            params.push(username);
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            updates.push('password = ?');
            params.push(hashedPassword);
        }

        if (updates.length > 0) {
            params.push(user.id);
            await db.query(`UPDATE Users SET ${updates.join(', ')} WHERE id = ?`, params);
            res.json({ message: 'Profile updated successfully', username: username || user.username });
        } else {
            res.json({ message: 'No changes made', username: user.username });
        }

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

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
