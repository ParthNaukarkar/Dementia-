/**
 * SmritiNER - Dynamic Adaptive Game Flow & Multi-Domain Clinical Orchestrator
 * 
 * Dynamically analyzes patient cognitive load, hippocampal fatigue, Parkinsonian
 * tremor spikes, and domain deficits to adapt the workout flow on the fly ("changing games on the flow").
 * Calibrated against Washington University OASIS-2 longitudinal clinical norms.
 */

import type { GameId, SupportedLanguage, LumosityDomain } from '../types/prescription';
import { GAME_CATALOG } from '../data/gameCatalog';
import { CognitiveClassifier, type PatientSessionTelemetry } from './cognitive-classifier';

export type FlowTransitionReason =
  | 'hippocampal_relief'      // Relieve verbal memory strain; route to spatial/visuomotor
  | 'executive_escalation'    // High reserve; escalate to WCST / matrix abstraction
  | 'motor_stabilization'     // High tremor / touch wobble; route to large-target recognition
  | 'domain_diversification'  // Balanced stimulation across unexercised DSM-5 domains
  | 'palliative_scaffolding'  // High fatigue / disorientation; route to comforting reminiscence
  | 'prescribed_continuation';// Paced transition within prescribed regime

export interface DomainRadarScores {
  memory: number;     // 0 - 100
  attention: number;  // 0 - 100
  executive: number;  // 0 - 100
  spatial: number;    // 0 - 100
  language: number;   // 0 - 100
}

export interface MultiGameSessionAnalysis {
  aggregateTheta: number;
  estimatedMoCAScore: number; // 5 to 30
  estimatedMMSEScore: number;  // 8 to 30
  clinicalTier: 'NORMAL' | 'MCI' | 'HIGH_SUPPORT';
  fatigueScore: number;       // 0.0 to 1.0
  fatigueLevel: 'low' | 'moderate' | 'elevated';
  tremorIndex: number;        // 0.0 to 1.0
  domainRadar: DomainRadarScores;
  clinicalAlerts: string[];
  clinicalNotes: Record<SupportedLanguage, string>;
}

export interface FlowRecommendation {
  nextGameId: GameId;
  reason: FlowTransitionReason;
  clinicalRationale: Record<SupportedLanguage, string>;
  domain: LumosityDomain;
  estimatedMinutes: number;
  adjustedPlaylist: GameId[];
  fatigueScore: number;
  hippocampalStrain: number;
  tremorBurden: number;
}

export interface FlowEvaluationContext {
  completedGameId: GameId;
  completedSummary: any;
  currentPlaylist: GameId[];
  completedGameIds: GameId[];
  sessionReports: Record<string, any>;
  patientLanguage?: SupportedLanguage;
}

// 10 Active Validated Games in SmritiNER
export const ACTIVE_10_GAMES: GameId[] = [
  'memory-match',
  'sequence-recall',
  'word-recall',
  'jigsaw-puzzle',
  'number-recall',
  'what-changed',
  'brain-story',
  'where-am-i',
  'odd-one-out',
  'pattern-recall',
];

// Mapping games to their primary DSM-5 neurocognitive domains
export const GAME_DOMAIN_MAP: Record<GameId, 'memory' | 'attention' | 'executive' | 'spatial' | 'language'> = {
  'memory-match': 'memory',
  'sequence-recall': 'attention',
  'word-recall': 'language',
  'smriti-haat': 'language',
  'jigsaw-puzzle': 'spatial',
  'number-recall': 'memory',
  'what-changed': 'attention',
  'brain-story': 'language',
  'where-am-i': 'spatial',
  'odd-one-out': 'executive',
  'pattern-recall': 'attention',
};

