import { Express } from 'express';
import { Stats, getAllStats } from '../services/statsService';
import * as statsCache from '../statsCache';

export default function (app: Express): void {
  app.get('/stats', async (req, res) => {
    try {
      const mode = req.query.mode as string | undefined;
      
      let stats: Stats;
      if (statsCache.has(req.url)) {
        stats = statsCache.get(req.url) as Stats;
      } else {
        stats = await getAllStats(mode);
        statsCache.set(req.url, stats);
      }
      res.status(200);
      res.json(stats);
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the stats' });
    }
  });
}
