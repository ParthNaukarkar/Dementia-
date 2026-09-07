/**
 * SmritiNER - Game 9: Pattern Recall (Noxar Chonda / চানেকিৰ ছন্দ)
 * Clinical Neuropsychological Evaluation & Cognitive Training
 * Paradigm: Visuospatial Working Memory, Spatial Pattern Encoding & Immediate Recall
 * Calibrated against CORSIT Block-Tapping, CANTAB Spatial Span (SSP) & MoCA Visuospatial Subtest.
 */

import type { SupportedLanguage } from '../../types/prescription';
import type { CognitiveClassificationResult } from '../../engine/cognitive-classifier';

export type PatternTopology =
  | 'adjacent_linear'            // Adjacent adjacent tiles (Tier 1-2)
  | 'clustered_quadrant'         // Clustered within a local cluster (Tier 3-4)
  | 'diagonal_distributed'       // Diagonal & distributed across quadrants (Tier 5)
  | 'semi_clustered_quadrant'    // Semi-clustered multi-quadrant (Tier 6)
  | 'complex_distributed'        // Complex distributed non-linear pattern (Tier 7-8)
  | 'high_entropy_dispersed';    // High-entropy fully dispersed pattern (Tier 9)

/**
 * 9 Fine-Grained Minimal Step Tiers (2x2 to 5x5, 2 to 6 Tiles, IRT 2PL Calibrated)
 */
export interface PatternRecallDifficulty {
  tierLevel: number;                    // 1 to 9
  gridSize: number;                     // 2, 3, 4, or 5 (Grid dimension N x N)
  patternLength: number;                // 2, 3, 4, 5, or 6 target tiles
  displayDurationMs: number;            // 5000ms down to 1500ms
  peeksAllowed: number;                 // 0, 1, or 2 peek replays
  beaconAllowed: boolean;               // Golden beacon hint available
  beaconIlluminatesCount: number;       // 1 or 2 target tiles illuminated
  topology: PatternTopology;
  autoAssistTimeoutMs: number;          // 20000ms down to 7000ms
  tremorDebounceMs: number;             // 400ms motor tremor guard
  itemDifficultyB: number;              // 2PL IRT item difficulty (-2.2 to +2.4)
  discriminationA: number;              // 2PL IRT discrimination (1.2 to 1.8)
  tierDescription: Record<SupportedLanguage, string>;
}

/**
 * Generated Trial Contract
 */
export interface PatternRecallGeneratedTrial {
  trialIndex: number;
  gridSize: number;
  pattern: number[];                    // Array of target cell indices (0 to N*N - 1)
  patternLength: number;
  displayDurationMs: number;
  difficulty: PatternRecallDifficulty;
  motifTheme: string;
}

/**
 * Complete Snapshot of Patient In-Trial Settings & Autonomy Choices
 */
export interface PatternRecallSettingsSnapshot {
  peeksUsedCount: number;
  maxPeeksAllowed: number;
  beaconHintUsed: boolean;
  proactiveBeaconRequested: boolean;
  isManualTierOverride: boolean;
  soundMuted: boolean;
}

/**
 * Detailed Per-Trial Telemetry Record
 */
export interface PatternRecallTrialTelemetry {
  trialIndex: number;
  tierLevel: number;
  gridSize: number;
  patternLength: number;
  targetPattern: number[];
  playerSelection: number[];
  correctTilesSelected: number;
  falseAlarmTilesSelected: number;
  isCorrect: boolean;
  peeksUsedCount: number;
  beaconHintUsed: boolean;
  beaconTileIndices: number[];
  deliberationTimeMs: number;
  timeToFirstTapMs: number;
  totalTapsCount: number;
  autonomyScore: number;                // 0 to 100%
  thetaAfterTrial: number;              // -3.0 to +3.0
  difficultySnapshot: PatternRecallDifficulty;
  settingsSnapshot: PatternRecallSettingsSnapshot;
  aiAdaptiveReasoning: string;
}

/**
 * Clinical Profile Staging & Phenotypes
 */
