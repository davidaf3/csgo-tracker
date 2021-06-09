const { Database } = require('sqlite3');
const { rowToMatch } = require('../util/mappers');

module.exports = {
  /**
   * @typedef {Object} Match
   * @property {string} id id of the match
   * @property {string} playerId id of the player
   * @property {string} map name of the map
   * @property {string} mode name of the gamemode
   * @property {Date} date date of the match
   * @property {number} duration duration in seconds
   * @property {number} roundsWon number of rounds won
   * @property {number} roundsLost number of rounds lost
   * @property {number} kills number of kills
   * @property {number} killshs number of kills by headshot
   * @property {number} assists number of assists
   * @property {number} deaths number of deaths
   * @property {number} mvps number of mvps won
   * @property {number} score score of the player
   */

  /**
   * Adds a match
   * @param {Match} match match to add
   */
  add: (match) => {
    const db = new Database('stats.db');
    db.prepare(
      'INSERT INTO Matches ' +
        '(id, player_id, map, mode, date, duration_seconds, rounds_won, rounds_lost, kills, killshs, deaths, assists, score, mvps)' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind([
        match.id,
        match.playerId,
        match.map,
        match.mode,
        match.date.toISOString(),
        match.duration,
        match.roundsWon,
        match.roundsLost,
        match.kills,
        match.killshs,
        match.deaths,
        match.assists,
        match.score,
        match.mvps,
      ])
      .run()
      .finalize();
    db.close();
  },

  /**
   * Updates a match
   * @param {Match} match updated match
   */
  update: (match) => {
    const db = new Database('stats.db');
    db.prepare(
      'UPDATE Matches SET player_id = ?, map = ?, mode = ?, date = ?, duration_seconds = ?, rounds_won = ?, ' +
        'rounds_lost = ?, kills = ?, killshs = ?, deaths = ?, assists = ?, score = ?, mvps = ?' +
        'WHERE id = ?'
    )
      .bind([
        match.playerId,
        match.map,
        match.mode,
        match.date.toISOString(),
        match.duration,
        match.roundsWon,
        match.roundsLost,
        match.kills,
        match.killshs,
        match.deaths,
        match.assists,
        match.score,
        match.mvps,
        match.id,
      ])
      .run()
      .finalize();
    db.close();
  },

  /**
   * Deletes a match
   * @param {string} id id of the match
   */
  delete: (id) => {
    const db = new Database('stats.db');
    db.serialize(() => {
      db.exec('PRAGMA foreign_keys = ON')
        .prepare('DELETE FROM Matches WHERE id = ?')
        .bind([id])
        .run()
        .finalize();
    });
    db.close();
  },

  /**
   * Gets all the matches asynchronously
   * @return {Promise<Match[]>} promise that resolves to the list of matches
   */
  getAll: () => {
    const db = new Database('stats.db');
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM MATCHES', (err, rows) => {
        db.close();
        if (err) reject(err);
        resolve(rows.map(rowToMatch));
      });
    });
  },

  /**
   * Gets a match by id asynchronously
   * @param {string} id id of the match
   * @return {Promise<Match|null>} promise that resolves to the match
   * or null if there is no such match
   */
  get: (id) => {
    const db = new Database('stats.db');
    return new Promise((resolve, reject) => {
      db.prepare('SELECT * FROM MATCHES WHERE id = ?')
        .bind([id])
        .get((err, row) => {
          db.close();
          if (err) reject(err);
          resolve(row ? rowToMatch(row) : null);
        })
        .finalize();
    });
  },
};
