import { Settings } from '@config/settings';
import { EventBus } from '@utils/helpers';

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private isInitialized = false;

  constructor() {
    // Audio context must be initialized by user interaction
    EventBus.on('audio:initialize', this.initialize.bind(this));
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized || !Settings.audio.enabled) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create gain nodes
      this.masterGain = this.audioContext.createGain();
      this.ambientGain = this.audioContext.createGain();
      this.effectsGain = this.audioContext.createGain();

      // Set volumes
      this.masterGain.gain.value = Settings.audio.masterVolume;
      this.ambientGain.gain.value = Settings.audio.ambientVolume;
      this.effectsGain.gain.value = Settings.audio.effectsVolume;

      // Connect gain nodes
      this.ambientGain.connect(this.masterGain);
      this.effectsGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      this.isInitialized = true;

      // Start ambient sounds
      this.createAmbientDrone();

      if (Settings.debug.logEvents) {
        console.log('Audio system initialized');
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  private createAmbientDrone(): void {
    if (!this.audioContext || !this.ambientGain) return;

    // Low drone
    const drone1 = this.audioContext.createOscillator();
    drone1.type = 'sine';
    drone1.frequency.value = 55; // A1

    const drone1Gain = this.audioContext.createGain();
    drone1Gain.gain.value = 0.1;

    drone1.connect(drone1Gain);
    drone1Gain.connect(this.ambientGain);
    drone1.start();

    this.oscillators.set('drone1', drone1);

    // Mid drone with LFO
    const drone2 = this.audioContext.createOscillator();
    drone2.type = 'triangle';
    drone2.frequency.value = 110; // A2

    const drone2Gain = this.audioContext.createGain();
    drone2Gain.gain.value = 0.05;

    // LFO for modulation
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 5;

    lfo.connect(lfoGain);
    lfoGain.connect(drone2.frequency);

    drone2.connect(drone2Gain);
    drone2Gain.connect(this.ambientGain);
    drone2.start();
    lfo.start();

    this.oscillators.set('drone2', drone2);
    this.oscillators.set('lfo', lfo);

    // High shimmer
    const shimmer = this.audioContext.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 880; // A5

    const shimmerGain = this.audioContext.createGain();
    shimmerGain.gain.value = 0.02;

    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.ambientGain);
    shimmer.start();

    this.oscillators.set('shimmer', shimmer);
  }

  public playGlitchSound(): void {
    if (!this.audioContext || !this.effectsGain) return;

    const now = this.audioContext.currentTime;

    // Create noise-like glitch
    const glitch = this.audioContext.createOscillator();
    glitch.type = 'square';
    glitch.frequency.value = 100 + Math.random() * 500;

    const glitchGain = this.audioContext.createGain();
    glitchGain.gain.setValueAtTime(0.1, now);
    glitchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    glitch.connect(glitchGain);
    glitchGain.connect(this.effectsGain);

    glitch.start(now);
    glitch.stop(now + 0.1);
  }

  public playOrbSound(fulfillment: number): void {
    if (!this.audioContext || !this.effectsGain) return;

    const now = this.audioContext.currentTime;

    // Pitch based on fulfillment
    const baseFreq = 220;
    const freq = baseFreq + fulfillment * 440;

    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.effectsGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playTransitionSound(zone: string): void {
    if (!this.audioContext || !this.effectsGain) return;

    const now = this.audioContext.currentTime;

    // Rising sweep
    const sweep = this.audioContext.createOscillator();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(200, now);
    sweep.frequency.exponentialRampToValueAtTime(800, now + 0.5);

    const sweepGain = this.audioContext.createGain();
    sweepGain.gain.setValueAtTime(0.1, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    sweep.connect(sweepGain);
    sweepGain.connect(this.effectsGain);

    sweep.start(now);
    sweep.stop(now + 0.5);
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  public setAmbientVolume(volume: number): void {
    if (this.ambientGain) {
      this.ambientGain.gain.value = volume;
    }
  }

  public setEffectsVolume(volume: number): void {
    if (this.effectsGain) {
      this.effectsGain.gain.value = volume;
    }
  }

  public suspend(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public dispose(): void {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
  }
}
