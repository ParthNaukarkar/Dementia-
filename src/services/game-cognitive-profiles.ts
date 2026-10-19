/**
 * Smriti-NER: Game Cognitive Profiles Registry
 * 
 * Defines domain-specific neuropsychological baselines for each cognitive game.
 * Decouples physical motor tremor from cognitive processing speed, and establishes
 * game-specific normative latencies so complex assembly games (like Jigsaw) or narrative
 * comprehension (like Brain Story) are never evaluated against naive stopwatch thresholds.
 */

export type ClinicalCognitiveDomain = 
  | 'HIPPOCAMPAL_VISUAL_MEMORY'
  | 'WORKING_MEMORY_SPAN'
  | 'VISUOSPATIAL_ATTENTION'
  | 'EPISODIC_NARRATIVE_MEMORY'
  | 'PHONOLOGICAL_LOOP'
  | 'VISUOMOTOR_CONSTRUCTIVE_PRAXIS'
  | 'EXECUTIVE_ABSTRACT_SORTING'
  | 'VISUOSPATIAL_MATRIX_MEMORY'
  | 'TOPOGRAPHICAL_ORIENTATION'
  | 'ECOLOGICAL_EVERYDAY_RECOGNITION';

export interface GameCognitiveProfile {
  gameId: string;
  displayName: string;
  domain: ClinicalCognitiveDomain;
  targetMCIRelevance: string;
  
  // Game-specific millisecond normative response boundaries for elderly (age 60-85)
  latencyNorms: {
    optimalFastMs: number;    // Confident, rapid processing in this specific task
    optimalNormalMs: number;  // Healthy deliberate processing in this specific task
    deliberationMs: number;   // Cognitive search/hesitation threshold
    fatigueLimitMs: number;   // True cognitive strain/exhaustion threshold
  };

  // Importance weighting for multidimensional composite score (must sum to ~1.0)
  weights: {
    accuracy: number;            // Weight of correct recall/assembly
    processingSpeed: number;     // Weight of motor-corrected processing speed
    perseverationPenalty: number; // Penalty for repetitive frontal intrusion errors
  };

  // Physical motor sensitivity (0.0 to 1.0):
  // How much does touchscreen tremor (Parkinson's, arthritis) artificially inflate raw latency?
  // Jigsaw (drag & drop) = 0.85; Brain Story (single tap) = 0.15
  motorTremorImpactFactor: number;

  // Custom clinical prompt injection for OpenAI GPT-4o-mini / Gemini
  expertLLMPromptContext: string;
}

