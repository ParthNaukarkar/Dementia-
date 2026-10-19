/**
 * LinUCB Contextual Multi-Armed Bandit (Reinforcement Learning)
 * 
 * Dynamically selects intervention scaffolding levels and task difficulty
 * to balance neuroplastic challenge (Zone of Proximal Development) against
 * catastrophic failure and emotional distress in dementia.
 * 
 * Algorithm: LinUCB with Disjoint Linear Models (Li et al., WWW 2010)
 */

export interface BanditContext {
  latentAbilityTheta: number; // -3.0 to +3.0
  fatigueIndex: number;       // 0.0 to 1.0 (circadian + trial count)
  recentAccuracy: number;     // 0.0 to 1.0
  tremorSeverity: number;     // 0.0 to 1.0
  hesitationZScore: number;   // normalized deviation from baseline
  consecutiveMistakes: number;// 0 to 5
}

export type ScaffoldingAction = 
  | 'autonomous_challenge' // Subtle cue only, high cognitive load
  | 'contextual_guidance'  // Distractor reduction, visual framing
  | 'direct_scaffolding';  // Direct beacon, soft magnetic snap, verbal reassurance

export interface BanditSelectionResult {
  selectedAction: ScaffoldingAction;
  actionIndex: number;
  expectedReward: number;
  confidenceBound: number;
  ucbScore: number;
  allActionScores: { action: ScaffoldingAction; ucb: number; expected: number }[];
  explorationBonus: number;
}

export class LinUCBScaffoldingBandit {
  private dimension: number = 6;
  private alpha: number = 1.0; // Exploration parameter
  private actions: ScaffoldingAction[] = [
    'autonomous_challenge',
    'contextual_guidance',
    'direct_scaffolding',
  ];

  // A matrices for each arm (d x d identity initialized)
  private A: number[][][];
  // b vectors for each arm (d x 1 zero initialized)
  private b: number[][];

  constructor(alpha: number = 0.85) {
    this.alpha = alpha;
    this.A = this.actions.map(() => this.createIdentityMatrix(this.dimension));
    this.b = this.actions.map(() => new Array(this.dimension).fill(0));
  }

  private createIdentityMatrix(size: number): number[][] {
    const mat: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row = new Array(size).fill(0);
      row[i] = 1.0;
      mat.push(row);
    }
    return mat;
  }

  /**
   * Convert structured context to 6-dimensional feature vector
   */
  public extractFeatureVector(ctx: BanditContext): number[] {
    return [
      (ctx.latentAbilityTheta + 3.0) / 6.0, // Scale to [0, 1]
      Math.max(0, Math.min(1, ctx.fatigueIndex)),
      Math.max(0, Math.min(1, ctx.recentAccuracy)),
      Math.max(0, Math.min(1, ctx.tremorSeverity)),
      Math.max(0, Math.min(1, (ctx.hesitationZScore + 2.0) / 4.0)),
      Math.min(1.0, ctx.consecutiveMistakes / 3.0),
    ];
  }

  /**
   * Select best scaffolding action using Upper Confidence Bound
   */
  public selectAction(ctx: BanditContext): BanditSelectionResult {
    const x = this.extractFeatureVector(ctx);
    let bestActionIdx = 0;
    let maxUCB = -Infinity;
    const allScores: { action: ScaffoldingAction; ucb: number; expected: number }[] = [];

    for (let a = 0; a < this.actions.length; a++) {
      const A_inv = this.invertMatrix(this.A[a]);
      const theta_hat = this.multiplyMatrixVector(A_inv, this.b[a]);
      const expectedReward = this.dotProduct(theta_hat, x);

      // Variance component: sqrt(x^T * A_inv * x)
      const A_inv_x = this.multiplyMatrixVector(A_inv, x);
      const variance = this.dotProduct(x, A_inv_x);
      const explorationBonus = this.alpha * Math.sqrt(Math.max(0.0001, variance));
      const ucb = expectedReward + explorationBonus;

      allScores.push({
        action: this.actions[a],
        expected: parseFloat(expectedReward.toFixed(3)),
        ucb: parseFloat(ucb.toFixed(3)),
      });

      if (ucb > maxUCB) {
        maxUCB = ucb;
        bestActionIdx = a;
      }
    }

    const selectedAction = this.actions[bestActionIdx];
    const bestScore = allScores[bestActionIdx];

    return {
      selectedAction,
      actionIndex: bestActionIdx,
      expectedReward: bestScore.expected,
      confidenceBound: parseFloat((bestScore.ucb - bestScore.expected).toFixed(3)),
      ucbScore: bestScore.ucb,
      allActionScores: allScores,
      explorationBonus: parseFloat((bestScore.ucb - bestScore.expected).toFixed(3)),
    };
  }

  /**
   * Update LinUCB model with clinical outcome reward
   * Reward r ∈ [0, 1]:
   * High reward when patient succeeds without prolonged distress;
   * Penalizes panic/abandonment.
   */
  public update(ctx: BanditContext, action: ScaffoldingAction, reward: number): void {
    const a = this.actions.indexOf(action);
    if (a === -1) return;

    const x = this.extractFeatureVector(ctx);
    const clampedReward = Math.max(0, Math.min(1.0, reward));

    // A_a <- A_a + x * x^T
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        this.A[a][i][j] += x[i] * x[j];
      }
    }

    // b_a <- b_a + r * x
    for (let i = 0; i < this.dimension; i++) {
      this.b[a][i] += clampedReward * x[i];
    }
  }

  // Matrix math helpers for 6x6 online inference
  private dotProduct(v1: number[], v2: number[]): number {
    return v1.reduce((sum, val, idx) => sum + val * v2[idx], 0);
  }

  private multiplyMatrixVector(m: number[][], v: number[]): number[] {
    return m.map(row => this.dotProduct(row, v));
  }

  /**
   * Gauss-Jordan matrix inversion with regularization for numerical stability
   */
  private invertMatrix(matrix: number[][]): number[][] {
    const n = matrix.length;
    // Clone and augment with identity [M | I]
    const aug: number[][] = matrix.map((row, i) => {
      const augmentedRow = [...row, ...new Array(n).fill(0)];
      augmentedRow[n + i] = 1.0;
      return augmentedRow;
    });

    // Add tiny ridge regularization to diagonal
    for (let i = 0; i < n; i++) {
      aug[i][i] += 0.05;
    }

    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }
      [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

      const pivot = aug[i][i];
      if (Math.abs(pivot) < 1e-6) continue;

      for (let j = 0; j < 2 * n; j++) {
        aug[i][j] /= pivot;
      }

      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = aug[k][i];
          for (let j = 0; j < 2 * n; j++) {
            aug[k][j] -= factor * aug[i][j];
          }
        }
      }
    }

    // Extract inverse matrix
    return aug.map(row => row.slice(n));
  }
}

export const globalScaffoldingBandit = new LinUCBScaffoldingBandit();
