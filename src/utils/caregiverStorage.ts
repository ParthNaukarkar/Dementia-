import type { MedicationItem, DailyRoutineItem } from '../types/caregiver';

const MEDICATIONS_KEY = 'smriti_patient_medications_v1';
const ROUTINE_KEY = 'smriti_patient_routine_v1';

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
  } catch (e) {
    console.error('Failed to save medications:', e);
  }
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
  } catch (e) {
    console.error('Failed to save routine:', e);
  }
}
