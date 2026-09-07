import type {
  JigsawDifficulty,
  PuzzlePiece,
  PuzzleTrialTelemetry,
  JigsawSessionSummary,
  VisuomotorProfile,
  ParietalPraxisRating,
} from './types';
import type { SupportedLanguage } from '../../types/prescription';

export class JigsawPraxisEngine {
  private currentTheta: number;
  private consecutiveSuccesses: number = 0;
  private consecutiveErrors: number = 0;
  private lastTapTimestamp: number = 0;
  private tremorTapsFilteredCount: number = 0;
  private currentDifficulty: JigsawDifficulty;

  constructor(initialTheta: number = 0.0) {
    this.currentTheta = initialTheta;
    this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
  }

  /**
   * 13 Fine-Grained Minimal-Step Difficulty Tiers.
   * Progression: 2 -> 4 -> 6 -> 8 -> 9 -> 12 -> 16 -> 20 -> 24 -> 25 -> 30 -> 32 -> 36 pieces.
   * Parameters change minimally between consecutive tiers to ensure zero patient demoralization.
   */
  public deriveDifficultyFromTheta(theta: number): JigsawDifficulty {
    // Tier 1: Clinical Floor: Severe impairment (theta <= -1.0)
    if (theta <= -1.0) {
      return {
        tierLevel: 1,
        gridCols: 2,
        gridRows: 1,
        totalPieces: 2, // 1x2 Left/Right split
        ghostOpacity: 1.0, // 100% full-color twin matching
        allowRotation: false,
        rotationModes: [0],
        snapMarginPx: 80, // Super-magnetic snap
        autoAssistTimeoutMs: 25000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'floor_full_assist',
        trayOrientationPerturbation: 'none',
        dynamicReorientationEnabled: false,
      };
    }

    // Tier 2: Early Impairment (-1.0 < theta <= -0.5)
    if (theta <= -0.5) {
      return {
        tierLevel: 2,
        gridCols: 2,
        gridRows: 2,
        totalPieces: 4,
        ghostOpacity: 0.75,
        allowRotation: false,
        rotationModes: [0],
        snapMarginPx: 70,
        autoAssistTimeoutMs: 30000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'moderate_guidance',
        trayOrientationPerturbation: 'none',
        dynamicReorientationEnabled: false,
      };
    }

    // Tier 3: Mild Impairment Step 1 (-0.5 < theta <= -0.1)
    if (theta <= -0.1) {
      return {
        tierLevel: 3,
        gridCols: 3,
        gridRows: 2,
        totalPieces: 6, // Minimal step from 4 -> 6
        ghostOpacity: 0.60,
        allowRotation: false,
        rotationModes: [0],
        snapMarginPx: 60,
        autoAssistTimeoutMs: 35000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'moderate_guidance',
        trayOrientationPerturbation: 'none',
        dynamicReorientationEnabled: false,
      };
    }

    // Tier 4: Mild Impairment Step 2 (-0.1 < theta <= 0.3)
    if (theta <= 0.3) {
      return {
        tierLevel: 4,
        gridCols: 4,
        gridRows: 2,
        totalPieces: 8, // Minimal step from 6 -> 8
        ghostOpacity: 0.50,
        allowRotation: false,
        rotationModes: [0],
        snapMarginPx: 55,
        autoAssistTimeoutMs: 38000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'moderate_guidance',
        trayOrientationPerturbation: 'none',
        dynamicReorientationEnabled: false,
      };
    }

    // Tier 5: Standard Baseline (0.3 < theta <= 0.7)
    if (theta <= 0.7) {
      return {
        tierLevel: 5,
        gridCols: 3,
        gridRows: 3,
        totalPieces: 9, // Minimal step from 8 -> 9
        ghostOpacity: 0.40,
        allowRotation: false,
        rotationModes: [0],
        snapMarginPx: 50,
        autoAssistTimeoutMs: 40000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'minimal_scaffolding',
        trayOrientationPerturbation: 'none',
        dynamicReorientationEnabled: false,
      };
    }

    // Tier 6: Preserved Intermediate (0.7 < theta <= 1.1)
    if (theta <= 1.1) {
      return {
        tierLevel: 6,
        gridCols: 4,
        gridRows: 3,
        totalPieces: 12, // Minimal step from 9 -> 12
        ghostOpacity: 0.30,
        allowRotation: true,
        rotationModes: [0, 180],
        snapMarginPx: 45,
        autoAssistTimeoutMs: 44000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'minimal_scaffolding',
        trayOrientationPerturbation: 'subtle_180',
        dynamicReorientationEnabled: true,
      };
    }

    // Tier 7: Advanced Visuospatial (1.1 < theta <= 1.5)
    if (theta <= 1.5) {
      return {
        tierLevel: 7,
        gridCols: 4,
        gridRows: 4,
        totalPieces: 16, // Minimal step from 12 -> 16
        ghostOpacity: 0.20,
        allowRotation: true,
        rotationModes: [0, 90, 180, 270],
        snapMarginPx: 38,
        autoAssistTimeoutMs: 48000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'minimal_scaffolding',
        trayOrientationPerturbation: 'full_90_180_270',
        dynamicReorientationEnabled: true,
      };
    }

    // Tier 8: High Cognitive Reserve (1.5 < theta <= 1.8)
    if (theta <= 1.8) {
      return {
        tierLevel: 8,
        gridCols: 5,
        gridRows: 4,
        totalPieces: 20, // Minimal step from 16 -> 20
        ghostOpacity: 0.15,
        allowRotation: true,
        rotationModes: [0, 90, 180, 270],
        snapMarginPx: 32,
        autoAssistTimeoutMs: 50000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'mastery_challenge',
        trayOrientationPerturbation: 'full_90_180_270',
        dynamicReorientationEnabled: true,
      };
    }

    // Tier 9: Superior Synthesis (1.8 < theta <= 2.1)
    if (theta <= 2.1) {
      return {
        tierLevel: 9,
        gridCols: 6,
        gridRows: 4,
        totalPieces: 24, // Minimal step from 20 -> 24
        ghostOpacity: 0.10,
        allowRotation: true,
        rotationModes: [0, 90, 180, 270],
        snapMarginPx: 28,
        autoAssistTimeoutMs: 52000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'mastery_challenge',
        trayOrientationPerturbation: 'full_90_180_270',
        dynamicReorientationEnabled: true,
      };
    }

    // Tier 10: Expert Praxis (2.1 < theta <= 2.4)
    if (theta <= 2.4) {
      return {
        tierLevel: 10,
        gridCols: 5,
        gridRows: 5,
        totalPieces: 25, // Minimal step from 24 -> 25
        ghostOpacity: 0.05,
        allowRotation: true,
        rotationModes: [0, 90, 180, 270],
        snapMarginPx: 24,
        autoAssistTimeoutMs: 55000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'mastery_challenge',
        trayOrientationPerturbation: 'full_90_180_270',
        dynamicReorientationEnabled: true,
      };
    }

    // Tier 11: Complex Grid (2.4 < theta <= 2.6)
    if (theta <= 2.6) {
      return {
        tierLevel: 11,
        gridCols: 6,
        gridRows: 5,
        totalPieces: 30, // Minimal step from 25 -> 30
        ghostOpacity: 0.02,
        allowRotation: true,
        rotationModes: [0, 90, 180, 270],
        snapMarginPx: 20,
        autoAssistTimeoutMs: 58000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'mastery_challenge',
        trayOrientationPerturbation: 'full_90_180_270',
        dynamicReorientationEnabled: true,
      };
    }

    // Tier 12: Master Grid (2.6 < theta <= 2.8)
    if (theta <= 2.8) {
      return {
        tierLevel: 12,
        gridCols: 8,
        gridRows: 4,
        totalPieces: 32, // Minimal step from 30 -> 32
        ghostOpacity: 0.0,
        allowRotation: true,
        rotationModes: [0, 90, 180, 270],
        snapMarginPx: 18,
        autoAssistTimeoutMs: 60000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'mastery_challenge',
        trayOrientationPerturbation: 'full_90_180_270',
        dynamicReorientationEnabled: true,
      };
    }

    // Tier 13: Grandmaster Ceiling (theta > 2.8)
    return {
      tierLevel: 13,
      gridCols: 6,
      gridRows: 6,
      totalPieces: 36, // Minimal step from 32 -> 36
      ghostOpacity: 0.0,
      allowRotation: true,
      rotationModes: [0, 90, 180, 270],
      snapMarginPx: 15,
      autoAssistTimeoutMs: 60000,
      tremorDebounceMs: 400,
      scaffoldingLevel: 'mastery_challenge',
      trayOrientationPerturbation: 'full_90_180_270',
      dynamicReorientationEnabled: true,
    };
  }

