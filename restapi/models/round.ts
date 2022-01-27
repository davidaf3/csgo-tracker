import { Database } from 'sqlite3';

export interface Round {
  /** Id of the round */
  id: string;

  /** Id of the match */
  matchId: string;

  /** Round number */
  n: number;

  /** Player's team */
  team: string;

  /** Equipment value */
  equipValue: number;

  /** Amount of money at the beginning of the round */
  initMoney: number;

  /** Armor at the beginning of the round */
  initArmor: number;

  /** Whether the player has helmet on */
  helmet: boolean;

  /** Duration of the round in seconds */
  duration: number;

  /** Winner team */
  winner: string;

  /** String indicating how the round ended */
  winType: string;

  /** Whether the player died */
  died: boolean;

  /** Number of kills */
  kills: number;

  /** Number of headshot kills */
  killshs: number;

  /** Number of assists */
  assists: number;

  /** Player score */
  score: number;

  /** Whether the player was the mvp */
  mvp: boolean;
}

let dbFile: string;

/**
 * Initializes the module
 * @param dbFile path to the database file
 */
export function init(newDbFile: string) {
  dbFile = newDbFile;
}

/**
 * Adds a round
 * @param round round to add
 * @returns promise that resolves when the round is added
 */
export function add(round: Round): Promise<void> {
  const db = new Database(dbFile);
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.exec('PRAGMA foreign_keys = ON');
      const statement = db.prepare(
        'INSERT INTO Rounds ' +
          '(id, match_id, n_round, team, equip_value, init_money, init_armor, helmet,' +
          'duration_seconds, winner, win_type, died, kills, killshs, assists, score, mvp)' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      statement
        .bind([
          round.id,
          round.matchId,
          round.n,
          round.team,
          round.equipValue,
          round.initMoney,
          round.initArmor,
          round.helmet,
          round.duration,
          round.winner,
          round.winType,
          round.died,
          round.kills,
          round.killshs,
          round.assists,
          round.score,
          round.mvp,
        ])
        .run((err) => {
          statement.finalize();
          db.close();
          if (err) reject(err);
          resolve();
        });
    });
  });
}

/**
 * Gets all the rounds asynchronously
 * @return promise that resolves to the list of rounds
 */
export function getAll(): Promise<Round[]> {
  return new Promise((resolve, reject) => {
    const db = new Database(dbFile);
    db.all('SELECT * FROM ROUNDS', (err, rows) => {
      db.close();
      if (err) reject(err);
      resolve(rows.map(rowToRound));
    });
  });
}

/**
 * Gets all the rounds of a match
 * @param matchId id of the match
 * @return promise that resolves to the list of rounds
 */
export function getByMatch(matchId: string): Promise<Round[]> {
  return new Promise((resolve, reject) => {
    const db = new Database(dbFile);
    db.prepare('SELECT * FROM ROUNDS WHERE match_id = ? ORDER BY n_round')
      .bind([matchId])
      .all((err, rows) => {
        db.close();
        if (err) reject(err);
        resolve(rows.map(rowToRound));
      })
      .finalize();
  });
}

/**
 * Gets a rounds of a match
 * @param matchId id of the match
 * @param number of the round
 * @return promise that resolves to a round or null if there is no such round
 */
export function getByMatchAndNumber(
  matchId: string,
  n: number
): Promise<Round | null> {
  return new Promise((resolve, reject) => {
    const db = new Database(dbFile);
    db.prepare('SELECT * FROM ROUNDS WHERE match_id = ? AND n_round = ?')
      .bind([matchId, n])
      .get((err, row) => {
        db.close();
        if (err) reject(err);
        resolve(row ? rowToRound(row) : null);
      })
      .finalize();
  });
}

/**
 * Maps a row to a round
 * @param row row to map
 * @returns round object
 */
function rowToRound(row: any): Round {
  return {
    id: row.id,
    matchId: row.match_id,
    n: row.n_round,
    team: row.team,
    equipValue: row.equip_value,
    initMoney: row.init_money,
    initArmor: row.init_armor,
    helmet: row.helmet === 1,
    duration: row.duration_seconds,
    winner: row.winner,
    winType: row.win_type,
    died: row.died === 1,
    kills: row.kills,
    killshs: row.killshs,
    assists: row.assists,
    score: row.score,
    mvp: row.mvp === 1,
  };
}
