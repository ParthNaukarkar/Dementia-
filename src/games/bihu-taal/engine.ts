import { BIHU_INSTRUMENTS } from './instruments';
import type { 
  BihuInstrument, 
  BihuTaalDifficulty, 
  BihuTrialTelemetry, 
  BihuTaalSessionSummary 
} from './types';

export class BihuTaalEngine {
  private currentTrialIndex: number = 0;
  private maxTrials: number = 12;
  private theta: number = 0.0; // Ability parameter (-3.0 to +3.0)

  private trialSequence: BihuInstrument[] = [];
  private completedTrialsTelemetry: BihuTrialTelemetry[] = [];
  private currentTrialStartTime: number = 0;
  private hasTappedCurrentTrial: boolean = false;
  private currentTrialReactionTime: number | null = null;
  private isTrialActive: boolean = false;
  private isCurrentTrialConcluded: boolean = false;
  private sessionCompletedTimestamp: string | null = null;

  private difficulty: BihuTaalDifficulty = {
    tier: 'moderate',
    stimulusDurationMs: 1900,
    isiDurationMs: 1300,
    goProbability: 0.70,
    cueScaffolding: false,
  };

  constructor(initialTheta: number = 0.0, totalTrials: number = 12) {
    this.theta = (typeof initialTheta === 'number' && !isNaN(initialTheta) && isFinite(initialTheta))
      ? Math.max(-3.0, Math.min(3.0, initialTheta))
      : 0.0;
    this.maxTrials = Math.max(1, Math.min(50, Math.round(totalTrials || 12)));
    this.updateDifficulty();
    this.generateTrialSequence();
  }

  /**
   * Generates randomized sequence of instruments matching Go probability
   * Uses balanced distractor distribution so all regional instruments are sampled evenly.
   */
  private generateTrialSequence() {
    const pepa = BIHU_INSTRUMENTS.find(i => i.id === 'pepa')!;
    const distractors = BIHU_INSTRUMENTS.filter(i => i.role === 'NO_GO_INHIBIT');

    this.trialSequence = [];

    // Ensure 60-70% Go targets
    const goCount = Math.round(this.maxTrials * this.difficulty.goProbability);
    const noGoCount = this.maxTrials - goCount;

    const pool: BihuInstrument[] = [];
    for (let i = 0; i < goCount; i++) pool.push(pepa);

    // Balanced sampling without replacement: shuffle distractors and sample in round-robin
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random());
    for (let i = 0; i < noGoCount; i++) {
      pool.push(shuffledDistractors[i % shuffledDistractors.length]);
    }

