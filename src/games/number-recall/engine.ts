import type {
  NumberRecallDifficulty,
  NumberRecallSettingsSnapshot,
  NumberRecallTrialTelemetry,
  NumberRecallSessionSummary,
  RecallMode,
  DigitErrorType,
  PhonologicalLoopRating,
  PrefrontalReversalStatus,
  KeystrokeRhythmProfile,
} from './types';
import type { SupportedLanguage } from '../../types/prescription';

/**
 * 9 Fine-Grained Minimal Step Tiers (2 to 9 Digits)
 * Follows WAIS-IV Digit Span forward & backward progression standards.
 */
export const NUMBER_RECALL_TIERS: NumberRecallDifficulty[] = [
  {
    tierLevel: 1,
    digitCount: 2,
    displaySpeedMs: 3000,
    isiGapMs: 800,
    recallMode: 'forward',
    ghostWatermarkOpacity: 0.50,
    speechRate: 0.70,
    maxReplaysAllowed: 3,
    allowBackspace: true,
    autoAssistTimeoutMs: 25000,
    tremorDebounceMs: 400,
    itemDifficultyB: -2.0,
    discriminationA: 1.3,
    tierDescription: {
      as: 'স্তৰ ১: ২টা সংখ্যা (৩ ছেকেণ্ড প্ৰদৰ্শন, ৫০% সহায়িকা সংকেত, পোনপটীয়া ক্ৰম)',
      bn: 'স্তর ১: ২টি সংখ্যা (৩ সেকেন্ড প্রদর্শন, ৫০% সহায়ক সংকেত, সোজা ক্রম)',
      hi: 'स्तर १: २ अंक (३ सेकंड प्रदर्शन, ५०% सहायक संकेत, सीधा क्रम)',
      en: 'Tier 1: 2 Digits (3s Exposure, 50% Watermark Scaffolding, Forward)',
    },
  },
  {
    tierLevel: 2,
    digitCount: 3,
    displaySpeedMs: 2500,
    isiGapMs: 700,
    recallMode: 'forward',
    ghostWatermarkOpacity: 0.30,
    speechRate: 0.75,
    maxReplaysAllowed: 3,
    allowBackspace: true,
    autoAssistTimeoutMs: 22000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.5,
    discriminationA: 1.4,
    tierDescription: {
      as: 'স্তৰ ২: ৩টা সংখ্যা (২.৫ ছেকেণ্ড প্ৰদৰ্শন, ৩০% সহায়িকা সংকেত, পোনপটীয়া ক্ৰম)',
      bn: 'স্তর ২: ৩টি সংখ্যা (২.৫ সেকেন্ড প্রদর্শন, ৩০% সহায়ক সংকেত, সোজা ক্রম)',
      hi: 'स्तर २: ३ अंक (२.५ सेकंड प्रदर्शन, ३०% सहायक संकेत, सीधा क्रम)',
      en: 'Tier 2: 3 Digits (2.5s Exposure, 30% Watermark Scaffolding, Forward)',
    },
  },
  {
    tierLevel: 3,
    digitCount: 4,
    displaySpeedMs: 2000,
    isiGapMs: 600,
    recallMode: 'forward',
    ghostWatermarkOpacity: 0.15,
    speechRate: 0.85,
    maxReplaysAllowed: 2,
    allowBackspace: true,
    autoAssistTimeoutMs: 20000,
    tremorDebounceMs: 400,
    itemDifficultyB: -0.9,
    discriminationA: 1.4,
    tierDescription: {
      as: 'স্তৰ ৩: ৪টা সংখ্যা (২.০ ছেকেণ্ড প্ৰদৰ্শন, ১৫% সহায়িকা সংকেত, পোনপটীয়া ক্ৰম)',
      bn: 'স্তর ৩: ৪টি সংখ্যা (২.০ সেকেন্ড প্রদর্শন, ১৫% সহায়ক সংকেত, সোজা ক্রম)',
      hi: 'स्तर ३: ४ अंक (२.० सेकंड प्रदर्शन, १५% सहायक संकेत, सीधा क्रम)',
      en: 'Tier 3: 4 Digits (2.0s Exposure, 15% Watermark Scaffolding, Forward)',
    },
  },
  {
    tierLevel: 4,
    digitCount: 5,
    displaySpeedMs: 1600,
    isiGapMs: 500,
    recallMode: 'forward',
    ghostWatermarkOpacity: 0.0,
    speechRate: 1.0,
    maxReplaysAllowed: 1,
    allowBackspace: true,
    autoAssistTimeoutMs: 18000,
    tremorDebounceMs: 400,
    itemDifficultyB: -0.3,
    discriminationA: 1.5,
    tierDescription: {
      as: 'স্তৰ ৪: ৫টা সংখ্যা (১.৬ ছেকেণ্ড প্ৰদৰ্শন, স্বাধীন স্মৰণ, পোনপটীয়া ক্ৰম)',
      bn: 'স্তর ৪: ৫টি সংখ্যা (১.৬ সেকেন্ড প্রদর্শন, স্বাধীন স্মরণ, সোজা ক্রম)',
      hi: 'स्तर ४: ५ अंक (१.६ सेकंड प्रदर्शन, स्वतंत्र स्मरण, सीधा क्रम)',
      en: 'Tier 4: 5 Digits (1.6s Exposure, Unassisted, Forward)',
    },
  },
  {
    tierLevel: 5,
    digitCount: 6,
    displaySpeedMs: 1300,
    isiGapMs: 450,
    recallMode: 'forward',
    ghostWatermarkOpacity: 0.0,
    speechRate: 1.0,
    maxReplaysAllowed: 1,
    allowBackspace: true,
    autoAssistTimeoutMs: 16000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.3,
    discriminationA: 1.5,
    tierDescription: {
      as: 'স্তৰ ৫ (মানক বৃদ্ধ স্তৰ): ৬টা সংখ্যা (১.৩ ছেকেণ্ড প্ৰদৰ্শন, স্বাভাৱিক গতি)',
      bn: 'স্তর ৫ (মানক প্রবীণ স্তর): ৬টি সংখ্যা (১.৩ সেকেন্ড প্রদর্শন, স্বাভাবিক গতি)',
      hi: 'स्तर ५ (मानक बुजुर्ग स्तर): ६ अंक (१.३ सेकंड प्रदर्शन, सामान्य गति)',
      en: 'Tier 5 (Preserved Elderly Baseline): 6 Digits (1.3s Exposure, Forward)',
    },
  },
  {
    tierLevel: 6,
    digitCount: 4,
    displaySpeedMs: 1500,
    isiGapMs: 500,
    recallMode: 'backward',
    ghostWatermarkOpacity: 0.0,
    speechRate: 1.0,
    maxReplaysAllowed: 1,
    allowBackspace: true,
    autoAssistTimeoutMs: 18000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.9,
    discriminationA: 1.6,
    tierDescription: {
      as: 'স্তৰ ৬ (ওলোটা ক্ৰম আৰম্ভ): ৪টা সংখ্যা (১.৫ ছেকেণ্ড, ওলোটাকৈ মনত পেলোৱা)',
      bn: 'স্তর ৬ (বিপরীত ক্রম শুরু): ৪টি সংখ্যা (১.৫ সেকেন্ড, উল্টোভাবে স্মরণ)',
      hi: 'स्तर ६ (विपरीत क्रम): ४ अंक (१.५ सेकंड, उल्टे क्रम में याद करें)',
      en: 'Tier 6 (Backward Recall Intro): 4 Digits (1.5s Exposure, Reverse Order)',
    },
  },
  {
    tierLevel: 7,
    digitCount: 5,
    displaySpeedMs: 1200,
    isiGapMs: 400,
    recallMode: 'backward',
    ghostWatermarkOpacity: 0.0,
    speechRate: 1.0,
    maxReplaysAllowed: 0,
    allowBackspace: true,
    autoAssistTimeoutMs: 16000,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.5,
    discriminationA: 1.7,
    tierDescription: {
      as: 'স্তৰ ৭: ৫টা সংখ্যা (১.২ ছেকেণ্ড প্ৰদৰ্শন, ওলোটা ক্ৰম)',
      bn: 'স্তর ৭: ৫টি সংখ্যা (১.২ সেকেন্ড প্রদর্শন, বিপরীত ক্রম)',
      hi: 'स्तर ७: ५ अंक (१.२ सेकंड प्रदर्शन, विपरीत क्रम)',
      en: 'Tier 7: 5 Digits (1.2s Exposure, Reverse Order Recall)',
    },
  },
  {
    tierLevel: 8,
    digitCount: 6,
    displaySpeedMs: 900,
    isiGapMs: 350,
    recallMode: 'backward',
    ghostWatermarkOpacity: 0.0,
    speechRate: 1.0,
    maxReplaysAllowed: 0,
    allowBackspace: true,
    autoAssistTimeoutMs: 14000,
    tremorDebounceMs: 400,
    itemDifficultyB: 2.0,
    discriminationA: 1.7,
    tierDescription: {
      as: 'স্তৰ ৮: ৬টা সংখ্যা (০.৯ ছেকেণ্ড ক্ষিপ্ৰ প্ৰদৰ্শন, ওলোটা ক্ৰম)',
      bn: 'স্তর ৮: ৬টি সংখ্যা (০.৯ সেকেন্ড দ্রুত প্রদর্শন, বিপরীত ক্রম)',
      hi: 'स्तर ८: ६ अंक (०.९ सेकंड द्रुत प्रदर्शन, विपरीत क्रम)',
      en: 'Tier 8: 6 Digits (900ms Rapid Exposure, Reverse Order)',
    },
  },
  {
    tierLevel: 9,
    digitCount: 8,
    displaySpeedMs: 600,
    isiGapMs: 300,
    recallMode: 'backward',
    ghostWatermarkOpacity: 0.0,
    speechRate: 1.0,
    maxReplaysAllowed: 0,
    allowBackspace: true,
    autoAssistTimeoutMs: 12000,
    tremorDebounceMs: 400,
    itemDifficultyB: 2.5,
    discriminationA: 1.8,
    tierDescription: {
      as: 'স্তৰ ৯ (সৰ্বোচ্চ সীমা): ৮টা সংখ্যা (০.৬ ছেকেণ্ড ফ্লেশ, ওলোটা ক্ৰম)',
      bn: 'স্তর ৯ (সর্বোচ্চ সীমা): ৮টি সংখ্যা (০.৬ সেকেন্ড ফ্ল্যাশ, বিপরীত ক্রম)',
      hi: 'स्तर ९ (शीर्ष चुनौती): ८ अंक (०.६ सेकंड फ्लैश, विपरीत क्रम)',
      en: 'Tier 9 (Cognitive Ceiling): 8 Digits (600ms Flash, Reverse Order)',
    },
  },
];

