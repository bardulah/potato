import * as THREE from 'three';
import { GlitchEffect } from '@/types';
import { EventBus } from '@utils/helpers';
import glitchVertexShader from '@shaders/glitch/vertex.glsl';
import glitchFragmentShader from '@shaders/glitch/fragment.glsl';
import { Settings } from '@config/settings';

export class GlitchSystem {
  private glitches: Map<string, GlitchEffect> = new Map();
  private glitchMeshes: Map<string, THREE.Mesh> = new Map();
  private scene: THREE.Scene;
  private time = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    EventBus.on('mouse:click', this.onInteraction.bind(this));
    EventBus.on('touch:end', this.onInteraction.bind(this));
  }

  private onInteraction(data: any): void {
    const { raycaster } = data;

    // Create glitch effect at click/touch point
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.createGlitch(point);

      EventBus.emit('narrative:glitch_discovered');
      EventBus.emit('audio:play_glitch');
    }
  }

  public createGlitch(position: THREE.Vector3): void {
    const id = `glitch_${Date.now()}_${Math.random()}`;

    const glitch: GlitchEffect = {
      active: true,
      center: new THREE.Vector2(Math.random(), Math.random()),
      intensity: 1.0,
      duration: 2.0,
      elapsed: 0,
    };

    this.glitches.set(id, glitch);

    // Create visual mesh for the glitch
    const geometry = new THREE.PlaneGeometry(2, 2, 20, 20);
    const material = new THREE.ShaderMaterial({
      vertexShader: glitchVertexShader,
      fragmentShader: glitchFragmentShader,
      uniforms: {
        time: { value: 0 },
        glitchCenter: { value: glitch.center },
        glitchIntensity: { value: glitch.intensity },
        glitchColor: { value: Settings.visual.colors.glitch },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.position.y += 0.5; // Slightly above the surface

    this.scene.add(mesh);
    this.glitchMeshes.set(id, mesh);

    if (Settings.debug.logEvents) {
      console.log('Glitch created at:', position);
    }
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;

    this.glitches.forEach((glitch, id) => {
      if (!glitch.active) return;

      glitch.elapsed += deltaTime;

      // Fade out over time
      const progress = glitch.elapsed / glitch.duration;
      glitch.intensity = Math.max(0, 1 - progress);

      // Update mesh
      const mesh = this.glitchMeshes.get(id);
      if (mesh && mesh.material instanceof THREE.ShaderMaterial) {
        mesh.material.uniforms.time.value = this.time;
        mesh.material.uniforms.glitchIntensity.value = glitch.intensity;
      }

      // Remove when finished
      if (progress >= 1) {
        glitch.active = false;
        this.removeGlitch(id);
      }
    });
  }

  private removeGlitch(id: string): void {
    const mesh = this.glitchMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.ShaderMaterial) {
        mesh.material.dispose();
      }
      this.glitchMeshes.delete(id);
    }

    this.glitches.delete(id);
  }

  public triggerRandomGlitch(): void {
    const x = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 20;
    const position = new THREE.Vector3(x, 0, z);

    this.createGlitch(position);
  }

  public dispose(): void {
    this.glitchMeshes.forEach((mesh, id) => {
      this.removeGlitch(id);
    });

    this.glitches.clear();
    this.glitchMeshes.clear();

    EventBus.off('mouse:click', this.onInteraction.bind(this));
    EventBus.off('touch:end', this.onInteraction.bind(this));
  }
}
