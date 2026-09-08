import { LOCATIONS, type LocationData } from './data';
import type {
  WhereAmIDifficulty,
  WhereAmISettingsSnapshot,
  WhereAmITrialTelemetry,
  WhereAmISessionSummary,
  TopographicalOrientationStatus,
  SemanticRetrievalEfficiency,
  VisuomotorDeliberationProfile,
  OasisWhereAmIPersona,
} from './types';
import type { SupportedLanguage } from '../../types/prescription';
import { CognitiveClassifier } from '../../engine/cognitive-classifier';

/**
 * 9 Fine-Grained Minimal Step Tiers (2 to 5 Choices, Progressive Clues)
 * Follows MoCA Place Orientation & CANTAB Topographical Wayfinding Progression.
 */
export const WHERE_AM_I_TIERS: WhereAmIDifficulty[] = [
  {
    tierLevel: 1,
    choicesCount: 2,
    initialVisibleClues: 3,
    clueIntervalSec: 15,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'different_state_distinct',
    autoAssistTimeoutMs: 25000,
    tremorDebounceMs: 400,
    itemDifficultyB: -2.2,
    discriminationA: 1.2,
    tierDescription: {
      as: 'স্তৰ ১ (নিম্নতম সীমা): ২টা বিকল্প, ৩টা মুকলি সংকেত, স্পষ্ট পাৰ্থক্য',
      bn: 'স্তর ১ (সর্বনিম্ন সীমা): ২টি বিকল্প, ৩টি উন্মুক্ত সূত্র, স্পষ্ট পার্থক্য',
      hi: 'स्तर १ (न्यूनतम सीमा): २ विकल्प, ३ खुले सुराग, स्पष्ट अंतर',
      en: 'Tier 1 Floor: 2 Choices, 3 Open Clues, Stark Regional Contrast',
    },
  },
  {
    tierLevel: 2,
    choicesCount: 2,
    initialVisibleClues: 2,
    clueIntervalSec: 14,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'different_state_distinct',
    autoAssistTimeoutMs: 22000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.7,
    discriminationA: 1.3,
    tierDescription: {
      as: 'স্তৰ ২: ২টা বিকল্প, ২টা মুকলি সংকেত, ভিন্ন ৰাজ্যৰ বিকল্প',
      bn: 'স্তর ২: ২টি বিকল্প, ২টি উন্মুক্ত সূত্র, ভিন্ন রাজ্যের বিকল্প',
      hi: 'स्तर २: २ विकल्प, २ खुले सुराग, भिन्न राज्य के विकल्प',
      en: 'Tier 2: 2 Choices, 2 Open Clues, Distinct State Distractor',
    },
  },
  {
    tierLevel: 3,
    choicesCount: 3,
    initialVisibleClues: 2,
    clueIntervalSec: 12,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'different_state',
    autoAssistTimeoutMs: 20000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.1,
    discriminationA: 1.3,
    tierDescription: {
      as: 'স্তৰ ৩: ৩টা বিকল্প, ২টা মুকলি সংকেত, উত্তৰ-পূবৰ বিভিন্ন ৰাজ্য',
      bn: 'স্তর ৩: ৩টি বিকল্প, ২টি উন্মুক্ত সূত্র, উত্তর-পূর্বের বিভিন্ন রাজ্য',
      hi: 'स्तर ३: ३ विकल्प, २ खुले सुराग, पूर्वोत्तर के विभिन्न राज्य',
      en: 'Tier 3: 3 Choices, 2 Open Clues, Cross-State Distractors',
    },
  },
  {
    tierLevel: 4,
    choicesCount: 3,
    initialVisibleClues: 1,
    clueIntervalSec: 11,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'different_state',
    autoAssistTimeoutMs: 18000,
    tremorDebounceMs: 400,
    itemDifficultyB: -0.5,
    discriminationA: 1.4,
    tierDescription: {
      as: 'স্তৰ ৪: ৩টা বিকল্প, ১টা প্ৰাৰম্ভিক সংকেত, ঐচ্ছিক সংকেত উন্মোচন',
      bn: 'স্তর ৪: ৩টি বিকল্প, ১টি প্রাথমিক সূত্র, ঐচ্ছিক সূত্র উন্মোচন',
      hi: 'स्तर ४: ३ विकल्प, १ प्रारंभिक सुराग, स्वैच्छिक सुराग प्रकटीकरण',
      en: 'Tier 4: 3 Choices, 1 Initial Clue, Progressive Unfold on Request',
    },
  },
  {
    tierLevel: 5,
    choicesCount: 4,
    initialVisibleClues: 1,
    clueIntervalSec: 10,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'neighbor_state',
    autoAssistTimeoutMs: 16000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.0,
    discriminationA: 1.5,
    tierDescription: {
      as: 'স্তৰ ৫ (প্ৰমিত আধাৰ): ৪টা বিকল্প, ওচৰৰ ৰাজ্যৰ বিকল্প, মান্য স্থান সন্ধান',
      bn: 'স্তর ৫ (প্রমিত ভিত্তি): ৪টি বিকল্প, নিকটবর্তী রাজ্যের বিকল্প, প্রমিত সন্ধান',
      hi: 'स्तर ५ (मानक आधार): ४ विकल्प, निकटवर्ती राज्य विकल्प, मानक स्थानिक पहचान',
      en: 'Tier 5 (Clinical Baseline): 4 Choices, Neighboring State Distractors',
    },
  },
  {
    tierLevel: 6,
    choicesCount: 4,
    initialVisibleClues: 1,
    clueIntervalSec: 9,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'same_state_different_biome',
    autoAssistTimeoutMs: 15000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.6,
    discriminationA: 1.5,
    tierDescription: {
      as: 'স্তৰ ৬: ৪টা বিকল্প, একে ৰাজ্যৰ বিভিন্ন স্থানৰ মাজত পাৰ্থক্য নিৰূপণ',
      bn: 'স্তর ৬: ৪টি বিকল্প, একই রাজ্যের বিভিন্ন স্থানের মধ্যে পার্থক্য নির্ধারণ',
      hi: 'स्तर ६: ४ विकल्प, एक ही राज्य के विभिन्न स्थलों में अंतर',
      en: 'Tier 6: 4 Choices, Intra-State Landmark Discrimination',
    },
  },
  {
    tierLevel: 7,
    choicesCount: 4,
    initialVisibleClues: 1,
    clueIntervalSec: 8,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'same_state_different_biome',
    autoAssistTimeoutMs: 14000,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.2,
    discriminationA: 1.6,
    tierDescription: {
      as: 'স্তৰ ৭: ৪টা বিকল্প, একে ভৌগোলিক অঞ্চলৰ ঐতিহাসিক স্থানৰ তুলনা',
      bn: 'স্তর ৭: ৪টি বিকল্প, একই ভৌগোলিক অঞ্চলের ঐতিহাসিক স্থানের তুলনা',
      hi: 'स्तर ७: ४ विकल्प, समान भौगोलिक क्षेत्र के ऐतिहासिक स्थलों की तुलना',
      en: 'Tier 7: 4 Choices, High-Proximity Historical & Geographic Landmarks',
    },
  },
  {
    tierLevel: 8,
    choicesCount: 5,
    initialVisibleClues: 1,
    clueIntervalSec: 7,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'same_state_same_biome',
    autoAssistTimeoutMs: 12000,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.8,
    discriminationA: 1.7,
    tierDescription: {
      as: 'স্তৰ ৮: ৫টা বিকল্প, একে শ্ৰেণীৰ স্থান (যেনে মন্দিৰ বা অভয়াৰণ্য)',
      bn: 'স্তর ৮: ৫টি বিকল্প, একই শ্রেণীর স্থান (যেমন মন্দির বা অভয়ারণ্য)',
      hi: 'स्तर ८: ५ विकल्प, समान श्रेणी के स्थल (जैसे मंदिर अथवा अभयारण्य)',
      en: 'Tier 8: 5 Choices, Same Category Landmark Disambiguation',
    },
  },
  {
    tierLevel: 9,
    choicesCount: 5,
    initialVisibleClues: 1,
    clueIntervalSec: 6,
    compassAllowed: true,
    compassEliminatesCount: 1,
    distractorStrategy: 'same_state_same_biome',
    autoAssistTimeoutMs: 10000,
    tremorDebounceMs: 400,
    itemDifficultyB: 2.4,
    discriminationA: 1.8,
    tierDescription: {
      as: 'স্তৰ ৯ (শীৰ্ষ প্ৰত্যাহ্বান): ৫টা বিকল্প, সূক্ষ্ম সংকেত, উচ্চতম স্থান পৰীক্ষা',
      bn: 'স্তর ৯ (শীর্ষ চ্যালেঞ্জ): ৫টি বিকল্প, সূক্ষ্ম সূত্র, সর্বোচ্চ স্থান পরীক্ষা',
      hi: 'स्तर ९ (शीर्ष चुनौती): ५ विकल्प, अत्यंत सूक्ष्म सुराग, उच्चतम स्थानिक संज्ञान',
      en: 'Tier 9 (Cognitive Ceiling): 5 Choices, Fine-Grained Semantic Discrimination',
    },
  },
];

