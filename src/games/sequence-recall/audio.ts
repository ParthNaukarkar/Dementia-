import type { SupportedLanguage } from '../../types/prescription';
import type { SequenceItem } from './types';

class SequenceAudioManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction to satisfy browser autoplay policies
  }

  public setAudioEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore speech cancel errors
      }
    }
  }

  public getAudioEnabled(): boolean {
    return this.isEnabled;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play a soothing melodic bell tone for a specific sequence item.
   * If audio is disabled, does nothing.
   */
  public playItemChime(item: SequenceItem, durationMs: number = 600): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Warm triangle wave for organic, acoustic feel
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.audioPitchHz, now);

      // Gentle attack to avoid clicking, followed by smooth exponential decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch {
      // Graceful fallback if Web Audio is unsupported
    }
  }

  /**
   * Play encouraging success chime chord (C - E - G)
   */
  public playSuccessChime(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
      });
    } catch {}
  }

  /**
   * Play gentle, non-demoralizing neutral retry tone (soft low-frequency gong)
   */
  public playNeutralRetryTone(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now); // Soft A3
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  /**
   * Speak item name using browser SpeechSynthesis if audio is active
   */
  public speakItemName(text: string, language: SupportedLanguage): void {
    if (!this.isEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slightly slower, dignified pacing for elderly
      utterance.pitch = 1.0;

      const langMap: Record<SupportedLanguage, string> = {
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
        en: 'en-IN'
      };
      utterance.lang = langMap[language] || 'en-US';

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore if speech synthesis unavailable
    }
  }
}

export const sequenceAudio = new SequenceAudioManager();
