import * as THREE from 'three';

// ========================================
// SHADER DEFINITIONS
// ========================================

// Custom vertex shader for the reality grid
const gridVertexShader = `
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

        vElevation = (wave1 + wave2) * waveIntensity;
        pos.y += vElevation;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

// Custom fragment shader with glitch effects
const gridFragmentShader = `
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

    void main() {
        // Grid lines
        vec2 grid = abs(fract(vUv * 20.0) - 0.5);
        float line = min(grid.x, grid.y);
        float gridMask = smoothstep(0.0, 0.02, line);

        // Color based on elevation and position
        vec3 color = mix(color1, color2, vElevation * 0.5 + 0.5);

        // Add glitch effect
        float glitch = random(vec2(vUv.y * 10.0, floor(time * 5.0))) * glitchIntensity;
        if (glitch > 0.95) {
            color = vec3(1.0, 0.0, 1.0);
        }

        // Apply grid
        color = mix(vec3(0.0), color, 1.0 - gridMask);

        // Add glow effect
        float glow = pow(1.0 - gridMask, 3.0) * (1.0 + vElevation * 2.0);
        color += glow * color1 * 0.5;

        gl_FragColor = vec4(color, 1.0 - gridMask * 0.5);
    }
`;

// Shader for the floating orbs (representing people seeking fulfillment)
const orbVertexShader = `
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;

        // Subtle pulsing
        vec3 pos = position * (1.0 + sin(time * 2.0) * 0.05);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const orbFragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float fulfillment;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        // Fresnel effect
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

        // Inner glow based on fulfillment level
        float glow = fresnel + fulfillment * 0.5;

        // Color shifts based on fulfillment
        vec3 finalColor = mix(color, vec3(0.0, 1.0, 0.5), fulfillment);
        finalColor += fresnel * 0.3;

        // Pulsing effect
        float pulse = sin(time * 3.0) * 0.1 + 0.9;
        finalColor *= pulse;

        gl_FragColor = vec4(finalColor, 0.8);
    }
