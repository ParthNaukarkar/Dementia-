import type { SupportedLanguage } from './prescription';

export type UserRole = 'caretaker' | 'patient';

export type DementiaDiagnosisStage = 
  | 'healthy'
  | 'mild_cognitive_impairment'
  | 'mild_alzheimers'
  | 'moderate_dementia'
  | 'unspecified';

export interface CaretakerUser {
  id: string;
  name: string;
  age: number;
  email: string;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  caretakerId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  primaryLanguage: SupportedLanguage;
  diagnosisStage: DementiaDiagnosisStage;
  emergencyContact: string;
  relationshipToCaretaker: string; // e.g. "Father", "Mother", "Spouse", "Patient"
  notes?: string;
  createdAt: string;
}

export interface AuthState {
  currentRole: UserRole;
  caretaker: CaretakerUser | null;
  activePatient: PatientProfile | null;
  patients: PatientProfile[];
}
