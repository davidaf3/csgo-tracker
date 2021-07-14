const fetch = require('node-fetch');
const { STEAM_API_KEY } = require('../secrets');

module.exports = (app) => {
  app.get('/player/:id', async (req, res) => {
    try {
      const response = await fetch(
        `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${req.params.id}`
      );
      const result = await response.json();
      res.status(200);
      res.send(result.response.players[0]);
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the player info' });
    }
  });
};