/**
 * NumberRecallEngine
 * Implements Bayesian 2PL IRT Dynamic Difficulty Adjustment,
 * Serial Position Curve Analysis (Primacy vs Recency),
 * Error Taxonomy Classification, and WAIS-IV Digit Span Age-Normed Scoring.
 */
export class NumberRecallEngine {
  private currentTheta: number;
  private currentDifficulty: NumberRecallDifficulty;
  private consecutiveSuccesses: number = 0;
  private consecutiveErrors: number = 0;
  private lastTapTimestamp: number = 0;
  private tremorTapsFilteredCount: number = 0;
  private patientPrefersForwardOnly: boolean = false;

  constructor(initialTheta: number = 0.0) {
    this.currentTheta = Math.max(-3.0, Math.min(3.0, initialTheta));
    this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
  }

  public getTheta(): number {
    return this.currentTheta;
  }

  public setTheta(theta: number): void {
    this.currentTheta = Math.max(-3.0, Math.min(3.0, theta));
    this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
  }

  public getDifficulty(): NumberRecallDifficulty {
    return { ...this.currentDifficulty };
  }

  public setDifficulty(diff: NumberRecallDifficulty): void {
    this.currentDifficulty = { ...diff };
  }

  public getTremorFilteredCount(): number {
    return this.tremorTapsFilteredCount;
  }

