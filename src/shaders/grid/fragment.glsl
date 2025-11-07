uniform float time;
uniform vec3 color1;
uniform vec3 color2;
uniform float glitchIntensity;
varying vec2 vUv;
varying vec3 vPosition;
varying float vElevation;

// Noise function for glitch effect
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Better noise function
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    // Grid lines with multiple scales
    vec2 grid1 = abs(fract(vUv * 20.0) - 0.5);
    vec2 grid2 = abs(fract(vUv * 5.0) - 0.5);

    float line1 = min(grid1.x, grid1.y);
    float line2 = min(grid2.x, grid2.y);

    float gridMask1 = smoothstep(0.0, 0.02, line1);
    float gridMask2 = smoothstep(0.0, 0.04, line2);

    float gridMask = min(gridMask1, gridMask2 * 0.5);

    // Color based on elevation and position
    vec3 color = mix(color1, color2, vElevation * 0.5 + 0.5);

    // Add glitch effect
    float glitch = random(vec2(vUv.y * 10.0, floor(time * 5.0))) * glitchIntensity;
    if (glitch > 0.95) {
        color = vec3(1.0, 0.0, 1.0);
    }

    // Scanline effect
    float scanline = sin(vUv.y * 100.0 + time * 2.0) * 0.05;
    color += scanline;

    // Apply grid
    color = mix(vec3(0.0), color, 1.0 - gridMask);

    // Add glow effect
    float glow = pow(1.0 - gridMask, 3.0) * (1.0 + vElevation * 2.0);
    color += glow * color1 * 0.5;

    // Add noise texture
    float noiseValue = noise(vUv * 50.0 + time * 0.1) * 0.05;
    color += noiseValue;

    gl_FragColor = vec4(color, 1.0 - gridMask * 0.5);
}
