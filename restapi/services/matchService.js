/* eslint-disable import/extensions */
const { v4: uuidv4 } = require('uuid');
const Matches = require('../models/match');

module.exports = {
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
  createMatch: (match) => {
    this.currentMatch = {
      id: uuidv4(),
      date: new Date(),
      ...match,
    };
    Matches.add(this.currentMatch);
  },

  /**
   * Returns the current match
   * @returns {{
   *    id: string,
   *    playerId: string,
   *    map: string,
   *    mode: string,
   *    date: Date,
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
   * }} current match info
   */
  getCurrentMatch: () => this.currentMatch,

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
  updateCurrentMatch: (updatedMatch) => {
    this.currentMatch = {
      ...this.currentMatch,
      ...updatedMatch,
    };
  },

  /**
   * Saves the current match
   */
  saveCurrentMatch: () => {
    Matches.update(this.currentMatch);
  },

  /**
   * Deletes a match by id
   * @param {string} id match id
   */
  deleteMatch: (id) => {
    Matches.delete(id);
  },
};
