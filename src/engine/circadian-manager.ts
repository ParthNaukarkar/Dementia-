/**
 * SmritiNER - Circadian Rhythm & Sundowning Time Manager
 * Protects dementia patients during high-vulnerability evening hours (Sundowning)
 */

export type CircadianPhase = 
  | 'MORNING_COGNITIVE'    // 08:30 - 11:30: Peak alertness, optimal for games & assessment
  | 'AFTERNOON_STABLE'     // 11:30 - 16:30: Normal routine, hydration & light interaction
  | 'SUNDOWNING_VULNERABLE'// 16:30 - 20:30: Confusion/Agitation peak -> Calming Reminiscence Mode
  | 'NIGHT_REST';          // 20:30 - 08:30: Dim screen, nightlight, sleep hygiene

export interface CircadianStatus {
  phase: CircadianPhase;
  isSundowningActive: boolean;
  recommendation: string;
  recommendedMode: 'COGNITIVE_GAMES' | 'REMINISCENCE_CALM' | 'LIGHT_MAINTENANCE' | 'NIGHT_REST';
  simulatedHour: number | null; // For hackathon demo toggles
}

export class CircadianManager {
  private simulatedHour: number | null = null; // null = use real local clock

  /**
   * Evaluates current circadian phase based on real or simulated time.
   */
  public getStatus(): CircadianStatus {
    const now = new Date();
    const currentHour = this.simulatedHour !== null ? this.simulatedHour : (now.getHours() + now.getMinutes() / 60);

    if (currentHour >= 8.5 && currentHour < 11.5) {
      return {
        phase: 'MORNING_COGNITIVE',
        isSundowningActive: false,
        recommendedMode: 'COGNITIVE_GAMES',
        recommendation: 'Optimal cognitive alertness. Recommended time for daily brain training & memory games.',
        simulatedHour: this.simulatedHour,
      };
    } else if (currentHour >= 11.5 && currentHour < 16.5) {
      return {
        phase: 'AFTERNOON_STABLE',
        isSundowningActive: false,
        recommendedMode: 'LIGHT_MAINTENANCE',
        recommendation: 'Stable afternoon hours. Encouraged: Hydration check, light routine recall, rest.',
        simulatedHour: this.simulatedHour,
      };
    } else if (currentHour >= 16.5 && currentHour < 20.5) {
      return {
        phase: 'SUNDOWNING_VULNERABLE',
        isSundowningActive: true,
        recommendedMode: 'REMINISCENCE_CALM',
        recommendation: 'Sundowning Window: Cognitive games paused to avoid agitation. Displaying soothing family memories and North Eastern folk melodies.',
        simulatedHour: this.simulatedHour,
      };
    } else {
      return {
        phase: 'NIGHT_REST',
        isSundowningActive: false,
        recommendedMode: 'NIGHT_REST',
        recommendation: 'Night Rest Window: Ambient dimming active to support natural melatonin and sleep cycle.',
        simulatedHour: this.simulatedHour,
      };
    }
  }

  /**
   * Allows judges / presenters to simulate any hour of the day during the SIH demo.
   * e.g. setSimulatedHour(18) triggers Sundowning mode immediately!
   */
  public setSimulatedHour(hour: number | null) {
    this.simulatedHour = hour;
  }

  public toggleSundownDemo() {
    if (this.simulatedHour === 18) {
      this.simulatedHour = null; // revert to real clock
    } else {
      this.simulatedHour = 18; // 6:00 PM (peak sundown)
    }
  }
}

export const circadianManager = new CircadianManager();
