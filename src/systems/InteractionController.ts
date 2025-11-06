import * as THREE from 'three';
import { Settings } from '@config/settings';
import { EventBus } from '@utils/helpers';

export class InteractionController {
  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;
  private mouse = new THREE.Vector2();
  private targetRotation = new THREE.Vector2();
  private currentRotation = new THREE.Vector2();
  private touchStartX = 0;
  private touchStartY = 0;

  // Bound methods to avoid memory leaks
  private boundOnMouseMove = this.onMouseMove.bind(this);
  private boundOnClick = this.onClick.bind(this);
  private boundOnTouchStart = this.onTouchStart.bind(this);
  private boundOnTouchMove = this.onTouchMove.bind(this);
  private boundOnTouchEnd = this.onTouchEnd.bind(this);
  private boundOnWheel = this.onWheel.bind(this);
  private boundOnKeyDown = this.onKeyDown.bind(this);

  constructor(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera) {
    this.canvas = canvas;
    this.camera = camera;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse movement
    window.addEventListener('mousemove', this.boundOnMouseMove);
    window.addEventListener('click', this.boundOnClick);

    // Touch support
    this.canvas.addEventListener('touchstart', this.boundOnTouchStart);
    this.canvas.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.boundOnTouchEnd);

    // Scroll/pinch to zoom
    window.addEventListener('wheel', this.boundOnWheel, { passive: false });

    // Keyboard
    window.addEventListener('keydown', this.boundOnKeyDown);
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.targetRotation.x = this.mouse.y * Settings.controls.rotationSpeed;
    this.targetRotation.y = this.mouse.x * Settings.controls.rotationSpeed;

    EventBus.emit('mouse:move', {
      mouse: this.mouse.clone(),
      event
    });
  }

  private onClick(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Create NEW raycaster for this event to avoid sharing
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mouse, this.camera);

    EventBus.emit('mouse:click', {
      mouse: this.mouse.clone(),
      raycaster,
      event,
    });
  }

  private onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;

      // Convert touch to normalized coordinates
      this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

      EventBus.emit('touch:start', {
        touch: event.touches[0],
        mouse: this.mouse.clone()
      });
    }
  }

  private onTouchMove(event: TouchEvent): void {
    event.preventDefault();

    if (event.touches.length > 0) {
      const deltaX = event.touches[0].clientX - this.touchStartX;
      const deltaY = event.touches[0].clientY - this.touchStartY;

      this.targetRotation.y += deltaX * Settings.controls.touchSensitivity;
      this.targetRotation.x += deltaY * Settings.controls.touchSensitivity;

      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;

      EventBus.emit('touch:move', { deltaX, deltaY });
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length > 0) {
      // Convert touch to normalized coordinates for raycasting
      const touch = event.changedTouches[0];
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

      // Create NEW raycaster for this event
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(this.mouse, this.camera);

      EventBus.emit('touch:end', {
        touch,
        mouse: this.mouse.clone(),
        raycaster,
      });
    }
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = event.deltaY * Settings.controls.wheelSensitivity;
    const newZ = this.camera.position.z + delta;

    this.camera.position.z = Math.max(
      Settings.camera.zoomLimits.min,
      Math.min(Settings.camera.zoomLimits.max, newZ)
    );

    EventBus.emit('camera:zoom', { delta, newZ: this.camera.position.z });
  }

  private onKeyDown(event: KeyboardEvent): void {
    EventBus.emit('keyboard:down', { key: event.key, code: event.code, event });

    // Common shortcuts
    if (event.key === ' ') {
      event.preventDefault();
      EventBus.emit('game:toggle_pause', undefined);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      EventBus.emit('game:show_menu', undefined);
    } else if (event.key === 'd' && event.ctrlKey) {
      event.preventDefault();
      EventBus.emit('debug:toggle', undefined);
    }
  }

  public update(target: THREE.Object3D): void {
    // Smooth rotation interpolation
    this.currentRotation.x +=
      (this.targetRotation.x - this.currentRotation.x) * Settings.controls.smoothing;
    this.currentRotation.y +=
      (this.targetRotation.y - this.currentRotation.y) * Settings.controls.smoothing;

    target.rotation.y = this.currentRotation.y;
    target.rotation.x = this.currentRotation.x * 0.5;
  }

  public getRotation(): THREE.Vector2 {
    return this.currentRotation.clone();
  }

  public dispose(): void {
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    window.removeEventListener('click', this.boundOnClick);
    this.canvas.removeEventListener('touchstart', this.boundOnTouchStart);
    this.canvas.removeEventListener('touchmove', this.boundOnTouchMove);
    this.canvas.removeEventListener('touchend', this.boundOnTouchEnd);
    window.removeEventListener('wheel', this.boundOnWheel);
    window.removeEventListener('keydown', this.boundOnKeyDown);
  }
}
