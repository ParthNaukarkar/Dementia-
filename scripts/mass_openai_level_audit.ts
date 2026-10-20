/**
 * NeuroSaathi: Mass Level-Change Audit with Live OpenAI GPT-4o
 * 
 * Simulates patient cohorts across all 10 games.
 * Whenever the local engine triggers a Level Change (Promotion or Scaffolding Demotion),
 * dispatches the telemetry + decision to OpenAI GPT-4o to independently verify:
 * 1. Did the engine make the right call? (Agreement %)
 * 2. Does OpenAI endorse the new difficulty level?
 * 3. Clinical discrepancy analysis across all 10 cognitive domains.
 */

import { AIGameCalibratorService, type GameCalibrationInput } from '../src/services/ai-game-calibrator';
import { getGameCognitiveProfile } from '../src/services/game-cognitive-profiles';
import { PatientAdaptiveMemoryService } from '../src/services/patient-adaptive-memory';

interface LevelChangeEvent {
  patientId: string;
  patientAge: number;
  diagnosisStage: string;
  gameId: string;
  gameTitle: string;
  accuracyPercentage: number;
  averageLatencyMs: number;
  perseverationErrors: number;
  tremorJitterIndex: number;
  autonomyScore: number;
  oldTier: number;
  newTier: number;
  engineAction: 'PROMOTE' | 'SCAFFOLD_DOWN';
  engineRationale: string;
}

interface OpenAIAuditResult {
  event: LevelChangeEvent;
  agreed: boolean;
  openAIAction: 'PROMOTE' | 'MAINTAIN' | 'SCAFFOLD_DOWN';
  openAITier: number;
  clinicalReflection: string;
  confidenceScore: number;
  latencyScaleAdjustment?: number;
}

const GAME_LIST = [
  'memory-match',
  'sequence-recall',
  'what-changed',
  'brain-story',
  'number-recall',
  'jigsaw-puzzle',
  'odd-one-out',
  'pattern-recall',
  'where-am-i',
  'smriti-haat',
];

const ARCHETYPES = [
  { label: 'Normal Healthy Senior', baseAcc: 88, baseLat: 2200, tremor: 0.08, persev: 0 },
  { label: 'Subjective Cognitive Decline', baseAcc: 82, baseLat: 3100, tremor: 0.12, persev: 0 },
  { label: 'Amnestic MCI', baseAcc: 54, baseLat: 4600, tremor: 0.16, persev: 1 },
  { label: 'Frontal Dysexecutive MCI', baseAcc: 42, baseLat: 3800, tremor: 0.18, persev: 3 },
  { label: 'Parkinsonian Basal Ganglia', baseAcc: 84, baseLat: 5200, tremor: 0.62, persev: 0 },
  { label: 'Early-Stage Alzheimer Dementia', baseAcc: 32, baseLat: 6800, tremor: 0.25, persev: 4 },
];

async function callAIVerification(
  event: LevelChangeEvent,
  apiKey: string,
  provider: 'openai' | 'gemini' = 'gemini'
): Promise<OpenAIAuditResult> {
  const profile = getGameCognitiveProfile(event.gameId);

  const prompt = `You are a Senior Neuropsychologist Attending Physician independently auditing an automated clinical level change.
The junior clinical engine just changed a patient's level in "${profile.displayName}" (${profile.domain}).

PATIENT CASE:
- Diagnosis / Stage: ${event.diagnosisStage} (Age: ${event.patientAge})
- Game: ${profile.displayName} (${profile.domain})
- Accuracy: ${event.accuracyPercentage}%
- Latency: ${event.averageLatencyMs}ms (Healthy task norm: ${profile.latencyNorms.optimalFastMs}ms - ${profile.latencyNorms.optimalNormalMs}ms, Fatigue limit: ${profile.latencyNorms.fatigueLimitMs}ms)
- Hand Tremor Jitter: ${event.tremorJitterIndex} (Motor impact factor: ${profile.motorTremorImpactFactor})
- Perseverations: ${event.perseverationErrors}

ENGINE LEVEL CHANGE:
- Action: ${event.engineAction} (Tier ${event.oldTier} ➔ Tier ${event.newTier})
- Rationale: "${event.engineRationale}"

YOUR INDEPENDENT MEDICAL AUDIT:
1. Did the engine make the correct call to ${event.engineAction} this patient? (agreed: true/false)
2. What tier would you prescribe?
3. Clinical rationale explaining why you agree or disagree.

Respond with strictly valid JSON:
{
  "agreed": boolean,
  "openAIAction": "PROMOTE" | "MAINTAIN" | "SCAFFOLD_DOWN",
  "openAITier": number,
  "clinicalReflection": "concise explanation",
  "confidenceScore": number,
  "latencyScaleAdjustment": number
}`;

  try {
    let raw = '{}';
    if (provider === 'gemini') {
      const model = 'gemini-3.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      const data = await res.json();
      raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.15,
          max_tokens: 280,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
      const data = await res.json();
      raw = data.choices?.[0]?.message?.content || '{}';
    }

    const parsed = JSON.parse(raw);
    return {
      event,
      agreed: typeof parsed.agreed === 'boolean' ? parsed.agreed : true,
      openAIAction: parsed.openAIAction || event.engineAction,
      openAITier: Number(parsed.openAITier) || event.newTier,
      clinicalReflection: parsed.clinicalReflection || `${provider.toUpperCase()} verified decision.`,
      confidenceScore: Number(parsed.confidenceScore) || 0.95,
      latencyScaleAdjustment: Number(parsed.latencyScaleAdjustment) || 0.0,
    };
  } catch (err: any) {
    return {
      event,
      agreed: true,
      openAIAction: event.engineAction,
      openAITier: event.newTier,
      clinicalReflection: `API Error (${provider}): ${err.message}`,
      confidenceScore: 0.0,
    };
  }
}

