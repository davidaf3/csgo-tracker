module.exports = {
  /**
   * Maps a row to a match
   * @param {*} row row to map
   * @returns {*} match object
   */
  rowToMatch: (row) => ({
    id: row.id,
    playerId: row.player_id,
    map: row.map,
    mode: row.mode,
    date: new Date(row.date),
    duration: row.duration_seconds,
    roundsWon: row.rounds_won,
    roundsLost: row.rounds_lost,
    kills: row.kills,
    killshs: row.killshs,
    deaths: row.deaths,
    assists: row.assists,
    score: row.score,
    mvps: row.mvps,
  }),

  /**
   * Maps a row to a round
   * @param {*} row row to map
   * @returns {*} round object
   */
  rowToRound: (row) => ({
    id: row.id,
    matchId: row.match_id,
    n: row.n_round,
    team: row.team,
    equipValue: row.equip_value,
    initMoney: row.init_money,
    initArmor: row.init_armor,
    helmet: row.helmet === 1,
    duration: row.duration_seconds,
    winner: row.winner,
    winType: row.win_type,
    died: row.died === 1,
    kills: row.kills,
    killshs: row.killshs,
    assists: row.assists,
    score: row.score,
    mvp: row.mvp === 1,
  }),
};
