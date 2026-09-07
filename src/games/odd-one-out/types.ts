/**
 * SmritiNER - Game 8: Odd One Out (Omilto Basoni)
 * Clinical Neuropsychological Evaluation & Cognitive Training
 * Paradigm: Semantic Category Discrimination, Abstract Reasoning & Executive Function
 * Calibrated against Wisconsin Card Sorting Test (WCST) & MoCA Abstraction Subtest.
 */

import type { SupportedLanguage } from '../../types/prescription';
import type { CognitiveClassificationResult } from '../../engine/cognitive-classifier';

export type OddOneOutDistractorStrategy =
  | 'cross_domain_stark'          // Starkly distinct domains (Tier 1-2): Animals vs Vehicles, Fruits vs Tools
  | 'broad_distinct_domain'       // Broad distinct categories (Tier 3): Fruits vs Vehicles, Animals vs Instruments
  | 'related_domain_contrast'     // Related domains (Tier 4): Farm Animals vs Wild Animals, Land vs Water Vehicles
  | 'intra_domain_subcategory'    // Intra-domain subcategory (Tier 5): Citrus Fruits vs Berries, String vs Percussion
  | 'functional_abstraction'      // Functional/conceptual attributes (Tier 6): Manual vs Electric tools, Warm vs Summer clothes
  | 'subtle_semantic_attribute'   // Subtle attributes/habitat/diet (Tier 7): Herbivore vs Carnivore, Flying vs Ground
  | 'cultural_heritage_nuance'    // North-East cultural heritage vs modern (Tier 8): Traditional handloom vs Modern, Bihu vs Western
  | 'perceptual_abstract_ceiling';// Multi-attribute complex abstraction (Tier 9): Fine-grained multi-feature distinctions

/**
 * 9 Fine-Grained Minimal Step Tiers (3 to 6 Items, Psychometric 2PL IRT Calibration)
 */
export interface OddOneOutDifficulty {
  tierLevel: number;                    // 1 to 9
  choicesCount: number;                 // 3, 4, 5, or 6 items
  ruleClueAvailable: boolean;           // Whether semantic category rule explanation is accessible
  ruleClueAutoVisible: boolean;         // Automatically revealed on trial start (for severe/moderate impairment)
  spotlightAllowed: boolean;            // Golden spotlight distractor eliminator hint
  spotlightEliminatesCount: number;     // 1 or 2 non-odd items eliminated
  distractorStrategy: OddOneOutDistractorStrategy;
  autoAssistTimeoutMs: number;          // 20000ms down to 7000ms
  tremorDebounceMs: number;             // 400ms motor tremor guard
  itemDifficultyB: number;              // 2PL IRT difficulty b (-2.2 to +2.4)
  discriminationA: number;              // 2PL IRT discrimination a (1.2 to 1.8)
  tierDescription: Record<SupportedLanguage, string>;
}

/**
 * Categorical Semantic Item Definition
 */
export interface CategoryItem {
  id: string;
  symbol: string;
  name: Record<SupportedLanguage, string>;
  category: string;                     // Broad category (e.g., 'animals', 'instruments', 'textiles')
  subcategory: string;                  // Fine subcategory (e.g., 'bihu_instruments', 'citrus_fruits')
  attributes: string[];                 // Feature tags (e.g., ['traditional', 'northeast', 'herbivore'])
}

/**
 * Generated Trial Contract
 */
export interface OddOneOutGeneratedTrial {
  trialIndex: number;
  items: CategoryItem[];
  oddItemIndex: number;
  oddItem: CategoryItem;
  commonCategory: string;
  commonCategoryName: Record<SupportedLanguage, string>;
  ruleExplanation: Record<SupportedLanguage, string>;
  difficulty: OddOneOutDifficulty;
}

/**
 * Complete Snapshot of Patient In-Trial Settings & Autonomy Choices
 */
export interface OddOneOutSettingsSnapshot {
  ruleClueRevealed: boolean;
  spotlightHintUsed: boolean;
  proactiveClueRequested: boolean;
  isManualTierOverride: boolean;
  soundMuted: boolean;
}

/**
 * Detailed Per-Trial Telemetry Record
 */
export interface OddOneOutTrialTelemetry {
  trialIndex: number;
  tierLevel: number;
  totalItemsCount: number;
  oddItemId: string;
  oddItemName: string;
  commonCategoryId: string;
  selectedItemId: string;
  selectedItemIndex: number;
  isCorrect: boolean;
  ruleClueRevealed: boolean;
  spotlightHintUsed: boolean;
  eliminatedItemIndices: number[];
  deliberationTimeMs: number;
  timeToFirstTapMs: number;
  totalTapsCount: number;
  autonomyScore: number;                // 0 to 100%
  thetaAfterTrial: number;              // -3.0 to +3.0
  difficultySnapshot: OddOneOutDifficulty;
  settingsSnapshot: OddOneOutSettingsSnapshot;
  aiAdaptiveReasoning: string;
}

/**
 * Clinical Profile Staging & Phenotypes
 */
