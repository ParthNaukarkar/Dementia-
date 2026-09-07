import type { SupportedLanguage } from '../../types/prescription';
import type { CognitiveClassificationResult } from '../../engine/cognitive-classifier';

/**
 * Real-World OASIS-2 Patient Profile Schema for authentic clinical gameplay simulation
 */
export interface OasisPatientPersona {
  id: string; // e.g. 'OAS2_0001'
  name: string;
  age: number;
  gender: 'M' | 'F';
  educationYears: number;
  mmse: number;
  cdr: number;
  clinicalDiagnosis: 'Cognitively Intact / Normal Aging' | 'Mild Cognitive Impairment (Amnestic MCI)' | 'Mild-Moderate Alzheimer\'s' | 'Parkinsonian Essential Tremor' | 'Severe Dementia';
  clinicalTier: 'NORMAL' | 'MCI' | 'HIGH_SUPPORT';
  expectedStudyTimeMs: number;
  expectedDeliberationMs: number;
  accuracyProbability: number;
  tremorJitterProbability: number;
  peekReplayProbability: number;
  assistanceNeeded: boolean;
  avatarIcon: string;
  clinicalNotes: {
    as: string;
    bn: string;
    hi: string;
    en: string;
  };
}

/**
 * Curated authentic OASIS-2 longitudinal cohort patient archetypes
 */
