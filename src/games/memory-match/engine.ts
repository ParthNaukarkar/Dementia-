import type { SupportedLanguage } from '../../types/prescription';
import { 
  AdaptiveAssistanceEngine, 
  type AssistanceProfileConfig 
} from '../../engine/adaptive-assistance';
import { MEMORY_HERITAGE_ITEMS } from './items';
import type { 
  CardItem, 
  MemoryMatchDifficulty, 
  MemoryMatchSettingsSnapshot, 
  FlipEvent
} from './types';

export const MEMORY_MATCH_TIERS: MemoryMatchDifficulty[] = [
  {
    tier: 1,
    pairCount: 2,
    totalCards: 4,
    gridCols: 2,
    gridRows: 2,
    previewTimeMs: 5000,
    cardFlipBackDelayMs: 1500,
    baseTheta: -2.2,
    description: {
      as: 'স্তৰ ১: ২ যোৰা (৪ কাৰ্ড) - প্ৰাৰম্ভিক অনুশীলন',
      bn: 'স্তর ১: ২ জোড়া (৪ কার্ড) - প্রাথমিক অনুশীলন',
      hi: 'स्तर 1: 2 जोड़ियां (4 कार्ड) - प्रारंभिक अभ्यास',
      en: 'Tier 1: 2 Pairs (4 Cards) - Introductory Visual Span',
    },
  },
  {
    tier: 2,
    pairCount: 3,
    totalCards: 6,
    gridCols: 3,
    gridRows: 2,
    previewTimeMs: 4500,
    cardFlipBackDelayMs: 1400,
    baseTheta: -1.6,
    description: {
      as: 'স্তৰ ২: ৩ যোৰা (৬ কাৰ্ড) - সৰল স্থানিক স্মৃতি',
      bn: 'স্তর ২: ৩ জোড়া (৬ কার্ড) - সহজ স্থানিক স্মৃতি',
      hi: 'स्तर 2: 3 जोड़ियां (6 कार्ड) - सरल स्थानिक स्मरण',
      en: 'Tier 2: 3 Pairs (6 Cards) - Simple Spatial Binding',
    },
  },
  {
    tier: 3,
    pairCount: 4,
    totalCards: 8,
    gridCols: 4,
    gridRows: 2,
    previewTimeMs: 4000,
    cardFlipBackDelayMs: 1300,
    baseTheta: -1.0,
    description: {
      as: 'স্তৰ ৩: ৪ যোৰা (৮ কাৰ্ড) - CANTAB PAL বেঞ্চমাৰ্ক',
      bn: 'স্তর ৩: ৪ জোড়া (৮ কার্ড) - CANTAB PAL বেঞ্চমার্ক',
      hi: 'स्तर 3: 4 जोड़ियां (8 कार्ड) - मानकीकृत CANTAB PAL',
      en: 'Tier 3: 4 Pairs (8 Cards) - Standard CANTAB PAL Benchmark',
    },
  },
  {
    tier: 4,
    pairCount: 5,
    totalCards: 10,
    gridCols: 5,
    gridRows: 2,
    previewTimeMs: 3500,
    cardFlipBackDelayMs: 1200,
    baseTheta: -0.4,
    description: {
      as: 'স্তৰ ৪: ৫ যোৰা (১০ কাৰ্ড) - মধ্যম কাৰ্যকৰী স্মৃতি',
      bn: 'স্তর ৪: ৫ জোড়া (১০ কার্ড) - মাঝারি কার্যকরী স্মৃতি',
      hi: 'स्तर 4: 5 जोड़ियां (10 कार्ड) - मध्यम कार्यकारी स्मृति',
      en: 'Tier 4: 5 Pairs (10 Cards) - Moderate Working Memory',
    },
  },
  {
    tier: 5,
    pairCount: 6,
    totalCards: 12,
    gridCols: 4,
    gridRows: 3,
    previewTimeMs: 3000,
    cardFlipBackDelayMs: 1100,
    baseTheta: 0.2,
    description: {
      as: 'স্তৰ ৫: ৬ যোৰা (১২ কাৰ্ড) - বহুধা উপাদান সংযোগ',
      bn: 'স্তর ৫: ৬ জোড়া (১২ কার্ড) - বহুমাত্রিক স্মৃতি সংযোগ',
      hi: 'स्तर 5: 6 जोड़ियां (12 कार्ड) - बहुआयामी संज्ञान',
      en: 'Tier 5: 6 Pairs (12 Cards) - Multi-Element Associative Span',
    },
  },
  {
    tier: 6,
    pairCount: 8,
    totalCards: 16,
    gridCols: 4,
    gridRows: 4,
    previewTimeMs: 2500,
    cardFlipBackDelayMs: 1000,
    baseTheta: 0.8,
    description: {
      as: 'স্তৰ ৬: ৮ যোৰা (১৬ কাৰ্ড) - স্থানিক নিয়ন্ত্ৰণ অনুশীলন',
      bn: 'স্তর ৬: ৮ জোড়া (১৬ কার্ড) - স্থানিক নিয়ন্ত্রণ অনুশীলন',
      hi: 'स्तर 6: 8 जोड़ियां (16 कार्ड) - स्थानिक नियंत्रण अभ्यास',
      en: 'Tier 6: 8 Pairs (16 Cards) - Spatial Grid Control Span',
    },
  },
  {
    tier: 7,
    pairCount: 10,
    totalCards: 20,
    gridCols: 5,
    gridRows: 4,
    previewTimeMs: 2000,
    cardFlipBackDelayMs: 950,
    baseTheta: 1.4,
    description: {
      as: 'স্তৰ ৭: ১০ যোৰা (২০ কাৰ্ড) - উন্নত সহযোগী স্মৃতি',
      bn: 'স্তর ৭: ১০ জোড়া (২০ কার্ড) - উন্নত সহযোগী স্মৃতি',
      hi: 'स्तर 7: 10 जोड़ियां (20 कार्ड) - उन्नत युग्म स्मरण',
      en: 'Tier 7: 10 Pairs (20 Cards) - Advanced Paired Associates',
    },
  },
  {
    tier: 8,
    pairCount: 12,
    totalCards: 24,
    gridCols: 6,
    gridRows: 4,
    previewTimeMs: 1500,
    cardFlipBackDelayMs: 900,
    baseTheta: 1.9,
    description: {
      as: 'স্তৰ ৮: ১২ যোৰা (২৪ কাৰ্ড) - জটিল স্থানিক অন্বেষণ',
      bn: 'স্তর ৮: ১২ জোড়া (২৪ কার্ড) - জটিল স্থানিক অনুসন্ধান',
      hi: 'स्तर 8: 12 जोड़ियां (24 कार्ड) - गहन स्थानिक अन्वेषण',
      en: 'Tier 8: 12 Pairs (24 Cards) - Complex Spatial Exploration',
    },
  },
  {
    tier: 9,
    pairCount: 15,
    totalCards: 30,
    gridCols: 6,
    gridRows: 5,
    previewTimeMs: 1000,
    cardFlipBackDelayMs: 800,
    baseTheta: 2.4,
    description: {
      as: 'স্তৰ ৯: ১৫ যোৰা (৩০ কাৰ্ড) - সৰ্বোচ্চ স্থানিক স্মৃতি দক্ষতা',
      bn: 'স্তর ৯: ১৫ জোড়া (৩০ কার্ড) - সর্বোচ্চ স্থানিক স্মৃতি দক্ষতা',
      hi: 'स्तर 9: 15 जोड़ियां (30 कार्ड) - सर्वोच्च स्थानिक संज्ञान क्षमता',
      en: 'Tier 9: 15 Pairs (30 Cards) - Maximum Spatial Working Memory',
    },
  },
];

