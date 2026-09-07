import type { 
  SequenceRecallDifficulty, 
  TrialTelemetry, 
  SequenceRecallSessionSummary, 
  ErrorType
} from './types';
import { SEQUENCE_ITEMS } from './items-catalog';

export class SequenceRecallEngine {
  private totalTrials: number;
  private currentTrialIndex: number = 0;
  private theta: number; // Latent cognitive ability (-3.0 to +3.0)
  private difficulty: SequenceRecallDifficulty;
  private trialHistory: TrialTelemetry[] = [];
  private consecutiveSuccesses: number = 0;
  private consecutiveFailures: number = 0;
  private lastTapTimestamp: number = 0;

  // Active trial state
  private activeTargetSequence: string[] = [];
  private activePoolItems: string[] = [];
  private currentRecalledSteps: string[] = [];
  private recallPhaseStartTime: number = 0;
  private firstTapTimestamp: number = 0;
  private stepLatencies: number[] = [];
  private wasAutoAssistedInCurrentTrial: boolean = false;
  private usedUndoInCurrentTrial: boolean = false;

  constructor(initialTheta: number = 0.0, totalTrials: number = 5) {
    this.theta = (typeof initialTheta === 'number' && Number.isFinite(initialTheta))
      ? Math.max(-3.0, Math.min(3.0, initialTheta))
      : 0.0;
    this.totalTrials = Math.max(3, totalTrials);

    // Initial baseline calibrated for dementia/elderly accessibility
    this.difficulty = {
      sequenceLength: 2,           // Starts at gentle Miller span floor
      stimulusDurationMs: 1500,    // 1.5s per item (accommodating delayed saccades)
      isiDurationMs: 1000,         // 1.0s calm breathing pause
      poolSize: 3,                 // 3 items on screen initially (low visual clutter)
      direction: 'FORWARD',
      scaffoldingLevel: 'high',
      tremorDebounceMs: 400,       // 400ms physical tremor filter
      autoAssistTimeoutMs: 45000   // 45s dignity guard
    };

    this.startNewTrial();
  }

  /**
   * Initializes a new trial with dynamically calibrated parameters
   */
  public startNewTrial(): void {
    this.currentRecalledSteps = [];
    this.stepLatencies = [];
    this.firstTapTimestamp = 0;
    this.lastTapTimestamp = 0;
    this.wasAutoAssistedInCurrentTrial = false;
    this.usedUndoInCurrentTrial = false;

    // Pick K items for the visible pool
    const shuffledCatalog = [...SEQUENCE_ITEMS].sort(() => Math.random() - 0.5);
    const pool = shuffledCatalog.slice(0, this.difficulty.poolSize);
    this.activePoolItems = pool.map(item => item.id);

    // Pick L items from the pool to form the sequence
    const sequence: string[] = [];
    const poolCopy = [...this.activePoolItems].sort(() => Math.random() - 0.5);
    for (let i = 0; i < this.difficulty.sequenceLength; i++) {
      sequence.push(poolCopy[i % poolCopy.length]);
    }
    this.activeTargetSequence = sequence;
  }

  public getDifficulty(): SequenceRecallDifficulty {
    return { ...this.difficulty };
  }

  public overrideDifficulty(settings: Partial<SequenceRecallDifficulty>): void {
    const nextSeqLen = settings.sequenceLength ?? this.difficulty.sequenceLength;
    const nextPoolSize = Math.max(
      settings.poolSize ?? this.difficulty.poolSize,
      nextSeqLen
    );

    this.difficulty = {
      ...this.difficulty,
      ...settings,
      sequenceLength: Math.max(2, Math.min(6, nextSeqLen)),
      poolSize: Math.max(3, Math.min(8, nextPoolSize))
    };

    this.startNewTrial();
  }

  public getTargetSequence(): string[] {
    return [...this.activeTargetSequence];
  }

  public getExpectedSequence(): string[] {
    if (this.difficulty.direction === 'REVERSE') {
      return [...this.activeTargetSequence].reverse();
    }
    return [...this.activeTargetSequence];
  }

