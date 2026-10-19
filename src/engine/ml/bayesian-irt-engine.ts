/**
 * Psychometric Bayesian Item Response Theory (IRT) Engine
 * 
 * 2-Parameter Logistic (2PL) & 3-Parameter Logistic (3PL) model
 * Computes:
 * - Latent Cognitive Ability (θ ∈ [-3.0, +3.0])
 * - Fisher Information Function I(θ)
 * - Standard Error of Measurement SEM(θ)
 * - Real-time Expected A Posteriori (EAP) Bayesian update
 * - Zone of Proximal Development (ZPD) optimal difficulty targeting
 */

export interface ItemParameters {
  difficultyB: number;     // b ∈ [-3.0, +3.0]
  discriminationA: number; // a ∈ [0.5, 2.5]
  pseudoGuessingC?: number;// c ∈ [0.0, 0.35]
}

export interface IRTUpdateResult {
  previousTheta: number;
  newTheta: number;
  thetaDelta: number;
  posteriorSEM: number;
  fisherInformation: number;
  expectedProbability: number;
  observedOutcome: boolean;
  reliabilityCoefficient: number; // 0.0 to 1.0 (equivalent to Cronbach's alpha)
  clinicalZPDRecommendedDifficulty: number; // optimal b for maximum neuroplastic stimulation
}

export class BayesianIRTEngine {
  private theta: number;
  private priorVariance: number;
  private history: { b: number; a: number; correct: boolean; thetaAfter: number }[] = [];

  constructor(initialTheta: number = 0.0, initialPriorVariance: number = 1.0) {
    this.theta = Math.max(-3.0, Math.min(3.0, initialTheta));
    this.priorVariance = initialPriorVariance;
  }

  public getTheta(): number {
    return this.theta;
  }

  public setTheta(val: number): void {
    this.theta = Math.max(-3.0, Math.min(3.0, val));
  }

  /**
   * Probability of correct response given ability theta and item parameters
   */
  public probability(theta: number, item: ItemParameters): number {
    const a = item.discriminationA;
    const b = item.difficultyB;
    const c = item.pseudoGuessingC ?? 0.0;

    const exponent = -1.7 * a * (theta - b);
    const logistic = 1.0 / (1.0 + Math.exp(Math.max(-20, Math.min(20, exponent))));
    return c + (1.0 - c) * logistic;
  }

  /**
   * Fisher Information I(θ) represents psychometric measurement precision
   */
  public fisherInformation(theta: number, item: ItemParameters): number {
    const p = this.probability(theta, item);
    const q = 1.0 - p;
    const a = item.discriminationA;
    const c = item.pseudoGuessingC ?? 0.0;

    if (p <= 0 || q <= 0) return 0.01;

    // For 2PL/3PL: I(theta) = 1.7^2 * a^2 * (q / p) * ((p - c) / (1 - c))^2
    const num = Math.pow(p - c, 2) * q;
    const den = Math.pow(1.0 - c, 2) * p;
    return Math.pow(1.7 * a, 2) * (num / Math.max(0.0001, den));
  }

  /**
   * Update ability θ using Bayesian Maximum A Posteriori (MAP) with Gaussian prior
   */
  public update(item: ItemParameters, isCorrect: boolean, responseLatencySec?: number): IRTUpdateResult {
    const prevTheta = this.theta;
    const p = this.probability(prevTheta, item);
    const observed = isCorrect ? 1.0 : 0.0;

    // Latency weighting: very rapid correct responses have higher precision
    let latencyMultiplier = 1.0;
    if (responseLatencySec !== undefined) {
      if (isCorrect && responseLatencySec < 2.5) {
        latencyMultiplier = 1.15; // Confident encoding
      } else if (!isCorrect && responseLatencySec > 8.0) {
        latencyMultiplier = 1.10; // Genuine deficit/decay
      }
    }

    const info = this.fisherInformation(prevTheta, item);
    const totalPrecision = (1.0 / this.priorVariance) + info;
    const currentSEM = Math.sqrt(1.0 / totalPrecision);

    // Bayesian Newton-Raphson gradient step
    const scoreGradient = 1.7 * item.discriminationA * (observed - p) * latencyMultiplier;
    const priorGradient = - (prevTheta / this.priorVariance);
    const combinedGradient = scoreGradient + priorGradient;

    // Step with dampening to prevent oscillation in cognitive pathology
    const stepSize = Math.max(-0.65, Math.min(0.65, combinedGradient / totalPrecision));
    this.theta = Math.max(-3.0, Math.min(3.0, prevTheta + stepSize));

    // Update prior variance (posterior variance shrinks as more evidence accumulates)
    this.priorVariance = Math.max(0.08, 1.0 / totalPrecision);

    // Reliability coefficient r_xx = 1 - (SEM^2 / Var(theta))
    const reliability = Math.max(0.40, Math.min(0.99, 1.0 - Math.pow(currentSEM, 2)));

    // Optimal difficulty for next task is the item difficulty b that maximizes I(theta) -> b ≈ theta
    const optimalB = parseFloat(this.theta.toFixed(2));

    this.history.push({
      b: item.difficultyB,
      a: item.discriminationA,
      correct: isCorrect,
      thetaAfter: this.theta,
    });

    return {
      previousTheta: parseFloat(prevTheta.toFixed(3)),
      newTheta: parseFloat(this.theta.toFixed(3)),
      thetaDelta: parseFloat((this.theta - prevTheta).toFixed(3)),
      posteriorSEM: parseFloat(currentSEM.toFixed(3)),
      fisherInformation: parseFloat(info.toFixed(3)),
      expectedProbability: parseFloat(p.toFixed(3)),
      observedOutcome: isCorrect,
      reliabilityCoefficient: parseFloat(reliability.toFixed(3)),
      clinicalZPDRecommendedDifficulty: optimalB,
    };
  }

  public getHistory() {
    return this.history;
  }
}
