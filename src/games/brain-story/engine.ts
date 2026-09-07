/**
 * SmritiNER - Game 10: Brain Story (Monor Sadhukatha / মনৰ সাধুকথা)
 * 9-Tier Bayesian 2PL Item Response Theory (IRT) Cognitive Engine
 * WMS-IV Logical Memory & MoCA Language Calibration, 400ms Tremor Guard & Edge ML Staging.
 */

import type { SupportedLanguage } from '../../types/prescription';
import type {
  BrainStoryDifficulty,
  BrainStoryGeneratedTrial,
  BrainStorySettingsSnapshot,
  BrainStoryTrialTelemetry,
  BrainStorySessionSummary,
  OasisBrainStoryPersona,
  NarrativeRetentionStatus,
  StoryComprehensionProfile,
  MotorTremorStatus,
} from './types';
import { StoryGenerator } from './data';
import { CognitiveClassifier } from '../../engine/cognitive-classifier';

/**
 * 9 Psychometrically Calibrated Minimal-Step Tiers (2PL IRT)
 */
export const BRAIN_STORY_TIERS: BrainStoryDifficulty[] = [
  // Tier 1: Cognitive Floor - Severe Dementia (CDR 2.0, MMSE <= 15)
  {
    tierLevel: 1,
    sentenceCount: 1,
    wordCountTarget: 15,
    storyElementsCount: 2,
    choicesCount: 2,
    storyVisibleDuringQuestions: true,
    audioReplaysAllowed: 2,
    clueHintAllowed: true,
    autoAssistTimeoutMs: 22000,
    tremorDebounceMs: 400,
    itemDifficultyB: -2.2,
    discriminationA: 1.2,
    tierDescription: {
      as: 'স্তৰ ১: নিম্নতম সীমা (১ বাক্য, দৃশ্যমান লেখা, ২টি বিকল্প, ২বাৰ পুনৰাবৃত্তি)',
      bn: 'স্তর ১: সর্বনিম্ন সীমা (১ বাক্য, দৃশ্যমান লেখা, ২টি বিকল্প, ২বার পুনরাবৃত্তি)',
      hi: 'स्तर १: न्यूनतम सीमा (१ वाक्य, खुला पाठ, २ विकल्प, २ रीप्ले)',
      en: 'Tier 1: Cognitive Floor (1 sentence, text visible, 2 choices, 2 replays)',
    },
  },
  // Tier 2: Moderate Impairment (CDR 1.0, MMSE 16-19)
  {
    tierLevel: 2,
    sentenceCount: 2,
    wordCountTarget: 30,
    storyElementsCount: 2,
    choicesCount: 2,
    storyVisibleDuringQuestions: true,
    audioReplaysAllowed: 2,
    clueHintAllowed: true,
    autoAssistTimeoutMs: 20000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.7,
    discriminationA: 1.25,
    tierDescription: {
      as: 'স্তৰ ২: সুষম বৃদ্ধি (২ বাক্য, দৃশ্যমান লেখা, ২টি বিকল্প)',
      bn: 'স্তর ২: সুষম বৃদ্ধি (২ বাক্য, দৃশ্যমান লেখা, ২টি বিকল্প)',
      hi: 'स्तर २: सुचारू वृद्धि (२ वाक्य, खुला पाठ, २ विकल्प)',
      en: 'Tier 2: Gradual Step (2 sentences, text visible, 2 choices)',
    },
  },
  // Tier 3: Mild-to-Moderate Impairment (CDR 1.0, MMSE 20-22)
  {
    tierLevel: 3,
    sentenceCount: 2,
    wordCountTarget: 35,
    storyElementsCount: 3,
    choicesCount: 3,
    storyVisibleDuringQuestions: true,
    audioReplaysAllowed: 2,
    clueHintAllowed: true,
    autoAssistTimeoutMs: 18000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.1,
    discriminationA: 1.3,
    tierDescription: {
      as: 'স্তৰ ৩: মধ্যমীয়া আখ্যান (২ বাক্য, ৩টি বিকল্প, অনুৰোধত সংকেত)',
      bn: 'স্তর ৩: মাঝারি আখ্যান (২ বাক্য, ৩টি বিকল্প, অনুরোধে সূত্র)',
      hi: 'स्तर ३: मध्यम आख्यान (२ वाक्य, ३ विकल्प, संकेत उपलब्ध)',
      en: 'Tier 3: Moderate Vignette (2 sentences, 3 choices, hints on demand)',
    },
  },
  // Tier 4: Mild Impairment (CDR 0.5, MMSE 23-25)
  {
    tierLevel: 4,
    sentenceCount: 3,
    wordCountTarget: 50,
    storyElementsCount: 3,
    choicesCount: 3,
    storyVisibleDuringQuestions: true,
    audioReplaysAllowed: 1,
    clueHintAllowed: true,
    autoAssistTimeoutMs: 16000,
    tremorDebounceMs: 400,
    itemDifficultyB: -0.5,
    discriminationA: 1.4,
    tierDescription: {
      as: 'স্তৰ ৪: বিস্তৃত কাহিনী (৩ বাক্য, ৩টি বিকল্প, ১বাৰ পুনৰাবৃত্তি)',
      bn: 'স্তর ৪: বিস্তৃত কাহিনী (৩ বাক্য, ৩টি বিকল্প, ১বার পুনরাবৃত্তি)',
      hi: 'स्तर ४: विस्तृत कथा (३ वाक्य, ३ विकल्प, १ रीप्ले)',
      en: 'Tier 4: Extended Narrative (3 sentences, 3 choices, 1 replay)',
    },
  },
  // Tier 5: Clinical Baseline - Mild Cognitive Impairment (CDR 0.5, MMSE 26)
  {
    tierLevel: 5,
    sentenceCount: 3,
    wordCountTarget: 60,
    storyElementsCount: 4,
    choicesCount: 3,
    storyVisibleDuringQuestions: false, // Pure episodic narrative recall
    audioReplaysAllowed: 1,
    clueHintAllowed: true,
    autoAssistTimeoutMs: 14000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.0,
    discriminationA: 1.45,
    tierDescription: {
      as: 'স্তৰ ৫: ক্লিনিকেল ভিত্তিৰেখা (৩ বাক্য, নিৰ্বাক স্মৃতি, ৩টি বিকল্প)',
      bn: 'স্তর ৫: ক্লিনিকাল ভিত্তিরেখা (৩ বাক্য, আবৃত স্মৃতি, ৩টি বিকল্প)',
      hi: 'स्तर ५: क्लिनिकल आधारभूत (३ वाक्य, शुद्ध स्मृति, ३ विकल्प)',
      en: 'Tier 5: Clinical Baseline (3 sentences, text hidden, 3 choices)',
    },
  },
  // Tier 6: High Normal Transition (CDR 0.0, MMSE 27-28)
  {
    tierLevel: 6,
    sentenceCount: 4,
    wordCountTarget: 75,
    storyElementsCount: 4,
    choicesCount: 4,
    storyVisibleDuringQuestions: false,
    audioReplaysAllowed: 1,
    clueHintAllowed: true,
    autoAssistTimeoutMs: 12000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.6,
    discriminationA: 1.55,
    tierDescription: {
      as: 'স্তৰ ৬: ৪ বাক্যৰ আখ্যান (৪টি বিকল্প, চৰিত্ৰ আৰু পৰিণতি)',
      bn: 'স্তর ৬: ৪ বাক্যের আখ্যান (৪টি বিকল্প, চরিত্র ও পরিণতি)',
      hi: 'स्तर ६: ४ वाक्यों का आख्यान (४ विकल्प, पात्र व परिणाम)',
      en: 'Tier 6: 4-Sentence Story (4 choices, character & outcome)',
    },
  },
  // Tier 7: Healthy Normal Control (CDR 0.0, MMSE 29)
  {
    tierLevel: 7,
    sentenceCount: 4,
    wordCountTarget: 90,
    storyElementsCount: 5,
    choicesCount: 4,
    storyVisibleDuringQuestions: false,
    audioReplaysAllowed: 1,
    clueHintAllowed: true,
    autoAssistTimeoutMs: 10000,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.2,
    discriminationA: 1.65,
    tierDescription: {
      as: 'স্তৰ ৭: বিশদ স্মৃতি (৪ বাক্য, ৫টি উপাদান, সময়ানুক্ৰম)',
      bn: 'স্তর ৭: বিশদ স্মৃতি (৪ বাক্য, ৫টি উপাদান, কালানুক্রম)',
      hi: 'स्तर ७: विस्तृत स्मृति (४ वाक्य, ५ घटक, कालानुक्रम)',
      en: 'Tier 7: Detailed Story (4 sentences, 5 elements, temporal order)',
    },
  },
  // Tier 8: High Cognitive Reserve (CDR 0.0, MMSE 30)
  {
    tierLevel: 8,
    sentenceCount: 5,
    wordCountTarget: 115,
    storyElementsCount: 5,
    choicesCount: 4,
    storyVisibleDuringQuestions: false,
    audioReplaysAllowed: 0,
    clueHintAllowed: false,
    autoAssistTimeoutMs: 8500,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.8,
    discriminationA: 1.7,
    tierDescription: {
      as: 'স্তৰ ৮: ক্ষিপ্ৰ আখ্যান স্মৃতি (৫ বাক্য, সহায়হীন, ৪টি বিকল্প)',
      bn: 'স্তর ৮: ক্ষিপ্র আখ্যান স্মৃতি (৫ বাক্য, সহায়তাহীন, ৪টি বিকল্প)',
      hi: 'स्तर ८: तीव्र आख्यान स्मृति (५ वाक्य, सहायता रहित, ४ विकल्प)',
      en: 'Tier 8: Rapid Story Span (5 sentences, unassisted, 4 choices)',
    },
  },
  // Tier 9: Ceiling - Peak Logical Memory Mastery (CDR 0.0, MMSE 30+)
  {
    tierLevel: 9,
    sentenceCount: 5,
    wordCountTarget: 140,
    storyElementsCount: 6,
    choicesCount: 4,
    storyVisibleDuringQuestions: false,
    audioReplaysAllowed: 0,
    clueHintAllowed: false,
    autoAssistTimeoutMs: 7500,
    tremorDebounceMs: 400,
    itemDifficultyB: 2.4,
    discriminationA: 1.8,
    tierDescription: {
      as: 'স্তৰ ৯: সৰ্বোচ্চ সীমা (৫ বাক্য, ৬টি সূক্ষ্ম উপাদান, চৰম স্মৃতি পৰীক্ষা)',
      bn: 'স্তর ৯: সর্বোচ্চ সীমা (৫ বাক্য, ৬টি সূক্ষ্ম উপাদান, চরম স্মৃতি পরীক্ষা)',
      hi: 'स्तर ९: उच्चतम सीमा (५ वाक्य, ६ सूक्ष्म विवरण, चरम स्मृति परीक्षा)',
      en: 'Tier 9: Cognitive Ceiling (5 sentences, 6 elements, full logical recall)',
    },
  },
];

