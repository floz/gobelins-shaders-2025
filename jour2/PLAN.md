# Three.js Shader Demos - Implementation Plan

## Overview
Build two demos + one exercise for students to learn shader customization via `onBeforeCompile` with Three.js r179.

## Project Structure
```
jour2/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.js              # Entry point & router
│   ├── style.css            # Basic styles
│   ├── demos/
│   │   ├── sphere.js        # Demo A
│   │   ├── suzanne.js       # Demo B
│   │   └── exercise.js      # Exercise (Demo B ready-to-use)
│   ├── shaders/
│   │   └── inject.js        # Shader injection helpers
│   └── utils/
│       └── scene.js         # Common scene setup
└── public/
    └── assets/
        ├── models/
        │   └── suzanne.glb
        ├── textures/
        │   ├── a.jpg
        │   └── b.jpg
        └── env/
            └── venice_sunset_1k.hdr

```

## Implementation Steps

### Phase 1: Project Setup
1. Initialize pnpm project
2. Install dependencies: vite, three@0.179.0, lil-gui
3. Create basic vite.config.js
4. Set up index.html with container div

### Phase 2: Core Infrastructure
1. **main.js**:
   - Simple router (URL hash based)
   - Demo switcher
   - Entry point

2. **utils/scene.js**:
   - Common scene setup
   - Renderer config (physicallyCorrectLights, ACES, sRGB)
   - Camera setup (PerspectiveCamera)
   - Basic lighting (DirectionalLight + AmbientLight)
   - Resize handler
   - RAF loop

### Phase 3: Shader Helpers
**shaders/inject.js**:
- `patchPhysicalMaterial(material, uniforms)` function
- Fragment shader injection for texture/color mixing
- Vertex shader injection for twist & displacement
- `buildShaderMaterial(uniforms)` as alternative

Key uniforms:
- `uThreshold`: 0→1 (mix control)
- `uTwist`: -1→+1 (Y-axis rotation)
- `uDispAmp`: 0→0.3 (displacement amplitude)
- `uTime`: auto-incremented
- `uUseTextures`: boolean
- `uColorA`, `uColorB`: vec3
- `uMapA`, `uMapB`: texture2D

### Phase 4: Demo A (Sphere)
**demos/sphere.js**:
1. Create SphereGeometry(1, 256, 128)
2. Setup MeshPhysicalMaterial
3. Apply shader patches via onBeforeCompile
4. Add lil-gui controls
5. Toggle modes (PhysicalMat vs ShaderMat)
6. Implement texture/color switching

### Phase 5: Demo B (Suzanne)
**demos/suzanne.js**:
1. Load suzanne.glb model
2. Apply same shader logic from Demo A
3. Different mask calculation (e.g., worldPosition.xz)
4. Same UI controls as Demo A
5. Both material modes

### Phase 6: Exercise Version
**demos/exercise.js**:
1. Pre-loaded Suzanne model
2. Scene, camera, lights ready
3. Basic material applied
4. TODO comments for students:
   - Implement texture transition
   - Add vertex deformations
   - Customize mask logic
5. Skeleton code with hints

### Phase 7: UI & Controls
1. lil-gui integration
2. Parameter ranges:
   - uThreshold: 0-1
   - uTwist: -1 to 1
   - uDispAmp: 0-0.3
3. Buttons:
   - Toggle Textures/Colors
   - Toggle PhysMat/ShaderMat
   - Reset parameters
4. Demo switcher buttons

### Phase 8: Assets
1. Create/find suzanne.glb (64-128k faces)
2. Create/find textures a.jpg & b.jpg (1024x1024)
3. Optional: HDR environment map

### Phase 9: Testing & Polish
1. Verify 60 FPS on Demo A
2. Verify >45 FPS on Demo B
3. Test all parameter combinations
4. Add helpful comments for students
5. Create minimal presets

## Key Technical Points

### Fragment Shader Injection
```glsl
uniform float uThreshold;
uniform bool uUseTextures;
uniform vec3 uColorA, uColorB;
uniform sampler2D uMapA, uMapB;

float edge(float x, float t) {
    return smoothstep(t - 0.02, t + 0.02, x);
}

vec3 blendTextures(vec2 uv, vec3 baseCol) {
    vec3 A = uUseTextures ? texture2D(uMapA, uv).rgb : uColorA;
    vec3 B = uUseTextures ? texture2D(uMapB, uv).rgb : uColorB;
    float m = edge(vUv.y, uThreshold);
    return mix(A, B, m);
}
```

### Vertex Shader Injection
```glsl
uniform float uTwist;
uniform float uDispAmp;
uniform float uTime;

float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

// Apply twist around Y
float ang = uTwist * p.y;
float sx = sin(ang), cx = cos(ang);
p.xz = mat2(cx, -sx, sx, cx) * p.xz;

// Apply displacement
float n = hash(p * 3.0 + uTime * 0.2);
p += normal * (n - 0.5) * 2.0 * uDispAmp;
```

## Success Criteria
- [ ] 2 demos switchable without page reload
- [ ] Real-time parameter updates via sliders
- [ ] Smooth texture/color transitions
- [ ] Both material modes working
- [ ] 60 FPS performance
- [ ] Clean, commented code
- [ ] Exercise ready for students

## Commands
```bash
pnpm i
pnpm dev     # http://localhost:5173
pnpm build
pnpm preview
```