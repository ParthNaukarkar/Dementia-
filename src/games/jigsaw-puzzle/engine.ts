import type {
  JigsawDifficulty,
  PuzzlePiece,
  PuzzleTrialTelemetry,
  JigsawSessionSummary,
  VisuomotorProfile,
} from './types';

export class JigsawPraxisEngine {
  private currentTheta: number;
  private consecutiveSuccesses: number = 0;
  private consecutiveErrors: number = 0;
  private lastTapTimestamp: number = 0;
  private currentDifficulty: JigsawDifficulty;

  constructor(initialTheta: number = 0.0) {
    this.currentTheta = initialTheta;
    this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
  }

  /**
   * Translates continuous latent ability theta into the 7 clinical parameters.
   * Clinically bounded from Floor (theta <= -0.8) to Ceiling (theta >= +1.5).
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
          // Randomized rotation in 90 deg steps for ceiling difficulty
          const rotations = [0, 90, 180, 270];
          initialRotation = rotations[Math.floor(Math.random() * rotations.length)];
        }

        pieces.push({
          id: `piece_${idCounter++}_${r}_${c}`,
          correctCol: c,
          correctRow: r,
          currentCol: null, // Starts in tray
          currentRow: null,
          rotation: initialRotation,
          isLocked: false,
          isHighlighted: false,
        });
      }
    }

    // Shuffle tray order to randomize placement
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
   * Updates Bayesian ability theta based on trial performance and titrates difficulty.
   */
  public updateTheta(isFullSolveSuccess: boolean, misplacements: number, usedAutoAssist: boolean): number {
    const currentDiff = this.currentDifficulty;
    // Item difficulty parameter b
    const itemDifficultyB = (currentDiff.totalPieces - 4) * 0.45 
      - currentDiff.ghostOpacity * 1.2 
      + (currentDiff.allowRotation ? 0.8 : -0.5);

    const discriminationA = 1.25; // 2PL IRT discrimination slope

    if (isFullSolveSuccess && !usedAutoAssist && misplacements <= 1) {
      this.consecutiveSuccesses++;
      this.consecutiveErrors = 0;

      // Bayesian MAP ability step
      const expectedProb = 1 / (1 + Math.exp(-discriminationA * (this.currentTheta - itemDifficultyB)));
      const delta = (1 - expectedProb) * 0.32;
      this.currentTheta = Math.min(3.0, this.currentTheta + delta);

      // Titrate difficulty upward after 2 clean solves
      if (this.consecutiveSuccesses >= 2) {
        this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
        this.consecutiveSuccesses = 0;
      }
    } else {
      this.consecutiveErrors++;
      this.consecutiveSuccesses = 0;

      // Drop ability theta
      const delta = (usedAutoAssist ? 0.45 : 0.25) + Math.min(0.2, misplacements * 0.05);
      this.currentTheta = Math.max(-3.0, this.currentTheta - delta);

      // Titrate downward immediately if patient struggles
      if (this.consecutiveErrors >= 1 || this.currentTheta <= -0.5) {
        this.currentDifficulty = this.deriveDifficultyFromTheta(this.currentTheta);
      }
    }

    return this.currentTheta;
  }

  /**
   * Finds the next unplaced piece to highlight for Dignity Auto-Assist.
   */
  public getNextAssistPiece(pieces: PuzzlePiece[]): PuzzlePiece | null {
    const unplaced = pieces.filter(p => !p.isLocked);
    if (unplaced.length === 0) return null;
    // Prioritize top-left corner piece (0, 0) if available for intuitive start
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
    } else if (totalMisplacements >= 3) {
      visuomotorProfile = 'tremor_dominant';
    }

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

  private shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
