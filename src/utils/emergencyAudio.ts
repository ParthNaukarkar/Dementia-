// Emergency Alarm Audio Engine for Smriti Setu
// Generates loud, unmistakable two-tone siren / medical distress alarm using Web Audio API

class EmergencyAlarmEngine {
  private audioCtx: AudioContext | null = null;
  private isAlarming = false;
  private intervalId: any = null;
  private safetyTimeoutId: any = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGainNodes: GainNode[] = [];
  private listeners: Set<(isAlarming: boolean) => void> = new Set();
  private userInteractionBound = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  constructor() {
    this.setupUserInteractionListener();
  }

  // Pre-bind user interaction listener to unblock Web Audio autoplay restrictions
  private setupUserInteractionListener() {
    if (typeof window === 'undefined' || this.userInteractionBound) return;
    this.userInteractionBound = true;

    const unlockAudio = () => {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (this.isAlarming && ctx && ctx.state === 'running') {
        // Resume siren cycle if it was muted by autoplay
        this.restartSirenLoop();
      }
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.isAlarming);
      } catch {}
    });
  }

  public subscribe(listener: (isAlarming: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isAlarming);
    return () => this.listeners.delete(listener);
  }

  public isPlaying(): boolean {
    return this.isAlarming;
  }

  /**
   * Plays a single two-tone siren pulse burst:
   * Tone A: 960Hz (High urgency piercing tone)
   * Tone B: 720Hz (Low counter-tone)
   */
  private playSirenTone(freq: number, durationSeconds: number) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;

      // Primary penetrating sawtooth wave (gives acoustic bite and harmonic richness)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);

      // Secondary sine wave (gives warm fundamental body)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq, now);

      // Low-pass filter to eliminate harsh digital fizz while preserving penetrating carrying power
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);

      // Volume envelope with anti-click ramps
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gainNode.gain.setValueAtTime(0.35, now + durationSeconds - 0.03);
      gainNode.gain.linearRampToValueAtTime(0.001, now + durationSeconds);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSeconds);
      osc2.stop(now + durationSeconds);

      this.activeOscillators.push(osc1, osc2);
      this.activeGainNodes.push(gainNode);

      // Clean up references after tone finishes
      setTimeout(() => {
        this.activeOscillators = this.activeOscillators.filter((o) => o !== osc1 && o !== osc2);
        this.activeGainNodes = this.activeGainNodes.filter((g) => g !== gainNode);
      }, durationSeconds * 1000 + 100);
    } catch (err) {
      console.warn('Emergency audio synthesis error:', err);
    }
  }

  private restartSirenLoop() {
    this.stopToneGeneration();

    let isHighTone = true;
    const toneDuration = 0.32; // 320ms per tone
    const intervalMs = 350;

    // Immediately play the first tone
    this.playSirenTone(isHighTone ? 960 : 720, toneDuration);
    isHighTone = !isHighTone;

    // Repeating siren cycle
    this.intervalId = setInterval(() => {
      if (!this.isAlarming) {
        this.stopToneGeneration();
        return;
      }
      this.playSirenTone(isHighTone ? 960 : 720, toneDuration);
      isHighTone = !isHighTone;
    }, intervalMs);
  }

  private stopToneGeneration() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Immediately mute any currently running gain nodes
    this.activeGainNodes.forEach((gain) => {
      try {
        if (this.audioCtx) {
          gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
        }
      } catch {}
    });

    // Stop active oscillators
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
    this.activeGainNodes = [];
  }

  /**
   * Starts the loud emergency siren loop on the caregiver device.
   * Continues sounding until stopped via stopEmergencyAlarm() or safety timeout (5 mins).
   */
  public startEmergencyAlarm(): void {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.isAlarming = true;
    this.notifyListeners();
    this.restartSirenLoop();

    // Auto-timeout after 5 minutes of continuous ringing to safeguard device battery
    if (this.safetyTimeoutId) {
      clearTimeout(this.safetyTimeoutId);
    }
    this.safetyTimeoutId = setTimeout(() => {
      this.stopEmergencyAlarm();
    }, 5 * 60 * 1000);
  }

  /**
   * Immediately stops and mutes the siren sound.
   */
  public stopEmergencyAlarm(): void {
    this.isAlarming = false;
    this.stopToneGeneration();

    if (this.safetyTimeoutId) {
      clearTimeout(this.safetyTimeoutId);
      this.safetyTimeoutId = null;
    }

    this.notifyListeners();
  }
}

export const emergencyAlarm = new EmergencyAlarmEngine();