export interface GeneratedTrial {
  targetLocation: LocationData;
  options: LocationData[];
  initialVisibleClues: number;
}

/**
 * WhereAmIEngine
 * Implements Bayesian 2PL IRT Dynamic Difficulty Adjustment,
 * Landmark Wayfinding and Topographical Orientation Scaffolding,
 * Hardware Tremor Guard (400ms), and Compass Distractor Elimination.
 */
export class WhereAmIEngine {
  private currentTheta: number;
  private currentDifficulty: WhereAmIDifficulty;
  private consecutiveSuccesses: number = 0;
  private consecutiveErrors: number = 0;
  private lastTapTimestamp: number = 0;
  private tremorTapsFilteredCount: number = 0;

  constructor(initialTheta: number = 0.0) {
    this.currentTheta = Math.max(-3.0, Math.min(3.0, initialTheta));
    this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
  }

  public getTheta(): number {
    return this.currentTheta;
  }

  public getDifficulty(): WhereAmIDifficulty {
    return { ...this.currentDifficulty };
  }

  public setDifficulty(diff: WhereAmIDifficulty): void {
    this.currentDifficulty = { ...diff };
  }

  public getTremorFilteredCount(): number {
    return this.tremorTapsFilteredCount;
  }

  /**
   * Derives optimal minimal-step tier from Bayesian latent ability theta.
   */
  public deriveDifficultyFromTheta(theta: number): WhereAmIDifficulty {
    if (theta <= -1.8) return WHERE_AM_I_TIERS[0]; // Tier 1: 2 choices, 3 clues
    if (theta <= -1.3) return WHERE_AM_I_TIERS[1]; // Tier 2: 2 choices, 2 clues
    if (theta <= -0.7) return WHERE_AM_I_TIERS[2]; // Tier 3: 3 choices, 2 clues
    if (theta <= -0.1) return WHERE_AM_I_TIERS[3]; // Tier 4: 3 choices, 1 clue
    if (theta <= 0.5)  return WHERE_AM_I_TIERS[4]; // Tier 5: 4 choices (Baseline)
    if (theta <= 1.1)  return WHERE_AM_I_TIERS[5]; // Tier 6: 4 choices (Intra-state)
    if (theta <= 1.7)  return WHERE_AM_I_TIERS[6]; // Tier 7: 4 choices (Close biome)
    if (theta <= 2.2)  return WHERE_AM_I_TIERS[7]; // Tier 8: 5 choices
    return WHERE_AM_I_TIERS[8];                    // Tier 9: 5 choices ceiling
  }

