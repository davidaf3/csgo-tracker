import { Stats } from './services/statsService';

let statsCache = new Map<string, Stats>();

/**
 * Adds a stats object to the cache
 * @param key key identifying the stats object
 * @param stats stats object
 */
export function set(key: string, stats: Stats) {
  statsCache.set(key, stats);
}

/**
 * Retrieves a stats object from the cache
 * @param key key identifying the stats object
 * @returns stats object or undefined if it cant be found
 */
export function get(key: string): Stats | undefined {
  return statsCache.get(key);
}

/**
 * Checks if the caches has a key
 * @param key key identifying a stats object
 * @returns true if the caches has the key, false if not
 */
export function has(key: string): boolean {
    return statsCache.has(key);
}

/**
 * Invalidates the hole cache
 */
export function invalidate() {
  statsCache.clear();
}