  /**
   * Directly retrieves difficulty parameters for a selected piece count.
   * Matches one of the 13 fine-grained tiers.
   */
  public getDifficultyForPieceCount(pieceCount: number): JigsawDifficulty {
    const thetaMap: Record<number, number> = {
      2: -1.2,
      4: -0.7,
      6: -0.3,
      8: 0.1,
      9: 0.5,
      12: 0.9,
      16: 1.3,
      20: 1.6,
      24: 1.9,
      25: 2.2,
      30: 2.5,
      32: 2.7,
      36: 2.9,
    };
    const targetTheta = thetaMap[pieceCount] ?? 0.5;
    return this.deriveDifficultyFromTheta(targetTheta);
  }

  /**
   * Hardware Tremor Debounce Guard (400ms).
   */
  public filterTremorTap(now: number = Date.now()): boolean {
    if (now - this.lastTapTimestamp < this.currentDifficulty.tremorDebounceMs) {
      this.tremorTapsFilteredCount++;
      return false; // Suppress duplicate motor tap
    }
    this.lastTapTimestamp = now;
    return true;
  }

  /**
   * Slices puzzle into grid pieces with initial orientations matching rotation modes.
   */
  public generatePieces(
    cols: number, 
    rows: number, 
    allowRotation: boolean,
    rotationModes: (0 | 90 | 180 | 270)[] = [0]
  ): PuzzlePiece[] {
    const pieces: PuzzlePiece[] = [];
    let idCounter = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let initialRotation = 0;
        if (allowRotation && rotationModes.length > 0) {
          initialRotation = rotationModes[Math.floor(Math.random() * rotationModes.length)];
        }

        pieces.push({
          id: `piece_${idCounter++}_${r}_${c}`,
          correctCol: c,
          correctRow: r,
          currentCol: null,
          currentRow: null,
          rotation: initialRotation,
          isLocked: false,
          isHighlighted: false,
        });
      }
    }

    return this.shuffleArray(pieces);
  }

  /**
   * Evaluates piece placement with precise rotation checking.
   * Returns whether position matches and if rotation was the only error.
   */
  public evaluatePlacement(
    piece: PuzzlePiece,
    targetCol: number,
    targetRow: number,
    currentRotation: number
  ): { isCorrect: boolean; wasCorrectPositionWrongAngle: boolean } {
    const isCorrectPos = piece.correctCol === targetCol && piece.correctRow === targetRow;
    const isCorrectRot = currentRotation % 360 === 0;
    return {
      isCorrect: isCorrectPos && isCorrectRot,
      wasCorrectPositionWrongAngle: isCorrectPos && !isCorrectRot,
    };
  }

  /**
   * High-Level Live Telemetry Analysis:
   * Real-time monitoring of parietal synthesis and angular search patterns during gameplay.
   * Determines if the AI should dynamically perturb tray piece orientations (on rapid flow)
   * or auto-straighten them (on hesitation/angular struggle).
   */
  public analyzeLiveIntervention(params: {
    consecutiveFastSolves: number;
    rotationalErrorsCount: number;
    idleTimeSeconds: number;
    allowRotation: boolean;
    currentPieces: PuzzlePiece[];
  }): {
    action: 'perturb_tray' | 'straighten_tray' | 'none';
    rationale: Record<SupportedLanguage, string>;
    piecesAffected: number;
  } {
    const unplaced = params.currentPieces.filter(p => !p.isLocked);
    if (unplaced.length === 0) {
      return {
        action: 'none',
        rationale: { as: '', bn: '', hi: '', en: '' },
        piecesAffected: 0,
      };
    }

    const hasRotatedPieces = unplaced.some(p => p.rotation !== 0);

    // 1. Apraxia / Hesitation Relief: If patient hesitates (>12s) or has orientation errors
    if ((params.idleTimeSeconds >= 12 || params.rotationalErrorsCount >= 1) && hasRotatedPieces) {
      return {
        action: 'straighten_tray',
        piecesAffected: unplaced.length,
        rationale: {
          as: `কোণীয় দ্বিধাবোধ চিনাক্ত। স্থানিক স্পষ্টতাৰ বাবে AI এ ট্ৰে’ৰ সকলো টুকুৰা পোন (০°) কৰি দিলে।`,
          bn: `কোণীয় দ্বিধাবোধ শনাক্ত। স্থানিক স্পষ্টতার জন্য AI ট্রে-র সব টুকরো সোজা (০°) করে দিল।`,
          hi: `दिशा निर्धारण में समय लगा। AI ने सहायता के लिए ट्रे के सभी टुकड़ों को सीधा (0°) कर दिया।`,
          en: `Angular hesitation detected. AI dynamically auto-aligned all tray pieces upright (0°) to relieve parietal fatigue.`,
        },
      };
    }

    // 2. High Parietal Synthesis Stimulus: If patient solves rapidly without angular errors
    if (
      params.allowRotation &&
      params.consecutiveFastSolves >= 2 &&
      params.rotationalErrorsCount === 0 &&
      !hasRotatedPieces &&
      unplaced.length >= 2
    ) {
      return {
        action: 'perturb_tray',
        piecesAffected: Math.min(4, unplaced.length),
        rationale: {
          as: `উচ্চ স্থানিক ক্ষমতা পৰিলক্ষিত! মানসিক ঘূৰ্ণন ক্ষমতা উদ্দীপিত কৰিবলৈ AI এ ট্ৰে’ৰ টুকুৰাবোৰৰ কোণ সলনি কৰিলে।`,
          bn: `উচ্চ স্থানিক ক্ষমতা পরিলক্ষিত! মানসিক ঘূর্ণন ক্ষমতা উদ্দীপিত করতে AI ট্রে-র টুকরোগুলির কোণ পরিবর্তন করল।`,
          hi: `उत्कृष्ट स्थानिक समझ! घूर्णन क्षमता को चुनौती देने के लिए AI ने ट्रे के टुकड़ों को घुमा दिया।`,
          en: `Rapid spatial synthesis detected! AI dynamically perturbed tray piece angles (90°/180°/270°) to engage right parietal mental rotation.`,
        },
      };
    }

    return {
      action: 'none',
      rationale: { as: '', bn: '', hi: '', en: '' },
      piecesAffected: 0,
    };
  }

  /**
   * Perturbs unplaced pieces in tray into rotated orientations.
   */
  public perturbTrayPieces(
    pieces: PuzzlePiece[],
    modes: (0 | 90 | 180 | 270)[] = [90, 180, 270]
  ): { modifiedPieces: PuzzlePiece[]; changedCount: number } {
    let changed = 0;
    const modified = pieces.map(p => {
      if (!p.isLocked) {
        const nonZeroModes = modes.filter(m => m !== 0);
        const nextRot = nonZeroModes.length > 0 
          ? nonZeroModes[Math.floor(Math.random() * nonZeroModes.length)]
          : 90;
        changed++;
        return { ...p, rotation: nextRot };
      }
      return p;
    });
    return { modifiedPieces: modified, changedCount: changed };
  }

  /**
   * Straightens all unplaced pieces in tray upright to 0 degrees.
   */
  public straightenTrayPieces(pieces: PuzzlePiece[]): { modifiedPieces: PuzzlePiece[]; changedCount: number } {
    let changed = 0;
    const modified = pieces.map(p => {
      if (!p.isLocked && p.rotation !== 0) {
        changed++;
        return { ...p, rotation: 0 };
      }
      return p;
    });
    return { modifiedPieces: modified, changedCount: changed };
  }

  /**
   * Updates Bayesian ability theta based on trial performance, titrates difficulty,
   * and generates human-readable clinical rationale for the AI adaptation.
   */
  public updateTheta(
    isFullSolveSuccess: boolean,
    misplacements: number,
    usedAutoAssist: boolean
  ): { newTheta: number; reasoning: Record<SupportedLanguage, string> } {
    const prevTheta = this.currentTheta;
    const currentDiff = this.currentDifficulty;

    const itemDifficultyB = (currentDiff.tierLevel - 5) * 0.35 
      - currentDiff.ghostOpacity * 1.0 
      + (currentDiff.allowRotation ? 0.6 : -0.4);

    const discriminationA = 1.2;

    let reasoning: Record<SupportedLanguage, string>;

    if (isFullSolveSuccess && !usedAutoAssist && misplacements <= 1) {
      this.consecutiveSuccesses++;
      this.consecutiveErrors = 0;

      const expectedProb = 1 / (1 + Math.exp(-discriminationA * (this.currentTheta - itemDifficultyB)));
      const delta = (1 - expectedProb) * 0.28;
      this.currentTheta = Math.min(3.0, this.currentTheta + delta);

      // Titrate difficulty smoothly
      this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);

      if (this.currentDifficulty.tierLevel > currentDiff.tierLevel) {
        reasoning = {
          as: `উচ্চ স্থানিক সমন্বয় পৰিলক্ষিত (θ: ${this.currentTheta.toFixed(2)})! AI এ স্তৰ ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.totalPieces} টুকুৰা) লৈ ন্যূনতম পৰিৱৰ্তন কৰি সহায়িকা স্বচ্ছতা হ্ৰাস কৰিলে।`,
          bn: `উচ্চ স্থানিক সমন্বয় পরিলক্ষিত (θ: ${this.currentTheta.toFixed(2)})! AI স্তর ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.totalPieces} টুকরো)-এ মসৃণ পরিবর্তন করে সহায়ক স্বচ্ছতা হ্রাস করল।`,
          hi: `उत्कृष्ट स्थानिक संतुलन (θ: ${this.currentTheta.toFixed(2)})! AI ने स्तर ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.totalPieces} टुकड़े) पर सूक्ष्म समायोजन किया।`,
          en: `High spatial praxis observed (θ: ${this.currentTheta.toFixed(2)})! AI titrated smoothly to Tier ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.totalPieces} pieces) with ${Math.round(this.currentDifficulty.ghostOpacity * 100)}% ghost guide.`,
        };
      } else {
        reasoning = {
          as: `সফল সমাধান। স্থানিক ক্ষমতা θ: ${prevTheta.toFixed(2)} ৰ পৰা ${this.currentTheta.toFixed(2)} লৈ বৃদ্ধি পালে।`,
          bn: `সফল সমাধান। স্থানিক ক্ষমতা θ: ${prevTheta.toFixed(2)} থেকে ${this.currentTheta.toFixed(2)}-এ বৃদ্ধি পেল।`,
          hi: `सफल समाधान। स्थानिक क्षमता θ: ${prevTheta.toFixed(2)} से बढ़कर ${this.currentTheta.toFixed(2)} हो गई।`,
          en: `Accurate solve. Spatial ability theta consolidated from ${prevTheta.toFixed(2)} to ${this.currentTheta.toFixed(2)}.`,
        };
      }
    } else {
      this.consecutiveErrors++;
      this.consecutiveSuccesses = 0;

      const delta = (usedAutoAssist ? 0.35 : 0.20) + Math.min(0.15, misplacements * 0.04);
      this.currentTheta = Math.max(-3.0, this.currentTheta - delta);

      this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);

      if (this.currentDifficulty.totalPieces === 2) {
        reasoning = {
          as: `ধীৰ গতিৰ প্ৰক্ৰিয়াকৰণ চিনাক্ত। AI এ আত্মসন্মান ৰক্ষাৰ বাবে খেলখন ২টা সহজ টুকুৰা (১x২) আৰু ১০০% সম্পূৰ্ণ সহায়িকা ছবিলৈ সহজ কৰি দিলে।`,
          bn: `ধীর গতির প্রক্রিয়াকরণ শনাক্ত। AI আত্মমর্যাদা রক্ষার জন্য খেলাটি ২টি সহজ টুকরো (১x২) এবং ১০০% সম্পূর্ণ সহায়ক ছবিতে সহজ করে দিল।`,
          hi: `सोचने में समय लगा। AI ने सम्मान रक्षा के लिए स्तर को सरल करके केवल 2 टुकड़े (1x2) और 100% रंगीन मार्गदर्शक पर निर्धारित किया।`,
          en: `High deliberation detected. AI calibrated down to the clinical floor: 2 pieces (1x2 Left/Right) with 100% full-color twin matching and 80px magnetic snap.`,
        };
      } else {
        reasoning = {
          as: `স্থানিক সমন্বয় সহায় সক্ৰিয়। AI এ সহায়িকা ছবিৰ স্পষ্টতা ${Math.round(this.currentDifficulty.ghostOpacity * 100)}% লৈ বৃদ্ধি কৰিলে।`,
          bn: `স্থানিক সমন্বয় সাহায্য সক্রিয়। AI সহায়ক ছবির স্পষ্টতা ${Math.round(this.currentDifficulty.ghostOpacity * 100)}%-এ বৃদ্ধি করল।`,
          hi: `सहायक मार्गदर्शन सक्रिय। AI ने सहायक चित्र की स्पष्टता बढ़ाकर ${Math.round(this.currentDifficulty.ghostOpacity * 100)}% कर दी।`,
          en: `Spatial guidance activated. AI adapted to Tier ${this.currentDifficulty.tierLevel} (${this.currentDifficulty.totalPieces} pieces) with ${Math.round(this.currentDifficulty.ghostOpacity * 100)}% ghost outline.`,
        };
      }
    }

    return { newTheta: this.currentTheta, reasoning };
  }

  /**
   * Finds the next unplaced piece to highlight for Dignity Auto-Assist.
   */
  public getNextAssistPiece(pieces: PuzzlePiece[]): PuzzlePiece | null {
    const unplaced = pieces.filter(p => !p.isLocked);
    if (unplaced.length === 0) return null;
    const corner = unplaced.find(p => p.correctCol === 0 && p.correctRow === 0);
    return corner || unplaced[0];
  }

  /**
   * Compiles the complete clinical session summary payload for Caregiver Dashboard & Physician Reports.
   */
  public compileSessionSummary(
    trials: PuzzleTrialTelemetry[],
    caregiverEndedEarly: boolean = false
  ): JigsawSessionSummary {
    const totalPuzzles = trials.length;
    const solvedPuzzles = trials.filter(t => t.piecesPlacedCorrectly === t.totalPieces).length;
    const accuracyPercentage = totalPuzzles > 0 ? Math.round((solvedPuzzles / totalPuzzles) * 100) : 0;
    
    const totalMisplacements = trials.reduce((acc, t) => acc + t.misplacementsCount, 0);
    const totalRotationalErrors = trials.reduce((acc, t) => acc + (t.rotationalErrorsCount || 0), 0);
    const autoAssistedRounds = trials.filter(t => t.wasAutoAssisted).length;

    const totalSolveTimeMs = trials.reduce((acc, t) => acc + t.totalSolveTimeMs, 0);
    const meanSolveTimeSeconds = totalPuzzles > 0 ? Math.round((totalSolveTimeMs / totalPuzzles) / 1000) : 0;

    const meanParietalSynthesisIndex = totalPuzzles > 0
      ? Math.round(trials.reduce((acc, t) => acc + (t.parietalSynthesisIndex || 0), 0) / totalPuzzles)
      : 0;

    const totalAIDynamicInterventions = trials.reduce(
      (acc, t) => acc + (t.aiDynamicActions?.length || 0), 
      0
    );

    // WAIS-IV Block Design equivalent score (0 to 5 points)
    const spatialPraxisScore = Math.max(0, Math.min(5, Math.round((this.currentTheta + 2.5) * 1.0)));

    // CERAD Visuoconstructional Praxis standard scale (0 to 14 points)
    const estimatedCERADPraxisScore = Math.max(0, Math.min(14, Math.round(spatialPraxisScore * 2.8)));

    // Visuomotor profile determination
    let visuomotorProfile: VisuomotorProfile = 'fluid';
    if (autoAssistedRounds >= 2 || totalMisplacements > 5) {
      visuomotorProfile = 'marked_apraxia';
    } else if (meanSolveTimeSeconds > 40) {
      visuomotorProfile = 'hesitant';
    } else if (totalMisplacements >= 3 || this.tremorTapsFilteredCount >= 4) {
      visuomotorProfile = 'tremor_dominant';
    }

    // Right Parietal Lobe Function Rating
    let parietalPraxisRating: ParietalPraxisRating = 'preserved';
    if (this.currentTheta <= -0.5 || autoAssistedRounds > 0) {
      parietalPraxisRating = 'marked_constructional_apraxia';
    } else if (this.currentTheta < 0.5 || totalMisplacements > 2) {
      parietalPraxisRating = 'mild_slowing';
    }

    const scaffoldingReliancePercentage = totalPuzzles > 0 
      ? Math.round((autoAssistedRounds / totalPuzzles) * 100)
      : 0;

    return {
      gameId: 'jigsaw-puzzle',
      totalPuzzles,
      solvedPuzzles,
      accuracyPercentage,
      meanSolveTimeSeconds,
      totalMisplacements,
      totalRotationalErrors,
      meanParietalSynthesisIndex,
      totalAIDynamicInterventions,
      spatialPraxisScore,
      estimatedCERADPraxisScore,
      visuomotorProfile,
      parietalPraxisRating,
      tremorTapsFilteredCount: this.tremorTapsFilteredCount,
      scaffoldingReliancePercentage,
      finalTheta: Number(this.currentTheta.toFixed(2)),
      autoAssistedRounds,
      completedAt: new Date().toISOString(),
      caregiverEndedEarly,
      trials,
    };
  }

  public getDifficulty(): JigsawDifficulty {
    return this.currentDifficulty;
  }

  public setDifficulty(diff: JigsawDifficulty) {
    this.currentDifficulty = diff;
  }

  public getTheta(): number {
    return this.currentTheta;
  }

  public setTheta(theta: number) {
    this.currentTheta = theta;
    this.currentDifficulty = this.deriveDifficultyFromTheta(theta);
  }

  public getTremorFilteredCount(): number {
    return this.tremorTapsFilteredCount;
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

