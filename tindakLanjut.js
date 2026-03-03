const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../app/uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `tl-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/temuan/:id/tindak-lanjut
router.post('/:id/tindak-lanjut', upload.fields([{ name: 'foto_tl_1' }, { name: 'foto_tl_2' }]), (req, res) => {
    try {
        const temuan_id = parseInt(req.params.id);
        const temuan = db.prepare('SELECT id FROM temuan WHERE id = ?').get(temuan_id);
        if (!temuan) return res.status(404).json({ success: false, message: 'Temuan tidak ditemukan' });

        const { prioritas, nama_petugas_tl, status, tanggal_tl } = req.body;
        if (!prioritas || !nama_petugas_tl || !status || !tanggal_tl) {
            return res.status(400).json({ success: false, message: 'Field wajib belum lengkap' });
        }

        const foto1 = req.files?.foto_tl_1?.[0]?.filename || null;
        const foto2 = req.files?.foto_tl_2?.[0]?.filename || null;

        // Check if TL exists for this temuan
        const existing = db.prepare('SELECT id FROM tindak_lanjut WHERE temuan_id = ?').get(temuan_id);

        if (existing) {
            db.prepare(`
        UPDATE tindak_lanjut SET prioritas=?, tanggal_tl=?, foto_tl_1=COALESCE(?,foto_tl_1),
        foto_tl_2=COALESCE(?,foto_tl_2), nama_petugas_tl=?, status=?
        WHERE temuan_id=?
      `).run(prioritas, tanggal_tl, foto1, foto2, nama_petugas_tl, status, temuan_id);
        } else {
            db.prepare(`
        INSERT INTO tindak_lanjut (temuan_id, prioritas, tanggal_tl, foto_tl_1, foto_tl_2, nama_petugas_tl, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(temuan_id, prioritas, tanggal_tl, foto1, foto2, nama_petugas_tl, status);
        }

        res.json({ success: true, message: 'Tindak lanjut berhasil disimpan' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan tindak lanjut: ' + err.message });
    }
});

module.exports = router;
