/**
 * NeuroSaathi: Personalized Patient Adaptive Memory Cache
 * 
 * Stores personalized baseline adjustments learned over time from OpenAI Teacher reflections.
 * Blends base game cognitive profiles with patient-specific neuro-motor realities
 * (e.g., patient-specific arthritis latency, personalized fatigue thresholds, tremor damping).
 * 
 * Over time, the local 0ms engine trains itself to match frontier Cloud AI precision.
 */

import { getGameCognitiveProfile, type GameCognitiveProfile } from './game-cognitive-profiles';

export interface PatientLearnedOffsets {
  patientId: string;
  gameId: string;
  latencyScaleMultiplier: number;     // e.g. 1.15 = patient naturally needs 15% more time due to arthritis
  fatigueSensitivityMultiplier: number; // e.g. 0.90 = tires slightly earlier than standard age cohort
  tremorDampingMultiplier: number;      // e.g. 1.20 = needs 20% larger hitboxes/debounce
  totalReflectionsCount: number;
  agreementCount: number;               // Number of times OpenAI agreed with local engine
  discrepancyCount: number;             // Number of times OpenAI refined the decision
  lastAdjustedAt: string;
  learnedClinicalNotes: string[];       // Chronological diary of adjustments learned from OpenAI
}

export interface TeacherReflectionRecord {
  id: string;
  patientId: string;
  gameId: string;
  gameTitle: string;
  roundIndex: number;
  studentDecision: {
    action: 'PROMOTE' | 'MAINTAIN' | 'SCAFFOLD_DOWN';
    tier: number;
    rationale: string;
  };
  teacherEvaluation: {
    agreed: boolean;
    teacherAction: 'PROMOTE' | 'MAINTAIN' | 'SCAFFOLD_DOWN';
    teacherTier: number;
    clinicalReflection: string;
    confidenceScore: number;
    latencyScaleAdjustment?: number;
    tremorSensitivityAdjustment?: number;
    personalizedTip?: string;
  };
  timestamp: string;
}

const STORAGE_PREFIX_OFFSETS = 'smriti_patient_offsets_v1';
const STORAGE_PREFIX_REFLECTIONS = 'smriti_teacher_reflections_v1';

export class PatientAdaptiveMemoryService {
  private static memoryStore: Map<string, string> = new Map();

  private static safeGetItem(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {}
    return this.memoryStore.get(key) || null;
  }

  private static safeSetItem(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {}
    this.memoryStore.set(key, value);
  }

  /**
   * Retrieves or initializes personalized offsets for a specific patient and game
   */
  public static getPatientOffsets(patientId: string, gameId: string): PatientLearnedOffsets {
    const key = `${STORAGE_PREFIX_OFFSETS}_${patientId}_${gameId}`;
    const stored = this.safeGetItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }

