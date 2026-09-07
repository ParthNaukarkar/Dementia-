import type { SupportedLanguage } from '../../types/prescription';

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
  caregiverEndedEarly: boolean;
  completedAt: string;
}
