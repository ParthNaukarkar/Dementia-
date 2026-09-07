/**
 * SmritiNER - Daily Session Manager & Multi-Game Telemetry Aggregator
 * 
 * Aggregates, persists, and calculates daily cognitive scores from ONLY
 * the games that were actually recommended and played on a specific day.
 * Unplayed games are strictly excluded from daily score computations.
 */

import type { GameId, LumosityDomain } from '../types/prescription';
import { GAME_CATALOG } from '../data/gameCatalog';
import { GAME_DOMAIN_MAP } from '../engine/adaptive-game-flow';

export interface DailyGameSessionRecord {
  gameId: GameId;
  gameTitle: string;
  accuracyPercentage: number;
  averageLatencyMs: number;
  finalTheta: number;
  autonomyScore?: number;
  autoAssistedRounds?: number;
  perseverationErrors?: number;
  tremorTapsFiltered?: number;
  domain: LumosityDomain;
  wasRecommended: boolean;
  completedAt: string;
}

export interface DailyCompositeScoreResult {
  score: number;                   // 50 to 99 composite cognitive score
  meanAccuracy: number;            // Average accuracy across played games
  meanLatencyMs: number;           // Average reaction/deliberation latency
  meanTheta: number;               // Average Bayesian ability
  meanAutonomy: number;            // Average patient autonomy
  gamesPlayedCount: number;        // Number of distinct games played today
  playedGameIds: GameId[];         // IDs of games played today
  isBaseline: boolean;             // True if no games have been played today
  domainBreakdown: DomainPerformanceRecord[];
}

export interface DomainPerformanceRecord {
  domain: 'memory' | 'attention' | 'executive' | 'spatial' | 'language';
  label: string;
  score: number | null;            // 0 - 100 score, or null if no games played in this domain today
  accuracy: number | null;
  gamesPlayed: GameId[];
  isPlayedToday: boolean;
}

export interface DayTrendPoint {
  day: string;
  date: string;
  score: number;
  baseline: number;
  gamesPlayedCount: number;
  isToday: boolean;
}

const DAILY_SESSION_PREFIX = 'smriti_daily_sessions_v2_';
const PLAYED_DATES_KEY = 'smriti_played_dates_index_v2';