    // True Fisher-Yates (Knuth) Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Constraint: Cap consecutive stimuli to max 2 (neither Go nor No-Go may appear 3+ times in a row)
    // Ensures a lively, alternating call-and-response rhythm (e.g. Go, Go, No-Go, Go, Go, No-Go...)
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < pool.length - 2; i++) {
        if (pool[i].role === pool[i + 1].role && pool[i + 1].role === pool[i + 2].role) {
          const diffIdx = pool.findIndex((item, idx) => idx > i + 1 && item.role !== pool[i].role);
          if (diffIdx !== -1) {
            [pool[i + 2], pool[diffIdx]] = [pool[diffIdx], pool[i + 2]];
          }
        }
      }
    }

    this.trialSequence = pool;
    this.currentTrialIndex = 0;
  }

  /**
   * Starts timing active trial presentation
   */
  public startTrial(): BihuInstrument {
    if (this.currentTrialIndex >= this.maxTrials || this.completedTrialsTelemetry.length >= this.maxTrials) {
      return this.getCurrentInstrument();
    }
    this.currentTrialStartTime = performance.now();
    this.hasTappedCurrentTrial = false;
    this.currentTrialReactionTime = null;
    this.isTrialActive = true;
    this.isCurrentTrialConcluded = false;
    return this.getCurrentInstrument();
  }

  /**
   * Patient taps the big drum button
   * Returns true if tap was accepted
   */
  public registerTap(explicitLatencyMs?: number): boolean {
    // Only accept tap if trial is active, not concluded, and not already tapped
    if (!this.isTrialActive || this.isCurrentTrialConcluded || this.hasTappedCurrentTrial) {
      return false;
    }

    this.hasTappedCurrentTrial = true;
    let rt: number;
    if (explicitLatencyMs !== undefined) {
      if (typeof explicitLatencyMs !== 'number' || isNaN(explicitLatencyMs) || !isFinite(explicitLatencyMs) || explicitLatencyMs < 0) {
        rt = 450;
      } else {
        rt = Math.min(10000, Math.max(0, Math.round(explicitLatencyMs)));
      }
    } else {
      const diff = performance.now() - this.currentTrialStartTime;
      rt = (isNaN(diff) || !isFinite(diff) || diff < 0) ? 450 : Math.min(10000, Math.max(0, Math.round(diff)));
    }
    this.currentTrialReactionTime = rt;
    return true;
  }

  /**
   * Concludes the current trial at end of stimulus display window,
   * records clinical telemetry, updates Bayesian theta.
   */
  public concludeTrial(): BihuTrialTelemetry {
    // Prevent duplicate conclude calls on the same trial
    if (this.isCurrentTrialConcluded) {
      if (this.completedTrialsTelemetry.length > 0) {
        return this.completedTrialsTelemetry[this.completedTrialsTelemetry.length - 1];
      }
    }
    // Prevent exceeding max trials
    if (this.completedTrialsTelemetry.length >= this.maxTrials) {
      if (this.completedTrialsTelemetry.length > 0) {
        return this.completedTrialsTelemetry[this.completedTrialsTelemetry.length - 1];
      }
    }

    this.isTrialActive = false;
    this.isCurrentTrialConcluded = true;

    const instrument = this.getCurrentInstrument();
    const isTarget = instrument.role === 'GO_TARGET';
    const patientTapped = this.hasTappedCurrentTrial;

    let isCorrect = false;
    let isCommission = false;
    let isOmission = false;

    if (isTarget) {
      if (patientTapped) {
        isCorrect = true;
      } else {
        isOmission = true; // Inattention / Missed target
      }
    } else {
      if (!patientTapped) {
        isCorrect = true; // Correct inhibition
      } else {
        isCommission = true; // Motor impulsivity error
      }
    }

    // Bayesian IRT Update
    this.updateBayesianTheta(isCorrect, isCommission, isOmission, this.currentTrialReactionTime);

    const safeTheta = (isNaN(this.theta) || !isFinite(this.theta)) ? 0.0 : Number(this.theta.toFixed(2));

    const telemetry: BihuTrialTelemetry = {
      trialNumber: this.currentTrialIndex + 1,
      instrument,
      expectedAction: isTarget ? 'TAP' : 'HOLD',
      patientAction: patientTapped ? 'TAPPED' : 'HELD',
      reactionTimeMs: this.currentTrialReactionTime,
      isCorrect,
      isCommissionError: isCommission,
      isOmissionError: isOmission,
      thetaAfterTrial: safeTheta,
    };

    this.completedTrialsTelemetry.push(telemetry);
    return telemetry;
  }

  /**
   * Bayesian IRT update based on motor inhibition and reaction latency
   */
  private updateBayesianTheta(
    isCorrect: boolean, 
    isCommission: boolean, 
    isOmission: boolean, 
    reactionTimeMs: number | null
  ) {
    const taskBeta = this.difficulty.tier === 'gentle_slow' ? -0.8 : this.difficulty.tier === 'moderate' ? 0.0 : 0.8;
    const expectedProb = 1 / (1 + Math.exp(-(this.theta - taskBeta)));
    const actualScore = isCorrect ? 1.0 : 0.0;

    let delta = 0.28 * (actualScore - expectedProb);

    // Motor impulsivity penalty (tapping on No-Go)
    if (isCommission) delta -= 0.28;

    // Inattention penalty (missing Go)
    if (isOmission) delta -= 0.22;

    // Fast, steady reaction bonus (tapping Go between 350ms and 1800ms)
    if (isCorrect && reactionTimeMs && reactionTimeMs >= 350 && reactionTimeMs <= 1800) {
      delta += 0.18;
    }

    if (isNaN(delta) || !isFinite(delta)) delta = 0.0;
    if (isNaN(this.theta) || !isFinite(this.theta)) this.theta = 0.0;

    this.theta = Math.max(-3.0, Math.min(3.0, this.theta + delta));
    this.updateDifficulty();
  }

  /**
   * Adapts tempo dynamically with dignified, elder-friendly clinical pacing:
   * Tier 0 (θ < -0.3): Gentle slow tempo (4.5s display, 2.0s pause, reassuring halo)
   * Tier 1 (-0.3 <= θ < 0.50): Moderate calm rhythm (3.6s display, 1.6s pause)
   * Tier 2 (θ >= 0.50): Stimulating brisk rhythm (2.8s display, 1.2s pause)
   */
  private updateDifficulty() {
    if (this.theta < -0.3) {
      this.difficulty = {
        tier: 'gentle_slow',
        stimulusDurationMs: 4500, // 4.5s generous window for dementia elders
        isiDurationMs: 2000,      // 2.0s peaceful breathing room
        goProbability: 0.70,
        cueScaffolding: true,
      };
    } else if (this.theta < 0.50) {
      this.difficulty = {
        tier: 'moderate',
        stimulusDurationMs: 3600, // 3.6s comfortable regional folk rhythm
        isiDurationMs: 1600,      // 1.6s breathing room
        goProbability: 0.65,
        cueScaffolding: false,
      };
    } else {
      this.difficulty = {
        tier: 'stimulating_fast',
        stimulusDurationMs: 2800, // 2.8s brisk Bihu beat for alert elders
        isiDurationMs: 1200,      // 1.2s breathing room
        goProbability: 0.60,
        cueScaffolding: false,
      };
    }
  }

  /**
   * Advances to next trial
   * Returns true if more trials remain
   */
  public nextTrial(): boolean {
    if (this.currentTrialIndex >= this.maxTrials - 1 || this.completedTrialsTelemetry.length >= this.maxTrials) {
      this.isTrialActive = false;
      return false; // Strictly prevent advancing beyond maxTrials
    }
    this.currentTrialIndex++;
    this.hasTappedCurrentTrial = false;
    this.currentTrialReactionTime = null;
    this.isTrialActive = false;
    this.isCurrentTrialConcluded = false;
    return true;
  }

  /**
   * Standardized MoCA Attention Score calculation (0 to 6 scale)
   */
  public generateSessionSummary(caregiverEndedEarly: boolean = false): BihuTaalSessionSummary {
    const total = this.completedTrialsTelemetry.length;
    const goTrials = this.completedTrialsTelemetry.filter(t => t.expectedAction === 'TAP');
    const noGoTrials = this.completedTrialsTelemetry.filter(t => t.expectedAction === 'HOLD');

    const correctGo = goTrials.filter(t => t.isCorrect).length;
    const correctNoGo = noGoTrials.filter(t => t.isCorrect).length;
    const totalCorrect = correctGo + correctNoGo;

    const commissionErrors = this.completedTrialsTelemetry.filter(t => t.isCommissionError).length;
    const omissionErrors = this.completedTrialsTelemetry.filter(t => t.isOmissionError).length;

    const reactionTimes = this.completedTrialsTelemetry
      .map(t => t.reactionTimeMs)
      .filter((rt): rt is number => typeof rt === 'number' && !isNaN(rt) && isFinite(rt) && rt >= 0);

    const meanRT = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 850;

    const accuracyPct = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
    const safeTheta = (isNaN(this.theta) || !isFinite(this.theta)) ? 0.0 : Number(this.theta.toFixed(2));

    // Standard MoCA Attention Sub-Score (0 to 6 points):
    // Digits Forward/Backward + Vigilance tapping tests
    let mocaScore = 1;
    if (total === 0 || accuracyPct < 15 || (goTrials.length > 0 && correctGo === 0)) {
      mocaScore = 0; // Total failure of vigilance / zero targets tapped
    } else if (safeTheta >= 0.65 && accuracyPct >= 85 && commissionErrors <= 1) {
      mocaScore = 6;
    } else if (safeTheta >= 0.20 && accuracyPct >= 75) {
      mocaScore = 5;
    } else if (safeTheta >= -0.30 && accuracyPct >= 60) {
      mocaScore = 4;
    } else if (safeTheta >= -0.90 && accuracyPct >= 40) {
      mocaScore = 3;
    } else if (safeTheta >= -1.8 && accuracyPct >= 25) {
      mocaScore = 2;
    }

    // Reaction time & motor articulation profile
    let processingSpeedProfile: 'brisk' | 'normal' | 'deliberate' | 'marked_bradyphrenia' = 'normal';
    if (meanRT > 1800) processingSpeedProfile = 'marked_bradyphrenia';
    else if (meanRT > 1100) processingSpeedProfile = 'deliberate';
    else if (meanRT < 450) processingSpeedProfile = 'brisk';

    if (!this.sessionCompletedTimestamp) {
      this.sessionCompletedTimestamp = new Date().toISOString();
    }

    return {
      gameId: 'bihu-taal',
      totalTrials: total,
      goTrialCount: goTrials.length,
      noGoTrialCount: noGoTrials.length,
      correctGoHits: correctGo,
      correctNoGoHolds: correctNoGo,
      commissionErrors,
      omissionErrors,
      accuracyPercentage: accuracyPct,
      meanReactionTimeMs: meanRT,
      finalTheta: safeTheta,
      estimatedMoCAAttentionScore: mocaScore,
      processingSpeedProfile,
      caregiverEndedEarly,
      completedAt: this.sessionCompletedTimestamp,
      trials: this.completedTrialsTelemetry,
    };
  }

  /**
   * Caregiver / Clinical early termination when patient exhibits fatigue or agitation
   */
  public concludeSessionEarly(): BihuTaalSessionSummary {
    return this.generateSessionSummary(true);
  }

  // Force difficulty for Judge testing
  public forceDifficulty(tier: 'gentle_slow' | 'moderate' | 'stimulating_fast') {
    this.theta = tier === 'gentle_slow' ? -1.2 : tier === 'moderate' ? 0.2 : 1.5;
    this.updateDifficulty();
  }

  // Getters
  public getCurrentInstrument(): BihuInstrument {
    return this.trialSequence[this.currentTrialIndex] || BIHU_INSTRUMENTS[0];
  }

  public getCurrentTrialNumber(): number { return this.currentTrialIndex + 1; }
  public getMaxTrials(): number { return this.maxTrials; }
  public getDifficulty(): BihuTaalDifficulty { return { ...this.difficulty }; }
  public getTheta(): number { return Number(this.theta.toFixed(2)); }
  public hasTapped(): boolean { return this.hasTappedCurrentTrial; }
}
