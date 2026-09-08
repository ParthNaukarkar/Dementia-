/**
 * SmritiNER - Game 9: Pattern Recall (Noxar Chonda / চানেকিৰ ছন্দ)
 * 9-Tier Bayesian 2PL Item Response Theory (IRT) Cognitive Engine
 * 400ms Parkinsonian Tremor Guard, MoCA Visuospatial Calibration & Edge ML Staging.
 */

import type { SupportedLanguage } from '../../types/prescription';
import type {
  PatternRecallDifficulty,
  PatternRecallGeneratedTrial,
  PatternRecallSettingsSnapshot,
  PatternRecallTrialTelemetry,
  PatternRecallSessionSummary,
  OasisPatternRecallPersona,
  VisuospatialRetentionStatus,
  VisuomotorExecutionProfile,
  MotorTremorStatus,
} from './types';
import { MOTIF_THEMES, PatternGenerator } from './data';
import { CognitiveClassifier } from '../../engine/cognitive-classifier';

/**
 * 9 Psychometrically Calibrated Minimal-Step Tiers (2PL IRT)
 */
export const PATTERN_RECALL_TIERS: PatternRecallDifficulty[] = [
  // Tier 1: Floor - Severe Dementia (CDR 2.0, MMSE <= 15)
  {
    tierLevel: 1,
    gridSize: 2,
    patternLength: 2,
    displayDurationMs: 5000,
    peeksAllowed: 2,
    beaconAllowed: true,
    beaconIlluminatesCount: 2,
    topology: 'adjacent_linear',
    autoAssistTimeoutMs: 20000,
    tremorDebounceMs: 400,
    itemDifficultyB: -2.2,
    discriminationA: 1.2,
    tierDescription: {
      as: 'স্তৰ ১: নিম্নতম সীমা (২x২ গ্ৰিড, ২টা চানেকি, ৫ ছেকেণ্ড প্ৰদৰ্শন)',
      bn: 'স্তর ১: সর্বনিম্ন সীমা (২x২ গ্রিড, ২টি নকশা, ৫ সেকেন্ড প্রদর্শন)',
      hi: 'स्तर १: न्यूनतम सीमा (२x२ ग्रिड, २ टाइल, ५ सेकंड प्रदर्शन)',
      en: 'Tier 1: Cognitive Floor (2x2 grid, 2 tiles, 5000ms display)',
    },
  },
  // Tier 2: Moderate Impairment (CDR 1.0, MMSE 16-19)
  {
    tierLevel: 2,
    gridSize: 2,
    patternLength: 3,
    displayDurationMs: 4500,
    peeksAllowed: 2,
    beaconAllowed: true,
    beaconIlluminatesCount: 2,
    topology: 'adjacent_linear',
    autoAssistTimeoutMs: 18000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.7,
    discriminationA: 1.25,
    tierDescription: {
      as: 'স্তৰ ২: সুষম অগ্ৰগতি (২x২ গ্ৰিড, ৩টা চানেকি, ৪.৫ ছেকেণ্ড)',
      bn: 'স্তর ২: সুষম অগ্রগতি (২x২ গ্রিড, ৩টি নকশা, ৪.৫ সেকেন্ড)',
      hi: 'स्तर २: सुचारू प्रगति (२x२ ग्रिड, ३ टाइल, ४.५ सेकंड)',
      en: 'Tier 2: Gradual Step (2x2 grid, 3 tiles, 4500ms display)',
    },
  },
  // Tier 3: Mild-to-Moderate Impairment (CDR 1.0, MMSE 20-22)
  {
    tierLevel: 3,
    gridSize: 3,
    patternLength: 3,
    displayDurationMs: 4000,
    peeksAllowed: 2,
    beaconAllowed: true,
    beaconIlluminatesCount: 2,
    topology: 'clustered_quadrant',
    autoAssistTimeoutMs: 16000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.1,
    discriminationA: 1.3,
    tierDescription: {
      as: 'স্তৰ ৩: ৩x৩ সংলগ্ন চানেকি (৩টা চানেকি, ৪ ছেকেণ্ড)',
      bn: 'স্তর ৩: ৩x৩ সংলগ্ন নকশা (৩টি নকশা, ৪ সেকেন্ড)',
      hi: 'स्तर ३: ३x३ निकट पैटर्न (३ टाइल, ४ सेकंड)',
      en: 'Tier 3: 3x3 Clustered (3 tiles, 4000ms display)',
    },
  },
  // Tier 4: Mild Impairment (CDR 0.5, MMSE 23-25)
  {
    tierLevel: 4,
    gridSize: 3,
    patternLength: 4,
    displayDurationMs: 3500,
    peeksAllowed: 1,
    beaconAllowed: true,
    beaconIlluminatesCount: 1,
    topology: 'clustered_quadrant',
    autoAssistTimeoutMs: 14000,
    tremorDebounceMs: 400,
    itemDifficultyB: -0.5,
    discriminationA: 1.4,
    tierDescription: {
      as: 'স্তৰ ৪: মধ্যমীয়া ৩x৩ গ্ৰিড (৪টা চানেকি, ৩.৫ ছেকেণ্ড)',
      bn: 'স্তর ৪: মাঝারি ৩x৩ গ্রিড (৪টি নকশা, ৩.৫ সেকেন্ড)',
      hi: 'स्तर ४: मध्यम ३x३ ग्रिड (४ टाइल, ३.৫ सेकंड)',
      en: 'Tier 4: Intermediate 3x3 (4 tiles, 3500ms display)',
    },
  },
  // Tier 5: Baseline - Mild Cognitive Impairment (CDR 0.5, MMSE 26)
  {
    tierLevel: 5,
    gridSize: 3,
    patternLength: 4,
    displayDurationMs: 3000,
    peeksAllowed: 1,
    beaconAllowed: true,
    beaconIlluminatesCount: 1,
    topology: 'diagonal_distributed',
    autoAssistTimeoutMs: 12000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.0,
    discriminationA: 1.45,
    tierDescription: {
      as: 'স্তৰ ৫: ভিত্তিৰেখা (৩x৩ গ্ৰিড, কৰ্ণীয় চানেকি, ৩ ছেকেণ্ড)',
      bn: 'স্তর ৫: ভিত্তিরেখা (৩x৩ গ্রিড, তির্যক নকশা, ৩ সেকেন্ড)',
      hi: 'स्तर ५: आधारभूत स्तर (३x३ ग्रिड, विकर्ण पैटर्न, ३ सेकंड)',
      en: 'Tier 5: Clinical Baseline (3x3 grid, diagonal pattern, 3000ms)',
    },
  },
  // Tier 6: High Normal Transition (CDR 0.0, MMSE 27-28)
  {
    tierLevel: 6,
    gridSize: 4,
    patternLength: 4,
    displayDurationMs: 2750,
    peeksAllowed: 1,
    beaconAllowed: true,
    beaconIlluminatesCount: 1,
    topology: 'semi_clustered_quadrant',
    autoAssistTimeoutMs: 10500,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.6,
    discriminationA: 1.55,
    tierDescription: {
      as: 'স্তৰ ৬: ৪x৪ প্ৰাৰম্ভিক গ্ৰিড (৪টা চানেকি, ২.৭৫ ছেকেণ্ড)',
      bn: 'স্তর ৬: ৪x৪ প্রাথমিক গ্রিড (৪টি নকশা, ২.৭৫ সেকেন্ড)',
      hi: 'स्तर ६: ४x४ प्रारंभिक ग्रिड (४ टाइल, २.७५ सेकंड)',
      en: 'Tier 6: 4x4 Quadrant (4 tiles, 2750ms display)',
    },
  },
  // Tier 7: Healthy Normal Control (CDR 0.0, MMSE 29)
  {
    tierLevel: 7,
    gridSize: 4,
    patternLength: 5,
    displayDurationMs: 2400,
    peeksAllowed: 1,
    beaconAllowed: true,
    beaconIlluminatesCount: 1,
    topology: 'complex_distributed',
    autoAssistTimeoutMs: 9000,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.2,
    discriminationA: 1.65,
    tierDescription: {
      as: 'স্তৰ ৭: ৪x৪ জটিল চানেকি (৫টা চানেকি, ২.৪ ছেকেণ্ড)',
      bn: 'স্তর ৭: ৪x৪ জটিল নকশা (৫টি নকশা, ২.৪ সেকেন্ড)',
      hi: 'स्तर ७: ४x४ जटिल पैटर्न (५ टाइल, २.४ सेकंड)',
      en: 'Tier 7: 4x4 Complex (5 tiles, 2400ms display)',
    },
  },
  // Tier 8: High Cognitive Reserve (CDR 0.0, MMSE 30)
  {
    tierLevel: 8,
    gridSize: 4,
    patternLength: 5,
    displayDurationMs: 2000,
    peeksAllowed: 0,
    beaconAllowed: true,
    beaconIlluminatesCount: 1,
    topology: 'complex_distributed',
    autoAssistTimeoutMs: 8000,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.8,
    discriminationA: 1.7,
    tierDescription: {
      as: 'স্তৰ ৮: ক্ষিপ্ৰ ৪x৪ চানেকি (৫টা চানেকি, ২ ছেকেণ্ড, নিৰ্বাক সহায়)',
      bn: 'স্তর ৮: ক্ষিপ্র ৪x৪ নকশা (৫টি নকশা, ২ সেকেন্ড, সহায়তাহীন)',
      hi: 'स्तर ८: तीव्र ४x४ पैटर्न (५ टाइल, २ सेकंड, सहायता रहित)',
      en: 'Tier 8: Rapid 4x4 (5 tiles, 2000ms, unassisted)',
    },
  },
  // Tier 9: Ceiling - Peak Visuospatial Mastery (CDR 0.0, MMSE 30+)
  {
    tierLevel: 9,
    gridSize: 5,
    patternLength: 6,
    displayDurationMs: 1500,
    peeksAllowed: 0,
    beaconAllowed: true,
    beaconIlluminatesCount: 1,
    topology: 'high_entropy_dispersed',
    autoAssistTimeoutMs: 7000,
    tremorDebounceMs: 400,
    itemDifficultyB: 2.4,
    discriminationA: 1.8,
    tierDescription: {
      as: 'স্তৰ ৯: সৰ্বোচ্চ সীমা (৫x৫ গ্ৰিড, ৬টা চানেকি, ১.৫ ছেকেণ্ড)',
      bn: 'স্তর ৯: সর্বোচ্চ সীমা (৫x৫ গ্রিড, ৬টি নকশা, ১.৫ সেকেন্ড)',
      hi: 'स्तर ९: उच्चतम सीमा (५x५ ग्रिड, ६ टाइल, १.५ सेकंड)',
      en: 'Tier 9: Cognitive Ceiling (5x5 grid, 6 tiles, 1500ms display)',
    },
  },
];

