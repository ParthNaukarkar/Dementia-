/**
 * SmritiNER - Game 8: Odd One Out (Omilto Basoni)
 * 9-Tier Bayesian 2PL Item Response Theory (IRT) Cognitive Engine
 * Multi-Lingual Cultural Semantic Taxonomy, 400ms Tremor Filter & Edge ML Staging.
 */

import type { SupportedLanguage } from '../../types/prescription';
import type {
  OddOneOutDifficulty,
  CategoryItem,
  OddOneOutGeneratedTrial,
  OddOneOutSettingsSnapshot,
  OddOneOutTrialTelemetry,
  OddOneOutSessionSummary,
  OasisOddOneOutPersona,
  SemanticDiscriminationStatus,
  ExecutiveSortingProfile,
  MotorTremorStatus,
} from './types';
import { CATEGORIES_METADATA, CATEGORY_ITEMS } from './data';
import { CognitiveClassifier } from '../../engine/cognitive-classifier';

/**
 * 9 Psychometrically Calibrated Minimal-Step Tiers (2PL IRT)
 */
export const ODD_ONE_OUT_TIERS: OddOneOutDifficulty[] = [
  // Tier 1: Floor - Severe Dementia (CDR 2.0, MMSE <= 15)
  {
    tierLevel: 1,
    choicesCount: 3,
    ruleClueAvailable: true,
    ruleClueAutoVisible: true,
    spotlightAllowed: true,
    spotlightEliminatesCount: 1,
    distractorStrategy: 'cross_domain_stark',
    autoAssistTimeoutMs: 20000,
    tremorDebounceMs: 400,
    itemDifficultyB: -2.2,
    discriminationA: 1.2,
    tierDescription: {
      as: 'স্তৰ ১: নিম্নতম সীমা (৩টা বস্তু, স্পষ্ট বৈসাদৃশ্য, দৃশ্যমান নিয়ম)',
      bn: 'স্তর ১: সর্বনিম্ন সীমা (৩টি বস্তু, স্পষ্ট বৈসাদৃশ্য, দৃশ্যমান নিয়ম)',
      hi: 'स्तर १: न्यूनतम सीमा (३ वस्तुएं, स्पष्ट भेद, खुला नियम)',
      en: 'Tier 1: Cognitive Floor (3 items, stark cross-domain, visible rule)',
    },
  },
  // Tier 2: Moderate Impairment (CDR 1.0, MMSE 16-19)
  {
    tierLevel: 2,
    choicesCount: 3,
    ruleClueAvailable: true,
    ruleClueAutoVisible: true,
    spotlightAllowed: true,
    spotlightEliminatesCount: 1,
    distractorStrategy: 'cross_domain_stark',
    autoAssistTimeoutMs: 18000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.7,
    discriminationA: 1.3,
    tierDescription: {
      as: 'স্তৰ ২: স্পষ্ট শ্ৰেণীভেদ (৩টা বস্তু, দৃশ্যমান নিয়ম)',
      bn: 'স্তর ২: স্পষ্ট শ্রেণীভেদ (৩টি বস্তু, দৃশ্যমান নিয়ম)',
      hi: 'स्तर २: स्पष्ट श्रेणी भेद (३ वस्तुएं, दृश्य नियम)',
      en: 'Tier 2: Distinct Domains (3 items, auto-rule clue)',
    },
  },
  // Tier 3: Mild-to-Moderate Dementia (CDR 1.0, MMSE 20-22)
  {
    tierLevel: 3,
    choicesCount: 4,
    ruleClueAvailable: true,
    ruleClueAutoVisible: false,
    spotlightAllowed: true,
    spotlightEliminatesCount: 1,
    distractorStrategy: 'broad_distinct_domain',
    autoAssistTimeoutMs: 16000,
    tremorDebounceMs: 400,
    itemDifficultyB: -1.1,
    discriminationA: 1.4,
    tierDescription: {
      as: 'স্তৰ ৩: বহল শ্ৰেণীভেদ (৪টা বস্তু, অনুৰোধত নিয়ম)',
      bn: 'স্তর ৩: বৃহত্তর শ্রেণীভেদ (৪টি বস্তু, অনুরোধে নিয়ম)',
      hi: 'स्तर ३: व्यापक श्रेणी भेद (४ वस्तुएं, अनुरोध पर नियम)',
      en: 'Tier 3: Broad Domains (4 items, rule on request)',
    },
  },
  // Tier 4: Mild Impairment (CDR 0.5, MMSE 23-25)
  {
    tierLevel: 4,
    choicesCount: 4,
    ruleClueAvailable: true,
    ruleClueAutoVisible: false,
    spotlightAllowed: true,
    spotlightEliminatesCount: 1,
    distractorStrategy: 'related_domain_contrast',
    autoAssistTimeoutMs: 14000,
    tremorDebounceMs: 400,
    itemDifficultyB: -0.5,
    discriminationA: 1.4,
    tierDescription: {
      as: 'স্তৰ ৪: ওচৰা-ওচৰি শ্ৰেণীভেদ (৪টা বস্তু, পোহনীয়া বনাম বন্য)',
      bn: 'স্তর ৪: কাছাকাছি শ্রেণীভেদ (৪টি বস্তু, গৃহপালিত বনাম বন্য)',
      hi: 'स्तर ४: निकट श्रेणी भेद (४ वस्तुएं, पालतू बनाम जंगली)',
      en: 'Tier 4: Related Domains (4 items, domestic vs wild)',
    },
  },
  // Tier 5: Baseline - Mild Cognitive Impairment (CDR 0.5, MMSE 26)
  {
    tierLevel: 5,
    choicesCount: 4,
    ruleClueAvailable: true,
    ruleClueAutoVisible: false,
    spotlightAllowed: true,
    spotlightEliminatesCount: 2,
    distractorStrategy: 'intra_domain_subcategory',
    autoAssistTimeoutMs: 12000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.0,
    discriminationA: 1.5,
    tierDescription: {
      as: 'স্তৰ ৫: একে শ্ৰেণীৰ ভিতৰত উপ-শ্ৰেণীভেদ (৪টা বস্তু, ২টা বিকল্প আঁতৰোৱা)',
      bn: 'স্তর ৫: উপ-শ্রেণীভেদ (৪টি বস্তু, ২টি বিকল্প অপসারণ)',
      hi: 'स्तर ५: उप-श्रेणी भेद (४ वस्तुएं, २ विकल्प हटाना)',
      en: 'Tier 5: Subcategory Baseline (4 items, 2 eliminated by spotlight)',
    },
  },
  // Tier 6: Early MCI / Borderline (MMSE 27)
  {
    tierLevel: 6,
    choicesCount: 5,
    ruleClueAvailable: true,
    ruleClueAutoVisible: false,
    spotlightAllowed: true,
    spotlightEliminatesCount: 1,
    distractorStrategy: 'functional_abstraction',
    autoAssistTimeoutMs: 10000,
    tremorDebounceMs: 400,
    itemDifficultyB: 0.6,
    discriminationA: 1.6,
    tierDescription: {
      as: 'স্তৰ ৬: কাৰ্য্যকৰী ধাৰণা (৫টা বস্তু, হস্তনিৰ্মিত বনাম যান্ত্ৰিক)',
      bn: 'স্তর ৬: কার্যকরী ধারণা (৫টি বস্তু, হস্তনির্মিত বনাম যান্ত্রিক)',
      hi: 'स्तर ६: कार्यात्मक अमूर्तता (५ वस्तुएं, हस्तनिर्मित बनाम यांत्रिक)',
      en: 'Tier 6: Functional Abstraction (5 items, manual vs machine)',
    },
  },
  // Tier 7: Intact Adult Baseline (MMSE 28-29)
  {
    tierLevel: 7,
    choicesCount: 5,
    ruleClueAvailable: true,
    ruleClueAutoVisible: false,
    spotlightAllowed: true,
    spotlightEliminatesCount: 1,
    distractorStrategy: 'subtle_semantic_attribute',
    autoAssistTimeoutMs: 9000,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.2,
    discriminationA: 1.7,
    tierDescription: {
      as: 'স্তৰ ৭: সূক্ষ্ম বৈশিষ্ট্য বিভাজন (৫টা বস্তু, খাদ্য/বাসস্থান অনুসৰি)',
      bn: 'স্তর ৭: সূক্ষ্ম বৈশিষ্ট্য বিভাজন (৫টি বস্তু, খাদ্য/বাসস্থান অনুযায়ী)',
      hi: 'स्तर ७: सूक्ष्म विशेषता विभेदन (५ वस्तुएं, आहार/आवास आधार)',
      en: 'Tier 7: Nuanced Attribute (5 items, diet/habitat attributes)',
    },
  },
  // Tier 8: High Cognitive Reserve (MMSE 30)
  {
    tierLevel: 8,
    choicesCount: 6,
    ruleClueAvailable: true,
    ruleClueAutoVisible: false,
    spotlightAllowed: true,
    spotlightEliminatesCount: 1,
    distractorStrategy: 'cultural_heritage_nuance',
    autoAssistTimeoutMs: 8000,
    tremorDebounceMs: 400,
    itemDifficultyB: 1.8,
    discriminationA: 1.8,
    tierDescription: {
      as: 'স্তৰ ৮: উত্তৰ-পূবৰ লোকশিল্প আৰু ঐতিহ্য (৬টা বস্তু)',
      bn: 'স্তর ৮: উত্তর-পূর্বের লোকশিল্প ও ঐতিহ্য (৬টি বস্তু)',
      hi: 'स्तर ८: पूर्वोत्तर लोकसंस्कृति एवं विरासत (६ वस्तुएं)',
      en: 'Tier 8: Cultural Heritage Nuance (6 items, traditional vs modern)',
    },
  },
  // Tier 9: Ceiling - Autonomous Mastery (MMSE 30)
  {
    tierLevel: 9,
    choicesCount: 6,
    ruleClueAvailable: true,
    ruleClueAutoVisible: false,
    spotlightAllowed: true,
    spotlightEliminatesCount: 1,
    distractorStrategy: 'perceptual_abstract_ceiling',
    autoAssistTimeoutMs: 7000,
    tremorDebounceMs: 400,
    itemDifficultyB: 2.4,
    discriminationA: 1.8,
    tierDescription: {
      as: 'স্তৰ ৯: সৰ্বোচ্চ বিমূৰ্ত দক্ষতা (৬টা বস্তু, স্পটলাইট বিহীন)',
      bn: 'স্তর ৯: সর্বোচ্চ বিমূর্ত দক্ষতা (৬টি বস্তু, স্পটলাইট মুক্ত)',
      hi: 'स्तर ९: सर्वोच्च अमूर्त दक्षता (६ वस्तुएं, बिना स्पॉटलाइट)',
      en: 'Tier 9: Autonomous Mastery Ceiling (6 items, no spotlight)',
    },
  },
];

