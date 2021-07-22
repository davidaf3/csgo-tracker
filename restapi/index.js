const path = require('path');
const startRestapi = require('./server');

startRestapi(path.join(__dirname, 'stats.db'));
