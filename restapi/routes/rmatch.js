const matchService = require('../services/matchService');
const roundService = require('../services/roundService');

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

  app.get('/match/:id/rounds', async (req, res) => {
    try {
      const rounds = await roundService.findByMatch(req.params.id);
      if (rounds.length > 0) {
        res.status(200);
        res.json(rounds);
      } else {
        res.status(404);
        res.json({ error: 'Match not found' });
      }
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the rounds' });
    }
  });
};
