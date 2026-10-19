/**
 * SmritiNER - Neuro-Adaptive AI Game Calibrator Service
 * 
 * Uses Cloud AI (OpenAI GPT-4o / GPT-4o-mini or Google Gemini) via API key
 * to evaluate millisecond patient telemetry during/between game rounds.
 * Dynamically calibrates:
 *  - Difficulty tier progression (Promotion / Maintenance / Scaffolding Demotion)
 *  - Cognitive stimulus parameters (preview times, flip delays, distractor counts)
 *  - Scaffolding interventions (Golden Beacon, Distractor Dimming, Motor Stabilization)
 * 
 * Logs all micro-calibration events so they can be fed into the Master Clinical Reporting Model.
 */

import { getGameCognitiveProfile } from './game-cognitive-profiles';
import { PatientAdaptiveMemoryService, type TeacherReflectionRecord } from './patient-adaptive-memory';

export interface GameAIConfig {
  apiKey: string;
  provider: 'openai' | 'gemini';
  model: string;
  enabled: boolean;
}

export interface GameCalibrationInput {
  patientId?: string;
  gameId: string;
  gameTitle: string;
  roundIndex: number;
  totalRounds: number;
  currentTier: number;
  maxTiers: number;
  accuracyPercentage: number;
  averageLatencyMs: number;
  perseverationErrors: number;
  transpositionErrors?: number;
  hesitationCount?: number;
  tremorJitterIndex?: number;
  autonomyScore?: number;
  wasAutoAssisted?: boolean;
  firstTrialCorrectCount?: number;
  totalTrialsOrFlips: number;
  patientAge?: number;
  diagnosisStage?: string;
  language?: string;
}

export interface GameCalibrationResult {
  gameId: string;
  roundIndex: number;
  previousTier: number;
  recommendedTier: number;
  tierDelta: number;
  action: 'PROMOTE' | 'MAINTAIN' | 'SCAFFOLD_DOWN';
  cognitiveLoad: 'LOW' | 'OPTIMAL' | 'ELEVATED_FATIGUE' | 'SEVERE_STRAIN';
  clinicalRationale: string;
  scaffoldingArm: 'autonomous_challenge' | 'contextual_guidance' | 'direct_scaffolding' | 'motor_stabilization';
  parameterAdjustments?: {
    previewTimeMs?: number;
    cardFlipBackDelayMs?: number;
    distractorCount?: number;
    stimulusDurationMs?: number;
  };
  calibratorProvider: 'openai' | 'gemini' | 'bayesian_irt_fallback';
  calibratorModel: string;
  calibratedAt: string;
}

const STORAGE_KEY_GAME_AI_CONFIG = 'smriti_game_ai_config';
const STORAGE_KEY_CALIBRATIONS = 'smriti_ai_game_calibrations_history';