`;

// ========================================
// MAIN APPLICATION
// ========================================

class SimulationReality {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.started = false;
        this.time = 0;
        this.consciousness = 0;
        this.fulfillment = 0;
        this.mouse = new THREE.Vector2();
        this.targetRotation = new THREE.Vector2();
        this.currentRotation = new THREE.Vector2();

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 10, 50);

        // Camera setup - optimized FOV for mobile
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 8, 15);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup with mobile optimization
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: window.innerWidth > 768, // Disable antialiasing on mobile
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

        this.createScene();
    }

    createScene() {
        // Create the reality grid (ground plane)
        const gridGeometry = new THREE.PlaneGeometry(40, 40, 80, 80);
        this.gridMaterial = new THREE.ShaderMaterial({
            vertexShader: gridVertexShader,
            fragmentShader: gridFragmentShader,
            uniforms: {
                time: { value: 0 },
                waveIntensity: { value: 0.5 },
                glitchIntensity: { value: 0.1 },
                color1: { value: new THREE.Color(0x00ffff) },
                color2: { value: new THREE.Color(0xff00ff) }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        this.grid = new THREE.Mesh(gridGeometry, this.gridMaterial);
        this.grid.rotation.x = -Math.PI / 2;
        this.scene.add(this.grid);

        // Create floating orbs (representing people)
        this.orbs = [];
        this.orbGroup = new THREE.Group();

        const orbCount = window.innerWidth > 768 ? 15 : 8; // Fewer orbs on mobile
        for (let i = 0; i < orbCount; i++) {
            const orbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const orbMaterial = new THREE.ShaderMaterial({
                vertexShader: orbVertexShader,
                fragmentShader: orbFragmentShader,
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(0x00ffff) },
                    fulfillment: { value: Math.random() }
                },
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            const orb = new THREE.Mesh(orbGeometry, orbMaterial);

            // Random position
            const angle = (i / orbCount) * Math.PI * 2;
            const radius = 5 + Math.random() * 8;
            orb.position.x = Math.cos(angle) * radius;
            orb.position.y = 1 + Math.random() * 6;
            orb.position.z = Math.sin(angle) * radius;

            // Store initial position for animation
            orb.userData = {
                initialPos: orb.position.clone(),
                speed: 0.3 + Math.random() * 0.5,
                offset: Math.random() * Math.PI * 2
            };

            this.orbs.push(orb);
            this.orbGroup.add(orb);
        }

        this.scene.add(this.orbGroup);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x222222);
        this.scene.add(ambientLight);

        // Add point lights for atmosphere
        const light1 = new THREE.PointLight(0x00ffff, 1, 30);
        light1.position.set(10, 5, 10);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xff00ff, 1, 30);
        light2.position.set(-10, 5, -10);
        this.scene.add(light2);

        // Create particles for atmosphere
        this.createParticles();
    }

    createParticles() {
        const particleCount = window.innerWidth > 768 ? 500 : 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.userData.velocities = velocities;
        this.scene.add(this.particles);
    }

    setupEventListeners() {
        // Enter button
        const enterBtn = document.getElementById('enter-btn');
        enterBtn.addEventListener('click', () => this.startExperience());

        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            if (!this.started) return;
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.targetRotation.x = this.mouse.y * 0.3;
            this.targetRotation.y = this.mouse.x * 0.3;
        });

        // Touch support
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.started) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.started) return;
            e.preventDefault();
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;

            this.targetRotation.y += deltaX * 0.005;
            this.targetRotation.x += deltaY * 0.005;

            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        // Scroll/pinch to zoom
        window.addEventListener('wheel', (e) => {
            if (!this.started) return;
            e.preventDefault();
            const zoomSpeed = 0.1;
            this.camera.position.z += e.deltaY * zoomSpeed * 0.01;
            this.camera.position.z = Math.max(8, Math.min(25, this.camera.position.z));
        }, { passive: false });

        // Window resize
        window.addEventListener('resize', () => this.onResize());
    }

    startExperience() {
        this.started = true;

        // Hide intro, show HUD and instructions
        const intro = document.getElementById('intro');
        intro.classList.add('fade-out');

        setTimeout(() => {
            intro.classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            document.getElementById('instructions').classList.remove('hidden');
        }, 500);

        // Start animation loop
        this.animate();
    }

    updateProgress() {
        // Gradually increase consciousness and fulfillment
        this.consciousness = Math.min(1, this.consciousness + 0.001);
        this.fulfillment = Math.min(1, this.fulfillment + 0.0005);

        // Update UI
        document.getElementById('consciousness-bar').style.width = (this.consciousness * 100) + '%';
        document.getElementById('fulfillment-bar').style.width = (this.fulfillment * 100) + '%';

        // Update message based on progress
        const message = document.getElementById('message');
        if (this.fulfillment < 0.3) {
            message.textContent = 'The simulation awakens...';
        } else if (this.fulfillment < 0.6) {
            message.textContent = 'Patterns emerge from chaos...';
        } else if (this.fulfillment < 0.9) {
            message.textContent = 'Meaning crystallizes...';
        } else {
            message.textContent = 'Fulfillment achieved. Or is it?';
        }

        // Update shader uniforms based on progress
        this.gridMaterial.uniforms.waveIntensity.value = 0.5 + this.consciousness * 1.5;
        this.gridMaterial.uniforms.glitchIntensity.value = 0.1 + (1 - this.fulfillment) * 0.3;

        // Update orb fulfillment
        this.orbs.forEach((orb, i) => {
            orb.material.uniforms.fulfillment.value = this.fulfillment;
        });
    }

    animate() {
        if (!this.started) return;

        requestAnimationFrame(() => this.animate());

        this.time += 0.01;

        // Update shader time uniforms
        this.gridMaterial.uniforms.time.value = this.time;

        // Animate orbs
        this.orbs.forEach((orb, i) => {
            orb.material.uniforms.time.value = this.time;

            const userData = orb.userData;
            const t = this.time * userData.speed + userData.offset;

            // Floating motion
            orb.position.y = userData.initialPos.y + Math.sin(t) * 0.5;

            // Circular motion
            const radius = 5 + Math.sin(t * 0.5) * 3;
            const angle = (i / this.orbs.length) * Math.PI * 2 + t * 0.2;
            orb.position.x = Math.cos(angle) * radius;
            orb.position.z = Math.sin(angle) * radius;
        });

        // Animate particles
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.userData.velocities;

        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;

            // Wrap around
            if (Math.abs(positions[i * 3]) > 25) positions[i * 3] *= -1;
            if (positions[i * 3 + 1] > 20) positions[i * 3 + 1] = 0;
            if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 20;
            if (Math.abs(positions[i * 3 + 2]) > 25) positions[i * 3 + 2] *= -1;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;

        // Smooth camera rotation
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;

        this.orbGroup.rotation.y = this.currentRotation.y;
        this.orbGroup.rotation.x = this.currentRotation.x * 0.5;

        // Update progress
        this.updateProgress();

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}

// Initialize the experience
const app = new SimulationReality();
