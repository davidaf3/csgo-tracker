const { v4: uuidv4 } = require('uuid');
const Rounds = require('../models/round');

module.exports = {
  /**
   * Creates a round
   * @param {{
   *    matchId: string,
   *    n: number,
   *    team: string,
   *    died: boolean,
   *    equipValue: number,
   *    initArmor: number,
   *    helmet: boolean,
   * }} round round info
   */
  createRound: (round) => {
    this.currentRound = {
      id: uuidv4(),
      initMoney: this.nextRoundInitMoney ?? 800,
      initDate: new Date(),
      ...round,
    };
  },

  /**
   * Sets the initial money for the next round
   * @param {number} money initial money for the next round
   */
  setNextRoundInitMoney: (money) => {
    this.nextRoundInitMoney = money;
  },

  /**
   * Returns the current round
   * @returns {{
   *    id: string,
   *    matchId: string,
   *    n: number,
   *    team: string,
   *    died: boolean,
   *    equipValue: number,
   *    initMoney: number,
   *    initArmor: number,
   *    helmet: boolean,
   *    initDate: Date,
   *    duration?: number,
   *    winner?: string,
   *    winType?: string,
   *    kills?: number,
   *    killshs?: number,
   *    assists?: number,
   *    score?: number,
   *    mvp?: boolean,
   * }} current round info
   */
  getCurrentRound: () => this.currentRound,

  /**
   * Updates de current round
   * @param {{
   *    id?: string,
   *    matchId?: string,
   *    n?: number,
   *    team?: string,
   *    died?: boolean,
   *    equipValue?: number,
   *    initMoney?: number,
   *    initArmor?: number,
   *    helmet?: boolean,
   *    initDate?: Date,
   *    duration?: number,
   *    winner?: string,
   *    winType?: string,
   *    kills?: number,
   *    killshs?: number,
   *    assists?: number,
   *    score?: number,
   *    mvp?: boolean,
   * }} updatedRound updated round info
   */
  updateCurrentRound: (updatedRound) => {
    this.currentRound = {
      ...this.currentRound,
      ...updatedRound,
    };
  },

  /**
   * Saves the current round
   */
  saveCurrentRound: () => {
    Rounds.add(this.currentRound);
  },

  /**
   * Finds all rounds of a match
   * @param {string} matchId id of the match
   * @returns {Promise<Rounds.Round[]>} list of rounds of the match
   */
  findByMatch: (matchId) => Rounds.getByMatch(matchId),
};
