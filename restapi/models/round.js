const { Database } = require('sqlite3');
const path = require('path');

const dbFile = path.join(__dirname, '..', 'stats.db');

module.exports = {
  /**
   * @typedef {Object} Round
   * @property {string} id id of the round
   * @property {string} matchId id of the match
   * @property {number} n number of the round
   * @property {string} team team of the player
   * @property {number} equipValue value of the equipment
   * @property {number} initMoney money at the beginning of the round
   * @property {number} initArmor armor at the beginning of the round
   * @property {boolean} helmet whether the player has helmet on
   * @property {number} duration duration of the round in seconds
   * @property {string} winner winner team
   * @property {string} winType string indicating the result of the round
   * @property {boolean} died whether the player died
   * @property {number} kills number of kills
   * @property {number} killshs number of kills by headshot
   * @property {number} assists number of assists
   * @property {number} score score of the player
   * @property {boolean} mvp whether the player was the mvp
   */

  /**
   * Adds a round
   * @param {Round} round round to add
   */
  add(round) {
    const db = new Database(dbFile);
    db.serialize(() => {
      db.exec('PRAGMA foreign_keys = ON')
        .prepare(
          'INSERT INTO Rounds ' +
            '(id, match_id, n_round, team, equip_value, init_money, init_armor, helmet,' +
            'duration_seconds, winner, win_type, died, kills, killshs, assists, score, mvp)' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind([
          round.id,
          round.matchId,
          round.n,
          round.team,
          round.equipValue,
          round.initMoney,
          round.initArmor,
          round.helmet,
          round.duration,
          round.winner,
          round.winType,
          round.died,
          round.kills,
          round.killshs,
          round.assists,
          round.score,
          round.mvp,
        ])
        .run()
        .finalize();
    });
    db.close();
  },

  /**
   * Gets all the rounds of a match
   * @param {string} matchId id of the match
   * @return {Promise<Round[]>} promise that resolves to the list of rounds
   */
  getByMatch(matchId) {
    return new Promise((resolve, reject) => {
      const db = new Database(dbFile);
      db.prepare('SELECT * FROM ROUNDS WHERE match_id = ? ORDER BY n_round')
        .bind([matchId])
        .all((err, rows) => {
          db.close();
          if (err) reject(err);
          resolve(rows.map(this.rowToRound));
        })
        .finalize();
    });
  },

  /**
   * Gets a rounds of a match
   * @param {string} matchId id of the match
   * @param {number} n number of the round
   * @return {Promise<Round|null>} promise that resolves to a round
   * or null if there is no such round
   */
  getByMatchAndNumber(matchId, n) {
    return new Promise((resolve, reject) => {
      const db = new Database(dbFile);
      db.prepare('SELECT * FROM ROUNDS WHERE match_id = ? AND n_round = ?')
        .bind([matchId, n])
        .get((err, row) => {
          db.close();
          if (err) reject(err);
          resolve(row ? this.rowToRound(row) : null);
        })
        .finalize();
    });
  },

  /**
   * Maps a row to a round
   * @param {*} row row to map
   * @returns {Round} round object
   */
  rowToRound(row) {
    return {
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
    };
  },
};
