# Simulation Reality - 3D WebGL Experience

> An immersive browser-based 3D experience exploring simulation reality and humanity's search for fulfillment, built with modern web technologies, TypeScript, and custom GLSL shaders.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.159-green)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎭 Overview

This is a complete refactoring of the simulation reality experience with professional architecture, TypeScript, modular systems, and enhanced narrative elements. The project explores philosophical themes of consciousness, reality, and the search for meaning in a potentially simulated existence.

## ✨ Key Features

### 🎨 Visual Design
- **Custom GLSL Shaders** - Hand-crafted vertex and fragment shaders in separate `.glsl` files
- **Dynamic Grid System** - Reality grid with wave distortions, glitch effects, and scanlines
- **Interactive Glitches** - Click/touch to create reality tears with custom shader effects
- **Floating Orbs** - Procedurally animated entities with Fresnel rim lighting
- **Particle System** - Object-pooled atmospheric particles for performance
- **Zone-Based Visuals** - UI and effects change based on narrative progression
- **Post-Processing** - Additive blending, dynamic colors, and glow effects

### 🚀 Performance & Architecture
- **TypeScript** - Full type safety and IDE support
- **Modular Systems** - Decoupled, testable architecture
- **Object Pooling** - Efficient particle management
- **LOD System** - Adaptive geometry based on device capabilities
- **Mobile Optimization** - Responsive quality settings
- **PWA Support** - Installable, works offline
- **Smart Rendering** - Pixel ratio limiting, conditional antialiasing

### 🎮 Interactive & Narrative
- **Branching Narrative** - Multiple zones (Void, Awakening, Transcendence)
- **Meaningful Choices** - Player decisions affect consciousness and fulfillment
- **Four Endings** - Dissolution, Acceptance, Transcendence, Rebellion
- **Interactive Glitches** - Discover reality tears by clicking/touching
- **Progressive Experience** - Evolving messages and visual feedback
- **Audio System** - Generative Web Audio API soundscapes

### 🛠️ Developer Experience
- **Debug GUI** - Live parameter tweaking with lil-gui
- **Hot Module Replacement** - Fast shader and code iteration
- **Event System** - Decoupled communication via EventBus
- **Configuration System** - Centralized settings management
- **Type Safety** - Full TypeScript support with strict mode
- **Test Setup** - Vitest configuration included

## 📁 Project Structure

```
simulation-reality/
├── src/
│   ├── shaders/           # GLSL shader files
│   │   ├── grid/          # Reality grid shaders
│   │   │   ├── vertex.glsl
│   │   │   └── fragment.glsl
│   │   ├── orb/           # Floating orb shaders
│   │   │   ├── vertex.glsl
│   │   │   └── fragment.glsl
│   │   └── glitch/        # Interactive glitch shaders
│   │       ├── vertex.glsl
│   │       └── fragment.glsl
│   ├── systems/           # Core systems
│   │   ├── SceneManager.ts         # Three.js scene management
│   │   ├── GridSystem.ts           # Reality grid
│   │   ├── OrbSystem.ts            # Floating orbs
│   │   ├── ParticleSystem.ts       # Particle effects with pooling
│   │   ├── InteractionController.ts # Mouse/touch/keyboard input
│   │   ├── AudioSystem.ts          # Web Audio API
│   │   ├── NarrativeSystem.ts      # Story, zones, choices
│   │   ├── GlitchSystem.ts         # Interactive reality tears
│   │   ├── UIController.ts         # UI state management
│   │   └── DebugGUI.ts             # Developer controls
│   ├── config/
│   │   └── settings.ts    # Centralized configuration
│   ├── utils/
│   │   └── helpers.ts     # Utility functions (EventBus, MathUtils, etc.)
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   ├── Application.ts     # Main application class
│   ├── main.ts           # Entry point
│   └── style.css         # Styles
├── index.html
├── vite.config.ts        # Vite configuration with GLSL and PWA
├── tsconfig.json         # TypeScript configuration
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 14+
- **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

### Development

The development server runs at `http://localhost:5173` with:
- ⚡ Hot Module Replacement for code
- 🔄 Live shader reloading (via vite-plugin-glsl)
- 🎯 TypeScript error checking
- 🔍 Source maps for debugging

## 🎮 Controls

### Desktop
- **Mouse Move** - Rotate the scene
- **Mouse Click** - Create reality tear glitches
- **Mouse Wheel** - Zoom in/out
- **Space** - Pause/resume
- **Escape** - Show menu
- **Ctrl+D** - Toggle debug GUI

### Mobile
- **Touch & Drag** - Rotate the scene
- **Tap** - Create glitch effects
- **Pinch** - Zoom in/out

## 🏗️ Architecture

### Core Systems

#### SceneManager
Manages Three.js scene, camera, renderer, and window resizing.

#### GridSystem
Reality grid with custom shaders, wave animations, and glitch effects.

#### OrbSystem
Floating entities with Fresnel lighting, representing seekers of fulfillment.

#### ParticleSystem
Object-pooled atmospheric particles for performance optimization.

#### InteractionController
Handles all mouse, touch, and keyboard input with event emission.

#### AudioSystem
Web Audio API-based generative soundscapes with ambient drones and effects.

#### NarrativeSystem
Manages story progression, zones, choices, and multiple endings.

#### GlitchSystem
Interactive reality tear effects created by user clicks/touches.

#### UIController
State machine for UI screens (loading, intro, HUD, choices, ending).

#### DebugGUI
Live parameter controls using lil-gui for development.

### Design Patterns

