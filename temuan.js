const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../app/uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// Helper: generate No Kondisi HAR-DDMMYY-NNN
function generateNoKondisi() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const tanggalKey = `${dd}${mm}${yy}`;

    const upsert = db.prepare(`
    INSERT INTO no_kondisi_counter (tanggal, counter)
    VALUES (?, 1)
    ON CONFLICT(tanggal) DO UPDATE SET counter = counter + 1
  `);
    upsert.run(tanggalKey);

    const row = db.prepare('SELECT counter FROM no_kondisi_counter WHERE tanggal = ?').get(tanggalKey);
    const nnn = String(row.counter).padStart(3, '0');
    return `HAR-${tanggalKey}-${nnn}`;
}

// GET /api/temuan
router.get('/', (req, res) => {
    const rows = db.prepare(`
    SELECT t.*, tl.prioritas, tl.status, tl.nama_petugas_tl, tl.tanggal_tl, tl.foto_tl_1, tl.foto_tl_2
    FROM temuan t
    LEFT JOIN tindak_lanjut tl ON tl.temuan_id = t.id
    ORDER BY t.created_at DESC
  `).all();
    res.json({ success: true, data: rows });
});

// GET /api/temuan/:id
router.get('/:id', (req, res) => {
    const temuan = db.prepare('SELECT * FROM temuan WHERE id = ?').get(req.params.id);
    if (!temuan) return res.status(404).json({ success: false, message: 'Temuan tidak ditemukan' });
    const tl = db.prepare('SELECT * FROM tindak_lanjut WHERE temuan_id = ? ORDER BY id DESC LIMIT 1').get(req.params.id);
    res.json({ success: true, data: { ...temuan, tindak_lanjut: tl || null } });
});

// POST /api/temuan
router.post('/', upload.fields([{ name: 'foto_temuan_1' }, { name: 'foto_temuan_2' }]), (req, res) => {
    try {
        const {
            nama_petugas, tanggal_patroli, penyulang, kondisi_cuaca,
            segmen, titik_koordinat, jenis_temuan, lokasi_temuan, keterangan
        } = req.body;

        if (!nama_petugas || !penyulang || !jenis_temuan || !lokasi_temuan) {
            return res.status(400).json({ success: false, message: 'Field wajib belum lengkap' });
        }

        const no_kondisi = generateNoKondisi();
        const foto1 = req.files?.foto_temuan_1?.[0]?.filename || null;
        const foto2 = req.files?.foto_temuan_2?.[0]?.filename || null;
        const now = tanggal_patroli || new Date().toISOString();

        const stmt = db.prepare(`
      INSERT INTO temuan (no_kondisi, nama_petugas, tanggal_patroli, penyulang, kondisi_cuaca,
        segmen, titik_koordinat, jenis_temuan, lokasi_temuan, foto_temuan_1, foto_temuan_2, keterangan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(no_kondisi, nama_petugas, now, penyulang, kondisi_cuaca,
            segmen, titik_koordinat, jenis_temuan, lokasi_temuan, foto1, foto2, keterangan);

        res.json({ success: true, id: result.lastInsertRowid, no_kondisi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan temuan: ' + err.message });
    }
});

// GET /api/temuan/next-no-kondisi
router.get('/meta/next-no-kondisi', (req, res) => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const tanggalKey = `${dd}${mm}${yy}`;
    const row = db.prepare('SELECT counter FROM no_kondisi_counter WHERE tanggal = ?').get(tanggalKey);
    const next = row ? row.counter + 1 : 1;
    const nnn = String(next).padStart(3, '0');
    res.json({ success: true, no_kondisi: `HAR-${tanggalKey}-${nnn}` });
});

module.exports = router;
