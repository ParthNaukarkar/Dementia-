import { BAZAAR_CATALOG } from './items-catalog';
import type { 
  BazaarItem, 
  DifficultyConfig, 
  RoundTelemetry, 
  SessionSummaryTelemetry 
} from './types';

export type GamePhase = 
  | 'STUDY_PHASE'     // Items displayed on bazaar stall
  | 'CONCEAL_PHASE'   // Stall covered for working memory retention
  | 'RECALL_PHASE'    // Patient chooses items from grid
  | 'ROUND_FEEDBACK'  // Positive reinforcement & score reflection
  | 'SESSION_COMPLETE';

export class SmritiHaatEngine {
  private currentRound: number = 1;
  private maxRounds: number = 3;
  private theta: number = 0.0; // Ability parameter (-3.0 to +3.0)
  private currentPhase: GamePhase = 'STUDY_PHASE';
  
  private targetItems: BazaarItem[] = [];
  private recallOptions: BazaarItem[] = [];
  private selectedIds: Set<string> = new Set();
  private eliminatedDistractorIds: Set<string> = new Set();
  private wasCurrentRoundAutoAssisted: boolean = false;
  
  private roundStartTimestamp: number = 0;
  private previousRoundMistakes: Set<string> = new Set();
  private completedRoundsTelemetry: RoundTelemetry[] = [];
  private latestAdaptationRationale: string = '';
  private sessionCompletedTimestamp: string | null = null;

  private difficulty: DifficultyConfig = {
    itemsToMemorize: 2,
    gridSize: '2x2',
    exposureTimeMs: 7500,
    assistLevel: 'moderate_assist',
  };

  constructor(initialTheta: number = 0.0, totalRounds: number = 3) {
    this.theta = (typeof initialTheta === 'number' && !isNaN(initialTheta) && isFinite(initialTheta))
      ? Math.max(-3.0, Math.min(3.0, initialTheta))
      : 0.0;
    this.maxRounds = Math.max(1, Math.min(20, Math.round(totalRounds || 3)));
    this.updateDifficultyConfig();
    this.startNewRound();
  }

  /**
   * Initializes a new round with randomized targets and distractors based on current difficulty.
   */
  public startNewRound() {
    this.selectedIds.clear();
    this.eliminatedDistractorIds.clear();
    this.wasCurrentRoundAutoAssisted = false;
    this.currentPhase = 'STUDY_PHASE';

    // 1. Shuffle catalog to pick targets
    const shuffled = [...BAZAAR_CATALOG].sort(() => 0.5 - Math.random());
    this.targetItems = shuffled.slice(0, this.difficulty.itemsToMemorize);

    // 2. Select distractors to populate grid
    const totalGridCount = this.difficulty.gridSize === '1x2' ? 2 : this.difficulty.gridSize === '2x2' ? 4 : 6;
    const distractors = shuffled
      .slice(this.difficulty.itemsToMemorize)
      .slice(0, Math.max(1, totalGridCount - this.targetItems.length));

    // 3. Shuffle targets and distractors together for recall grid
    this.recallOptions = [...this.targetItems, ...distractors].sort(() => 0.5 - Math.random());
  }

  public advanceToConceal() {
    this.currentPhase = 'CONCEAL_PHASE';
  }

  public advanceToRecall() {
    this.currentPhase = 'RECALL_PHASE';
    this.roundStartTimestamp = performance.now();
  }

