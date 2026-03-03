const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'mandorline.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nama TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS temuan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    no_kondisi TEXT UNIQUE NOT NULL,
    nama_petugas TEXT NOT NULL,
    tanggal_patroli TEXT NOT NULL,
    penyulang TEXT NOT NULL,
    kondisi_cuaca TEXT NOT NULL,
    segmen TEXT NOT NULL,
    titik_koordinat TEXT,
    jenis_temuan TEXT NOT NULL,
    lokasi_temuan TEXT NOT NULL,
    foto_temuan_1 TEXT,
    foto_temuan_2 TEXT,
    keterangan TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS tindak_lanjut (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temuan_id INTEGER NOT NULL,
    prioritas INTEGER NOT NULL,
    tanggal_tl TEXT NOT NULL,
    foto_tl_1 TEXT,
    foto_tl_2 TEXT,
    nama_petugas_tl TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (temuan_id) REFERENCES temuan(id)
  );

  CREATE TABLE IF NOT EXISTS no_kondisi_counter (
    tanggal TEXT PRIMARY KEY,
    counter INTEGER NOT NULL DEFAULT 0
  );
`);

// Seed default admin user jika belum ada
const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!existingUser) {
  db.prepare('INSERT INTO users (username, password, nama) VALUES (?, ?, ?)').run('admin', 'admin123', 'Administrator');
  console.log('✅ User default dibuat: admin / admin123');
}

module.exports = db;