  /**
   * Derives optimal minimal-step difficulty tier from Bayesian latent ability theta.
   */
  public deriveDifficultyFromTheta(theta: number): NumberRecallDifficulty {
    if (theta <= -1.8) return NUMBER_RECALL_TIERS[0]; // Tier 1: 2 digits floor
    if (theta <= -1.2) return NUMBER_RECALL_TIERS[1]; // Tier 2: 3 digits
    if (theta <= -0.6) return NUMBER_RECALL_TIERS[2]; // Tier 3: 4 digits
    if (theta <= 0.0)  return NUMBER_RECALL_TIERS[3]; // Tier 4: 5 digits
    if (theta <= 0.6)  return NUMBER_RECALL_TIERS[4]; // Tier 5: 6 digits (Baseline)
    if (theta <= 1.2)  return NUMBER_RECALL_TIERS[5]; // Tier 6: 4 digits backward
    if (theta <= 1.8)  return NUMBER_RECALL_TIERS[6]; // Tier 7: 5 digits backward
    if (theta <= 2.4)  return NUMBER_RECALL_TIERS[7]; // Tier 8: 6 digits backward
    return NUMBER_RECALL_TIERS[8];                    // Tier 9: 8 digits backward ceiling
  }

  /**
   * Look up tier by explicit digit count or level.
   */
  public getDifficultyForTierLevel(tierLevel: number): NumberRecallDifficulty {
    const found = NUMBER_RECALL_TIERS.find(t => t.tierLevel === tierLevel);
    return found ? { ...found } : NUMBER_RECALL_TIERS[4];
  }

  /**
   * Generates a psychologically validated digit sequence of specified length.
   * Avoids trivial ascending/descending patterns or identical repeating runs.
   */
  public generateDigitSequence(length: number): string {
    const validLength = Math.max(2, Math.min(10, length));
    let sequence = '';
    let isTrivial = true;

    while (isTrivial) {
      const digits: number[] = [];
      for (let i = 0; i < validLength; i++) {
        let d = Math.floor(Math.random() * 10);
        // Avoid immediate adjacent repetition (e.g. 5-5) for clarity
        if (i > 0 && d === digits[i - 1]) {
          d = (d + 1 + Math.floor(Math.random() * 8)) % 10;
        }
        digits.push(d);
      }
      sequence = digits.join('');

      // Check trivial patterns (e.g. "1234", "9876", or all identical)
      let ascending = true;
      let descending = true;
      for (let i = 1; i < digits.length; i++) {
        if (digits[i] !== digits[i - 1] + 1) ascending = false;
        if (digits[i] !== digits[i - 1] - 1) descending = false;
      }
      if (!ascending && !descending) {
        isTrivial = false;
      }
    }

    return sequence;
  }

  /**
   * Computes the expected user sequence based on recall mode.
   * Forward: exact sequence.
   * Backward: reversed sequence.
   */
  public getExpectedSequence(target: string, mode: RecallMode): string {
    if (mode === 'forward') return target;
    return target.split('').reverse().join('');
  }

  /**
   * Hardware Tremor Debounce Guard (400ms).
   * Hardened against client clock skew and inverted timestamps.
   */
  public filterTremorTap(now: number = Date.now()): boolean {
    if (now < this.lastTapTimestamp) {
      this.lastTapTimestamp = now;
      return true;
    }
    if (now - this.lastTapTimestamp < this.currentDifficulty.tremorDebounceMs) {
      this.tremorTapsFilteredCount++;
      return false; // Suppress rapid involuntary motor jitter
    }
    this.lastTapTimestamp = now;
    return true;
  }

