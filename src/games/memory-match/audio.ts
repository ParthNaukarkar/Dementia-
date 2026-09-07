import type { SupportedLanguage } from '../../types/prescription';

/**
 * Procedural Web Audio API sound synthesizer and vernacular speech engine
 * for Memory Match (CANTAB Paired Associates Learning).
 * 100% offline, zero external audio asset dependencies.
 */
class MemoryMatchAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Tactile card flip sound (short wooden pop)
   */
  public playCardFlip() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext unavailable
    }
  }

  /**
   * Euphoric two-tone harmonic major third chord for matching pair
   */
  public playPairMatch() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.48);
      });
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Gentle, non-punitive neutral cue for mismatched cards
   */
  public playMismatchTone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignore
    }
  }

  /**
   * Gentle celestial chime when AI provides an auto-assist cue
   */
  public playAutoAssistChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.52);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Celebratory fanfare on round completion
   */
  public playRoundComplete() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5-E5-G5-C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.7);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Speak item name vernacularly
   */
  public speakItemName(text: string, language: SupportedLanguage) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      const langMap: Record<SupportedLanguage, string> = {
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
        en: 'en-IN',
      };
      utterance.lang = langMap[language] || 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech error
    }
  }

  /**
   * Spoken guidance prompts
   */
  public speakGuidance(
    phase: 'intro' | 'preview' | 'assist' | 'complete',
    language: SupportedLanguage
  ) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const prompts: Record<string, Record<SupportedLanguage, string>> = {
      intro: {
        as: 'ছবিবোৰ মনত ৰাখক আৰু যোৰা মিলাওক।',
        bn: 'ছবিগুলো মনে রাখুন এবং জোড়া মেলাবেন।',
        hi: 'कार्डों को याद रखें और सही जोड़ी मिलाएं।',
        en: 'Remember the pictures and match the pairs.',
      },
      preview: {
        as: 'ছবিবোৰ ভালদৰে চাই লওক। সাজু হ’লে খেলিব।',
        bn: 'ছবিগুলো ভালো করে দেখে নিন। প্রস্তুত হলে খেলুন।',
        hi: 'चित्रों को ध्यान से देख लीजिए। तैयार होने पर खेलें।',
        en: 'Study the pictures closely. You will match them shortly.',
      },
      assist: {
        as: 'ধীৰে ধীৰে কৰক। এই কাৰ্ড দুখন মন কৰক।',
        bn: 'ধীরে ধীরে করুন। এই কার্ড দুটি লক্ষ্য করুন।',
        hi: 'आराम से करिए। इन दोनों कार्डों पर ध्यान दें।',
        en: 'Take your time. Notice these highlighted cards.',
      },
      complete: {
        as: 'বৰ ধুনীয়া! সকলো যোৰা মিলিল।',
        bn: 'চমৎকার! সব জোড়া মিলে গেছে।',
        hi: 'बहुत बढ़िया! सभी जोड़ियां पूरी हुईं।',
        en: 'Wonderful! All pairs matched accurately.',
      },
    };

    const text = prompts[phase]?.[language] || prompts[phase]?.en;
    if (text) {
      this.speakItemName(text, language);
    }
  }
}

export const memoryMatchAudio = new MemoryMatchAudio();