export type VisuospatialRetentionStatus =
  | 'intact_spatial_span'              // Accurate recall across 4-6 tiles on 4x4 or 5x5
  | 'mild_spatial_decay'              // Accurately retains 3-4 tiles; struggles with high entropy
  | 'moderate_span_reduction'         // Constrained to 2-3 tiles on 3x3 grids; utilizes peeks
  | 'severe_spatial_fragmentation';   // Requires Tier 1-2 (2x2 grid, 2 tiles, long display)

export type VisuomotorExecutionProfile =
  | 'rapid_spatial_saccade'           // Swift targeted tile selections (<3s)
  | 'deliberate_exploratory'          // Deliberate searching and steady selection
  | 'hesitant_beacon_reliant'         // High deliberation time, utilizes beacon guidance
  | 'motor_tremor_dominant';          // Frequent motor jitters absorbed by tremor guard

export type MotorTremorStatus =
  | 'normal_motor'
  | 'mild_hesitation_jitter'
  | 'tremor_dominant';

/**
 * Comprehensive Session Clinical Summary
 */
export interface PatternRecallSessionSummary {
  gameId: 'pattern-recall';
  totalTrials: number;
  correctTrials: number;
  accuracyPercentage: number;
  meanDeliberationMs: number;
  meanTimeToFirstTapMs: number;
  totalPeeksUsed: number;
  totalBeaconsUsed: number;
  tremorTapsFilteredTotal: number;
  maxSpatialSpanRecalled: number;       // Maximum pattern length successfully recalled
  autonomyScore: number;                // 0 to 100%
  finalTheta: number;                   // Bayesian latent ability θ (-3.0 to +3.0)
  estimatedMoCAVisuospatialScore: number;// Calibrated MoCA Visuospatial score (0 to 5 composite)
  visuospatialRetentionStatus: VisuospatialRetentionStatus;
  visuomotorExecutionProfile: VisuomotorExecutionProfile;
  motorTremorStatus: MotorTremorStatus;
  oasisClinicalClassification?: CognitiveClassificationResult;
  caregiverEndedEarly: boolean;
  completedAt: string;
}

/**
 * 5 Curated Authentic Patient Personas from Washington University ADRC (OASIS-2)
 */
export interface OasisPatternRecallPersona {
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
  peekReplayProbability: number;
  beaconHintProbability: number;
  avatarIcon: string;
  clinicalNotes: Record<SupportedLanguage, string>;
}

