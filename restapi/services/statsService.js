module.exports = {
  /**
   * @typedef {Object} Stats
   * @property {number} kills total kills
   * @property {number} deaths total deaths
   * @property {number} kdr kill to death ratio
   * @property {number} totalMatches total number of matches
   * @property {number} victories total number of victories
   * @property {number} defeats total number of defeats
   * @property {number} ties total number of ties
   * @property {number} winRate match win rate
   * @property {number} totalRounds total number of rounds
   * @property {number} avgEquipValue average equipment value per round
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
   * Gets all the stats available
   * @returns {Promise<Stats>} promise that resolves to an object containing the stats
   */
  getAllStats() {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.Matches.getAll().then(this.computeStatsFromMatches),
        this.Rounds.getAll().then(this.computeStatsFromRounds),
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
    const matchesStats = {
      kills: 0,
      deaths: 0,
      totalMatches: 0,
      victories: 0,
      defeats: 0,
      ties: 0,
    };

    matches.forEach((match) => {
      matchesStats.kills += match.kills;
      matchesStats.deaths += match.deaths;

      matchesStats.totalMatches += 1;
      if (match.roundsWon > match.roundsLost) matchesStats.victories += 1;
      if (match.roundsWon < match.roundsLost) matchesStats.defeats += 1;
      if (match.roundsWon === match.roundsLost) matchesStats.ties += 1;
    });

    return {
      ...matchesStats,
      kdr:
        matchesStats.kills /
        (matchesStats.deaths > 0 ? matchesStats.deaths : 1),
      winRate:
        matchesStats.totalMatches > 0
          ? matchesStats.victories / matchesStats.totalMatches
          : 0,
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
    };
    let totalEquipValue = 0;

    rounds.forEach((round) => {
      roundsStats.totalRounds += 1;
      totalEquipValue += round.equipValue;
    });

    return {
      ...roundsStats,
      avgEquipValue:
        roundsStats.totalRounds > 0
          ? totalEquipValue / roundsStats.totalRounds
          : 0,
    };
  },
};
