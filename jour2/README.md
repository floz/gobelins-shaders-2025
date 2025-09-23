# Three.js Shader Customization - Jour 2

## Overview
This project demonstrates shader customization in Three.js using `onBeforeCompile` to modify built-in materials.

## Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Creating Assets

1. Open `createPlaceholderAssets.html` in a browser
2. Download the generated textures
3. Save them to `public/assets/textures/` as `a.jpg` and `b.jpg`
4. For the Suzanne model, you can use any `.glb` model or the fallback geometry will be used

## Project Structure

- **Demo A: Sphere** - Basic sphere with custom shader effects
  - Texture/color transitions
  - Vertex deformations (twist, displacement)
  - Toggle between PhysicalMaterial and ShaderMaterial

- **Demo B: Suzanne** - GLB model with same shader system
  - Same controls as Demo A
  - Different mask options

- **Exercise** - Pre-configured scene for students
  - Scene, camera, and lights ready
  - TODO: Implement shader customization
  - Look at `shaders/inject.js` for reference

## Key Concepts

### 1. onBeforeCompile
Modify Three.js built-in materials before compilation:
```javascript
material.onBeforeCompile = (shader) => {
    // Add uniforms
    shader.uniforms.myUniform = { value: 1.0 };

    // Modify vertex shader
    shader.vertexShader = shader.vertexShader.replace(...);

    // Modify fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(...);
};
```

### 2. Shader Uniforms
Control shader parameters from JavaScript:
- `uThreshold`: Transition point
- `uTwist`: Rotation deformation
- `uDispAmp`: Displacement amplitude
- `uTime`: Animation time

### 3. Texture Blending
Mix between textures or colors using smoothstep for smooth transitions.

## Exercise Instructions

1. Open `src/demos/exercise.js`
2. Find the TODO sections in `setupModel()`
3. Implement:
   - Vertex shader deformations
   - Fragment shader transitions
   - Connect uniforms to shader
4. Test your implementation with the GUI controls

## Tips

- Use the browser console for debugging
- Start simple, then add complexity
- Reference the working demos for examples
- Experiment with different mask patterns