  public getPoolItemIds(): string[] {
    return [...this.activePoolItems];
  }

  public getCurrentRecalledSteps(): string[] {
    return [...this.currentRecalledSteps];
  }

  public getTrialNumber(): number {
    return this.currentTrialIndex + 1;
  }

  public getTotalTrials(): number {
    return this.totalTrials;
  }

  public getTheta(): number {
    return this.theta;
  }

  public notifyRecallPhaseStarted(timestampOverride?: number): void {
    this.recallPhaseStartTime = timestampOverride ?? Date.now();
    this.lastTapTimestamp = 0;
    this.firstTapTimestamp = 0;
  }

  /**
   * Registers a patient tap with 400ms tremor debouncing
   * Returns: { accepted: boolean, isComplete: boolean, error?: string }
   */
  public registerItemTap(itemId: string, timestampOverride?: number): { accepted: boolean; isComplete: boolean; isTremorFiltered: boolean } {
    const now = timestampOverride ?? Date.now();
    
    // Ignore any extra taps if sequence is already full
    if (this.currentRecalledSteps.length >= this.difficulty.sequenceLength) {
      return { accepted: false, isComplete: true, isTremorFiltered: false };
    }

    // Tremor debouncing filter
    if (this.lastTapTimestamp > 0 && (now - this.lastTapTimestamp) < this.difficulty.tremorDebounceMs) {
      return { accepted: false, isComplete: false, isTremorFiltered: true };
    }

    if (this.firstTapTimestamp === 0) {
      this.firstTapTimestamp = now;
    } else {
      this.stepLatencies.push(Math.max(0, now - this.lastTapTimestamp));
    }
    this.lastTapTimestamp = now;

    this.currentRecalledSteps.push(itemId);
    const isComplete = this.currentRecalledSteps.length >= this.difficulty.sequenceLength;

    return { accepted: true, isComplete, isTremorFiltered: false };
  }

  /**
   * Allows elder to undo the last tap without penalty
   */
  public undoLastTap(): boolean {
    if (this.currentRecalledSteps.length > 0) {
      this.currentRecalledSteps.pop();
      this.usedUndoInCurrentTrial = true;
      if (this.stepLatencies.length > 0) {
        this.stepLatencies.pop();
      }
      if (this.currentRecalledSteps.length === 0) {
        this.firstTapTimestamp = 0;
        this.lastTapTimestamp = 0;
      }
      return true;
    }
    return false;
  }

  /**
   * Soft Dignity Auto-Assist triggers when patient is stuck
   */
  public triggerAutoAssist(): string | null {
    const expected = this.getExpectedSequence();
    const nextNeededIdx = this.currentRecalledSteps.length;
    if (nextNeededIdx < expected.length) {
      this.wasAutoAssistedInCurrentTrial = true;
      return expected[nextNeededIdx];
    }
    return null;
  }

  /**
   * Submits the recall attempt and calculates Bayesian 2PL IRT updates
   */
  public evaluateCurrentTrial(): TrialTelemetry {
    const expected = this.getExpectedSequence();
    const recalled = [...this.currentRecalledSteps];
    const initialDeliberationMs = this.firstTapTimestamp > 0 
      ? Math.max(0, this.firstTapTimestamp - this.recallPhaseStartTime) 
      : (Date.now() - this.recallPhaseStartTime);
    const totalRecallDurationMs = Date.now() - this.recallPhaseStartTime;

    // Check correctness
    const isExactMatch = expected.length === recalled.length && 
      expected.every((val, idx) => val === recalled[idx]);

    // Decompose clinical error type
    const errorType = this.diagnoseErrorType(expected, recalled, isExactMatch);

    // Update Bayesian IRT ability & DDA parameters
    this.updateBayesianParameters(isExactMatch, initialDeliberationMs);

    const telemetry: TrialTelemetry = {
      trialNumber: this.currentTrialIndex + 1,
      targetSequence: [...this.activeTargetSequence],
      recalledSequence: recalled,
      isCorrect: isExactMatch,
      errorType,
      initialDeliberationMs,
      totalRecallDurationMs,
      stepLatencies: [...this.stepLatencies],
      wasAutoAssisted: this.wasAutoAssistedInCurrentTrial,
      usedUndo: this.usedUndoInCurrentTrial,
      thetaAfterTrial: this.theta,
      difficultySnapshot: { ...this.difficulty }
    };

    this.trialHistory.push(telemetry);
    this.currentTrialIndex++;

    return telemetry;
  }

