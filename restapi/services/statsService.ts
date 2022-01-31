import * as Matches from '../models/match';
import * as Rounds from '../models/round';

interface MatchesStats {
  /** Total kills */
  kills: number;

  /** Total headshot kills */
  killshs: number;

  /** Total assists */
  assists: number;

  /** Total deaths */
  deaths: number;

  /** Kill to death ratio */
  kdr: number;

  /** Headshot kill ratio */
  hsRate: number;

  /** Max kills in a single match */
  maxKillsPerMatch: number;

  /** Total number of matches */
  totalMatches: number;

  /** Total number of matches by result */
  matchesByResult: {
    victory: number;
    defeat: number;
    tie: number;
  };

  /** Number of matches by map */
  matchesByMap: {
    [mapName: string]: number;
  };

  /** Total number of seconds played */
  totalDuration: number;

  /** Match win rate */
  winRate: number;

  /** Average kills per match */
  avgKillsPerMatch: number;

  /** Average match duration in seconds */
  avgMatchDuration: number;

  /** Average match score */
  avgScore: number;

  /** Average mvps per match */
  avgMvps: number;
}

interface WinTypeStats {
  ct_win_elimination: number;
  ct_win_defuse: number;
  ct_win_time: number;
  t_win_elimination: number;
  t_win_bomb: number;
}

interface RoundsStats {
  /** Total number of rounds */
  totalRounds: number;

  /** Total number of rounds won */
  totalRoundsWon: number;

  /** Total number of rounds lost */
  totalRoundsLost: number;

  /** Round win rate */
  roundWinRate: number;

  /** Number of pistol rounds won */
  pistolRoundsWon: number;

  /** Number of pistol rounds lost */
  pistolRoundsLost: number;

  /** Pistol round win rate */
  pistolRoundWinRate: number;

  /** Number of rounds where the player was the mvp */
  mvpRounds: number;

  /** Mvp to round ratio */
  mvpRate: number;

  /** Number of rounds by team */
  roundsByTeam: {
    CT: number;
    T: number;
  };

  /** Round win rate by team */
  roundWinRateByTeam: {
    CT: number;
    T: number;
  };

  /** Number of rounds by win type */
  roundsByWinType: WinTypeStats;

  /** Number of rounds by enemies killed */
  roundsByKills: number[];

  /** Average equipment value per round */
  avgEquipValue: number;

  /** Average money at the start of a round */
  avgInitMoney: number;

  /** Average round duration in seconds */
  avgRoundDuration: number;
}

export type Stats = MatchesStats &
  RoundsStats & {
    /** Average number of rounds per match */
    avgRoundsPerMatch: number;

    /** Averge kills per round */
    avgKillsPerRound: number;

    /** Percentage of rounds where the player died*/
    roundDeathPercent: number;
  };

/**
 * Gets all the stats
 * @returns promise that resolves to an object containing the stats
 */
export function getAllStats(): Promise<Stats> {
  return computeStats(Matches.getAll(), Rounds.getAll());
}

/**
 * Computes stats from matches and rounds
 * @param matchesPromise promise that resolves to a list of matches
 * @param roundsPromise promise that resolves to a list of rounds
 * @returns promise that resolves to an object containing the stats
 */
