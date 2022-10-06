import * as Rounds from '../models/round';
import { v4 as uuidv4 } from 'uuid';

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
  const id = uuidv4();
  currentRound = {
    id,
    initMoney: nextRoundInitMoney ?? 800,
    ...round,
  };
  return id;
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
 * Finds all rounds of a match, ordered by round number
 * @param matchId id of the match
 * @returns list of rounds of the match
 */
export async function findByMatch(matchId: string): Promise<Rounds.Round[]> {
  const rounds = await Rounds.getByMatch(matchId);
  if (currentRound && matchId === currentRound.matchId)
    rounds[currentRound.n - 1] = currentRound;
  return rounds;
}

/**
 * Finds a round of a match
 * @param matchId id of the match
 * @param n number of the round
 * @returns the round or null if there was no such round
 */
export async function findByMatchAndNumber(
  matchId: string,
  n: string
): Promise<Rounds.Round | null> {
  if (
    currentRound &&
    matchId === currentRound.matchId &&
    Number(n) === currentRound.n
  )
    return currentRound;
  return await Rounds.getByMatchAndNumber(matchId, n);
}