export class AdaptiveGameFlowEngine {
  /**
   * Evaluates patient telemetry and recommends the optimal next game dynamically.
   * Changes games on the flow to prevent catastrophic fatigue or provide cognitive escalation.
   */
  public static recommendNextGame(ctx: FlowEvaluationContext): FlowRecommendation {
    const {
      completedGameId,
      completedSummary,
      currentPlaylist,
      completedGameIds,
      sessionReports,
    } = ctx;

    const allReports = Object.values(sessionReports);
    if (completedSummary && !allReports.includes(completedSummary)) {
      allReports.push(completedSummary);
    }

    // 1. Calculate Biomarkers
    const fatigueScore = this.calculateFatigueScore(completedSummary, allReports);
    const hippocampalStrain = this.calculateHippocampalStrain(completedGameId, completedSummary);
    const tremorBurden = this.calculateTremorBurden(completedSummary);
    const abilityTheta = completedSummary?.finalTheta ?? 0.0;

    // Remaining unplayed games from the active 10 catalog
    const playedSet = new Set<GameId>([...completedGameIds, completedGameId]);
    let candidateGames = ACTIVE_10_GAMES.filter(id => !playedSet.has(id));

    // If all 10 played, candidate pool resets to all active games excluding current
    if (candidateGames.length === 0) {
      candidateGames = ACTIVE_10_GAMES.filter(id => id !== completedGameId);
    }

    let selectedGameId: GameId = candidateGames[0] || 'memory-match';
    let reason: FlowTransitionReason = 'prescribed_continuation';

    // ─── Flow Adaptation Policy ──────────────────────────────────────────

    // Priority 1: Palliative Fallback (Severe Frustration / Confusion)
    if (fatigueScore > 0.75 || (completedSummary?.accuracyPercentage != null && completedSummary.accuracyPercentage < 40 && (abilityTheta < -1.0 || completedSummary?.finalTheta == null))) {
      reason = 'palliative_scaffolding';
      // Route to gentle reminiscence or forgiving visual scene
      const palliativeChoices: GameId[] = ['brain-story', 'where-am-i', 'what-changed'];
      const pick = palliativeChoices.find(g => candidateGames.includes(g)) || palliativeChoices[0];
      selectedGameId = pick;
    }
    // Priority 2: Hippocampal Strain Relief (Verbal/Narrative Fatigue)
    else if (hippocampalStrain > 0.60) {
      reason = 'hippocampal_relief';
      // Switch away from language/verbal memory to spatial construction or visual attention
      const spatialChoices: GameId[] = ['jigsaw-puzzle', 'where-am-i', 'what-changed'];
      const pick = spatialChoices.find(g => candidateGames.includes(g)) || spatialChoices[0];
      selectedGameId = pick;
    }
    // Priority 3: Motor Tremor Stabilization
    else if (tremorBurden > 0.50) {
      reason = 'motor_stabilization';
      // Route to exercises with large tap targets and zero drag requirements
      const motorSafeChoices: GameId[] = ['where-am-i', 'brain-story', 'what-changed', 'odd-one-out'];
      const pick = motorSafeChoices.find(g => candidateGames.includes(g)) || motorSafeChoices[0];
      selectedGameId = pick;
    }
    // Priority 4: Executive Escalation (Patient excelling with high cognitive reserve)
    else if (abilityTheta >= 0.85 && (completedSummary?.accuracyPercentage ?? 0) >= 88 && fatigueScore < 0.30) {
      reason = 'executive_escalation';
      // Challenge prefrontal abstraction or matrix working memory
      const executiveChoices: GameId[] = ['odd-one-out', 'pattern-recall', 'sequence-recall'];
      const pick = executiveChoices.find(g => candidateGames.includes(g)) || executiveChoices[0];
      selectedGameId = pick;
    }
    // Priority 5: Balanced Domain Diversification
    else {
      reason = 'domain_diversification';
      // Pick domain not exercised recently
      const completedDomains = new Set([...completedGameIds, completedGameId].map(g => GAME_DOMAIN_MAP[g] || 'memory'));
      const diverseGame = candidateGames.find(g => !completedDomains.has(GAME_DOMAIN_MAP[g]));
      selectedGameId = diverseGame || candidateGames[0];
    }

    // Generate adjusted playlist on the flow
    const nextGameIndex = currentPlaylist.indexOf(completedGameId) + 1;
    const remainingPlaylist = currentPlaylist.slice(nextGameIndex).filter(g => g !== selectedGameId);
    const adjustedPlaylist = [...currentPlaylist.slice(0, nextGameIndex), selectedGameId, ...remainingPlaylist];

    const clinicalRationale = this.generateClinicalRationale(reason, selectedGameId, completedGameId);
    const domain = GAME_CATALOG.find(g => g.id === selectedGameId)?.domain || 'memory';
    const estimatedMinutes = GAME_CATALOG.find(g => g.id === selectedGameId)?.estimatedMinutes || 3;

    return {
      nextGameId: selectedGameId,
      reason,
      clinicalRationale,
      domain,
      estimatedMinutes,
      adjustedPlaylist,
      fatigueScore: Number(fatigueScore.toFixed(3)),
      hippocampalStrain: Number(hippocampalStrain.toFixed(3)),
      tremorBurden: Number(tremorBurden.toFixed(3)),
    };
  }