- **Event-Driven Architecture** - EventBus for decoupled communication
- **Object Pooling** - Efficient particle management
- **Dependency Injection** - Systems receive dependencies in constructors
- **State Management** - GameState enum and centralized state
- **Configuration** - Centralized settings with runtime updates

## 🎨 Customization

### Changing Colors

Edit `src/config/settings.ts`:

```typescript
public static visual: VisualConfig = {
  colors: {
    primary: new THREE.Color(0x00ffff),    // Cyan
    secondary: new THREE.Color(0xff00ff),  // Magenta
    accent: new THREE.Color(0x00ff88),     // Green
    glitch: new THREE.Color(0xff0066),     // Pink
  },
  // ...
}
```

### Adjusting Performance

```typescript
public static device: DeviceConfig = {
  orbCount: 15,              // Number of floating orbs
  particleCount: 500,        // Number of particles
  antialiasing: true,        // Enable/disable antialiasing
  pixelRatio: 2,            // Max pixel ratio
  // ...
}
```

### Modifying Shaders

Edit GLSL files in `src/shaders/`. Changes are live-reloaded during development.

### Gameplay Tuning

```typescript
public static gameplay: GameplayConfig = {
  progressionSpeed: {
    consciousness: 0.001,    // Rate of consciousness growth
    fulfillment: 0.0005,     // Rate of fulfillment growth
  },
  zones: {
    awakening: { fulfillmentThreshold: 0.33 },
    transcendence: { fulfillmentThreshold: 0.66 },
  },
  // ...
}
```

## 🎯 Narrative Structure

### Zones

1. **Void** (0-33% fulfillment)
   - Initial uncertainty
   - Dark, chaotic visuals
   - Questions about reality

2. **Awakening** (33-66% fulfillment)
   - Growing awareness
   - Magenta-tinted HUD
   - Pattern recognition

3. **Transcendence** (66-100% fulfillment)
   - Deep understanding
   - Green-tinted HUD
   - Unity of opposites

### Endings

The ending depends on player choices and final consciousness/fulfillment levels:

- **Dissolution** - Letting go of meaning
- **Acceptance** - Embracing the simulation
- **Transcendence** - Transcending the binary
- **Rebellion** - Rejecting the system

## 🔧 Debug Features

Press **Ctrl+D** to open the debug GUI:

- **Performance** - FPS counter, object pool statistics
- **Visual** - Live color adjustments
- **Grid** - Wave intensity, glitch intensity
- **Audio** - Volume controls for all channels
- **Gameplay** - Progression speed controls
- **Actions** - Trigger glitches, force zone changes, show choices
- **Camera** - FOV and position controls

## 📊 Technical Details

### Shader Features

**Grid Shader:**
- Multi-frequency wave distortion
- Dual-scale grid lines
- Glitch effects with noise
- Scanline overlay
- Elevation-based coloring

**Orb Shader:**
- Fresnel rim lighting
- Multi-frequency pulsing
- Fulfillment-based color transitions
- Distance-based core brightness

**Glitch Shader:**
- RGB channel split
- Scanline distortion
- Block corruption
- Reality tear effect

### Audio System

Generative soundscape using Web Audio API:
- Low drone (55 Hz sine wave)
- Mid drone with LFO modulation (110 Hz)
- High shimmer (880 Hz)
- Procedural glitch sounds
- Zone transition sweeps
- Orb interaction tones

### Performance Optimizations

- **Object Pooling** - Reusable particle instances
- **Geometry LOD** - Reduced segments on mobile
- **Conditional Features** - Shadows and antialiasing disabled on mobile
- **Pixel Ratio Cap** - Max 2x for performance
- **Efficient Updates** - Delta time-based animations
- **Smart Rendering** - Only update what changes

## 🌐 Browser Compatibility

- **Chrome/Edge** 90+
- **Firefox** 88+
- **Safari** 14+
- **Mobile Safari** iOS 14+
- **Chrome Mobile** Android 5+

Requires WebGL support (automatically detected with fallback error message).

## 🔬 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Type check only
npm run type-check
```

## 📦 Building for Production

```bash
npm run build
```

Optimizations:
- Terser minification with console/debugger removal
- Code splitting (Three.js as separate chunk)
- GLSL shader compression
- PWA manifest and service worker
- Asset optimization

## 🎓 Concepts & Philosophy

This experience explores:

- **Simulation Hypothesis** - The idea that reality might be a sophisticated simulation
- **Consciousness** - Self-awareness within the system
- **Fulfillment** - Finding meaning despite uncertainty
- **Choice vs Determinism** - Agency within constraints
- **Transcendence** - Moving beyond binary thinking

The glitch effects represent "tears in reality" - moments where the simulation reveals itself. The progressive narrative mirrors the journey from unconscious acceptance to aware engagement with existence.

## 🙏 Credits

- **Three.js** - 3D rendering engine
- **lil-gui** - Debug controls
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **GLSL** - Shader programming

## 📄 License

MIT License - See LICENSE file for details

## 🚀 What's New in v2.0

**Complete Rewrite:**
- ✅ Converted from JavaScript to TypeScript
- ✅ Modular architecture with separate systems
- ✅ GLSL shaders in external files
- ✅ Object pooling for particles
- ✅ Interactive glitch effects
- ✅ Narrative system with choices and endings
- ✅ Audio system with generative sounds
- ✅ Debug GUI with live controls
- ✅ PWA support with offline capability
- ✅ Loading, error, and ending screens
- ✅ Zone-based progression system
- ✅ Comprehensive configuration system
- ✅ Event-driven architecture
- ✅ Enhanced accessibility features

---

**Built with ❤️ and existential curiosity**
