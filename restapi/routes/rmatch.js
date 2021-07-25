module.exports = (app, matchService, roundService) => {
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

  app.get('/match/:id/round', async (req, res) => {
    try {
      const match = await matchService.findById(req.params.id);
      if (match) {
        const rounds = await roundService.findByMatch(req.params.id);
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

  app.get('/match/:id/round/:n', async (req, res) => {
    try {
      const round = await roundService.findByMatchAndNumber(
        req.params.id,
        req.params.n
      );
      if (round) {
        res.status(200);
        res.json(round);
      } else {
        res.status(404);
        res.json({ error: 'Round not found' });
      }
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the round' });
    }
  });

  app.delete('/match/:id', (req, res) => {
    try {
      matchService.deleteMatch(req.params.id);
      res.status(200);
      res.send('Match deleted');
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while deleting the match' });
    }
  });
};
