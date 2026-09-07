import type { SupportedLanguage } from './types';

/**
 * SmritiNER - Bihu Taal Audio Synthesizer
 * 100% Offline Mathematical Web Audio Synthesis of Assamese Folk Instruments
 * Calibrated for maximum audibility on laptop, tablet, and mobile speakers.
 */
export class BihuAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  private onSubtitleCallback?: (text: string, isPlaying: boolean) => void;

  public setSubtitleCallback(callback: (text: string, isPlaying: boolean) => void) {
    this.onSubtitleCallback = callback;
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
   * Synthesizes authentic Assamese Pepa (Buffalo Horn Flute)
   * High-energy, brassy, resonant folk horn (Root 440 Hz + harmonic swell)
   */
  public playPepaSound() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + 0.01;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Brassy sawtooth with authentic folk horn swell
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now); // A4 root
      osc.frequency.linearRampToValueAtTime(466, now + 0.12); // breath pitch swell
      osc.frequency.linearRampToValueAtTime(440, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(2.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.50);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch (err) {
      console.warn('[BihuAudio Pepa]', err);
    }
  }

  /**
   * Synthesizes authentic Bihu Dhol (Wooden Drum Thump)
   * Punchy wood-and-skin resonance designed to cut through clearly on all laptop/tablet speakers
   */
  public playDholSound() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + 0.01;

      // Drum body oscillator (Triangle for rich audible wooden harmonics on laptop speakers)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now); // 240 Hz audible wooden pitch
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.20); // rapid drum pitch drop

      // Wood stick transient click (sharp crack of stick on dhol skin)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(600, now);
      clickOsc.frequency.exponentialRampToValueAtTime(180, now + 0.03);

      clickGain.gain.setValueAtTime(0.001, now);
      clickGain.gain.linearRampToValueAtTime(0.25, now + 0.005);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);

      osc.connect(gain);
      gain.connect(ctx.destination);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      osc.start(now);
      clickOsc.start(now);
      osc.stop(now + 0.32);
      clickOsc.stop(now + 0.05);
    } catch (err) {
      console.warn('[BihuAudio Dhol]', err);
    }
  }

  /**
   * Synthesizes Bamboo Gogona (Vibrating Jaw Harp)
   * Twangy bamboo reed vibration with rapid acoustic pitch modulation (LFO flutter)
   */
  public playGogonaSound() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + 0.01;

      const carrier = ctx.createOscillator();
      const carrierGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.frequency.setValueAtTime(14, now); // 14 Hz mouth twang flutter
      lfoGain.gain.setValueAtTime(25, now);
      lfo.connect(carrier.frequency);

      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(260, now);
      carrier.frequency.exponentialRampToValueAtTime(180, now + 0.35);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.Q.setValueAtTime(5, now);

      carrierGain.gain.setValueAtTime(0.001, now);
      carrierGain.gain.linearRampToValueAtTime(0.30, now + 0.03);
      carrierGain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);

      carrier.connect(filter);
      filter.connect(carrierGain);
      carrierGain.connect(ctx.destination);

      lfo.start(now);
      carrier.start(now);
      lfo.stop(now + 0.42);
      carrier.stop(now + 0.42);
    } catch (err) {
      console.warn('[BihuAudio Gogona]', err);
    }
  }

  /**
   * Synthesizes Tokari (Plucked Single-String Folk Lute)
   * Resonant string attack with distinctive acoustic wooden pluck decay
   */
  public playTokariSound() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + 0.01;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Plucked string (sawtooth with resonant lowpass filter sweep)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(330, now); // E4 folk root

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, now); // Bright initial pluck
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.35); // Rapid wooden decay
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.01); // Sharp pluck attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.48);
    } catch (err) {
      console.warn('[BihuAudio Tokari]', err);
    }
  }

  /**
   * Synthesizes Bell-Metal Bhor Taal (Assam Sarthebari Cymbals)
   * Bright, inharmonic metallic clash with shimmering ring
   */
  public playTaalSound() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + 0.01;

      // Bell-metal cymbals: two distinct metallic tones + highpass metallic clash
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1175, now); // D6 bell tone

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1865, now); // inharmonic metallic overtone

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.Q.setValueAtTime(2.0, now); // wide bandpass for rich metallic ringing

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.60);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.62);
      osc2.stop(now + 0.62);
    } catch (err) {
      console.warn('[BihuAudio Taal]', err);
    }
  }

  /**
   * Plays the specific sound for any Bihu instrument by ID
   */
  public playInstrumentSound(instrumentId: string) {
    switch (instrumentId) {
      case 'pepa':
        this.playPepaSound();
        break;
      case 'gogona':
        this.playGogonaSound();
        break;
      case 'tokari':
        this.playTokariSound();
        break;
      case 'taal':
        this.playTaalSound();
        break;
      case 'dhol':
      default:
        this.playDholSound();
        break;
    }
  }

  /**
   * Tactile wooden drum tap click when patient presses the big rhythm button
   */
  public playTapClick() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + 0.005;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (err) {
      console.warn('[BihuAudio Tap]', err);
    }
  }

  /**
   * Gentle celebration chime on perfect round completion
   */
  public playSuccessChime() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime + 0.01;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.5);
      });
    } catch (err) {
      console.warn('[BihuAudio Success]', err);
    }
  }

  /**
   * Speaks voice prompt with subtitle broadcast
   */
  public speakPrompt(text: string, lang: SupportedLanguage) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'bn' || lang === 'as') utterance.lang = 'bn-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.85;
    utterance.pitch = 1.05;

    if (this.onSubtitleCallback) {
      this.onSubtitleCallback(text, true);
    }

    utterance.onend = () => {
      if (this.onSubtitleCallback) this.onSubtitleCallback('', false);
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const bihuAudio = new BihuAudioSynthesizer();