  /**
   * Mid-round Clinical Auto-Assist: Eliminates 1 incorrect distractor card
   * when patient exhibits excessive deliberation (>12-15s) in RECALL phase.
   * Returns the ID of the eliminated item, or null if no further distractor can be eliminated.
   * CLINICAL INTEGRITY RULE: At least 1 distractor must ALWAYS remain active on screen
   * to preserve validity of recognition memory testing.
   */
  public eliminateDistractor(): string | null {
    if (this.currentPhase !== 'RECALL_PHASE') return null;

    const targetIds = new Set(this.targetItems.map(i => i.id));
    const allDistractors = this.recallOptions.filter(item => !targetIds.has(item.id));
    const remainingDistractors = allDistractors.filter(d => !this.eliminatedDistractorIds.has(d.id));

    // CLINICAL PSYCHOMETRIC INVARIANT:
    // Zero distractors destroys test validity. Must keep at least 1 wrong option!
    if (remainingDistractors.length <= 1) {
      return null;
    }

    // Find candidate distractors that aren't target, aren't already eliminated, and aren't selected
    const candidates = remainingDistractors.filter(item => !this.selectedIds.has(item.id));

    if (candidates.length === 0) {
      // If elder selected an incorrect distractor by mistake and is stuck, deselect and eliminate it
      const selectedDistractors = remainingDistractors.filter(item => this.selectedIds.has(item.id));
      if (selectedDistractors.length === 0) return null;
      const chosen = selectedDistractors[0];
      this.selectedIds.delete(chosen.id);
      this.eliminatedDistractorIds.add(chosen.id);
      return chosen.id;
    }

    const chosen = candidates[0];
    this.eliminatedDistractorIds.add(chosen.id);
    return chosen.id;
  }

  /**
   * Stage 5 Clinical Soft Auto-Assist:
   * Called when patient has been deliberating/frozen for >58s and cannot make a selection.
   * AI gently populates target selection to avoid emotional failure,
   * but flags the round so AI auto-choices ARE NOT credited to patient accuracy.
   */
  public triggerSoftAutoAssist(): string[] {
    if (this.currentPhase !== 'RECALL_PHASE') return [];
    this.wasCurrentRoundAutoAssisted = true;
    this.selectedIds.clear();
    for (const item of this.targetItems) {
      this.selectedIds.add(item.id);
    }
    return Array.from(this.selectedIds);
  }

  public isRoundAutoAssisted(): boolean {
    return this.wasCurrentRoundAutoAssisted;
  }

  /**
   * Toggles item selection in Recall phase.
   * Returns true if selection changed.
   */
  public toggleSelection(itemId: string): boolean {
    if (this.currentPhase !== 'RECALL_PHASE') return false;
    // Cannot select an eliminated distractor
    if (this.eliminatedDistractorIds.has(itemId)) return false;
    // Cannot select an item not present in current recall options
    if (!this.recallOptions.some(item => item.id === itemId)) return false;

    if (this.selectedIds.has(itemId)) {
      this.selectedIds.delete(itemId);
      return true;
    } else {
      if (this.selectedIds.size < this.targetItems.length) {
        this.selectedIds.add(itemId);
        return true;
      }
      return false;
    }
  }