  /**
   * Evaluates multi-game session telemetry against OASIS-2 longitudinal criteria.
   * Produces comprehensive clinical analysis with DSM-5 domain radar and MoCA/MMSE estimation.
   */
  public static analyzeMultiGameSession(sessionReports: Record<string, any>): MultiGameSessionAnalysis {
    const reports = Object.values(sessionReports).filter(Boolean);

    if (reports.length === 0) {
      return {
        aggregateTheta: 0.0,
        estimatedMoCAScore: 26,
        estimatedMMSEScore: 28,
        clinicalTier: 'NORMAL',
        fatigueScore: 0.1,
        fatigueLevel: 'low',
        tremorIndex: 0.05,
        domainRadar: { memory: 80, attention: 80, executive: 80, spatial: 80, language: 80 },
        clinicalAlerts: [],
        clinicalNotes: {
          en: 'Initial baseline assessment ready. Complete exercises to generate detailed neurocognitive profile.',
          as: 'প্ৰাৰম্ভিক মূল্যায়ন সাজু। বিস্তৃত নিউৰো-জ্ঞানমূলক প্ৰতিবেদনৰ বাবে অনুশীলন সম্পূৰ্ণ কৰক।',
          bn: 'প্রাথমিক মূল্যায়ন প্রস্তুত। বিস্তারিত নিউরো-কগনিটিভ প্রতিবেদনের জন্য অনুশীলন সম্পন্ন করুন।',
          hi: 'प्रारंभिक मूल्यांकन तैयार है। विस्तृत संज्ञानात्मक प्रोफाइल के लिए अभ्यास पूरा करें।',
        },
      };
    }

    // 1. Mean Metrics
    let sumLatency = 0;
    let sumAccuracy = 0;
    let sumThetas = 0;
    let sumPerseverations = 0;
    let sumTremorTaps = 0;
    let count = reports.length;

    const latencies: number[] = [];

    reports.forEach(r => {
      const lat = r.averageLatencyMs || r.meanReactionTimeMs || r.meanDeliberationMs || 4000;
      latencies.push(lat);
      sumLatency += lat;
      sumAccuracy += (r.accuracyPercentage ?? 80);
      sumThetas += (r.finalTheta ?? 0.0);
      sumPerseverations += (r.perseverationErrors ?? 0);
      sumTremorTaps += (r.tremorTapsFiltered ?? 0);
    });

    const meanLatency = sumLatency / count;
    const meanAccuracy = sumAccuracy / count;
    const aggregateTheta = Math.max(-3.0, Math.min(3.0, sumThetas / count));

    // Latency variance (IIV)
    let sumVariance = 0;
    latencies.forEach(lat => {
      sumVariance += Math.pow(lat - meanLatency, 2);
    });
    const latencyVariance = Math.sqrt(sumVariance / count);

    // Hesitation ratio (> 7000ms)
    const slowTrialsCount = latencies.filter(l => l > 7000).length;
    const hesitationRatio = slowTrialsCount / count;

    // Tremor index
    const tremorIndex = Math.min(1.0, sumTremorTaps / Math.max(1, count * 3));

    // Perseveration rate
    const perseverationRate = Math.min(1.0, sumPerseverations / Math.max(1, count * 5));

    // 2. Classify via trained OASIS-2 Edge Cognitive Model
    const patientTelemetry: PatientSessionTelemetry = {
      meanLatencyMs: meanLatency,
      latencyVarianceMs: Math.max(300, latencyVariance),
      accuracyPct: meanAccuracy,
      perseverationRate,
      hesitationRatio,
      tremorJitterIndex: tremorIndex,
    };

    const classification = CognitiveClassifier.classify(patientTelemetry);

    // 3. Regress MMSE and MoCA from longitudinal OASIS-2 equations
    const estimatedMoCAScore = Math.round(
      Math.max(5, Math.min(30, 26 + aggregateTheta * 3.2 - hesitationRatio * 4.5 - (100 - meanAccuracy) * 0.08))
    );

    const estimatedMMSEScore = Math.round(
      Math.max(8, Math.min(30, 27.5 + aggregateTheta * 3.4 - perseverationRate * 7.5 - (meanLatency > 8000 ? 1.5 : 0)))
    );

    // 4. Calculate Fatigue Biomarker
    const fatigueScore = Math.min(1.0, Math.max(0.0,
      (hesitationRatio * 0.40) +
      (Math.min(latencyVariance, 6000) / 6000 * 0.35) +
      (meanLatency > 7500 ? 0.25 : 0)
    ));

    const fatigueLevel = fatigueScore > 0.65 ? 'elevated' : fatigueScore > 0.35 ? 'moderate' : 'low';

    // 5. Calculate 5-Domain Radar
    const domainRadar = this.calculateDomainRadar(sessionReports, aggregateTheta);

    // 6. Clinical Alerts & Actionable Notes
    const clinicalAlerts: string[] = [];
    if (fatigueLevel === 'elevated') {
      clinicalAlerts.push('Elevated cognitive fatigue detected: Increased intra-individual response latency variability.');
    }
    if (tremorIndex > 0.4) {
      clinicalAlerts.push('Parkinsonian motor jitter detected: Hardware tremor debouncing active.');
    }
    if (perseverationRate > 0.25) {
      clinicalAlerts.push('Cognitive inflexibility noted: Perseverative answer repetitions detected across trials.');
    }

    const clinicalNotes = this.generateSessionClinicalNotes(
      classification.clinicalTier,
      estimatedMoCAScore,
      estimatedMMSEScore,
      fatigueLevel
    );

    return {
      aggregateTheta: Number(aggregateTheta.toFixed(2)),
      estimatedMoCAScore,
      estimatedMMSEScore,
      clinicalTier: classification.clinicalTier,
      fatigueScore: Number(fatigueScore.toFixed(3)),
      fatigueLevel,
      tremorIndex: Number(tremorIndex.toFixed(3)),
      domainRadar,
      clinicalAlerts,
      clinicalNotes,
    };
  }

