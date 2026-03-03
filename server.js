const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// CORS yang lebih eksplisit
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Static files (frontend)
app.use(express.static(path.join(__dirname, '../app')));
app.use('/uploads', express.static(path.join(__dirname, '../app/uploads')));

// Routes
app.use('/api/login', require('./routes/auth'));
app.use('/api/temuan', require('./routes/temuan'));
app.use('/api/temuan', require('./routes/tindakLanjut'));

// Dashboard stats
app.get('/api/dashboard', (req, res) => {
    const db = require('./db');
    const total = db.prepare('SELECT COUNT(*) as c FROM temuan').get().c;
    const open = db.prepare("SELECT COUNT(*) as c FROM tindak_lanjut WHERE status='Open'").get().c;
    const prog = db.prepare("SELECT COUNT(*) as c FROM tindak_lanjut WHERE status='In Progress'").get().c;
    const done = db.prepare("SELECT COUNT(*) as c FROM tindak_lanjut WHERE status='Closed'").get().c;
    const noTl = db.prepare('SELECT COUNT(*) as c FROM temuan WHERE id NOT IN (SELECT DISTINCT temuan_id FROM tindak_lanjut)').get().c;
    res.json({ success: true, total, open: open + noTl, in_progress: prog, closed: done });
});

// Serve frontend index for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ MandorLine server berjalan di http://localhost:${PORT}`);
});
