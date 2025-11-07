import * as THREE from 'three';

export interface DeviceConfig {
  orbCount: number;
  particleCount: number;
  antialiasing: boolean;
  shadowMap: boolean;
  pixelRatio: number;
  geometryDetail: {
    grid: { width: number; height: number; widthSegments: number; heightSegments: number };
    orb: { radius: number; widthSegments: number; heightSegments: number };
  };
}

export interface VisualConfig {
  colors: {
    primary: THREE.Color;
    secondary: THREE.Color;
    accent: THREE.Color;
    glitch: THREE.Color;
  };
  fog: {
    near: number;
    far: number;
    color: THREE.Color;
  };
}

export interface AudioConfig {
  enabled: boolean;
  masterVolume: number;
  ambientVolume: number;
  effectsVolume: number;
}

export interface GameplayConfig {
  progressionSpeed: {
    consciousness: number;
    fulfillment: number;
  };
  zones: {
    void: { fulfillmentThreshold: number };
    awakening: { fulfillmentThreshold: number };
    transcendence: { fulfillmentThreshold: number };
  };
  endings: string[];
}

export class Settings {
  public static isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  public static isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  public static device: DeviceConfig = Settings.isMobile
    ? {
        orbCount: 8,
        particleCount: 200,
        antialiasing: false,
        shadowMap: false,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        geometryDetail: {
          grid: { width: 40, height: 40, widthSegments: 40, heightSegments: 40 },
          orb: { radius: 0.3, widthSegments: 12, heightSegments: 12 },
        },
      }
    : {
        orbCount: 15,
        particleCount: 500,
        antialiasing: true,
        shadowMap: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        geometryDetail: {
          grid: { width: 40, height: 40, widthSegments: 80, heightSegments: 80 },
          orb: { radius: 0.3, widthSegments: 32, heightSegments: 32 },
        },
      };

  public static visual: VisualConfig = {
    colors: {
      primary: new THREE.Color(0x00ffff),
      secondary: new THREE.Color(0xff00ff),
      accent: new THREE.Color(0x00ff88),
      glitch: new THREE.Color(0xff0066),
    },
    fog: {
      near: 10,
      far: 50,
      color: new THREE.Color(0x000000),
    },
  };

  public static audio: AudioConfig = {
    enabled: true,
    masterVolume: 0.7,
    ambientVolume: 0.5,
    effectsVolume: 0.8,
  };

  public static gameplay: GameplayConfig = {
    progressionSpeed: {
      consciousness: 0.001,
      fulfillment: 0.0005,
    },
    zones: {
      void: { fulfillmentThreshold: 0 },
      awakening: { fulfillmentThreshold: 0.33 },
      transcendence: { fulfillmentThreshold: 0.66 },
    },
    endings: ['dissolution', 'acceptance', 'transcendence', 'rebellion'],
  };

  public static camera = {
    fov: 75,
    near: 0.1,
    far: 1000,
    initialPosition: new THREE.Vector3(0, 8, 15),
    zoomLimits: { min: 8, max: 25 },
  };

  public static controls = {
    rotationSpeed: 0.3,
    smoothing: 0.05,
    touchSensitivity: 0.005,
    wheelSensitivity: 0.01,
  };

  public static debug = {
    enabled: import.meta.env.DEV,
    showStats: false,
    showHelpers: false,
    logEvents: false,
  };

  // Allow runtime updates
  public static updateDeviceConfig(config: Partial<DeviceConfig>) {
    Settings.device = { ...Settings.device, ...config };
  }

  public static updateVisualConfig(config: Partial<VisualConfig>) {
    Settings.visual = { ...Settings.visual, ...config };
  }

  public static updateAudioConfig(config: Partial<AudioConfig>) {
    Settings.audio = { ...Settings.audio, ...config };
  }
}