  // ─── Private Helper Calculations ─────────────────────────────────────────

  private static calculateFatigueScore(summary: any, allReports: any[]): number {
    if (!summary) return 0.15;
    const lat = summary.averageLatencyMs || summary.meanReactionTimeMs || 3000;
    const acc = summary.accuracyPercentage ?? 80;

    let score = 0;
    if (lat > 8000) score += 0.35;
    else if (lat > 5500) score += 0.18;

    if (acc < 60) score += 0.35;
    else if (acc < 75) score += 0.15;

    // Longitudinal session fatigue: if latencies are steadily rising across session
    if (allReports.length >= 2) {
      const firstLat = allReports[0].averageLatencyMs || 3000;
      if (lat > firstLat * 1.35) score += 0.30;
    }

    return Math.min(1.0, Math.max(0.0, score));
  }

  private static calculateHippocampalStrain(gameId: GameId, summary: any): number {
    const isVerbalMemory = gameId === 'word-recall' || gameId === 'brain-story' || gameId === 'smriti-haat';
    if (!isVerbalMemory) return 0.10;

    const acc = summary?.accuracyPercentage ?? 80;
    const lat = summary?.averageLatencyMs ?? 4000;
    const autoAssisted = summary?.autoAssistedRounds || summary?.hintsUsed || summary?.replaysUsed || 0;

    let strain = 0.2;
    if (acc < 60) strain += 0.40;
    if (lat > 7500) strain += 0.25;
    if (autoAssisted >= 2) strain += 0.25;

    return Math.min(1.0, Math.max(0.0, strain));
  }

