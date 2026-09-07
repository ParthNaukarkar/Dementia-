import type { SupportedLanguage } from '../../types/prescription';

/**
 * SmritiNER - Where Am I? Audio Synthesizer
 * 100% Offline Mathematical Web Audio Synthesis and Multilingual Speech Guidance
 * Designed for gentle geriatric acoustics and tactile feedback.
 */
export class WhereAmIAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  private ensureContext(): AudioContext | null {
    try {
      if (typeof window === 'undefined') return null;
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Tactile button tap click
   */
  public playOptionTap(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Clue reveal whoosh / soft chime
   */
  public playClueReveal(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.20); // E5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Compass Hint Chime (Harmonic 3-tone arpeggio)
   */
  public playCompassChime(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const toneStart = now + idx * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, toneStart);

        gain.gain.setValueAtTime(0.001, toneStart);
        gain.gain.linearRampToValueAtTime(0.18, toneStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, toneStart + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(toneStart);
        osc.stop(toneStart + 0.30);
      });
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Correct Answer Chime (Bright 4-note ascending chord)
   */
  public playCorrectSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        const toneStart = now + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, toneStart);

        gain.gain.setValueAtTime(0.001, toneStart);
        gain.gain.linearRampToValueAtTime(0.20, toneStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, toneStart + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(toneStart);
        osc.stop(toneStart + 0.38);
      });
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Gentle dignified error thud (low sine, non-jarring)
   */
  public playIncorrectSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Accessible Web Speech API Text-to-Speech Guidance
   */
  public speakGuidance(text: string, lang: SupportedLanguage): void {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // Stop any pending utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Geriatric gentle pace
      utterance.pitch = 1.0;

      const langMap: Record<SupportedLanguage, string> = {
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
        en: 'en-IN',
      };
      utterance.lang = langMap[lang] || 'en-IN';

      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find(v => v.lang.toLowerCase().startsWith(utterance.lang.slice(0, 2).toLowerCase()));
      if (matched) {
        utterance.voice = matched;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis unsupported
    }
  }
}

export const whereAmIAudio = new WhereAmIAudioSynthesizer();

