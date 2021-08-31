module.exports = {
  /**
   * @typedef {Object} Stats
   * @property {number} kills total kills
   * @property {number} killshs total headshot kills
   * @property {number} assists total assists
   * @property {number} deaths total deaths
   * @property {number} kdr kill to death ratio
   * @property {number} hsRate headshot kill ratio
   * @property {number} maxKillsPerMatch max kills in a single match
   * @property {number} totalMatches total number of matches
   * @property {object} matchesByMap number of matches by map
   * @property {{
   *  victory: number,
   *  defeat: number,
   *  tie: number
   * }} matchesByResult total number of matches by result
   * @property {number} winRate match win rate
   * @property {number} totalDuration total number of seconds played
   * @property {number} avgMatchDuration average match duration in seconds
   * @property {number} avgScore average match score
   * @property {number} avgMvps average mvps per match
   * @property {number} totalRounds total number of rounds
   * @property {number} totalRoundsWon total number of rounds won
   * @property {number} totalRoundsLost total number of rounds lost
   * @property {number} roundWinRate round win rate
   * @property {number} pistolRoundsWon number of pistol rounds won
   * @property {number} pistolRoundsLost number of pistol rounds lost
   * @property {number} pistolRoundWinRate pistol round win rate
   * @property {number} mvpRounds number of rounds where the player was the mvp
   * @property {number} mvpRate mvp to round ratio
   * @property {{
   *  CT: number,
   *  T: number,
   * }} roundsByTeam number of rounds by team
   * @property {{
   *  ct_win_elimination: number,
   *  ct_win_defuse: number,
   *  ct_win_time: number,
   *  t_win_elimination: number,
   *  t_win_bomb: number
   * }} roundsByWinType number of rounds by win type
   * @property {number[]} roundsByKills number of rounds by enemies killed
   * @property {number} avgEquipValue average equipment value per round
   * @property {number} avgInitMoney average money at the start of a round
   * @property {number} avgRoundDuration average round duration in seconds
   * @property {number} avgRoundsPerMatch average number of rounds per match
   */

  /**
   * Initializes the module
   * @param {any} Matches matches model
   * @param {any} Rounds rounds model
   */
  init(Matches, Rounds) {
    this.Matches = Matches;
    this.Rounds = Rounds;
  },

  /**
   * Gets all the stats
   * @returns {Promise<Stats>} promise that resolves to an object containing the stats
   */
  getAllStats() {
    return this.computeStats(this.Matches.getAll(), this.Rounds.getAll());
  },

  /**
   * Computes stats from matches and rounds
   * @param {Promise<Object[]>} matchesPromise promise that resolves to a list of matches
   * @param {Promise<Object[]>} roundsPromise promise that resolves to a list of rounds
   * @returns {Promise<Stats>} promise that resolves to an object containing the stats
   */
  computeStats(matchesPromise, roundsPromise) {
    return new Promise((resolve, reject) => {
      Promise.all([
        matchesPromise.then(this.computeStatsFromMatches),
        roundsPromise.then(this.computeStatsFromRounds),
      ])
        .then(([matchesStats, roundsStats]) => {
          resolve({
            ...matchesStats,
            ...roundsStats,
            avgRoundsPerMatch:
              matchesStats.totalMatches > 0
                ? roundsStats.totalRounds / matchesStats.totalMatches
                : 0,
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  /**
   * Computes stats from a list of matches
   * @param {Object[]} matches list of matches
   * @return {Object} stats computed
   */
  computeStatsFromMatches(matches) {
    let totalScore = 0;
    let totalMvps = 0;
    const matchesStats = {
      kills: 0,
      killshs: 0,
      assists: 0,
      deaths: 0,
      maxKillsPerMatch: 0,
      totalMatches: 0,
      matchesByResult: {
        victory: 0,
        defeat: 0,
        tie: 0,
      },
      matchesByMap: {},
      totalDuration: 0,
      winRate: 0,
      avgMatchDuration: 0,
      avgScore: 0,
      avgMvps: 0,
    };

    matches.forEach((match) => {
      matchesStats.kills += match.kills;
      matchesStats.killshs += match.killshs;
      matchesStats.assists += match.assists;
      matchesStats.deaths += match.deaths;

      if (match.kills > matchesStats.maxKillsPerMatch) {
        matchesStats.maxKillsPerMatch = match.kills;
      }

      if (!matchesStats.matchesByMap[match.map]) {
        matchesStats.matchesByMap[match.map] = 1;
      } else matchesStats.matchesByMap[match.map] += 1;

      matchesStats.totalMatches += 1;
      if (match.roundsWon > match.roundsLost) {
        matchesStats.matchesByResult.victory += 1;
      }
      if (match.roundsWon < match.roundsLost) {
        matchesStats.matchesByResult.defeat += 1;
      }
      if (match.roundsWon === match.roundsLost) {
        matchesStats.matchesByResult.tie += 1;
      }

      totalScore += match.score;
      totalMvps += match.mvps;
      matchesStats.totalDuration += match.duration;
    });

    if (matchesStats.totalMatches > 0) {
      matchesStats.winRate =
        matchesStats.matchesByResult.victory / matchesStats.totalMatches;
      matchesStats.avgMatchDuration =
        matchesStats.totalDuration / matchesStats.totalMatches;
      matchesStats.avgScore = totalScore / matchesStats.totalMatches;
      matchesStats.avgMvps = totalMvps / matchesStats.totalMatches;
    }

    return {
      ...matchesStats,
      kdr:
        matchesStats.kills /
        (matchesStats.deaths > 0 ? matchesStats.deaths : 1),
      hsRate:
        matchesStats.kills > 0 ? matchesStats.killshs / matchesStats.kills : 0,
    };
  },

  /**
   * Computes stats from a list of rounds
   * @param {Object[]} rounds list of rounds
   * @return {Object} stats computed
   */
  computeStatsFromRounds(rounds) {
    const roundsStats = {
      totalRounds: 0,
      totalRoundsWon: 0,
      totalRoundsLost: 0,
      roundWinRate: 0,
      pistolRoundsWon: 0,
      pistolRoundsLost: 0,
      pistolRoundWinRate: 0,
      mvpRounds: 0,
      mvpRate: 0,
      roundsByTeam: {
        CT: 0,
        T: 0,
      },
      roundsByWinType: {
        ct_win_elimination: 0,
        ct_win_defuse: 0,
        ct_win_time: 0,
        t_win_elimination: 0,
        t_win_bomb: 0,
      },
      roundsByKills: [0, 0, 0, 0, 0, 0],
      avgEquipValue: 0,
      avgInitMoney: 0,
      avgRoundDuration: 0,
    };
    let totalEquipValue = 0;
    let totalInitMoney = 0;
    let totalRoundDuration = 0;

    rounds.forEach((round) => {
      roundsStats.totalRounds += 1;

      if (round.winner === round.team) {
        roundsStats.totalRoundsWon += 1;
        if (round.n === 1 || round.n === 16) roundsStats.pistolRoundsWon += 1;
      } else {
        roundsStats.totalRoundsLost += 1;
        if (round.n === 1 || round.n === 16) roundsStats.pistolRoundsLost += 1;
      }

      if (round.mvp) roundsStats.mvpRounds += 1;

      roundsStats.roundsByTeam[round.team] += 1;
      roundsStats.roundsByWinType[round.winType] += 1;

      totalEquipValue += round.equipValue;
      totalInitMoney += round.initMoney;
      totalRoundDuration += round.duration;
      roundsStats.roundsByKills[round.kills] += 1;
    });

    if (roundsStats.totalRounds > 0) {
      roundsStats.roundWinRate =
        roundsStats.totalRoundsWon / roundsStats.totalRounds;
      roundsStats.mvpRate = roundsStats.mvpRounds / roundsStats.totalRounds;
      roundsStats.avgEquipValue = totalEquipValue / roundsStats.totalRounds;
      roundsStats.avgInitMoney = totalInitMoney / roundsStats.totalRounds;
      roundsStats.avgRoundDuration =
        totalRoundDuration / roundsStats.totalRounds;
    }

    return {
      ...roundsStats,
      pistolRoundWinRate:
        roundsStats.pistolRoundsLost + roundsStats.pistolRoundsWon > 0
          ? roundsStats.pistolRoundsWon /
            (roundsStats.pistolRoundsWon + roundsStats.pistolRoundsLost)
          : 0,
    };
  },
};
