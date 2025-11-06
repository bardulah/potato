import * as THREE from 'three';

export interface OrbData {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  initialPos: THREE.Vector3;
  speed: number;
  offset: number;
  fulfillment: number;
}

export interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface GlitchEffect {
  active: boolean;
  center: THREE.Vector2;
  intensity: number;
  duration: number;
  elapsed: number;
}

export enum GameState {
  LOADING = 'loading',
  INTRO = 'intro',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export enum Zone {
  VOID = 'void',
  AWAKENING = 'awakening',
  TRANSCENDENCE = 'transcendence',
}

export enum Ending {
  DISSOLUTION = 'dissolution',
  ACCEPTANCE = 'acceptance',
  TRANSCENDENCE = 'transcendence',
  REBELLION = 'rebellion',
}

export interface NarrativeEvent {
  type: 'message' | 'choice' | 'zone_change' | 'ending';
  data: any;
  timestamp: number;
}

export interface Choice {
  id: string;
  text: string;
  consequences: {
    consciousness?: number;
    fulfillment?: number;
    ending?: Ending;
  };
}

export interface PlayerState {
  consciousness: number;
  fulfillment: number;
  currentZone: Zone;
  choices: string[];
  discoveredGlitches: number;
  timeElapsed: number;
}

export interface AudioTrack {
  url: string;
  volume: number;
  loop: boolean;
}