export class PatternRecallEngine {
  private currentDifficulty: PatternRecallDifficulty;
  private currentTheta: number;
  private tremorTapsFilteredCount: number = 0;
  private lastTapTimestamp: number = 0;
  private lastTappedCellIndex: number = -1;

  constructor(initialTheta: number = 0.0) {
    this.currentTheta = initialTheta;
    this.currentDifficulty = this.deriveDifficultyFromTheta(initialTheta);
  }

  public getTheta(): number {
    return this.currentTheta;
  }

  public setTheta(theta: number): void {
    this.currentTheta = Math.max(-3.0, Math.min(3.0, theta));
    this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
  }

  public getDifficulty(): PatternRecallDifficulty {
    return this.currentDifficulty;
  }

  public setDifficulty(diff: PatternRecallDifficulty): void {
    this.currentDifficulty = diff;
  }

  public getTremorFilteredCount(): number {
    return this.tremorTapsFilteredCount;
  }

  public resetTremorCount(): void {
    this.tremorTapsFilteredCount = 0;
    this.lastTapTimestamp = 0;
    this.lastTappedCellIndex = -1;
  }

  /**
   * 400ms Motor Tremor Debounce Guard
   * Prevents Parkinsonian double-taps and jitter from affecting user state.
   * Includes backward clock rollback shield.
   */
  public filterTremorTap(cellIndex: number, nowMs?: number): boolean {
    const now = nowMs ?? Date.now();

    // Clock rollback shield
    if (now < this.lastTapTimestamp) {
      this.lastTapTimestamp = now;
      this.lastTappedCellIndex = cellIndex;
      return true;
    }

    const elapsed = now - this.lastTapTimestamp;
    const isRapidRepeat = elapsed < this.currentDifficulty.tremorDebounceMs && cellIndex === this.lastTappedCellIndex;

    if (isRapidRepeat) {
      this.tremorTapsFilteredCount++;
      return false; // Filtered jitter
    }

    this.lastTapTimestamp = now;
    this.lastTappedCellIndex = cellIndex;
    return true; // Valid deliberate tap
  }