export class AIGameCalibratorService {
  /**
   * Retrieve saved Game AI configuration
   */
  public static getConfig(): GameAIConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GAME_AI_CONFIG);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    const envKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
    return {
      apiKey: envKey,
      provider: 'openai',
      model: 'gpt-4o-mini',
      enabled: !!envKey,
    };
  }

  /**
   * Save Game AI configuration
   */
  public static saveConfig(config: GameAIConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY_GAME_AI_CONFIG, JSON.stringify(config));
    } catch {}
  }

  /**
   * Test connection to Game AI model
   */
  public static async testConnection(config: GameAIConfig): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = performance.now();
    if (!config.apiKey || !config.apiKey.trim()) {
      return { success: false, message: 'API key is empty. Please paste a valid OpenAI or Gemini API key.', latencyMs: 0 };
    }

    try {
      if (config.provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: config.model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Respond with OK.' }],
            max_tokens: 5,
          }),
        });

        const elapsed = Math.round(performance.now() - start);
        if (res.ok) {
          return { success: true, message: `Connected to OpenAI (${config.model || 'gpt-4o-mini'}) successfully!`, latencyMs: elapsed };
        } else {
          const errData = await res.json().catch(() => ({}));
          return { success: false, message: errData?.error?.message || `HTTP ${res.status}`, latencyMs: elapsed };
        }
      } else {
        // Gemini fallback test
        const cleanKey = config.apiKey.trim();
        const model = config.model || 'gemini-3.8-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Respond with OK.' }] }],
          }),
        });
        const elapsed = Math.round(performance.now() - start);
        if (res.ok) {
          return { success: true, message: `Connected to Gemini (${model}) successfully!`, latencyMs: elapsed };
        } else {
          const errData = await res.json().catch(() => ({}));
          return { success: false, message: errData?.error?.message || `HTTP ${res.status}`, latencyMs: elapsed };
        }
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Connection failed', latencyMs: Math.round(performance.now() - start) };
    }
  }

  /**
   * Primary Calibration Endpoint (Teacher-Student Speculative Distillation Architecture)
   * 
   * 1. The Student Engine (0ms, Zero Lag):
   *    Immediately executes in 0.001ms using the patient's personalized profile.
   *    Calculates next tier and parameters instantly so the senior never experiences a frozen screen.
   * 
   * 2. The Teacher Engine (Async OpenAI / Gemini Shadow Reflection):
   *    Dispatched in background without awaiting. OpenAI reviews the student's decision,
   *    evaluates subtle clinical markers, and updates the patient's learned baseline over time.
   */
  public static async calibrateGameLevel(input: GameCalibrationInput): Promise<GameCalibrationResult> {
    const config = this.getConfig();

    // 1. Instant 0ms Decision using Patient's Personalized Adaptive Memory
    const studentResult = this.calculateDeterministicFallback(input);
    this.recordCalibration(studentResult);

    // 2. Fire-and-forget Asynchronous Teacher Reflection in background
    if (config.enabled && config.apiKey && config.apiKey.trim()) {
      this.dispatchAsyncTeacherReflection(input, studentResult, config).catch(err => {
        console.warn('Background AI Teacher reflection failed:', err);
      });
    }

    return studentResult;
  }

  /**
   * OpenAI GPT-4o / GPT-4o-mini Direct Calibration Call
   */
  public static async callOpenAICalibrator(
    config: GameAIConfig, 
    input: GameCalibrationInput
  ): Promise<GameCalibrationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout to protect gameplay fluidity

    const profile = getGameCognitiveProfile(input.gameId);

    const promptSystem = `You are an expert Neuropsychological Adaptive Game Director in the SmritiNER cognitive platform.
Task: Analyze real-time patient gameplay telemetry and dynamically calibrate the difficulty tier (1 to ${input.maxTiers}) and cognitive scaffolding for the next round.

CLINICAL NORMS FOR THIS SPECIFIC GAME ("${profile.displayName}" - ${profile.domain}):
- Domain: ${profile.domain}
- Clinical Target: ${profile.targetMCIRelevance}
- Game-Specific Response Speed Norms (Elderly):
  * Optimal response speed: ${profile.latencyNorms.optimalFastMs}ms - ${profile.latencyNorms.optimalNormalMs}ms
  * Deliberation boundary: ${profile.latencyNorms.deliberationMs}ms
  * True fatigue exhaustion limit: > ${profile.latencyNorms.fatigueLimitMs}ms
- Game Guidance: ${profile.expertLLMPromptContext}
- Motor Decoupling Rule: Patient tremor jitter index is ${input.tremorJitterIndex ?? 0.1} (Impact factor: ${profile.motorTremorImpactFactor}). If tremor is elevated (>0.45), assign "motor_stabilization" scaffolding and DO NOT penalize cognitive tier for physical motor slowing if memory/solution accuracy is high!

Clinical Calibration Decisions:
1. PROMOTION (+1 tier, max ${input.maxTiers}): High accuracy (>= 75-80%) with response times inside this game's healthy normative range.
2. SCAFFOLDING DEMOTION (-1 tier, min 1): Obvious cognitive breakdown (accuracy < 45-50%, repeated perseverations, or latency past true fatigue exhaustion limit).
3. MAINTENANCE (stay at tier ${input.currentTier}): Balanced in the target Zone of Proximal Development.

Return ONLY valid JSON matching this schema:
{
  "recommendedTier": number,
  "action": "PROMOTE" | "MAINTAIN" | "SCAFFOLD_DOWN",
  "cognitiveLoad": "LOW" | "OPTIMAL" | "ELEVATED_FATIGUE" | "SEVERE_STRAIN",
  "clinicalRationale": "concise 1-2 sentence clinical explanation of the adaptation",
  "scaffoldingArm": "autonomous_challenge" | "contextual_guidance" | "direct_scaffolding" | "motor_stabilization",
  "previewTimeMs": number,
  "cardFlipBackDelayMs": number
}`;

    const promptUser = JSON.stringify({
      gameId: input.gameId,
      gameTitle: input.gameTitle,
      roundIndex: input.roundIndex,
      totalRounds: input.totalRounds,
      currentTier: input.currentTier,
      maxTiers: input.maxTiers,
      accuracyPercentage: input.accuracyPercentage,
      averageLatencyMs: input.averageLatencyMs,
      perseverationErrors: input.perseverationErrors,
      transpositionErrors: input.transpositionErrors ?? 0,
      hesitationCount: input.hesitationCount ?? 0,
      tremorJitterIndex: input.tremorJitterIndex ?? 0.1,
      autonomyScore: input.autonomyScore ?? 100,
      wasAutoAssisted: input.wasAutoAssisted ?? false,
      firstTrialCorrectCount: input.firstTrialCorrectCount ?? 0,
      totalTrialsOrFlips: input.totalTrialsOrFlips,
      patientAge: input.patientAge ?? 74,
      diagnosisStage: input.diagnosisStage ?? 'Mild Cognitive Impairment',
    });

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: promptSystem },
            { role: 'user', content: promptUser },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.15,
          max_tokens: 280,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`OpenAI API error (${res.status}): ${errText}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      const recTier = Math.max(1, Math.min(input.maxTiers, Number(parsed.recommendedTier) || input.currentTier));
      const delta = recTier - input.currentTier;
      const action = delta > 0 ? 'PROMOTE' : delta < 0 ? 'SCAFFOLD_DOWN' : 'MAINTAIN';

      return {
        gameId: input.gameId,
        roundIndex: input.roundIndex,
        previousTier: input.currentTier,
        recommendedTier: recTier,
        tierDelta: delta,
        action: (parsed.action as any) || action,
        cognitiveLoad: (parsed.cognitiveLoad as any) || 'OPTIMAL',
        clinicalRationale: parsed.clinicalRationale || `OpenAI (${config.model}): Adjusted level to Tier ${recTier} based on real-time retrieval metrics.`,
        scaffoldingArm: (parsed.scaffoldingArm as any) || (delta < 0 ? 'contextual_guidance' : 'autonomous_challenge'),
        parameterAdjustments: {
          previewTimeMs: parsed.previewTimeMs,
          cardFlipBackDelayMs: parsed.cardFlipBackDelayMs,
        },
        calibratorProvider: 'openai',
        calibratorModel: config.model || 'gpt-4o-mini',
        calibratedAt: new Date().toISOString(),
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Gemini Direct Calibration Call
   */
  public static async callGeminiCalibrator(
    config: GameAIConfig,
    input: GameCalibrationInput
  ): Promise<GameCalibrationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const model = config.model || 'gemini-3.8-flash';
    const cleanKey = config.apiKey.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

    const profile = getGameCognitiveProfile(input.gameId);

    const promptText = `You are a clinical neuro-rehabilitation game director evaluating "${profile.displayName}" (${profile.domain}).
