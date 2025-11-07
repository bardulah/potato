import * as THREE from 'three';

export class MathUtils {
  /**
   * Smooth interpolation
   */
  static lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Map value from one range to another
   */
  static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  /**
   * Smooth step function
   */
  static smoothstep(edge0: number, edge1: number, x: number): number {
    const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /**
   * Random float between min and max
   */
  static randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export class WebGLUtils {
  /**
   * Check if WebGL is supported
   */
  static isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if WebGL2 is supported
   */
  static isWebGL2Supported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!window.WebGL2RenderingContext && !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  }

  /**
   * Get WebGL capabilities
   */
  static getCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return null;
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    return {
      vendor: debugInfo
        ? (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : 'Unknown',
      renderer: debugInfo
        ? (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : 'Unknown',
      maxTextureSize: (gl as WebGLRenderingContext).getParameter(
        (gl as WebGLRenderingContext).MAX_TEXTURE_SIZE
      ),
      maxVertexUniforms: (gl as WebGLRenderingContext).getParameter(
        (gl as WebGLRenderingContext).MAX_VERTEX_UNIFORM_VECTORS
      ),
      maxFragmentUniforms: (gl as WebGLRenderingContext).getParameter(
        (gl as WebGLRenderingContext).MAX_FRAGMENT_UNIFORM_VECTORS
      ),
    };
  }
}

export class ColorUtils {
  /**
   * Interpolate between two colors
   */
  static lerpColors(color1: THREE.Color, color2: THREE.Color, t: number): THREE.Color {
    const result = new THREE.Color();
    result.r = MathUtils.lerp(color1.r, color2.r, t);
    result.g = MathUtils.lerp(color1.g, color2.g, t);
    result.b = MathUtils.lerp(color1.b, color2.b, t);
    return result;
  }

  /**
   * Convert hex to RGB
   */
  static hexToRgb(hex: number): { r: number; g: number; b: number } {
    return {
      r: ((hex >> 16) & 255) / 255,
      g: ((hex >> 8) & 255) / 255,
      b: (hex & 255) / 255,
    };
  }
}

/**
 * Type-safe event bus with proper memory management
 */
export type EventMap = {
  // Game events
  'game:start': void;
  'game:pause': void;
  'game:resume': void;
  'game:toggle_pause': void;
  'game:show_menu': void;

  // Audio events
  'audio:initialize': void;
  'audio:play_glitch': void;
  'audio:play_transition': { zone: string };
  'audio:set_master': number;
  'audio:set_ambient': number;
  'audio:set_effects': number;

  // Narrative events
  'narrative:make_choice': string;
  'narrative:request_choices': void;
  'narrative:glitch_discovered': void;
  'narrative:zone_change': { zone: string };
  'narrative:choice_made': any;
  'narrative:ending': any;

  // Mouse/Touch events
  'mouse:move': { mouse: THREE.Vector2; event: MouseEvent };
  'mouse:click': { mouse: THREE.Vector2; raycaster: THREE.Raycaster; event: MouseEvent };
  'touch:start': { touch: Touch; mouse: THREE.Vector2 };
  'touch:move': { deltaX: number; deltaY: number };
  'touch:end': { touch: Touch; mouse: THREE.Vector2; raycaster: THREE.Raycaster };

  // Camera events
  'camera:zoom': { delta: number; newZ: number };

  // Keyboard events
  'keyboard:down': { key: string; code: string; event: KeyboardEvent };

  // Debug events
  'debug:toggle': void;
  'debug:trigger_glitch': void;
  'debug:grid_wave': number;
  'debug:grid_glitch': number;
  'debug:camera_fov': number;
  'debug:camera_pos': { x?: number; y?: number; z?: number };
  'debug:color_change': { type: string; color: string };
  'debug:change_zone': string;
  'debug:pool_stats': { available: number; inUse: number; total: number };
};

export class EventBus {
  private static listeners = new Map<keyof EventMap, Set<Function>>();

  static on<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  static off<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.delete(callback);
  }

  static emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.forEach((callback) => callback(data));
  }

  static clear(): void {
    this.listeners.clear();
  }

  static getListenerCount<K extends keyof EventMap>(event: K): number {
    return this.listeners.get(event)?.size || 0;
  }
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimes: number[] = [];
  private maxFrameTimes = 60;

  update(): number {
    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;

    // Track frame times for more detailed analysis
    this.frameTimes.push(delta);
    if (this.frameTimes.length > this.maxFrameTimes) {
      this.frameTimes.shift();
    }

    if (delta >= 1000) {
      this.fps = (this.frameCount * 1000) / delta;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    return this.fps;
  }

  getFPS(): number {
    return this.fps;
  }

  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  getWorstFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return Math.max(...this.frameTimes);
  }

  getStats() {
    return {
      fps: this.fps,
      avgFrameTime: this.getAverageFrameTime(),
      worstFrameTime: this.getWorstFrameTime(),
      frameCount: this.frameCount,
    };
  }
}

export class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;

    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }

  releaseAll(): void {
    this.inUse.forEach((obj) => {
      this.reset(obj);
      this.available.push(obj);
    });
    this.inUse.clear();
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}

/**
 * User preferences manager with localStorage persistence
 */
export class PreferencesManager {
  private static readonly STORAGE_KEY = 'simulation-reality-prefs';
  private prefs: Record<string, any> = {};

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(PreferencesManager.STORAGE_KEY);
      if (stored) {
        this.prefs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  }

  private save(): void {
    try {
      localStorage.setItem(PreferencesManager.STORAGE_KEY, JSON.stringify(this.prefs));
    } catch (error) {
      console.warn('Failed to save preferences:', error);
    }
  }

  get<T>(key: string, defaultValue: T): T {
    return this.prefs[key] !== undefined ? this.prefs[key] : defaultValue;
  }

  set(key: string, value: any): void {
    this.prefs[key] = value;
    this.save();
  }

  has(key: string): boolean {
    return this.prefs[key] !== undefined;
  }

  remove(key: string): void {
    delete this.prefs[key];
    this.save();
  }

  clear(): void {
    this.prefs = {};
    localStorage.removeItem(PreferencesManager.STORAGE_KEY);
  }
}

/**
 * Simple analytics tracker (for hooks, doesn't send data)
 */
export class Analytics {
  static trackEvent(category: string, action: string, label?: string, value?: number): void {
    if (import.meta.env.DEV) {
      console.log('[Analytics]', { category, action, label, value });
    }
    // Hook for actual analytics integration
    // window.gtag?.('event', action, { category, label, value });
  }

  static trackPageView(path: string): void {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Page view:', path);
    }
    // Hook for actual analytics integration
    // window.gtag?.('config', 'GA_MEASUREMENT_ID', { page_path: path });
  }

  static trackTiming(category: string, variable: string, time: number): void {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Timing:', { category, variable, time });
    }
    // Hook for actual analytics integration
  }
}