  public getDifficultyForTierLevel(tierLevel: number): WhereAmIDifficulty {
    const found = WHERE_AM_I_TIERS.find(t => t.tierLevel === tierLevel);
    return found ? { ...found } : WHERE_AM_I_TIERS[4];
  }

  /**
   * Hardware Tremor Debounce Guard (400ms).
   * Protects against Parkinsonian motor jitter and clock rollback.
   */
  public filterTremorTap(now: number = Date.now()): boolean {
    if (now < this.lastTapTimestamp) {
      this.lastTapTimestamp = now;
      return true;
    }
    if (now - this.lastTapTimestamp < this.currentDifficulty.tremorDebounceMs) {
      this.tremorTapsFilteredCount++;
      return false; // Suppress involuntary jitter
    }
    this.lastTapTimestamp = now;
    return true;
  }

  /**
   * Generates a psychometrically calibrated trial based on the active tier.
   */
  public generateTrial(difficulty: WhereAmIDifficulty, excludeLocationIds: string[] = []): GeneratedTrial {
    // 1. Pick target location not recently used
    const pool = LOCATIONS.filter(l => !excludeLocationIds.includes(l.id));
    const availablePool = pool.length > 0 ? pool : LOCATIONS;
    const target = availablePool[Math.floor(Math.random() * availablePool.length)];

    // 2. Distractor selection strategy based on tier
    const distractorCandidates = LOCATIONS.filter(l => l.id !== target.id);
    let selectedDistractors: LocationData[] = [];
    const needed = difficulty.choicesCount - 1;

    switch (difficulty.distractorStrategy) {
      case 'different_state_distinct': {
        // Different state and different category
        const match = distractorCandidates.filter(l => l.state !== target.state && l.category !== target.category);
        const shuffled = match.sort(() => 0.5 - Math.random());
        selectedDistractors = shuffled.slice(0, needed);
        break;
      }
      case 'different_state': {
        // Different North-East state
        const match = distractorCandidates.filter(l => l.state !== target.state);
        const shuffled = match.sort(() => 0.5 - Math.random());
        selectedDistractors = shuffled.slice(0, needed);
        break;
      }
      case 'neighbor_state': {
        // Mix: 1 from same or adjacent, rest from other NE states
        const sameOrNear = distractorCandidates.filter(l => l.state === target.state);
        const others = distractorCandidates.filter(l => l.state !== target.state);
        const pickSame = sameOrNear.length > 0 ? [sameOrNear[Math.floor(Math.random() * sameOrNear.length)]] : [];
        const pickOthers = others.sort(() => 0.5 - Math.random()).slice(0, needed - pickSame.length);
        selectedDistractors = [...pickSame, ...pickOthers];
        break;
      }
      case 'same_state_different_biome': {
        // Prioritize same state, different category
        const sameState = distractorCandidates.filter(l => l.state === target.state);
        const others = distractorCandidates.filter(l => l.state !== target.state);
        const shuffledSame = sameState.sort(() => 0.5 - Math.random());
        selectedDistractors = shuffledSame.slice(0, needed);
        if (selectedDistractors.length < needed) {
          const fill = others.sort(() => 0.5 - Math.random()).slice(0, needed - selectedDistractors.length);
          selectedDistractors.push(...fill);
        }
        break;
      }
      case 'same_state_same_biome': {
        // Prioritize same category or same state
        const sameCatOrState = distractorCandidates.filter(l => l.category === target.category || l.state === target.state);
        const others = distractorCandidates.filter(l => l.category !== target.category && l.state !== target.state);
        const shuffled = sameCatOrState.sort(() => 0.5 - Math.random());
        selectedDistractors = shuffled.slice(0, needed);
        if (selectedDistractors.length < needed) {
          const fill = others.sort(() => 0.5 - Math.random()).slice(0, needed - selectedDistractors.length);
          selectedDistractors.push(...fill);
        }
        break;
      }
    }

    // Safety fallback: if not enough distractors chosen, fill from remaining
    if (selectedDistractors.length < needed) {
      const remaining = distractorCandidates.filter(l => !selectedDistractors.some(s => s.id === l.id));
      const fill = remaining.sort(() => 0.5 - Math.random()).slice(0, needed - selectedDistractors.length);
      selectedDistractors.push(...fill);
    }

    // Combine and shuffle options
    const options = [target, ...selectedDistractors].sort(() => 0.5 - Math.random());

    return {
      targetLocation: target,
      options,
      initialVisibleClues: Math.min(4, Math.max(1, difficulty.initialVisibleClues)),
    };
  }