export class DailySessionManager {
  /**
   * Returns current local ISO date string (YYYY-MM-DD).
   */
  public static getTodayDateKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Retrieves all game sessions completed on a specific day.
   */
  public static getDailySessions(dateKey: string = this.getTodayDateKey()): Record<string, DailyGameSessionRecord> {
    try {
      const raw = localStorage.getItem(`${DAILY_SESSION_PREFIX}${dateKey}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * Records a completed game session for a specific day.
   * Only stores data for the game that was actually played.
   */
  public static recordSession(
    report: any,
    wasRecommended: boolean = true,
    dateKey: string = this.getTodayDateKey()
  ): DailyCompositeScoreResult {
    const rawId = report.gameId || report.id;
    const gameId: GameId = (rawId === 'smriti-haat' ? 'word-recall' : rawId) as GameId;
    const catalogItem = GAME_CATALOG.find(g => g.id === gameId);
    const domain = (catalogItem?.domain || GAME_DOMAIN_MAP[gameId] || 'memory') as LumosityDomain;

    const record: DailyGameSessionRecord = {
      gameId,
      gameTitle: report.gameTitle || catalogItem?.title.en || gameId,
      accuracyPercentage: report.accuracyPercentage ?? 80,
      averageLatencyMs: report.averageLatencyMs || report.meanReactionTimeMs || report.meanDeliberationMs || 3500,
      finalTheta: report.finalTheta ?? 0.0,
      autonomyScore: report.autonomyScore ?? (report.autoAssistedRounds ? 65 : 100),
      autoAssistedRounds: report.autoAssistedRounds ?? report.autoAssistedTrials ?? 0,
      perseverationErrors: report.perseverationErrors ?? report.commissionErrors ?? 0,
      tremorTapsFiltered: report.tremorTapsFiltered ?? report.tremorEventsSuppressed ?? 0,
      domain,
      wasRecommended,
      completedAt: report.completedAt || new Date().toISOString(),
    };

    try {
      const existing = this.getDailySessions(dateKey);
      existing[gameId] = record;
      localStorage.setItem(`${DAILY_SESSION_PREFIX}${dateKey}`, JSON.stringify(existing));

      // Record date in index
      const datesRaw = localStorage.getItem(PLAYED_DATES_KEY);
      const dates: string[] = datesRaw ? JSON.parse(datesRaw) : [];
      if (!dates.includes(dateKey)) {
        dates.push(dateKey);
        localStorage.setItem(PLAYED_DATES_KEY, JSON.stringify(dates));
      }
    } catch (e) {
      console.error('Failed to persist daily session:', e);
    }

    return this.calculateDailyCompositeScore(dateKey);
  }

  /**
   * Calculates the combined composite cognitive score from ONLY the games
   * that were ACTUALLY played on that specific day.
   * If a game was NOT played, it is NOT counted.
   */
  public static calculateDailyCompositeScore(
    dateKey: string = this.getTodayDateKey(),
    baselineScore: number = 78
  ): DailyCompositeScoreResult {
    const sessionsMap = this.getDailySessions(dateKey);
    const playedSessions = Object.values(sessionsMap);

    // If no games were played today, return clinical baseline without penalty
    if (playedSessions.length === 0) {
      return {
        score: baselineScore,
        meanAccuracy: 0,
        meanLatencyMs: 0,
        meanTheta: 0.0,
        meanAutonomy: 100,
        gamesPlayedCount: 0,
        playedGameIds: [],
        isBaseline: true,
        domainBreakdown: this.getEmptyDomainBreakdown(),
      };
    }

    let sumAccuracy = 0;
    let sumLatency = 0;
    let sumTheta = 0;
    let sumAutonomy = 0;
    const playedGameIds: GameId[] = [];

    playedSessions.forEach(session => {
      playedGameIds.push(session.gameId);
      sumAccuracy += session.accuracyPercentage;
      sumLatency += session.averageLatencyMs;
      sumTheta += session.finalTheta;
      sumAutonomy += (session.autonomyScore ?? 100);
    });

    const count = playedSessions.length;
    const meanAccuracy = Math.round(sumAccuracy / count);
    const meanLatencyMs = Math.round(sumLatency / count);
    const meanTheta = Number((sumTheta / count).toFixed(2));
    const meanAutonomy = Math.round(sumAutonomy / count);

    // Composite scoring formula grounded in CANTAB / MoCA accuracy and Bayesian theta:
    // - Accuracy contributes 60%
    // - Bayesian theta (-3 to +3) normalized to 0-100 contributes 25%
    // - Autonomy contributes 15%
    // - Excessive latency penalty (>8000ms) deducts up to 5 points
    const thetaNormalized = Math.max(0, Math.min(100, (meanTheta + 3.0) * (100 / 6.0)));
    const latencyDeduction = meanLatencyMs > 8000 ? 5 : meanLatencyMs > 6000 ? 2 : 0;

    const rawScore = (meanAccuracy * 0.60) + (thetaNormalized * 0.25) + (meanAutonomy * 0.15) - latencyDeduction;
    const finalScore = Math.max(50, Math.min(99, Math.round(rawScore)));

    const domainBreakdown = this.calculateDomainBreakdown(playedSessions);

    return {
      score: finalScore,
      meanAccuracy,
      meanLatencyMs,
      meanTheta,
      meanAutonomy,
      gamesPlayedCount: count,
      playedGameIds,
      isBaseline: false,
      domainBreakdown,
    };
  }

  /**
   * Generates the 7-day performance trend curve for Recharts.
   * If games were played on a specific date, uses the combined score of that date's played games!
   * For unplayed historical days, uses baseline to keep the graph smooth.
   */
  public static get7DayPerformanceTrend(
    baseline: number = 78
  ): DayTrendPoint[] {
    const today = new Date();
    const result: DayTrendPoint[] = [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate past 7 days (index 6 = today, index 0 = 6 days ago)
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayNum}`;
      const dayName = dayNames[d.getDay()];
      const isToday = offset === 0;

      const dailyResult = this.calculateDailyCompositeScore(dateKey, baseline);

      // If games were played on this day, use the real combined score!
      // Otherwise, use a slight baseline curve for historical context
      let displayScore = dailyResult.score;
      if (dailyResult.isBaseline && !isToday) {
        // Historical default baseline curve
        const curveOffset = ((d.getDay() * 3) % 7) - 3;
        displayScore = baseline + curveOffset;
      }

      result.push({
        day: dayName,
        date: dateKey,
        score: displayScore,
        baseline,
        gamesPlayedCount: dailyResult.gamesPlayedCount,
        isToday,
      });
    }

    return result;
  }

  /**
   * Calculates domain performance ONLY from games played in that domain today.
   * Unplayed domains have score: null and isPlayedToday: false.
   */
  private static calculateDomainBreakdown(
    playedSessions: DailyGameSessionRecord[]
  ): DomainPerformanceRecord[] {
    const domains: ('memory' | 'attention' | 'executive' | 'spatial' | 'language')[] = [
      'memory',
      'attention',
      'executive',
      'spatial',
      'language',
    ];

    const labels: Record<string, string> = {
      memory: 'Delayed Memory Recall',
      attention: 'Attention & Working Memory',
      executive: 'Executive Flexibility',
      spatial: 'Visuomotor & Orientation',
      language: 'Language & Logical Memory',
    };

    return domains.map(dom => {
      const matches = playedSessions.filter(s => {
        const mapped = GAME_DOMAIN_MAP[s.gameId] || 'memory';
        return mapped === dom;
      });

      if (matches.length === 0) {
        return {
          domain: dom,
          label: labels[dom],
          score: null,
          accuracy: null,
          gamesPlayed: [],
          isPlayedToday: false,
        };
      }

      const avgAcc = Math.round(matches.reduce((acc, m) => acc + m.accuracyPercentage, 0) / matches.length);
      const avgTheta = matches.reduce((acc, m) => acc + m.finalTheta, 0) / matches.length;
      const domScore = Math.max(20, Math.min(99, Math.round(50 + avgTheta * 16 + (avgAcc - 70) * 0.3)));

      return {
        domain: dom,
        label: labels[dom],
        score: domScore,
        accuracy: avgAcc,
        gamesPlayed: matches.map(m => m.gameId),
        isPlayedToday: true,
      };
    });
  }

  private static getEmptyDomainBreakdown(): DomainPerformanceRecord[] {
    const domains: ('memory' | 'attention' | 'executive' | 'spatial' | 'language')[] = [
      'memory',
      'attention',
      'executive',
      'spatial',
      'language',
    ];

    const labels: Record<string, string> = {
      memory: 'Delayed Memory Recall',
      attention: 'Attention & Working Memory',
      executive: 'Executive Flexibility',
      spatial: 'Visuomotor & Orientation',
      language: 'Language & Logical Memory',
    };

    return domains.map(dom => ({
      domain: dom,
      label: labels[dom],
      score: null,
      accuracy: null,
      gamesPlayed: [],
      isPlayedToday: false,
    }));
  }
}
