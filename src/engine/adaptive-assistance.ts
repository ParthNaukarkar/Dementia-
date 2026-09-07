/**
 * SmritiNER - Extreme Patient-Profile-Adaptive Assistance Engine
 * 
 * Dynamically classifies patient impairment phenotype and tailors intervention
 * latency (T_assist), scaffolding hierarchy (Level 1 Subtle -> Level 2 Contextual -> Level 3 Direct),
 * and motor tolerances to prevent panic in severe dementia while protecting autonomy in MCI and motor-slowed patients.
 */

export type AssistanceProfile = 
  | 'severe_amnesic'      // Rapid memory decay (<10s). Requires rapid scaffolding (5s-8s) & direct visual guidance.
  | 'motor_tremor_slowed'  // Parkinsonian / motor tremor slowed. Extended grace period (20s-28s) to avoid interrupting physical aiming.
  | 'mild_executive_mci'   // Mild Cognitive Impairment. Moderate grace period (12s-16s) with contextual distractor reduction.
  | 'autonomous_mastery';  // High cognitive reserve. Extended grace period (28s-35s) with subtle or on-demand assistance only.

export type ScaffoldingLevel = 
  | 'subtle_cue'           // Level 1: Gentle border pulse or proactive hint button
  | 'contextual_reduction' // Level 2: Eliminate 1-2 distractors, regional halo, or subtle outline
  | 'direct_beacon'        // Level 3: Direct item reveal, auto-snap, or step-by-step guidance
  | 'motor_stabilization'; // Motor: Expanded magnetic snap margin, larger hitboxes, calming feedback

export interface AssistanceMultiStageTimings {
  voicePromptMs: number;      // Gentle vernacular reassurance
  contextualActionMs: number; // Distractor reduction / filter / outline
  beaconPromptMs: number;     // Direct target highlight / hint
  autoCompleteMs: number;     // Soft auto-assist / step scaffolding
}

export interface AssistanceProfileConfig {
  profile: AssistanceProfile;
  displayName: Record<'en' | 'as' | 'bn' | 'hi', string>;
  assistTimeoutMs: number;
  scaffoldingLevel: ScaffoldingLevel;
  multiStageTimeouts: AssistanceMultiStageTimings;
  magneticSnapMarginPx: number; // For visuomotor / jigsaw (standard: 40px, motor-slowed: 85px)
  tremorDebounceMs: number;     // Hardware debouncing (standard: 400ms, severe tremor: 550ms)
  clinicalRationale: Record<'en' | 'as' | 'bn' | 'hi', string>;
}

export interface ProfileMetricsInput {
  theta: number;                  // Bayesian ability parameter [-3.0, +3.0]
  tremorTapsCount?: number;       // Hardware debounced tap count
  recentLatenciesMs?: number[];   // Recent action latencies
  consecutiveErrors?: number;     // Consecutive placement/selection errors
  accuracyPct?: number;           // Session accuracy (0 to 100)
  hesitationMs?: number;          // Current idle duration or mean hesitation
  taskType?: 'visuomotor' | 'working_memory' | 'associative' | 'recognition';
}

export class AdaptiveAssistanceEngine {
  /**
   * Derive optimal patient profile and intervention parameters from live telemetry.
   */
  public static deriveAssistanceProfile(metrics: ProfileMetricsInput): AssistanceProfileConfig {
    const {
      theta,
      tremorTapsCount = 0,
      recentLatenciesMs = [],
      consecutiveErrors = 0,
      accuracyPct = 80,
      hesitationMs = 0,
    } = metrics;

    const meanLatency = recentLatenciesMs.length > 0
      ? recentLatenciesMs.reduce((a, b) => a + b, 0) / recentLatenciesMs.length
      : 2000;

    // 1. Check for Parkinsonian / Motor-Tremor Slowed profile first:
    // If patient exhibits high tremor filter taps or deliberate motor execution without severe cognitive decay,
    // we MUST NOT pop up intrusive cognitive hints prematurely!
    const isMotorSlowed = tremorTapsCount >= 3 || (meanLatency > 3800 && theta >= -0.8 && consecutiveErrors <= 1);
    
    // 2. Check for Severe Amnesic / Marked Apraxia profile:
    // Working memory decays rapidly (<10s). Pauses indicate disorientation.
    const isSevereAmnesic = theta <= -1.0 || (consecutiveErrors >= 2 && accuracyPct < 50) || (theta < -0.5 && hesitationMs > 12000);

    // 3. Check for Autonomous Mastery profile:
    const isAutonomous = theta >= 0.5 && tremorTapsCount < 2 && consecutiveErrors === 0 && meanLatency < 3000;

    // Resolve profile
    let profile: AssistanceProfile;
    if (isMotorSlowed && !isSevereAmnesic) {
      profile = 'motor_tremor_slowed';
    } else if (isSevereAmnesic) {
      profile = 'severe_amnesic';
    } else if (isAutonomous) {
      profile = 'autonomous_mastery';
    } else {
      profile = 'mild_executive_mci';
    }

    return this.getConfigurationForProfile(profile);
  }