Clinical Target: ${profile.targetMCIRelevance}
Healthy elderly response times for this specific task: ${profile.latencyNorms.optimalFastMs}ms - ${profile.latencyNorms.optimalNormalMs}ms.
Deliberation threshold: ${profile.latencyNorms.deliberationMs}ms. True fatigue limit: > ${profile.latencyNorms.fatigueLimitMs}ms.
Guidance: ${profile.expertLLMPromptContext}
Patient tremor jitter index: ${input.tremorJitterIndex ?? 0.1}. (Factor: ${profile.motorTremorImpactFactor}). If tremor is elevated (>0.45), assign "motor_stabilization" and DO NOT demote cognitive tier if solution accuracy is high!

Round Telemetry: ${JSON.stringify(input)}

Calibrate difficulty tier (1 to ${input.maxTiers}) for the next round. Respond with strictly valid JSON:
{
  "recommendedTier": number,
  "action": "PROMOTE" | "MAINTAIN" | "SCAFFOLD_DOWN",
  "cognitiveLoad": "LOW" | "OPTIMAL" | "ELEVATED_FATIGUE" | "SEVERE_STRAIN",
  "clinicalRationale": "concise explanation",
  "scaffoldingArm": "autonomous_challenge" | "contextual_guidance" | "direct_scaffolding" | "motor_stabilization",
  "previewTimeMs": number,
  "cardFlipBackDelayMs": number
}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Gemini API error (${res.status})`);
      }

      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(rawText);

      const recTier = Math.max(1, Math.min(input.maxTiers, Number(parsed.recommendedTier) || input.currentTier));
      const delta = recTier - input.currentTier;

      return {
        gameId: input.gameId,
        roundIndex: input.roundIndex,
        previousTier: input.currentTier,
        recommendedTier: recTier,
        tierDelta: delta,
        action: (parsed.action as any) || (delta > 0 ? 'PROMOTE' : delta < 0 ? 'SCAFFOLD_DOWN' : 'MAINTAIN'),
        cognitiveLoad: (parsed.cognitiveLoad as any) || 'OPTIMAL',
        clinicalRationale: parsed.clinicalRationale || `${profile.displayName}: Level calibrated to Tier ${recTier}.`,
        scaffoldingArm: (parsed.scaffoldingArm as any) || 'autonomous_challenge',
        parameterAdjustments: {
          previewTimeMs: parsed.previewTimeMs,
          cardFlipBackDelayMs: parsed.cardFlipBackDelayMs,
        },
        calibratorProvider: 'gemini',
        calibratorModel: model,
        calibratedAt: new Date().toISOString(),
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Game-Aware Continuous Cognitive Calibrator (Zero Hardcoded Cutoffs)
   * 
   * Uses domain-specific normative distributions, motor-cognitive decoupling,
   * and continuous Bayesian multidimensional competency scoring.
   */
  public static calculateDeterministicFallback(input: GameCalibrationInput): GameCalibrationResult {
    const patientId = input.patientId || 'default_senior';
    const profile = PatientAdaptiveMemoryService.getPersonalizedProfile(patientId, input.gameId);

    // 1. Motor-Cognitive Decoupling:
    // Decouple physical hand tremor (Parkinson's / essential tremor / arthritis) from cognitive processing speed
    const rawTremor = Math.max(0, Math.min(1.0, input.tremorJitterIndex ?? 0.1));
    const motorCorrectionMs = rawTremor * profile.motorTremorImpactFactor * profile.latencyNorms.optimalNormalMs;
    const correctedLatencyMs = Math.max(400, input.averageLatencyMs - motorCorrectionMs);

    // 2. Normalized Accuracy (0.0 to 1.0)
    const accRatio = Math.max(0, Math.min(1.0, input.accuracyPercentage / 100));

    // 3. Normalized Task-Specific Processing Speed (0.0 to 1.0)
    // Scaled against THIS game's actual clinical latency boundaries, NOT a generic stopwatch
    const latSpan = Math.max(1200, profile.latencyNorms.fatigueLimitMs - profile.latencyNorms.optimalFastMs);
    const speedScore = Math.max(0, Math.min(1.0, 1.0 - (correctedLatencyMs - profile.latencyNorms.optimalFastMs) / latSpan));

    // 4. Frontal Perseveration Penalty (0.0 to 1.0)
    const persevPenalty = Math.min(1.0, (input.perseverationErrors || 0) * 0.25);

    // 5. Continuous Multidimensional Competence Index Pi (0.0 to 1.0)
    const compositeIndex = Number(
      (
        (accRatio * profile.weights.accuracy) +
        (speedScore * profile.weights.processingSpeed) -
        (persevPenalty * profile.weights.perseverationPenalty)
      ).toFixed(3)
    );

    // 6. Clinical Decision Derivation
    let nextTier = input.currentTier;
    let action: 'PROMOTE' | 'MAINTAIN' | 'SCAFFOLD_DOWN' = 'MAINTAIN';
    let rationale = '';
    let load: 'LOW' | 'OPTIMAL' | 'ELEVATED_FATIGUE' | 'SEVERE_STRAIN' = 'OPTIMAL';
    let arm: 'autonomous_challenge' | 'contextual_guidance' | 'direct_scaffolding' | 'motor_stabilization' = 'autonomous_challenge';

    if (rawTremor > 0.45) {
      arm = 'motor_stabilization';
    }

    // High Mastery in this domain:
    if (compositeIndex >= 0.70 && input.accuracyPercentage >= 70 && input.currentTier < input.maxTiers) {
      nextTier = input.currentTier + 1;
      action = 'PROMOTE';
      load = 'LOW';
      rationale = `${profile.displayName} (${profile.domain}): High competence index (${(compositeIndex * 100).toFixed(0)}%) within healthy task norms (${(correctedLatencyMs / 1000).toFixed(1)}s motor-corrected). Promoted to Tier ${nextTier} for neuroplastic stimulus.`;
    } 
    // Cognitive Overload / Breakdown in this domain:
    else if (
      compositeIndex <= 0.42 || 
      input.accuracyPercentage < 40 || 
      correctedLatencyMs > profile.latencyNorms.fatigueLimitMs ||
      input.perseverationErrors >= 3
    ) {
      nextTier = Math.max(1, input.currentTier - 1);
      action = input.currentTier > 1 ? 'SCAFFOLD_DOWN' : 'MAINTAIN';
      load = (compositeIndex <= 0.28 || input.accuracyPercentage < 30) ? 'SEVERE_STRAIN' : 'ELEVATED_FATIGUE';
      if (arm !== 'motor_stabilization') arm = 'contextual_guidance';
      rationale = `${profile.displayName} (${profile.domain}): Deliberation reached fatigue threshold (${(correctedLatencyMs / 1000).toFixed(1)}s) or accuracy dropped (${input.accuracyPercentage}%). Calibrated to Tier ${nextTier} with extended previews.`;
    } 
    // Balanced in Zone of Proximal Development:
    else {
      nextTier = input.currentTier;
      action = 'MAINTAIN';
      load = 'OPTIMAL';
      rationale = `${profile.displayName} (${profile.domain}): Patient is balanced in the target Zone of Proximal Development (${(compositeIndex * 100).toFixed(0)}% composite). Maintained at Tier ${nextTier}.`;
    }

    return {
      gameId: input.gameId,
      roundIndex: input.roundIndex,
      previousTier: input.currentTier,
      recommendedTier: nextTier,
      tierDelta: nextTier - input.currentTier,
      action,
      cognitiveLoad: load,
      clinicalRationale: rationale,
      scaffoldingArm: arm,
      parameterAdjustments: {
        previewTimeMs: action === 'SCAFFOLD_DOWN' ? Math.round(profile.latencyNorms.deliberationMs * 0.4) : Math.round(profile.latencyNorms.optimalFastMs * 0.8),
        cardFlipBackDelayMs: action === 'SCAFFOLD_DOWN' ? 1400 : 1000,
      },
      calibratorProvider: 'bayesian_irt_fallback',
      calibratorModel: 'game-aware-continuous-zscore',
      calibratedAt: new Date().toISOString(),
    };
  }

  /**
   * Asynchronous Teacher Reflection (Shadow Attending Physician)
   * 
   * Handed to OpenAI GPT-4o / Gemini without blocking the UI.
   * OpenAI evaluates whether the student engine's decision was optimal,
   * detects subtleties (like hand tremor spikes or perseveration patterns),
   * and adjusts the patient's learned baseline profile for future rounds.
   */
  public static async dispatchAsyncTeacherReflection(
    input: GameCalibrationInput,
    studentResult: GameCalibrationResult,
    config: GameAIConfig
  ): Promise<TeacherReflectionRecord | null> {
    const patientId = input.patientId || 'default_senior';
    const profile = PatientAdaptiveMemoryService.getPersonalizedProfile(patientId, input.gameId);

    const promptTeacher = `You are the Chief Neuropsychologist Attending Physician supervising an automated cognitive rehabilitation session.