  /**
   * Categorizes error pattern into neuropsychological biomarkers
   */
  private diagnoseErrorType(expected: string[], recalled: string[], isCorrect: boolean): ErrorType {
    if (isCorrect) return 'NONE';
    if (recalled.length === 0) return 'OMISSION';

    // Check perseveration (tapping same card consecutively)
    for (let i = 1; i < recalled.length; i++) {
      if (recalled[i] === recalled[i - 1]) {
        return 'PERSEVERATION';
      }
    }

    // Check intrusion (chose card not present in target sequence)
    const expectedSet = new Set(expected);
    const hasIntrusion = recalled.some(id => !expectedSet.has(id));
    if (hasIntrusion) {
      return 'INTRUSION';
    }

    // Check transposition (same items, but in wrong temporal order)
    const recalledSet = new Set(recalled);
    if (recalled.length === expected.length && expected.every(id => recalledSet.has(id))) {
      return 'TRANSPOSITION';
    }

    return 'OMISSION';
  }

  /**
   * Continuous Parametric 2PL IRT Dynamic Difficulty Adjustment
   */
  private updateBayesianParameters(isCorrect: boolean, deliberationMs: number): void {
    // 1. Calculate item difficulty b
    const b = (0.75 * (this.difficulty.sequenceLength - 2)) 
            + (0.12 * (this.difficulty.poolSize - 3)) 
            - (0.0006 * (this.difficulty.stimulusDurationMs - 1200))
            + (this.difficulty.direction === 'REVERSE' ? 0.65 : 0.0);

    const a = 1.25; // Discrimination slope
    const expArg = -a * (this.theta - b);
    let pSuccess = 0.5;
    if (expArg > 40) {
      pSuccess = 0.0;
    } else if (expArg < -40) {
      pSuccess = 1.0;
    } else {
      pSuccess = 1 / (1 + Math.exp(expArg));
    }
    const outcome = isCorrect ? 1.0 : 0.0;

    // Adaptive learning rate eta
    const eta = 0.35 / (1 + 0.15 * this.currentTrialIndex);
    const updatedTheta = this.theta + eta * (outcome - pSuccess);
    this.theta = Number.isFinite(updatedTheta) ? Math.max(-3.0, Math.min(3.0, updatedTheta)) : this.theta;

    // 2. Staircase updates
    if (isCorrect) {
      this.consecutiveSuccesses++;
      this.consecutiveFailures = 0;

      if (this.consecutiveSuccesses >= 2) {
        this.consecutiveSuccesses = 0;
        // Increase span length L (up to 6 max)
        if (this.difficulty.sequenceLength < 6) {
          this.difficulty.sequenceLength += 1;
        } else if (this.difficulty.direction === 'FORWARD' && this.theta >= 1.0) {
          // At max span with high ability, activate reverse recall
          this.difficulty.direction = 'REVERSE';
        }

        // Expand pool size K if sequence length requires more distractors
        if (this.difficulty.poolSize < Math.min(8, this.difficulty.sequenceLength + 2)) {
          this.difficulty.poolSize = Math.min(8, this.difficulty.poolSize + 1);
        }

        // Titrate exposure time down if patient deliberates briskly
        if (deliberationMs < 2500 && this.difficulty.stimulusDurationMs > 900) {
          this.difficulty.stimulusDurationMs = Math.max(900, this.difficulty.stimulusDurationMs - 100);
        }
      }
    } else {
      this.consecutiveFailures++;
      this.consecutiveSuccesses = 0;

      if (this.consecutiveFailures >= 2) {
        this.consecutiveFailures = 0;
        // Reduce sequence length L (down to 2 floor)
        if (this.difficulty.sequenceLength > 2) {
          this.difficulty.sequenceLength -= 1;
        } else if (this.difficulty.direction === 'REVERSE') {
          // Revert to forward span if struggling
          this.difficulty.direction = 'FORWARD';
        }

        // Reduce distractor pool to minimize visual crowding
        if (this.difficulty.poolSize > 3) {
          this.difficulty.poolSize = Math.max(3, this.difficulty.poolSize - 1);
        }

        // Relax exposure time to give elder more encoding time
        if (this.difficulty.stimulusDurationMs < 2200) {
          this.difficulty.stimulusDurationMs = Math.min(2200, this.difficulty.stimulusDurationMs + 150);
        }
      }
    }
  }