export class OddOneOutEngine {
  private currentTheta: number = 0.0;
  private currentDifficulty: OddOneOutDifficulty;
  private lastTapTimestamp: number = 0;
  private tremorTapsFilteredCount: number = 0;

  constructor(initialTheta: number = 0.0) {
    this.currentTheta = Math.max(-3.0, Math.min(3.0, initialTheta));
    this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
  }

  public getTheta(): number {
    return this.currentTheta;
  }

  public getDifficulty(): OddOneOutDifficulty {
    return { ...this.currentDifficulty };
  }

  public setDifficulty(diff: OddOneOutDifficulty): void {
    this.currentDifficulty = { ...diff };
  }

  public getTremorFilteredCount(): number {
    return this.tremorTapsFilteredCount;
  }

  /**
   * Minimal-step tier derivation using Item Response Theory bounds
   */
  public deriveDifficultyFromTheta(theta: number): OddOneOutDifficulty {
    if (theta <= -1.8) return ODD_ONE_OUT_TIERS[0]; // Tier 1 (Floor: 3 items, stark cross-domain, auto-rule)
    if (theta <= -1.3) return ODD_ONE_OUT_TIERS[1]; // Tier 2 (3 items, stark cross-domain, auto-rule)
    if (theta <= -0.7) return ODD_ONE_OUT_TIERS[2]; // Tier 3 (4 items, broad domain)
    if (theta <= -0.1) return ODD_ONE_OUT_TIERS[3]; // Tier 4 (4 items, related domain)
    if (theta <= 0.5)  return ODD_ONE_OUT_TIERS[4]; // Tier 5 (4 items, subcategory baseline)
    if (theta <= 1.1)  return ODD_ONE_OUT_TIERS[5]; // Tier 6 (5 items, functional abstraction)
    if (theta <= 1.7)  return ODD_ONE_OUT_TIERS[6]; // Tier 7 (5 items, subtle attribute)
    if (theta <= 2.2)  return ODD_ONE_OUT_TIERS[7]; // Tier 8 (6 items, cultural nuance)
    return ODD_ONE_OUT_TIERS[8];                    // Tier 9 (6 items, ceiling mastery)
  }

