/**
 * SmritiNER - On-Device Edge Cognitive Classifier
 * Evaluates patient gameplay telemetry using pre-trained clinical model weights.
 * Executes offline in < 0.2ms with zero external dependencies.
 */

import modelData from './trained-cognitive-model.json';

export interface PatientSessionTelemetry {
  meanLatencyMs: number;
  latencyVarianceMs: number;
  accuracyPct: number;
  perseverationRate: number;  // 0.0 to 1.0
  hesitationRatio: number;    // 0.0 to 1.0 (proportion of trials > 7s)
  tremorJitterIndex: number;  // 0.0 to 1.0
}

export interface CognitiveClassificationResult {
  predictedClass: string;
  confidenceScore: number;     // 0.0 to 1.0
  probabilities: { [className: string]: number };
  clinicalTier: 'NORMAL' | 'MCI' | 'HIGH_SUPPORT';
  estimatedMoCARange: string;
  clinicalAlert?: string;
}

export class CognitiveClassifier {
  /**
   * Evaluates patient metrics against trained clinical weights using multinomial softmax.
   */
  public static classify(telemetry: PatientSessionTelemetry): CognitiveClassificationResult {
    const rawFeatures = [
      telemetry.meanLatencyMs,
      telemetry.latencyVarianceMs,
      telemetry.accuracyPct,
      telemetry.perseverationRate,
      telemetry.hesitationRatio,
      telemetry.tremorJitterIndex,
    ];

    // 1. Z-score normalization using trained scaler parameters
    const normalized = rawFeatures.map((val, idx) => {
      const mean = modelData.scaler.mean[idx];
      const scale = modelData.scaler.scale[idx];
      return (val - mean) / scale;
    });

    // 2. Compute linear logits: z_k = sum(w_k * x) + b_k
    const logits = modelData.logistic_coefficients.map((classWeights, classIdx) => {
      const dotProduct = classWeights.reduce((sum, weight, featIdx) => {
        return sum + weight * normalized[featIdx];
      }, 0);
      return dotProduct + modelData.logistic_intercepts[classIdx];
    });

    // 3. Softmax activation for class probabilities
    const maxLogit = Math.max(...logits); // Numerical stability
    const exps = logits.map(z => Math.exp(z - maxLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map(e => e / sumExps);

    // 4. Determine winning class
    let maxProbIdx = 0;
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[maxProbIdx]) {
        maxProbIdx = i;
      }
    }

    const classes = modelData.classes;
    const winningClass = classes[maxProbIdx];
    const confidence = probs[maxProbIdx];

    const probabilitiesMap: { [key: string]: number } = {};
    classes.forEach((c, i) => {
      probabilitiesMap[c] = Number(probs[i].toFixed(3));
    });

    let clinicalTier: 'NORMAL' | 'MCI' | 'HIGH_SUPPORT' = 'NORMAL';
    let estimatedMoCARange = '26 – 30 (Normal)';
    let alert: string | undefined = undefined;

    if (maxProbIdx === 1) {
      clinicalTier = 'MCI';
      estimatedMoCARange = '18 – 25 (Mild Cognitive Impairment)';
      alert = 'Early processing hesitation detected. Suggest routine hydration and 15-minute daily memory exercises.';
    } else if (maxProbIdx === 2) {
      clinicalTier = 'HIGH_SUPPORT';
      estimatedMoCARange = '< 18 (Needs Active Support)';
      alert = 'Elevated response delay and repeated selections noted. Recommended: Share exported report with Primary Health Centre (PHC) clinician.';
    }

    return {
      predictedClass: winningClass,
      confidenceScore: Number(confidence.toFixed(3)),
      probabilities: probabilitiesMap,
      clinicalTier,
      estimatedMoCARange,
      clinicalAlert: alert,
    };
  }
}