  /**
   * Derives optimal minimal-step tier from Bayesian latent ability θ
   */
  public deriveDifficultyFromTheta(theta: number): PatternRecallDifficulty {
    if (theta >= 2.2) return PATTERN_RECALL_TIERS[8]; // Tier 9
    if (theta >= 1.6) return PATTERN_RECALL_TIERS[7]; // Tier 8
    if (theta >= 1.0) return PATTERN_RECALL_TIERS[6]; // Tier 7
    if (theta >= 0.4) return PATTERN_RECALL_TIERS[5]; // Tier 6
    if (theta >= -0.2) return PATTERN_RECALL_TIERS[4]; // Tier 5
    if (theta >= -0.8) return PATTERN_RECALL_TIERS[3]; // Tier 4
    if (theta >= -1.4) return PATTERN_RECALL_TIERS[2]; // Tier 3
    if (theta >= -2.0) return PATTERN_RECALL_TIERS[1]; // Tier 2
    return PATTERN_RECALL_TIERS[0]; // Tier 1
  }

  public getDifficultyForTierLevel(tierLevel: number): PatternRecallDifficulty {
    const clamped = Math.max(1, Math.min(9, Math.round(tierLevel)));
    return PATTERN_RECALL_TIERS[clamped - 1];
  }

  /**
   * Generates a psychometrically valid trial according to tier specifications
   */
  public generateTrial(
    trialIndex: number,
    difficulty: PatternRecallDifficulty
  ): PatternRecallGeneratedTrial {
    const pattern = PatternGenerator.generatePattern(
      difficulty.gridSize,
      difficulty.patternLength,
      difficulty.topology
    );

    const motifTheme = MOTIF_THEMES[(trialIndex - 1) % MOTIF_THEMES.length].id;

    return {
      trialIndex,
      gridSize: difficulty.gridSize,
      pattern,
      patternLength: difficulty.patternLength,
      displayDurationMs: difficulty.displayDurationMs,
      difficulty,
      motifTheme,
    };
  }