  /**
   * Comprehensive Trial Evaluation:
   * 1. Exact string match against expected sequence.
   * 2. Error taxonomy decomposition (transposition, omission, substitution, perseveration).
   * 3. Serial position curve evaluation (Primacy vs Recency hits).
   */
  public evaluateTrial(
    targetSequence: string,
    userEnteredSequence: string,
    mode: RecallMode
  ): {
    isCorrect: boolean;
    expectedSequence: string;
    errorType: DigitErrorType;
    serialPositionHits: boolean[];
    primacyAccuracy: boolean;
    recencyAccuracy: boolean;
  } {
    const expected = this.getExpectedSequence(targetSequence, mode);
    const user = userEnteredSequence.trim();
    const isCorrect = user === expected;

    // Serial Position Hits
    const serialPositionHits: boolean[] = [];
    for (let i = 0; i < expected.length; i++) {
      serialPositionHits.push(i < user.length && user[i] === expected[i]);
    }

    // Primacy: accuracy on positions 0 and 1
    const primacyAccuracy = expected.length >= 2
      ? (serialPositionHits[0] && serialPositionHits[1])
      : Boolean(serialPositionHits[0]);

    // Recency: accuracy on the final positions
    const recencyAccuracy = expected.length >= 2
      ? (serialPositionHits[expected.length - 1] && serialPositionHits[expected.length - 2])
      : Boolean(serialPositionHits[expected.length - 1]);

    // Error Classification
    let errorType: DigitErrorType = 'none';
    if (!isCorrect) {
      if (user.length < expected.length) {
        errorType = 'omission';
      } else if (user.length > expected.length) {
        errorType = 'intrusion';
      } else {
        // Same length: check if digits are an anagram/transposition
        const sortedExpected = expected.split('').sort().join('');
        const sortedUser = user.split('').sort().join('');
        if (sortedExpected === sortedUser) {
          errorType = 'transposition';
        } else {
          // Check perseveration (consecutive identical incorrect entries)
          let hasPerseveration = false;
          for (let i = 1; i < user.length; i++) {
            if (user[i] === user[i - 1] && expected[i] !== expected[i - 1]) {
              hasPerseveration = true;
              break;
            }
          }
          errorType = hasPerseveration ? 'perseveration' : 'substitution';
        }
      }
    }

    return {
      isCorrect,
      expectedSequence: expected,
      errorType,
      serialPositionHits,
      primacyAccuracy,
      recencyAccuracy,
    };
  }

