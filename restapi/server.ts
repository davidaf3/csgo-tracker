import fs from 'fs/promises';
import { Database } from 'sqlite3';
import express from 'express';
import WebSocket from 'ws';
import NodeCache from 'node-cache';
import path from 'path';
import { config } from './config';
import rgame from './routes/rgame';
import rmatch from './routes/rmatch';
import rstats from './routes/rstats';
import rsteamapi from './routes/rsteamapi';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, UPDATE, PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, token'
  );
  next();
});

const statsCache = new NodeCache();

const gameEventEmitter = rgame(app, statsCache);
rmatch(app);
rstats(app, statsCache);
rsteamapi(app);

const startSever = () => {
  const server = app.listen(8090, () => console.log('Server started'));

  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    const gameEventListener = (gameEvent: string, matchId: string) => {
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
 * @param dbFile path to the database file
 */
export default function startRestAPI(dbFile: string) {
  config.dbFile = dbFile;
  fs.access(dbFile)
    .then(startSever)
    .catch(async () => {
      // Creates the database for storing stats
      await fs.mkdir(path.dirname(dbFile), { recursive: true });
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
