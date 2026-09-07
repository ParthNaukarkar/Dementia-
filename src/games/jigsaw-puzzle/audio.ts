import type { SupportedLanguage } from '../../types/prescription';

class JigsawAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Crisp, rewarding wooden snap when a piece docks into the correct grid slot.
   */
  public playPieceSnap() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, this.ctx.currentTime + 0.12); // G5

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Gentle, soft rotation click.
   */
  public playRotateChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880.00, this.ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  /**
   * Dignity Auto-Assist gentle harp glissando chime.
   */
  public playAutoAssistChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.09);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + i * 0.09 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.09);
        osc.stop(this.ctx.currentTime + i * 0.09 + 0.35);
      });
    } catch {}
  }

  /**
   * Triumphant harmonic chime when all pieces are connected.
   */
  public playPuzzleComplete() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      arpeggio.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.11);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.11);
        gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + idx * 0.11 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.11 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.11);
        osc.stop(this.ctx.currentTime + idx * 0.11 + 0.6);
      });
    } catch {}
  }

  /**
   * Spoken vernacular voice encouragement for dementia guidance.
   */
  public speakGuidance(cue: 'intro' | 'snap' | 'assist' | 'complete', lang: SupportedLanguage = 'as') {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const phrases: Record<'intro' | 'snap' | 'assist' | 'complete', Record<SupportedLanguage, string>> = {
      intro: {
        as: 'ছবিখনৰ টুকুৰাবোৰ চাই সঠিক স্থানত বহুৱাওক।',
        bn: 'ছবির টুকরোগুলি দেখে সঠিক স্থানে বসান।',
        hi: 'चित्र के टुकड़ों को देखकर सही स्थान पर रखें।',
        en: 'Observe the picture pieces and place them in the correct spots.',
      },
      snap: {
        as: 'বৰ ধুনীয়া! টুকুৰাটো সঠিকভাৱে মিলি গ’ল।',
        bn: 'খুব সুন্দর! টুকরোটি সঠিকভাবে মিলে গেছে।',
        hi: 'बहुत बढ़िया! यह टुकड़ा बिल्कुल सही बैठ गया।',
        en: 'Wonderful! That piece fits perfectly.',
      },
      assist: {
        as: 'আহক, এই টুকুৰাটো আমি একেলগে বহুৱাওঁ।',
        bn: 'আসুন, এই টুকরোটি আমরা একসাথে বসাই।',
        hi: 'आइए, इस टुकड़े को हम मिलकर बिठाते हैं।',
        en: "Let's put this piece in place together.",
      },
      complete: {
        as: 'অপূৰ্ব! আপুনি সম্পূৰ্ণ ছবিখন সুন্দৰকৈ গঢ়ি তুলিলে।',
        bn: 'অপূর্ব! আপনি সম্পূর্ণ ছবিটি চমৎকারভাবে তৈরি করেছেন।',
        hi: 'अद्भुत! आपने पूरा चित्र बहुत सुंदरता से पूरा किया।',
        en: 'Splendid! You have reconstructed the entire picture beautifully.',
      },
    };

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrases[cue][lang] || phrases[cue].en);
      utterance.rate = 0.88; // Slightly slower, calm cadence for elderly cognitive processing
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const jigsawAudio = new JigsawAudioEngine();
