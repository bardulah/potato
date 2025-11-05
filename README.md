# Simulation Reality - 3D WebGL Experience

An immersive browser-based 3D experience exploring the concept of simulation reality and humanity's search for fulfillment. Built with modern web technologies including WebGL and Three.js, featuring custom shaders and optimized performance for both desktop and mobile devices.

## Features

### 🎨 Visual Design
- **Custom Shader Programming**: Hand-crafted GLSL shaders for unique visual effects
- **Dynamic Grid System**: Animated reality grid with wave distortions and glitch effects
- **Particle Systems**: Atmospheric particles creating depth and immersion
- **Procedural Animations**: Physics-based floating orbs representing seekers of fulfillment
- **Fresnel Effects**: Advanced lighting techniques for ethereal glow effects

### 🚀 Performance Optimizations
- **Mobile-First Design**: Adaptive quality settings based on device capabilities
- **Smart Rendering**: Pixel ratio limiting and conditional antialiasing
- **Efficient Geometry**: Reduced polygon counts on mobile devices
- **Optimized Shaders**: Lightweight calculations for smooth 60fps performance
- **Responsive Canvas**: Automatic adaptation to screen size and orientation

### 🎮 Interactive Elements
- **Mouse Control**: Drag to rotate the scene
- **Touch Support**: Full touch gesture support for mobile devices
- **Zoom Controls**: Scroll/pinch to adjust camera distance
- **Progressive Experience**: Consciousness and fulfillment meters that evolve over time
- **Dynamic Messaging**: Contextual messages based on exploration progress

### 🎭 Thematic Elements
- **Simulation Reality**: Glitch effects and grid patterns suggesting a digital reality
- **Seeking Fulfillment**: Orbs that evolve as the experience progresses
- **Consciousness Growth**: Visual feedback through color transitions and intensity
- **Existential Narrative**: UI messages that evolve with the journey

## Technology Stack

- **Three.js** (v0.159.0) - 3D graphics library
- **WebGL** - Hardware-accelerated 3D rendering
- **GLSL** - Custom shader programming
- **Vite** - Modern build tool and dev server
- **Vanilla JavaScript** - No heavy frameworks, pure performance

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
.
├── index.html          # Entry point with semantic HTML
├── style.css           # Responsive styling with mobile optimizations
├── main.js             # Main application logic and Three.js setup
├── package.json        # Dependencies and scripts
└── README.md          # Documentation
```

## Custom Shaders

### Grid Shader
The reality grid uses custom vertex and fragment shaders to create:
- Wave distortions simulating reality fluctuations
- Grid line rendering with glow effects
- Glitch effects for the simulation aesthetic
- Elevation-based coloring

### Orb Shader
Floating orbs use shaders for:
- Fresnel rim lighting
- Pulsing animations
- Color transitions based on fulfillment level
- Additive blending for ethereal appearance

## Performance Considerations

### Desktop
- Full antialiasing
- 15 floating orbs
- 500 atmospheric particles
- High polygon count for smooth curves

### Mobile
- Antialiasing disabled for performance
- 8 floating orbs
- 200 atmospheric particles
- Reduced geometry complexity
- Pixel ratio capped at 2x

### Accessibility
- Respects `prefers-reduced-motion` for users sensitive to animations
- Keyboard-accessible UI elements
- Semantic HTML structure

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 5+)

Requires WebGL support. Most modern browsers and devices are supported.

## Customization

### Changing Colors
Edit the shader uniforms in `main.js`:
```javascript
color1: { value: new THREE.Color(0x00ffff) }, // Cyan
color2: { value: new THREE.Color(0xff00ff) }  // Magenta
```

### Adjusting Performance
Modify object counts in `main.js`:
```javascript
const orbCount = window.innerWidth > 768 ? 15 : 8;
const particleCount = window.innerWidth > 768 ? 500 : 200;
```

### Wave Intensity
Adjust the grid wave animation:
```javascript
waveIntensity: { value: 0.5 } // Range: 0.0 - 2.0
```

## Concept & Theme

This experience explores the philosophical concept of simulation reality - the idea that our existence might be a sophisticated digital simulation. The floating orbs represent individuals navigating this reality, seeking meaning and fulfillment.

As users explore:
- **Consciousness** gradually increases (awareness of the simulation)
- **Fulfillment** slowly grows (finding meaning within the system)
- Visual effects intensify reflecting this journey
- Messages evolve from uncertainty to revelation

The glitch effects and grid patterns reinforce the digital nature of this reality, while the smooth animations and beautiful shaders create an emotional, contemplative atmosphere.

## License

MIT

## Credits

Created with Three.js and modern web technologies. Shaders hand-written in GLSL for unique visual identity.