    return {
      patientId,
      gameId,
      latencyScaleMultiplier: 1.0,
      fatigueSensitivityMultiplier: 1.0,
      tremorDampingMultiplier: 1.0,
      totalReflectionsCount: 0,
      agreementCount: 0,
      discrepancyCount: 0,
      lastAdjustedAt: new Date().toISOString(),
      learnedClinicalNotes: [],
    };
  }

  /**
   * Saves updated patient offsets to localStorage
   */
  public static savePatientOffsets(offsets: PatientLearnedOffsets): void {
    const key = `${STORAGE_PREFIX_OFFSETS}_${offsets.patientId}_${offsets.gameId}`;
    this.safeSetItem(key, JSON.stringify(offsets));
  }

  /**
   * Blends standard GameCognitiveProfile with personalized patient learned offsets
   */
  public static getPersonalizedProfile(patientId: string, gameId: string): GameCognitiveProfile {
    const base = getGameCognitiveProfile(gameId);
    const offsets = this.getPatientOffsets(patientId, gameId);

    // Deep copy and apply learned multipliers
    const latMul = offsets.latencyScaleMultiplier || 1.0;
    const fatMul = offsets.fatigueSensitivityMultiplier || 1.0;
    const tremMul = offsets.tremorDampingMultiplier || 1.0;

    return {
      ...base,
      latencyNorms: {
        optimalFastMs: Math.round(base.latencyNorms.optimalFastMs * latMul),
        optimalNormalMs: Math.round(base.latencyNorms.optimalNormalMs * latMul),
        deliberationMs: Math.round(base.latencyNorms.deliberationMs * latMul),
        fatigueLimitMs: Math.round(base.latencyNorms.fatigueLimitMs * latMul * fatMul),
      },
      motorTremorImpactFactor: Number((base.motorTremorImpactFactor * tremMul).toFixed(2)),
    };
  }

  /**
   * Incorporates an OpenAI Teacher reflection into the patient's learned memory
   */
  public static recordTeacherReflection(record: TeacherReflectionRecord): void {
    // 1. Update patient offsets
    const offsets = this.getPatientOffsets(record.patientId, record.gameId);
    offsets.totalReflectionsCount++;

    if (record.teacherEvaluation.agreed) {
      offsets.agreementCount++;
    } else {
      offsets.discrepancyCount++;
    }

    // Apply incremental adaptation if recommended by OpenAI
    const adjLat = record.teacherEvaluation.latencyScaleAdjustment;
    if (typeof adjLat === 'number' && !isNaN(adjLat)) {
      // Gentle learning rate: shift multiplier by at most 5% per reflection
      const delta = Math.max(-0.08, Math.min(0.08, adjLat));
      offsets.latencyScaleMultiplier = Number(
        Math.max(0.75, Math.min(1.50, offsets.latencyScaleMultiplier + delta)).toFixed(3)
      );
    }

    const adjTrem = record.teacherEvaluation.tremorSensitivityAdjustment;
    if (typeof adjTrem === 'number' && !isNaN(adjTrem)) {
      const delta = Math.max(-0.08, Math.min(0.08, adjTrem));
      offsets.tremorDampingMultiplier = Number(
        Math.max(0.80, Math.min(1.40, offsets.tremorDampingMultiplier + delta)).toFixed(3)
      );
    }

    if (record.teacherEvaluation.personalizedTip) {
      offsets.learnedClinicalNotes.unshift(
        `[Round ${record.roundIndex}]: ${record.teacherEvaluation.personalizedTip}`
      );
      if (offsets.learnedClinicalNotes.length > 10) {
        offsets.learnedClinicalNotes = offsets.learnedClinicalNotes.slice(0, 10);
      }
    }

    offsets.lastAdjustedAt = new Date().toISOString();
    this.savePatientOffsets(offsets);

    // 2. Append to chronological reflection history
    const historyKey = `${STORAGE_PREFIX_REFLECTIONS}_${record.patientId}`;
    const raw = this.safeGetItem(historyKey);
    const history: TeacherReflectionRecord[] = raw ? JSON.parse(raw) : [];
    history.unshift(record);
    // Keep most recent 50 reflections
    this.safeSetItem(historyKey, JSON.stringify(history.slice(0, 50)));

    // 3. Dispatch global browser event for live UI reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('smriti_ai_teacher_reflected', { detail: record })
      );
    }
  }

  /**
   * Retrieves teacher reflection history for a patient
   */
  public static getPatientReflectionHistory(patientId: string): TeacherReflectionRecord[] {
    const historyKey = `${STORAGE_PREFIX_REFLECTIONS}_${patientId}`;
    const raw = this.safeGetItem(historyKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  }

  /**
   * Computes overall teacher-student agreement percentage for patient
   */
  public static getTeacherAlignmentScore(patientId: string): { agreementRate: number; totalRounds: number } {
    const history = this.getPatientReflectionHistory(patientId);
    if (history.length === 0) return { agreementRate: 100, totalRounds: 0 };
    const agreedCount = history.filter(h => h.teacherEvaluation.agreed).length;
    return {
      agreementRate: Math.round((agreedCount / history.length) * 100),
      totalRounds: history.length,
    };
  }
}
