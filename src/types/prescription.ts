export type SupportedLanguage = 'as' | 'bn' | 'hi' | 'en';

export type GameId = 
  | 'memory-match'
  | 'sequence-recall'
  | 'word-recall'
  | 'jigsaw-puzzle'
  | 'number-recall'
  | 'what-changed'
  | 'brain-story'
  | 'where-am-i'
  | 'odd-one-out'
  | 'pattern-recall'
  | 'smriti-haat'; // Alias to word-recall for backwards-compatibility

export type LumosityDomain = 
  | 'all'
  | 'memory'
  | 'attention'
  | 'speed'
  | 'spatial'
  | 'language'
  | 'executive';

export interface GameMetadata {
  id: GameId;
  title: Record<SupportedLanguage, string>;
  subtitle: Record<SupportedLanguage, string>;
  domain: LumosityDomain;
  domainLabel: Record<SupportedLanguage, string>;
  clinicalStandard: string;
  targetBrainArea: string;
  estimatedMinutes: number;
  iconType: 'brain' | 'sparkle' | 'text' | 'puzzle' | 'hash' | 'eye' | 'book' | 'compass' | 'layers' | 'grid';
  isAvailable: boolean;
  description: Record<SupportedLanguage, string>;
}

export interface PatientPrescription {
  patientId: string;
  prescribedGameIds: GameId[];
  presetType: 'custom' | 'alzheimers_memory' | 'frontal_executive' | 'daily_independence' | 'comprehensive';
  updatedAt: string;
  caregiverNotes?: string;
  dailyGoalMinutes: number;
}
