import type { SupportedLanguage } from '../../types/prescription';

/**
 * Procedural Web Audio API sound synthesizer and vernacular speech engine
 * for Number Recall (WAIS-IV Digit Span).
 */
class NumberRecallAudio {
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

  /**
   * Plays a pleasant telephone/keyboard dual-tone chime when a digit is presented or tapped.
   */
  public playDigitTone(digit: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
      const freq = baseFreqs[Math.abs(digit) % baseFreqs.length];

      // Primary tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.30);

      // Soft harmonic overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now);
      osc2.stop(now + 0.22);
    } catch {}
  }

  /**
   * Tactile click on backspace.
   */
  public playBackspaceClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Harmonic celebration chime on correct sequence entry.
   */
  public playSuccessChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.20, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.40);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.42);
      });
    } catch {}
  }

  /**
   * Gentle, dignified error chime.
   */
  public playErrorThud() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  /**
   * Speaks an individual digit in the chosen language at the given pacing rate.
   */
  public speakDigit(digit: string, lang: SupportedLanguage, rate: number = 0.85) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(digit);
      utterance.rate = Math.max(0.65, Math.min(1.1, rate));
      utterance.pitch = 1.0;

      const langMap: Record<SupportedLanguage, string> = {
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
        en: 'en-US',
      };
      utterance.lang = langMap[lang] || 'en-US';

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  /**
   * Speaks full guidance prompts.
   */
  public speakGuidance(
    type: 'study' | 'recall_forward' | 'recall_backward' | 'correct' | 'try_again',
    lang: SupportedLanguage
  ) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const scripts: Record<string, Record<SupportedLanguage, string>> = {
      study: {
        as: 'সংখ্যাবোৰ মনোযোগেৰে চাওক।',
        bn: 'সংখ্যাগুলি মনোযোগ দিয়ে দেখুন।',
        hi: 'अंकों को ध्यान से देखें।',
        en: 'Memorize the numbers carefully.',
      },
      recall_forward: {
        as: 'এতিয়া একে ক্ৰমত সংখ্যাবোৰ টাইপ কৰক।',
        bn: 'এখন একই ক্রমে সংখ্যাগুলি লিখুন।',
        hi: 'अब उसी क्रम में अंक दर्ज करें।',
        en: 'Now enter the numbers in forward order.',
      },
      recall_backward: {
        as: 'সাৱধান! এতিয়া ওলোটা ক্ৰমত সংখ্যাবোৰ টাইপ কৰক।',
        bn: 'সাবধান! এখন উল্টো ক্রমে সংখ্যাগুলি লিখুন।',
        hi: 'सावधान! अब उल्टे क्रम में अंक दर्ज करें।',
        en: 'Attention! Now enter the numbers in reverse order.',
      },
      correct: {
        as: 'অতি সুন্দৰ! শুদ্ধ হৈছে।',
        bn: 'খুব সুন্দর! সঠিক হয়েছে।',
        hi: 'बहुत बढ़िया! बिल्कुल सही।',
        en: 'Excellent! Perfectly remembered.',
      },
      try_again: {
        as: 'কোনো কথা নাই, পিছৰটো চেষ্টা কৰক।',
        bn: 'কোনো ব্যাপার নয়, পরেরটি চেষ্টা করুন।',
        hi: 'कोई बात नहीं, अगला प्रयास करें।',
        en: 'No worries, let us try the next sequence.',
      },
    };

    try {
      window.speechSynthesis.cancel();
      const text = scripts[type]?.[lang] || scripts[type]?.en;
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;

      const langMap: Record<SupportedLanguage, string> = {
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
        en: 'en-US',
      };
      utterance.lang = langMap[lang] || 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const numberRecallAudio = new NumberRecallAudio();
