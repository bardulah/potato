import * as THREE from 'three';
import { Settings } from '@config/settings';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();

    this.setupScene();
    this.setupEventListeners();
  }

  private createCamera(): THREE.PerspectiveCamera {
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(
      Settings.camera.fov,
      aspect,
      Settings.camera.near,
      Settings.camera.far
    );

    camera.position.copy(Settings.camera.initialPosition);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: Settings.device.antialiasing,
      alpha: true,
      powerPreference: 'high-performance',
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Settings.device.pixelRatio);

    if (Settings.device.shadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    return renderer;
  }

  private setupScene(): void {
    // Fog
    this.scene.fog = new THREE.Fog(
      Settings.visual.fog.color,
      Settings.visual.fog.near,
      Settings.visual.fog.far
    );

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222222);
    this.scene.add(ambientLight);

    // Point lights for atmosphere
    const light1 = new THREE.PointLight(Settings.visual.colors.primary, 1, 30);
    light1.position.set(10, 5, 10);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(Settings.visual.colors.secondary, 1, 30);
    light2.position.set(-10, 5, -10);
    this.scene.add(light2);
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Settings.device.pixelRatio);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
    this.renderer.dispose();
  }
}
