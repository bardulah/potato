import * as THREE from 'three';
import { SceneManager } from '@systems/SceneManager';
import { GridSystem } from '@systems/GridSystem';
import { OrbSystem } from '@systems/OrbSystem';
import { ParticleSystem } from '@systems/ParticleSystem';
import { InteractionController } from '@systems/InteractionController';
import { AudioSystem } from '@systems/AudioSystem';
import { NarrativeSystem } from '@systems/NarrativeSystem';
import { GlitchSystem } from '@systems/GlitchSystem';
import { UIController } from '@systems/UIController';
import { DebugGUI } from '@systems/DebugGUI';
import { EventBus, WebGLUtils } from '@utils/helpers';
import { GameState } from '@/types';
import { Settings } from '@config/settings';

export class Application {
  private sceneManager: SceneManager;
  private gridSystem: GridSystem;
  private orbSystem: OrbSystem;
  private particleSystem: ParticleSystem;
  private interactionController: InteractionController;
  private audioSystem: AudioSystem;
  private narrativeSystem: NarrativeSystem;
  private glitchSystem: GlitchSystem;
  private uiController: UIController;
  private debugGUI: DebugGUI | null = null;

  private isRunning = false;
  private isPaused = false;
  private lastTime = 0;
  private clock = new THREE.Clock();

  constructor(canvas: HTMLCanvasElement) {
    // Check WebGL support
    if (!WebGLUtils.isWebGLSupported()) {
      this.showError('WebGL is not supported in your browser. Please try a modern browser.');
      throw new Error('WebGL not supported');
    }

    // Log capabilities in debug mode
    if (Settings.debug.enabled) {
      const caps = WebGLUtils.getCapabilities();
      console.log('WebGL Capabilities:', caps);
    }

    // Initialize UI first
    this.uiController = new UIController();
    this.uiController.showLoading();

    try {
      // Initialize core systems
      this.sceneManager = new SceneManager(canvas);
      this.gridSystem = new GridSystem();
      this.orbSystem = new OrbSystem();
      this.particleSystem = new ParticleSystem();
      this.interactionController = new InteractionController(canvas, this.sceneManager.camera);
      this.audioSystem = new AudioSystem();
      this.narrativeSystem = new NarrativeSystem();
      this.glitchSystem = new GlitchSystem(this.sceneManager.scene);

      // Add systems to scene
      this.sceneManager.scene.add(this.gridSystem.mesh);
      this.sceneManager.scene.add(this.orbSystem.group);
      this.sceneManager.scene.add(this.particleSystem.points);

      // Initialize debug GUI if enabled
      if (Settings.debug.enabled) {
        this.debugGUI = new DebugGUI();
      }

      // Setup event listeners
      this.setupEventListeners();

      // Hide loading, show intro
      this.uiController.hideLoading();

      if (Settings.debug.logEvents) {
        console.log('Application initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError('Failed to initialize the simulation. Please refresh the page.');
      throw error;
    }
  }

  private setupEventListeners(): void {
    EventBus.on('game:start', this.start.bind(this));
    EventBus.on('game:pause', this.pause.bind(this));
    EventBus.on('game:resume', this.resume.bind(this));

    // Audio events
    EventBus.on('audio:play_glitch', () => this.audioSystem.playGlitchSound());
    EventBus.on('audio:play_transition', (data: any) =>
      this.audioSystem.playTransitionSound(data.zone)
    );
    EventBus.on('audio:set_master', (volume: number) => this.audioSystem.setMasterVolume(volume));
    EventBus.on('audio:set_ambient', (volume: number) => this.audioSystem.setAmbientVolume(volume));
    EventBus.on('audio:set_effects', (volume: number) =>
      this.audioSystem.setEffectsVolume(volume)
    );

    // Narrative events
    EventBus.on('narrative:make_choice', (choiceId: string) =>
      this.narrativeSystem.makeChoice(choiceId)
    );
    EventBus.on('narrative:request_choices', () => {
      const choices = this.narrativeSystem.getAvailableChoices();
      this.uiController.showChoices(choices);
    });
    EventBus.on('narrative:glitch_discovered', () => {
      this.narrativeSystem.onGlitchDiscovered();
    });

    // Debug events
    if (Settings.debug.enabled) {
      EventBus.on('debug:trigger_glitch', () => this.glitchSystem.triggerRandomGlitch());
      EventBus.on('debug:grid_wave', (value: number) => this.gridSystem.setWaveIntensity(value));
      EventBus.on('debug:grid_glitch', (value: number) =>
        this.gridSystem.setGlitchIntensity(value)
      );
      EventBus.on('debug:camera_fov', (fov: number) => {
        this.sceneManager.camera.fov = fov;
        this.sceneManager.camera.updateProjectionMatrix();
      });
      EventBus.on('debug:camera_pos', (pos: any) => {
        if (pos.x !== undefined) this.sceneManager.camera.position.x = pos.x;
        if (pos.y !== undefined) this.sceneManager.camera.position.y = pos.y;
        if (pos.z !== undefined) this.sceneManager.camera.position.z = pos.z;
      });
    }
  }

  private start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.clock.start();
    this.animate();

    if (Settings.debug.logEvents) {
      console.log('Application started');
    }
  }

  private pause(): void {
    this.isPaused = true;
    this.audioSystem.suspend();

    if (Settings.debug.logEvents) {
      console.log('Application paused');
    }
  }

  private resume(): void {
    this.isPaused = false;
    this.audioSystem.resume();

    if (Settings.debug.logEvents) {
      console.log('Application resumed');
    }
  }

  private animate(): void {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.animate());

    if (this.isPaused) {
      this.sceneManager.render();
      return;
    }

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Update all systems
    this.update(deltaTime, elapsedTime);

    // Render
    this.sceneManager.render();

    // Update debug GUI
    if (this.debugGUI) {
      this.debugGUI.update();
      const poolStats = this.particleSystem.getPoolStats();
      this.debugGUI.updatePoolStats(poolStats);
    }
  }

  private update(deltaTime: number, elapsedTime: number): void {
    // Update narrative system
    this.narrativeSystem.update(deltaTime);
    const state = this.narrativeSystem.getState();

    // Update grid
    this.gridSystem.update(deltaTime, state.consciousness, state.fulfillment);

    // Update orbs
    this.orbSystem.update(deltaTime, this.sceneManager.camera.position, state.fulfillment);

    // Update particles
    this.particleSystem.update(deltaTime);

    // Update interactions
    this.interactionController.update(this.orbSystem.group);

    // Update glitches
    this.glitchSystem.update(deltaTime);

    // Update UI
    this.uiController.updateProgress(state.consciousness, state.fulfillment);
    this.uiController.updateMessage(this.narrativeSystem.getMessage());

    // Play orb sounds occasionally
    if (Math.random() < 0.001) {
      this.audioSystem.playOrbSound(state.fulfillment);
    }
  }

  private showError(message: string): void {
    this.uiController.showError(message);
  }

  public dispose(): void {
    this.isRunning = false;

    // Dispose all systems
    this.sceneManager.dispose();
    this.gridSystem.dispose();
    this.orbSystem.dispose();
    this.particleSystem.dispose();
    this.interactionController.dispose();
    this.audioSystem.dispose();
    this.glitchSystem.dispose();

    if (this.debugGUI) {
      this.debugGUI.dispose();
    }

    // Clear event bus
    EventBus.clear();

    if (Settings.debug.logEvents) {
      console.log('Application disposed');
    }
  }
}