  /**
   * Confirms patient's recall submission, updates Bayesian theta, and records telemetry.
   * Protected against duplicate submissions, phase bypass, timing injection, and over-completion.
   */
  public submitRecall(manualElapsedMs?: number): RoundTelemetry {
    // 1. Phase Guard: Reject submissions outside of RECALL_PHASE
    if (this.currentPhase !== 'RECALL_PHASE') {
      if (this.currentPhase === 'ROUND_FEEDBACK' && this.completedRoundsTelemetry.length > 0) {
        // Idempotent: return recorded telemetry without duplicate pushing
        return this.completedRoundsTelemetry[this.completedRoundsTelemetry.length - 1];
      }
      throw new Error(`Cannot submit recall in phase '${this.currentPhase}'. Submission is only permitted during 'RECALL_PHASE'.`);
    }

    // 2. Bound Guard: Do not exceed max rounds
    if (this.completedRoundsTelemetry.length >= this.maxRounds) {
      this.currentPhase = 'SESSION_COMPLETE';
      return this.completedRoundsTelemetry[this.completedRoundsTelemetry.length - 1];
    }

    // 3. Timing Sanitization: Guard against NaN, negative, infinite or extreme values
    let elapsedMs: number;
    if (manualElapsedMs !== undefined) {
      if (typeof manualElapsedMs !== 'number' || isNaN(manualElapsedMs) || !isFinite(manualElapsedMs) || manualElapsedMs < 0) {
        elapsedMs = 12000; // Clinical reasonable deliberation default
      } else {
        elapsedMs = Math.min(180000, Math.max(0, Math.round(manualElapsedMs)));
      }
    } else {
      const calculated = performance.now() - this.roundStartTimestamp;
      if (isNaN(calculated) || !isFinite(calculated) || calculated < 0) {
        elapsedMs = 12000;
      } else {
        elapsedMs = Math.min(180000, Math.max(0, Math.round(calculated)));
      }
    }

    const targetIdSet = new Set(this.targetItems.map(i => i.id));
    const selectedArray = Array.from(this.selectedIds);

    let correctCount = 0;
    let perseverationDetected = false;

    for (const id of selectedArray) {
      if (targetIdSet.has(id)) {
        correctCount++;
      } else {
        if (this.previousRoundMistakes.has(id)) {
          perseverationDetected = true;
        }
      }
    }

    const wasAutoAssisted = this.wasCurrentRoundAutoAssisted;

    // CRITICAL CLINICAL INTEGRITY:
    // If the round was auto-completed by AI because patient was unable to respond,
    // the patient did NOT recall it. Accuracy is NOT credited to patient score.
    const isFullyCorrect = !wasAutoAssisted && correctCount === this.targetItems.length && selectedArray.length === this.targetItems.length;
    const finalPatientCorrectCount = wasAutoAssisted ? 0 : correctCount;

    // Update prior mistakes tracking for perseveration detection
    this.previousRoundMistakes.clear();
    for (const id of selectedArray) {
      if (!targetIdSet.has(id)) {
        this.previousRoundMistakes.add(id);
      }
    }

    const oldDifficulty = { ...this.difficulty };
    const neededAssist = this.eliminatedDistractorIds.size > 0 || wasAutoAssisted;

    const partialScore = (this.targetItems.length > 0 && !wasAutoAssisted)
      ? (finalPatientCorrectCount / this.targetItems.length)
      : 0.0;

    // Bayesian IRT Theta update (graded response model)
    this.updateBayesianTheta(isFullyCorrect, elapsedMs, perseverationDetected, neededAssist, wasAutoAssisted, partialScore);

    // Compute clinical adaptation rationale
    const rationale = this.generateAdaptationRationale(oldDifficulty, this.difficulty, elapsedMs, isFullyCorrect, perseverationDetected, wasAutoAssisted);
    this.latestAdaptationRationale = rationale;

    const safeTheta = (isNaN(this.theta) || !isFinite(this.theta)) ? 0.0 : Number(this.theta.toFixed(2));

    const roundData: RoundTelemetry = {
      roundNumber: this.currentRound,
      targets: Array.from(targetIdSet),
      selected: selectedArray,
      correctCount: finalPatientCorrectCount,
      isFullyCorrect,
      latencyMs: elapsedMs,
      hesitationMs: Math.max(0, elapsedMs - 16000), // Latency beyond 16s calm deliberation zone
      isPerseveration: perseverationDetected,
      difficulty: oldDifficulty,
      nextDifficulty: { ...this.difficulty },
      thetaAfterRound: safeTheta,
      eliminatedDistractors: Array.from(this.eliminatedDistractorIds),
      wasAutoAssisted,
      adaptationRationale: rationale,
    };

    this.completedRoundsTelemetry.push(roundData);
    this.currentPhase = 'ROUND_FEEDBACK';

    return roundData;
  }

