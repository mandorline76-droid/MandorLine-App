const m = require('node-sqlite3-wasm');
console.log('Keys:', Object.keys(m));
console.log('Default:', typeof m.default);
console.log('Database:', typeof m.Database);
