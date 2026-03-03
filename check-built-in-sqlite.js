try {
    const sqlite = require('node:sqlite');
    console.log('node:sqlite available');
    console.log('Keys:', Object.keys(sqlite));
} catch (e) {
    console.log('node:sqlite NOT available');
}
