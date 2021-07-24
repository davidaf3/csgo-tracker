const fs = require('fs/promises');
const { Database } = require('sqlite3');
const express = require('express');
const path = require('path');

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

const Matches = require('./models/match');
const Rounds = require('./models/round');

const matchService = require('./services/matchService');
const roundService = require('./services/roundService');

require('./routes/rgame')(app, matchService, roundService);
require('./routes/rmatch')(app, matchService, roundService);
require('./routes/rsteamapi')(app);

/**
 * Starts the rest api
 * @param {string} dbFile path to the database file
 */
module.exports = (dbFile) => {
  Matches.init(dbFile);
  Rounds.init(dbFile);

  matchService.init(Matches);
  roundService.init(Rounds);

  fs.access(dbFile)
    .then(() => app.listen(8090, () => console.log('Server started')))
    .catch(async () => {
      // Creates the database for storing stats
      const db = new Database(dbFile);
      const schema = await fs.readFile(path.join(__dirname, 'schema.sql'));
      db.exec(schema.toString(), () => {
        app.listen(8090, () => console.log('Server started'));
        db.close();
      });
    });
};
