module.exports = (app, statsService) => {
  app.get('/stats', async (req, res) => {
    try {
      const stats = await statsService.getAllStats();
      res.status(200);
      res.json(stats);
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the stats' });
    }
  });
};
