import * as THREE from 'three';
import { Settings } from '@config/settings';
import gridVertexShader from '@shaders/grid/vertex.glsl';
import gridFragmentShader from '@shaders/grid/fragment.glsl';

export class GridSystem {
  public mesh: THREE.Mesh;
  public material: THREE.ShaderMaterial;
  private time = 0;

  constructor() {
    this.material = this.createMaterial();
    this.mesh = this.createMesh();
  }

  private createMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      uniforms: {
        time: { value: 0 },
        waveIntensity: { value: 0.5 },
        glitchIntensity: { value: 0.1 },
        color1: { value: Settings.visual.colors.primary },
        color2: { value: Settings.visual.colors.secondary },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  private createMesh(): THREE.Mesh {
    const { width, height, widthSegments, heightSegments } = Settings.device.geometryDetail.grid;
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.rotation.x = -Math.PI / 2;

    return mesh;
  }

  public update(deltaTime: number, consciousness: number, fulfillment: number): void {
    this.time += deltaTime;

    this.material.uniforms.time.value = this.time;
    this.material.uniforms.waveIntensity.value = 0.5 + consciousness * 1.5;
    this.material.uniforms.glitchIntensity.value = 0.1 + (1 - fulfillment) * 0.3;
  }

  public setWaveIntensity(intensity: number): void {
    this.material.uniforms.waveIntensity.value = intensity;
  }

  public setGlitchIntensity(intensity: number): void {
    this.material.uniforms.glitchIntensity.value = intensity;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