  private static calculateTremorBurden(summary: any): number {
    const tremorTaps = summary?.tremorTapsFiltered || summary?.tremorEventsSuppressed || 0;
    if (tremorTaps >= 4) return 0.85;
    if (tremorTaps >= 2) return 0.55;
    if (tremorTaps === 1) return 0.25;
    return 0.05;
  }

  private static calculateDomainRadar(
    sessionReports: Record<string, any>,
    defaultTheta: number
  ): DomainRadarScores {
    const domainScores: Record<'memory' | 'attention' | 'executive' | 'spatial' | 'language', number[]> = {
      memory: [],
      attention: [],
      executive: [],
      spatial: [],
      language: [],
    };

    Object.entries(sessionReports).forEach(([gameId, rep]) => {
      const dom = GAME_DOMAIN_MAP[gameId as GameId] || 'memory';
      const theta = rep.finalTheta ?? defaultTheta;
      const acc = rep.accuracyPercentage ?? 80;
      // Convert theta (-3 to +3) and accuracy to 0-100 scale
      const scaled = Math.round(Math.max(20, Math.min(99, 50 + theta * 16 + (acc - 70) * 0.3)));
      domainScores[dom].push(scaled);
    });

    const baseScore = Math.round(Math.max(30, Math.min(95, 55 + defaultTheta * 15)));

    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : baseScore;

    return {
      memory: avg(domainScores.memory),
      attention: avg(domainScores.attention),
      executive: avg(domainScores.executive),
      spatial: avg(domainScores.spatial),
      language: avg(domainScores.language),
    };
  }