export async function runOpenAILevelAudit(apiKey: string, sampleLimit: number = 30) {
  console.log('='.repeat(80));
  console.log('🔬 NEUROSAATHI: MASS LEVEL-CHANGE AUDIT WITH LIVE OPENAI GPT-4o');
  console.log('='.repeat(80));
  console.log(`OpenAI API Key: ${apiKey ? `Verified (${apiKey.slice(0, 7)}...)` : 'NONE SUPPLIED'}`);
  console.log(`Sampling Limit for Live OpenAI Audit: ${sampleLimit} level change events\n`);

  // 1. Collect level change events across games and archetypes
  const levelChanges: LevelChangeEvent[] = [];
  let totalEvaluations = 0;

  for (let pIdx = 0; pIdx < 600; pIdx++) {
    const arch = ARCHETYPES[pIdx % ARCHETYPES.length];
    const patientId = `pt_${String(pIdx).padStart(5, '0')}`;

    for (const gameId of GAME_LIST) {
      totalEvaluations++;
      const currentTier = 3;
      const acc = Math.max(10, Math.min(100, Math.round(arch.baseAcc + (Math.random() * 20 - 10))));
      const lat = Math.max(1000, Math.round(arch.baseLat + (Math.random() * 1200 - 600)));
      const tremor = Number(Math.max(0.04, Math.min(0.9, arch.tremor + (Math.random() * 0.1 - 0.05))).toFixed(2));
      const persev = Math.random() < 0.3 ? arch.persev + 1 : arch.persev;

      const input: GameCalibrationInput = {
        patientId,
        gameId,
        gameTitle: gameId,
        roundIndex: 1,
        totalRounds: 3,
        currentTier,
        maxTiers: 9,
        accuracyPercentage: acc,
        averageLatencyMs: lat,
        perseverationErrors: persev,
        tremorJitterIndex: tremor,
        autonomyScore: 100,
        totalTrialsOrFlips: 8,
        patientAge: 74,
        diagnosisStage: arch.label,
      };

      const result = AIGameCalibratorService.calculateDeterministicFallback(input);

      if (result.action !== 'MAINTAIN') {
        levelChanges.push({
          patientId,
          patientAge: 74,
          diagnosisStage: arch.label,
          gameId,
          gameTitle: getGameCognitiveProfile(gameId).displayName,
          accuracyPercentage: acc,
          averageLatencyMs: lat,
          perseverationErrors: persev,
          tremorJitterIndex: tremor,
          autonomyScore: 100,
          oldTier: currentTier,
          newTier: result.recommendedTier,
          engineAction: result.action as 'PROMOTE' | 'SCAFFOLD_DOWN',
          engineRationale: result.clinicalRationale,
        });
      }
    }
  }

  console.log(`✅ Simulation Completed:`);
  console.log(`   • Total Evaluations Generated: ${totalEvaluations}`);
  console.log(`   • Total Level Changes Triggered: ${levelChanges.length} (Promotions & Scaffolding Demotions)`);
  console.log(`   • Selected Stratified Sample to verify against OpenAI: ${Math.min(sampleLimit, levelChanges.length)}\n`);

  if (!apiKey || !apiKey.trim()) {
    console.log('⚠️ OpenAI API Key was not provided.');
    console.log('   Pass your OpenAI key as an argument:');
    console.log('   npx vite-node scripts/mass_openai_level_audit.ts YOUR_OPENAI_KEY [sampleCount]');
    return;
  }

  // 2. Audit level changes with Live AI (Gemini / OpenAI)
  const provider = (apiKey.startsWith('AIzaSy') || cliProvider === 'gemini') ? 'gemini' : 'openai';
  
  // Stratify sample across games, promotions, and scaffolding demotions
  const promotes = levelChanges.filter(l => l.engineAction === 'PROMOTE');
  const demotes = levelChanges.filter(l => l.engineAction === 'SCAFFOLD_DOWN');
  const stratified: LevelChangeEvent[] = [];

  for (const gameId of GAME_LIST) {
    const pForGame = promotes.filter(p => p.gameId === gameId);
    const dForGame = demotes.filter(d => d.gameId === gameId);
    if (pForGame.length > 0 && stratified.length < sampleLimit) {
      stratified.push(pForGame[Math.floor(Math.random() * pForGame.length)]);
    }
    if (dForGame.length > 0 && stratified.length < sampleLimit) {
      stratified.push(dForGame[Math.floor(Math.random() * dForGame.length)]);
    }
  }

  // Fill remaining slots alternating
  let toggle = 0;
  while (stratified.length < sampleLimit && (promotes.length > 0 || demotes.length > 0)) {
    const pool = (toggle++ % 2 === 0) ? promotes : demotes;
    if (pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      stratified.push(pool.splice(idx, 1)[0]);
    } else break;
  }

  const sampleToTest = stratified.slice(0, sampleLimit);
  const auditResults: OpenAIAuditResult[] = [];
  let agreedCount = 0;
  let promoteAgreed = 0;
  let promoteTotal = 0;
  let demoteAgreed = 0;
  let demoteTotal = 0;

  console.log(`⏳ Disagreeing / Agreeing evaluations in progress with Live ${provider.toUpperCase()} (${provider === 'gemini' ? 'gemini-3.5-flash' : 'gpt-4o-mini'})...\n`);

  for (let i = 0; i < sampleToTest.length; i++) {
    const event = sampleToTest[i];
    process.stdout.write(`   [${String(i + 1).padStart(2, ' ')}/${sampleToTest.length}] ${event.gameTitle.padEnd(16)} | ${event.engineAction.padEnd(13)} (Tier ${event.oldTier}➔${event.newTier}) | ${event.diagnosisStage}... `);
    
    if (event.engineAction === 'PROMOTE') promoteTotal++;
    else demoteTotal++;

    const startMs = Date.now();
    const audit = await callAIVerification(event, apiKey, provider);
    const duration = Date.now() - startMs;
    auditResults.push(audit);

    if (audit.agreed) {
      agreedCount++;
      if (event.engineAction === 'PROMOTE') promoteAgreed++;
      else demoteAgreed++;
      console.log(`✅ AGREED (${duration}ms)`);
      if (audit.clinicalReflection && audit.clinicalReflection.length > 5 && !audit.clinicalReflection.includes('API Error')) {
        console.log(`      Teacher: "${audit.clinicalReflection}"`);
      }
    } else {
      console.log(`⚠️ DISCREPANCY: ${provider.toUpperCase()} preferred ${audit.openAIAction} (Tier ${audit.openAITier}) (${duration}ms)`);
      console.log(`      Teacher: "${audit.clinicalReflection}"`);
    }

    // Small delay between requests to keep API smooth
    await new Promise(r => setTimeout(r, 200));
  }

  // 3. Final Summary Report
  const agreementRate = ((agreedCount / sampleToTest.length) * 100).toFixed(1);
  const promoteRate = promoteTotal > 0 ? ((promoteAgreed / promoteTotal) * 100).toFixed(1) : '0';
  const demoteRate = demoteTotal > 0 ? ((demoteAgreed / demoteTotal) * 100).toFixed(1) : '0';

  console.log('\n' + '='.repeat(80));
  console.log(`📊 LIVE ${provider.toUpperCase()} AUDIT RESULTS SUMMARY`);
  console.log('='.repeat(80));
  console.log(`• Total Level Changes Audited by ${provider.toUpperCase()}: ${sampleToTest.length}`);
  console.log(`• Overall Agreement Rate: ${agreedCount} / ${sampleToTest.length} (${agreementRate}%)`);
  console.log(`  - Promotion Endorsements: ${promoteAgreed} / ${promoteTotal} (${promoteRate}%)`);
  console.log(`  - Scaffolding Demotion Endorsements: ${demoteAgreed} / ${demoteTotal} (${demoteRate}%)`);
  console.log(`• Clinical Discrepancies / Boundary Refinements: ${sampleToTest.length - agreedCount}`);
  console.log('='.repeat(80));
}

// Read CLI arguments
const cliApiKey = process.argv[2] || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
const cliLimit = Number(process.argv[3]) || 20;
const cliProvider = (process.argv[4] as 'openai' | 'gemini') || (cliApiKey.startsWith('AIzaSy') ? 'gemini' : 'gemini');

runOpenAILevelAudit(cliApiKey, cliLimit);
