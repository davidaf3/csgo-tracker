import fs from 'fs/promises';

fs.copyFile('schema.sql', 'dist/schema.sql');
