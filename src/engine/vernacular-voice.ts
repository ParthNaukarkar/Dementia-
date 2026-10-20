/**
 * SmritiNER - Vernacular Speech & Audio Engine
 * Bundled with 48 True Native Regional Audio Files (Assamese, Bengali, Hindi, English)
 * 100% Offline, Zero Robotic Accent Fallbacks
 */

export type SupportedLanguage = 'en' | 'hi';

export class VernacularVoiceEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  public setSubtitleCallback(_callback: (text: string, isPlaying: boolean) => void) {
    // Subtitles disabled with voice
  }

  /**
   * Plays authentic pre-rendered native audio file from /audio/{lang}/{id}.mp3
   */
  public playNativeAudio(_id: string, _lang: SupportedLanguage, _subtitleText?: string): Promise<void> {
    // Spoken voice permanently disabled across games
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    return Promise.resolve();
  }

  /**
   * Speaks general dynamic text if no static audio file is available
   */
  public speakFallback(_text: string, _lang: SupportedLanguage) {
    // Spoken voice permanently disabled
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  /**
   * Plays a warm, organic bamboo/flute chime using the Web Audio API.
   * Runs 100% offline with zero external audio assets.
   */
  public playGentleChime(type: 'success' | 'tap' | 'attention') {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === 'success') {
        // Pentatonic uplifting chime (Assamese folk scale: C5 - E5 - G5 - A5)
        const notes = [523.25, 659.25, 783.99, 880.00];
        notes.forEach((freq, idx) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

          osc.connect(gain);
          gain.connect(this.audioCtx!.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.55);
        });
      } else if (type === 'tap') {
        // Soft wooden bamboo click
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'attention') {
        // Soothing singing bowl chime (D5: 587.33 Hz with subtle overtone)
        const freqs = [587.33, 880.00];
        freqs.forEach((f, idx) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          const vol = idx === 0 ? 0.18 : 0.06;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(vol, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

          osc.connect(gain);
          gain.connect(this.audioCtx!.destination);

          osc.start(now);
          osc.stop(now + 1.25);
        });
      }
    } catch {
      // Ignore audio context autoplay restrictions
    }
  }
}

export const vernacularVoice = new VernacularVoiceEngine();
