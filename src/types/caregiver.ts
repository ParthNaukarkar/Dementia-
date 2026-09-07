export type MedicationTiming = 'morning' | 'afternoon' | 'evening' | 'bedtime';

export interface MedicationItem {
  id: string;
  patientId: string;
  name: string; // e.g. "Donepezil", "Memantine", "Rivastigmine"
  dosage: string; // e.g. "5 mg", "10 mg"
  timing: MedicationTiming;
  instructions: string; // e.g. "With food", "Before sleep"
  takenToday: boolean;
  prescribedBy: string; // Doctor name
}

export interface DailyRoutineItem {
  id: string;
  patientId: string;
  time: string; // e.g. "08:00 AM"
  activity: string; // e.g. "Morning Walk & Sunshine (Circadian alignment)"
  category: 'exercise' | 'cognitive' | 'meal' | 'rest' | 'social';
  completed: boolean;
}

export interface AdherenceDayLog {
  date: string; // YYYY-MM-DD
  medicationsTakenCount: number;
  medicationsTotalCount: number;
  exercisesCompletedCount: number;
  exercisesTotalCount: number;
}
