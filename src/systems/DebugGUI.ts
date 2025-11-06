import GUI from 'lil-gui';
import { Settings } from '@config/settings';
import { EventBus, PerformanceMonitor } from '@utils/helpers';
import * as THREE from 'three';

export class DebugGUI {
  private gui: GUI | null = null;
  private performanceMonitor: PerformanceMonitor;
  private fpsElement: HTMLElement | null = null;
  private isVisible = false;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();

    if (Settings.debug.enabled) {
      this.setupGUI();
      this.setupEventListeners();
    }
  }

  private setupGUI(): void {
    this.gui = new GUI({ title: 'Simulation Controls' });
    this.gui.close();

    // Performance folder
    const perfFolder = this.gui.addFolder('Performance');
    perfFolder.add(Settings.debug, 'showStats').name('Show FPS').onChange((value: boolean) => {
      if (value) {
        this.showFPS();
      } else {
        this.hideFPS();
      }
    });

    const poolStats = { available: 0, inUse: 0, total: 0 };
    perfFolder.add(poolStats, 'available').name('Pool Available').disable();
    perfFolder.add(poolStats, 'inUse').name('Pool In Use').disable();
    perfFolder.add(poolStats, 'total').name('Pool Total').disable();

    // Visual folder
    const visualFolder = this.gui.addFolder('Visual');

    const colorSettings = {
      primary: `#${Settings.visual.colors.primary.getHexString()}`,
      secondary: `#${Settings.visual.colors.secondary.getHexString()}`,
      accent: `#${Settings.visual.colors.accent.getHexString()}`,
      glitch: `#${Settings.visual.colors.glitch.getHexString()}`,
    };

    visualFolder.addColor(colorSettings, 'primary').onChange((value: string) => {
      Settings.visual.colors.primary.setStyle(value);
      EventBus.emit('debug:color_change', { type: 'primary', color: value });
    });

    visualFolder.addColor(colorSettings, 'secondary').onChange((value: string) => {
      Settings.visual.colors.secondary.setStyle(value);
      EventBus.emit('debug:color_change', { type: 'secondary', color: value });
    });

    // Grid settings
    const gridFolder = this.gui.addFolder('Grid');
    const gridSettings = {
      waveIntensity: 0.5,
      glitchIntensity: 0.1,
    };

    gridFolder.add(gridSettings, 'waveIntensity', 0, 3, 0.1).onChange((value: number) => {
      EventBus.emit('debug:grid_wave', value);
    });

    gridFolder.add(gridSettings, 'glitchIntensity', 0, 1, 0.01).onChange((value: number) => {
      EventBus.emit('debug:grid_glitch', value);
    });

    // Audio folder
    const audioFolder = this.gui.addFolder('Audio');
    audioFolder.add(Settings.audio, 'masterVolume', 0, 1, 0.01).onChange((value: number) => {
      EventBus.emit('audio:set_master', value);
    });

    audioFolder.add(Settings.audio, 'ambientVolume', 0, 1, 0.01).onChange((value: number) => {
      EventBus.emit('audio:set_ambient', value);
    });

    audioFolder.add(Settings.audio, 'effectsVolume', 0, 1, 0.01).onChange((value: number) => {
      EventBus.emit('audio:set_effects', value);
    });

    // Gameplay folder
    const gameplayFolder = this.gui.addFolder('Gameplay');
    gameplayFolder
      .add(Settings.gameplay.progressionSpeed, 'consciousness', 0, 0.01, 0.0001)
      .name('Consciousness Speed');

    gameplayFolder
      .add(Settings.gameplay.progressionSpeed, 'fulfillment', 0, 0.01, 0.0001)
      .name('Fulfillment Speed');

    // Actions folder
    const actionsFolder = this.gui.addFolder('Actions');

    const actions = {
      triggerGlitch: () => EventBus.emit('debug:trigger_glitch'),
      zoneVoid: () => EventBus.emit('debug:change_zone', 'void'),
      zoneAwakening: () => EventBus.emit('debug:change_zone', 'awakening'),
      zoneTranscendence: () => EventBus.emit('debug:change_zone', 'transcendence'),
      showChoices: () => EventBus.emit('narrative:request_choices'),
    };

    actionsFolder.add(actions, 'triggerGlitch').name('Trigger Random Glitch');
    actionsFolder.add(actions, 'zoneVoid').name('Force: Void Zone');
    actionsFolder.add(actions, 'zoneAwakening').name('Force: Awakening Zone');
    actionsFolder.add(actions, 'zoneTranscendence').name('Force: Transcendence Zone');
    actionsFolder.add(actions, 'showChoices').name('Show Choices');

    // Camera folder
    const cameraFolder = this.gui.addFolder('Camera');
    const cameraSettings = {
      fov: Settings.camera.fov,
      x: Settings.camera.initialPosition.x,
      y: Settings.camera.initialPosition.y,
      z: Settings.camera.initialPosition.z,
    };

    cameraFolder.add(cameraSettings, 'fov', 30, 120, 1).onChange((value: number) => {
      EventBus.emit('debug:camera_fov', value);
    });

    cameraFolder.add(cameraSettings, 'x', -30, 30, 1).onChange((value: number) => {
      EventBus.emit('debug:camera_pos', { x: value });
    });

    cameraFolder.add(cameraSettings, 'y', 0, 30, 1).onChange((value: number) => {
      EventBus.emit('debug:camera_pos', { y: value });
    });

    cameraFolder.add(cameraSettings, 'z', 5, 40, 1).onChange((value: number) => {
      EventBus.emit('debug:camera_pos', { z: value });
    });
  }

  private setupEventListeners(): void {
    EventBus.on('debug:toggle', this.toggle.bind(this));
  }

  private showFPS(): void {
    if (this.fpsElement) return;

    this.fpsElement = document.createElement('div');
    this.fpsElement.id = 'fps-counter';
    this.fpsElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ffff;
      padding: 10px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      border: 1px solid #00ffff;
      z-index: 10000;
    `;

    document.body.appendChild(this.fpsElement);
  }

  private hideFPS(): void {
    if (this.fpsElement) {
      document.body.removeChild(this.fpsElement);
      this.fpsElement = null;
    }
  }

  public update(): void {
    if (!Settings.debug.enabled) return;

    const fps = this.performanceMonitor.update();

    if (this.fpsElement && Settings.debug.showStats) {
      this.fpsElement.textContent = `FPS: ${fps.toFixed(1)}`;
    }
  }

  public updatePoolStats(stats: { available: number; inUse: number; total: number }): void {
    if (!this.gui) return;

    // This would require maintaining a reference to the controller
    // For simplicity, we emit an event that can be listened to
    EventBus.emit('debug:pool_stats', stats);
  }

  public toggle(): void {
    if (!this.gui) return;

    this.isVisible = !this.isVisible;

    if (this.isVisible) {
      this.gui.open();
    } else {
      this.gui.close();
    }
  }

  public show(): void {
    if (this.gui) {
      this.gui.open();
      this.isVisible = true;
    }
  }

  public hide(): void {
    if (this.gui) {
      this.gui.close();
      this.isVisible = false;
    }
  }

  public dispose(): void {
    if (this.gui) {
      this.gui.destroy();
      this.gui = null;
    }

    this.hideFPS();

    EventBus.off('debug:toggle', this.toggle.bind(this));
  }
}
