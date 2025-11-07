uniform float time;
uniform vec2 glitchCenter;
uniform float glitchIntensity;
varying vec2 vUv;
varying float vDistortion;

// Random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vUv = uv;

    vec3 pos = position;

    // Calculate distance from glitch center
    float dist = distance(uv, glitchCenter);
    float influence = smoothstep(0.5, 0.0, dist) * glitchIntensity;

    // Create reality tear effect
    float tear = sin(pos.x * 20.0 + time * 10.0) * influence;
    tear += sin(pos.y * 30.0 - time * 15.0) * influence * 0.5;

    // Random displacement
    float rand = random(vec2(uv.x + time * 0.1, uv.y)) * influence;

    vDistortion = influence;

    pos.z += tear * 2.0 + rand * 0.5;
    pos.x += sin(time * 20.0) * influence * 0.3;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