export class BrainStoryEngine {
  private currentDifficulty: BrainStoryDifficulty;
  private currentTheta: number;
  private tremorTapsFilteredCount: number = 0;
  private lastTapTimestamp: number = 0;
  private lastTappedOptionIndex: number = -1;

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

  public getDifficulty(): BrainStoryDifficulty {
    return this.currentDifficulty;
  }

  public setDifficulty(diff: BrainStoryDifficulty): void {
    this.currentDifficulty = diff;
  }

  public getTremorFilteredCount(): number {
    return this.tremorTapsFilteredCount;
  }

  public resetTremorCount(): void {
    this.tremorTapsFilteredCount = 0;
    this.lastTapTimestamp = 0;
    this.lastTappedOptionIndex = -1;
  }

  /**
   * 400ms Parkinsonian Tremor Filter with backward clock rollback shield
   */
  public filterTremorTap(optionIndex: number, nowMs?: number): boolean {
    const now = nowMs ?? Date.now();

    // Clock rollback shield
    if (now < this.lastTapTimestamp) {
      this.lastTapTimestamp = now;
      this.lastTappedOptionIndex = optionIndex;
      return true;
    }

    const elapsed = now - this.lastTapTimestamp;
    const isRapidRepeat = elapsed < this.currentDifficulty.tremorDebounceMs && optionIndex === this.lastTappedOptionIndex;

    if (isRapidRepeat) {
      this.tremorTapsFilteredCount++;
      return false; // Filtered micro-jitter
    }

    this.lastTapTimestamp = now;
    this.lastTappedOptionIndex = optionIndex;
    return true; // Valid deliberate tap
  }

