const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/login
router.post('/', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }
    const user = db.prepare('SELECT id, username, nama FROM users WHERE username = ? AND password = ?').get(username, password);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
    res.json({ success: true, user });
});

module.exports = router;
