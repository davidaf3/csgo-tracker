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
};