  /**
   * Compass Hint: Eliminates wrong distractor options without humiliating the patient.
   */
  public applyCompassHint(
    options: LocationData[],
    targetId: string,
    eliminateCount: number = 1
  ): string[] {
    const wrongOptions = options.filter(o => o.id !== targetId);
    const shuffledWrong = [...wrongOptions].sort(() => 0.5 - Math.random());
    const toEliminate = shuffledWrong.slice(0, eliminateCount).map(o => o.id);
    return toEliminate;
  }

  /**
   * Bayesian 2PL Item Response Theory (IRT) Update Step.
   * Adjusts latent ability theta based on response accuracy, clues consumed, and compass assistance.
   */
  public updateTheta(
    isCorrect: boolean,
    deliberationTimeMs: number,
    cluesRevealedCount: number,
    settings?: WhereAmISettingsSnapshot
  ): {
    newTheta: number;
    reasoning: Record<SupportedLanguage, string>;
    autonomyScore: number;
  } {
    const diff = this.currentDifficulty;
    const a = diff.discriminationA;
    const b = diff.itemDifficultyB;

    // 2PL Logistic probability of correct identification
    const p = 1.0 / (1.0 + Math.exp(-a * (this.currentTheta - b)));

    // Effective credit U discounted for scaffolding reliance
    let u = 0.0;
    if (isCorrect) {
      if (cluesRevealedCount <= 1) {
        u = 1.0; // Perfect unassisted retrieval on 1st clue
      } else if (cluesRevealedCount === 2) {
        u = 0.85;
      } else if (cluesRevealedCount === 3) {
        u = 0.70;
      } else {
        u = 0.55; // 4th clue or exhaustive assistance
      }

      // Compass hint usage penalty
      if (settings?.compassHintUsed) {
        u = Math.max(0.20, u - 0.15);
      }
    }

    // Autonomy Scoring (0 to 100%)
    let autonomyScore = 100;
    autonomyScore -= (cluesRevealedCount - 1) * 12; // -12% per extra clue
    if (settings?.compassHintUsed) autonomyScore -= 20;
    if (deliberationTimeMs > 10000) autonomyScore -= 10;
    if (isCorrect && cluesRevealedCount === 1 && deliberationTimeMs < 3500 && !settings?.compassHintUsed) {
      autonomyScore = 100; // Perfect rapid mastery
    }
    autonomyScore = Math.max(10, Math.min(100, autonomyScore));

    // Learning rate weighted by autonomy
    const learningRate = 0.35 * (autonomyScore / 100.0);
    let delta = learningRate * a * (u - p);
    if (isCorrect && delta < 0.02) {
      delta = 0.02; // Clinically, any correct solve awards positive progress
    }

    this.currentTheta = Math.max(-3.0, Math.min(3.0, this.currentTheta + delta));


    if (isCorrect) {
      this.consecutiveSuccesses++;
      this.consecutiveErrors = 0;
    } else {
      this.consecutiveErrors++;
      this.consecutiveSuccesses = 0;
    }

    // Clinician-facing adaptation reasoning
    const reasoning: Record<SupportedLanguage, string> = isCorrect
      ? {
          as: `সঠিক স্থান চিনাক্তকৰণ! স্থান সংবেদনশীলতা আৰু শব্দ সন্ধান অক্ষত (θ: ${this.currentTheta >= 0 ? '+' : ''}${this.currentTheta.toFixed(2)}, স্বায়ত্তশাসন: ${autonomyScore}%)।`,
          bn: `সঠিক স্থান চিহ্নিতকরণ! স্থান সংবেদনশীলতা ও স্মৃতি পুনরুদ্ধার অক্ষত (θ: ${this.currentTheta >= 0 ? '+' : ''}${this.currentTheta.toFixed(2)}, স্বায়ত্তশাসন: ${autonomyScore}%)।`,
          hi: `सटीक स्थान पहचान! स्थानिक संज्ञान एवं स्मृति पुनर्प्राप्ति दृढ़ (θ: ${this.currentTheta >= 0 ? '+' : ''}${this.currentTheta.toFixed(2)}, स्वायत्तता: ${autonomyScore}%)।`,
          en: `Accurate landmark identification! Topographical associative memory intact (θ: ${this.currentTheta >= 0 ? '+' : ''}${this.currentTheta.toFixed(2)}, Autonomy: ${autonomyScore}%).`,
        }
      : {
          as: `ভুল স্থান নিৰ্বাচন। AI এ পৰৱৰ্তী ৰাউণ্ডত সহজ সংকেত আৰু অতিৰিক্ত আভাস প্ৰদান কৰিব (θ: ${this.currentTheta >= 0 ? '+' : ''}${this.currentTheta.toFixed(2)})।`,
          bn: `ভুল স্থান নির্বাচন। AI পরবর্তী রাউন্ডে সহজ সূত্র ও সহায়ক বিকল্প প্রদান করবে (θ: ${this.currentTheta >= 0 ? '+' : ''}${this.currentTheta.toFixed(2)})।`,
          hi: `गलत स्थान चयन। AI अगले प्रयास में अधिक सुराग एवं सहायक दिशा प्रदान करेगा (θ: ${this.currentTheta >= 0 ? '+' : ''}${this.currentTheta.toFixed(2)})।`,
          en: `Topographical misidentification captured. AI adjusting semantic clue salience and option pool (θ: ${this.currentTheta >= 0 ? '+' : ''}${this.currentTheta.toFixed(2)}).`,
        };

    return {
      newTheta: this.currentTheta,
      reasoning,
      autonomyScore,
    };
  }

