const fs = require('fs/promises');
const { Database } = require('sqlite3');
const express = require('express');
const WebSocket = require('ws');
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

const gameEventEmitter = require('./routes/rgame')(
  app,
  matchService,
  roundService
);
require('./routes/rmatch')(app, matchService, roundService);
require('./routes/rsteamapi')(app);

const startSever = () => {
  const server = app.listen(8090, () => console.log('Server started'));

  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    const gameEventListener = (gameEvent, matchId) => {
      ws.send(JSON.stringify({ gameEvent, matchId }));
    };
    gameEventEmitter.on('game-event', gameEventListener);

    ws.on('close', () => {
      gameEventEmitter.removeListener('game-event', gameEventListener);
    });
  });
};

/**
 * Starts the rest api
 * @param {string} dbFile path to the database file
 */
function startRestAPI(dbFile) {
  Matches.init(dbFile);
  Rounds.init(dbFile);

  matchService.init(Matches);
  roundService.init(Rounds);

  fs.access(dbFile)
    .then(startSever)
    .catch(async () => {
      // Creates the database for storing stats
      const db = new Database(dbFile);
      const schema = await fs.readFile(path.join(__dirname, 'schema.sql'));
      db.exec(schema.toString(), () => {
        startSever();
        db.close();
      });
    });
}

if (require.main === module) {
  startRestAPI(path.join(__dirname, 'stats.db'));
}

module.exports = startRestAPI;