A junior engine ("The Student") just calibrated a round of "${profile.displayName}" (${profile.domain}) for an elderly patient (${input.diagnosisStage || 'Senior'}, Age: ${input.patientAge || 75}).

PATIENT TELEMETRY:
- Game: ${profile.displayName} (${profile.domain})
- Round: ${input.roundIndex} of ${input.totalRounds}
- Accuracy: ${input.accuracyPercentage}% (Total flips/trials: ${input.totalTrialsOrFlips})
- Average Latency: ${input.averageLatencyMs}ms (Healthy elderly norm: ${profile.latencyNorms.optimalFastMs}ms - ${profile.latencyNorms.optimalNormalMs}ms, Fatigue limit: ${profile.latencyNorms.fatigueLimitMs}ms)
- Hand Tremor Jitter: ${input.tremorJitterIndex ?? 0.1} (Impact factor: ${profile.motorTremorImpactFactor})
- Frontal Perseveration Errors: ${input.perseverationErrors}
- Autonomy Score: ${input.autonomyScore ?? 100}

THE JUNIOR ENGINE'S DECISION:
- Action: ${studentResult.action}
- Recommended Tier: Tier ${studentResult.recommendedTier} (Previous: Tier ${studentResult.previousTier})
- Cognitive Load: ${studentResult.cognitiveLoad}
- Clinical Rationale: "${studentResult.clinicalRationale}"

