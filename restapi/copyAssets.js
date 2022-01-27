const fs = require('fs');

fs.copyFile('schema.sql', 'dist/schema.sql', () => {});
