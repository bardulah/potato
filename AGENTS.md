# Agent Handoff Document: Simulation-Reality

**Last Updated**: 2025-11-10
**Current Agent**: Gemini

---

## 🎯 1. Current Status

### Project Overview
This is an interactive, artistic 3D web experience built with Three.js and TypeScript. It explores philosophical themes of simulation theory and consciousness through visuals and a simple branching narrative.

### Deployment Status
*   **Status**: ✅ **LIVE**
*   **Platform**: Vercel
*   **Live URL**: [https://simulation-reality-hyohhmn7e-mtsalts-projects.vercel.app](https://simulation-reality-hyohhmn7e-mtsalts-projects.vercel.app)

### Technology Stack
*   **Frontend**: TypeScript, Three.js, GLSL (for custom shaders)
*   **Build Tool**: Vite
*   **Deployment**: Hosted as a static site on Vercel.

### Key Files
*   `INSTRUCTIONS.md`: User-facing guide on how to interact with the experience.
*   `src/main.ts`: The main entry point for the application.
*   `src/systems/`: Directory containing the core logic for visuals, audio, and narrative.
*   `src/shaders/`: Directory containing the custom GLSL shader code.

---

## 🚀 2. Recommended Improvements

This section outlines potential future enhancements for the project.

1.  **WebXR (VR/AR) Support**: The immersive, first-person nature of this experience makes it a perfect candidate for a WebXR integration, allowing users to experience it in virtual or augmented reality for even deeper immersion.
2.  **More Complex Narrative**: Expand the narrative from simple choices to a more complex story with more branches, abstract characters, and deeper philosophical questions.
3.  **Sophisticated Sound Design**: Implement a more advanced, generative soundscape that reacts dynamically to user interactions, visual effects, and narrative progression to enhance the atmosphere.
4.  **Shareable States**: Allow users to generate a unique URL that saves their current position in the narrative and visual state, so they can share a specific moment or feeling with others.
5.  **User-Generated Content**: Add a "shader editor" mode where advanced users can write and apply their own GLSL shaders to the scene, creating and sharing their own visual interpretations of the simulation.

---

## 🤝 3. Agent Handoff Notes

### How to Work on This Project

*   **Running Locally**: To run the project for development, navigate to the project directory and run `npm install`, followed by `npm run dev`. This will start a Vite development server with hot module replacement.
*   **Deployment**: The application is deployed automatically by Vercel when changes are pushed to the GitHub repository. There is no manual deployment step.
*   **Shaders**: A key feature of this project is its use of custom GLSL shaders located in the `src/shaders/` directory. The `vite-plugin-glsl` allows these to be imported directly into the TypeScript code.
*   **Updating Documentation**: If you make any changes to the user controls or the narrative flow, update the `INSTRUCTIONS.md` file. If you make significant architectural changes, update this `AGENTS.md` file.

### What to Watch Out For

*   **Performance**: Real-time 3D graphics can be resource-intensive. Be mindful of performance, especially on lower-end devices and mobile. The project already includes some optimizations (like object pooling and LOD), which should be maintained.
*   **Artistic Vision**: This is more of an art project than a functional tool. Changes should be considered in the context of the project's philosophical themes and aesthetic.
*   **Browser Compatibility**: While it works on most modern browsers, WebGL and advanced JavaScript features can have subtle differences in implementation. Test any major visual changes across different browsers.
