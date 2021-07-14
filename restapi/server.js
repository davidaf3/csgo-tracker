const fs = require('fs/promises');
const { Database } = require('sqlite3');
const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, UPDATE, PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, token'
  );
  next();
});

require('./routes/rgame')(app);
require('./routes/rmatch')(app);
require('./routes/rsteamapi')(app);

fs.access('stats.db')
  .then(() => app.listen(8090, () => console.log('Server started')))
  .catch(async () => {
    // Creates the database for storing stats
    const db = new Database('stats.db');
    const schema = await fs.readFile('schema.sql');
    db.exec(schema.toString(), () => {
      app.listen(8090, () => console.log('Server started'));
      db.close();
    });
  });
