import type { SupportedLanguage } from '../../types/prescription';
import type { AssistanceProfile } from '../../engine/adaptive-assistance';
export type { AssistanceProfile, ScaffoldingLevel } from '../../engine/adaptive-assistance';

export interface CardItem {
  id: string; // unique card id, e.g. 'rhino_A'
  pairKey: string; // shared key for matching, e.g. 'rhino'
  symbol: string;
  names: Record<SupportedLanguage, string>;
  culturalSignificance: Record<SupportedLanguage, string>;
  isFlipped: boolean;
  isMatched: boolean;
  gridRow: number;
  gridCol: number;
}

export interface MemoryMatchDifficulty {
  tier: number; // 1 to 9
  pairCount: number; // 2 to 15
  totalCards: number; // 4 to 30
  gridCols: number;
  gridRows: number;
  previewTimeMs: number; // Face-up inspection time before cards flip down (0 = immediate)
  cardFlipBackDelayMs: number; // How long 2 mismatched cards stay open for visual encoding
  baseTheta: number; // 2PL IRT b-parameter difficulty (-2.2 to +2.4)
  description: Record<SupportedLanguage, string>;
}

export interface MemoryMatchSettingsSnapshot {
  previewStudyEnabled: boolean;
  previewTimeMs: number;
  audioMuted: boolean;
  proactiveHelpRequested: boolean;
  isManualTierOverride: boolean;
}

export interface FlipEvent {
  cardId: string;
  pairKey: string;
  timestamp: number;
  deliberationMs: number;
  isMatch: boolean;
  isPerseveration: boolean;
  gridRow: number;
  gridCol: number;
}

export interface AIDynamicAction {
  type: 'ghost_preview' | 'distractor_dim' | 'pair_beacon' | 'pace_reassurance';
  timestamp: number;
  rationale: Record<SupportedLanguage, string>;
  cardsAffected?: number;
}

export interface MemoryMatchRoundTelemetry {
  roundIndex: number;
  tier: number;
  pairCount: number;
  totalCards: number;
  totalFlips: number;
  firstTrialCorrect: number; // Number of pairs solved with zero erroneous flips
  perseverativeErrors: number;
  exploratoryErrors: number;
  totalErrorsAdjusted: number; // CANTAB PAL TEA metric
  searchPatternEntropy: number; // Shannon spatial entropy H (0.0 to 4.0)
  meanLatencyMs: number;
  solveTimeSeconds: number;
  autonomyScore: number; // 0 to 100
  wasAutoAssisted: boolean;
  autoAssistedPairsCount: number;
  assistanceProfile: AssistanceProfile;
  flips: FlipEvent[];
  settingsSnapshot: MemoryMatchSettingsSnapshot;
  aiDynamicActions: AIDynamicAction[];
  theta: number;
  completedAt: string;
}

export interface MemoryMatchSessionSummary {
  gameId: 'memory-match';
  gameTitle: string;
  rounds: MemoryMatchRoundTelemetry[];
  totalRounds: number;
  finalTier: number;
  finalTheta: number;
  overallAccuracyPct: number;
  totalFlips: number;
  totalFirstTrialCorrect: number;
  totalPerseverations: number;
  totalExploratoryErrors: number;
  cantabTotalErrorsAdjusted: number; // Sum of TEA across rounds
  meanSearchEntropy: number;
  averageLatencyMs: number;
  medianLatencyMs: number;
  overallAutonomyScore: number;
  estimatedMoCAMemoryScore: number; // 0 to 5
  processingSpeedProfile: 'hyper_rapid' | 'normal' | 'deliberate' | 'motor_slowed';
  dominantAssistanceProfile: AssistanceProfile;
  completedAt: string;
}

export interface MemoryMatchProps {
  language?: SupportedLanguage;
  totalRounds?: number;
  totalPairs?: number;
  initialTheta?: number;
  onRoundComplete?: (round: MemoryMatchRoundTelemetry) => void;
  onSessionComplete?: (summary: MemoryMatchSessionSummary) => void;
  onExit?: () => void;
}
