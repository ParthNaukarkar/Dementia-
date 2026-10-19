/**
 * Kinematic & Tremor Spectral Analysis Engine
 * 
 * Captures millisecond touch/pointer coordinates at 60-120Hz during game interactions.
 * Performs Discrete Fourier Transform (DFT) to isolate tremor frequency bands:
 * - 4-6 Hz: Parkinsonian rest tremor & basal ganglia dysfunction
 * - 8-12 Hz: Essential & physiological tremor
 * - Fitts' Law Trajectory Efficiency: measures motor apraxia vs direct ballistic aiming
 */

export interface TrajectoryPoint {
  x: number;
  y: number;
  timestamp: number; // performance.now() or Date.now()
}

export type TremorPhenotype = 
  | 'normal_smooth'
  | 'parkinsonian_dominant' // High energy peak in 4-6 Hz band
  | 'essential_tremor'      // High energy peak in 8-12 Hz band
  | 'visuomotor_ataxia';    // High trajectory wandering, low frequency stability

export interface KinematicAnalysisResult {
  sampleCount: number;
  totalDurationMs: number;
  totalPathLengthPx: number;
  directDistancePx: number;
  pathEfficiencyRatio: number; // 0.0 to 1.0 (1.0 = perfect direct line)
  averageVelocityPxMs: number;
  peakVelocityPxMs: number;
  averageAccelerationPxMs2: number;
  peakFrequencyHz: number;
  bandPower_4_6Hz: number;   // Parkinsonian band
  bandPower_8_12Hz: number;  // Essential tremor band
  bandPower_0_4Hz: number;   // Intentional motor trajectory
  tremorPhenotype: TremorPhenotype;
  tremorSeverityIndex: number; // 0.0 to 1.0
  fittsIndexDifficulty: number; // Log2(2D/W + 1)
  fittsPerformanceIndex: number;
}

export class KinematicAnalyzer {
  private points: TrajectoryPoint[] = [];
  private maxSamples: number = 300;

  public reset(): void {
    this.points = [];
  }

  /**
   * Record a pointer / touch point
   */
  public addPoint(x: number, y: number, timestamp: number = performance.now()): void {
    if (this.points.length >= this.maxSamples) {
      this.points.shift();
    }
    this.points.push({ x, y, timestamp });
  }

