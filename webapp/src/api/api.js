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
 * @property {boolean} over wheter the match is over or not
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
 * Gets a match
 * @param {string} id match id
 * @return {Promise<Match|null>} match
 */
export async function getMatch(id) {
  try {
    const response = await fetch(`http://localhost:8090/match/${id}`, {
      method: 'GET',
    });
    return await response.json();
  } catch (err) {
    return null;
  }
}

/**
 * Deletes a match
 * @param {string} id match id
 */
export function deleteMatch(id) {
  fetch(`http://localhost:8090/match/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Forces a match to end
 * @param {string} id match id
 * @return {Promise<Match|null>} finished match or null if
 * no such match was found
 */
export async function forceMatchEnd(id) {
  try {
    const response = await fetch(`http://localhost:8090/match/${id}/forceEnd`, {
      method: 'POST',
    });
    return await response.json();
  } catch (err) {
    return null;
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
 * @typedef {Object} Stats
 * @property {number} kills total kills
 * @property {number} killshs total headshot kills
 * @property {number} assists total assists
 * @property {number} deaths total deaths
 * @property {number} kdr kill to death ratio
 * @property {number} hsRate headshot kill ratio
 * @property {number} maxKillsPerMatch max kills in a single match
 * @property {number} avgKillsPerMatch average kills per match
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
 * Gets all the stats
 * @return {Promise<Stats>} object containing the stats
 */
export async function getAllStats() {
  try {
    const response = await fetch('http://localhost:8090/stats', {
      method: 'GET',
    });
    return await response.json();
  } catch (err) {
    return null;
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
