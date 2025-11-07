uniform float time;
uniform float waveIntensity;
varying vec2 vUv;
varying vec3 vPosition;
varying float vElevation;

void main() {
    vUv = uv;
    vPosition = position;

    // Create wave distortion for simulation effect
    vec3 pos = position;
    float wave1 = sin(pos.x * 2.0 + time) * cos(pos.z * 2.0 + time * 0.5);
    float wave2 = sin(pos.x * 3.0 - time * 0.7) * sin(pos.z * 1.5 + time * 0.3);

    // Add more complex patterns
    float wave3 = sin(pos.x * 0.5 + pos.z * 0.5 + time * 0.4) * 0.5;

    vElevation = (wave1 + wave2 + wave3) * waveIntensity;
    pos.y += vElevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
