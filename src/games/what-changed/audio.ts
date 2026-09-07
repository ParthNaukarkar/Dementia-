import type { SupportedLanguage } from '../../types/prescription';

/**
 * Procedural Web Audio & Vernacular Speech Synthesizer for "What Changed?"
 * Generates instant, latency-free acoustic cues without external asset network dependencies.
 */
export class WhatChangedAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAllSpeech();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Gentle resonant chime when Scene A (study) appears.
   */
  public playStudyStartChord() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [440.0, 554.37, 659.25]; // A4 - C#5 - E5
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.50);
      });
    } catch {}
  }

  /**
   * Flicker mask swoosh (white-noise/bandpass sweep).
   */
  public playMaskTransition() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  /**
   * Crisp tactile tap when selecting an item.
   */
  public playTapFeedback() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  /**
   * Golden halo assistance shimmering bell.
   */
  public playHaloPulse() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.10, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  /**
   * Celebratory success harmonic chime.
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
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.40);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.42);
      });
    } catch {}
  }

  /**
   * Low non-punitive feedback thud for incorrect selection.
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
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  /**
   * Safely stops any ongoing speech synthesis.
   */
  public stopAllSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  /**
   * Speaks clinical guidance prompts in patient's preferred language.
   */
  public speakGuidance(
    type: 'study' | 'detect' | 'correct' | 'try_again' | 'hint',
    lang: SupportedLanguage
  ) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const scripts: Record<string, Record<SupportedLanguage, string>> = {
      study: {
        as: 'দৃশ্যখন ভালদৰে লক্ষ্য কৰক। বস্তুবোৰ মনত ৰাখক।',
        bn: 'দৃশ্যটি ভালো করে দেখুন। বস্তুগুলি মনে রাখুন।',
        hi: 'दृश्य को ध्यान से देखें और वस्तुओं को याद रखें।',
        en: 'Memorize the items in this scene carefully.',
      },
      detect: {
        as: 'কি সলনি হ’ল? যিটো বস্তু সলনি হৈছে তাত স্পৰ্শ কৰক।',
        bn: 'কী পরিবর্তন হলো? যে বস্তুটি বদলেছে তাতে স্পর্শ করুন।',
        hi: 'क्या बदला? जो वस्तु बदली है, उस पर टैप करें।',
        en: 'What changed? Tap on the item that changed.',
      },
      correct: {
        as: 'অতি সুন্দৰ! আপুনি সঠিক পৰিৱৰ্তনটো ধৰা পেলালে।',
        bn: 'চমৎকার! আপনি সঠিক পরিবর্তনটি খুঁজে পেয়েছেন।',
        hi: 'बहुत बढ़िया! आपने सही बदलाव पहचान लिया।',
        en: 'Splendid! You correctly spotted the change.',
      },
      try_again: {
        as: 'কোনো কথা নাই, পিছৰ দৃশ্যটো চাওক।',
        bn: 'কোনো ব্যাপার নয়, পরের দৃশ্যটি দেখুন।',
        hi: 'कोई बात नहीं, अगला दृश्य देखें।',
        en: 'No worries, let us observe the next scene.',
      },
      hint: {
        as: 'সোণালী পোহৰৰ ফালে চাওক।',
        bn: 'সোনালি আলোর দিকে তাকান।',
        hi: 'सुनहरी रोशनी की ओर देखें।',
        en: 'Notice the gentle golden glow.',
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

export const whatChangedAudio = new WhatChangedAudio();