  public getDifficultyForTierLevel(tierLevel: number): OddOneOutDifficulty {
    const found = ODD_ONE_OUT_TIERS.find(t => t.tierLevel === tierLevel);
    return found ? { ...found } : ODD_ONE_OUT_TIERS[4];
  }

  /**
   * 400ms Parkinsonian Motor Tremor Guard with monotonic clock shield
   */
  public filterTremorTap(now: number = Date.now()): boolean {
    if (now < this.lastTapTimestamp) {
      this.lastTapTimestamp = now;
      return true;
    }
    if (now - this.lastTapTimestamp < this.currentDifficulty.tremorDebounceMs) {
      this.tremorTapsFilteredCount++;
      return false; // Suppress involuntary micro-jitter
    }
    this.lastTapTimestamp = now;
    return true;
  }

  /**
   * Generates a psychometrically calibrated trial based on the active tier.
   */
  public generateTrial(
    difficulty: OddOneOutDifficulty,
    trialIndex: number = 1,
    excludeOddItemIds: string[] = []
  ): OddOneOutGeneratedTrial {
    const choicesCount = difficulty.choicesCount;
    const strategy = difficulty.distractorStrategy;

    let commonSubcategory = 'bihu_instruments';
    let oddSubcategory = 'modern_instruments';

    switch (strategy) {
      case 'cross_domain_stark': {
        // Animals vs Vehicles, or Fruits vs Tools
        const pairs = [
          { c: 'farm_animals', o: 'land_vehicles' },
          { c: 'sweet_fruits', o: 'industrial_tools' },
          { c: 'rainy_weather', o: 'farm_animals' },
          { c: 'ne_produce', o: 'water_air_vehicles' },
        ];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        commonSubcategory = p.c;
        oddSubcategory = p.o;
        break;
      }
      case 'broad_distinct_domain': {
        const pairs = [
          { c: 'land_vehicles', o: 'sweet_fruits' },
          { c: 'industrial_tools', o: 'ne_wildlife' },
          { c: 'modern_clothing', o: 'modern_instruments' },
          { c: 'sweet_fruits', o: 'rainy_weather' },
        ];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        commonSubcategory = p.c;
        oddSubcategory = p.o;
        break;
      }
      case 'related_domain_contrast': {
        const pairs = [
          { c: 'farm_animals', o: 'wild_predators' },
          { c: 'land_vehicles', o: 'water_air_vehicles' },
          { c: 'rainy_weather', o: 'sunny_weather' },
        ];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        commonSubcategory = p.c;
        oddSubcategory = p.o;
        break;
      }
      case 'intra_domain_subcategory': {
        const pairs = [
          { c: 'ne_produce', o: 'sweet_fruits' },
          { c: 'bihu_instruments', o: 'modern_instruments' },
          { c: 'ne_textiles', o: 'modern_clothing' },
        ];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        commonSubcategory = p.c;
        oddSubcategory = p.o;
        break;
      }
      case 'functional_abstraction': {
        const pairs = [
          { c: 'ne_crafts', o: 'industrial_tools' },
          { c: 'bihu_instruments', o: 'industrial_tools' },
          { c: 'ne_textiles', o: 'modern_clothing' },
        ];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        commonSubcategory = p.c;
        oddSubcategory = p.o;
        break;
      }
      case 'subtle_semantic_attribute': {
        // e.g. Wild herbivore vs predators
        const pairs = [
          { c: 'ne_wildlife', o: 'wild_predators' },
          { c: 'farm_animals', o: 'wild_predators' },
        ];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        commonSubcategory = p.c;
        oddSubcategory = p.o;
        break;
      }
      case 'cultural_heritage_nuance': {
        const pairs = [
          { c: 'bihu_instruments', o: 'modern_instruments' },
          { c: 'ne_textiles', o: 'modern_clothing' },
          { c: 'ne_crafts', o: 'industrial_tools' },
        ];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        commonSubcategory = p.c;
        oddSubcategory = p.o;
        break;
      }
      case 'perceptual_abstract_ceiling': {
        const pairs = [
          { c: 'bihu_instruments', o: 'modern_instruments' },
          { c: 'ne_wildlife', o: 'farm_animals' },
          { c: 'ne_textiles', o: 'modern_clothing' },
          { c: 'ne_produce', o: 'sweet_fruits' },
        ];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        commonSubcategory = p.c;
        oddSubcategory = p.o;
        break;
      }
      default:
        commonSubcategory = 'farm_animals';
        oddSubcategory = 'land_vehicles';
        break;
    }

    // 1. Pick common items
    const commonCandidates = CATEGORY_ITEMS.filter(i => i.subcategory === commonSubcategory);
    const numCommonNeeded = choicesCount - 1;
    const shuffledCommon = [...commonCandidates].sort(() => Math.random() - 0.5);
    let selectedCommon = shuffledCommon.slice(0, numCommonNeeded);

    // Bulletproof invariant: guarantee exactly numCommonNeeded items even if pool is small
    while (selectedCommon.length < numCommonNeeded) {
      const fallback = CATEGORY_ITEMS.filter(i => i.category === commonCandidates[0]?.category && !selectedCommon.some(s => s.id === i.id));
      if (fallback.length > 0) {
        selectedCommon.push(fallback[Math.floor(Math.random() * fallback.length)]);
      } else if (commonCandidates.length > 0) {
        selectedCommon.push(commonCandidates[selectedCommon.length % commonCandidates.length]);
      } else {
        selectedCommon.push(CATEGORY_ITEMS[0]);
      }
    }

    // 2. Pick 1 odd item
    const oddCandidates = CATEGORY_ITEMS.filter(i => i.subcategory === oddSubcategory && !excludeOddItemIds.includes(i.id));
    const availableOdd = oddCandidates.length > 0 ? oddCandidates : CATEGORY_ITEMS.filter(i => i.subcategory === oddSubcategory);
    const selectedOdd = availableOdd[Math.floor(Math.random() * availableOdd.length)];

    // 3. Assemble items and place odd item at random index
    const oddItemIndex = Math.floor(Math.random() * choicesCount);
    const items: CategoryItem[] = [];
    let commonPointer = 0;
    for (let i = 0; i < choicesCount; i++) {
      if (i === oddItemIndex) {
        items.push(selectedOdd);
      } else {
        items.push(selectedCommon[commonPointer++]);
      }
    }

    // 4. Multi-lingual rule explanations
    const meta = CATEGORIES_METADATA[commonSubcategory] || {
      name: {
        as: 'একে ধৰণৰ বস্তু',
        bn: 'একই ধরনের বস্তু',
        hi: 'एक ही प्रकार की वस्तुएं',
        en: 'Matching Category Items',
      },
    };

    const ruleExplanation: Record<SupportedLanguage, string> = {
      as: `এই সকলোবোৰ "${meta.name.as}", কিন্তু "${selectedOdd.name.as}" পৃথক।`,
      bn: `এই সবগুলো "${meta.name.bn}", কিন্তু "${selectedOdd.name.bn}" ভিন্ন।`,
      hi: `ये सभी "${meta.name.hi}" हैं, लेकिन "${selectedOdd.name.hi}" अलग है।`,
      en: `All of these are "${meta.name.en}", but "${selectedOdd.name.en}" is the odd one.`,
    };

    return {
      trialIndex,
      items,
      oddItemIndex,
      oddItem: selectedOdd,
      commonCategory: commonSubcategory,
      commonCategoryName: meta.name,
      ruleExplanation,
      difficulty,
    };
  }