  /**
   * Selects 1 or 2 unselected target cells to illuminate as a Golden Beacon Hint
   */
  public getBeaconHintTiles(
    trial: PatternRecallGeneratedTrial,
    currentSelection: number[],
    countToIlluminate: number
  ): number[] {
    const unselectedTargets = trial.pattern.filter(idx => !currentSelection.includes(idx));
    if (unselectedTargets.length === 0) {
      return trial.pattern.slice(0, countToIlluminate);
    }
    // Select up to countToIlluminate unselected target cells
    return unselectedTargets.slice(0, Math.min(unselectedTargets.length, countToIlluminate));
  }

  /**
   * Bayesian 2PL Item Response Theory (IRT) Latent Ability Update
   * Incorporates Assistance Discounts (peeks, beacons, and latency)
   * Guaranteed progression: Δθ >= +0.02 on correct solve
   */
  public updateTheta(
    isCorrect: boolean,
    deliberationMs: number,
    settings: PatternRecallSettingsSnapshot,
    tilesRecalledRatio: number = 1.0
  ): {
    newTheta: number;
    deltaTheta: number;
    autonomyScore: number;
    reasoning: string;
  } {
    const diff = this.currentDifficulty;
    const a = diff.discriminationA;
    const b = diff.itemDifficultyB;

    // 1. 2PL IRT Probability of unassisted correct response
    const exponent = -a * (this.currentTheta - b);
    const pSuccess = 1.0 / (1.0 + Math.exp(Math.max(-12, Math.min(12, exponent))));

    // 2. Compute assistance discount
    let creditU = isCorrect ? 1.0 : tilesRecalledRatio * 0.25;
    if (isCorrect) {
      if (settings.peeksUsedCount > 0) creditU -= settings.peeksUsedCount * 0.15;
      if (settings.beaconHintUsed) creditU -= 0.15;
      if (deliberationMs > 10000) creditU -= 0.10;
      creditU = Math.max(0.40, creditU); // Dignified credit maintained
    }

    // 3. Information & Fisher Update
    const weight = 0.55;
    let delta = weight * (creditU - pSuccess);

    // Guaranteed progression on correct solve
    if (isCorrect && delta < 0.02) {
      delta = 0.02;
    } else if (!isCorrect) {
      delta = Math.max(-0.50, delta);
    }

    const unclipped = this.currentTheta + delta;
    const newTheta = Math.max(-3.0, Math.min(3.0, Number(unclipped.toFixed(3))));
    this.currentTheta = newTheta;

    // 4. Patient Autonomy Index (100% unassisted)
    let autonomy = 100;
    autonomy -= settings.peeksUsedCount * 15;
    if (settings.beaconHintUsed) autonomy -= 15;
    if (deliberationMs > 9000) autonomy -= 10;
    if (this.tremorTapsFilteredCount > 3) autonomy -= 4;
    const autonomyScore = Math.max(10, Math.min(100, autonomy));

    const reasoning = isCorrect
      ? `Accurate pattern recall (deliberation: ${deliberationMs}ms, peeks: ${settings.peeksUsedCount}, beacon: ${settings.beaconHintUsed}) -> θ adjusted by +${delta.toFixed(3)}.`
      : `Spatial error on Tier ${diff.tierLevel} (${Math.round(tilesRecalledRatio * 100)}% tiles recalled) -> θ adjusted by ${delta.toFixed(3)}.`;

    return {
      newTheta,
      deltaTheta: delta,
      autonomyScore,
      reasoning,
    };
  }

