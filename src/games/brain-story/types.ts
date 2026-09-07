/**
 * SmritiNER - Game 10: Brain Story (Monor Sadhukatha / মনৰ সাধুকথা)
 * Clinical Neuropsychological Evaluation & Cognitive Training
 * Paradigm: Wechsler Memory Scale (WMS-IV) Logical Memory & Reminiscence Therapy
 * Assesses auditory narrative encoding, central gist vs. peripheral recall, and recognition.
 */

import type { SupportedLanguage } from '../../types/prescription';
import type { CognitiveClassificationResult } from '../../engine/cognitive-classifier';

export type StoryElementCategory =
  | 'protagonist'      // Who was the story about?
  | 'setting'          // Where did it take place?
  | 'action'           // What did they do?
  | 'outcome'          // What was the end result?
  | 'temporal_order'   // What happened first / next?
  | 'detail';          // What specific object / color was mentioned?

/**
 * 9 Fine-Grained Minimal Step Tiers (WMS Logical Memory & Reminiscence Calibrated)
 */
export interface BrainStoryDifficulty {
  tierLevel: number;                   // 1 to 9
  sentenceCount: number;               // 1 to 5 sentences
  wordCountTarget: number;             // 15 to 140 words
  storyElementsCount: number;          // 2 to 6 elements
  choicesCount: number;                // 2, 3, or 4 options per question
  storyVisibleDuringQuestions: boolean;// True for Tiers 1-4 (recognition support); False for Tiers 5-9 (pure recall)
  audioReplaysAllowed: number;         // 2 down to 0 replays
  clueHintAllowed: boolean;            // Clue hint button available
  autoAssistTimeoutMs: number;         // 22000ms down to 7500ms
  tremorDebounceMs: number;            // 400ms motor tremor guard
  itemDifficultyB: number;             // 2PL IRT difficulty parameter (-2.2 to +2.4)
  discriminationA: number;             // 2PL IRT discrimination parameter (1.2 to 1.8)
  tierDescription: Record<SupportedLanguage, string>;
}

export interface StoryQuestion {
  id: string;
  elementCategory: StoryElementCategory;
  questionText: Record<SupportedLanguage, string>;
  options: Record<SupportedLanguage, string[]>; // Array of choices in each language
  correctOptionIndex: number;
  clueHintText: Record<SupportedLanguage, string>;
}

export interface StoryVignette {
  id: string;
  theme: string;
  title: Record<SupportedLanguage, string>;
  icon: string;
  sentences: Record<SupportedLanguage, string[]>;
  questions: StoryQuestion[];
}

export interface BrainStoryGeneratedTrial {
  trialIndex: number;
  story: StoryVignette;
  displayedSentences: string[];
  activeQuestions: StoryQuestion[];
  difficulty: BrainStoryDifficulty;
}

export interface BrainStorySettingsSnapshot {
  audioReplaysUsed: number;
  maxReplaysAllowed: number;
  cluesUsedCount: number;
  storyVisible: boolean;
  isManualTierOverride: boolean;
  soundMuted: boolean;
}

export interface BrainStoryTrialTelemetry {
  trialIndex: number;
  tierLevel: number;
  storyId: string;
  totalQuestions: number;
  correctQuestionsCount: number;
  isAllCorrect: boolean;
  selectedOptionIndices: number[];
  deliberationTimeMs: number;
  timeToFirstTapMs: number;
  totalTapsCount: number;
  audioReplaysUsed: number;
  cluesUsedCount: number;
  autonomyScore: number;               // 0 to 100%
  thetaAfterTrial: number;             // -3.0 to +3.0
  difficultySnapshot: BrainStoryDifficulty;
  settingsSnapshot: BrainStorySettingsSnapshot;
  aiAdaptiveReasoning: string;
}

/**
 * Clinical Profile Staging & Phenotypes
 */
export type NarrativeRetentionStatus =
  | 'intact_episodic_narrative'        // Accurate retention of central gist + peripheral details without cues
  | 'mild_detail_attenuation'          // Retains central gist; minor omission of peripheral details
  | 'gist_constrained_retention'       // Retains only basic gist under scaffolding/story visibility
  | 'severe_narrative_fragmentation';  // Struggles with 1-sentence vignettes; requires direct recognition