  /**
   * Golden Spotlight Distractor Elimination:
   * Returns indices of common items to eliminate, ensuring the odd item is NEVER eliminated.
   */
  public getSpotlightEliminations(trial: OddOneOutGeneratedTrial, countToEliminate: number): number[] {
    const commonIndices: number[] = [];
    trial.items.forEach((_item, idx) => {
      if (idx !== trial.oddItemIndex) {
        commonIndices.push(idx);
      }
    });

    const shuffled = [...commonIndices].sort(() => Math.random() - 0.5);
    const toEliminate = Math.min(countToEliminate, Math.max(1, commonIndices.length - 1));
    return shuffled.slice(0, toEliminate);
  }

  /**
   * Bayesian 2PL Item Response Theory (IRT) Latent Ability Update:
   * Incorporates reaction time, rule clue usage, and spotlight distractor elimination.
   */
  public updateTheta(
    isCorrect: boolean,
    deliberationMs: number,
    settings: OddOneOutSettingsSnapshot
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
    let creditU = isCorrect ? 1.0 : 0.0;
    if (isCorrect) {
      if (settings.ruleClueRevealed) creditU -= 0.18;
      if (settings.spotlightHintUsed) creditU -= 0.25;
      if (deliberationMs > 10000) creditU -= 0.10;
      creditU = Math.max(0.40, creditU); // Patient maintains dignified credit for solve
    }

    // 3. Information & Fisher Update
    const weight = 0.55;
    let delta = weight * (creditU - pSuccess);

    // Guaranteed progression for correct solve
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
    if (settings.ruleClueRevealed) autonomy -= 14;
    if (settings.spotlightHintUsed) autonomy -= 18;
    if (deliberationMs > 9000) autonomy -= 10;
    if (this.tremorTapsFilteredCount > 3) autonomy -= 4;
    const autonomyScore = Math.max(10, Math.min(100, autonomy));

    const reasoning = isCorrect
      ? `Correct isolation (deliberation: ${deliberationMs}ms, ruleClue: ${settings.ruleClueRevealed}, spotlight: ${settings.spotlightHintUsed}) -> θ adjusted by +${delta.toFixed(3)}.`
      : `Categorization error on Tier ${diff.tierLevel} -> θ adjusted by ${delta.toFixed(3)}.`;

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
    trials: OddOneOutTrialTelemetry[],
    caregiverEndedEarly: boolean = false
  ): OddOneOutSessionSummary {
    const totalTrials = trials.length;
    const correctTrials = trials.filter(t => t.isCorrect).length;
    const accuracyPercentage = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

    const meanDeliberationMs = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.deliberationTimeMs, 0) / totalTrials)
      : 0;

    const meanTimeToFirstTapMs = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.timeToFirstTapMs, 0) / totalTrials)
      : meanDeliberationMs;

    const ruleCluesUsedTotal = trials.filter(t => t.ruleClueRevealed).length;
    const spotlightHintsUsedTotal = trials.filter(t => t.spotlightHintUsed).length;
    const autonomyScore = totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + t.autonomyScore, 0) / totalTrials)
      : 100;

    // Perseveration errors (repeating same erroneous item across consecutive trials)
    let perseverationErrors = 0;
    for (let i = 1; i < trials.length; i++) {
      if (!trials[i].isCorrect && !trials[i - 1].isCorrect && trials[i].selectedItemId === trials[i - 1].selectedItemId) {
        perseverationErrors++;
      }
    }
    const perseverationErrorRate = totalTrials > 1 ? Number((perseverationErrors / (totalTrials - 1)).toFixed(2)) : 0;

    // Semantic Discrimination Profile
    let semanticDiscriminationStatus: SemanticDiscriminationStatus = 'intact_abstraction';
    if (this.currentTheta < -1.5) {
      semanticDiscriminationStatus = 'severe_semantic_loss';
    } else if (this.currentTheta < -0.6) {
      semanticDiscriminationStatus = 'moderate_concept_collapse';
    } else if (this.currentTheta < 0.5) {
      semanticDiscriminationStatus = 'mild_category_blurring';
    }

    // Executive Sorting Profile
    let executiveSortingProfile: ExecutiveSortingProfile = 'rapid_flexible';
    if (perseverationErrorRate > 0.25) {
      executiveSortingProfile = 'perseverative_rigid';
    } else if (spotlightHintsUsedTotal >= 2 || meanDeliberationMs > 8500) {
      executiveSortingProfile = 'hesitant_supported';
    } else if (meanDeliberationMs > 4500) {
      executiveSortingProfile = 'deliberate_reflective';
    }

    // Motor Tremor Profile
    let motorTremorStatus: MotorTremorStatus = 'normal_motor';
    if (this.tremorTapsFilteredCount >= 5) {
      motorTremorStatus = 'tremor_dominant';
    } else if (this.tremorTapsFilteredCount >= 2) {
      motorTremorStatus = 'mild_hesitation_jitter';
    }

    // Estimated MoCA Abstraction Score (0 to 5 composite scale)
    // MoCA abstraction subtest tests concept formation.
    // Calibrated from Bayesian latent ability θ and empirical accuracy.
    const finalTheta = trials.length > 0 ? trials[trials.length - 1].thetaAfterTrial : this.currentTheta;
    this.currentTheta = finalTheta;
    const thetaScaled = 2.5 + (finalTheta / 2.0) * 2.5;
    const accuracyScaled = (accuracyPercentage / 100.0) * 5.0;
    const compositeMoCA = 0.6 * thetaScaled + 0.4 * accuracyScaled;
    const estimatedMoCAAbstractionScore = Math.max(0, Math.min(5, Number(compositeMoCA.toFixed(1))));

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
      perseverationRate: perseverationErrorRate,
      hesitationRatio,
      tremorJitterIndex: tremorIndex,
    });

    return {
      gameId: 'odd-one-out',
      totalTrials,
      correctTrials,
      accuracyPercentage,
      meanDeliberationMs,
      meanTimeToFirstTapMs,
      ruleCluesUsedTotal,
      spotlightHintsUsedTotal,
      tremorTapsFilteredTotal: this.tremorTapsFilteredCount,
      perseverationErrorRate,
      autonomyScore,
      finalTheta: this.currentTheta,
      estimatedMoCAAbstractionScore,
      semanticDiscriminationStatus,
      executiveSortingProfile,
      motorTremorStatus,
      oasisClinicalClassification,
      caregiverEndedEarly,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Simulates authentic OASIS-2 patient action for realistic testing and clinical re-enactment.
   */
  public simulateOasisPatientAction(
    persona: OasisOddOneOutPersona,
    trial: OddOneOutGeneratedTrial,
    tier: OddOneOutDifficulty
  ): {
    selectedItemIndex: number;
    selectedItemId: string;
    isCorrect: boolean;
    ruleClueRevealed: boolean;
    spotlightHintUsed: boolean;
    eliminatedIndices: number[];
    deliberationTimeMs: number;
    hasTremorJitter: boolean;
    tremorJitterCount: number;
    clinicalObservation: Record<SupportedLanguage, string>;
  } {
    // 1. Clue & Spotlight usage
    const ruleClueRevealed = tier.ruleClueAutoVisible || Math.random() < persona.ruleClueProbability;
    const spotlightHintUsed = tier.spotlightAllowed && Math.random() < persona.spotlightHintProbability;
    const eliminatedIndices = spotlightHintUsed
      ? this.getSpotlightEliminations(trial, tier.spotlightEliminatesCount)
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

    // 4. Accuracy
    let prob = persona.accuracyProbability;
    if (ruleClueRevealed) prob = Math.min(0.98, prob + 0.12);
    if (spotlightHintUsed) prob = Math.min(0.98, prob + 0.18);
    if (tier.tierLevel >= 7) prob = Math.max(0.15, prob - 0.12);

    const isCorrect = Math.random() < prob;
    let selectedItemIndex = trial.oddItemIndex;
    let selectedItemId = trial.oddItem.id;

    if (!isCorrect) {
      // Pick an incorrect distractor that was not eliminated
      const validDistractorIndices: number[] = [];
      trial.items.forEach((_item, idx) => {
        if (idx !== trial.oddItemIndex && !eliminatedIndices.includes(idx)) {
          validDistractorIndices.push(idx);
        }
      });

      if (validDistractorIndices.length > 0) {
        selectedItemIndex = validDistractorIndices[Math.floor(Math.random() * validDistractorIndices.length)];
      } else {
        selectedItemIndex = (trial.oddItemIndex + 1) % trial.items.length;
      }
      selectedItemId = trial.items[selectedItemIndex].id;
    }

    const clinicalObservation: Record<SupportedLanguage, string> = {
      as: `${persona.name} (${persona.clinicalDiagnosis}) - নিয়ম: ${ruleClueRevealed ? 'ব্যৱহৃত' : 'নাই'}, স্পটলাইট: ${spotlightHintUsed ? 'ব্যৱহৃত' : 'নাই'}, সময়: ${deliberationTimeMs}ms, ফলাফল: ${isCorrect ? 'সঠিক' : 'ভুল'}।`,
      bn: `${persona.name} (${persona.clinicalDiagnosis}) - নিয়ম: ${ruleClueRevealed ? 'ব্যবহৃত' : 'না'}, স্পটলাইট: ${spotlightHintUsed ? 'ব্যবহৃত' : 'না'}, সময়: ${deliberationTimeMs}ms, ফলাফল: ${isCorrect ? 'সঠিক' : 'ভুল'}।`,
      hi: `${persona.name} (${persona.clinicalDiagnosis}) - नियम: ${ruleClueRevealed ? 'प्रयुक्त' : 'नहीं'}, स्पॉटलाइट: ${spotlightHintUsed ? 'प्रयुक्त' : 'नहीं'}, समय: ${deliberationTimeMs}ms, परिणाम: ${isCorrect ? 'सटीक' : 'अशुद्ध'}।`,
      en: `${persona.name} (${persona.clinicalDiagnosis}): rule clue ${ruleClueRevealed ? 'revealed' : 'none'}, spotlight ${spotlightHintUsed ? 'used' : 'none'}, deliberation ${deliberationTimeMs}ms, response ${isCorrect ? 'Correct' : 'Incorrect'}.`,
    };

    return {
      selectedItemIndex,
      selectedItemId,
      isCorrect,
      ruleClueRevealed,
      spotlightHintUsed,
      eliminatedIndices,
      deliberationTimeMs,
      hasTremorJitter,
      tremorJitterCount,
      clinicalObservation,
    };
  }
}