  public isSessionComplete(): boolean {
    return this.currentTrialIndex >= this.totalTrials;
  }

  /**
   * Generates comprehensive neuropsychological session summary
   */
  public generateSessionSummary(caregiverEndedEarly: boolean = false): SequenceRecallSessionSummary {
    const trials = [...this.trialHistory];
    const totalTrials = trials.length;
    const correctTrials = trials.filter(t => t.isCorrect).length;
    const accuracyPercentage = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

    let maxSpan = 0;
    let maxForward = 0;
    let maxReverse = 0;
    let totalDeliberation = 0;
    let transpositionCount = 0;
    let intrusionCount = 0;
    let perseverationCount = 0;
    let autoAssistedCount = 0;

    trials.forEach(t => {
      totalDeliberation += t.initialDeliberationMs;
      if (t.wasAutoAssisted) autoAssistedCount++;
      if (t.isCorrect) {
        maxSpan = Math.max(maxSpan, t.difficultySnapshot.sequenceLength);
        if (t.difficultySnapshot.direction === 'FORWARD') {
          maxForward = Math.max(maxForward, t.difficultySnapshot.sequenceLength);
        } else {
          maxReverse = Math.max(maxReverse, t.difficultySnapshot.sequenceLength);
        }
      }
      if (t.errorType === 'TRANSPOSITION') transpositionCount++;
      if (t.errorType === 'INTRUSION') intrusionCount++;
      if (t.errorType === 'PERSEVERATION') perseverationCount++;
    });

    const meanDeliberationMs = totalTrials > 0 ? Math.round(totalDeliberation / totalTrials) : 0;

    // Processing speed profile
    let processingSpeedProfile: 'brisk' | 'normal' | 'deliberate' | 'marked_bradyphrenia' = 'normal';
    if (meanDeliberationMs < 1800) processingSpeedProfile = 'brisk';
    else if (meanDeliberationMs <= 4500) processingSpeedProfile = 'normal';
    else if (meanDeliberationMs <= 9000) processingSpeedProfile = 'deliberate';
    else processingSpeedProfile = 'marked_bradyphrenia';

    // MoCA Working Memory estimate (0 to 5 points)
    // MoCA digit/spatial span allocates points based on span length:
    // Span 2: 1 pt, Span 3: 2 pts, Span 4: 3-4 pts, Span 5-6: 5 pts
    let mocaScore = 1;
    if (maxSpan >= 5) mocaScore = 5;
    else if (maxSpan >= 4) mocaScore = 4;
    else if (maxSpan >= 3) mocaScore = 3;
    else if (maxSpan >= 2 && correctTrials > 0) mocaScore = 2;
    else mocaScore = 0;

    return {
      gameId: 'sequence-recall',
      totalTrials,
      correctTrials,
      maxSpanAchieved: maxSpan > 0 ? maxSpan : 2,
      forwardSpan: maxForward > 0 ? maxForward : 2,
      reverseSpan: maxReverse,
      accuracyPercentage,
      meanDeliberationMs,
      finalTheta: Number(this.theta.toFixed(2)),
      transpositionErrors: transpositionCount,
      intrusionErrors: intrusionCount,
      perseverationErrors: perseverationCount,
      estimatedMoCAWorkingMemoryScore: mocaScore,
      processingSpeedProfile,
      autoAssistedTrials: autoAssistedCount,
      completedAt: new Date().toISOString(),
      caregiverEndedEarly,
      trials
    };
  }
}