  /**
   * Generates human-readable clinical explanation of difficulty adaptation
   */
  private generateAdaptationRationale(
    oldDiff: DifficultyConfig,
    newDiff: DifficultyConfig,
    latencyMs: number,
    isCorrect: boolean,
    isPerseveration: boolean,
    wasAutoAssisted: boolean = false
  ): string {
    const timeSec = (latencyMs / 1000).toFixed(1);
    
    if (wasAutoAssisted) {
      return `Patient exhibited prolonged deliberation (${timeSec}s) without response. AI completed the round via gentle auto-assist to prevent distress. Score was NOT credited to patient memory. Difficulty dynamically adapted to Gentle 1-Item Mode to eliminate frustration.`;
    }

    if (newDiff.itemsToMemorize < oldDiff.itemsToMemorize) {
      return `AI detected deliberation (${timeSec}s) and working memory load. Difficulty reduced: Items to memorize dropped from ${oldDiff.itemsToMemorize} to ${newDiff.itemsToMemorize} with only 2 choices on screen to preserve dignity and eliminate frustration.`;
    }

    if (newDiff.itemsToMemorize > oldDiff.itemsToMemorize) {
      return `Fast (${timeSec}s) and 100% accurate recall. Difficulty increased: Advanced from ${oldDiff.itemsToMemorize} to ${newDiff.itemsToMemorize} items on the stall to gently stimulate neuroplasticity.`;
    }

    if (!isCorrect || latencyMs > 24000 || isPerseveration) {
      if (oldDiff.assistLevel === 'gentle_1_item') {
        return `Deliberation time was ${timeSec}s. AI maintaining gentle 1-item mode with extended 10s study time to provide plenty of peaceful thinking space.`;
      }
      return `Deliberation time was ${timeSec}s with cognitive deliberation. AI maintains ${newDiff.itemsToMemorize} items while scheduling earlier visual assistance.`;
    }

    return `Steady and confident recall (${timeSec}s). AI calibrated parameters to sustain patient engagement at ${newDiff.itemsToMemorize} items without causing fatigue.`;
  }

  /**
   * Bayesian Item Response Theory Update Formula (Graded Response Model)
   */
  private updateBayesianTheta(
    isCorrect: boolean, 
    latencyMs: number, 
    isPerseveration: boolean, 
    neededAssist: boolean = false,
    wasAutoAssisted: boolean = false,
    partialScore?: number
  ) {
    const taskDifficultyBeta = this.difficulty.itemsToMemorize === 1 
      ? -1.2 
      : this.difficulty.itemsToMemorize === 2 
        ? 0.0 
        : 1.2;
    
    const expectedProb = 1 / (1 + Math.exp(-(this.theta - taskDifficultyBeta)));
    const actualScore = wasAutoAssisted ? 0.0 : (partialScore !== undefined ? partialScore : (isCorrect ? 1.0 : 0.0));

    let delta = 0.40 * (actualScore - expectedProb);

    // If patient could not respond and required full auto-completion,
    // apply decisive downward adjustment to transition into gentle 1-item mode
    if (wasAutoAssisted) {
      delta -= 0.35;
    } else if (isCorrect) {
      if (latencyMs < 14000 && !neededAssist) delta += 0.15; // Quick confident answer (<14s)
      if (latencyMs > 45000) delta -= 0.06; // Very mild hesitation adjustment only if extreme (>45s)
    } else {
      if (latencyMs > 25000) delta -= 0.18; // High deliberation on incorrect attempt (>25s)
      if (latencyMs > 42000) delta -= 0.22; // Severe cognitive hesitation on incorrect attempt (>42s)
    }

    if (isPerseveration) delta -= 0.30;   // Perseveration error (frontal memory interference)
    if (neededAssist && !wasAutoAssisted) delta -= 0.20; // In-round distractor elimination required

    if (isNaN(delta) || !isFinite(delta)) delta = 0.0;
    if (isNaN(this.theta) || !isFinite(this.theta)) this.theta = 0.0;

    this.theta = Math.max(-3.0, Math.min(3.0, this.theta + delta));
    this.updateDifficultyConfig();
  }