export class MemoryMatchEngine {
  private theta: number;
  private currentTierIndex: number;
  private totalRounds: number;
  private currentRoundIndex: number;
  private lastTapTimestamp: number = 0;
  private tremorTapCount: number = 0;
  private roundLatencies: number[] = [];

  constructor(initialTheta: number = 0.0, totalRounds: number = 3) {
    this.theta = isNaN(initialTheta) ? 0.0 : Math.max(-3.0, Math.min(3.0, initialTheta));
    this.totalRounds = Math.max(1, totalRounds);
    this.currentRoundIndex = 0;
    this.currentTierIndex = this.getNearestTierIndexForTheta(this.theta);
  }

  public getTheta(): number {
    return this.theta;
  }

  public getCurrentTier(): MemoryMatchDifficulty {
    return MEMORY_MATCH_TIERS[this.currentTierIndex];
  }

  public getTierByIndex(index: number): MemoryMatchDifficulty {
    const safeIdx = Math.max(0, Math.min(MEMORY_MATCH_TIERS.length - 1, index));
    return MEMORY_MATCH_TIERS[safeIdx];
  }

  public setTierIndex(index: number) {
    this.currentTierIndex = Math.max(0, Math.min(MEMORY_MATCH_TIERS.length - 1, index));
  }

  public getRoundIndex(): number {
    return this.currentRoundIndex;
  }

  public getTotalRounds(): number {
    return this.totalRounds;
  }