  /**
   * Real-time dynamic in-trial intervention monitor.
   */
  public analyzeLiveIntervention(params: {
    idleTimeSeconds: number;
    cluesRevealedCount: number;
    maxClues: number;
    compassUsed: boolean;
  }): {
    action: 'auto_reveal_clue' | 'suggest_compass' | 'none';
    rationale: Record<SupportedLanguage, string>;
  } {
    const { idleTimeSeconds, cluesRevealedCount, maxClues, compassUsed } = params;

    // Hesitation > 10s and unrevealed clues remain
    if (idleTimeSeconds >= 10 && cluesRevealedCount < maxClues) {
      return {
        action: 'auto_reveal_clue',
        rationale: {
          as: 'দীৰ্ঘসময় চিন্তা পৰিলক্ষিত (>১০ ছেকেণ্ড)। AI এ সহায়ৰ বাবে পৰৱৰ্তী সংকেত প্ৰকাশ কৰিলে।',
          bn: 'দীর্ঘসময় চিন্তা পরিলক্ষিত (>১০ সেকেন্ড)। AI সহায়তার জন্য পরবর্তী সূত্র প্রকাশ করল।',
          hi: 'अत्यधिक ठहराव (>१० सेकंड)। AI ने बिना दबाव के अगला सुराग प्रकट किया।',
          en: 'Hesitation captured (>10s). AI automatically unfolded the next progressive clue.',
        },
      };
    }

    // Still hesitating > 18s after clues revealed, compass available
    if (idleTimeSeconds >= 18 && !compassUsed && this.currentDifficulty.compassAllowed) {
      return {
        action: 'suggest_compass',
        rationale: {
          as: 'স্থান চিনাক্তকৰণত বাধা। AI এ কম্পাসৰ সহায় ল’বলৈ পৰামৰ্শ আগবঢ়াইছে।',
          bn: 'স্থান চিহ্নিতকরণে বাধা। AI কম্পাসের সাহায্য নেওয়ার পরামর্শ দিচ্ছে।',
          hi: 'स्थान पहचानने में संकोच। AI ने दिशा सूचक कम्पास का संकेत दिया।',
          en: 'Semantic retrieval hesitation. AI illuminated the compass hint button.',
        },
      };
    }

    return {
      action: 'none',
      rationale: { as: '', bn: '', hi: '', en: '' },
    };
  }

