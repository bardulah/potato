import * as THREE from 'three';
import { Settings } from '@config/settings';
import { OrbData } from '@/types';
import { MathUtils } from '@utils/helpers';
import orbVertexShader from '@shaders/orb/vertex.glsl';
import orbFragmentShader from '@shaders/orb/fragment.glsl';

export class OrbSystem {
  public group: THREE.Group;
  private orbs: OrbData[] = [];
  private time = 0;

  constructor() {
    this.group = new THREE.Group();
    this.createOrbs();
  }

  private createOrbs(): void {
    const orbCount = Settings.device.orbCount;
    const { radius, widthSegments, heightSegments } = Settings.device.geometryDetail.orb;

    for (let i = 0; i < orbCount; i++) {
      const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      const material = new THREE.ShaderMaterial({
        vertexShader: orbVertexShader,
        fragmentShader: orbFragmentShader,
        uniforms: {
          time: { value: 0 },
          color: { value: Settings.visual.colors.primary.clone() },
          fulfillment: { value: Math.random() },
          cameraPosition: { value: new THREE.Vector3() },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random position
      const angle = (i / orbCount) * Math.PI * 2;
      const radius_pos = 5 + Math.random() * 8;
      const position = new THREE.Vector3(
        Math.cos(angle) * radius_pos,
        1 + Math.random() * 6,
        Math.sin(angle) * radius_pos
      );

      mesh.position.copy(position);

      const orbData: OrbData = {
        mesh,
        material,
        initialPos: position.clone(),
        speed: 0.3 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        fulfillment: Math.random(),
      };

      this.orbs.push(orbData);
      this.group.add(mesh);
    }
  }

  public update(deltaTime: number, cameraPosition: THREE.Vector3, globalFulfillment: number): void {
    this.time += deltaTime;

    this.orbs.forEach((orb, i) => {
      // Update shader uniforms
      orb.material.uniforms.time.value = this.time;
      orb.material.uniforms.fulfillment.value = globalFulfillment;
      orb.material.uniforms.cameraPosition.value = cameraPosition;

      // Animate position
      const t = this.time * orb.speed + orb.offset;

      // Floating motion
      orb.mesh.position.y = orb.initialPos.y + Math.sin(t) * 0.5;

      // Circular motion
      const radius = 5 + Math.sin(t * 0.5) * 3;
      const angle = (i / this.orbs.length) * Math.PI * 2 + t * 0.2;
      orb.mesh.position.x = Math.cos(angle) * radius;
      orb.mesh.position.z = Math.sin(angle) * radius;

      // Update fulfillment level for color transitions
      orb.fulfillment = MathUtils.lerp(orb.fulfillment, globalFulfillment, 0.01);
    });
  }

  public getOrbs(): OrbData[] {
    return this.orbs;
  }

  public dispose(): void {
    this.orbs.forEach((orb) => {
      orb.mesh.geometry.dispose();
      orb.material.dispose();
    });
    this.orbs = [];
  }
}