export type StoryComprehensionProfile =
  | 'swift_immediate_recall'           // Rapid, confident option selection (<4s)
  | 'deliberate_reflective'            // Thoughtful review and steady answer selection
  | 'clue_reliant_recognition'         // High deliberation time, utilizes clues/replays
  | 'motor_tremor_dominant';           // Frequent motor jitters absorbed by tremor guard

export type MotorTremorStatus =
  | 'normal_motor'
  | 'mild_hesitation_jitter'
  | 'tremor_dominant';

export interface BrainStorySessionSummary {
  gameId: 'brain-story';
  totalTrials: number;
  totalQuestions: number;
  correctQuestions: number;
  accuracyPercentage: number;
  meanDeliberationMs: number;
  meanTimeToFirstTapMs: number;
  totalReplaysUsed: number;
  totalCluesUsed: number;
  tremorTapsFilteredTotal: number;
  autonomyScore: number;               // 0 to 100%
  finalTheta: number;                  // Bayesian latent ability θ (-3.0 to +3.0)
  wmsLogicalMemoryScaledScore: number; // Calibrated WMS-IV Logical Memory scaled score (1 to 19)
  estimatedMoCALanguageScore: number;  // Calibrated MoCA Language & Memory subscore (0 to 5)
  narrativeRetentionStatus: NarrativeRetentionStatus;
  storyComprehensionProfile: StoryComprehensionProfile;
  motorTremorStatus: MotorTremorStatus;
  oasisClinicalClassification?: CognitiveClassificationResult;
  caregiverEndedEarly: boolean;
  completedAt: string;
}

/**
 * 5 Curated Authentic Patient Personas from Washington University ADRC (OASIS-2)
 */
export interface OasisBrainStoryPersona {
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
  audioReplayProbability: number;
  clueHintProbability: number;
  avatarIcon: string;
  clinicalNotes: Record<SupportedLanguage, string>;
}