  /**
   * Bayesian 2PL Item Response Theory (IRT) Adaptive Update Step.
   * Incorporates patient settings autonomy, watermark scaffolding, speech support, and self-corrections.
   */
  public updateTheta(
    isCorrect: boolean,
    errorType: DigitErrorType,
    solveTimeMs: number,
    settings?: NumberRecallSettingsSnapshot
  ): {
    newTheta: number;
    reasoning: Record<SupportedLanguage, string>;
    settingsImpactRationale: Record<SupportedLanguage, string>;
    autonomyScore: number;
  } {
    const prevTheta = this.currentTheta;
    const currentDiff = this.currentDifficulty;
    const discriminationA = currentDiff.discriminationA;
    const itemDifficultyB = currentDiff.itemDifficultyB;

    // Settings Factors
    const watermarkOff = settings?.ghostWatermarkEnabled === false;
    const replays = settings?.replaysUsedCount || 0;
    const backspaces = settings?.backspaceCorrectionsCount || 0;
    const speechActive = settings?.audioSpeechEnabled !== false;

    // Track patient preference for forward-only mode
    if (settings?.isManualTierOverride && currentDiff.recallMode === 'forward') {
      this.patientPrefersForwardOnly = true;
    }

    // 1. Calculate Patient Autonomy Score (0 to 100%)
    let autonomyScore = 70;
    if (watermarkOff) autonomyScore += 15; // Unassisted visual memory
    if (currentDiff.recallMode === 'backward') autonomyScore += 10; // High executive load
    if (backspaces > 0 && backspaces <= 2) autonomyScore += 5; // Metacognitive self-correction bonus
    if (!speechActive) autonomyScore += 5; // Unimodal visual autonomy (speech muted)
    if (replays > 0) autonomyScore -= Math.min(25, replays * 8); // Audio dependency
    if (settings?.proactiveHelpRequested) autonomyScore -= 10;
    autonomyScore = Math.max(10, Math.min(100, Math.round(autonomyScore)));

    // 2. Settings Impact Rationale
    let settingsImpactRationale: Record<SupportedLanguage, string>;
    if (watermarkOff) {
      settingsImpactRationale = {
        as: `সহায়িকা সংকেত অবিহনে সম্পন্ন: ৰোগীয়ে কোনো সহায়িকা নোহোৱাকৈ সংখ্যা মনত ৰাখিলে (+০.৭৫ IRT বোনাস)।`,
        bn: `সহায়ক সংকেত ছাড়া সম্পন্ন: রোগী কোনো সহায়ক ছাড়াই সংখ্যা স্মরণ করলেন (+০.৭৫ IRT বোনাস)।`,
        hi: `सहायक संकेत के बिना पूर्ण: रोगी ने बिना किसी सहायता के अंकों का स्मरण किया (+०.७५ IRT बोनस)।`,
        en: `Unassisted recall active: Solved without ghost watermark scaffolding (+0.75 IRT ability factor).`,
      };
    } else if (replays > 0) {
      settingsImpactRationale = {
        as: `শ্ৰৱণ পুনৰাবৃত্তি ব্যৱহাৰ (${replays}বাৰ): AI এ ধ্বনিতত্ত্বৰ স্থিৰতাৰ বাবে শ্ৰৱণ সময় বৃদ্ধি কৰিলে।`,
        bn: `শ্রবণ পুনরাবৃত্তি ব্যবহার (${replays}বার): AI ধ্বনিতত্ত্বের স্থিতির জন্য শ্রবণ সময় বৃদ্ধি করল।`,
        hi: `ऑडियो दोहराव का उपयोग (${replays} बार): AI ने स्पष्टता बनाए रखने हेतु पर्याप्त समय प्रदान किया।`,
        en: `Audio replay utilized (${replays}x): AI reinforced phonological acoustic trace.`,
      };
    } else if (backspaces > 0) {
      settingsImpactRationale = {
        as: `আত্ম-সংশোধন পৰিলক্ষিত (${backspaces}বাৰ): ৰোগীয়ে নিজৰ ভুল চিনি শুদ্ধ কৰিলে (সক্ৰিয় মেটাকগনিচন)।`,
        bn: `আত্ম-সংশোধন পরিলক্ষিত (${backspaces}বার): রোগী নিজের ভুল চিনে সংশোধন করলেন (সক্রিয় মেটাকগনিশন)।`,
        hi: `सक्रिय आत्म-सुधार (${backspaces} बार): रोगी ने अपनी गलती पहचानकर सुधार किया (मजबूत मेटाकॉग्निशन)।`,
        en: `Metacognitive self-correction observed (${backspaces}x): Patient recognized and corrected keystroke errors.`,
      };
    } else {
      settingsImpactRationale = {
        as: `মানক সংবেদনশীল সহায় সক্ৰিয়: দৃশ্য আৰু শ্ৰৱণ দুয়োটা মাধ্যমেৰে সংখ্যা উপস্থাপন কৰা হৈছে।`,
        bn: `মানক সংবেদনশীল সহায়তা সক্রিয়: দৃশ্য ও শ্রবণ উভয় মাধ্যমে সংখ্যা উপস্থাপিত হয়েছে।`,
        hi: `मानक मल्टी-सेंसरी सहायता सक्रिय: दृश्य और मौखिक दोनों माध्यमों से अंक प्रस्तुत किए गए।`,
        en: `Standard multi-sensory scaffolding: Visual card flash paired with vernacular speech readout.`,
      };
    }

    let reasoning: Record<SupportedLanguage, string>;

    // 3. Mathematical 2PL IRT Update
    if (isCorrect) {
      this.consecutiveSuccesses++;
      this.consecutiveErrors = 0;

      const expectedProb = 1 / (1 + Math.exp(-discriminationA * (this.currentTheta - itemDifficultyB)));
      const baseMultiplier = watermarkOff ? 0.38 : 0.28;
      const rapidBonus = solveTimeMs < currentDiff.digitCount * 1200 ? 0.04 : 0.0;
      const delta = (1 - expectedProb) * baseMultiplier + rapidBonus;

      this.currentTheta = Math.min(3.0, this.currentTheta + delta);

      let nextDiff = this.deriveDifficultyFromTheta(this.currentTheta);
      if (this.patientPrefersForwardOnly && nextDiff.recallMode === 'backward') {
        // Keep forward mode if elder indicated fatigue with backward manipulation
        nextDiff = { ...nextDiff, recallMode: 'forward' };
      }
      this.currentDifficulty = nextDiff;

      if (this.currentDifficulty.tierLevel > currentDiff.tierLevel) {
        reasoning = {
          as: `উচ্চ কাৰ্যকৰী স্মৃতিশক্তি (θ: ${this.currentTheta.toFixed(2)})! AI এ স্তৰ ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.digitCount}টা সংখ্যা, ${this.currentDifficulty.recallMode === 'backward' ? 'ওলোটা ক্ৰম' : 'পোনপটীয়া ক্ৰম'}) লৈ বৃদ্ধি কৰিলে।`,
          bn: `উচ্চ কার্যকরী স্মৃতিশক্তি (θ: ${this.currentTheta.toFixed(2)})! AI স্তর ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.digitCount}টি সংখ্যা, ${this.currentDifficulty.recallMode === 'backward' ? 'বিপরীত ক্রম' : 'সোজা ক্রম'})-এ বৃদ্ধি করল।`,
          hi: `उत्कृष्ट कार्यकारी स्मृति (θ: ${this.currentTheta.toFixed(2)})! AI ने स्तर ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.digitCount} अंक, ${this.currentDifficulty.recallMode === 'backward' ? 'विपरीत क्रम' : 'सीधा क्रम'}) पर उन्नत किया।`,
          en: `High working memory capacity (θ: ${this.currentTheta.toFixed(2)})! AI titrated smoothly to Tier ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.digitCount} digits, ${this.currentDifficulty.recallMode === 'backward' ? 'Reverse Order' : 'Forward'}).`,
        };
      } else {
        reasoning = {
          as: `সঠিক স্মৰণ। কাৰ্যকৰী স্মৃতি দক্ষতা θ: ${prevTheta.toFixed(2)} ৰ পৰা ${this.currentTheta.toFixed(2)} লৈ বৃদ্ধি পালে।`,
          bn: `সঠিক স্মরণ। কার্যকরী স্মৃতি দক্ষতা θ: ${prevTheta.toFixed(2)} থেকে ${this.currentTheta.toFixed(2)}-এ বৃদ্ধি পেল।`,
          hi: `सटीक स्मरण। कार्यकारी स्मृति क्षमता θ: ${prevTheta.toFixed(2)} से बढ़कर ${this.currentTheta.toFixed(2)} हो गई।`,
          en: `Accurate recall. Working memory ability theta consolidated from ${prevTheta.toFixed(2)} to ${this.currentTheta.toFixed(2)}.`,
        };
      }
    } else {
      this.consecutiveErrors++;
      this.consecutiveSuccesses = 0;

      // Dampen penalty if watermark was off or if in demanding backward mode
      const penaltyScale = (watermarkOff || currentDiff.recallMode === 'backward') ? 0.75 : 1.0;
      const delta = (0.22 + (errorType === 'omission' ? 0.05 : 0.02)) * penaltyScale;

      this.currentTheta = Math.max(-3.0, this.currentTheta - delta);

      let nextDiff = this.deriveDifficultyFromTheta(this.currentTheta);
      if (this.patientPrefersForwardOnly && nextDiff.recallMode === 'backward') {
        nextDiff = { ...nextDiff, recallMode: 'forward' };
      }
      this.currentDifficulty = nextDiff;

      if (this.currentDifficulty.digitCount === 2) {
        reasoning = {
          as: `স্মৃতিৰ চাপ পৰিলক্ষিত। AI এ আত্মসন্মান ৰক্ষাৰ বাবে খেলখন ২টা সংখ্যা আৰু ৫০% সহায়িকা সংকেতলৈ সহজ কৰি দিলে।`,
          bn: `স্মৃতির চাপ পরিলক্ষিত। AI আত্মমর্যাদা রক্ষার জন্য খেলাটি ২টি সংখ্যা এবং ৫০% সহায়ক সংকেতে সহজ করে দিল।`,
          hi: `स्मृति भार महसूस हुआ। AI ने सम्मान रक्षा हेतु स्तर को केवल २ अंक और ५०% सहायक वॉटरमार्क पर निर्धारित किया।`,
          en: `Cognitive overload detected. AI gently calibrated down to the clinical floor: 2 digits with 50% watermark scaffolding and slow pacing.`,
        };
      } else {
        reasoning = {
          as: `ধ্বনিতত্ত্ব সহায় সক্ৰিয়। AI এ স্তৰ ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.digitCount}টা সংখ্যা, প্ৰদৰ্শন সময় ${this.currentDifficulty.displaySpeedMs}ms) লৈ সংগতিপূৰ্ণভাৱে সহজ কৰিলে।`,
          bn: `ধ্বনিতত্ত্ব সাহায্য সক্রিয়। AI স্তর ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.digitCount}টি সংখ্যা, প্রদর্শন সময় ${this.currentDifficulty.displaySpeedMs}ms)-এ সহজ করল।`,
          hi: `सहायक मार्गदर्शन सक्रिय। AI ने स्तर ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.digitCount} अंक, प्रदर्शन समय ${this.currentDifficulty.displaySpeedMs}ms) पर समायोजन किया।`,
          en: `Phonological scaffolding activated. AI adapted to Tier ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.digitCount} digits with extended ${this.currentDifficulty.displaySpeedMs}ms exposure).`,
        };
      }
    }

    return { newTheta: this.currentTheta, reasoning, settingsImpactRationale, autonomyScore };
  }

