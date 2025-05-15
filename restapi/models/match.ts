import { Database } from 'sqlite3';
import { config } from './../config';

export interface Match {
  /** Id of the match */
  id: string;

  /** Id of the player */
  playerId: string;

  /** Name of the map */
  map: string;

  /** Name of the gamemode */
  mode: string;

  /** Date of the match */
  date: Date;

  /** Duration in seconds */
  duration: number;

  /** Number of rounds won */
  roundsWon: number;

  /** Number of rounds lost */
  roundsLost: number;

  /** Number of kills */
  kills: number;

  /** Number of headshot kills */
  killshs: number;

  /** Number of assists */
  assists: number;

  /** Number of deaths */
  deaths: number;

  /** Number of mvps won */
  mvps: number;

  /** Player score */
  score: number;

  /** Whether the match is over or not */
  over: boolean;
}

/**
 * Adds a match
 * @param match match to add
 * @returns promise that resolves when the match is added
 */
export function add(match: Match): Promise<void> {
  const db = new Database(config.dbFile);
  return new Promise((resolve, reject) => {
    const statement = db.prepare(
      'INSERT INTO Matches ' +
        '(id, player_id, map, mode, date, duration_seconds, rounds_won, rounds_lost, kills, killshs, deaths, assists, score, mvps, over) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    statement
      .bind([
        match.id,
        match.playerId,
        match.map,
        match.mode,
        match.date.toISOString(),
        match.duration,
        match.roundsWon,
        match.roundsLost,
        match.kills,
        match.killshs,
        match.deaths,
        match.assists,
        match.score,
        match.mvps,
        match.over,
      ])
      .run((err) => {
        statement.finalize();
        db.close();
        if (err) reject(err);
        resolve();
      });
  });
}

/**
 * Updates a match
 * @param match updated match
 * @returns promise that resolves when the update is done
 */
export function update(match: Match): Promise<void> {
  const db = new Database(config.dbFile);
  return new Promise((resolve, reject) => {
    const statement = db.prepare(
      'UPDATE Matches SET player_id = ?, map = ?, mode = ?, date = ?, duration_seconds = ?, rounds_won = ?, ' +
        'rounds_lost = ?, kills = ?, killshs = ?, deaths = ?, assists = ?, score = ?, mvps = ?, over = ? ' +
        'WHERE id = ?'
    );
    statement
      .bind([
        match.playerId,
        match.map,
        match.mode,
        match.date.toISOString(),
        match.duration,
        match.roundsWon,
        match.roundsLost,
        match.kills,
        match.killshs,
        match.deaths,
        match.assists,
        match.score,
        match.mvps,
        match.over,
        match.id,
      ])
      .run((err) => {
        statement.finalize();
        db.close();
        if (err) reject(err);
        resolve();
      });
  });
}

/**
 * Deletes a match
 * @param id id of the match
 */
export function deleteMatch(id: string): void {
  const db = new Database(config.dbFile);
  db.serialize(() => {
    db.exec('PRAGMA foreign_keys = ON')
      .prepare('DELETE FROM Matches WHERE id = ?')
      .bind([id])
      .run()
      .finalize();
  });
  db.close();
}

/**
 * Gets all the matches asynchronously, ordered by date
 * @return promise that resolves to the list of matches
 */
export function getAll(): Promise<Match[]> {
  return new Promise((resolve, reject) => {
    const db = new Database(config.dbFile);
    db.all('SELECT * FROM MATCHES ORDER BY date DESC', (err, rows) => {
      db.close();
      if (err) reject(err);
      resolve(rows.map(rowToMatch));
    });
  });
}

/**
 * Gets all matches for a specific game mode, ordered by date
 * @param mode the game mode to filter by
 * @return promise that resolves to the list of matches
 /**
 * Gets all the matches by mode asynchronously, ordered by date
 * @param mode game mode filter
 * @return promise that resolves to the list of matches
 */
export function getAllByMode(mode: string): Promise<Match[]> {
  return new Promise((resolve, reject) => {
    const db = new Database(config.dbFile);
    db.all('SELECT * FROM MATCHES WHERE mode = ? ORDER BY date DESC', [mode], (err, rows) => {
      db.close();
      if (err) reject(err);
      resolve(rows.map(rowToMatch));
    });
  });
}

/**
 * Gets a match by id asynchronously
 * @param {string} id id of the match
 * @return {Promise<Match|null>} promise that resolves to the match
 * or null if there is no such match
 */
export function get(id: string): Promise<Match | null> {
  return new Promise((resolve, reject) => {
    const db = new Database(config.dbFile);
    db.prepare('SELECT * FROM MATCHES WHERE id = ?')
      .bind([id])
      .get((err, row) => {
        db.close();
        if (err) reject(err);
        resolve(row ? rowToMatch(row) : null);
      })
      .finalize();
  });
}

/**
 * Maps a row to a match
 * @param row row to map
 * @returns match object
 */
function rowToMatch(row: any): Match {
  return {
    id: row.id,
    playerId: row.player_id,
    map: row.map,
    mode: row.mode,
    date: new Date(row.date),
    duration: row.duration_seconds,
    roundsWon: row.rounds_won,
    roundsLost: row.rounds_lost,
    kills: row.kills,
    killshs: row.killshs,
    deaths: row.deaths,
    assists: row.assists,
    score: row.score,
    mvps: row.mvps,
    over: row.over === 1,
  };
}