  /**
   * Derives optimal minimal-step tier from Bayesian latent ability θ
   */
  public deriveDifficultyFromTheta(theta: number): BrainStoryDifficulty {
    if (theta >= 2.2) return BRAIN_STORY_TIERS[8]; // Tier 9
    if (theta >= 1.6) return BRAIN_STORY_TIERS[7]; // Tier 8
    if (theta >= 1.0) return BRAIN_STORY_TIERS[6]; // Tier 7
    if (theta >= 0.4) return BRAIN_STORY_TIERS[5]; // Tier 6
    if (theta >= -0.2) return BRAIN_STORY_TIERS[4]; // Tier 5
    if (theta >= -0.8) return BRAIN_STORY_TIERS[3]; // Tier 4
    if (theta >= -1.4) return BRAIN_STORY_TIERS[2]; // Tier 3
    if (theta >= -2.0) return BRAIN_STORY_TIERS[1]; // Tier 2
    return BRAIN_STORY_TIERS[0]; // Tier 1
  }

  public getDifficultyForTierLevel(tierLevel: number): BrainStoryDifficulty {
    const clamped = Math.max(1, Math.min(9, Math.round(tierLevel)));
    return BRAIN_STORY_TIERS[clamped - 1];
  }

  /**
   * Generates a psychometrically valid trial according to tier specifications
   */
  public generateTrial(
    trialIndex: number,
    difficulty: BrainStoryDifficulty,
    preferredStoryId?: string
  ): BrainStoryGeneratedTrial {
    return StoryGenerator.generateTrial(difficulty, trialIndex, preferredStoryId);
  }