  private static generateClinicalRationale(
    reason: FlowTransitionReason,
    nextGame: GameId,
    _prevGame: GameId
  ): Record<SupportedLanguage, string> {
    const nextMeta = GAME_CATALOG.find(g => g.id === nextGame);
    const nextTitle = nextMeta?.title.en || nextGame;

    switch (reason) {
      case 'hippocampal_relief':
        return {
          en: `AI Flow Adaptation: Verbal memory strain detected. Transitioning to ${nextTitle} (Spatial/Visuomotor) to allow hippocampal recovery while engaging parietal pathways.`,
          as: `AI গতিশীল পৰিৱৰ্তন: মৌখিক স্মৃতিৰ ক্লান্তি ধৰা পৰিছে। মগজুৰ জিৰণিৰ বাবে স্থানিক দৃশ্যমান অনুশীলন '${nextMeta?.title.as || nextTitle}' আৰম্ভ কৰা হৈছে।`,
          bn: `AI গতিশীল রূপান্তর: মৌখিক স্মৃতির ক্লান্তি শনাক্ত। মস্তিষ্কের শিথিলতার জন্য স্থানিক দৃশ্যমান অনুশীলন '${nextMeta?.title.bn || nextTitle}' নির্বাচন করা হয়েছে।`,
          hi: `AI अनुकूली प्रवाह: मौखिक स्मृति में थकावट के लक्षण। स्मरण शक्ति को विश्राम देते हुए स्थानिक दृश्य अभ्यास '${nextMeta?.title.hi || nextTitle}' चुना गया।`,
        };

      case 'executive_escalation':
        return {
          en: `AI Flow Adaptation: High cognitive reserve demonstrated. Stepping up to ${nextTitle} (Executive/Matrix Reasoning) to stimulate prefrontal cortex plasticity.`,
          as: `AI গতিশীল পৰিৱৰ্তন: উচ্চ বৌদ্ধিক ক্ষমতা প্ৰদৰ্শিত হৈছে। মগজুৰ কাৰ্যকৰী চিন্তাৰ বাবে '${nextMeta?.title.as || nextTitle}' নিৰ্বাচন কৰা হৈছে।`,
          bn: `AI গতিশীল রূপান্তর: উচ্চ বৌদ্ধিক দক্ষতা পরিলক্ষিত। কার্যকরী সিদ্ধান্ত গ্রহণের জন্য '${nextMeta?.title.bn || nextTitle}' স্তর বৃদ্ধি করা হয়েছে।`,
          hi: `AI अनुकूली प्रवाह: उत्कृष्ट संज्ञान क्षमता प्रदर्शित। मस्तिष्क की कार्यकारी निर्णय क्षमता बढ़ाने हेतु '${nextMeta?.title.hi || nextTitle}' प्रारंभ किया गया।`,
        };

      case 'motor_stabilization':
        return {
          en: `AI Flow Adaptation: Motor tremor jitter identified. Routing to ${nextTitle} with expanded touch targets and hardware debouncing to protect patient autonomy.`,
          as: `AI গতিশীল পৰিৱৰ্তন: হাতৰ কম্পন ধৰা পৰিছে। স্পৰ্শ সহজ কৰিবলৈ বহল লক্ষ্যযুক্ত অনুশীলন '${nextMeta?.title.as || nextTitle}' প্ৰদান কৰা হৈছে।`,
          bn: `AI গতিশীল রূপান্তর: হাতের কম্পন শনাক্ত। রোগীকে স্বস্তি দিতে সহজ স্পর্শযোগ্য অনুশীলন '${nextMeta?.title.bn || nextTitle}' নির্বাচন করা হয়েছে।`,
          hi: `AI अनुकूली प्रवाह: शारीरिक कंपन के लक्षण। रोगी की सुविधा हेतु बड़े टच-टारगेट वाला अभ्यास '${nextMeta?.title.hi || nextTitle}' दिया गया।`,
        };

      case 'palliative_scaffolding':
        return {
          en: `AI Flow Adaptation: Cognitive hesitation and fatigue noted. Routing to comforting reminiscence in ${nextTitle} to prevent frustration and preserve dignity.`,
          as: `AI গতিশীল পৰিৱৰ্তন: মানসিক দ্বিধা আৰু ক্লান্তি পৰিলক্ষিত। হতাশ নহ’বলৈ আৰু মনৰ আনন্দৰ বাবে '${nextMeta?.title.as || nextTitle}' বাছনি কৰা হৈছে।`,
          bn: `AI গতিশীল রূপান্তর: মানসিক ক্লান্তি পরিলক্ষিত। রোগীকে শান্ত ও উৎসাহিত রাখতে '${nextMeta?.title.bn || nextTitle}' নির্বাচন করা হয়েছে।`,
          hi: `AI अनुकूली प्रवाह: मानसिक थकान को देखते हुए शांतिदायक एवं रुचिपूर्ण अभ्यास '${nextMeta?.title.hi || nextTitle}' प्रारंभ किया गया।`,
        };

      case 'domain_diversification':
        return {
          en: `AI Flow Adaptation: Advancing to ${nextTitle} to ensure balanced daily stimulation across all DSM-5 neurocognitive domains.`,
          as: `AI গতিশীল পৰিৱৰ্তন: সকলো বৌদ্ধিক দিশৰ সন্তুলন বজাই ৰাখিবলৈ পৰৱৰ্তী অনুশীলন '${nextMeta?.title.as || nextTitle}' নিৰ্বাচন কৰা হৈছে।`,
          bn: `AI গতিশীল রূপান্তর: সামগ্রিক মানসিক ভারসাম্যের জন্য পরবর্তী অনুশীলন '${nextMeta?.title.bn || nextTitle}' নির্বাচন করা হয়েছে।`,
          hi: `AI अनुकूली प्रवाह: समग्र मानसिक संतुलन हेतु अगला संज्ञानात्मक अभ्यास '${nextMeta?.title.hi || nextTitle}' चुना गया।`,
        };

      case 'prescribed_continuation':
      default:
        return {
          en: `AI Routine Flow: Continuing personalized clinical prescription with ${nextTitle}.`,
          as: `AI নিৰ্ধাৰিত প্ৰৱাহ: ব্যক্তিগত স্বাস্থ্য নিৰ্দেশনা অনুসৰি '${nextMeta?.title.as || nextTitle}' আৰম্ভ কৰা হৈছে।`,
          bn: `AI নির্ধারিত প্রবাহ: ব্যক্তিগত ক্লিনিক্যাল প্রেসক্রিপশন অনুযায়ী '${nextMeta?.title.bn || nextTitle}' শুরু করা হয়েছে।`,
          hi: `AI अनुकूली प्रवाह: व्यक्तिगत स्वास्थ्य निर्देशानुसार '${nextMeta?.title.hi || nextTitle}' प्रारंभ किया गया।`,
        };
    }
  }

