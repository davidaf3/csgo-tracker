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
 * Gets all the matches
 * @return {Promise<Match[]>} match list
 */
export async function getMatches() {
  try {
    const response = await fetch('http://localhost:8090/match', {
      method: 'GET',
    });
    return await response.json();
  } catch (err) {
    return [];
  }
}

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
 * Gets all the rounds of a match
 * @param {string} matchId id of the match
 * @returns {Promise<Round[]>} list of rounds
 */
export async function getRounds(matchId) {
  try {
    const response = await fetch(
      `http://localhost:8090/match/${matchId}/round`,
      {
        method: 'GET',
      }
    );
    return await response.json();
  } catch (err) {
    return [];
  }
}

/**
 * Gets info about a player
 * @param {string} steamId id of the player
 * @returns {Object} info about the player
 */
export async function getPlayerInfo(steamId) {
  try {
    const response = await fetch(`http://localhost:8090/player/${steamId}`, {
      method: 'GET',
    });
    return await response.json();
  } catch (err) {
    return {};
  }
}
