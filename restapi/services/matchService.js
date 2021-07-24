/* eslint-disable import/extensions */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  /**
   * Initializes the module
   * @param {any} Matches matches model
   */
  init(Matches) {
    this.Matches = Matches;
  },

  /**
   * Creates a match
   * @param {{
   *    playerId: string,
   *    map: string,
   *    mode: string,
   *    duration: number,
   *    over: boolean,
   *    roundsWon: number,
   *    roundsLost: number,
   *    kills: number,
   *    killshs: number,
   *    assists: number,
   *    deaths: number,
   *    mvps: number,
   *    score: number,
   * }} match match info
   */
  createMatch(match) {
    this.currentMatch = {
      id: uuidv4(),
      date: new Date(),
      ...match,
    };
    this.Matches.add(this.currentMatch);
  },

  /**
   * Returns the current match
   * @returns {Matches.Match} current match info
   */
  getCurrentMatch() {
    return this.currentMatch;
  },

  /**
   * Updates de current match
   * @param {{
   *    playerId?: string,
   *    map?: string,
   *    mode?: string,
   *    date?: Date,
   *    duration?: number,
   *    over?: boolean,
   *    roundsWon?: number,
   *    roundsLost?: number,
   *    kills?: number,
   *    killshs?: number,
   *    assists?: number,
   *    deaths?: number,
   *    mvps?: number,
   *    score?: number,
   * }} updatedMatch updated match info
   */
  updateCurrentMatch(updatedMatch) {
    this.currentMatch = {
      ...this.currentMatch,
      ...updatedMatch,
    };
  },

  /**
   * Saves the current match
   */
  saveCurrentMatch() {
    this.Matches.update(this.currentMatch);
  },

  /**
   * Closes the current match
   */
  closeCurrentMatch() {
    this.currentMatch = null;
  },

  /**
   * Deletes a match by id
   * @param {string} id match id
   */
  deleteMatch(id) {
    this.Matches.delete(id);
  },

  /**
   * Finds all matches asynchronously
   * @return {Promise<Matches.Match[]>} promise that resolves to the list of matches
   */
  findAll() {
    return this.Matches.getAll();
  },

  /**
   * Finds a match by id
   * @param {string} id match id
   * @return {Promise<Matches.Match|null>} promise that resolves to the match
   * or null if there is no such match
   */
  findById(id) {
    return this.Matches.get(id);
  },
};