  public getTremorTapCount(): number {
    return this.tremorTapCount;
  }

  public recordLatency(ms: number) {
    if (ms > 0 && ms < 60000) {
      this.roundLatencies.push(ms);
    }
  }

  /**
   * Hardware Tremor Filter (400ms default, shielded against clock skew)
   */
  public filterTremorTap(debounceMs: number = 400): boolean {
    const now = Date.now();
    // Clock-skew protection: if system clock jumped backwards, accept tap and sync
    if (now < this.lastTapTimestamp) {
      this.lastTapTimestamp = now;
      return true;
    }
    const diff = now - this.lastTapTimestamp;
    if (diff < debounceMs) {
      this.tremorTapCount += 1;
      return false; // Suppress hardware tremor double-tap
    }
    this.lastTapTimestamp = now;
    return true;
  }

  /**
   * Generate balanced deck with grid coordinates
   */
  public generateDeck(difficulty: MemoryMatchDifficulty): CardItem[] {
    const selectedSymbols = MEMORY_HERITAGE_ITEMS.slice(0, difficulty.pairCount);
    const deck: CardItem[] = [];

    selectedSymbols.forEach((item) => {
      deck.push({
        id: `${item.pairKey}_A`,
        pairKey: item.pairKey,
        symbol: item.symbol,
        names: item.names,
        culturalSignificance: item.culturalSignificance,
        isFlipped: false,
        isMatched: false,
        gridRow: 0,
        gridCol: 0,
      });
      deck.push({
        id: `${item.pairKey}_B`,
        pairKey: item.pairKey,
        symbol: item.symbol,
        names: item.names,
        culturalSignificance: item.culturalSignificance,
        isFlipped: false,
        isMatched: false,
        gridRow: 0,
        gridCol: 0,
      });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Assign grid coordinates
    deck.forEach((card, idx) => {
      card.gridRow = Math.floor(idx / difficulty.gridCols);
      card.gridCol = idx % difficulty.gridCols;
    });

    return deck;
  }

  /**
   * Calculate Shannon Spatial Search Entropy across 4 grid quadrants.
   * H = - sum(p_i * log2(p_i))
   */
  public calculateSpatialEntropy(flips: FlipEvent[], cols: number, rows: number): number {
    if (flips.length === 0) return 0;

    const midCol = cols / 2;
    const midRow = rows / 2;
    const counts = [0, 0, 0, 0]; // Q1 (TL), Q2 (TR), Q3 (BL), Q4 (BR)

    flips.forEach(f => {
      const isTop = f.gridRow < midRow;
      const isLeft = f.gridCol < midCol;
      if (isTop && isLeft) counts[0]++;
      else if (isTop && !isLeft) counts[1]++;
      else if (!isTop && isLeft) counts[2]++;
      else counts[3]++;
    });

    const total = flips.length;
    let entropy = 0;
    counts.forEach(count => {
      if (count > 0) {
        const p = count / total;
        entropy -= p * Math.log2(p);
      }
    });

    // Return rounded to 3 decimal places (maximum theoretical for 4 bins is 2.0 bits)
    return Number(entropy.toFixed(3));
  }

  /**
   * Derive live patient assistance profile from current telemetry
   */
  public deriveAssistanceProfile(
    consecutiveErrors: number = 0,
    accuracyPct: number = 80,
    hesitationMs: number = 0
  ): AssistanceProfileConfig {
    return AdaptiveAssistanceEngine.deriveAssistanceProfile({
      theta: this.theta,
      tremorTapsCount: this.tremorTapCount,
      recentLatenciesMs: this.roundLatencies,
      consecutiveErrors,
      accuracyPct,
      hesitationMs,
      taskType: 'associative',
    });
  }

  /**
   * Bayesian 2PL IRT Update Step
   */
  public updateTheta(
    pairCount: number,
    totalFlips: number,
    perseverations: number,
    firstTrialCorrect: number,
    wasAutoAssisted: boolean,
    settingsSnapshot: MemoryMatchSettingsSnapshot
  ): {
    newTheta: number;
    newTierIndex: number;
    autonomyScore: number;
    reasoning: Record<SupportedLanguage, string>;
  } {
    const currentDiff = this.getCurrentTier();
    const minPossibleFlips = pairCount * 2;
    // Accuracy efficiency: 1.0 means perfect (0 mistakes), lower means more mistakes
    const efficiency = Math.max(0.1, minPossibleFlips / Math.max(minPossibleFlips, totalFlips));
    const ftcRatio = firstTrialCorrect / pairCount;
    const perseverationPenalty = Math.min(0.5, (perseverations / pairCount) * 0.25);

    // Compute Autonomy Score (0 to 100)
    let autonomy = 100;
    if (wasAutoAssisted) autonomy -= 25;
    if (settingsSnapshot.proactiveHelpRequested) autonomy -= 10;
    if (settingsSnapshot.previewStudyEnabled && currentDiff.tier > 4) autonomy -= 10;
    autonomy -= Math.min(20, perseverations * 3);
    const finalAutonomy = Math.max(10, Math.min(100, Math.round(autonomy)));

    // IRT 2PL parameters
    const a = 1.25; // Discrimination
    const b = currentDiff.baseTheta; // Difficulty anchor
    const expectedProb = 1 / (1 + Math.exp(-a * (this.theta - b)));
    
    // Observed score composite S in [0, 1]
    const observedScore = Math.max(0, Math.min(1, (efficiency * 0.6 + ftcRatio * 0.4) - perseverationPenalty));
    
    // Bayesian step
    const rawDelta = (observedScore - expectedProb) * 0.45;

    // Apply settings impact factor
    let settingsFactor = 1.0;
    if (settingsSnapshot.previewStudyEnabled) settingsFactor *= 0.9;
    if (wasAutoAssisted) settingsFactor *= 0.8;

    const delta = rawDelta * settingsFactor;
    this.theta = Math.max(-3.0, Math.min(3.0, Number((this.theta + delta).toFixed(3))));

    // Determine next tier
    let nextTierIdx = this.currentTierIndex;
    if (observedScore >= 0.75 && delta > 0.08 && this.currentTierIndex < MEMORY_MATCH_TIERS.length - 1) {
      nextTierIdx = this.currentTierIndex + 1;
    } else if (observedScore < 0.40 && delta < -0.08 && this.currentTierIndex > 0) {
      nextTierIdx = this.currentTierIndex - 1;
    }
    this.currentTierIndex = nextTierIdx;

    // Clinical reasoning
    const reasoning: Record<SupportedLanguage, string> = {
      as: delta >= 0
        ? `দক্ষতা যোগাৰ: শুদ্ধতা ${(efficiency * 100).toFixed(0)}%, প্ৰথমবাৰতেই শুদ্ধ ${firstTrialCorrect} যোৰা। থিটা (${this.theta}) লৈ বৃদ্ধি হ’ল।`
        : `সমৰ্থন যোগাৰ: ভুলৰ সংখ্যা আৰু দ্বিধা নিৰীক্ষণ কৰি স্তৰ নিয়ন্ত্ৰণ কৰা হৈছে। নতুন থিটা: ${this.theta}।`,
      bn: delta >= 0
        ? `দক্ষতা মূল্যায়ন: সঠিকতা ${(efficiency * 100).toFixed(0)}%, প্রথম প্রচেষ্টায় সঠিক ${firstTrialCorrect} জোড়া। থিটা (${this.theta}) বৃদ্ধি পেল।`
        : `সহায়তা সমন্বয়: ভুলের সংখ্যা বিবেচনা করে স্তর সমন্বয় করা হলো। নতুন থিটা: ${this.theta}।`,
      hi: delta >= 0
        ? `संज्ञान मूल्यांकन: शुद्धता ${(efficiency * 100).toFixed(0)}%, प्रथम प्रयास में सफल ${firstTrialCorrect} जोड़ियां। थीटा (${this.theta}) बढ़ा।`
        : `सहायता समायोजन: त्रुटियों को ध्यान में रखते हुए स्तर संतुलित किया गया। नया थीटा: ${this.theta}।`,
      en: delta >= 0
        ? `Cognitive Mastery: ${(efficiency * 100).toFixed(0)}% efficiency, ${firstTrialCorrect} FTC pairs. Ability updated to θ = ${this.theta}.`
        : `Scaffolding Support: Calibrated for comfort following error patterns. Ability updated to θ = ${this.theta}.`,
    };

    return {
      newTheta: this.theta,
      newTierIndex: this.currentTierIndex,
      autonomyScore: finalAutonomy,
      reasoning,
    };
  }

  /**
   * Helper: Nearest tier index for given theta
   */
  private getNearestTierIndexForTheta(theta: number): number {
    let bestIdx = 0;
    let minDiff = Infinity;
    MEMORY_MATCH_TIERS.forEach((tier, idx) => {
      const diff = Math.abs(tier.baseTheta - theta);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }

  /**
   * Advance to next round
   */
  public advanceRound() {
    this.currentRoundIndex += 1;
    this.roundLatencies = [];
    this.tremorTapCount = 0;
  }

  public isSessionComplete(): boolean {
    return this.currentRoundIndex >= this.totalRounds;
  }
}