  /**
   * Compiles comprehensive clinical session summary with Edge ML Cognitive Staging.
   */
  public compileSessionSummary(
    trials: PatternRecallTrialTelemetry[],
    caregiverEndedEarly: boolean = false
  ): PatternRecallSessionSummary {
    const totalTrials = trials.length;
    const correctTrials = trials.filter(t => t.isCorrect).length;
    const accuracyPercentage = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

    const meanDeliberationMs = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.deliberationTimeMs, 0) / totalTrials)
      : 0;

    const meanTimeToFirstTapMs = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.timeToFirstTapMs, 0) / totalTrials)
      : meanDeliberationMs;

    const totalPeeksUsed = trials.reduce((acc, t) => acc + t.peeksUsedCount, 0);
    const totalBeaconsUsed = trials.filter(t => t.beaconHintUsed).length;
    const autonomyScore = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.autonomyScore, 0) / totalTrials)
      : 100;

    // Maximum spatial span recalled successfully
    let maxSpatialSpanRecalled = 0;
    trials.forEach(t => {
      if (t.isCorrect && t.patternLength > maxSpatialSpanRecalled) {
        maxSpatialSpanRecalled = t.patternLength;
      }
    });

    // Visuospatial Retention Status
    let visuospatialRetentionStatus: VisuospatialRetentionStatus = 'intact_spatial_span';
    if (this.currentTheta < -1.4) {
      visuospatialRetentionStatus = 'severe_spatial_fragmentation';
    } else if (this.currentTheta < -0.3) {
      visuospatialRetentionStatus = 'moderate_span_reduction';
    } else if (this.currentTheta < 0.8) {
      visuospatialRetentionStatus = 'mild_spatial_decay';
    }

    // Visuomotor Execution Profile
    let visuomotorExecutionProfile: VisuomotorExecutionProfile = 'rapid_spatial_saccade';
    if (this.tremorTapsFilteredCount >= 5) {
      visuomotorExecutionProfile = 'motor_tremor_dominant';
    } else if (totalBeaconsUsed >= 2 || meanDeliberationMs > 8500) {
      visuomotorExecutionProfile = 'hesitant_beacon_reliant';
    } else if (meanDeliberationMs > 4500) {
      visuomotorExecutionProfile = 'deliberate_exploratory';
    }

    // Motor Tremor Profile
    let motorTremorStatus: MotorTremorStatus = 'normal_motor';
    if (this.tremorTapsFilteredCount >= 5) {
      motorTremorStatus = 'tremor_dominant';
    } else if (this.tremorTapsFilteredCount >= 2) {
      motorTremorStatus = 'mild_hesitation_jitter';
    }

    // Estimated MoCA Visuospatial Score (0 to 5 composite scale)
    // Calibrated from Bayesian latent ability θ and empirical accuracy.
    const finalTheta = trials.length > 0 ? trials[trials.length - 1].thetaAfterTrial : this.currentTheta;
    this.currentTheta = finalTheta;
    const thetaScaled = 2.5 + (finalTheta / 2.0) * 2.5;
    const accuracyScaled = (accuracyPercentage / 100.0) * 5.0;
    const compositeMoCA = 0.6 * thetaScaled + 0.4 * accuracyScaled;
    const estimatedMoCAVisuospatialScore = Math.max(0, Math.min(5, Number(compositeMoCA.toFixed(1))));

    // Edge ML Cognitive Classifier features
    const latencyStdDev = totalTrials > 1
      ? Math.round(Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.deliberationTimeMs - meanDeliberationMs, 2), 0) / totalTrials))
      : 800;
    const hesitationTrials = trials.filter(t => t.deliberationTimeMs > 7000).length;
    const hesitationRatio = totalTrials > 0 ? hesitationTrials / totalTrials : 0;
    const totalTaps = trials.reduce((acc, t) => acc + t.totalTapsCount, 0);
    const tremorIndex = totalTaps + this.tremorTapsFilteredCount > 0
      ? this.tremorTapsFilteredCount / (totalTaps + this.tremorTapsFilteredCount)
      : 0;

    const oasisClinicalClassification = CognitiveClassifier.classify({
      meanLatencyMs: meanDeliberationMs,
      latencyVarianceMs: latencyStdDev,
      accuracyPct: accuracyPercentage,
      perseverationRate: 0,
      hesitationRatio,
      tremorJitterIndex: tremorIndex,
    });

    return {
      gameId: 'pattern-recall',
      totalTrials,
      correctTrials,
      accuracyPercentage,
      meanDeliberationMs,
      meanTimeToFirstTapMs,
      totalPeeksUsed,
      totalBeaconsUsed,
      tremorTapsFilteredTotal: this.tremorTapsFilteredCount,
      maxSpatialSpanRecalled,
      autonomyScore,
      finalTheta: this.currentTheta,
      estimatedMoCAVisuospatialScore,
      visuospatialRetentionStatus,
      visuomotorExecutionProfile,
      motorTremorStatus,
      oasisClinicalClassification,
      caregiverEndedEarly,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Simulates authentic OASIS-2 patient action for realistic testing and clinical verification.
   */
  public simulateOasisPatientAction(
    persona: OasisPatternRecallPersona,
    trial: PatternRecallGeneratedTrial,
    tier: PatternRecallDifficulty
  ): {
    playerSelection: number[];
    isCorrect: boolean;
    peeksUsedCount: number;
    beaconHintUsed: boolean;
    beaconTileIndices: number[];
    deliberationTimeMs: number;
    hasTremorJitter: boolean;
    tremorJitterCount: number;
    clinicalObservation: Record<SupportedLanguage, string>;
  } {
    // 1. Peeks & Beacon usage
    const peeksUsedCount = tier.peeksAllowed > 0 && Math.random() < persona.peekReplayProbability
      ? Math.min(tier.peeksAllowed, Math.random() < 0.3 ? 2 : 1)
      : 0;

    const beaconHintUsed = tier.beaconAllowed && Math.random() < persona.beaconHintProbability;
    const beaconTileIndices = beaconHintUsed
      ? this.getBeaconHintTiles(trial, [], tier.beaconIlluminatesCount)
      : [];

    // 2. Latency
    const baseDelib = persona.expectedDeliberationMs;
    const latencyNoise = 0.85 + Math.random() * 0.3;
    const deliberationTimeMs = Math.max(1400, Math.round(baseDelib * latencyNoise));

    // 3. Tremor jitter
    const hasTremorJitter = Math.random() < persona.tremorJitterProbability;
    const tremorJitterCount = hasTremorJitter ? Math.floor(Math.random() * 3) + 1 : 0;
    for (let i = 0; i < tremorJitterCount; i++) {
      this.tremorTapsFilteredCount++;
    }

    // 4. Accuracy calculation
    let prob = persona.accuracyProbability;
    if (peeksUsedCount > 0) prob = Math.min(0.98, prob + peeksUsedCount * 0.08);
    if (beaconHintUsed) prob = Math.min(0.98, prob + 0.14);
    if (tier.tierLevel >= 7 && persona.cdr > 0) prob = Math.max(0.15, prob - 0.12);

    const isCorrect = Math.random() < prob;
    let playerSelection: number[] = [];

    if (isCorrect) {
      playerSelection = [...trial.pattern];
    } else {
      // Incomplete or flawed recall: miss 1 or 2 target cells and select non-targets
      const targetCopy = [...trial.pattern];
      const correctToKeep = Math.max(1, targetCopy.length - (Math.random() < 0.6 ? 1 : 2));
      const kept = targetCopy.slice(0, correctToKeep);

      // Add distractor off-pattern cells
      const totalCells = trial.gridSize * trial.gridSize;
      const offPatternCells: number[] = [];
      for (let i = 0; i < totalCells; i++) {
        if (!trial.pattern.includes(i)) {
          offPatternCells.push(i);
        }
      }

      const distractors = offPatternCells.sort(() => Math.random() - 0.5).slice(0, trial.patternLength - kept.length);
      playerSelection = [...kept, ...distractors].sort((a, b) => a - b);
    }

    const clinicalObservation: Record<SupportedLanguage, string> = {
      as: `${persona.name} (${persona.clinicalDiagnosis}) - পিক: ${peeksUsedCount}, বিকন: ${beaconHintUsed ? 'ব্যৱহৃত' : 'নাই'}, সময়: ${deliberationTimeMs}ms, ফলাফল: ${isCorrect ? 'সঠিক' : 'ভুল'}।`,
      bn: `${persona.name} (${persona.clinicalDiagnosis}) - পিক: ${peeksUsedCount}, বিকন: ${beaconHintUsed ? 'ব্যবহৃত' : 'না'}, সময়: ${deliberationTimeMs}ms, ফলাফল: ${isCorrect ? 'সঠিক' : 'ভুল'}।`,
      hi: `${persona.name} (${persona.clinicalDiagnosis}) - पीक: ${peeksUsedCount}, बीकन: ${beaconHintUsed ? 'प्रयुक्त' : 'नहीं'}, समय: ${deliberationTimeMs}ms, परिणाम: ${isCorrect ? 'सटीक' : 'अशुद्ध'}।`,
      en: `${persona.name} (${persona.clinicalDiagnosis}): peeks ${peeksUsedCount}, beacon ${beaconHintUsed ? 'used' : 'none'}, deliberation ${deliberationTimeMs}ms, result ${isCorrect ? 'Correct' : 'Incorrect'}.`,
    };

    return {
      playerSelection,
      isCorrect,
      peeksUsedCount,
      beaconHintUsed,
      beaconTileIndices,
      deliberationTimeMs,
      hasTremorJitter,
      tremorJitterCount,
      clinicalObservation,
    };
  }
}
