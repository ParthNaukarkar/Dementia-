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
   * Translates continuous latent ability theta into the 7 clinical parameters.
   */
  public deriveDifficultyFromTheta(theta: number): JigsawDifficulty {
    // 1. Clinical Floor: Severe impairment or frustration (theta <= -0.8)
    if (theta <= -0.8) {
      return {
        gridCols: 2,
        gridRows: 1, // 1x2 = 2 pieces total (Left & Right halves)
        totalPieces: 2,
        ghostOpacity: 1.0, // 100% full-color twin matching
        allowRotation: false, // 0 deg locked upright
        snapMarginPx: 80, // Super-magnetic snap (accommodates severe tremors)
        autoAssistTimeoutMs: 25000, // Faster dignity assist before distress
        tremorDebounceMs: 400,
        scaffoldingLevel: 'floor_full_assist',
      };
    }

    // 2. Mild-to-Moderate Impairment (Floor to Standard Baseline: -0.8 < theta < 0.8)
    if (theta < 0.8) {
      return {
        gridCols: 2,
        gridRows: 2, // 2x2 = 4 pieces
        totalPieces: 4,
        ghostOpacity: 0.40, // 40% visible guiding outline
        allowRotation: false, // Locked upright (no mental rotation demand)
        snapMarginPx: 60,
        autoAssistTimeoutMs: 35000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'moderate_guidance',
      };
    }

    // 3. Mild Cognitive Preservation (0.8 <= theta < 1.4)
    if (theta < 1.4) {
      return {
        gridCols: 3,
        gridRows: 2, // 3x2 = 6 pieces
        totalPieces: 6,
        ghostOpacity: 0.20,
        allowRotation: false,
        snapMarginPx: 40,
        autoAssistTimeoutMs: 45000,
        tremorDebounceMs: 400,
        scaffoldingLevel: 'minimal_scaffolding',
      };
    }

    // 4. Ceiling: Intact Healthy Elder / High Preservation (theta >= 1.4)
    return {
      gridCols: 3,
      gridRows: 3, // 3x3 = 9 pieces
      totalPieces: 9,
      ghostOpacity: 0.0, // 0% opacity (pure spatial reconstruction from memory)
      allowRotation: true, // Mental rotation enabled (90 deg increments)
      snapMarginPx: 25,
      autoAssistTimeoutMs: 50000,
      tremorDebounceMs: 400,
      scaffoldingLevel: 'minimal_scaffolding',
    };
  }

  /**
   * Tremor debouncing filter (400ms guard against parkinsonian / essential tremors).
   */
  public filterTremorTap(now: number = Date.now()): boolean {
    if (now - this.lastTapTimestamp < this.currentDifficulty.tremorDebounceMs) {
      this.tremorTapsFilteredCount++;
      return false; // Suppress tremor duplicate
    }
    this.lastTapTimestamp = now;
    return true;
  }

  /**
   * Slices a puzzle image into the designated grid of pieces.
   */
  public generatePieces(cols: number, rows: number, allowRotation: boolean): PuzzlePiece[] {
    const pieces: PuzzlePiece[] = [];
    let idCounter = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let initialRotation = 0;
        if (allowRotation) {
          const rotations = [0, 90, 180, 270];
          initialRotation = rotations[Math.floor(Math.random() * rotations.length)];
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
   * Evaluates piece placement against correct coordinates and rotation.
   */
  public evaluatePlacement(
    piece: PuzzlePiece,
    targetCol: number,
    targetRow: number,
    currentRotation: number
  ): boolean {
    const isCorrectPos = piece.correctCol === targetCol && piece.correctRow === targetRow;
    const isCorrectRot = currentRotation % 360 === 0;
    return isCorrectPos && isCorrectRot;
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

    const itemDifficultyB = (currentDiff.totalPieces - 4) * 0.45 
      - currentDiff.ghostOpacity * 1.2 
      + (currentDiff.allowRotation ? 0.8 : -0.5);

    const discriminationA = 1.25;

    let reasoning: Record<SupportedLanguage, string>;

    if (isFullSolveSuccess && !usedAutoAssist && misplacements <= 1) {
      this.consecutiveSuccesses++;
      this.consecutiveErrors = 0;

      const expectedProb = 1 / (1 + Math.exp(-discriminationA * (this.currentTheta - itemDifficultyB)));
      const delta = (1 - expectedProb) * 0.32;
      this.currentTheta = Math.min(3.0, this.currentTheta + delta);

      if (this.consecutiveSuccesses >= 2 || this.currentTheta >= 0.8) {
        this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
        reasoning = {
          as: `উচ্চ স্থানিক ক্ষমতা পৰিলক্ষিত (θ: ${this.currentTheta.toFixed(2)})! AI এ টুকুৰা সংখ্যা ${this.currentDifficulty.totalPieces} লৈ বৃদ্ধি কৰি সহায়িকা ছবিৰ স্বচ্ছতা হ্ৰাস কৰিলে।`,
          bn: `উচ্চ স্থানিক ক্ষমতা পরিলক্ষিত (θ: ${this.currentTheta.toFixed(2)})! AI টুকরো সংখ্যা ${this.currentDifficulty.totalPieces}-এ বৃদ্ধি করে সহায়ক ছবির স্বচ্ছতা হ্রাস করল।`,
          hi: `उत्कृष्ट स्थानिक क्षमता देखी गई (θ: ${this.currentTheta.toFixed(2)})! AI ने टुकड़ों की संख्या बढ़ाकर ${this.currentDifficulty.totalPieces} की और सहायक चित्र की पारदर्शिता कम की।`,
          en: `High spatial praxis observed (θ: ${this.currentTheta.toFixed(2)})! AI escalated piece count to ${this.currentDifficulty.totalPieces} and faded ghost guide to ${Math.round(this.currentDifficulty.ghostOpacity * 100)}% for cognitive stimulation.`,
        };
      } else {
        reasoning = {
          as: `সফল সমাধান। স্থানিক ক্ষমতা θ: ${prevTheta.toFixed(2)} ৰ পৰা ${this.currentTheta.toFixed(2)} লৈ উন্নত হ’ল।`,
          bn: `সফল সমাধান। স্থানিক ক্ষমতা θ: ${prevTheta.toFixed(2)} থেকে ${this.currentTheta.toFixed(2)}-এ উন্নত হলো।`,
          hi: `सफल समाधान। स्थानिक क्षमता θ: ${prevTheta.toFixed(2)} से बढ़कर ${this.currentTheta.toFixed(2)} हो गई।`,
          en: `Accurate solve. Spatial ability theta strengthened from ${prevTheta.toFixed(2)} to ${this.currentTheta.toFixed(2)}.`,
        };
      }
    } else {
      this.consecutiveErrors++;
      this.consecutiveSuccesses = 0;

      const delta = (usedAutoAssist ? 0.45 : 0.25) + Math.min(0.2, misplacements * 0.05);
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
          en: `Spatial guidance activated. AI increased ghost opacity to ${Math.round(this.currentDifficulty.ghostOpacity * 100)}% and expanded magnetic snap tolerance to ${this.currentDifficulty.snapMarginPx}px.`,
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
    const autoAssistedRounds = trials.filter(t => t.wasAutoAssisted).length;

    const totalSolveTimeMs = trials.reduce((acc, t) => acc + t.totalSolveTimeMs, 0);
    const meanSolveTimeSeconds = totalPuzzles > 0 ? Math.round((totalSolveTimeMs / totalPuzzles) / 1000) : 0;

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