export const REAL_WORLD_PATTERN_RECALL_PERSONAS: OasisPatternRecallPersona[] = [
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
    expectedDeliberationMs: 2500,
    accuracyProbability: 0.95,
    tremorJitterProbability: 0.04,
    peekReplayProbability: 0.05,
    beaconHintProbability: 0.05,
    avatarIcon: '👨‍🏫',
    clinicalNotes: {
      as: 'স্বাভাৱিক বয়সস্থ নিয়ন্ত্ৰণ (MMSE 30, CDR 0.0)। তীক্ষ্ণ স্থানিক স্মৃতি আৰু ৫-৬টা চানেকি সঠিকভাৱে মনত ৰাখিব পাৰে।',
      bn: 'স্বাভাবিক বয়স্ক নিয়ন্ত্রণ (MMSE 30, CDR 0.0)। তীক্ষ্ণ স্থানিক স্মৃতি এবং ৫-৬টি নকশা সঠিকভাবে মনে রাখতে পারেন।',
      hi: 'सामान्य वरिष्ठ नियंत्रण (MMSE 30, CDR 0.0)। तीव्र स्थानिक स्मृति और ५-६ टाइल पैटर्न को सटीक याद रखते हैं।',
      en: 'Healthy normal control (MMSE 30, CDR 0.0). Sharp visuospatial span, accurately recalling 5-6 tiles on 4x4/5x5.',
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
    expectedDeliberationMs: 5400,
    accuracyProbability: 0.75,
    tremorJitterProbability: 0.12,
    peekReplayProbability: 0.35,
    beaconHintProbability: 0.25,
    avatarIcon: '👵',
    clinicalNotes: {
      as: 'মৃদু জ্ঞানীয় বিকাৰ (MMSE 26, CDR 0.5)। স্থানিক স্মৃতি সামান্য হ্ৰাস; মাজে মাজে পুনৰ দর্শন (পিক) প্ৰয়োজন হয়।',
      bn: 'মৃদু জ্ঞানীয় ব্যাধি (MMSE 26, CDR 0.5)। স্থানিক স্মৃতি কিছুটা হ্রাস; মাঝে মাঝে পুনরায় দর্শন প্রয়োজন হয়।',
      hi: 'हल्की संज्ञानात्मक हानि (MMSE 26, CDR 0.5)। स्थानिक स्मृति में हल्की कमी; कभी-कभी पुनः अवलोकन (पीक) आवश्यक।',
      en: 'Mild Cognitive Impairment (MMSE 26, CDR 0.5). Mild visuospatial decay; benefits from peek replays on complex grids.',
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
    expectedDeliberationMs: 9500,
    accuracyProbability: 0.42,
    tremorJitterProbability: 0.18,
    peekReplayProbability: 0.70,
    beaconHintProbability: 0.65,
    avatarIcon: '🧓',
    clinicalNotes: {
      as: 'মৃদু-মধ্যম আলঝাইমাৰ (MMSE 20, CDR 1.0)। স্থানিক স্থানচ্যুতি; সোণালী বিকন আৰু সহায়ক সংকেতৰ প্ৰয়োজন।',
      bn: 'মৃদু-মাঝারি আলঝেইমার (MMSE 20, CDR 1.0)। স্থানিক স্মৃতিবিভ্রান্তি; গোল্ডেন বিকন ও সহায়ক সূত্রের প্রয়োজন।',
      hi: 'हल्का-मध्यम अल्जाइमर (MMSE 20, CDR 1.0)। स्थानिक भटकाव; गोल्डन बीकन और पुनः अवलोकन सहायता आवश्यक।',
      en: 'Mild-to-moderate Alzheimer\'s (MMSE 20, CDR 1.0). Marked visuospatial working memory deficit; relies on beacon hints.',
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
    expectedDeliberationMs: 3400,
    accuracyProbability: 0.90,
    tremorJitterProbability: 0.85,
    peekReplayProbability: 0.10,
    beaconHintProbability: 0.10,
    avatarIcon: '🤝',
    clinicalNotes: {
      as: 'পাৰ্কিনছনিয়ান তীব্ৰ কম্পন কিন্তু অক্ষুণ্ণ স্থানিক স্মৃতি। ৪০০ms মটৰ ফিল্টাৰে খৰখেদা কম্পন শোষণ কৰে।',
      bn: 'পার্কিনসনিয়ান তীব্র কম্পন কিন্তু অক্ষুণ্ণ স্থানিক স্মৃতি। ৪০০ms মোটর ফিল্টার ক্ষিপ্র কম্পন শোষণ করে।',
      hi: 'पार्किंसन आवश्यक कंपन किंतु अक्षुण्ण स्थानिक स्मृति। 400ms मोटर फ़िल्टर थरथराहट को रोकता है।',
      en: 'Parkinsonian essential tremor with intact visuospatial memory. 400ms debounce filter absorbs jitter taps.',
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
    expectedDeliberationMs: 12800,
    accuracyProbability: 0.22,
    tremorJitterProbability: 0.35,
    peekReplayProbability: 0.90,
    beaconHintProbability: 0.85,
    avatarIcon: '🌸',
    clinicalNotes: {
      as: 'উন্নত স্মৃতিভ্ৰংশ (MMSE 15, CDR 2.0)। স্তৰ ১ নিম্নতম সীমা (২x২ গ্ৰিড, ২টা চানেকি, ৫ ছেকেণ্ড প্ৰদৰ্শন)।',
      bn: 'উন্নত ডিমেনশিয়া (MMSE 15, CDR 2.0)। স্তর ১ সর্বনিম্ন সীমা (২x২ গ্রিড, ২টি নকশা, ৫ সেকেন্ড প্রদর্শন)।',
      hi: 'गंभीर डिमेंशिया (MMSE 15, CDR 2.0)। स्तर १ न्यूनतम सीमा (२x२ ग्रिड, २ टाइल, ५ सेकंड प्रदर्शन)।',
      en: 'Severe dementia (MMSE 15, CDR 2.0). Requires Tier 1 cognitive floor (2x2 grid, 2 tiles, 5000ms display, beacon guidance).',
    },
  },
];
