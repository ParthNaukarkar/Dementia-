/**
 * Comparative Audit: Hardcoded If/Else vs OpenAI LLM vs Game-Aware Continuous Engine
 * 
 * Demonstrates why the generic hardcoded thresholds (accuracy >= 78, latency < 3200ms)
 * fail catastrophically on games like Jigsaw Puzzle, Brain Story, and motor tremor cases,
 * and compares it side-by-side with OpenAI's reasoning.
 */

import { AIGameCalibratorService, type GameCalibrationInput } from '../src/services/ai-game-calibrator';

// Real clinical test cases across heterogeneous cognitive games
const TEST_CASES: (GameCalibrationInput & { scenarioName: string; clinicalTruth: string })[] = [
  {
    scenarioName: '1. JIGSAW PUZZLE: High-Performing Senior (9-piece spatial assembly)',
    clinicalTruth: 'Clinical Truth: Taking 28s to assemble a 9-piece puzzle with 100% accuracy is exceptional for a 75yo senior. Should be PROMOTED or MAINTAINED, NEVER demoted.',
    gameId: 'jigsaw-puzzle',
    gameTitle: 'Jigsaw Praxis',
    roundIndex: 2,
    totalRounds: 3,
    currentTier: 4,
    maxTiers: 9,
    accuracyPercentage: 100,
    averageLatencyMs: 28000, // 28 seconds
    perseverationErrors: 0,
    tremorJitterIndex: 0.12,
    autonomyScore: 100,
    wasAutoAssisted: false,
    totalTrialsOrFlips: 9,
    patientAge: 75,
    diagnosisStage: 'Mild Cognitive Impairment (Early)',
  },
  {
    scenarioName: '2. BRAIN STORY: Thoughtful Narrative Recall (Paragraph comprehension)',
    clinicalTruth: 'Clinical Truth: Senior read paragraph and answered in 7.2s with 100% accuracy. 7.2s is standard reading/comprehension speed. Should be PROMOTED.',
    gameId: 'brain-story',
    gameTitle: 'Brain Story',
    roundIndex: 1,
    totalRounds: 3,
    currentTier: 3,
    maxTiers: 9,
    accuracyPercentage: 100,
    averageLatencyMs: 7200, // 7.2 seconds
    perseverationErrors: 0,
    tremorJitterIndex: 0.08,
    autonomyScore: 95,
    totalTrialsOrFlips: 4,
    patientAge: 78,
    diagnosisStage: 'Subjective Cognitive Decline',
  },
  {
    scenarioName: '3. PARKINSONIAN SENIOR: Sharp Mind, Severe Hand Tremor in Memory Match',
    clinicalTruth: 'Clinical Truth: Patient has zero memory errors (100% recall), but takes 4.5s per flip due to resting motor tremor (jitter 0.62). Should NOT be penalized for motor slowing; needs touch stabilization, NOT cognitive demotion.',
    gameId: 'memory-match',
    gameTitle: 'Memory Match',
    roundIndex: 2,
    totalRounds: 3,
    currentTier: 3,
    maxTiers: 8,
    accuracyPercentage: 100,
    averageLatencyMs: 4500, // 4.5s per flip
    perseverationErrors: 0,
    tremorJitterIndex: 0.62, // High physical tremor
    autonomyScore: 90,
    totalTrialsOrFlips: 6,
    patientAge: 72,
    diagnosisStage: 'Parkinsons Basal Ganglia Subtype',
  },
  {
    scenarioName: '4. FRONTAL MCI: Impulsive Fast Guessing in Sequence Recall',
    clinicalTruth: 'Clinical Truth: Senior rapidly mashes buttons in 1.4s (super fast!), but has 35% accuracy and 4 perseveration errors. Needs impulse-inhibition scaffolding and slower sequence pacing, NOT praise for fast latency.',
    gameId: 'sequence-recall',
    gameTitle: 'Sequence Recall',
    roundIndex: 2,
    totalRounds: 3,
    currentTier: 4,
    maxTiers: 7,
    accuracyPercentage: 35,
    averageLatencyMs: 1400, // Very fast impulsive mashing
    perseverationErrors: 4,
    tremorJitterIndex: 0.15,
    autonomyScore: 40,
    totalTrialsOrFlips: 4,
    patientAge: 76,
    diagnosisStage: 'Frontal Dysexecutive MCI',
  },
];

