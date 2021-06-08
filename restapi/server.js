const fs = require('fs/promises');
const { Database } = require('sqlite3');
const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./routes/rgame')(app);

fs.access('stats.db')
  .then(() => app.listen(8080, () => console.log('Server started')))
  .catch(async () => {
    // Creates the database for storing stats
    const db = new Database('stats.db');
    const schema = await fs.readFile('schema.sql');
    db.exec(schema.toString(), () => {
      app.listen(8080, () => console.log('Server started'));
      db.close();
    });
  });