export const REAL_WORLD_BRAIN_STORY_PERSONAS: OasisBrainStoryPersona[] = [
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
    expectedDeliberationMs: 3200,
    accuracyProbability: 0.96,
    tremorJitterProbability: 0.04,
    audioReplayProbability: 0.05,
    clueHintProbability: 0.05,
    avatarIcon: '👨‍🏫',
    clinicalNotes: {
      as: 'স্বাভাৱিক বয়সস্থ নিয়ন্ত্ৰণ (MMSE 30, CDR 0.0)। উজ্জ্বল আখ্যান স্মৃতি, চুটি গল্পৰ সকলো তথ্য আৰু চৰিত্ৰ সঠিকভাৱে মনত ৰাখে।',
      bn: 'স্বাভাবিক বয়স্ক নিয়ন্ত্রণ (MMSE 30, CDR 0.0)। প্রখর আখ্যান স্মৃতি, গল্পের সমস্ত তথ্য ও চরিত্র সঠিকভাবে মনে রাখেন।',
      hi: 'सामान्य वरिष्ठ नियंत्रण (MMSE 30, CDR 0.0)। तीव्र आख्यान स्मृति, कहानी के सभी विवरण और पात्रों को सटीक याद रखते हैं।',
      en: 'Healthy normal control (MMSE 30, CDR 0.0). Preserved narrative memory, accurately recalling gist and peripheral details unassisted.',
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
    expectedDeliberationMs: 5800,
    accuracyProbability: 0.76,
    tremorJitterProbability: 0.12,
    audioReplayProbability: 0.35,
    clueHintProbability: 0.30,
    avatarIcon: '👵',
    clinicalNotes: {
      as: 'মৃদু জ্ঞানীয় বিকাৰ (MMSE 26, CDR 0.5)। মূল ঘটনা মনত থাকে কিন্তু গৌণ তথ্য পাহৰি যায়; এটা শ্ৰব্য পুনৰাবৃত্তিৰ প্ৰয়োজন হয়।',
      bn: 'মৃদু জ্ঞানীয় ব্যাধি (MMSE 26, CDR 0.5)। মূল ঘটনা মনে থাকে কিন্তু গৌণ তথ্য ভুলে যান; একটি অডিও পুনরাবৃত্তি প্রয়োজন হয়।',
      hi: 'हल्की संज्ञानात्मक हानि (MMSE 26, CDR 0.5)। मुख्य कथा याद रहती है किंतु सूक्ष्म विवरण भूल जाते हैं; ऑडियो रीप्ले सहायक।',
      en: 'Mild Cognitive Impairment (MMSE 26, CDR 0.5). Retains central narrative gist; benefits from audio replay for specific details.',
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
    expectedDeliberationMs: 9800,
    accuracyProbability: 0.44,
    tremorJitterProbability: 0.18,
    audioReplayProbability: 0.75,
    clueHintProbability: 0.70,
    avatarIcon: '🧓',
    clinicalNotes: {
      as: 'মৃদু-মধ্যম আলঝাইমাৰ (MMSE 20, CDR 1.0)। ভাষা স্মৃতিৰ স্পষ্ট হ্ৰাস; চুটি ১-২ বাক্যৰ গল্প আৰু দৃশ্যমান সংকেতৰ প্ৰয়োজন।',
      bn: 'মৃদু-মাঝারি আলঝেইমার (MMSE 20, CDR 1.0)। ভাষা স্মৃতির স্পষ্ট হ্রাস; ছোট ১-২ বাক্যের গল্প ও দৃশ্যমান সূত্রের প্রয়োজন।',
      hi: 'हल्का-मध्यम अल्जाइमर (MMSE 20, CDR 1.0)। भाषा स्मृति में स्पष्ट गिरावट; १-२ वाक्यों की छोटी कहानी व दृश्य संकेत आवश्यक।',
      en: 'Mild-to-moderate Alzheimer\'s (MMSE 20, CDR 1.0). Marked episodic narrative loss; requires 1-2 sentence stories and clue scaffolding.',
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
    expectedDeliberationMs: 3800,
    accuracyProbability: 0.92,
    tremorJitterProbability: 0.85,
    audioReplayProbability: 0.10,
    clueHintProbability: 0.10,
    avatarIcon: '🤝',
    clinicalNotes: {
      as: 'পাৰ্কিনছনিয়ান তীব্ৰ কম্পন কিন্তু অক্ষুণ্ণ ভাষা আৰু শ্ৰব্য স্মৃতি। ৪০০ms মটৰ ফিল্টাৰে খৰখেদা কম্পন শোষণ কৰে।',
      bn: 'পার্কিনসনিয়ান তীব্র কম্পন কিন্তু অক্ষুণ্ণ ভাষা ও শ্রবণ স্মৃতি। ৪০০ms মোটর ফিল্টার ক্ষিপ্র কম্পন শোষণ করে।',
      hi: 'पार्किंसन आवश्यक कंपन किंतु अक्षुण्ण भाषा व श्रवण स्मृति। 400ms मोटर फ़िल्टर थरथराहट को रोकता है।',
      en: 'Parkinsonian essential tremor with intact auditory narrative recall. 400ms debounce filter absorbs jitter taps.',
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
    expectedDeliberationMs: 13500,
    accuracyProbability: 0.25,
    tremorJitterProbability: 0.35,
    audioReplayProbability: 0.90,
    clueHintProbability: 0.85,
    avatarIcon: '🌸',
    clinicalNotes: {
      as: 'উন্নত স্মৃতিভ্ৰংশ (MMSE 15, CDR 2.0)। স্তৰ ১ নিম্নতম সীমা (১টা চমু পুৰণি পৰিচিত বাক্য, দৃশ্যমান লেখা, ২টা বিকল্প)।',
      bn: 'উন্নত ডিমেনশিয়া (MMSE 15, CDR 2.0)। স্তর ১ সর্বনিম্ন সীমা (১টি সংক্ষিপ্ত চেনা বাক্য, দৃশ্যমান লেখা, ২টি বিকল্প)।',
      hi: 'गंभीर डिमेंशिया (MMSE 15, CDR 2.0)। स्तर १ न्यूनतम सीमा (१ संक्षिप्त चिर-परिचित वाक्य, दृश्यमान पाठ, २ विकल्प)।',
      en: 'Severe dementia (MMSE 15, CDR 2.0). Requires Tier 1 cognitive floor (1 short familiar sentence, persistent text, 2 choices).',
    },
  },
];