export const GAME_COGNITIVE_PROFILES: Record<string, GameCognitiveProfile> = {
  'memory-match': {
    gameId: 'memory-match',
    displayName: 'Memory Match',
    domain: 'HIPPOCAMPAL_VISUAL_MEMORY',
    targetMCIRelevance: 'Hippocampal paired-associate binding and spatial grid encoding.',
    latencyNorms: {
      optimalFastMs: 1400,
      optimalNormalMs: 2600,
      deliberationMs: 4200,
      fatigueLimitMs: 6500,
    },
    weights: {
      accuracy: 0.65,
      processingSpeed: 0.20,
      perseverationPenalty: 0.15,
    },
    motorTremorImpactFactor: 0.35,
    expertLLMPromptContext: 'Memory Match evaluates visual paired-associate memory. Card flip latency between 1.5s-3.0s is healthy. High accuracy with zero perseverations indicates intact medial temporal lobe function.',
  },

  'sequence-recall': {
    gameId: 'sequence-recall',
    displayName: 'Sequence Recall',
    domain: 'WORKING_MEMORY_SPAN',
    targetMCIRelevance: 'Dorsolateral prefrontal working memory span and temporal ordering.',
    latencyNorms: {
      optimalFastMs: 1600,
      optimalNormalMs: 3200,
      deliberationMs: 5000,
      fatigueLimitMs: 8000,
    },
    weights: {
      accuracy: 0.70,
      processingSpeed: 0.15,
      perseverationPenalty: 0.15,
    },
    motorTremorImpactFactor: 0.25,
    expertLLMPromptContext: 'Sequence Recall measures working memory span. Note: Very fast latencies (<1.5s) combined with low accuracy (<50%) indicate impulsivity and frontal disinhibition, which requires slowing down and impulse scaffolding, not praise.',
  },

  'what-changed': {
    gameId: 'what-changed',
    displayName: 'What Changed?',
    domain: 'VISUOSPATIAL_ATTENTION',
    targetMCIRelevance: 'Parietal visual salience, flicker change detection, and spatial scanning.',
    latencyNorms: {
      optimalFastMs: 2200,
      optimalNormalMs: 4500,
      deliberationMs: 7500,
      fatigueLimitMs: 12000,
    },
    weights: {
      accuracy: 0.70,
      processingSpeed: 0.20,
      perseverationPenalty: 0.10,
    },
    motorTremorImpactFactor: 0.20,
    expertLLMPromptContext: 'What Changed tests visual change blindness. The elder must scan multiple visual objects. Deliberation of 3.0s-6.0s is normal visual search time, not cognitive slowing.',
  },

  'brain-story': {
    gameId: 'brain-story',
    displayName: 'Brain Story',
    domain: 'EPISODIC_NARRATIVE_MEMORY',
    targetMCIRelevance: 'Ecological narrative retention, delayed story recall, and auditory comprehension.',
    latencyNorms: {
      optimalFastMs: 4000,
      optimalNormalMs: 9000,
      deliberationMs: 16000,
      fatigueLimitMs: 30000,
    },
    weights: {
      accuracy: 0.85,
      processingSpeed: 0.15,
      perseverationPenalty: 0.00,
    },
    motorTremorImpactFactor: 0.10,
    expertLLMPromptContext: 'Brain Story evaluates reading and auditory story comprehension. Taking 6s-15s to read, reflect, and answer a question is normal and reflective of careful executive processing. NEVER demote purely for thoughtful narrative deliberation.',
  },

  'number-recall': {
    gameId: 'number-recall',
    displayName: 'Number Recall',
    domain: 'PHONOLOGICAL_LOOP',
    targetMCIRelevance: 'Auditory-verbal short term memory and forward/backward digit span.',
    latencyNorms: {
      optimalFastMs: 1500,
      optimalNormalMs: 3400,
      deliberationMs: 5500,
      fatigueLimitMs: 8500,
    },
    weights: {
      accuracy: 0.75,
      processingSpeed: 0.15,
      perseverationPenalty: 0.10,
    },
    motorTremorImpactFactor: 0.20,
    expertLLMPromptContext: 'Number Recall tests digit span capacity. Latency reflects internal phonological rehearsal.',
  },

  'jigsaw-puzzle': {
    gameId: 'jigsaw-puzzle',
    displayName: 'Jigsaw Praxis',
    domain: 'VISUOMOTOR_CONSTRUCTIVE_PRAXIS',
    targetMCIRelevance: 'Parietal visuoconstruction, mental spatial rotation, and fine motor praxis.',
    latencyNorms: {
      optimalFastMs: 15000,   // 15 seconds to solve a multi-piece jigsaw
      optimalNormalMs: 35000,  // 35 seconds is standard for healthy elders
      deliberationMs: 65000,   // 65 seconds
      fatigueLimitMs: 110000,  // 110 seconds is true exhaustion
    },
    weights: {
      accuracy: 0.80,
      processingSpeed: 0.20,
      perseverationPenalty: 0.00,
    },
    motorTremorImpactFactor: 0.85, // Highly sensitive to hand tremor dragging
    expertLLMPromptContext: 'Jigsaw Praxis tests constructive praxis. Completing a 9-piece puzzle in 20s-50s with high accuracy is exceptional performance for an elderly patient. NEVER apply generic sub-5s latency rules to this puzzle game.',
  },

  'odd-one-out': {
    gameId: 'odd-one-out',
    displayName: 'Odd One Out',
    domain: 'EXECUTIVE_ABSTRACT_SORTING',
    targetMCIRelevance: 'Frontal cognitive flexibility, conceptual abstraction, and categorization.',
    latencyNorms: {
      optimalFastMs: 1800,
      optimalNormalMs: 3800,
      deliberationMs: 6500,
      fatigueLimitMs: 10000,
    },
    weights: {
      accuracy: 0.70,
      processingSpeed: 0.20,
      perseverationPenalty: 0.10,
    },
    motorTremorImpactFactor: 0.20,
    expertLLMPromptContext: 'Odd One Out tests executive semantic abstraction. The patient must deduct category rules.',
  },

  'pattern-recall': {
    gameId: 'pattern-recall',
    displayName: 'Pattern Recall',
    domain: 'VISUOSPATIAL_MATRIX_MEMORY',
    targetMCIRelevance: 'Visuospatial sketchpad and non-verbal matrix pattern retention.',
    latencyNorms: {
      optimalFastMs: 1600,
      optimalNormalMs: 3400,
      deliberationMs: 5500,
      fatigueLimitMs: 8500,
    },
    weights: {
      accuracy: 0.70,
      processingSpeed: 0.20,
      perseverationPenalty: 0.10,
    },
    motorTremorImpactFactor: 0.25,
    expertLLMPromptContext: 'Pattern Recall evaluates spatial grid pattern memory.',
  },

  'where-am-i': {
    gameId: 'where-am-i',
    displayName: 'Where Am I?',
    domain: 'TOPOGRAPHICAL_ORIENTATION',
    targetMCIRelevance: 'Spatial navigation, landmark orientation, and environmental clue deduction.',
    latencyNorms: {
      optimalFastMs: 2800,
      optimalNormalMs: 6500,
      deliberationMs: 12000,
      fatigueLimitMs: 22000,
    },
    weights: {
      accuracy: 0.75,
      processingSpeed: 0.15,
      perseverationPenalty: 0.10,
    },
    motorTremorImpactFactor: 0.20,
    expertLLMPromptContext: 'Where Am I tests topographical orientation and clue-based spatial deduction. Deliberating on clues for 5s-10s is normal cognitive processing.',
  },

  'smriti-haat': {
    gameId: 'smriti-haat',
    displayName: 'Smriti Haat',
    domain: 'ECOLOGICAL_EVERYDAY_RECOGNITION',
    targetMCIRelevance: 'Real-world prospective and delayed recognition memory in an everyday Indian market context.',
    latencyNorms: {
      optimalFastMs: 3500,
      optimalNormalMs: 8000,
      deliberationMs: 16000,
      fatigueLimitMs: 26000,
    },
    weights: {
      accuracy: 0.75,
      processingSpeed: 0.15,
      perseverationPenalty: 0.10,
    },
    motorTremorImpactFactor: 0.30,
    expertLLMPromptContext: 'Smriti Haat simulates real-world bazaar shopping memory. Patients need time to scan stall items. Do not penalize natural shopping deliberation under 12 seconds.',
  },
};

/**
 * Returns the cognitive profile for a game, or a safe adaptive default
 */
export function getGameCognitiveProfile(gameId: string): GameCognitiveProfile {
  const normalizedId = (gameId || '').toLowerCase().trim();
  if (GAME_COGNITIVE_PROFILES[normalizedId]) {
    return GAME_COGNITIVE_PROFILES[normalizedId];
  }
  
  // Safe generic default
  return {
    gameId: normalizedId,
    displayName: gameId,
    domain: 'WORKING_MEMORY_SPAN',
    targetMCIRelevance: 'General cognitive stimulation.',
    latencyNorms: {
      optimalFastMs: 1800,
      optimalNormalMs: 3500,
      deliberationMs: 6000,
      fatigueLimitMs: 9500,
    },
    weights: {
      accuracy: 0.70,
      processingSpeed: 0.20,
      perseverationPenalty: 0.10,
    },
    motorTremorImpactFactor: 0.30,
    expertLLMPromptContext: 'Adapt difficulty smoothly to maintain the elder in their optimal Zone of Proximal Development.',
  };
}
