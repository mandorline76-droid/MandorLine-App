const db = require('./db');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../app/uploads');
const files = fs.readdirSync(uploadDir);

const temuan = db.prepare('SELECT id, no_kondisi, foto_temuan_1, foto_temuan_2 FROM temuan').all();
const tl = db.prepare('SELECT id, temuan_id, foto_tl_1, foto_tl_2 FROM tindak_lanjut').all();

console.log('--- FILES IN UPLOADS ---');
console.log(files);

console.log('\n--- TEMUAN TABLE ---');
temuan.forEach(t => {
    console.log(`ID: ${t.id}, NO: ${t.no_kondisi}, PHOTO1: ${t.foto_temuan_1} [${files.includes(t.foto_temuan_1) ? 'OK' : 'MISSING'}], PHOTO2: ${t.foto_temuan_2} [${t.foto_temuan_2 ? (files.includes(t.foto_temuan_2) ? 'OK' : 'MISSING') : 'NULL'}]`);
});

console.log('\n--- TINDAK LANJUT TABLE ---');
tl.forEach(t => {
    console.log(`ID: ${t.id}, TEMUAN_ID: ${t.temuan_id}, Photo1: ${t.foto_tl_1} [${files.includes(t.foto_tl_1) ? 'OK' : 'MISSING'}], Photo2: ${t.foto_tl_2} [${t.foto_tl_2 ? (files.includes(t.foto_tl_2) ? 'OK' : 'MISSING') : 'NULL'}]`);
});
