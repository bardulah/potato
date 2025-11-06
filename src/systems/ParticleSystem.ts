import * as THREE from 'three';
import { Settings } from '@config/settings';
import { ObjectPool } from '@utils/helpers';
import { ParticleData } from '@/types';

export class ParticleSystem {
  public points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private particlePool: ObjectPool<ParticleData>;
  private activeParticles: ParticleData[] = [];
  private positions: Float32Array;
  private particleCount: number;

  constructor() {
    this.particleCount = Settings.device.particleCount;
    this.positions = new Float32Array(this.particleCount * 3);

    // Initialize object pool
    this.particlePool = new ObjectPool<ParticleData>(
      () => this.createParticle(),
      (particle) => this.resetParticle(particle),
      this.particleCount
    );

    this.geometry = this.createGeometry();
    this.material = this.createMaterial();
    this.points = new THREE.Points(this.geometry, this.material);

    this.initializeParticles();
  }

  private createParticle(): ParticleData {
    return {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 1.0,
      maxLife: 1.0,
    };
  }

  private resetParticle(particle: ParticleData): void {
    particle.position.set(
      (Math.random() - 0.5) * 50,
      Math.random() * 20,
      (Math.random() - 0.5) * 50
    );
    particle.velocity.set(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    );
    particle.life = 1.0;
    particle.maxLife = 1.0;
  }

  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    return geometry;
  }

  private createMaterial(): THREE.PointsMaterial {
    return new THREE.PointsMaterial({
      color: Settings.visual.colors.primary,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  private initializeParticles(): void {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = this.particlePool.acquire();
      this.activeParticles.push(particle);
    }
  }

  public update(deltaTime: number): void {
    for (let i = 0; i < this.activeParticles.length; i++) {
      const particle = this.activeParticles[i];

      // Update position
      particle.position.add(particle.velocity);

      // Wrap around boundaries
      if (Math.abs(particle.position.x) > 25) particle.position.x *= -1;
      if (particle.position.y > 20) particle.position.y = 0;
      if (particle.position.y < 0) particle.position.y = 20;
      if (Math.abs(particle.position.z) > 25) particle.position.z *= -1;

      // Update positions array
      this.positions[i * 3] = particle.position.x;
      this.positions[i * 3 + 1] = particle.position.y;
      this.positions[i * 3 + 2] = particle.position.z;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  public setColor(color: THREE.Color): void {
    this.material.color = color;
  }

  public setOpacity(opacity: number): void {
    this.material.opacity = opacity;
  }

  public getPoolStats() {
    return this.particlePool.getStats();
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.particlePool.releaseAll();
    this.activeParticles = [];
  }
}
