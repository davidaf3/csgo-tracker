const matchService = require('../services/matchService');

module.exports = (app) => {
  app.get('/match', async (req, res) => {
    try {
      const matches = await matchService.findAll();
      res.status(200);
      res.json(matches);
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the match list' });
    }
  });

  app.get('/match/:id', async (req, res) => {
    try {
      const match = await matchService.findById(req.params.id);
      if (match) {
        res.status(200);
        res.json(match);
      } else {
        res.status(404);
        res.json({ error: 'Match not found' });
      }
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the match' });
    }
  });
};