async function runComparison() {
  const apiKey = process.env.OPENAI_API_KEY || process.argv[2] || '';

  console.log('='.repeat(80));
  console.log('🔬 NEUROSAATHI: HARDCODED IF/ELSE vs OPENAI LLM CALIBRATION AUDIT');
  console.log('='.repeat(80));
  console.log(`OpenAI API Key: ${apiKey ? `Present (${apiKey.slice(0, 7)}...)` : 'Not supplied in CLI / env'}\n`);

  for (const testCase of TEST_CASES) {
    console.log('-'.repeat(80));
    console.log(`📌 CASE: ${testCase.scenarioName}`);
    console.log(`   ${testCase.clinicalTruth}`);
    console.log(`   Telemetry: Game=${testCase.gameTitle} | Accuracy=${testCase.accuracyPercentage}% | Latency=${testCase.averageLatencyMs}ms | Tremor=${testCase.tremorJitterIndex} | Perseverations=${testCase.perseverationErrors}`);
    console.log('');

    // 1. Current Hardcoded Fallback Execution
    const fallback = AIGameCalibratorService.calculateDeterministicFallback(testCase);
    console.log('   🔴 CURRENT HARDCODED IF/ELSE DECISION:');
    console.log(`      • Action: ${fallback.action}`);
    console.log(`      • Recommended Tier: Tier ${fallback.recommendedTier} (Delta: ${fallback.tierDelta})`);
    console.log(`      • Cognitive Load: ${fallback.cognitiveLoad}`);
    console.log(`      • Scaffolding Arm: ${fallback.scaffoldingArm}`);
    console.log(`      • Rationale: "${fallback.clinicalRationale}"`);

    // Flag hardcoded clinical defect
    if (testCase.gameId === 'jigsaw-puzzle' && fallback.action === 'SCAFFOLD_DOWN') {
      console.log('      ⚠️ FATAL HARDCODED FLAW DETECTED: Hardcoded engine demoted 100% accurate senior in Jigsaw because 28s > 5500ms!');
    }
    if (testCase.gameId === 'brain-story' && fallback.action === 'SCAFFOLD_DOWN') {
      console.log('      ⚠️ FATAL HARDCODED FLAW DETECTED: Hardcoded engine demoted 100% accurate senior in Brain Story because reading 7.2s > 5500ms!');
    }

    // 2. OpenAI GPT Execution (if key available)
    if (apiKey) {
      try {
        console.log('\n   🟢 LIVE OPENAI GPT-4o-MINI DECISION:');
        const startMs = Date.now();
        const aiResult = await AIGameCalibratorService.calibrateRound(testCase, {
          apiKey,
          provider: 'openai',
          model: 'gpt-4o-mini',
          enabled: true,
        });
        const elapsedMs = Date.now() - startMs;
        console.log(`      • Action: ${aiResult.action} (Latency: ${elapsedMs}ms)`);
        console.log(`      • Recommended Tier: Tier ${aiResult.recommendedTier} (Delta: ${aiResult.tierDelta})`);
        console.log(`      • Cognitive Load: ${aiResult.cognitiveLoad}`);
        console.log(`      • Scaffolding Arm: ${aiResult.scaffoldingArm}`);
        console.log(`      • AI Rationale: "${aiResult.clinicalRationale}"`);
      } catch (err: any) {
        console.log(`      ❌ OpenAI API Error: ${err.message}`);
      }
    } else {
      console.log('\n   ⚪ OPENAI COMPARISON: (Provide your OpenAI key as argument or in .env to run live query)');
    }

    console.log('');
  }

  console.log('='.repeat(80));
  console.log('SUMMARY & ARCHITECTURAL VERDICT');
  console.log('='.repeat(80));
}

runComparison();