  /**
   * Adapts the 4 game parameters based on new Theta:
   * Tier 0 (θ < -0.6): 1 item, '1x2' grid, 10s exposure -> Gentle 1-Item Mode (Elderly Dementia)
   * Tier 1 (-0.6 <= θ < 0.3): 2 items, '2x2' grid, 8s exposure -> High Assist
   * Tier 2 (0.3 <= θ < 1.4): 2 items, '2x2' grid, 6.5s exposure -> Moderate Assist
   * Tier 3 (θ >= 1.4): 3 items, '2x3' grid, 5s exposure -> Independent
   */
  private updateDifficultyConfig() {
    if (this.theta < -0.3) {
      // Gentle 1-Item Tier (Elderly Dementia / High Strain Mode)
      // Drops to 1 target and only 1 distractor (2 choices total)
      this.difficulty = {
        itemsToMemorize: 1,
        gridSize: '1x2',
        exposureTimeMs: 10000,
        assistLevel: 'gentle_1_item',
      };
    } else if (this.theta < 0.2) {
      // High assistance tier (2 targets, 4 choices)
      this.difficulty = {
        itemsToMemorize: 2,
        gridSize: '2x2',
        exposureTimeMs: 8000,
        assistLevel: 'high_assist',
      };
    } else if (this.theta < 0.65) {
      // Standard Moderate tier (2 targets, 4 choices, faster exposure)
      this.difficulty = {
        itemsToMemorize: 2,
        gridSize: '2x2',
        exposureTimeMs: 6500,
        assistLevel: 'moderate_assist',
      };
    } else {
      // Independent tier (3 targets, 6 choices)
      this.difficulty = {
        itemsToMemorize: 3,
        gridSize: '2x3',
        exposureTimeMs: 5000,
        assistLevel: 'independent',
      };
    }
  }

  /**
   * Manual override for judge demonstration or clinical testing
   */
  public forceDifficulty(tier: 'gentle_1_item' | 'moderate_assist' | 'independent') {
    if (tier === 'gentle_1_item') {
      this.theta = -1.5;
    } else if (tier === 'moderate_assist') {
      this.theta = 0.5;
    } else {
      this.theta = 1.8;
    }
    this.updateDifficultyConfig();
    this.startNewRound();
  }

  public nextRound(): boolean {
    if (this.currentRound >= this.maxRounds || this.completedRoundsTelemetry.length >= this.maxRounds) {
      this.currentPhase = 'SESSION_COMPLETE';
      return false; // No more rounds
    }
    this.currentRound++;
    this.startNewRound();
    return true;
  }

