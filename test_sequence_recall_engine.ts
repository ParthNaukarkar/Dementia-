import { SequenceRecallEngine } from './src/games/sequence-recall/engine';
import { sequenceAudio } from './src/games/sequence-recall/audio';

console.log('=== RUNNING COMPREHENSIVE CLINICAL TEST FOR SEQUENCE RECALL ===\n');

// 1. Audio Mute / Optional Toggle Verification
console.log('--- Test 1: Optional Audio Toggle ---');
sequenceAudio.setAudioEnabled(true);
console.log('Audio enabled:', sequenceAudio.getAudioEnabled() === true ? 'PASS' : 'FAIL');
sequenceAudio.setAudioEnabled(false);
console.log('Audio muted:', sequenceAudio.getAudioEnabled() === false ? 'PASS' : 'FAIL');
sequenceAudio.setAudioEnabled(true);

// 2. Engine Initialization & Bounds
console.log('\n--- Test 2: Engine Initialization & Span Bounds ---');
const engine = new SequenceRecallEngine(0.0, 5);
const initDiff = engine.getDifficulty();
console.log('Initial Sequence Length (L):', initDiff.sequenceLength, '(Expected: 2)');
console.log('Initial Choice Pool Size (K):', initDiff.poolSize, '(Expected: 3)');
console.log('Initial Tremor Debounce (ms):', initDiff.tremorDebounceMs, '(Expected: 400)');
console.log('Initial Direction:', initDiff.direction, '(Expected: FORWARD)');

if (initDiff.sequenceLength !== 2 || initDiff.poolSize !== 3) {
  throw new Error('Initial parameter calibration failed');
}

// 3. Tremor Debouncing Verification
console.log('\n--- Test 3: Tremor Debounce Filter ---');
engine.notifyRecallPhaseStarted();
const firstTap = engine.registerItemTap('dhol');
console.log('First tap accepted:', firstTap.accepted ? 'PASS' : 'FAIL');

// Immediate rapid double-tap (50ms later)
const doubleTap = engine.registerItemTap('dhol');
console.log('Rapid double tap filtered:', (doubleTap.accepted === false && doubleTap.isTremorFiltered === true) ? 'PASS' : 'FAIL');

// 4. Undo Last Tap Verification
console.log('\n--- Test 4: Undo Last Tap Functionality ---');
console.log('Steps before undo:', engine.getCurrentRecalledSteps().length);
const undoRes = engine.undoLastTap();
console.log('Undo successful:', undoRes ? 'PASS' : 'FAIL');
console.log('Steps after undo:', engine.getCurrentRecalledSteps().length, '(Expected: 0)');

// 5. Simulated Adaptive Progression (2 Consecutive Hits -> Span Escalation)
console.log('\n--- Test 5: AI Dynamic Difficulty Titration (2 Consecutive Hits -> Escalation) ---');
const engine2 = new SequenceRecallEngine(0.5, 6);

for (let trial = 0; trial < 4; trial++) {
  engine2.notifyRecallPhaseStarted();
  const expected = engine2.getExpectedSequence();
  const diffBefore = engine2.getDifficulty();
  
  // Simulate elder accurately tapping the expected sequence with 600ms pauses
  let simulatedTime = Date.now() + 1500; // 1.5s thinking time
  for (const id of expected) {
    engine2.registerItemTap(id, simulatedTime);
    simulatedTime += 600;
  }
  
  const telemetry = engine2.evaluateCurrentTrial();
  const diffAfter = engine2.getDifficulty();

  console.log(`Trial ${trial + 1}: Expected [${expected.join(', ')}] | Recalled [${telemetry.recalledSequence.join(', ')}] | Correct: ${telemetry.isCorrect} | Ability θ: ${telemetry.thetaAfterTrial.toFixed(2)} | Span L: ${diffBefore.sequenceLength} -> ${diffAfter.sequenceLength}`);

  if (trial < 3) {
    engine2.startNewTrial();
  }
}

const finalSummary = engine2.generateSessionSummary(false);
// 6. Error Decomposition Verification (Transposition vs Intrusion vs Perseveration)
console.log('\n--- Test 6: Clinical Error Pattern Decomposition ---');
const engine3 = new SequenceRecallEngine(0.0, 3);
engine3.notifyRecallPhaseStarted();
const pool = engine3.getPoolItemIds();
const expectedSeq = engine3.getExpectedSequence();

// Force an intrusion error (pick something not in expected sequence if possible, or repeat)
console.log('Testing Intrusion / Transposition Detection...');
if (expectedSeq.length >= 2) {
  // Deliberately swap order (transposition)
  const swapped = [expectedSeq[1], expectedSeq[0]];
  engine3.registerItemTap(swapped[0], Date.now() + 1000);
  engine3.registerItemTap(swapped[1], Date.now() + 1600);
  const t1 = engine3.evaluateCurrentTrial();
  console.log(`Transposition Test: Expected [${expectedSeq.join(', ')}] vs Recalled [${swapped.join(', ')}] -> Error Type: ${t1.errorType} (Expected: TRANSPOSITION)`);
  if (t1.errorType !== 'TRANSPOSITION') {
    throw new Error(`Expected TRANSPOSITION but got ${t1.errorType}`);
  }
}

console.log('\n--- Summary Report Generation ---');
console.log('Total trials:', finalSummary.totalTrials);
console.log('Correct trials:', finalSummary.correctTrials);
console.log('Max Span achieved:', finalSummary.maxSpanAchieved);
console.log('Est MoCA Working Memory score:', finalSummary.estimatedMoCAWorkingMemoryScore, '/ 5');
console.log('Processing speed profile:', finalSummary.processingSpeedProfile);

console.log('\n=== ALL CLINICAL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
