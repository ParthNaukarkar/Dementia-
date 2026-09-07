import type { SupportedLanguage } from '../../types/prescription';

/**
 * Recall presentation and execution modes
 */
export type RecallMode = 'forward' | 'backward';

/**
 * Phonological loop and working memory health classification
 */
export type PhonologicalLoopRating = 'preserved' | 'mild_slowing' | 'marked_loop_decay';

/**
 * Dorsolateral Prefrontal Cortex (DLPFC) mental reversal status
 */
export type PrefrontalReversalStatus = 'intact_reversal' | 'moderate_executive_load' | 'marked_reversal_failure';

/**
 * Processing speed profile based on inter-keystroke intervals
 */
export type KeystrokeRhythmProfile = 'fluid_rapid' | 'deliberate_rhythmic' | 'hesitant_variable' | 'tremor_dominant';

/**
 * Error Taxonomy for Digit Span
 */
export type DigitErrorType = 
  | 'none'
  | 'transposition'    // Digits present, but typed in wrong order (sequencing deficit)
  | 'substitution'     // Unpresented digits entered (encoding/phonological decay)
  | 'omission'         // Truncated input (working memory capacity limit)
  | 'perseveration'    // Repetition of previous digit or perseverative loop
  | 'intrusion';       // Extraneous digit

/**
 * 9 Fine-Grained Minimal Step Tiers (2 to 9 Digits)
 */
export interface NumberRecallDifficulty {
  tierLevel: number;                    // 1 to 9
  digitCount: number;                   // 2 to 9
  displaySpeedMs: number;               // 3000ms down to 600ms per digit
  isiGapMs: number;                     // Inter-stimulus interval between digits (800ms down to 300ms)
  recallMode: RecallMode;               // 'forward' or 'backward'
  ghostWatermarkOpacity: number;        // 0.50 (Tier 1 floor) down to 0.0 (Tier 4+)
  speechRate: number;                   // 0.70 (slow Dignity pacing) to 1.0 (standard)
  audioSpeechEnabled?: boolean;         // Visual flash only if false (e.g. Tier 9 ceiling & Tier 7)
  maxReplaysAllowed: number;            // 3 down to 0
  allowBackspace: boolean;              // true
  autoAssistTimeoutMs: number;          // 25000ms down to 12000ms
  tremorDebounceMs: number;             // 400ms hardware motor guard
  itemDifficultyB: number;              // 2PL IRT item difficulty (-2.0 to +2.5)
  discriminationA: number;              // 2PL IRT item discrimination (1.2 to 1.8)
  tierDescription: Record<SupportedLanguage, string>;
}

/**
 * Comprehensive Snapshot of Patient Settings & In-Trial Autonomy Choices
 */
export interface NumberRecallSettingsSnapshot {
  ghostWatermarkEnabled: boolean;       // Visual scaffolding
  watermarkPiecesViewedCount: number;   // Digits entered while watermark was visible
  audioSpeechEnabled: boolean;          // Verbal readout active
  speechRateUsed: number;               // 0.7 to 1.0
  replaysUsedCount: number;             // Audio replay requests
  backspaceCorrectionsCount: number;    // Metacognitive self-corrections
  proactiveHelpRequested: boolean;      // Clicked Dignity Hint
  isManualTierOverride: boolean;        // Tested via testbed or examiner override
}

/**
 * Millisecond Keypress Event for Dynamic Analysis
 */
export interface KeypressEvent {
  digit: string;
  timestamp: number;
  latencyFromPreviousMs: number;
  isBackspace: boolean;
  boxIndex: number;
}

/**
 * Live Dynamic AI Action
 */
export interface NumberRecallAIDynamicAction {
  type: 'pace_relaxation' | 'audio_replay_assist' | 'watermark_reveal' | 'tempo_acceleration';
  timestamp: number;
  rationale: Record<SupportedLanguage, string>;
  parametersAffected: string;
}

/**
 * Detailed Per-Trial Telemetry Record
 */