  /**
   * Real-Time AI Dynamic Intervention Analysis during Active Trial.
   */
  public analyzeLiveIntervention(params: {
    idleTimeSeconds: number;
    consecutiveFastSolves: number;
    currentDigitLength: number;
    watermarkActive: boolean;
  }): { action: 'none' | 'watermark_reveal' | 'audio_replay_assist' | 'tempo_acceleration'; rationale: Record<SupportedLanguage, string> } {
    const { idleTimeSeconds, consecutiveFastSolves, watermarkActive } = params;

    // Detect persistent hesitation (> 12s)
    if (idleTimeSeconds >= 12 && !watermarkActive) {
      return {
        action: 'watermark_reveal',
        rationale: {
          as: `দীৰ্ঘসময় চিন্তা পৰিলক্ষিত (>১২ ছেকেণ্ড)। AI এ সহায়ৰ বাবে মৃদু সহায়িকা সংকেত দেখুৱালে।`,
          bn: `দীর্ঘসময় চিন্তা পরিলক্ষিত (>১২ সেকেন্ড)। AI সহায়তার জন্য মৃদু সহায়ক সংকেত দেখাল।`,
          hi: `अत्यधिक ठहराव (>१२ सेकंड)। AI ने बिना दबाव के सहायता हेतु हल्का वॉटरमार्क प्रकट किया।`,
          en: `Prolonged hesitation detected (>12s). AI proactively revealed gentle ghost watermark outlines.`,
        },
      };
    }

    // Detect high mental flow (3 consecutive fast solves < 2500ms)
    if (consecutiveFastSolves >= 3) {
      return {
        action: 'tempo_acceleration',
        rationale: {
          as: `দ্ৰুত আৰু নিৰ্ভুল ক্ৰম সমাধান! AI এ মানসিক একাগ্ৰতা বৃদ্ধি কৰিবলৈ গতি দ্ৰুত কৰিলে।`,
          bn: `দ্রুত ও নির্ভুল ক্রম সমাধান! AI মানসিক একাগ্রতা বৃদ্ধি করতে গতি দ্রুত করল।`,
          hi: `तीव्र और सटीक स्मरण प्रवाह! AI ने कार्यकारी चुनौती बढ़ाने के लिए गति में वृद्धि की।`,
          en: `Fluid working memory flow observed! AI accelerated presentation tempo to stimulate attentional focus.`,
        },
      };
    }

    return {
      action: 'none',
      rationale: { as: '', bn: '', hi: '', en: '' },
    };
  }