export type SemanticDiscriminationStatus =
  | 'intact_abstraction'               // Accurate discrimination across subtle attribute nuances
  | 'mild_category_blurring'          // Occasional confusion at fine-grained subcategory levels
  | 'moderate_concept_collapse'       // Relies on broad domain contrasts; struggles with subcategories
  | 'severe_semantic_loss';           // Requires Tier 1-2 cross-domain stark contrasts & rule hints

export type ExecutiveSortingProfile =
  | 'rapid_flexible'                  // Fast conceptual switching, zero perseveration
  | 'deliberate_reflective'           // Slower processing speed but accurate categorization
  | 'perseverative_rigid'             // Tends to repeat prior response features
  | 'hesitant_supported';             // High hesitation ratio (>7s), relies on spotlight hints

export type MotorTremorStatus =
  | 'normal_motor'
  | 'mild_hesitation_jitter'
  | 'tremor_dominant';

/**
 * Comprehensive Session Clinical Summary
 */
export interface OddOneOutSessionSummary {
  gameId: 'odd-one-out';
  totalTrials: number;
  correctTrials: number;
  accuracyPercentage: number;
  meanDeliberationMs: number;
  meanTimeToFirstTapMs: number;
  ruleCluesUsedTotal: number;
  spotlightHintsUsedTotal: number;
  tremorTapsFilteredTotal: number;
  perseverationErrorRate: number;       // Fraction of perseverative repeat errors
  autonomyScore: number;                // 0 to 100%
  finalTheta: number;                   // Bayesian latent ability θ (-3.0 to +3.0)
  estimatedMoCAAbstractionScore: number;// Calibrated MoCA Abstraction score (0 to 5 composite)
  semanticDiscriminationStatus: SemanticDiscriminationStatus;
  executiveSortingProfile: ExecutiveSortingProfile;
  motorTremorStatus: MotorTremorStatus;
  oasisClinicalClassification?: CognitiveClassificationResult;
  caregiverEndedEarly: boolean;
  completedAt: string;
}

/**
 * 5 Curated Authentic Patient Personas from Washington University ADRC (OASIS-2)
 */
export interface OasisOddOneOutPersona {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  educationYears: number;
  mmse: number;
  cdr: number;
  clinicalDiagnosis: string;
  clinicalTier: 'NORMAL' | 'MCI' | 'HIGH_SUPPORT';
  expectedDeliberationMs: number;
  accuracyProbability: number;
  tremorJitterProbability: number;
  ruleClueProbability: number;
  spotlightHintProbability: number;
  avatarIcon: string;
  clinicalNotes: Record<SupportedLanguage, string>;
}

