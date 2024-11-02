import { Express } from 'express';
import { STEAM_API_KEY } from '../secrets';

export default function (app: Express): void {
  app.get('/player/:id', async (req, res) => {
    try {
      const response = await fetch(
        `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${req.params.id}`
      );
      const result = (await response.json()) as any;
      res.status(200);
      res.send(result.response.players[0]);
    } catch (err) {
      res.status(500);
      res.json({ error: 'An error occurred while getting the player info' });
    }
  });
};
