export type SupportedLanguage = 'en' | 'hi';
export type LocalizedString = Record<SupportedLanguage, string> & { [key: string]: string };
export type LocalizedStringList = Record<SupportedLanguage, string[]> & { [key: string]: string[] };

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
  title: LocalizedString;
  subtitle: LocalizedString;
  domain: LumosityDomain;
  domainLabel: LocalizedString;
  clinicalStandard: string;
  targetBrainArea: string;
  estimatedMinutes: number;
  iconType: 'brain' | 'sparkle' | 'text' | 'puzzle' | 'hash' | 'eye' | 'book' | 'compass' | 'layers' | 'grid';
  isAvailable: boolean;
  description: LocalizedString;
}

export interface PatientPrescription {
  patientId: string;
  prescribedGameIds: GameId[];
  presetType: 'custom' | 'alzheimers_memory' | 'frontal_executive' | 'daily_independence' | 'comprehensive';
  updatedAt: string;
  caregiverNotes?: string;
  dailyGoalMinutes: number;
}
