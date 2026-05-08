const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, passwordPresent: !!password }); // Debug log

    try {
        const [users] = await db.query('SELECT * FROM User WHERE Username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = users[0];

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Check if password matches hash
        let isMatch = await bcrypt.compare(password, user.PasswordHash);

        // Fallback: Check plain text for legacy users and migrate them
        if (!isMatch && user.PasswordHash === password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.query('UPDATE User SET PasswordHash = ? WHERE UserID = ?', [hashedPassword, user.UserID]);
            isMatch = true; // Allow login and updated DB
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.IsBlocked) {
            return res.status(403).json({ message: `${user.Username} you are Blocked by system admin you can contact or you wait for him/her to unBlock you` });
        }

        res.json({ message: 'Login successful', username: user.Username, role: user.Role });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// Update Profile
router.put('/update', async (req, res) => {
    const { currentUsername, username, currentPassword, newPassword } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM User WHERE Username = ?', [currentUsername]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        // Verify current password
        let isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);
        if (!isMatch && user.PasswordHash === currentPassword) isMatch = true; // Legacy fallback

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Prepare updates
        const updates = [];
        const params = [];

        if (username && username !== user.Username) {
            // Check availability
            const [existing] = await db.query('SELECT * FROM User WHERE Username = ? AND UserID != ?', [username, user.UserID]);
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
            params.push(user.UserID);
            await db.query(`UPDATE User SET ${updates.join(', ')} WHERE UserID = ?`, params);
            res.json({ message: 'Profile updated successfully', username: username || user.Username });
        } else {
            res.json({ message: 'No changes made', username: user.Username });
        }

    } catch (err) {
        console.error('Update Error:', err.message);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// export moved to end of file

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM User WHERE Username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('INSERT INTO User (Username, PasswordHash) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { username, newPassword } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM User WHERE Username = ?', [username]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await db.query('UPDATE User SET PasswordHash = ? WHERE Username = ?', [hashedPassword, username]);
        res.json({ message: 'Password recovered and updated successfully' });
    } catch (err) {
        console.error('Recovery Error:', err);
        res.status(500).json({ message: 'Server error during recovery' });
    }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT UserID, Username, Role, IsBlocked, CreatedAt FROM User');
        res.json(users);
    } catch (err) {
        console.error('Get Users Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle User Block Status (Admin only)
router.put('/users/:id/toggle-block', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE User SET IsBlocked = NOT IsBlocked WHERE UserID = ?', [id]);
        res.json({ message: 'User block status toggled' });
    } catch (err) {
        console.error('Toggle Block Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User Role (Admin only)
router.put('/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        await db.query('UPDATE User SET Role = ? WHERE UserID = ?', [role, id]);
        res.json({ message: 'User role updated successfully' });
    } catch (err) {
        console.error('Update Role Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User (Admin only)
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    try {
        const updates = [];
        const params = [];
        
        if (username) {
            updates.push('Username = ?');
            params.push(username);
        }
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updates.push('PasswordHash = ?');
            params.push(hashedPassword);
        }
        
        if (updates.length > 0) {
            params.push(id);
            await db.query(`UPDATE User SET ${updates.join(', ')} WHERE UserID = ?`, params);
            res.json({ message: 'User updated successfully' });
        } else {
            res.status(400).json({ message: 'No updates provided' });
        }
    } catch (err) {
        console.error('Update User Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete User (Admin only)
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM User WHERE UserID = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;


