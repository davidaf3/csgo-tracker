import * as Matches from '../models/match';
import { v4 as uuidv4 } from 'uuid';
import { findByMatch, RoundState } from './roundService';

export type MatchState = Omit<Matches.Match, 'id' | 'date'>;

let currentMatch: Matches.Match | null;

/**
 * Creates a match
 * @param  match match info
 * @returns promise that resolves to the new match id when the match is created
 */
export async function createMatch(match: MatchState): Promise<string> {
  const id = uuidv4();
  currentMatch = {
    id,
    date: new Date(),
    ...match,
  };
  await Matches.add(currentMatch);
  return id;
}

/**
 * Returns the current match
 * @returns current match info
 */
export function getCurrentMatch(): Matches.Match | null {
  return currentMatch;
}

/**
 * Updates de current match
 * @param updatedMatch updated match info
 */
export function updateCurrentMatch(updatedMatch: Partial<MatchState>) {
  if (currentMatch) {
    currentMatch = {
      ...currentMatch,
      ...updatedMatch,
    };
  }
}

/**
 * Saves the current match
 * @returns promise that resolves when the match is saved
 */
export function saveCurrentMatch(): Promise<void> {
  if (currentMatch) return Matches.update(currentMatch);
  return new Promise((resolve) => resolve());
}

/**
 * Closes the current match
 */
export function closeCurrentMatch(): void {
  currentMatch = null;
}

/**
 * Deletes a match by id
 * @param id match id
 */
export function deleteMatch(id: string): void {
  Matches.deleteMatch(id);
  if (id === currentMatch?.id) closeCurrentMatch();
}

/**
 * Forces a match to end
 * @param id match id
 * @return promise that resolves to the finished match or to
 * null if the match was not found
 */
export async function forceMatchEnd(id: string): Promise<Matches.Match | null> {
  const match = await findById(id);
  if (!match || match.over) return match;

  const rounds = await findByMatch(id);
  if (rounds.length > match.roundsLost + match.roundsWon) {
    addRound(match, rounds[rounds.length - 1]);
  }

  match.over = true;
  if (match.id === currentMatch?.id) closeCurrentMatch();
  Matches.update(match);
  return match;
}

/**
 * Adds a round to a match
 * @param match match
 * @param round round state to add
 */
function addRound(match: Matches.Match, round: RoundState): void {
  match.kills += round.kills;
  match.killshs += round.killshs;
  match.assists += round.assists;
  match.score += round.score;
  match.mvps += round.mvp ? 1 : 0;
  match.roundsWon += round.winner === round.team ? 1 : 0;
  match.roundsLost += round.winner !== round.team ? 1 : 0;
  match.duration += round.duration;
}

/**
 * Finds all matches asynchronously, ordered by date
 * @return promise that resolves to the list of matches
 */
export function findAll(): Promise<Matches.Match[]> {
  return Matches.getAll();
}

/**
 * Finds a match by id
 * @param {string} id match id
 * @return {Promise<Matches.Match|null>} promise that resolves to the match
 * or null if there is no such match
 */
export async function findById(id: string): Promise<Matches.Match | null> {
  if (currentMatch && id === currentMatch.id) return currentMatch;
  return await Matches.get(id);
}