  /**
   * Compiles complete clinical session summary payload for Caregiver Dashboard & Physician Reports.
   */
  public compileSessionSummary(
    trials: WhereAmITrialTelemetry[],
    caregiverEndedEarly: boolean = false
  ): WhereAmISessionSummary {
    const totalTrials = trials.length;
    const correctTrials = trials.filter(t => t.isCorrect).length;
    const accuracyPercentage = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

    const totalClues = trials.reduce((acc, t) => acc + t.cluesRevealedCount, 0);
    const meanCluesPerTrial = totalTrials > 0 ? Number((totalClues / totalTrials).toFixed(1)) : 1.0;

    const totalDeliberation = trials.reduce((acc, t) => acc + t.deliberationTimeMs, 0);
    const meanDeliberationMs = totalTrials > 0 ? Math.round(totalDeliberation / totalTrials) : 0;

    const compassHintsUsedTotal = trials.filter(t => t.compassHintUsed).length;

    const totalAutonomy = trials.reduce((acc, t) => acc + (t.autonomyScore ?? 80), 0);
    const autonomyScore = totalTrials > 0 ? Math.round(totalAutonomy / totalTrials) : 80;

    let patientSettingsAutonomyRating: 'autonomous_mastery' | 'moderate_scaffolding' | 'high_scaffolding_reliance' = 'moderate_scaffolding';
    if (autonomyScore >= 85) {
      patientSettingsAutonomyRating = 'autonomous_mastery';
    } else if (autonomyScore < 60) {
      patientSettingsAutonomyRating = 'high_scaffolding_reliance';
    }

    // Topographical Orientation Status (MoCA / CANTAB)
    let topographicalOrientationStatus: TopographicalOrientationStatus = 'intact_wayfinding';
    if (accuracyPercentage < 55) {
      topographicalOrientationStatus = 'marked_disorientation';
    } else if (accuracyPercentage < 80) {
      topographicalOrientationStatus = 'mild_topographical_disorientation';
    }

    // Semantic Retrieval Efficiency
    let semanticRetrievalEfficiency: SemanticRetrievalEfficiency = 'rapid_direct';
    if (meanCluesPerTrial > 2.8) {
      semanticRetrievalEfficiency = 'profound_retrieval_deficit';
    } else if (meanCluesPerTrial > 1.6) {
      semanticRetrievalEfficiency = 'clue_dependent_retrieval';
    }

    // Visuomotor Profile
    let visuomotorProfile: VisuomotorDeliberationProfile = 'deliberate_systematic';
    if (this.tremorTapsFilteredCount >= 4) {
      visuomotorProfile = 'tremor_dominant';
    } else if (meanDeliberationMs < 2500) {
      visuomotorProfile = 'rapid_attentive';
    } else if (meanDeliberationMs > 8000) {
      visuomotorProfile = 'hesitant_search';
    }

    // Estimated MoCA Place Orientation Score (0 to 6 scale)
    // MoCA standard evaluates orientation to place/city/state.
    // Calibrated from Bayesian latent theta and empirical accuracy.
    const finalTheta = trials.length > 0 ? trials[trials.length - 1].thetaAfterTrial : this.currentTheta;
    this.currentTheta = finalTheta;
    const thetaScaled = 3.0 + (finalTheta / 1.8) * 3.0;
    const accuracyScaled = (accuracyPercentage / 100.0) * 6.0;
    const composite = 0.6 * thetaScaled + 0.4 * accuracyScaled;
    const estimatedMoCAPlaceOrientationScore = Math.max(0, Math.min(6, Number(composite.toFixed(1))));


    // OASIS-2 Trained Edge Cognitive Staging Classifier
    const latencyStdDev = totalTrials > 1
      ? Math.round(Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.deliberationTimeMs - meanDeliberationMs, 2), 0) / totalTrials))
      : 800;
    const hesitationTrials = trials.filter(t => t.deliberationTimeMs > 7000).length;
    const hesitationRatio = totalTrials > 0 ? hesitationTrials / totalTrials : 0;
    const totalTaps = trials.reduce((acc, t) => acc + t.totalTapsCount, 0);
    const tremorIndex = totalTaps + this.tremorTapsFilteredCount > 0
      ? this.tremorTapsFilteredCount / (totalTaps + this.tremorTapsFilteredCount)
      : 0;
    const perseverationErrors = trials.filter((t, idx) => !t.isCorrect && idx > 0 && t.selectedOptionId === trials[idx - 1].selectedOptionId).length;
    const perseverationRate = totalTrials > 0 ? perseverationErrors / totalTrials : 0;

    const oasisClinicalClassification = CognitiveClassifier.classify({
      meanLatencyMs: meanDeliberationMs,
      latencyVarianceMs: latencyStdDev,
      accuracyPct: accuracyPercentage,
      perseverationRate,
      hesitationRatio,
      tremorJitterIndex: tremorIndex,
    });

    return {
      gameId: 'where-am-i',
      totalTrials,
      correctTrials,
      accuracyPercentage,
      meanCluesPerTrial,
      meanDeliberationMs,
      compassHintsUsedTotal,
      autonomyScore,
      patientSettingsAutonomyRating,
      topographicalOrientationStatus,
      semanticRetrievalEfficiency,
      visuomotorProfile,
      finalTheta: this.currentTheta,
      estimatedMoCAPlaceOrientationScore,
      oasisClinicalClassification,
      caregiverEndedEarly,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Simulates authentic OASIS-2 patient action for realistic testing and clinical re-enactment.
   */
  public simulateOasisPatientAction(
    persona: OasisWhereAmIPersona,
    trial: GeneratedTrial,
    tier: WhereAmIDifficulty
  ): {
    selectedOptionId: string;
    isCorrect: boolean;
    cluesRevealedCount: number;
    compassHintUsed: boolean;
    deliberationTimeMs: number;
    hasTremorJitter: boolean;
    tremorJitterCount: number;
    clinicalObservation: Record<SupportedLanguage, string>;
  } {
    // 1. Clues needed simulation based on persona impairment
    const baseClues = persona.expectedCluesNeeded;
    const noiseClues = (Math.random() - 0.5) * 0.8;
    const targetClues = Math.max(
      tier.initialVisibleClues,
      Math.min(4, Math.round(baseClues + noiseClues))
    );

    // 2. Deliberation latency
    const baseDelib = persona.expectedDeliberationMs;
    const latencyNoise = 0.85 + Math.random() * 0.3;
    const deliberationTimeMs = Math.max(1200, Math.round(baseDelib * latencyNoise));

    // 3. Compass hint usage
    const compassHintUsed = Math.random() < persona.compassHintProbability && tier.compassAllowed;

    // 4. Tremor jitter
    const hasTremorJitter = Math.random() < persona.tremorJitterProbability;
    const tremorJitterCount = hasTremorJitter ? Math.floor(Math.random() * 3) + 1 : 0;
    for (let i = 0; i < tremorJitterCount; i++) {
      this.tremorTapsFilteredCount++;
    }

    // 5. Accuracy decision
    let prob = persona.accuracyProbability;
    if (compassHintUsed) prob = Math.min(0.98, prob + 0.15);
    if (targetClues >= 3) prob = Math.min(0.98, prob + 0.10);
    const isCorrect = Math.random() < prob;

    let selectedOptionId = trial.targetLocation.id;
    if (!isCorrect) {
      const wrong = trial.options.filter(o => o.id !== trial.targetLocation.id);
      selectedOptionId = wrong.length > 0 ? wrong[Math.floor(Math.random() * wrong.length)].id : trial.targetLocation.id;
    }

    const clinicalObservation: Record<SupportedLanguage, string> = {
      as: `${persona.name} (${persona.clinicalDiagnosis}) - সংকেত: ${targetClues}, সময়: ${deliberationTimeMs}ms, কম্পাস: ${compassHintUsed ? 'ব্যৱহৃত' : 'নাই'}, ফলাফল: ${isCorrect ? 'সঠিক' : 'ভুল'}।`,
      bn: `${persona.name} (${persona.clinicalDiagnosis}) - সূত্র: ${targetClues}, সময়: ${deliberationTimeMs}ms, কম্পাস: ${compassHintUsed ? 'ব্যবহৃত' : 'না'}, ফলাফল: ${isCorrect ? 'সঠিক' : 'ভুল'}।`,
      hi: `${persona.name} (${persona.clinicalDiagnosis}) - सुराग: ${targetClues}, समय: ${deliberationTimeMs}ms, कम्पास: ${compassHintUsed ? 'प्रयुक्त' : 'नहीं'}, परिणाम: ${isCorrect ? 'सटीक' : 'अशुद्ध'}।`,
      en: `${persona.name} (${persona.clinicalDiagnosis}): ${targetClues} clues used, ${deliberationTimeMs}ms deliberation, compass ${compassHintUsed ? 'used' : 'none'}, response ${isCorrect ? 'Correct' : 'Incorrect'}.`,
    };

    return {
      selectedOptionId,
      isCorrect,
      cluesRevealedCount: targetClues,
      compassHintUsed,
      deliberationTimeMs,
      hasTremorJitter,
      tremorJitterCount,
      clinicalObservation,
    };
  }
}

