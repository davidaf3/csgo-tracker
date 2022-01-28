import NodeCache from 'node-cache';
import { Express } from 'express';
import { Stats, getAllStats } from '../services/statsService';

export default function (app: Express, statsCache: NodeCache): void {
  app.get('/stats', async (req, res) => {
    try {
      let stats: Stats;
      if (statsCache.has(req.url)) {
        stats = statsCache.get<Stats>(req.url) as Stats;
      } else {
        stats = await getAllStats();
        statsCache.set(req.url, stats);
      }
      res.status(200);
      res.json(stats);
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the stats' });
    }
  });
};
