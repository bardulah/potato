uniform float time;
uniform vec3 color;
uniform float fulfillment;
uniform vec3 cameraPosition;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
    // Fresnel effect
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

    // Inner glow based on fulfillment level
    float glow = fresnel + fulfillment * 0.5;

    // Color shifts based on fulfillment
    vec3 lowColor = color;
    vec3 highColor = vec3(0.0, 1.0, 0.5);
    vec3 finalColor = mix(lowColor, highColor, fulfillment);

    // Add fresnel rim
    finalColor += fresnel * vec3(0.3, 0.8, 1.0);

    // Pulsing effect with multiple frequencies
    float pulse = sin(time * 3.0) * 0.1 + 0.9;
    pulse += sin(time * 5.0) * 0.05;
    finalColor *= pulse;

    // Add some noise-based variation
    float noise = fract(sin(dot(vPosition.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    finalColor += noise * 0.05;

    // Core brightness
    float core = 1.0 - length(vPosition) * 0.3;
    finalColor *= core;

    gl_FragColor = vec4(finalColor, 0.8 + fresnel * 0.2);
}
