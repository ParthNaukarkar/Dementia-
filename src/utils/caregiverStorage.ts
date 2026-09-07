import type { MedicationItem, DailyRoutineItem } from '../types/caregiver';

const MEDICATIONS_KEY = 'smriti_patient_medications_v1';
const ROUTINE_KEY = 'smriti_patient_routine_v1';
const REPORTS_KEY = 'smriti_patient_reports_v1';

export interface MedicalReportItem {
  id: string;
  name: string;
  uploadDate: string;
  sizeBytes?: number;
  downloadUrl?: string;
}

export function getStoredMedications(patientId: string): MedicationItem[] {
  try {
    const raw = localStorage.getItem(`${MEDICATIONS_KEY}_${patientId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  
  // Default clinical regimen for dementia / MCI
  return [
    {
      id: 'med_01',
      patientId,
      name: 'Donepezil Hydrochloride',
      dosage: '5 mg',
      timing: 'bedtime',
      instructions: 'Take 1 tablet at night with water. Cholinesterase inhibitor for memory.',
      takenToday: true,
      prescribedBy: 'Dr. A. Sarma (Neurology, GMCH)',
    },
    {
      id: 'med_02',
      patientId,
      name: 'Memantine HCl',
      dosage: '10 mg',
      timing: 'morning',
      instructions: 'Take in the morning with breakfast. NMDA receptor antagonist.',
      takenToday: false,
      prescribedBy: 'Dr. A. Sarma (Neurology, GMCH)',
    },
    {
      id: 'med_03',
      patientId,
      name: 'Vitamin B12 & Folate',
      dosage: '1500 mcg',
      timing: 'morning',
      instructions: 'Neuro-protective supplement.',
      takenToday: true,
      prescribedBy: 'Dr. P. Goswami (Geriatrics)',
    },
  ];
}

export function saveStoredMedications(patientId: string, meds: MedicationItem[]): void {
  try {
    localStorage.setItem(`${MEDICATIONS_KEY}_${patientId}`, JSON.stringify(meds));
    window.dispatchEvent(new CustomEvent('smriti_medications_updated', { detail: { patientId, meds } }));
  } catch (e) {
    console.error('Failed to save medications:', e);
  }
}

export function addStoredMedication(
  patientId: string, 
  item: Omit<MedicationItem, 'id' | 'patientId'>
): MedicationItem {
  const current = getStoredMedications(patientId);
  const newMed: MedicationItem = {
    ...item,
    id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    patientId,
  };
  const updated = [newMed, ...current];
  saveStoredMedications(patientId, updated);
  return newMed;
}

export function updateStoredMedication(patientId: string, updatedMed: MedicationItem): void {
  const current = getStoredMedications(patientId);
  const updated = current.map(m => m.id === updatedMed.id ? updatedMed : m);
  saveStoredMedications(patientId, updated);
}

export function deleteStoredMedication(patientId: string, medId: string): void {
  const current = getStoredMedications(patientId);
  const updated = current.filter(m => m.id !== medId);
  saveStoredMedications(patientId, updated);
}

export function getStoredRoutine(patientId: string): DailyRoutineItem[] {
  try {
    const raw = localStorage.getItem(`${ROUTINE_KEY}_${patientId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Circadian-aligned daily routine for dementia care
  return [
    {
      id: 'rout_01',
      patientId,
      time: '07:30 AM',
      activity: 'Morning Verandah Sunlight (Circadian clock sync)',
      category: 'exercise',
      completed: true,
    },
    {
      id: 'rout_02',
      patientId,
      time: '09:30 AM',
      activity: 'SmritiNER Daily Cognitive Therapy (Day 1 Workout)',
      category: 'cognitive',
      completed: true,
    },
    {
      id: 'rout_03',
      patientId,
      time: '01:00 PM',
      activity: 'Warm Traditional Lunch with Family',
      category: 'meal',
      completed: true,
    },
    {
      id: 'rout_04',
      patientId,
      time: '04:30 PM',
      activity: 'Calm Folk Music / Evening Tea (Sundowning prevention)',
      category: 'social',
      completed: false,
    },
    {
      id: 'rout_05',
      patientId,
      time: '09:00 PM',
      activity: 'Bedtime Medication & Lights Dimming',
      category: 'rest',
      completed: false,
    },
  ];
}

export function saveStoredRoutine(patientId: string, routine: DailyRoutineItem[]): void {
  try {
    localStorage.setItem(`${ROUTINE_KEY}_${patientId}`, JSON.stringify(routine));
    window.dispatchEvent(new CustomEvent('smriti_routine_updated', { detail: { patientId, routine } }));
  } catch (e) {
    console.error('Failed to save routine:', e);
  }
}

export function addStoredRoutine(
  patientId: string,
  item: Omit<DailyRoutineItem, 'id' | 'patientId'>
): DailyRoutineItem {
  const current = getStoredRoutine(patientId);
  const newRoutine: DailyRoutineItem = {
    ...item,
    id: `rout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    patientId,
  };
  const updated = [...current, newRoutine];
  saveStoredRoutine(patientId, updated);
  return newRoutine;
}

export function updateStoredRoutine(patientId: string, updatedRoutine: DailyRoutineItem): void {
  const current = getStoredRoutine(patientId);
  const updated = current.map(r => r.id === updatedRoutine.id ? updatedRoutine : r);
  saveStoredRoutine(patientId, updated);
}

export function deleteStoredRoutine(patientId: string, routineId: string): void {
  const current = getStoredRoutine(patientId);
  const updated = current.filter(r => r.id !== routineId);
  saveStoredRoutine(patientId, updated);
}

// ─── MEDICAL REPORTS STORAGE ───────────────────────────────────────────────────

export function getStoredReports(patientId: string): MedicalReportItem[] {
  try {
    const raw = localStorage.getItem(`${REPORTS_KEY}_${patientId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [
    {
      id: 'rep_01',
      name: 'MMSE_Assessment_August.pdf',
      uploadDate: 'Aug 15, 2024',
      sizeBytes: 245000,
    }
  ];
}

export function saveStoredReports(patientId: string, reports: MedicalReportItem[]): void {
  try {
    localStorage.setItem(`${REPORTS_KEY}_${patientId}`, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('smriti_reports_updated', { detail: { patientId, reports } }));
  } catch (e) {
    console.error('Failed to save medical reports:', e);
  }
}

export function addStoredReport(
  patientId: string, 
  report: Omit<MedicalReportItem, 'id'>
): MedicalReportItem {
  const current = getStoredReports(patientId);
  const newReport: MedicalReportItem = {
    ...report,
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  const updated = [newReport, ...current];
  saveStoredReports(patientId, updated);
  return newReport;
}

export function deleteStoredReport(patientId: string, reportId: string): void {
  const current = getStoredReports(patientId);
  const updated = current.filter(r => r.id !== reportId);
  saveStoredReports(patientId, updated);
}