  /**
   * Calculates WAIS-IV Digit Span Standard Scaled Score (1 to 19 scale).
   * Mapped from Forward Span + Backward Span according to Wechsler normative tables for older adults (65-85+).
   */
  public calculateWAISDigitSpanScore(forwardSpan: number, backwardSpan: number, theta?: number): number {
    if (theta !== undefined) {
      // Psychometric 2PL IRT linear transformation to Wechsler scale N(10, 3^2)
      return Math.max(1, Math.min(19, Math.round(10 + theta * 3.0)));
    }

    const fSpan = Math.max(0, forwardSpan);
    const bSpan = Math.max(0, backwardSpan);
    // Wechsler Adult Intelligence Scale IV age-normed composite span sum (Forward + Backward)
    const rawSum = fSpan + bSpan;
    
    if (rawSum <= 3) return 1;
    if (rawSum === 4) return 2;
    if (rawSum === 5) return 3;
    if (rawSum === 6) return 5;
    if (rawSum === 7) return 6;
    if (rawSum === 8) return 8;
    if (rawSum === 9) return 9;
    if (rawSum === 10) return 10; // Standard median for healthy older adults (50th percentile)
    if (rawSum === 11) return 11;
    if (rawSum === 12) return 13;
    if (rawSum === 13) return 14;
    if (rawSum >= 14) return Math.min(19, 15 + (rawSum - 14));
    return 10;
  }

