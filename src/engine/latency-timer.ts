/**
 * SmritiNER - Clinical In-Game Latency & Adaptive Timing Engine
 * Grounded in CANTAB & Cogstate Neuropsychological Standards for Elderly MCI/Dementia
 */

export type LatencyStage = 
  | 'NORMAL_DELIBERATION' // 0.0s - 7.0s: Silent thinking space (preserves patient dignity)
  | 'VISUAL_GUIDANCE'     // 7.0s - 10.0s: Gentle golden glow on target/cue
  | 'VERNACULAR_PROMPT'   // 10.0s - 15.0s: Warm regional voice encouragement
  | 'COGNITIVE_OVERLOAD'  // >15.0s: Clinical delay logged -> signals DDA to ease next round
  | 'SOFT_AUTO_ASSIST';   // 30.0s: Gentle auto-completion with praise, zero penalty

export interface TimingThresholds {
  normalMaxMs: number;      // e.g. 7000ms
  visualGlowMs: number;     // e.g. 10000ms
  voicePromptMs: number;    // e.g. 15000ms
  softTimeoutMs: number;    // e.g. 30000ms
}

export interface PatientTimingProfile {
  personalBaselineMs: number;       // Median Latency (MdL) over recent sessions
  intraIndividualVariability: number;// Standard deviation of latency (IIV biomarker)
  totalTrialsRecorded: number;
}

export class ClinicalLatencyEngine {
  private startTime: number = 0;
  private timerId: number | null = null;
  private isRunning: boolean = false;
  private stageChangeCallback?: (stage: LatencyStage, elapsedMs: number) => void;
  private currentStage: LatencyStage = 'NORMAL_DELIBERATION';

  // Clinical default thresholds based on CANTAB dementia standards
  private thresholds: TimingThresholds = {
    normalMaxMs: 7000,
    visualGlowMs: 10000,
    voicePromptMs: 15000,
    softTimeoutMs: 30000,
  };

  // Recent trial reaction times for computing Median Latency (MdL) and IIV
  private recentLatencies: number[] = [];

  constructor(customThresholds?: Partial<TimingThresholds>) {
    if (customThresholds) {
      this.thresholds = { ...this.thresholds, ...customThresholds };
    }
  }

  /**
   * Adapts thresholds dynamically based on the patient's personal baseline.
   * If a patient naturally takes 9 seconds, their prompt window expands safely.
   */
  public calibrateToPatientBaseline(medianLatencyMs: number) {
    if (medianLatencyMs > 5000) {
      // Scale thresholds adaptively
      this.thresholds.normalMaxMs = Math.round(medianLatencyMs * 0.9);
      this.thresholds.visualGlowMs = Math.round(medianLatencyMs * 1.3);
      this.thresholds.voicePromptMs = Math.round(medianLatencyMs * 1.8);
      this.thresholds.softTimeoutMs = Math.max(30000, Math.round(medianLatencyMs * 3.2));
    }
  }

  /**
   * Starts timing a game trial.
   */
  public startTrial(onStageChange?: (stage: LatencyStage, elapsedMs: number) => void) {
    this.stopTrial();
    this.startTime = performance.now();
    this.isRunning = true;
    this.currentStage = 'NORMAL_DELIBERATION';
    this.stageChangeCallback = onStageChange;

    this.tick();
  }

  private tick = () => {
    if (!this.isRunning) return;

    const elapsedMs = performance.now() - this.startTime;
    let nextStage: LatencyStage = 'NORMAL_DELIBERATION';

    if (elapsedMs >= this.thresholds.softTimeoutMs) {
      nextStage = 'SOFT_AUTO_ASSIST';
    } else if (elapsedMs >= this.thresholds.voicePromptMs) {
      nextStage = 'COGNITIVE_OVERLOAD';
    } else if (elapsedMs >= this.thresholds.visualGlowMs) {
      nextStage = 'VERNACULAR_PROMPT';
    } else if (elapsedMs >= this.thresholds.normalMaxMs) {
      nextStage = 'VISUAL_GUIDANCE';
    }

    if (nextStage !== this.currentStage) {
      this.currentStage = nextStage;
      if (this.stageChangeCallback) {
        this.stageChangeCallback(nextStage, elapsedMs);
      }
    }

    if (nextStage === 'SOFT_AUTO_ASSIST') {
      this.isRunning = false;
      return;
    }

    // Schedule next frame check (every 100ms for battery efficiency on tablets)
    this.timerId = window.setTimeout(this.tick, 100);
  };

  /**
   * Called when patient taps / completes the task.
   * Returns exact latency in milliseconds and records into clinical history.
   */
  public stopTrial(): number {
    const elapsedMs = this.startTime > 0 ? performance.now() - this.startTime : 0;
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (elapsedMs > 0 && elapsedMs < 60000) {
      this.recentLatencies.push(elapsedMs);
      if (this.recentLatencies.length > 20) {
        this.recentLatencies.shift(); // Keep rolling window of 20 trials
      }
    }

    return Math.round(elapsedMs);
  }

  /**
   * Returns patient's clinical timing analytics:
   * Median Latency (MdL) and Intra-Individual Variability (IIV - standard deviation)
   */
  public getClinicalTimingProfile(): PatientTimingProfile {
    if (this.recentLatencies.length === 0) {
      return {
        personalBaselineMs: 7000,
        intraIndividualVariability: 0,
        totalTrialsRecorded: 0,
      };
    }

    const sorted = [...this.recentLatencies].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    const mean = this.recentLatencies.reduce((a, b) => a + b, 0) / this.recentLatencies.length;
    const variance = this.recentLatencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.recentLatencies.length;
    const iiv = Math.sqrt(variance);

    return {
      personalBaselineMs: Math.round(median),
      intraIndividualVariability: Math.round(iiv),
      totalTrialsRecorded: this.recentLatencies.length,
    };
  }

  public getThresholds(): TimingThresholds {
    return { ...this.thresholds };
  }

  public getCurrentStage(): LatencyStage {
    return this.currentStage;
  }
}

// Export singleton instance for app-wide consistency
export const clinicalLatencyEngine = new ClinicalLatencyEngine();