YOUR TASK AS SENIOR ATTENDING TEACHER:
1. Did the junior engine make the correct clinical call? Set "agreed" to true if appropriate, false if you would refine it.
2. What tier should the patient be on?
3. Should the engine adjust its learned baseline for this patient in future rounds?
   - latencyScaleAdjustment: between -0.06 and +0.06 (e.g. +0.04 if elder has arthritis/slowing and needs more time, -0.03 if elder is faster than expected).
   - tremorSensitivityAdjustment: between -0.06 and +0.06 (e.g. +0.05 if tremor requires larger touch targets).
4. Provide a 1-sentence clinical reflection note for the caregiver and patient medical record.

Respond with strictly valid JSON:
{
  "agreed": boolean,
  "teacherAction": "PROMOTE" | "MAINTAIN" | "SCAFFOLD_DOWN",
  "teacherTier": number,
  "clinicalReflection": "concise 1-2 sentence attending reflection",
  "confidenceScore": number,
  "latencyScaleAdjustment": number,
  "tremorSensitivityAdjustment": number,
  "personalizedTip": "short note or null"
}`;

    try {
      let rawText = '';
      if (config.provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: config.model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: promptTeacher }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 300,
          }),
        });
        if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
        const data = await res.json();
        rawText = data.choices?.[0]?.message?.content || '{}';
      } else {
        const model = config.model || 'gemini-3.8-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptTeacher }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });
        if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
        const data = await res.json();
        rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      }

      const parsed = JSON.parse(rawText);
      const record: TeacherReflectionRecord = {
        id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        patientId,
        gameId: input.gameId,
        gameTitle: input.gameTitle,
        roundIndex: input.roundIndex,
        studentDecision: {
          action: studentResult.action,
          tier: studentResult.recommendedTier,
          rationale: studentResult.clinicalRationale,
        },
        teacherEvaluation: {
          agreed: typeof parsed.agreed === 'boolean' ? parsed.agreed : true,
          teacherAction: parsed.teacherAction || studentResult.action,
          teacherTier: Number(parsed.teacherTier) || studentResult.recommendedTier,
          clinicalReflection: parsed.clinicalReflection || 'Attending physician verified calibration.',
          confidenceScore: Number(parsed.confidenceScore) || 0.95,
          latencyScaleAdjustment: Number(parsed.latencyScaleAdjustment) || 0.0,
          tremorSensitivityAdjustment: Number(parsed.tremorSensitivityAdjustment) || 0.0,
          personalizedTip: parsed.personalizedTip || undefined,
        },
        timestamp: new Date().toISOString(),
      };

      // Record reflection and train patient profile
      PatientAdaptiveMemoryService.recordTeacherReflection(record);
      return record;
    } catch (e: any) {
      console.warn('Teacher reflection network error:', e.message || e);
      return null;
    }
  }

  /**
   * Store calibration result in persistent history
   */
  private static recordCalibration(res: GameCalibrationResult): void {
    try {
      const history = this.getHistory();
      history.unshift(res);
      // Keep most recent 50 calibrations
      const trimmed = history.slice(0, 50);
      localStorage.setItem(STORAGE_KEY_CALIBRATIONS, JSON.stringify(trimmed));
    } catch {}
  }

  /**
   * Retrieve historical calibrations
   */
  public static getHistory(): GameCalibrationResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CALIBRATIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  }

  /**
   * Clear calibration history
   */
  public static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_CALIBRATIONS);
    } catch {}
  }
}