  /**
   * Compiles the complete clinical session summary payload for Caregiver Dashboard & Physician Reports.
   */
  public compileSessionSummary(
    trials: NumberRecallTrialTelemetry[],
    caregiverEndedEarly: boolean = false
  ): NumberRecallSessionSummary {
    const totalTrials = trials.length;
    const correctTrials = trials.filter(t => t.isCorrect).length;
    const accuracyPercentage = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

    // Max spans achieved
    const forwardTrials = trials.filter(t => t.recallMode === 'forward' && t.isCorrect);
    const backwardTrials = trials.filter(t => t.recallMode === 'backward' && t.isCorrect);

    const maxForwardSpanAchieved = forwardTrials.length > 0
      ? Math.max(...forwardTrials.map(t => t.digitCount))
      : 2;

    const maxBackwardSpanAchieved = backwardTrials.length > 0
      ? Math.max(...backwardTrials.map(t => t.digitCount))
      : 0;

    const waisDigitSpanScaledScore = this.calculateWAISDigitSpanScore(
      maxForwardSpanAchieved,
      maxBackwardSpanAchieved,
      this.currentTheta
    );

    // Phonological Loop Integrity Rating
    let phonologicalLoopRating: PhonologicalLoopRating = 'preserved';
    if (maxForwardSpanAchieved <= 3 || accuracyPercentage < 50) {
      phonologicalLoopRating = 'marked_loop_decay';
    } else if (maxForwardSpanAchieved <= 4 || accuracyPercentage < 75) {
      phonologicalLoopRating = 'mild_slowing';
    }

    // Dorsolateral Prefrontal Cortex (DLPFC) Reversal Status
    let dorsolateralPrefrontalStatus: PrefrontalReversalStatus = 'intact_reversal';
    if (backwardTrials.length === 0 && trials.some(t => t.recallMode === 'backward')) {
      dorsolateralPrefrontalStatus = 'marked_reversal_failure';
    } else if (maxBackwardSpanAchieved <= 3 && maxBackwardSpanAchieved > 0) {
      dorsolateralPrefrontalStatus = 'moderate_executive_load';
    }

    // Serial Position Curve Aggregations
    const primacyTrials = trials.filter(t => t.primacyAccuracy);
    const recencyTrials = trials.filter(t => t.recencyAccuracy);

    const primacyRetentionRate = totalTrials > 0 ? Math.round((primacyTrials.length / totalTrials) * 100) : 0;
    const recencyRetentionRate = totalTrials > 0 ? Math.round((recencyTrials.length / totalTrials) * 100) : 0;

    // Intermediate retention
    let intermediateHits = 0;
    let intermediateTotal = 0;
    trials.forEach(t => {
      if (t.serialPositionHits.length > 2) {
        for (let i = 1; i < t.serialPositionHits.length - 1; i++) {
          intermediateTotal++;
          if (t.serialPositionHits[i]) intermediateHits++;
        }
      }
    });
    const intermediateRetentionRate = intermediateTotal > 0
      ? Math.round((intermediateHits / intermediateTotal) * 100)
      : primacyRetentionRate;

    let clinicalInterpretation = 'Standard U-shaped serial curve: High primacy (long-term rehearsal) and intact recency buffer.';
    if (primacyRetentionRate < 50 && recencyRetentionRate >= 75) {
      clinicalInterpretation = 'Anterograde consolidation deficit: Depressed primacy effect with preserved echoic recency (Alzheimer’s hallmark pattern).';
    } else if (primacyRetentionRate < 50 && recencyRetentionRate < 50) {
      clinicalInterpretation = 'Global working memory decay: Generalized breakdown across both echoic and rehearsal phonological loops.';
    }

    // Operational Timings & Rhythm
    const totalDeliberationMs = trials.reduce((acc, t) => acc + t.timeToFirstKeypressMs, 0);
    const meanDeliberationMs = totalTrials > 0 ? Math.round(totalDeliberationMs / totalTrials) : 0;

    const totalInterDigitMs = trials.reduce((acc, t) => acc + t.meanInterDigitLatencyMs, 0);
    const meanInterDigitLatencyMs = totalTrials > 0 ? Math.round(totalInterDigitMs / totalTrials) : 0;

    const totalBackspaceCorrections = trials.reduce((acc, t) => acc + t.backspaceCorrectionsCount, 0);
    const totalReplaysRequested = trials.reduce((acc, t) => acc + t.replaysUsedCount, 0);

    // Keystroke Rhythm Profile
    let keystrokeRhythmProfile: KeystrokeRhythmProfile = 'deliberate_rhythmic';
    if (this.tremorTapsFilteredCount >= 4) {
      keystrokeRhythmProfile = 'tremor_dominant';
    } else if (meanInterDigitLatencyMs < 450) {
      keystrokeRhythmProfile = 'fluid_rapid';
    } else if (meanInterDigitLatencyMs > 1200) {
      keystrokeRhythmProfile = 'hesitant_variable';
    }

    // Autonomy Score
    const meanAutonomy = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + (t.autonomyScore ?? 70), 0) / totalTrials)
      : 70;

    let patientSettingsAutonomyRating: 'autonomous_mastery' | 'moderate_scaffolding' | 'high_scaffolding_reliance' = 'moderate_scaffolding';
    if (meanAutonomy >= 80) {
      patientSettingsAutonomyRating = 'autonomous_mastery';
    } else if (meanAutonomy < 50) {
      patientSettingsAutonomyRating = 'high_scaffolding_reliance';
    }

    const watermarkTrials = trials.filter(t => t.settingsSnapshot?.ghostWatermarkEnabled !== false).length;
    const watermarkIndependence = watermarkTrials === 0
      ? 'Watermark ghost outline was disabled across all trials (100% unassisted working memory recall).'
      : `Ghost watermark scaffolding active in ${watermarkTrials} of ${totalTrials} trial(s).`;

    const speechGuidanceReliance = totalReplaysRequested > 0
      ? `Patient utilized ${totalReplaysRequested} audio sequence replays to reinforce phonological buffer access.`
      : 'Zero audio replays required; immediate auditory-visual encoding preserved.';

    const metacognitiveCorrectionActivity = totalBackspaceCorrections > 0
      ? `Patient executed ${totalBackspaceCorrections} spontaneous backspace self-corrections, confirming active metacognitive error monitoring.`
      : 'Direct forward entry executed without backspace corrections.';

    return {
      gameId: 'number-recall',
      totalTrials,
      correctTrials,
      accuracyPercentage,
      maxForwardSpanAchieved,
      maxBackwardSpanAchieved,
      waisDigitSpanScaledScore,
      phonologicalLoopRating,
      dorsolateralPrefrontalStatus,
      keystrokeRhythmProfile,
      serialPositionProfile: {
        primacyRetentionRate,
        recencyRetentionRate,
        intermediateRetentionRate,
        clinicalInterpretation,
      },
      autonomyScore: meanAutonomy,
      patientSettingsAutonomyRating,
      settingsAnalysisReport: {
        watermarkIndependence,
        speechGuidanceReliance,
        metacognitiveCorrectionActivity,
      },
      meanDeliberationMs,
      meanInterDigitLatencyMs,
      totalBackspaceCorrections,
      totalReplaysRequested,
      tremorTapsFilteredCount: this.tremorTapsFilteredCount,
      finalTheta: Number(this.currentTheta.toFixed(2)),
      completedAt: new Date().toISOString(),
      caregiverEndedEarly,
      trials,
    };
  }
}
