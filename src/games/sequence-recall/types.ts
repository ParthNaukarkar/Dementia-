import type { SupportedLanguage } from '../../types/prescription';

export type RecallDirection = 'FORWARD' | 'REVERSE';

export type ErrorType = 
  | 'NONE' 
  | 'TRANSPOSITION'  // Right items, wrong sequential order (Executive/Sequencing)
  | 'INTRUSION'      // Picked items never presented (Working Memory/Hippocampus)
  | 'PERSEVERATION'  // Tapped same item repeatedly (Inhibitory control)
  | 'OMISSION';      // Timed out or missed steps

export interface SequenceItem {
  id: string;
  names: Record<SupportedLanguage, string>;
  category: 'cultural' | 'instrument' | 'nature';
  color: string;
  bgGradient: string;
  borderColor: string;
  activeRingColor: string;
  audioPitchHz: number; // Harmonic musical pitch for Web Audio chime
  iconName: 'drum' | 'hat' | 'horn' | 'bell' | 'clapper' | 'flute' | 'lotus' | 'lamp';
}

export interface SequenceRecallDifficulty {
  sequenceLength: number;         // 2 to 6 items (as clinically specified)
  stimulusDurationMs: number;     // 900ms to 2200ms per item
  isiDurationMs: number;          // 500ms to 1400ms inter-stimulus breathing gap
  poolSize: number;               // 3 to 8 choice cards on screen
  direction: RecallDirection;     // FORWARD (baseline) or REVERSE (advanced theta >= 1.0)
  scaffoldingLevel: 'high' | 'moderate' | 'faded';
  tremorDebounceMs: number;       // 300ms to 500ms hardware motor guard
  autoAssistTimeoutMs: number;    // 30000ms to 50000ms dignity guard
}

export interface StepRecallAction {
  itemId: string;
  timestamp: number;
  latencyFromPreviousTapMs: number;
  isCorrectStep: boolean;
}

export interface TrialTelemetry {
  trialNumber: number;
  targetSequence: string[];
  recalledSequence: string[];
  isCorrect: boolean;
  errorType: ErrorType;
  initialDeliberationMs: number; // Time before first tap (thinking latency)
  totalRecallDurationMs: number; // Duration of entire recall phase
  stepLatencies: number[];       // Latency between consecutive taps
  wasAutoAssisted: boolean;
  usedUndo: boolean;
  thetaAfterTrial: number;
  difficultySnapshot: SequenceRecallDifficulty;
}

export interface SequenceRecallSessionSummary {
  gameId: 'sequence-recall';
  totalTrials: number;
  correctTrials: number;
  maxSpanAchieved: number;       // Longest successfully recalled sequence length (2 to 6)
  forwardSpan: number;
  reverseSpan: number;
  accuracyPercentage: number;
  meanDeliberationMs: number;
  finalTheta: number;            // Latent cognitive ability theta (-3.0 to +3.0)
  transpositionErrors: number;   // Sequencing / Frontal deficit biomarker
  intrusionErrors: number;       // Memory encoding / Hippocampal amnesia biomarker
  perseverationErrors: number;   // Frontotemporal disinhibition biomarker
  estimatedMoCAWorkingMemoryScore: number; // 0 to 5 points
  processingSpeedProfile: 'brisk' | 'normal' | 'deliberate' | 'marked_bradyphrenia';
  autoAssistedTrials: number;
  completedAt: string;
  caregiverEndedEarly: boolean;
  trials: TrialTelemetry[];
}

export interface SequenceRecallProps {
  language?: SupportedLanguage;
  totalTrials?: number;
  initialTheta?: number;
  onTrialComplete?: (telemetry: TrialTelemetry) => void;
  onSessionComplete?: (summary: SequenceRecallSessionSummary) => void;
  onExit?: () => void;
}