  /**
   * Get exhaustive configuration per clinical assistance profile.
   */
  public static getConfigurationForProfile(profile: AssistanceProfile): AssistanceProfileConfig {
    switch (profile) {
      case 'severe_amnesic':
        return {
          profile,
          displayName: {
            en: 'Severe Amnestic Support (Rapid Scaffolding)',
            as: 'তীব্ৰ স্মৃতি সাহায্য (দ্ৰুত সহায়িকা)',
            bn: 'তীব্র স্মৃতি সহায়তা (দ্রুত সহায়ক)',
            hi: 'गंभीर स्मृति सहायता (त्वरित मार्गदर्शन)',
          },
          assistTimeoutMs: 6000, // 6 seconds
          scaffoldingLevel: 'direct_beacon',
          multiStageTimeouts: {
            voicePromptMs: 4000,
            contextualActionMs: 6000,
            beaconPromptMs: 8000,
            autoCompleteMs: 12000,
          },
          magneticSnapMarginPx: 75,
          tremorDebounceMs: 450,
          clinicalRationale: {
            en: 'Working memory decay <10s detected. Immediate multimodal scaffolding deployed to prevent task abandonment and catastrophic frustration.',
            as: 'কাৰ্যকৰী স্মৃতি ১০ ছেকেণ্ডৰ ভিতৰত লোপ পোৱাৰ সম্ভাৱনা। হতাশ নহ’বলৈ তৎক্ষণাত সৰল নিৰ্দেশনা আৰু সহায় আগবঢ়োৱা হৈছে।',
            bn: 'কার্যকরী স্মৃতি দ্রুত বিলোপের লক্ষণ। বিভ্রান্তি রোধে অবিলম্বে দৃশ্যমান সহায়তা দেওয়া হচ্ছে।',
            hi: 'स्मृति विलोप की तीव्रता को देखते हुए रोगी के संज्ञान को स्थिर रखने हेतु त्वरित मार्गदर्शन प्रदान किया जा रहा है।',
          },
        };

      case 'motor_tremor_slowed':
        return {
          profile,
          displayName: {
            en: 'Motor-Tremor Stabilized (Extended Grace)',
            as: 'কম্পন-স্থিৰতা সুৰক্ষা (দীঘলীয়া সময়)',
            bn: 'কম্পন-স্থিতিশীল সুরক্ষা (বর্ধিত সময়)',
            hi: 'मोटर-कंपन स्थिरता (विस्तारित समय)',
          },
          assistTimeoutMs: 22000, // 22 seconds
          scaffoldingLevel: 'motor_stabilization',
          multiStageTimeouts: {
            voicePromptMs: 14000,
            contextualActionMs: 18000,
            beaconPromptMs: 22000,
            autoCompleteMs: 32000,
          },
          magneticSnapMarginPx: 85, // Generous 85px snap margin
          tremorDebounceMs: 500,     // 500ms debounce
          clinicalRationale: {
            en: 'Motor slowing & tremor debounce delays identified. Cognitive assistance delayed by 22s to prevent insulting intrusion while physically aiming.',
            as: 'হাতৰ কম্পন আৰু শাৰীৰিক ধীৰ গতি ধৰা পৰিছে। শাৰীৰিক স্পৰ্শত বাধা নিদিবলৈ কৃপাদৃষ্টিৰে ২২ ছেকেণ্ডৰ ৰেহাই দিয়া হৈছে।',
            bn: 'শারীরিক ধীর গতি ও কম্পন শনাক্ত। রোগীকে বিরক্ত না করে ২২ সেকেন্ড সময় প্রদান করা হয়েছে।',
            hi: 'रोगी के हाथों में कंपन एवं शारीरिक गति में ठहराव को सम्मान देते हुए सहायता समय 22 सेकंड तक बढ़ाया गया है।',
          },
        };

      case 'autonomous_mastery':
        return {
          profile,
          displayName: {
            en: 'Autonomous Mastery (Non-Intrusive)',
            as: 'স্বতন্ত্ৰ দক্ষতা (বিনা বাধাত)',
            bn: 'স্বতন্ত্র দক্ষতা (নির্বিঘ্ন)',
            hi: 'स्वायत्त दक्षता (अबाध संज्ञान)',
          },
          assistTimeoutMs: 30000, // 30 seconds
          scaffoldingLevel: 'subtle_cue',
          multiStageTimeouts: {
            voicePromptMs: 22000,
            contextualActionMs: 28000,
            beaconPromptMs: 34000,
            autoCompleteMs: 48000,
          },
          magneticSnapMarginPx: 40,
          tremorDebounceMs: 350,
          clinicalRationale: {
            en: 'High cognitive reserve & rapid retrieval observed. Autonomous flow preserved with non-intrusive on-demand assistance only.',
            as: 'উচ্চ বৌদ্ধিক ক্ষমতা আৰু আত্মবিশ্বাস প্ৰদৰ্শিত হৈছে। কোনো ধৰণৰ অনাহূত বাধা নোহোৱাকৈ স্বতন্ত্ৰভাৱে কৰিবলৈ দিয়া হৈছে।',
            bn: 'উচ্চ বৌদ্ধিক কর্মক্ষমতা পরিলক্ষিত। রোগীর নিজস্ব স্বাধীনতা সম্পূর্ণ বজায় রাখা হয়েছে।',
            hi: 'रोगी की उत्कृष्ट स्मरण शक्ति को देखते हुए सहायता न्यूनतम एवं केवल आवश्यकता पड़ने पर रखी गई है।',
          },
        };

      case 'mild_executive_mci':
      default:
        return {
          profile: 'mild_executive_mci',
          displayName: {
            en: 'MCI Contextual Scaffolding (Dignity-Preserving)',
            as: 'লাহে লাহে সহায়িকা (সন্মান ৰক্ষাকাৰী)',
            bn: 'মৃদু সহায়তা (মর্যাদাপূর্ণ সমর্থন)',
            hi: 'मध्यम संज्ञान सहायता (आत्मसम्मान रक्षक)',
          },
          assistTimeoutMs: 14000, // 14 seconds
          scaffoldingLevel: 'contextual_reduction',
          multiStageTimeouts: {
            voicePromptMs: 10000,
            contextualActionMs: 14000,
            beaconPromptMs: 20000,
            autoCompleteMs: 28000,
          },
          magneticSnapMarginPx: 50,
          tremorDebounceMs: 400,
          clinicalRationale: {
            en: 'Executive hesitation observed with preserved cognitive insight. Contextual distractor reduction deployed after 14s to support dignity without spoon-feeding.',
            as: 'চিন্তাত সামান্য দ্বিধা কিন্তু শুদ্ধ বুজাবুজি দেখা গৈছে। ১৪ ছেকেণ্ডৰ পিছত ১টা ভুল বিকল্প আঁতৰাই আত্মবিশ্বাস অক্ষুণ্ণ ৰখা হৈছে।',
            bn: 'চিন্তায় সামান্য বিলম্ব কিন্তু সঠিক বোধশক্তি বিদ্যমান। আত্মসম্মান অক্ষুণ্ণ রাখতে আংশিক ইঙ্গিত প্রদান করা হচ্ছে।',
            hi: 'हल्की हिचकिचाहट को ध्यान में रखते हुए 14 सेकंड बाद केवल 1 भ्रामक विकल्प हटाकर रोगी के आत्मविश्वास को सहारा दिया गया है।',
          },
        };
    }
  }
}
