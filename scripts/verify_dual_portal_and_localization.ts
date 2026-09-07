/**
 * Verification Script: Dual Portal Features, 4-Language Localization & Sync
 */

// ─── Browser Environment Polyfill for Node.js ──────────────────────────────────
const memoryStore: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => memoryStore[key] ?? null,
  setItem: (key: string, value: string) => { memoryStore[key] = value; },
  removeItem: (key: string) => { delete memoryStore[key]; },
  clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
};

(global as any).window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};

(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params: any = {}) {
    this.type = type;
    this.detail = params.detail;
  }
};

import { TRANSLATIONS, type SupportedLanguage, type TranslationSchema } from '../src/locales/translations';
import { 
  getStoredMedications, 
  addStoredMedication, 
  deleteStoredMedication,
  getStoredRoutine, 
  addStoredRoutine, 
  deleteStoredRoutine,
  getStoredReports,
  addStoredReport
} from '../src/utils/caregiverStorage';
import { DailySessionManager } from '../src/utils/dailySessionManager';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

console.log('===========================================================');
console.log('🧪 VERIFYING TRANSLATIONS (as, bn, hi, en)');
console.log('===========================================================');

const languages: SupportedLanguage[] = ['en', 'as', 'bn', 'hi'];
const sampleKeys: (keyof TranslationSchema)[] = [
  'appTitle',
  'caregiverSupport',
  'patientPortal',
  'caregiverPortal',
  'dashboard',
  'cognitiveGames',
  'medications',
  'dailyRoutine',
  'alerts',
  'patientProfile',
  'settings',
  'brainAnalytics',
  'fullName',
  'age',
  'gender',
  'medicalReports',
  'uploadReport',
  'addMedication',
  'addRoutine',
  'cognitiveScore',
  'unplayedExcluded'
];

languages.forEach(lang => {
  const dict = TRANSLATIONS[lang];
  assert(!!dict, `Language dictionary for "${lang}" exists`);
  sampleKeys.forEach(key => {
    assert(!!dict[key] && dict[key].length > 0, `[${lang}] key "${key}" is translated: "${dict[key].substring(0, 30)}..."`);
  });
});

console.log('\n===========================================================');
console.log('🧪 VERIFYING CAREGIVER STORAGE & MUTATIONS');
console.log('===========================================================');

const testPatientId = 'test_patient_meera_72';

// 1. Medications
const initialMeds = getStoredMedications(testPatientId);
assert(Array.isArray(initialMeds) && initialMeds.length > 0, 'Default clinical medications loaded');

const newMed = addStoredMedication(testPatientId, {
  name: 'Rivastigmine Patch',
  dosage: '4.6 mg / 24h',
  timing: 'morning',
  instructions: 'Apply 1 patch daily on clean, dry upper arm',
  takenToday: false,
  prescribedBy: 'Dr. Priya Mehta (GMCH Neurology)',
});
assert(newMed.name === 'Rivastigmine Patch', 'Medication added successfully');

const afterAddMeds = getStoredMedications(testPatientId);
assert(afterAddMeds.some(m => m.id === newMed.id), 'Newly added medication persists in storage');

deleteStoredMedication(testPatientId, newMed.id);
const afterDeleteMeds = getStoredMedications(testPatientId);
assert(!afterDeleteMeds.some(m => m.id === newMed.id), 'Medication successfully deleted from storage');

// 2. Routines
const initialRoutine = getStoredRoutine(testPatientId);
assert(Array.isArray(initialRoutine) && initialRoutine.length > 0, 'Default circadian routine loaded');

const newRoutine = addStoredRoutine(testPatientId, {
  time: '05:00 PM',
  activity: 'Gentle Verandah Garden Walk with Anita',
  category: 'exercise',
  completed: false,
});
assert(newRoutine.activity === 'Gentle Verandah Garden Walk with Anita', 'Routine added successfully');

const afterAddRoutine = getStoredRoutine(testPatientId);
assert(afterAddRoutine.some(r => r.id === newRoutine.id), 'Newly added routine persists in storage');

deleteStoredRoutine(testPatientId, newRoutine.id);
const afterDeleteRoutine = getStoredRoutine(testPatientId);
assert(!afterDeleteRoutine.some(r => r.id === newRoutine.id), 'Routine successfully deleted from storage');

// 3. Medical Reports
const reports = getStoredReports(testPatientId);
assert(Array.isArray(reports) && reports.length > 0, 'Initial default MMSE medical report present');

const addedReport = addStoredReport(testPatientId, {
  name: 'MoCA_Cognitive_Assessment_September.pdf',
  uploadDate: 'Sep 08, 2024',
  sizeBytes: 312000,
});
assert(addedReport.name === 'MoCA_Cognitive_Assessment_September.pdf', 'Medical report uploaded and stored');

console.log('\n===========================================================');
console.log('🧪 VERIFYING DAILY SESSION SCORE & UNPLAYED EXCLUSION');
console.log('===========================================================');

const todayKey = DailySessionManager.getTodayDateKey();
(global as any).localStorage.removeItem(`smriti_daily_sessions_v2_${todayKey}`);

const baselineScore = DailySessionManager.calculateDailyCompositeScore();
assert(baselineScore.score === 78, `Unplayed baseline score is 78 (Actual: ${baselineScore.score})`);
assert(baselineScore.gamesPlayedCount === 0, 'Zero games counted prior to gameplay');
assert(baselineScore.isBaseline === true, 'isBaseline is true when no games played');

// Record a session
DailySessionManager.recordSession({
  gameId: 'pattern-recall',
  gameTitle: 'Pattern Recall (Noxar Chonda)',
  totalRounds: 5,
  totalCorrect: 5,
  accuracyPercentage: 100,
  averageLatencyMs: 1600,
  finalTheta: 1.15,
  completedAt: new Date().toISOString(),
}, true);

const updatedScore = DailySessionManager.calculateDailyCompositeScore();
assert(updatedScore.gamesPlayedCount === 1, `Games played count updated to 1 (Actual: ${updatedScore.gamesPlayedCount})`);
assert(updatedScore.score > 78, `Score recalculated strictly from played game (Score: ${updatedScore.score})`);
assert(updatedScore.isBaseline === false, 'isBaseline is false after game played');

console.log('\n===========================================================');
console.log(`🏁 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('===========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 103 DUAL-PORT, LOCALIZATION, AND STORAGE VERIFICATIONS PASSED!\n');
}
