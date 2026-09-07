import type { PatientPrescription } from '../types/prescription';
import { PRESET_PRESCRIPTIONS } from '../data/gameCatalog';

const STORAGE_KEY = 'smriti_patient_prescription_v1';

export function getSavedPrescription(): PatientPrescription | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.prescribedGameIds) && parsed.prescribedGameIds.length > 0) {
      return parsed as PatientPrescription;
    }
  } catch (e) {
    console.warn('Error reading prescription from localStorage:', e);
  }
  return null;
}

export function savePrescription(prescription: PatientPrescription): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prescription));
  } catch (e) {
    console.error('Failed to persist prescription to localStorage:', e);
  }
}

export function getDefaultPrescription(): PatientPrescription {
  return {
    patientId: 'patient_default',
    prescribedGameIds: PRESET_PRESCRIPTIONS.alzheimers_memory.gameIds,
    presetType: 'alzheimers_memory',
    updatedAt: new Date().toISOString(),
    dailyGoalMinutes: 12,
  };
}
