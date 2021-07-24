module.exports = (app, matchService, roundService) => {
  app.post('/game', (req, res) => {
    // Match start
    if (
      !matchService.getCurrentMatch() &&
      req.body.added?.player?.match_stats &&
      req.body.map.mode === 'competitive'
    ) {
      console.log('MATCH STARTED');
      matchService.createMatch({
        playerId: req.body.player.steamid,
        map: req.body.map.name,
        mode: req.body.map.mode,
        duration: 0,
        over: false,
        roundsWon: 0,
        roundsLost: 0,
        killshs: 0,
        ...req.body.player.match_stats,
      });
      roundService.setNextRoundInitMoney(800);
    }

    // Round start
    if (
      matchService.getCurrentMatch() &&
      req.body.previously?.round?.phase === 'freezetime' &&
      req.body.round?.phase === 'live' &&
      req.body.map?.phase !== 'warmup'
    ) {
      console.log('ROUND STARTED');
      const round = {
        matchId: matchService.getCurrentMatch().id,
        n: req.body.map.round + 1,
        team: req.body.player.team,
        died: false,
        equipValue: req.body.player.state.equip_value,
        initArmor: req.body.player.state.armor,
        helmet: req.body.player.state.helmet,
        killshs: 0,
      };
      roundService.createRound(round);
    }

    // Player death
    if (
      matchService.getCurrentMatch() &&
      roundService.getCurrentRound() &&
      req.body.player?.state?.health === 0 &&
      req.body.previously?.player?.state?.health > 0 &&
      req.body.player?.steamid === matchService.getCurrentMatch()?.playerId &&
      req.body.map?.phase !== 'warmup'
    ) {
      console.log('YOU DIED');
      const roundInfo = {
        died: true,
        // TODO check if I need to add saved headshots
        killshs:
          (req.body.player.state.round_killhs ?? 0) +
          (roundService.getCurrentRound().killshs ?? 0),
        kills:
          req.body.player.match_stats.kills -
          matchService.getCurrentMatch().kills,
        assists:
          req.body.player.match_stats.assists -
          matchService.getCurrentMatch().assists,
        score:
          req.body.player.match_stats.score -
          matchService.getCurrentMatch().score,
        mvp:
          req.body.player.match_stats.mvps >
          matchService.getCurrentMatch().mvps,
      };
      roundService.updateCurrentRound(roundInfo);
      matchService.updateCurrentMatch({
        deaths: matchService.getCurrentMatch().deaths + 1,
      });
    }

    // Round end
    if (
      matchService.getCurrentMatch() &&
      roundService.getCurrentRound() &&
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
        kills:
          req.body.player.match_stats.kills -
          matchService.getCurrentMatch().kills,
        assists:
          req.body.player.match_stats.assists -
          matchService.getCurrentMatch().assists,
        winner: winString.split('_')[0].toUpperCase(),
        winType: winString,
        score:
          req.body.player.match_stats.score -
          matchService.getCurrentMatch().score,
        mvp:
          req.body.player.match_stats.mvps >
          matchService.getCurrentMatch().mvps,
        duration:
          (new Date().getTime() -
            roundService.getCurrentRound().initDate.getTime()) /
          1000,
      };

      // Add hs if the previous player was the main player
      // TODO check if hs are added twice (if the player dies but the steamid does not change)
      if (
        !req.body.previously?.player?.steamid &&
        req.body.previously?.player?.state?.round_killhs
      ) {
        roundInfo.killshs = req.body.previously?.player?.state?.round_killhs;
      }

      roundService.updateCurrentRound(roundInfo);
      roundService.saveCurrentRound();

      matchService.updateCurrentMatch({
        killshs:
          matchService.getCurrentMatch().killshs +
          (roundService.getCurrentRound().killshs ?? 0),
        kills: req.body.player.match_stats.kills,
        assists: req.body.player.match_stats.assists,
        score: req.body.player.match_stats.score,
        mvps: req.body.player.match_stats.mvps,
        roundsWon:
          matchService.getCurrentMatch().roundsWon +
          (roundInfo.winner === roundService.getCurrentRound().team ? 1 : 0),
        roundsLost:
          matchService.getCurrentMatch().roundsLost +
          (roundInfo.winner !== roundService.getCurrentRound().team ? 1 : 0),
      });

      roundService.setNextRoundInitMoney(req.body.player.state.money);
    }

    // Match end and last round end
    if (
      matchService.getCurrentMatch() &&
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
      if (
        req.body.player?.steamid === matchService.getCurrentMatch().playerId
      ) {
        roundStats = {
          killshs: req.body.player?.state?.round_killhs ?? 0,
          kills:
            req.body.player.match_stats.kills -
            matchService.getCurrentMatch().kills,
          assists:
            req.body.player.match_stats.assists -
            matchService.getCurrentMatch().assists,
          score:
            req.body.player.match_stats.score -
            matchService.getCurrentMatch().score,
          mvp:
            req.body.player.match_stats.mvps >
            matchService.getCurrentMatch().mvps,
        };

        matchStats = {
          // TODO check if hs are added twice (if the player dies but the steamid does not change)
          killshs: matchService.getCurrentMatch().killshs + roundStats.killshs,
          kills: req.body.player.match_stats.kills,
          assists: req.body.player.match_stats.assists,
          score: req.body.player.match_stats.score,
          mvps: req.body.player.match_stats.mvps,
        };
      } else {
        // If the player died, update the match with the round info stored when he died
        matchStats = {
          killshs:
            matchService.getCurrentMatch().killshs +
            (roundService.getCurrentRound().killshs ?? 0),
          kills:
            matchService.getCurrentMatch().kills +
            (roundService.getCurrentRound().kills ?? 0),
          assists:
            matchService.getCurrentMatch().assists +
            (roundService.getCurrentRound().assists ?? 0),
          score:
            matchService.getCurrentMatch().score +
            (roundService.getCurrentRound().score ?? 0),
          mvps:
            matchService.getCurrentMatch().mvps +
            (roundService.getCurrentRound().mvp ? 1 : 0),
        };
      }

      const roundInfo = {
        ...roundStats,
        winner: winString.split('_')[0].toUpperCase(),
        winType: winString,
        duration:
          (new Date().getTime() -
            roundService.getCurrentRound().initDate.getTime()) /
          1000,
      };

      matchService.updateCurrentMatch({
        ...matchStats,
        roundsWon:
          matchService.getCurrentMatch().roundsWon +
          (roundInfo.winner === roundService.getCurrentRound().team ? 1 : 0),
        roundsLost:
          matchService.getCurrentMatch().roundsLost +
          (roundInfo.winner !== roundService.getCurrentRound().team ? 1 : 0),
        over: true,
        duration:
          (new Date().getTime() -
            matchService.getCurrentMatch().date.getTime()) /
          1000,
      });
      roundService.updateCurrentRound(roundInfo);
      roundService.saveCurrentRound();

      console.log('MATCH OVER');
      matchService.saveCurrentMatch();
      matchService.closeCurrentMatch();
    }

    // Match quit
    if (matchService.getCurrentMatch() && req.body.previously?.map === true) {
      console.log('QUIT');
      if (!matchService.getCurrentMatch().over) {
        matchService.deleteMatch(matchService.getCurrentMatch().id);
        matchService.closeCurrentMatch();
      }
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
};