  /**
   * Run full kinematic & spectral decomposition on captured samples
   */
  public analyze(targetWidthPx: number = 60): KinematicAnalysisResult {
    if (this.points.length < 5) {
      return this.getDefaultResult();
    }

    const n = this.points.length;
    const startTime = this.points[0].timestamp;
    const endTime = this.points[n - 1].timestamp;
    const totalDurationMs = Math.max(1, endTime - startTime);

    // 1. Path metrics
    let totalPathLengthPx = 0;
    const velocities: number[] = [];
    const accelerations: number[] = [];
    const deltasX: number[] = [];
    const deltasY: number[] = [];

    for (let i = 1; i < n; i++) {
      const p1 = this.points[i - 1];
      const p2 = this.points[i];
      const dt = Math.max(1, p2.timestamp - p1.timestamp);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      totalPathLengthPx += dist;
      const v = dist / dt;
      velocities.push(v);
      deltasX.push(dx);
      deltasY.push(dy);

      if (i > 1) {
        const dv = Math.abs(v - velocities[i - 2]);
        accelerations.push(dv / dt);
      }
    }

    const startP = this.points[0];
    const endP = this.points[n - 1];
    const directDistancePx = Math.sqrt(
      Math.pow(endP.x - startP.x, 2) + Math.pow(endP.y - startP.y, 2)
    );

    const pathEfficiencyRatio = totalPathLengthPx > 0
      ? Math.min(1, Math.max(0, directDistancePx / totalPathLengthPx))
      : 1.0;

    const averageVelocityPxMs = velocities.length > 0
      ? velocities.reduce((a, b) => a + b, 0) / velocities.length
      : 0;

    const peakVelocityPxMs = velocities.length > 0 ? Math.max(...velocities) : 0;

    const averageAccelerationPxMs2 = accelerations.length > 0
      ? accelerations.reduce((a, b) => a + b, 0) / accelerations.length
      : 0;

    // 2. Fitts' Law Index of Difficulty (ID = log2(2D / W + 1))
    const fittsIndexDifficulty = Math.log2((2 * Math.max(1, directDistancePx)) / Math.max(10, targetWidthPx) + 1);
    const fittsPerformanceIndex = totalDurationMs > 0 ? (fittsIndexDifficulty / (totalDurationMs / 1000)) : 0;

    // 3. Discrete Fourier Transform (DFT) for Tremor Spectral Decomposition
    // Interpolate jitter displacements over uniform sampling interval (~60Hz => 16.6ms)
    const jitters: number[] = [];

    for (let i = 1; i < n; i++) {
      const p2 = this.points[i];
      // Deviation from linear interpolation between start and end
      const tProgress = (p2.timestamp - startTime) / totalDurationMs;
      const idealX = startP.x + (endP.x - startP.x) * tProgress;
      const idealY = startP.y + (endP.y - startP.y) * tProgress;
      const deviation = Math.sqrt(Math.pow(p2.x - idealX, 2) + Math.pow(p2.y - idealY, 2));
      jitters.push(deviation);
    }

    // Compute power in discrete bins: 0-4Hz, 4-6Hz (Parkinsonian), 8-12Hz (Essential)
    let power0_4 = 0;
    let power4_6 = 0;
    let power8_12 = 0;
    let maxPower = 0;
    let peakFrequencyHz = 0;

    const numFreqs = 30; // Test frequencies from 0.5Hz to 15Hz
    for (let f = 1; f <= numFreqs; f++) {
      const targetFreq = f * 0.5; // 0.5, 1.0, 1.5, ... 15.0 Hz
      let realSum = 0;
      let imagSum = 0;

      for (let k = 0; k < jitters.length; k++) {
        const timeSec = (this.points[k].timestamp - startTime) / 1000;
        const angle = 2 * Math.PI * targetFreq * timeSec;
        realSum += jitters[k] * Math.cos(angle);
        imagSum -= jitters[k] * Math.sin(angle);
      }

      const power = (realSum * realSum + imagSum * imagSum) / Math.max(1, jitters.length);

      if (power > maxPower) {
        maxPower = power;
        peakFrequencyHz = targetFreq;
      }

      if (targetFreq <= 4.0) {
        power0_4 += power;
      } else if (targetFreq > 4.0 && targetFreq <= 6.5) {
        power4_6 += power;
      } else if (targetFreq >= 7.5 && targetFreq <= 12.0) {
        power8_12 += power;
      }
    }

    // Normalize band powers
    const totalBandPower = Math.max(0.001, power0_4 + power4_6 + power8_12);
    const relPower0_4 = power0_4 / totalBandPower;
    const relPower4_6 = power4_6 / totalBandPower;
    const relPower8_12 = power8_12 / totalBandPower;

    // 4. Clinical Tremor Phenotype Determination
    let tremorPhenotype: TremorPhenotype = 'normal_smooth';
    let tremorSeverityIndex = 0;

    if (relPower4_6 > 0.38 && power4_6 > 15) {
      tremorPhenotype = 'parkinsonian_dominant';
      tremorSeverityIndex = Math.min(1, relPower4_6 * 1.3);
    } else if (relPower8_12 > 0.40 && power8_12 > 12) {
      tremorPhenotype = 'essential_tremor';
      tremorSeverityIndex = Math.min(1, relPower8_12 * 1.2);
    } else if (pathEfficiencyRatio < 0.65 && totalPathLengthPx > 100) {
      tremorPhenotype = 'visuomotor_ataxia';
      tremorSeverityIndex = Math.min(1, (1 - pathEfficiencyRatio) * 1.4);
    } else {
      tremorSeverityIndex = Math.min(0.25, (1 - pathEfficiencyRatio) * 0.5);
    }

    return {
      sampleCount: n,
      totalDurationMs: Math.round(totalDurationMs),
      totalPathLengthPx: Math.round(totalPathLengthPx),
      directDistancePx: Math.round(directDistancePx),
      pathEfficiencyRatio: parseFloat(pathEfficiencyRatio.toFixed(3)),
      averageVelocityPxMs: parseFloat(averageVelocityPxMs.toFixed(3)),
      peakVelocityPxMs: parseFloat(peakVelocityPxMs.toFixed(3)),
      averageAccelerationPxMs2: parseFloat(averageAccelerationPxMs2.toFixed(4)),
      peakFrequencyHz: parseFloat(peakFrequencyHz.toFixed(1)),
      bandPower_4_6Hz: parseFloat(relPower4_6.toFixed(3)),
      bandPower_8_12Hz: parseFloat(relPower8_12.toFixed(3)),
      bandPower_0_4Hz: parseFloat(relPower0_4.toFixed(3)),
      tremorPhenotype,
      tremorSeverityIndex: parseFloat(tremorSeverityIndex.toFixed(3)),
      fittsIndexDifficulty: parseFloat(fittsIndexDifficulty.toFixed(2)),
      fittsPerformanceIndex: parseFloat(fittsPerformanceIndex.toFixed(2)),
    };
  }

  private getDefaultResult(): KinematicAnalysisResult {
    return {
      sampleCount: this.points.length,
      totalDurationMs: 0,
      totalPathLengthPx: 0,
      directDistancePx: 0,
      pathEfficiencyRatio: 1.0,
      averageVelocityPxMs: 0,
      peakVelocityPxMs: 0,
      averageAccelerationPxMs2: 0,
      peakFrequencyHz: 0,
      bandPower_4_6Hz: 0.1,
      bandPower_8_12Hz: 0.1,
      bandPower_0_4Hz: 0.8,
      tremorPhenotype: 'normal_smooth',
      tremorSeverityIndex: 0.05,
      fittsIndexDifficulty: 1.0,
      fittsPerformanceIndex: 1.0,
    };
  }
}

export const globalKinematicAnalyzer = new KinematicAnalyzer();