function computeStats(
  matchesPromise: Promise<Matches.Match[]>,
  roundsPromise: Promise<Rounds.Round[]>
): Promise<Stats> {
  return new Promise((resolve, reject) => {
    Promise.all([
      matchesPromise.then(computeStatsFromMatches),
      roundsPromise.then(computeStatsFromRounds),
    ])
      .then(([matchesStats, roundsStats]) => {
        resolve({
          ...matchesStats,
          ...roundsStats,
          avgKillsPerRound:
            roundsStats.totalRounds > 0
              ? matchesStats.kills / roundsStats.totalRounds
              : 0,
          roundDeathPercent:
            roundsStats.totalRounds > 0
              ? matchesStats.deaths / roundsStats.totalRounds
              : 0,
          avgRoundsPerMatch:
            matchesStats.totalMatches > 0
              ? roundsStats.totalRounds / matchesStats.totalMatches
              : 0,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * Computes stats from a list of matches
 * @param list of matches
 * @return stats computed
 */
function computeStatsFromMatches(matches: Matches.Match[]): MatchesStats {
  let totalScore = 0;
  let totalMvps = 0;
  const matchesStats: MatchesStats = {
    kills: 0,
    killshs: 0,
    assists: 0,
    deaths: 0,
    kdr: 0,
    hsRate: 0,
    maxKillsPerMatch: 0,
    totalMatches: 0,
    matchesByResult: {
      victory: 0,
      defeat: 0,
      tie: 0,
    },
    matchesByMap: {},
    totalDuration: 0,
    winRate: 0,
    avgKillsPerMatch: 0,
    avgMatchDuration: 0,
    avgScore: 0,
    avgMvps: 0,
  };

  matches.forEach((match) => {
    matchesStats.kills += match.kills;
    matchesStats.killshs += match.killshs;
    matchesStats.assists += match.assists;
    matchesStats.deaths += match.deaths;

    if (match.kills > matchesStats.maxKillsPerMatch) {
      matchesStats.maxKillsPerMatch = match.kills;
    }

    if (!matchesStats.matchesByMap[match.map]) {
      matchesStats.matchesByMap[match.map] = 1;
    } else matchesStats.matchesByMap[match.map] += 1;

    matchesStats.totalMatches += 1;
    if (match.roundsWon > match.roundsLost) {
      matchesStats.matchesByResult.victory += 1;
    }
    if (match.roundsWon < match.roundsLost) {
      matchesStats.matchesByResult.defeat += 1;
    }
    if (match.roundsWon === match.roundsLost) {
      matchesStats.matchesByResult.tie += 1;
    }

    totalScore += match.score;
    totalMvps += match.mvps;
    matchesStats.totalDuration += match.duration;
  });

  if (matchesStats.totalMatches > 0) {
    matchesStats.winRate =
      matchesStats.matchesByResult.victory / matchesStats.totalMatches;
    matchesStats.avgKillsPerMatch =
      matchesStats.kills / matchesStats.totalMatches;
    matchesStats.avgMatchDuration =
      matchesStats.totalDuration / matchesStats.totalMatches;
    matchesStats.avgScore = totalScore / matchesStats.totalMatches;
    matchesStats.avgMvps = totalMvps / matchesStats.totalMatches;
  }

  matchesStats.kdr =
    matchesStats.kills / (matchesStats.deaths > 0 ? matchesStats.deaths : 1);
  matchesStats.hsRate =
    matchesStats.kills > 0 ? matchesStats.killshs / matchesStats.kills : 0;
  return matchesStats;
}

/**
 * Computes stats from a list of rounds
 * @param rounds list of rounds
 * @return stats computed
 */
function computeStatsFromRounds(rounds: Rounds.Round[]): RoundsStats {
  const roundsStats = {
    totalRounds: 0,
    totalRoundsWon: 0,
    totalRoundsLost: 0,
    roundWinRate: 0,
    pistolRoundsWon: 0,
    pistolRoundsLost: 0,
    pistolRoundWinRate: 0,
    mvpRounds: 0,
    mvpRate: 0,
    roundsByTeam: {
      CT: 0,
      T: 0,
    },
    roundWinRateByTeam: {
      CT: 0,
      T: 0,
    },
    roundsByWinType: {
      ct_win_elimination: 0,
      ct_win_defuse: 0,
      ct_win_time: 0,
      t_win_elimination: 0,
      t_win_bomb: 0,
    },
    roundsByKills: [0, 0, 0, 0, 0, 0],
    avgEquipValue: 0,
    avgInitMoney: 0,
    avgRoundDuration: 0,
  };
  let totalEquipValue = 0;
  let totalInitMoney = 0;
  let totalRoundDuration = 0;
  let roundsWonByTeam = {
    CT: 0,
    T: 0,
  };

  rounds.forEach((round) => {
    roundsStats.totalRounds += 1;

    if (round.winner === round.team) {
      roundsStats.totalRoundsWon += 1;
      roundsWonByTeam[round.team as 'CT' | 'T'] += 1;
      if (round.n === 1 || round.n === 16) roundsStats.pistolRoundsWon += 1;
    } else {
      roundsStats.totalRoundsLost += 1;
      if (round.n === 1 || round.n === 16) roundsStats.pistolRoundsLost += 1;
    }

    if (round.mvp) roundsStats.mvpRounds += 1;

    roundsStats.roundsByTeam[round.team as 'CT' | 'T'] += 1;
    roundsStats.roundsByWinType[round.winType as keyof WinTypeStats] += 1;

    totalEquipValue += round.equipValue;
    totalInitMoney += round.initMoney;
    totalRoundDuration += round.duration;
    roundsStats.roundsByKills[round.kills > 0 ? round.kills : 0] += 1;
  });

  if (roundsStats.totalRounds > 0) {
    roundsStats.roundWinRate =
      roundsStats.totalRoundsWon / roundsStats.totalRounds;
    roundsStats.mvpRate = roundsStats.mvpRounds / roundsStats.totalRoundsWon;
    roundsStats.avgEquipValue = totalEquipValue / roundsStats.totalRounds;
    roundsStats.avgInitMoney = totalInitMoney / roundsStats.totalRounds;
    roundsStats.avgRoundDuration = totalRoundDuration / roundsStats.totalRounds;
    (['CT', 'T'] as Array<'CT' | 'T'>).map((team) => {
      roundsStats.roundWinRateByTeam[team] =
        roundsWonByTeam[team] /
        roundsStats.roundsByTeam[team];
    });
  }

  return {
    ...roundsStats,
    pistolRoundWinRate:
      roundsStats.pistolRoundsLost + roundsStats.pistolRoundsWon > 0
        ? roundsStats.pistolRoundsWon /
          (roundsStats.pistolRoundsWon + roundsStats.pistolRoundsLost)
        : 0,
  };
}
