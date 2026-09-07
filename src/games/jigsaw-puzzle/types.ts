import type { SupportedLanguage } from '../../types/prescription';

export type VisuomotorProfile = 'fluid' | 'hesitant' | 'tremor_dominant' | 'marked_apraxia';

export interface PuzzleImage {
  id: string;
  titles: Record<SupportedLanguage, string>;
  subtitles: Record<SupportedLanguage, string>;
  category: 'heritage' | 'nature' | 'craft';
  svgArt: string; // Self-contained vector illustration for offline rendering
  themeColor: string;
  bgGradient: string;
}

export interface PuzzlePiece {
  id: string;
  correctCol: number;
  correctRow: number;
  currentCol: number | null; // null if in tray
  currentRow: number | null;
  rotation: number;          // 0, 90, 180, 270 degrees
  isLocked: boolean;         // true once correctly placed
  isHighlighted: boolean;    // auto-assist hint glow
}

export interface JigsawDifficulty {
  gridCols: number;          // 1 (floor) to 3 (ceiling)
  gridRows: number;          // 2 (floor: 1x2=2 pcs) to 3 (ceiling: 3x3=9 pcs)
  totalPieces: number;       // 2 to 9 pieces
  ghostOpacity: number;      // 1.0 (floor: 100% full-color) to 0.0 (ceiling: 0% blank)
  allowRotation: boolean;    // false (floor: 0 deg locked) to true (ceiling: 90 deg steps)
  snapMarginPx: number;      // 80px (floor: super-magnetic) to 20px (ceiling: precision)
  autoAssistTimeoutMs: number; // 25000ms to 45000ms
  tremorDebounceMs: number;  // 400ms hardware motor filter
  scaffoldingLevel: 'floor_full_assist' | 'moderate_guidance' | 'minimal_scaffolding';
}

export interface PiecePlacementEvent {
  pieceId: string;
  targetCol: number;
  targetRow: number;
  isCorrect: boolean;
  deliberationMs: number;
  rotationAtPlacement: number;
  timestamp: number;
}

export interface PuzzleTrialTelemetry {
  trialIndex: number;
  puzzleImageId: string;
  totalPieces: number;
  piecesPlacedCorrectly: number;
  misplacementsCount: number;
  timeToFirstPlacementMs: number;
  totalSolveTimeMs: number;
  rotationsUsed: number;
  wasAutoAssisted: boolean;
  autoAssistedPiecesCount: number;
  thetaAfterTrial: number;
  difficultySnapshot: JigsawDifficulty;
  placementHistory: PiecePlacementEvent[];
}

export interface JigsawSessionSummary {
  gameId: 'jigsaw-puzzle';
  totalPuzzles: number;
  solvedPuzzles: number;
  accuracyPercentage: number;
  meanSolveTimeSeconds: number;
  totalMisplacements: number;
  spatialPraxisScore: number;       // 0 to 5 points (WAIS-IV Block Design equivalent)
  estimatedCERADPraxisScore: number;// 0 to 14 standard points
  visuomotorProfile: VisuomotorProfile;
  finalTheta: number;              // Continuous ability parameter (-3.0 to +3.0)
  autoAssistedRounds: number;
  completedAt: string;
  caregiverEndedEarly: boolean;
  trials: PuzzleTrialTelemetry[];
}

export interface JigsawPuzzleProps {
  language?: SupportedLanguage;
  totalPuzzles?: number;
  initialTheta?: number;
  onTrialComplete?: (telemetry: PuzzleTrialTelemetry) => void;
  onSessionComplete?: (summary: JigsawSessionSummary) => void;
  onExit?: () => void;
}
