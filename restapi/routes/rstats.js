module.exports = (app, statsCache, statsService) => {
  app.get('/stats', async (req, res) => {
    try {
      let stats;
      if (statsCache.has(req.url)) {
        stats = statsCache.get(req.url);
      } else {
        stats = await statsService.getAllStats();
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
