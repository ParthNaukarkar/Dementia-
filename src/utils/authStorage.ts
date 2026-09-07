import type { CaretakerUser, PatientProfile, UserRole } from '../types/auth';

const CARETAKER_KEY = 'smriti_caretaker_user_v1';
const PATIENTS_KEY = 'smriti_patients_list_v1';
const ACTIVE_PATIENT_KEY = 'smriti_active_patient_id_v1';
const USER_ROLE_KEY = 'smriti_current_user_role_v1';

export function getStoredCaretaker(): CaretakerUser | null {
  try {
    const raw = localStorage.getItem(CARETAKER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredCaretaker(user: CaretakerUser): void {
  try {
    localStorage.setItem(CARETAKER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save caretaker:', e);
  }
}

export function getStoredPatients(): PatientProfile[] {
  try {
    const raw = localStorage.getItem(PATIENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredPatient(patient: PatientProfile): void {
  try {
    const existing = getStoredPatients();
    const idx = existing.findIndex(p => p.id === patient.id);
    if (idx >= 0) {
      existing[idx] = patient;
    } else {
      existing.push(patient);
    }
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(existing));
    // Also set as active patient if none exists
    if (!getActivePatientId()) {
      setActivePatientId(patient.id);
    }
  } catch (e) {
    console.error('Failed to save patient profile:', e);
  }
}

export function getActivePatientId(): string | null {
  return localStorage.getItem(ACTIVE_PATIENT_KEY);
}

export function setActivePatientId(patientId: string): void {
  localStorage.setItem(ACTIVE_PATIENT_KEY, patientId);
}

export function getStoredRole(): UserRole {
  const role = localStorage.getItem(USER_ROLE_KEY);
  return role === 'caretaker' ? 'caretaker' : 'patient';
}

export function setStoredRole(role: UserRole): void {
  localStorage.setItem(USER_ROLE_KEY, role);
}

// Initial Default Demo Setup (matches exact clinical profile from screenshot)
export function ensureDemoProfiles(): { caretaker: CaretakerUser; patient: PatientProfile } {
  let caretaker = getStoredCaretaker();
  if (!caretaker || caretaker.name === 'Parth') {
    caretaker = {
      id: 'caretaker_anita_01',
      name: 'Anita Joshi',
      age: 44,
      email: 'anita.joshi@smritiner.in',
      createdAt: new Date().toISOString(),
    };
    saveStoredCaretaker(caretaker);
  }

  let patients = getStoredPatients();
  let patient = patients.find(p => p.name === 'Meera Joshi') || patients[0];
  if (!patient || patient.name.includes('Dadu')) {
    patient = {
      id: '1',
      caretakerId: caretaker.id,
      name: 'Meera Joshi',
      age: 72,
      gender: 'female',
      primaryLanguage: 'en',
      diagnosisStage: 'mild_cognitive_impairment',
      emergencyContact: '9876543210',
      relationshipToCaretaker: 'Mother',
      notes: 'Patient demonstrates intact procedural and semantic recognition memory when presented with familiar Northeast cultural stimuli. Motor tremor debouncing active at 400ms.',
      createdAt: new Date().toISOString(),
    };
    saveStoredPatient(patient);
    setActivePatientId(patient.id);
  }

  return { caretaker, patient };
}

const SESSION_REPORT_KEY = 'smriti_last_session_report_v1';

export function getStoredSessionReport(): any | null {
  try {
    const raw = localStorage.getItem(SESSION_REPORT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredSessionReport(report: any): void {
  try {
    localStorage.setItem(SESSION_REPORT_KEY, JSON.stringify(report));
  } catch (e) {
    console.error('Failed to save session report:', e);
  }
}