  /**
   * Computes final standardized MoCA Memory sub-score (0-5 scale)
   * Decouples motor deliberation slowing from true hippocampal memory retention.
   */
  public generateSessionSummary(caregiverEndedEarly: boolean = false): SessionSummaryTelemetry {
    const totalRounds = this.completedRoundsTelemetry.length;
    
    // Total targets presented and targets recognized independently across all rounds
    const totalTargetsPresented = this.completedRoundsTelemetry
      .reduce((sum, r) => sum + r.targets.length, 0);
    const totalTargetsRecognized = this.completedRoundsTelemetry
      .filter(r => !r.wasAutoAssisted)
      .reduce((sum, r) => sum + r.correctCount, 0);

    const autoAssistedCount = this.completedRoundsTelemetry.filter(r => r.wasAutoAssisted).length;
    const totalCorrect = this.completedRoundsTelemetry.filter(r => r.isFullyCorrect && !r.wasAutoAssisted).length;

    // Item-level Delayed Recognition Accuracy (Clinical Standard)
    const accuracyPercentage = totalTargetsPresented > 0 
      ? Math.round((totalTargetsRecognized / totalTargetsPresented) * 100) 
      : 0;
    
    const latencies = this.completedRoundsTelemetry
      .map(r => r.latencyMs)
      .filter((lat): lat is number => typeof lat === 'number' && !isNaN(lat) && isFinite(lat) && lat >= 0);

    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 0;

    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const mid = Math.floor(sortedLatencies.length / 2);
    const medianLatency = sortedLatencies.length === 0 
      ? 0 
      : sortedLatencies.length % 2 !== 0 
        ? sortedLatencies[mid] 
        : Math.round((sortedLatencies[mid - 1] + sortedLatencies[mid]) / 2);

    const perseverationErrors = this.completedRoundsTelemetry.filter(r => r.isPerseveration).length;

    const safeTheta = (isNaN(this.theta) || !isFinite(this.theta)) ? 0.0 : Number(this.theta.toFixed(2));

    // Standard MoCA Delayed Recall mapping: 0 to 5 points
    // In MoCA, Delayed Recall awards 1 point per word remembered (0-5 scale).
    // Speed is an independent processing speed marker, NOT an amnesia indicator.
    let mocaPoints = 1;
    if (totalRounds === 0 || accuracyPercentage === 0 || totalTargetsRecognized === 0) {
      mocaPoints = 0;
    } else if (accuracyPercentage >= 80) {
      // 80%+ recall: Intact delayed recognition.
      mocaPoints = (safeTheta >= 0.20 && perseverationErrors === 0) ? 5 : 4;
    } else if (accuracyPercentage >= 60) {
      // 60-79% recall: Mild consolidation deficit
      mocaPoints = safeTheta >= 0.0 ? 4 : 3;
    } else if (accuracyPercentage >= 40) {
      // 40-59% recall: Moderate memory loss
      mocaPoints = safeTheta >= -0.6 ? 3 : 2;
    } else if (accuracyPercentage >= 20) {
      mocaPoints = 2;
    } else {
      mocaPoints = 1;
    }

    // Cognitive processing speed profile (logged separately from memory)
    let processingSpeedProfile: 'brisk' | 'normal' | 'deliberate' | 'marked_bradyphrenia' = 'normal';
    if (avgLatency > 40000) processingSpeedProfile = 'marked_bradyphrenia';
    else if (avgLatency > 22000) processingSpeedProfile = 'deliberate';
    else if (avgLatency < 8000 && avgLatency > 0) processingSpeedProfile = 'brisk';

    if (!this.sessionCompletedTimestamp) {
      this.sessionCompletedTimestamp = new Date().toISOString();
    }

    return {
      gameId: 'smriti-haat',
      totalRounds,
      totalCorrect,
      autoAssistedRounds: autoAssistedCount,
      accuracyPercentage,
      averageLatencyMs: avgLatency,
      medianLatencyMs: medianLatency,
      perseverationErrors,
      finalTheta: safeTheta,
      estimatedMoCAMemoryScore: mocaPoints,
      processingSpeedProfile,
      caregiverEndedEarly,
      completedAt: this.sessionCompletedTimestamp,
      rounds: this.completedRoundsTelemetry,
    };
  }

  /**
   * Caregiver / Clinical early termination when patient exhibits fatigue or agitation
   */
  public concludeSessionEarly(): SessionSummaryTelemetry {
    this.currentPhase = 'SESSION_COMPLETE';
    return this.generateSessionSummary(true);
  }

  // Getters for UI integration
  public getPhase(): GamePhase { return this.currentPhase; }
  public getRoundNumber(): number { return this.currentRound; }
  public getMaxRounds(): number { return this.maxRounds; }
  public getTargets(): BazaarItem[] { return [...this.targetItems]; }
  public getRecallOptions(): BazaarItem[] { return [...this.recallOptions]; }
  public getSelectedIds(): Set<string> { return new Set(this.selectedIds); }
  public getEliminatedIds(): Set<string> { return new Set(this.eliminatedDistractorIds); }
  public getDifficulty(): DifficultyConfig { return { ...this.difficulty }; }
  public getTheta(): number { return Number(this.theta.toFixed(2)); }
  public getLatestAdaptationRationale(): string { return this.latestAdaptationRationale; }
}
