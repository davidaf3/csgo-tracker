import EventEmitter from 'events';
import { Express } from 'express';
import * as statsCache from '../statsCache'
import * as matchService from '../services/matchService';
import * as roundService from '../services/roundService';

export default function(app: Express): EventEmitter {
  const gameEventEmitter = new EventEmitter();

  const supportedGamemodes = [
    'competitive',
    'casual',
    'scrimcomp2v2',
  ];

  
  app.post('/game', (req, res) => {
    const body = req.body;
    // console.log('GAME EVENT', body); // Useful for debugging
    const currentMatch = matchService.getCurrentMatch();
    const currentRound = roundService.getCurrentRound();

    // const isCompetitive = () => body.map?.mode === 'competitive';
    // const isCasual = () => body.map?.mode === 'casual';
    // const isWingman = () => body.map?.mode === 'scrimcomp2v2';


    // Match start
    if (
      !currentMatch
      // && body.added?.player?.match_stats
      && (body.map?.phase === 'live' || body.map?.phase === 'warmup')
      && body.player
      && supportedGamemodes.includes(body.map?.mode)
    ) {
      console.log('MATCH STARTED');

      matchService
        .createMatch({
          playerId: body.player.steamid,
          map: body.map.name,
          mode: body.map.mode,
          duration: 0,
          over: false,
          roundsWon: 0,
          roundsLost: 0,
          killshs: 0,
          ...body.player.match_stats,
        })
        .then((id) => {
          gameEventEmitter.emit('game-event', 'match started', id);
        });

      roundService.setNextRoundInitMoney(800);
    }

    // Round start
    if (
      currentMatch
      && body.map?.phase !== 'warmup'
      && body.round?.phase === 'live'
      && body.previously?.round?.phase === 'freezetime'
    ) {
      console.log('ROUND STARTED');

      const round = {
        matchId: currentMatch.id,
        n: body.map.round + 1,
        team: body.player.team,
        equipValue: body.player.state.equip_value,
        initArmor: body.player.state.armor,
        helmet: body.player.state.helmet,
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
      body.player?.state?.health === 0 &&
      body.previously?.player?.state?.health > 0 &&
      body.player?.steamid === currentMatch.playerId &&
      body.map?.phase !== 'warmup'
    ) {
      console.log('YOU DIED');

      const roundInfo = {
        died: true,
        killshs: body.player.state.round_killhs ?? 0,
        kills: body.player.match_stats.kills - currentMatch.kills,
        assists: body.player.match_stats.assists - currentMatch.assists,
        score: body.player.match_stats.score - currentMatch.score,
        mvp: body.player.match_stats.mvps > currentMatch.mvps,
      };
      roundService.updateCurrentRound(roundInfo);
      matchService.updateCurrentMatch({
        deaths: currentMatch.deaths + 1,
      });

      gameEventEmitter.emit('game-event', 'you died', currentMatch.id);
    }

    // Player kill
    // This won't work with the other stuff apparently, could be cool to have update real time though - Lucasion
    // if (
    //   currentMatch &&
    //   currentRound &&
    //   body.player?.match_stats?.kills > currentMatch.kills &&
    //   body.player?.steamid === currentMatch.playerId &&
    //   body.map?.phase !== 'warmup'
    // ) {
    //   console.log('YOU KILLED');

    //   const roundInfo = {
    //     kills: body.player.match_stats.kills - currentMatch.kills,
    //     killshs: body.player.state.round_killhs ?? 0,
    //     assists: body.player.match_stats.assists - currentMatch.assists,
    //     score: body.player.match_stats.score - currentMatch.score,
    //     mvp: body.player.match_stats.mvps > currentMatch.mvps,
    //   };
    //   roundService.updateCurrentRound(roundInfo);

    //   matchService.updateCurrentMatch({
    //     kills: body.player.match_stats.kills,
    //     killshs: currentMatch.killshs + roundInfo.killshs,
    //     assists: body.player.match_stats.assists,
    //     score: body.player.match_stats.score,
    //     mvps: body.player.match_stats.mvps,
    //   });

    //   gameEventEmitter.emit('game-event', 'you killed', currentMatch.id);
    // }

    // Round end
    if (
      currentMatch &&
      currentRound &&
      body.previously?.round?.phase === 'over' &&
      body.round?.phase === 'freezetime' &&
      body.map?.round > 0 &&
      body.map?.phase !== 'warmup'
    ) {
      console.log('ROUND ENDED');

      const winString = body.map.round_wins
        ? body.map.round_wins[body.map.round.toString()]
        : `${body.round.win_team.toLowerCase()}_win`;

      const roundInfo = {
        kills: body.player.match_stats.kills - currentMatch.kills,
        killshs: currentRound.killshs,
        assists: body.player.match_stats.assists - currentMatch.assists,
        winner: winString.split('_')[0].toUpperCase(),
        winType: winString,
        score: body.player.match_stats.score - currentMatch.score,
        mvp: body.player.match_stats.mvps > currentMatch.mvps,
        duration:
          (new Date().getTime() -
            roundService.getCurrentRoundInitDate().getTime()) /
          1000,
      };

      // Add hs if the previous player was the main player
      if (
        !body.previously?.player?.steamid &&
        body.previously?.player?.state?.round_killhs
      ) {
        roundInfo.killshs = body.previously?.player?.state?.round_killhs;
      }

      roundService.updateCurrentRound(roundInfo);
      matchService.updateCurrentMatch({
        killshs: currentMatch.killshs + roundInfo.killshs,
        kills: body.player.match_stats.kills,
        assists: body.player.match_stats.assists,
        score: body.player.match_stats.score,
        mvps: body.player.match_stats.mvps,
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

      roundService.setNextRoundInitMoney(body.player.state.money);
    }

    // Match end and last round end
    if (
      currentMatch &&
      currentRound &&
      body.map?.phase === 'gameover' &&
      body.previously?.map?.phase === 'live'
    ) {
      console.log('ROUND ENDED');

      const winString = body.map.round_wins
        ? body.map.round_wins[body.map.round.toString()]
        : `${body.round.win_team.toLowerCase()}_win`;

      let roundStats = {};
      let matchStats = {};

      // Add stats if the current player is the main player
      if (body.player?.steamid === currentMatch.playerId) {
        const roundKillshs = body.player?.state?.round_killhs ?? 0;
        roundStats = {
          killshs: roundKillshs,
          kills: body.player.match_stats.kills - currentMatch.kills,
          assists: body.player.match_stats.assists - currentMatch.assists,
          score: body.player.match_stats.score - currentMatch.score,
          mvp: body.player.match_stats.mvps > currentMatch.mvps,
        };

        matchStats = {
          killshs: currentMatch.killshs + roundKillshs,
          kills: body.player.match_stats.kills,
          assists: body.player.match_stats.assists,
          score: body.player.match_stats.score,
          mvps: body.player.match_stats.mvps,
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
    if (currentMatch && body.previously?.map === true) {
      console.log('QUIT');
      gameEventEmitter.emit('game-event', 'quit', currentMatch.id);

      if (!currentMatch.over) {
        // matchService.deleteMatch(currentMatch.id);
        matchService.forceMatchEnd(currentMatch.id);
      }
    }

    /* if (body.player?.steamid !== matchService.getCurrentMatch()?.playerId) {
      console.log(body);
      console.log("Previously:");
      console.log(body.previously);
      console.log("Added:");
      console.log(body.added);
    } */

    res.sendStatus(200);
  });

  return gameEventEmitter;
};
