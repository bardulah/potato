uniform float time;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Subtle pulsing with more variation
    float pulse = 1.0 + sin(time * 2.0) * 0.05 + sin(time * 3.7) * 0.02;
    vec3 pos = position * pulse;

    // Calculate world position for effects
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
