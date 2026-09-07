export type SupportedLanguage = 'as' | 'bn' | 'hi' | 'en';

export type InstrumentRole = 'GO_TARGET' | 'NO_GO_INHIBIT';

export interface BihuInstrument {
  id: string;
  names: Record<SupportedLanguage, string>;
  role: InstrumentRole;
  icon: string;
  regionalOrigin: string;
  description: Record<SupportedLanguage, string>;
  colorTheme: string;
}

export type BihuDifficultyTier = 'gentle_slow' | 'moderate' | 'stimulating_fast';

export interface BihuTaalDifficulty {
  tier: BihuDifficultyTier;
  stimulusDurationMs: number; // Duration instrument is active on stage
  isiDurationMs: number;       // Inter-stimulus interval (silent breathing gap)
  goProbability: number;       // Ratio of Go vs No-Go (e.g. 0.70)
  cueScaffolding: boolean;     // Visual guidance halo around target
}

export interface BihuTrialTelemetry {
  trialNumber: number;
  instrument: BihuInstrument;
  expectedAction: 'TAP' | 'HOLD';
  patientAction: 'TAPPED' | 'HELD';
  reactionTimeMs: number | null; // null if held
  isCorrect: boolean;
  isCommissionError: boolean;    // Tapped on No-Go (Motor Impulsivity)
  isOmissionError: boolean;      // Failed to tap on Go (Inattention/Vigilance lapse)
  thetaAfterTrial: number;
}

export interface BihuTaalSessionSummary {
  gameId: 'bihu-taal';
  totalTrials: number;
  goTrialCount: number;
  noGoTrialCount: number;
  correctGoHits: number;
  correctNoGoHolds: number;
  commissionErrors: number;      // Impulsivity biomarker
  omissionErrors: number;        // Inattention biomarker
  accuracyPercentage: number;
  meanReactionTimeMs: number;
  finalTheta: number;
  estimatedMoCAAttentionScore: number; // 0 to 6 standard MoCA points
  processingSpeedProfile?: 'brisk' | 'normal' | 'deliberate' | 'marked_bradyphrenia';
  caregiverEndedEarly?: boolean;
  completedAt: string;
  trials: BihuTrialTelemetry[];
}

export interface BihuTaalProps {
  language?: SupportedLanguage;
  totalTrials?: number;
  initialTheta?: number;
  onTrialComplete?: (telemetry: BihuTrialTelemetry) => void;
  onSessionComplete?: (summary: BihuTaalSessionSummary) => void;
  onExit?: () => void;
}
