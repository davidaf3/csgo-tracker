import EventEmitter from 'events';
import { Express } from 'express';
import * as statsCache from '../statsCache'
import * as matchService from '../services/matchService';
import * as roundService from '../services/roundService';

export default function(app: Express): EventEmitter {
  const gameEventEmitter = new EventEmitter();

  app.post('/game', (req, res) => {
    const currentMatch = matchService.getCurrentMatch();
    const currentRound = roundService.getCurrentRound();

    // Match start
    if (
      !currentMatch &&
      req.body.added?.player?.match_stats &&
      req.body.map.mode === 'competitive'
    ) {
      console.log('MATCH STARTED');

      matchService
        .createMatch({
          playerId: req.body.player.steamid,
          map: req.body.map.name,
          mode: req.body.map.mode,
          duration: 0,
          over: false,
          roundsWon: 0,
          roundsLost: 0,
          killshs: 0,
          ...req.body.player.match_stats,
        })
        .then((id) => {
          gameEventEmitter.emit('game-event', 'match started', id);
        });

      roundService.setNextRoundInitMoney(800);
    }

    // Round start
    if (
      currentMatch &&
      req.body.previously?.round?.phase === 'freezetime' &&
      req.body.round?.phase === 'live' &&
      req.body.map?.phase !== 'warmup'
    ) {
      console.log('ROUND STARTED');

      const round = {
        matchId: currentMatch.id,
        n: req.body.map.round + 1,
        team: req.body.player.team,
        equipValue: req.body.player.state.equip_value,
        initArmor: req.body.player.state.armor,
        helmet: req.body.player.state.helmet,
        duration: 0,
        winner: '',
        winType: '',
        died: false,
        kills: 0,
        killshs: 0,
        assists: 0,
        score: 0,
        mvp: false,
      };
      roundService.createRound(round);

      gameEventEmitter.emit('game-event', 'round started', currentMatch.id);
    }

    // Player death
    if (
      currentMatch &&
      currentRound &&
      req.body.player?.state?.health === 0 &&
      req.body.previously?.player?.state?.health > 0 &&
      req.body.player?.steamid === currentMatch.playerId &&
      req.body.map?.phase !== 'warmup'
    ) {
      console.log('YOU DIED');

      const roundInfo = {
        died: true,
        killshs: req.body.player.state.round_killhs ?? 0,
        kills: req.body.player.match_stats.kills - currentMatch.kills,
        assists: req.body.player.match_stats.assists - currentMatch.assists,
        score: req.body.player.match_stats.score - currentMatch.score,
        mvp: req.body.player.match_stats.mvps > currentMatch.mvps,
      };
      roundService.updateCurrentRound(roundInfo);
      matchService.updateCurrentMatch({
        deaths: currentMatch.deaths + 1,
      });

      gameEventEmitter.emit('game-event', 'you died', currentMatch.id);
    }

    // Round end
    if (
      currentMatch &&
      currentRound &&
      req.body.previously?.round?.phase === 'over' &&
      req.body.round?.phase === 'freezetime' &&
      req.body.map?.round > 0 &&
      req.body.map?.phase !== 'warmup'
    ) {
      console.log('ROUND ENDED');

      const winString = req.body.map.round_wins
        ? req.body.map.round_wins[req.body.map.round.toString()]
        : `${req.body.round.win_team.toLowerCase()}_win`;

      const roundInfo = {
        kills: req.body.player.match_stats.kills - currentMatch.kills,
        killshs: currentRound.killshs,
        assists: req.body.player.match_stats.assists - currentMatch.assists,
        winner: winString.split('_')[0].toUpperCase(),
        winType: winString,
        score: req.body.player.match_stats.score - currentMatch.score,
        mvp: req.body.player.match_stats.mvps > currentMatch.mvps,
        duration:
          (new Date().getTime() -
            roundService.getCurrentRoundInitDate().getTime()) /
          1000,
      };

      // Add hs if the previous player was the main player
      if (
        !req.body.previously?.player?.steamid &&
        req.body.previously?.player?.state?.round_killhs
      ) {
        roundInfo.killshs = req.body.previously?.player?.state?.round_killhs;
      }

      roundService.updateCurrentRound(roundInfo);
      matchService.updateCurrentMatch({
        killshs: currentMatch.killshs + roundInfo.killshs,
        kills: req.body.player.match_stats.kills,
        assists: req.body.player.match_stats.assists,
        score: req.body.player.match_stats.score,
        mvps: req.body.player.match_stats.mvps,
        roundsWon:
          currentMatch.roundsWon +
          (roundInfo.winner === currentRound.team ? 1 : 0),
        roundsLost:
          currentMatch.roundsLost +
          (roundInfo.winner !== currentRound.team ? 1 : 0),
        duration: (new Date().getTime() - currentMatch.date.getTime()) / 1000,
      });

      Promise.all([
        roundService.saveCurrentRound(),
        matchService.saveCurrentMatch(),
      ]).then(() => {
        gameEventEmitter.emit('game-event', 'round ended', currentMatch.id);
      });

      roundService.setNextRoundInitMoney(req.body.player.state.money);
    }

    // Match end and last round end
    if (
      currentMatch &&
      currentRound &&
      req.body.map?.phase === 'gameover' &&
      req.body.previously?.map?.phase === 'live'
    ) {
      console.log('ROUND ENDED');

      const winString = req.body.map.round_wins
        ? req.body.map.round_wins[req.body.map.round.toString()]
        : `${req.body.round.win_team.toLowerCase()}_win`;

      let roundStats = {};
      let matchStats = {};

      // Add stats if the current player is the main player
      if (req.body.player?.steamid === currentMatch.playerId) {
        const roundKillshs = req.body.player?.state?.round_killhs ?? 0;
        roundStats = {
          killshs: roundKillshs,
          kills: req.body.player.match_stats.kills - currentMatch.kills,
          assists: req.body.player.match_stats.assists - currentMatch.assists,
          score: req.body.player.match_stats.score - currentMatch.score,
          mvp: req.body.player.match_stats.mvps > currentMatch.mvps,
        };

        matchStats = {
          killshs: currentMatch.killshs + roundKillshs,
          kills: req.body.player.match_stats.kills,
          assists: req.body.player.match_stats.assists,
          score: req.body.player.match_stats.score,
          mvps: req.body.player.match_stats.mvps,
        };
      } else {
        // If the player died, update the match with the round info stored when he died
        matchStats = {
          killshs: currentMatch.killshs + currentRound.killshs,
          kills: currentMatch.kills + currentRound.kills,
          assists: currentMatch.assists + currentRound.assists,
          score: currentMatch.score + currentRound.score,
          mvps: currentMatch.mvps + (currentRound.mvp ? 1 : 0),
        };
      }

      const roundInfo = {
        ...roundStats,
        winner: winString.split('_')[0].toUpperCase(),
        winType: winString,
        duration:
          (new Date().getTime() -
            roundService.getCurrentRoundInitDate().getTime()) /
          1000,
      };

      matchService.updateCurrentMatch({
        ...matchStats,
        roundsWon:
          currentMatch.roundsWon +
          (roundInfo.winner === currentRound.team ? 1 : 0),
        roundsLost:
          currentMatch.roundsLost +
          (roundInfo.winner !== currentRound.team ? 1 : 0),
        over: true,
        duration: (new Date().getTime() - currentMatch.date.getTime()) / 1000,
      });
      roundService.updateCurrentRound(roundInfo);

      const finishedMatchId = currentMatch.id;
      Promise.all([
        roundService.saveCurrentRound(),
        matchService.saveCurrentMatch(),
      ]).then(() => {
        statsCache.invalidate();
        gameEventEmitter.emit('game-event', 'round ended', finishedMatchId);
        gameEventEmitter.emit('game-event', 'match over', finishedMatchId);
      });

      console.log('MATCH OVER');
      matchService.closeCurrentMatch();
    }

    // Match quit
    if (currentMatch && req.body.previously?.map === true) {
      console.log('QUIT');
      gameEventEmitter.emit('game-event', 'quit', currentMatch.id);

      /* if (!currentMatch.over) {
        matchService.deleteMatch(currentMatch.id);
      } */
    }

    /* if (req.body.player?.steamid !== matchService.getCurrentMatch()?.playerId) {
      console.log(req.body);
      console.log("Previously:");
      console.log(req.body.previously);
      console.log("Added:");
      console.log(req.body.added);
    } */

    res.sendStatus(200);
  });

  return gameEventEmitter;
};