  private static generateSessionClinicalNotes(
    tier: 'NORMAL' | 'MCI' | 'HIGH_SUPPORT',
    moca: number,
    mmse: number,
    fatigue: 'low' | 'moderate' | 'elevated'
  ): Record<SupportedLanguage, string> {
    if (tier === 'NORMAL') {
      return {
        en: `Cognitive stability preserved (Estimated MoCA: ${moca}/30, MMSE: ${mmse}/30). Fatigue index: ${fatigue}. Recommend maintaining regular daily mental workouts.`,
        as: `বৌদ্ধিক স্থিৰতা অটুট আছে (আনুমানিক MoCA: ${moca}/30, MMSE: ${mmse}/30)। ক্লান্তি: ${fatigue}। নিয়মীয়া দৈনিক অভ্যাস অব্যাহত ৰাখক।`,
        bn: `বৌদ্ধিক স্থিতিশীলতা বজায় রয়েছে (আনুমানিক MoCA: ${moca}/30, MMSE: ${mmse}/30)। ক্লান্তি: ${fatigue}। নিয়মিত অনুশীলন বজায় রাখুন।`,
        hi: `संज्ञानात्मक स्थिरता उत्कृष्ट बनी हुई है (अनुमानित MoCA: ${moca}/30, MMSE: ${mmse}/30)। थकान: ${fatigue}। दैनिक अभ्यास जारी रखें।`,
      };
    } else if (tier === 'MCI') {
      return {
        en: `Mild cognitive hesitation observed (Estimated MoCA: ${moca}/30, MMSE: ${mmse}/30). Fatigue index: ${fatigue}. Dynamic flow provided gentle hippocampal and spatial balancing.`,
        as: `মৃদু বিলম্ব পৰিলক্ষিত (আনুমানিক MoCA: ${moca}/30, MMSE: ${mmse}/30)। ক্লান্তি: ${fatigue}। AI প্ৰৱাহে স্থানিক আৰু স্মৃতিৰ সন্তুলন বজাই ৰাখিছে।`,
        bn: `মৃদু বিলম্ব পরিলক্ষিত (আনুমানিক MoCA: ${moca}/30, MMSE: ${mmse}/30)। ক্লান্তি: ${fatigue}। AI প্রবাহে স্থানিক ও স্মৃতির ভারসাম্য রাখা হয়েছে।`,
        hi: `हल्की संज्ञानात्मक देरी देखी गई (अनुमानित MoCA: ${moca}/30, MMSE: ${mmse}/30)। थकान: ${fatigue}। AI प्रवाह द्वारा संतुलित मार्गदर्शन किया गया।`,
      };
    } else {
      return {
        en: `Substantial cognitive support utilized (Estimated MoCA: ${moca}/30, MMSE: ${mmse}/30). Fatigue index: ${fatigue}. Palliative scaffolding deployed to preserve patient engagement and dignity.`,
        as: `অধিক সহায়ৰ প্ৰয়োজন পৰিলক্ষিত (আনুমানিক MoCA: ${moca}/30, MMSE: ${mmse}/30)। ক্লান্তি: ${fatigue}। ৰোগীৰ মৰ্যাদা ৰক্ষা কৰি সৰল সহায়িকা আগবঢ়োৱা হৈছে।`,
        bn: `অধিক সহায়তার প্রয়োজন শনাক্ত (আনুমানিক MoCA: ${moca}/30, MMSE: ${mmse}/30)। ক্লান্তি: ${fatigue}। রোগীর মর্যাদা রক্ষায় সরল সাহায্য প্রদান করা হয়েছে।`,
        hi: `अतिरिक्त सहायता की आवश्यकता पाई गई (अनुमानित MoCA: ${moca}/30, MMSE: ${mmse}/30)। थकान: ${fatigue}। आत्मसम्मान की रक्षा हेतु सरल मार्गदर्शन दिया गया।`,
      };
    }
  }
}
