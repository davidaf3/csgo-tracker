import { randomUUID } from 'crypto';
import * as Rounds from '../models/round';

export type RoundState = Omit<Rounds.Round, 'id' | 'initMoney'>;

let currentRound: Rounds.Round | null;
let currentRoundInitDate: Date;
let nextRoundInitMoney: number | null;

/**
 * @returns date at the start of the current round
 */
export function getCurrentRoundInitDate(): Date {
  return currentRoundInitDate;
}

/**
 * Creates a round
 * @param round round info
 * @returns id of the new round
 */
export function createRound(round: RoundState): string {
  currentRoundInitDate = new Date();
  const id = randomUUID();
  currentRound = {
    id,
    initMoney: nextRoundInitMoney ?? 800,
    ...round,
  };
  return id;
}

/**
 * Closes the current round
 */
export function closeCurrentRound(): void {
  currentRound = null;
  nextRoundInitMoney = null;
}

/**
 * Sets the initial money for the next round
 * @param money initial money for the next round
 */
export function setNextRoundInitMoney(money: number) {
  nextRoundInitMoney = money;
}

/**
 * Returns the current round
 * @returns current round info
 */
export function getCurrentRound(): RoundState | null {
  return currentRound;
}

/**
 * Updates de current round
 * @param updatedRound updated round info
 */
export function updateCurrentRound(updatedRound: Partial<RoundState>): void {
  if (currentRound) {
    currentRound = {
      ...currentRound,
      ...updatedRound,
    };
  }
}

/**
 * Saves the current round
 * @returns promise that resolves when the round is saved
 */
export function saveCurrentRound(): Promise<void> {
  if (currentRound) return Rounds.add(currentRound);
  return new Promise((resolve) => resolve());
}

/**
 * Finds all finished rounds of a match, ordered by round number
 * @param matchId id of the match
 * @returns list of rounds of the match
 */
export async function findByMatch(matchId: string): Promise<Rounds.Round[]> {
  return Rounds.getByMatch(matchId);
}

/**
 * Finds a finished round of a match
 * @param matchId id of the match
 * @param n number of the round
 * @returns the round or null if there was no such round
 */
export async function findByMatchAndNumber(
  matchId: string,
  n: string
): Promise<Rounds.Round | null> {
  return Rounds.getByMatchAndNumber(matchId, n);
}
