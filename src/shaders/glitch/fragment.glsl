uniform float time;
uniform vec3 glitchColor;
uniform float glitchIntensity;
varying vec2 vUv;
varying float vDistortion;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = vUv;

    // RGB split effect
    float split = vDistortion * 0.05;
    vec3 color = vec3(
        random(uv + vec2(split, 0.0)),
        random(uv),
        random(uv - vec2(split, 0.0))
    );

    // Add glitch color
    color = mix(color, glitchColor, vDistortion * 0.5);

    // Scanlines
    float scanline = sin(uv.y * 200.0 + time * 10.0) * 0.5 + 0.5;
    color *= mix(1.0, scanline, vDistortion);

    // Block distortion
    float block = step(0.9, random(vec2(floor(uv.y * 20.0), floor(time * 5.0))));
    color = mix(color, vec3(1.0), block * vDistortion);

    // Fade edges
    float alpha = vDistortion;

    gl_FragColor = vec4(color, alpha);
}
