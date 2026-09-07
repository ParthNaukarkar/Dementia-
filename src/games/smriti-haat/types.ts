/**
 * Smriti Haat (Market Memory Game) - Clean Types & Contracts
 * Designed for modular integration into any frontend.
 */

export type SupportedLanguage = 'as' | 'bn' | 'hi' | 'en';

export interface BazaarItem {
  id: string;
  names: {
    as: string; // Assamese
    bn: string; // Bengali
    hi: string; // Hindi
    en: string; // English
  };
  category: 'textile' | 'produce' | 'craft' | 'beverage';
  icon: string; // High-contrast visual emoji / SVG identifier
  colorBg: string;
  regionOrigin: string; // e.g., 'Assam', 'Nagaland', 'Arunachal Pradesh', 'Mizoram'
}

export interface DifficultyConfig {
  itemsToMemorize: number;     // Number of target items shown on stall (1, 2, or 3)
  gridSize: '1x2' | '2x2' | '2x3';     // Options presented in recall phase (2, 4, or 6 items)
  exposureTimeMs: number;      // How long items are shown before covering
  assistLevel: 'gentle_1_item' | 'high_assist' | 'moderate_assist' | 'independent';
}

export interface RoundTelemetry {
  roundNumber: number;
  targets: string[];            // IDs of items to memorize
  selected: string[];           // IDs of items patient clicked
  correctCount: number;
  isFullyCorrect: boolean;
  latencyMs: number;            // Reaction time in milliseconds
  hesitationMs: number;         // Time beyond normal deliberation
  isPerseveration: boolean;     // Repeated mistake from previous round
  difficulty: DifficultyConfig;
  nextDifficulty: DifficultyConfig;
  thetaAfterRound: number;      // Patient ability parameter after Bayesian update (-3.0 to +3.0)
  eliminatedDistractors: string[]; // Distractor items auto-removed mid-round by AI
  wasAutoAssisted?: boolean;    // True if AI auto-completed selections due to patient hesitation/inability
  adaptationRationale: string;  // Explicit explanation of why difficulty adjusted
}

export interface SessionSummaryTelemetry {
  gameId: string;
  totalRounds: number;
  totalCorrect: number;
  autoAssistedRounds?: number;  // Count of rounds auto-completed by AI on patient's behalf
  accuracyPercentage: number;
  averageLatencyMs: number;
  medianLatencyMs: number;
  perseverationErrors: number;
  finalTheta: number;
  estimatedMoCAMemoryScore: number; // 0 to 5 points (standard MoCA Delayed Recall mapping)
  processingSpeedProfile?: 'brisk' | 'normal' | 'deliberate' | 'marked_bradyphrenia';
  caregiverEndedEarly?: boolean;
  completedAt: string;
  rounds: RoundTelemetry[];
}

export interface SmritiHaatProps {
  language?: SupportedLanguage;
  totalRounds?: number;
  initialTheta?: number;
  onRoundComplete?: (roundData: RoundTelemetry) => void;
  onSessionComplete?: (sessionSummary: SessionSummaryTelemetry) => void;
  onExit?: () => void;
}
