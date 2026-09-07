import type { SupportedLanguage } from '../../types/prescription';
import type { CognitiveClassificationResult } from '../../engine/cognitive-classifier';

/**
 * Real-World OASIS-2 Patient Profile Schema for authentic clinical gameplay simulation
 */
export interface OasisWhereAmIPersona {
  id: string; // e.g. 'OAS2_0001'
  name: string;
  age: number;
  gender: 'M' | 'F';
  educationYears: number;
  mmse: number;
  cdr: number;
  clinicalDiagnosis: string;
  clinicalTier: 'NORMAL' | 'MCI' | 'HIGH_SUPPORT';
  expectedCluesNeeded: number;          // 1.0 to 4.0
  expectedDeliberationMs: number;
  accuracyProbability: number;
  tremorJitterProbability: number;
  compassHintProbability: number;
  avatarIcon: string;
  clinicalNotes: {
    as: string;
    bn: string;
    hi: string;
    en: string;
  };
}

/**
 * Curated authentic OASIS-2 longitudinal cohort patient archetypes for Topographical Wayfinding
 */
export const REAL_WORLD_WHERE_AM_I_PERSONAS: OasisWhereAmIPersona[] = [
  {
    id: 'OAS2_0001',
    name: 'Bhaben Kalita (OAS2_0001)',
    age: 74,
    gender: 'M',
    educationYears: 16,
    mmse: 30,
    cdr: 0.0,
    clinicalDiagnosis: 'Cognitively Intact / Normal Aging',
    clinicalTier: 'NORMAL',
    expectedCluesNeeded: 1.2,
    expectedDeliberationMs: 2400,
    accuracyProbability: 0.96,
    tremorJitterProbability: 0.02,
    compassHintProbability: 0.05,
    avatarIcon: '👴',
    clinicalNotes: {
      as: 'স্বাভাৱিক প্ৰাপ্তবয়স্ক। প্ৰথম সংকেততে সঠিক স্থান চিনাক্ত কৰিব পাৰে, অক্ষত স্থান সংবেদন আৰু শূন্য কঁপনি।',
      bn: 'স্বাভাবিক প্রাপ্তবয়স্ক। প্রথম সূত্রেই সঠিক স্থান চিহ্নিত করতে পারে, অক্ষত স্থান সংবেদন ও শূন্য কম্পন।',
      hi: 'सामान्य स्वस्थ वृद्ध (74 वर्ष)। प्रथम सुराग से ही सटीक स्थान पहचान, अक्षुण्ण स्थानिक स्मृति, शून्य कंपन।',
      en: 'Healthy aging control (MMSE 30, CDR 0). Intact hippocampal place orientation; identifies landmarks from 1st clue with rapid retrieval.',
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
    clinicalDiagnosis: 'Mild Cognitive Impairment (Amnestic MCI)',
    clinicalTier: 'MCI',
    expectedCluesNeeded: 2.2,
    expectedDeliberationMs: 4800,
    accuracyProbability: 0.76,
    tremorJitterProbability: 0.08,
    compassHintProbability: 0.30,
    avatarIcon: '👵',
    clinicalNotes: {
      as: 'প্ৰাৰম্ভিক পাহৰণি (MCI)। দ্বিতীয় বা তৃতীয় সংকেতৰ সহায়ত স্থান চিনাক্ত কৰে, কেতিয়াবা দিশানিৰ্ণায়ক কম্পাস সহায় লয়।',
      bn: 'প্রাথমিক স্মৃতিভ্রংশ (MCI)। দ্বিতীয় বা তৃতীয় সূত্রের সাহায্যে স্থান চিহ্নিত করে, মাঝে মাঝে কম্পাস সাহায্য নেয়।',
      hi: 'प्रारंभिक विस्मृति (MCI, MMSE 26, CDR 0.5)। दूसरे या तीसरे सुराग से पहचान, कभी-कभी दिशा सूचक कम्पास का सहारा।',
      en: 'Amnestic MCI. Semantic retrieval delays; benefits from 2nd/3rd progressive clue and occasional compass hint.',
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
    clinicalDiagnosis: 'Mild-Moderate Alzheimer\\\'s',
    clinicalTier: 'HIGH_SUPPORT',
    expectedCluesNeeded: 3.3,
    expectedDeliberationMs: 8500,
    accuracyProbability: 0.45,
    tremorJitterProbability: 0.15,
    compassHintProbability: 0.65,
    avatarIcon: '🧓',
    clinicalNotes: {
      as: 'মৃদু-মধ্যম আলঝাইমাৰ ডিমেনচিয়া। স্থান বিভ্ৰম আৰু নাম মনত পেলাবলৈ সংকেত আৰু বিকল্প আঁতৰোৱা কম্পাসৰ প্ৰয়োজন।',
      bn: 'মৃদু-মাঝারি আলঝেইমার ডিমেনশিয়া। স্থান বিভ্রান্তি ও নাম মনে করতে সূত্র ও বিকল্প অপসারণকারী কম্পাসের প্রয়োজন।',
      hi: 'हल्का-मध्यम अल्जाइमर (80 वर्ष, MMSE 20, CDR 1.0)। स्थानिक भटकाव, सभी सुरागों और कम्पास सहायता की आवश्यकता।',
      en: 'Mild-to-moderate Alzheimer\\\'s dementia. Topographical disorientation; relies on 3-4 clues and distractor elimination.',
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
    expectedCluesNeeded: 1.4,
    expectedDeliberationMs: 3200,
    accuracyProbability: 0.92,
    tremorJitterProbability: 0.85,
    compassHintProbability: 0.10,
    avatarIcon: '🤝',
    clinicalNotes: {
      as: 'তীব্ৰ কম্পনজনিত মটৰ বিকাৰ কিন্তু তীক্ষ্ণ স্থান জ্ঞান। ৪০০ms মটৰ ফিল্টাৰে অনিচ্ছাকৃত স্পৰ্শ শোষণ কৰে।',
      bn: 'তীব্র কম্পনজনিত মোটর ব্যাধি কিন্তু তীক্ষ্ণ স্থান জ্ঞান। ৪০০ms মোটর ফিল্টার অনিচ্ছাকৃত স্পর্শ শোষণ করে।',
      hi: 'पार्किंसन आवश्यक कंपन (78 वर्ष, MMSE 28)। सटीक स्थानिक संज्ञान, 400ms मोटर फ़िल्टर थरथराहट को रोकता है।',
      en: 'Parkinsonian resting motor tremor with intact cognitive orientation. 400ms debounce filter prevents false taps.',
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
    expectedCluesNeeded: 3.8,
    expectedDeliberationMs: 12000,
    accuracyProbability: 0.28,
    tremorJitterProbability: 0.35,
    compassHintProbability: 0.85,
    avatarIcon: '🌸',
    clinicalNotes: {
      as: 'উন্নত স্মৃতিভ্ৰংশ (CDR 2.0)। স্তৰ ১ নিম্নতম সীমা (২টা বিকল্প, ৩টা সংকেত প্ৰকাশিত), সৰ্বাধিক সহায় প্ৰয়োজন।',
      bn: 'উন্নত ডিমেনশিয়া (CDR 2.0)। স্তর ১ সর্বনিম্ন সীমা (২টি বিকল্প, ৩টি সূত্র প্রকাশিত), সর্বাধিক সাহায্য প্রয়োজন।',
      hi: 'गंभीर डिमेंशिया (83 वर्ष, MMSE 15, CDR 2.0)। स्तर १ न्यूनतम सीमा (२ विकल्प, ३ सुराग खुले), अधिकतम सहायता की आवश्यकता।',
      en: 'Advanced dementia (MMSE 15, CDR 2.0). Requires Tier 1 cognitive floor (2 choices, 3 open clues) and maximum scaffolding.',
    },
  },
];

/**
 * Semantic and Geographic Distractor Stratification
 */
export type DistractorProximity =
  | 'different_state_distinct'     // Different state & completely distinct category (Tier 1-2)
  | 'different_state'              // Different North-East state (Tier 3-4)
  | 'neighbor_state'               // Neighboring NE state (Tier 5)
  | 'same_state_different_biome'   // Same state but different biome/category (Tier 6-7)
  | 'same_state_same_biome';       // Same state and identical category (Tier 8-9)

/**
 * 9 Fine-Grained Minimal Step Tiers (2 to 5 Choices, Progressive Clues)
 */
export interface WhereAmIDifficulty {
  tierLevel: number;                    // 1 to 9
  choicesCount: number;                 // 2, 3, 4, or 5 options
  initialVisibleClues: number;          // 3 (floor), 2, or 1 (standard)
  clueIntervalSec: number;              // Auto-reveal delay (15s down to 6s)
  compassAllowed: boolean;              // Dignified distractor eliminator hint
  compassEliminatesCount: number;       // 1 or 2 options removed
  distractorStrategy: DistractorProximity;
  autoAssistTimeoutMs: number;          // 25000ms down to 10000ms
  tremorDebounceMs: number;             // 400ms motor filter
  itemDifficultyB: number;              // 2PL IRT item difficulty (-2.2 to +2.4)
  discriminationA: number;              // 2PL IRT discrimination (1.2 to 1.8)
  tierDescription: Record<SupportedLanguage, string>;
}

/**
 * Complete Snapshot of Patient In-Trial Settings & Autonomy Choices
 */
export interface WhereAmISettingsSnapshot {
  compassHintUsed: boolean;
  cluesRevealed: number;
  totalCluesAvailable: number;
  proactiveClueRequested: boolean;
  isManualTierOverride: boolean;
  soundMuted: boolean;
}

/**
 * Detailed Per-Trial Telemetry Record
 */
export interface WhereAmITrialTelemetry {
  trialIndex: number;
  tierLevel: number;
  targetLocationId: string;
  targetLocationName: string;
  targetState: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  
  // Clues & Assistance
  cluesRevealedCount: number;
  compassHintUsed: boolean;
  eliminatedOptionIds: string[];
  
  // Timing & Kinematics
  deliberationTimeMs: number;
  timeToFirstTapMs: number;
  totalTapsCount: number;
  
  // Autonomy & IRT
  autonomyScore: number;                // 0 to 100%
  thetaAfterTrial: number;
  difficultySnapshot: WhereAmIDifficulty;
  settingsSnapshot: WhereAmISettingsSnapshot;
  aiAdaptiveReasoning: Record<SupportedLanguage, string>;
}

/**
 * Topographical orientation status classification (MoCA / CANTAB)
 */
export type TopographicalOrientationStatus = 'intact_wayfinding' | 'mild_topographical_disorientation' | 'marked_disorientation';

/**
 * Semantic retrieval efficiency based on clues needed
 */
export type SemanticRetrievalEfficiency = 'rapid_direct' | 'clue_dependent_retrieval' | 'profound_retrieval_deficit';

/**
 * Visuomotor deliberation profile
 */
export type VisuomotorDeliberationProfile = 'rapid_attentive' | 'deliberate_systematic' | 'hesitant_search' | 'tremor_dominant';

/**
 * Complete Clinical Session Summary Payload
 */
export interface WhereAmISessionSummary {
  gameId: 'where-am-i';
  totalTrials: number;
  correctTrials: number;
  accuracyPercentage: number;
  
  // Clinical Metrics
  meanCluesPerTrial: number;
  meanDeliberationMs: number;
  compassHintsUsedTotal: number;
  autonomyScore: number;                // 0 to 100%
  patientSettingsAutonomyRating: 'autonomous_mastery' | 'moderate_scaffolding' | 'high_scaffolding_reliance';
  
  topographicalOrientationStatus: TopographicalOrientationStatus;
  semanticRetrievalEfficiency: SemanticRetrievalEfficiency;
  visuomotorProfile: VisuomotorDeliberationProfile;
  
  // IRT & Standard Equivalence
  finalTheta: number;
  estimatedMoCAPlaceOrientationScore: number; // 0 to 6 points (MoCA Place Orientation calibration)
  oasisClinicalClassification?: CognitiveClassificationResult;
  caregiverEndedEarly: boolean;
  completedAt: string;
}