export const REAL_WORLD_OASIS_PERSONAS: OasisPatientPersona[] = [
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
    expectedStudyTimeMs: 3500,
    expectedDeliberationMs: 2200,
    accuracyProbability: 0.96,
    tremorJitterProbability: 0.02,
    peekReplayProbability: 0.05,
    assistanceNeeded: false,
    avatarIcon: '👴',
    clinicalNotes: {
      as: 'স্বাভাৱিক বয়সীয়াল প্ৰাপ্তবয়স্ক। ক্ষিপ্ৰ দৃষ্টি সন্ধান, অক্ষত ভেণ্ট্ৰেল ষ্ট্ৰিম বৈশিষ্ট্য বান্ধন, শূন্য কঁপনি।',
      bn: 'স্বাভাবিক বয়স্ক প্রাপ্তবয়স্ক। দ্রুত দৃষ্টি সন্ধান, অক্ষত ভেন্ট্রাল স্ট্রিম বৈশিষ্ট্য বন্ধন, শূন্য কম্পন।',
      hi: 'सामान्य स्वस्थ वृद्ध (74 वर्ष)। त्वरित दृश्य संज्ञान, अक्षुण्ण विशेषता संयोजन, शून्य कंपन।',
      en: 'Healthy aging control from Washington University OASIS-2. Rapid saccades, intact feature binding, zero tremor.',
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
    expectedStudyTimeMs: 7200,
    expectedDeliberationMs: 5400,
    accuracyProbability: 0.74,
    tremorJitterProbability: 0.08,
    peekReplayProbability: 0.35,
    assistanceNeeded: false,
    avatarIcon: '👵',
    clinicalNotes: {
      as: 'প্ৰাৰম্ভিক এমচিআই (MCI)। ৰং বা কোণৰ সূক্ষ্ম পৰিৱৰ্তনত মৃদু দৃষ্টি বিভ্ৰম, কেতিয়াবা পুনৰীক্ষণৰ প্ৰয়োজন।',
      bn: 'প্রাথমিক এমসিআই (MCI)। রঙ বা কোণের সূক্ষ্ম পরিবর্তনে মৃদু দৃষ্টি বিভ্রান্তি, মাঝে মাঝে পুনঃপরীক্ষার প্রয়োজন।',
      hi: 'प्रारंभिक एमसीआई (MCI, 75 वर्ष)। सूक्ष्म रंग व कोण बदलाव में हल्की परिवर्तन अंधता, दृश्य पुनर्निरीक्षण की आवश्यकता।',
      en: 'Early amnestic MCI. Mild change blindness during subtle angle/color flicker, occasional peek replay.',
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
    expectedStudyTimeMs: 11500,
    expectedDeliberationMs: 9200,
    accuracyProbability: 0.42,
    tremorJitterProbability: 0.15,
    peekReplayProbability: 0.60,
    assistanceNeeded: true,
    avatarIcon: '🧓',
    clinicalNotes: {
      as: 'মৃদু-মধ্যম আলঝাইমাৰ ডিমেনচিয়া। লক্ষণীয় দৃষ্টি বান্ধন হ্ৰাস, সোণালী স্পটলাইট সহায়িকাৰ প্ৰয়োজন।',
      bn: 'মৃদু-মাঝারি আলঝেইমার ডিমেনশিয়া। লক্ষণীয় দৃষ্টি বন্ধন হ্রাস, সোনালি স্পটলাইট সহায়তার প্রয়োজন।',
      hi: 'हल्का-मध्यम अल्जाइमर (80 वर्ष, MMSE 20)। दृश्य संयोजन में क्षय, सुनहरे स्पॉटलाइट संकेत की आवश्यकता।',
      en: 'Mild-to-moderate Alzheimer\'s dementia. Marked feature binding decay; requires golden spotlight assistance.',
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
    expectedStudyTimeMs: 4200,
    expectedDeliberationMs: 3800,
    accuracyProbability: 0.92,
    tremorJitterProbability: 0.85,
    peekReplayProbability: 0.10,
    assistanceNeeded: false,
    avatarIcon: '🤝',
    clinicalNotes: {
      as: 'তীব্ৰ কম্পনজনিত মটৰ বিকাৰ কিন্তু তীক্ষ্ণ মস্তিষ্ক। ৪০০ms মটৰ ফিল্টাৰে অনিচ্ছাকৃত স্পৰ্শ শোষণ কৰে।',
      bn: 'তীব্র কম্পনজনিত মোটর ব্যাধি কিন্তু তীক্ষ্ণ মস্তিষ্ক। ৪০০ms মোটর ফিল্টার অনিচ্ছাকৃত স্পর্শ শোষণ করে।',
      hi: 'पार्किंसन आवश्यक कंपन (78 वर्ष)। तेज दिमाग, 400ms मोटर फ़िल्टर अनैच्छिक थरथराहट को रोककर सही स्पर्श दर्ज करता है।',
      en: 'High resting motor tremor with sharp cognitive faculties. Demonstrates 400ms tremor filter absorbing jitter clicks.',
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
    expectedStudyTimeMs: 15000,
    expectedDeliberationMs: 12500,
    accuracyProbability: 0.28,
    tremorJitterProbability: 0.40,
    peekReplayProbability: 0.80,
    assistanceNeeded: true,
    avatarIcon: '🌸',
    clinicalNotes: {
      as: 'উন্নত স্মৃতিভ্ৰংশ (CDR 2.0)। স্তৰ ১ নিম্নতম সীমা (২টা বস্তু, ০ms ক্ৰছফেড), অবিৰত সহায়িকা সংকেত।',
      bn: 'উন্নত ডিমেনশিয়া (CDR 2.0)। স্তর ১ সর্বনিম্ন সীমা (২টি বস্তু, ০ms ক্রসফেড), ক্রমাগত সহায়ক সংকেত।',
      hi: 'गंभीर डिमेंशिया (83 वर्ष, MMSE 15, CDR 2.0)। स्तर १ न्यूनतम सीमा (२ वस्तुएं, ०ms क्रॉसफ़ेड), सतत मार्गदर्शन।',
      en: 'Advanced dementia. Routes to Tier 1 cognitive floor (2 items, 0ms crossfade) with continuous guidance.',
    },
  },
];

/**
 * Visual change categories in Rensink change blindness paradigm
 */
export type ChangeType = 
  | 'replacement'     // Object A swapped for distinct Object B
  | 'removal'         // Object disappears from scene (empty spot)
  | 'color_swap'      // Object changes color hue / saturation
  | 'position_swap'   // Two objects swap their spatial coordinates
  | 'rotation'        // Object rotates (45° / 90° / 180°)
  | 'addition';       // New object appears in previously vacant spot

/**
 * Ventral stream feature binding integrity classification
 */
export type FeatureBindingStatus = 'intact' | 'mild_binding_decay' | 'marked_binding_failure';

/**
 * Change blindness susceptibility rating
 */
export type ChangeBlindnessRating = 'resilient_attentive' | 'moderate_blindness' | 'marked_change_blindness';

/**
 * Processing speed profile based on visual fixation & deliberation
 */
export type VisuomotorDeliberationProfile = 'rapid_attentive' | 'deliberate_systematic' | 'hesitant_search' | 'tremor_dominant';

/**
 * 9 Fine-Grained Minimal Step Tiers (2 to 12 Items)
 * Follows Rensink Change Blindness & Visual Feature Binding Progression.
 */
export interface WhatChangedDifficulty {
  tierLevel: number;                    // 1 to 9
  itemCount: number;                    // 2 to 12 items placed in scene
  gridCols: number;                     // 2 to 4 columns
  gridRows: number;                     // 1 to 3 rows
  maskDurationMs: number;               // 0ms (smooth crossfade) up to 350ms (flicker mask)
  studyDurationMs: number;              // 15000ms down to 3500ms
  changeType: ChangeType;               // Target change type
  haloAssistanceAllowed: boolean;       // Golden spotlight assist permitted
  haloDelayMs: number;                  // Idle time before subtle halo hint appears
  maxReplayPeeksAllowed: number;        // Peek back at Scene A (3 down to 0)
  autoAssistTimeoutMs: number;          // 25000ms down to 10000ms
  tremorDebounceMs: number;             // 400ms hardware motor guard
  itemDifficultyB: number;              // 2PL IRT item difficulty (-2.0 to +2.5)
  discriminationA: number;              // 2PL IRT discrimination (1.2 to 1.8)
  tierDescription: Record<SupportedLanguage, string>;
}

/**
 * Scene Item displayed in the visual arena
 */
export interface SceneItem {
  slotId: number;                       // Fixed spatial grid slot (0 to N-1)
  itemId: string;                       // Reference to catalog item
  name: Record<SupportedLanguage, string>;
  icon: string;                         // Emoji or visual symbol
  color: string;                        // Tailwind color class
  rotationDeg: number;                  // Rotation angle (0, 45, 90, 180)
  isChangedTarget: boolean;             // True if this item underwent the change
  changeTypeApplied?: ChangeType;       // Exact change applied to this slot
  changeDescription: Record<SupportedLanguage, string>;
}

/**
 * Complete Snapshot of Patient In-Trial Settings & Autonomy Choices
 */
export interface WhatChangedSettingsSnapshot {
  haloScaffoldingActive: boolean;       // Spotlight guide was active during trial
  studyTimeUsedRatio: number;           // Fraction of study window consumed before continuing (0.0 to 1.0)
  replaysUsedCount: number;             // Number of peek backs to Scene A requested
  proactiveHelpRequested: boolean;      // Patient clicked Dignity Hint
  isManualTierOverride: boolean;        // Tested via testbed or examiner override
  soundMuted: boolean;                  // Audio effects muted
}

/**
 * Live Dynamic AI Action
 */
export interface WhatChangedAIDynamicAction {
  type: 'spotlight_hint' | 'mask_relaxation' | 'tempo_acceleration' | 'study_extension';
  timestamp: number;
  rationale: Record<SupportedLanguage, string>;
  parametersAffected: string;
}

/**
 * Millisecond Tap Event for Kinematic Analysis
 */
export interface TapEvent {
  slotId: number;
  timestamp: number;
  latencyFromPreviousMs: number;
  isTarget: boolean;
}

/**
 * Detailed Per-Trial Telemetry Record
 */
export interface WhatChangedTrialTelemetry {
  trialIndex: number;
  tierLevel: number;
  itemCount: number;
  changeType: ChangeType;
  targetSlotId: number;
  selectedSlotId: number | null;
  isCorrect: boolean;
  
  // Timing & Kinematics
  studyDurationActualMs: number;        // Time spent studying Scene A
  maskDurationMs: number;               // Flicker mask gap
  deliberationTimeMs: number;           // Time from Scene B onset to decision
  timeToFirstTapMs: number;             // Latency to initial interaction
  totalTapsCount: number;               // Total taps before submit
  tapEvents: TapEvent[];
  
  // Autonomy & Assistance
  wasAutoAssisted: boolean;
  replaysUsedCount: number;
  autonomyScore: number;                // 0 to 100%
  
  // Psychometric & AI Scoring
  thetaAfterTrial: number;
  difficultySnapshot: WhatChangedDifficulty;
  settingsSnapshot: WhatChangedSettingsSnapshot;
  settingsImpactRationale: Record<SupportedLanguage, string>;
  aiAdaptiveReasoning: Record<SupportedLanguage, string>;
  aiDynamicActions: WhatChangedAIDynamicAction[];
}

/**
 * Complete Clinical Session Summary Payload
 */
export interface WhatChangedSessionSummary {
  gameId: 'what-changed';
  totalTrials: number;
  correctTrials: number;
  accuracyPercentage: number;
  
  // Visual Cognitive Phenotyping
  featureBindingScore: number;          // 0 to 100% (accuracy on color/replacement)
  spatialBindingScore: number;          // 0 to 100% (accuracy on position/rotation)
  changeBlindnessIndex: ChangeBlindnessRating;
  ventralStreamBinding: FeatureBindingStatus;
  visuomotorProfile: VisuomotorDeliberationProfile;
  
  // Micro-timings & Autonomy
  meanStudyDurationMs: number;
  meanDeliberationMs: number;
  totalReplaysRequested: number;
  autoAssistedTrialsCount: number;
  autonomyScore: number;                // 0 to 100%
  patientSettingsAutonomyRating: 'autonomous_mastery' | 'moderate_scaffolding' | 'high_scaffolding_reliance';
  
  // IRT & Standard Equivalence
  finalTheta: number;
  estimatedMoCAVisualScore: number;     // 0 to 5 points (MoCA Visuospatial & Attention)
  oasisClinicalClassification?: CognitiveClassificationResult;
  caregiverEndedEarly: boolean;
  completedAt: string;
}