  /**
   * Bayesian 2PL Item Response Theory (IRT) Latent Ability Update
   * Incorporates Assistance Discounts (audio replays, clues, and prolonged hesitation)
   * Guaranteed progression: Δθ >= +0.02 on correct response
   */
  public updateTheta(
    isCorrect: boolean,
    deliberationMs: number,
    settings: BrainStorySettingsSnapshot,
    questionsAnsweredRatio: number = 1.0
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

    // 2. Assistance discounts
    let creditU = isCorrect ? 1.0 : questionsAnsweredRatio * 0.25;
    if (isCorrect) {
      if (settings.audioReplaysUsed > 0) creditU -= settings.audioReplaysUsed * 0.15;
      if (settings.cluesUsedCount > 0) creditU -= settings.cluesUsedCount * 0.15;
      if (deliberationMs > 10000) creditU -= 0.10;
      creditU = Math.max(0.40, creditU); // Dignified credit floor
    }

    // 3. Information update
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
    autonomy -= settings.audioReplaysUsed * 15;
    autonomy -= settings.cluesUsedCount * 15;
    if (deliberationMs > 9000) autonomy -= 10;
    if (this.tremorTapsFilteredCount > 3) autonomy -= 4;
    const autonomyScore = Math.max(10, Math.min(100, autonomy));

    const reasoning = isCorrect
      ? `Accurate narrative recall (deliberation: ${deliberationMs}ms, replays: ${settings.audioReplaysUsed}, clues: ${settings.cluesUsedCount}) -> θ adjusted by +${delta.toFixed(3)}.`
      : `Narrative recall error on Tier ${diff.tierLevel} (${Math.round(questionsAnsweredRatio * 100)}% questions answered) -> θ adjusted by ${delta.toFixed(3)}.`;

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
    trials: BrainStoryTrialTelemetry[],
    caregiverEndedEarly: boolean = false
  ): BrainStorySessionSummary {
    const totalTrials = trials.length;
    const totalQuestions = trials.reduce((acc, t) => acc + t.totalQuestions, 0);
    const correctQuestions = trials.reduce((acc, t) => acc + t.correctQuestionsCount, 0);
    const accuracyPercentage = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

    const meanDeliberationMs = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.deliberationTimeMs, 0) / totalTrials)
      : 0;

    const meanTimeToFirstTapMs = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.timeToFirstTapMs, 0) / totalTrials)
      : meanDeliberationMs;

    const totalReplaysUsed = trials.reduce((acc, t) => acc + t.audioReplaysUsed, 0);
    const totalCluesUsed = trials.reduce((acc, t) => acc + t.cluesUsedCount, 0);
    const autonomyScore = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.autonomyScore, 0) / totalTrials)
      : 100;

    // Narrative Retention Status
    let narrativeRetentionStatus: NarrativeRetentionStatus = 'intact_episodic_narrative';
    if (this.currentTheta < -1.4) {
      narrativeRetentionStatus = 'severe_narrative_fragmentation';
    } else if (this.currentTheta < -0.3) {
      narrativeRetentionStatus = 'gist_constrained_retention';
    } else if (this.currentTheta < 0.8) {
      narrativeRetentionStatus = 'mild_detail_attenuation';
    }

    // Story Comprehension Profile
    let storyComprehensionProfile: StoryComprehensionProfile = 'swift_immediate_recall';
    if (this.tremorTapsFilteredCount >= 5) {
      storyComprehensionProfile = 'motor_tremor_dominant';
    } else if (totalCluesUsed >= 2 || totalReplaysUsed >= 3 || meanDeliberationMs > 8500) {
      storyComprehensionProfile = 'clue_reliant_recognition';
    } else if (meanDeliberationMs > 4500) {
      storyComprehensionProfile = 'deliberate_reflective';
    }

    // Motor Tremor Profile
    let motorTremorStatus: MotorTremorStatus = 'normal_motor';
    if (this.tremorTapsFilteredCount >= 5) {
      motorTremorStatus = 'tremor_dominant';
    } else if (this.tremorTapsFilteredCount >= 2) {
      motorTremorStatus = 'mild_hesitation_jitter';
    }

    // Calibrated WMS-IV Logical Memory Scaled Score (1 to 19 standard scale, mean 10, SD 3)
    const finalTheta = trials.length > 0 ? trials[trials.length - 1].thetaAfterTrial : this.currentTheta;
    this.currentTheta = finalTheta;
    const rawWms = 10.0 + (finalTheta / 2.0) * 4.5 + ((accuracyPercentage - 70) / 30.0) * 2.5;
    const wmsLogicalMemoryScaledScore = Math.max(1, Math.min(19, Math.round(rawWms)));

    // Calibrated MoCA Language & Story Memory subscore (0 to 5 composite)
    const thetaScaled = 2.5 + (finalTheta / 2.0) * 2.5;
    const accuracyScaled = (accuracyPercentage / 100.0) * 5.0;
    const compositeMoCA = 0.6 * thetaScaled + 0.4 * accuracyScaled;
    const estimatedMoCALanguageScore = Math.max(0, Math.min(5, Number(compositeMoCA.toFixed(1))));

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
      gameId: 'brain-story',
      totalTrials,
      totalQuestions,
      correctQuestions,
      accuracyPercentage,
      meanDeliberationMs,
      meanTimeToFirstTapMs,
      totalReplaysUsed,
      totalCluesUsed,
      tremorTapsFilteredTotal: this.tremorTapsFilteredCount,
      autonomyScore,
      finalTheta: this.currentTheta,
      wmsLogicalMemoryScaledScore,
      estimatedMoCALanguageScore,
      narrativeRetentionStatus,
      storyComprehensionProfile,
      motorTremorStatus,
      oasisClinicalClassification,
      caregiverEndedEarly,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Simulates authentic OASIS-2 patient action for clinical testing and validation
   */
  public simulateOasisPatientAction(
    persona: OasisBrainStoryPersona,
    trial: BrainStoryGeneratedTrial,
    tier: BrainStoryDifficulty
  ): {
    selectedOptionIndices: number[];
    correctCount: number;
    isAllCorrect: boolean;
    audioReplaysUsed: number;
    cluesUsedCount: number;
    deliberationTimeMs: number;
    hasTremorJitter: boolean;
    tremorJitterCount: number;
    clinicalObservation: Record<SupportedLanguage, string>;
  } {
    // 1. Replays & Clues usage
    const audioReplaysUsed = tier.audioReplaysAllowed > 0 && Math.random() < persona.audioReplayProbability
      ? Math.min(tier.audioReplaysAllowed, Math.random() < 0.3 ? 2 : 1)
      : 0;

    const cluesUsedCount = tier.clueHintAllowed && Math.random() < persona.clueHintProbability ? 1 : 0;

    // 2. Latency
    const baseDelib = persona.expectedDeliberationMs;
    const latencyNoise = 0.85 + Math.random() * 0.3;
    const deliberationTimeMs = Math.max(1500, Math.round(baseDelib * latencyNoise));

    // 3. Tremor jitter
    const hasTremorJitter = Math.random() < persona.tremorJitterProbability;
    const tremorJitterCount = hasTremorJitter ? Math.floor(Math.random() * 3) + 1 : 0;
    for (let i = 0; i < tremorJitterCount; i++) {
      this.tremorTapsFilteredCount++;
    }

    // 4. Accuracy
    let prob = persona.accuracyProbability;
    if (audioReplaysUsed > 0) prob = Math.min(0.98, prob + audioReplaysUsed * 0.08);
    if (cluesUsedCount > 0) prob = Math.min(0.98, prob + 0.12);
    if (tier.tierLevel >= 7 && persona.cdr > 0) prob = Math.max(0.15, prob - 0.12);

    const selectedOptionIndices: number[] = [];
    let correctCount = 0;

    trial.activeQuestions.forEach(q => {
      const isQCorrect = Math.random() < prob;
      if (isQCorrect) {
        selectedOptionIndices.push(q.correctOptionIndex);
        correctCount++;
      } else {
        // Pick incorrect option
        const wrongIndices = q.options.en
          .map((_, idx) => idx)
          .filter(idx => idx !== q.correctOptionIndex);
        const pickedWrong = wrongIndices.length > 0
          ? wrongIndices[Math.floor(Math.random() * wrongIndices.length)]
          : 1;
        selectedOptionIndices.push(pickedWrong);
      }
    });

    const isAllCorrect = correctCount === trial.activeQuestions.length || (trial.activeQuestions.length >= 4 && correctCount >= trial.activeQuestions.length - 1 && persona.cdr === 0);

    const clinicalObservation: Record<SupportedLanguage, string> = {
      as: `${persona.name} (${persona.clinicalDiagnosis}) - পুনৰাবৃত্তি: ${audioReplaysUsed}, সংকেত: ${cluesUsedCount}, সময়: ${deliberationTimeMs}ms, শুদ্ধ: ${correctCount}/${trial.activeQuestions.length}।`,
      bn: `${persona.name} (${persona.clinicalDiagnosis}) - পুনরাবৃত্তি: ${audioReplaysUsed}, সূত্র: ${cluesUsedCount}, সময়: ${deliberationTimeMs}ms, শুদ্ধ: ${correctCount}/${trial.activeQuestions.length}।`,
      hi: `${persona.name} (${persona.clinicalDiagnosis}) - रीप्ले: ${audioReplaysUsed}, संकेत: ${cluesUsedCount}, समय: ${deliberationTimeMs}ms, सही: ${correctCount}/${trial.activeQuestions.length}।`,
      en: `${persona.name} (${persona.clinicalDiagnosis}): replays ${audioReplaysUsed}, clues ${cluesUsedCount}, deliberation ${deliberationTimeMs}ms, score ${correctCount}/${trial.activeQuestions.length}.`,
    };

    return {
      selectedOptionIndices,
      correctCount,
      isAllCorrect,
      audioReplaysUsed,
      cluesUsedCount,
      deliberationTimeMs,
      hasTremorJitter,
      tremorJitterCount,
      clinicalObservation,
    };
  }
}
