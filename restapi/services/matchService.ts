import * as Matches from '../models/match';
import { v4 as uuidv4 } from 'uuid';

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
  if (currentMatch && id === currentMatch.id)
    return currentMatch;
  return await Matches.get(id);
}