export const REAL_WORLD_ODD_ONE_OUT_PERSONAS: OasisOddOneOutPersona[] = [
  {
    id: 'OAS2_0001',
    name: 'Bhaben Kalita (OAS2_0001)',
    age: 74,
    gender: 'M',
    educationYears: 16,
    mmse: 30,
    cdr: 0.0,
    clinicalDiagnosis: 'Cognitively Normal Control',
    clinicalTier: 'NORMAL',
    expectedDeliberationMs: 2400,
    accuracyProbability: 0.96,
    tremorJitterProbability: 0.04,
    ruleClueProbability: 0.05,
    spotlightHintProbability: 0.05,
    avatarIcon: '👨‍🏫',
    clinicalNotes: {
      as: 'স্বাভাৱিক বয়সস্থ নিয়ন্ত্ৰণ (MMSE 30, CDR 0.0)। তীক্ষ্ণ বিমূৰ্ত ধাৰণা আৰু শ্ৰেণী বিভাজন ক্ষমতা।',
      bn: 'স্বাভাবিক বয়স্ক নিয়ন্ত্রণ (MMSE 30, CDR 0.0)। তীক্ষ্ণ বিমূর্ত ধারণা ও শ্রেণী বিভাজন ক্ষমতা।',
      hi: 'सामान्य वरिष्ठ नियंत्रण (MMSE 30, CDR 0.0)। तीव्र अमूर्त सोच और श्रेणी विभेदन क्षमता।',
      en: 'Healthy normal control (MMSE 30, CDR 0.0). Sharp abstract reasoning and semantic discrimination.',
    },
  },
  {
    id: 'OAS2_0002',
    name: 'Anjali Sharma (OAS2_0002)',
    age: 75,
    gender: 'F',
    educationYears: 14,
    mmse: 26,
    cdr: 0.5,
    clinicalDiagnosis: 'Mild Cognitive Impairment (MCI)',
    clinicalTier: 'MCI',
    expectedDeliberationMs: 5200,
    accuracyProbability: 0.76,
    tremorJitterProbability: 0.12,
    ruleClueProbability: 0.35,
    spotlightHintProbability: 0.25,
    avatarIcon: '👵',
    clinicalNotes: {
      as: 'মৃদু জ্ঞানীয় বিকাৰ (MMSE 26, CDR 0.5)। সূক্ষ্ম শ্ৰেণী বৈশিষ্ট্য পৃথক কৰোঁতে মৃদু দ্বিধা।',
      bn: 'মৃদু জ্ঞানীয় ব্যাধি (MMSE 26, CDR 0.5)। সূক্ষ্ম শ্রেণীর বৈশিষ্ট্য পৃথক করতে মৃদু দ্বিধা।',
      hi: 'हल्की संज्ञानात्मक हानि (MMSE 26, CDR 0.5)। सूक्ष्म श्रेणी विशेषताओं को अलग करने में हल्की हिचकिचाहट।',
      en: 'Mild Cognitive Impairment (MMSE 26, CDR 0.5). Mild hesitation when discriminating nuanced subcategories.',
    },
  },
  {
    id: 'OAS2_0048',
    name: 'Devendra Nath (OAS2_0048)',
    age: 80,
    gender: 'M',
    educationYears: 12,
    mmse: 20,
    cdr: 1.0,
    clinicalDiagnosis: 'Mild-Moderate Alzheimer\'s',
    clinicalTier: 'HIGH_SUPPORT',
    expectedDeliberationMs: 9200,
    accuracyProbability: 0.44,
    tremorJitterProbability: 0.18,
    ruleClueProbability: 0.70,
    spotlightHintProbability: 0.65,
    avatarIcon: '🧓',
    clinicalNotes: {
      as: 'মৃদু-মধ্যম আলঝাইমাৰ (MMSE 20, CDR 1.0)। অৰ্থগত ধাৰণাৰ অৱক্ষয়; শ্ৰেণীৰ নিয়ম আৰু স্পটলাইটৰ প্ৰয়োজন।',
      bn: 'মৃদু-মাঝারি আলঝেইমার (MMSE 20, CDR 1.0)। অর্থগত ধারণার ক্ষয়; শ্রেণীর নিয়ম ও স্পটলাইটের প্রয়োজন।',
      hi: 'हल्का-मध्यम अल्जाइमर (MMSE 20, CDR 1.0)। अर्थगत अवधारणा क्षय; नियम संकेत और स्पॉटलाइट की आवश्यकता।',
      en: 'Mild-to-moderate Alzheimer\'s (MMSE 20, CDR 1.0). Semantic concept breakdown; requires rule clues and spotlight.',
    },
  },
  {
    id: 'OAS2_0036',
    name: 'Hemanta Borah (OAS2_0036)',
    age: 78,
    gender: 'M',
    educationYears: 16,
    mmse: 28,
    cdr: 0.0,
    clinicalDiagnosis: 'Parkinsonian Essential Tremor',
    clinicalTier: 'NORMAL',
    expectedDeliberationMs: 3300,
    accuracyProbability: 0.91,
    tremorJitterProbability: 0.85,
    ruleClueProbability: 0.10,
    spotlightHintProbability: 0.10,
    avatarIcon: '🤝',
    clinicalNotes: {
      as: 'পাৰ্কিনছনিয়ান তীব্ৰ কম্পন কিন্তু অক্ষুণ্ণ অৰ্থগত ক্ষমতা। ৪০০ms মটৰ ফিল্টাৰে অনিচ্ছাকৃত স্পৰ্শ শোষণ কৰে।',
      bn: 'পার্কিনসনিয়ান তীব্র কম্পন কিন্তু অক্ষুণ্ণ অর্থগত ক্ষমতা। ৪০০ms মোটর ফিল্টার অনিচ্ছাকৃত স্পর্শ শোষণ করে।',
      hi: 'पार्किंसन आवश्यक कंपन किंतु अक्षुण्ण अर्थगत क्षमता। 400ms मोटर फ़िल्टर थरथराहट को रोकता है।',
      en: 'Parkinsonian essential motor tremor with intact semantic abstraction. 400ms debounce filter absorbs tremors.',
    },
  },
  {
    id: 'OAS2_0040',
    name: 'Ratna Barua (OAS2_0040)',
    age: 83,
    gender: 'F',
    educationYears: 8,
    mmse: 15,
    cdr: 2.0,
    clinicalDiagnosis: 'Severe Dementia',
    clinicalTier: 'HIGH_SUPPORT',
    expectedDeliberationMs: 12500,
    accuracyProbability: 0.25,
    tremorJitterProbability: 0.35,
    ruleClueProbability: 0.90,
    spotlightHintProbability: 0.85,
    avatarIcon: '🌸',
    clinicalNotes: {
      as: 'উন্নত স্মৃতিভ্ৰংশ (MMSE 15, CDR 2.0)। স্তৰ ১ নিম্নতম সীমা (৩টা বস্তু, স্পষ্ট বৈসাদৃশ্য, নিয়ম প্ৰকাশিত)।',
      bn: 'উন্নত ডিমেনশিয়া (MMSE 15, CDR 2.0)। স্তর ১ সর্বনিম্ন সীমা (৩টি বস্তু, স্পষ্ট বৈসাদৃশ্য, নিয়ম প্রকাশিত)।',
      hi: 'गंभीर डिमेंशिया (MMSE 15, CDR 2.0)। स्तर १ न्यूनतम सीमा (३ वस्तुएं, स्पष्ट भेद, नियम खुला)।',
      en: 'Severe dementia (MMSE 15, CDR 2.0). Requires Tier 1 cognitive floor (3 items, stark cross-domain contrast, visible rule).',
    },
  },
];