export interface NumberRecallTrialTelemetry {
  trialIndex: number;
  tierLevel: number;
  digitCount: number;
  recallMode: RecallMode;
  targetSequence: string;               // e.g. "4927"
  userEnteredSequence: string;          // e.g. "4927" or "7294" (if backward)
  expectedSequence: string;             // forward: target, backward: reversed target
  isCorrect: boolean;
  errorType: DigitErrorType;
  
  // Serial Position Curve Metrics
  primacyAccuracy: boolean;             // Accuracy on first 2 digits (long-term phonological buffer)
  recencyAccuracy: boolean;             // Accuracy on last 2 digits (echoic sensory buffer)
  serialPositionHits: boolean[];        // Accuracy per digit position
  
  // Micro-timing Stream
  presentationDurationMs: number;       // Total time sequence was displayed
  timeToFirstKeypressMs: number;        // Deliberation before entering digit 1
  totalSolveTimeMs: number;             // From presentation end to submit
  meanInterDigitLatencyMs: number;      // Typing rhythm fluency
  keystrokeEvents: KeypressEvent[];
  
  // Metacognition & Autonomy
  backspaceCorrectionsCount: number;    // Intact error monitoring
  replaysUsedCount: number;
  wasAutoAssisted: boolean;
  
  // Psychometric & AI Scoring
  thetaAfterTrial: number;
  difficultySnapshot: NumberRecallDifficulty;
  settingsSnapshot: NumberRecallSettingsSnapshot;
  settingsImpactRationale: Record<SupportedLanguage, string>;
  aiAdaptiveReasoning: Record<SupportedLanguage, string>;
  autonomyScore: number;                // 0 to 100%
  aiDynamicActions: NumberRecallAIDynamicAction[];
}

/**
 * Comprehensive End-of-Session Clinical Summary Payload
 */
export interface NumberRecallSessionSummary {
  gameId: 'number-recall';
  totalTrials: number;
  correctTrials: number;
  accuracyPercentage: number;
  
  // WAIS-IV Digit Span Standard Metrics
  maxForwardSpanAchieved: number;       // Standard Corsi/WAIS Forward Span (2 to 9)
  maxBackwardSpanAchieved: number;      // WAIS Backward Span (2 to 7)
  waisDigitSpanScaledScore: number;     // 1 to 19 age-normed standard scaled score (Mean=10, SD=3)
  
  // Neurocognitive Diagnostic Ratings
  phonologicalLoopRating: PhonologicalLoopRating;
  dorsolateralPrefrontalStatus: PrefrontalReversalStatus;
  keystrokeRhythmProfile: KeystrokeRhythmProfile;
  
  // Serial Position Curve Profile
  serialPositionProfile: {
    primacyRetentionRate: number;       // % retention on position 1 & 2
    recencyRetentionRate: number;       // % retention on final positions
    intermediateRetentionRate: number;  // % retention on middle positions
    clinicalInterpretation: string;     // Normal U-curve vs Flattened Anterograde Decay
  };
  
  // Autonomy & Settings Strategy Report
  autonomyScore: number;                // 0 to 100%
  patientSettingsAutonomyRating: 'autonomous_mastery' | 'moderate_scaffolding' | 'high_scaffolding_reliance';
  settingsAnalysisReport: {
    watermarkIndependence: string;
    speechGuidanceReliance: string;
    metacognitiveCorrectionActivity: string;
  };
  
  // Operational Metrics
  meanDeliberationMs: number;
  meanInterDigitLatencyMs: number;
  totalBackspaceCorrections: number;
  totalReplaysRequested: number;
  tremorTapsFilteredCount: number;
  finalTheta: number;
  completedAt: string;
  caregiverEndedEarly: boolean;
  trials: NumberRecallTrialTelemetry[];
}

/**
 * Props for NumberRecall Component
 */
export interface NumberRecallProps {
  language: SupportedLanguage;
  totalTrials?: number;
  initialTheta?: number;
  onTrialComplete?: (telemetry: NumberRecallTrialTelemetry) => void;
  onSessionComplete?: (summary: NumberRecallSessionSummary) => void;
  onExit?: () => void;
}
