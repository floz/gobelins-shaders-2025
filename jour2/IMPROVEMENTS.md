# PhysicalMaterial Shader Injection - Improvements Plan

## 🔴 Current Problem

The shader effects (twist, displacement, texture transitions) are only visible when using ShaderMaterial mode. When using PhysicalMaterial mode, the effects don't appear even though we're using `onBeforeCompile`.

## 📋 Root Cause Analysis

### 1. **Missing vUv in PhysicalMaterial**
- PhysicalMaterial doesn't have `vUv` varying by default
- Our fragment shader tries to use `vUv` which doesn't exist
- This causes the texture blending to fail silently

### 2. **Vertex Shader Replacement Issues**
- The string `'vec3 transformed = vec3( position );'` might not match exactly
- Three.js r179 might use different formatting or structure
- Need to check actual shader chunks to find correct replacement points

### 3. **Fragment Shader Integration**
- Mixing with `outgoingLight` at 0.8 might not be enough
- The PhysicalMaterial's complex lighting calculations might override our changes
- Need to inject at a better location in the shader pipeline

### 4. **Normal Recalculation**
- After vertex deformation, normals aren't recalculated
- This breaks lighting calculations in PhysicalMaterial
- Need to transform normals properly for correct shading

## ✅ Solution Plan

### Phase 1: Debug Current Implementation
1. Log the actual shader code to see what we're working with
2. Identify exact replacement points
3. Verify uniform injection is working

### Phase 2: Fix Vertex Shader
```glsl
// Add vUv varying declaration
varying vec2 vUv;

// In main(), before transformations:
vUv = uv;

// Better replacement strategy:
// Look for #include <begin_vertex> instead of exact string
// This is more reliable across Three.js versions
```

### Phase 3: Fix Fragment Shader
```glsl
// Ensure vUv is declared
varying vec2 vUv;

// Replace diffuseColor directly instead of outgoingLight
// This ensures our colors are used in all lighting calculations
```

### Phase 4: Transform Normals
```glsl
// After vertex transformation:
vec3 transformedNormal = normalMatrix * normal;
// Recalculate based on deformation if needed
```

## 🛠️ Implementation Steps

### Step 1: Update patchPhysicalMaterial function

```javascript
export function patchPhysicalMaterial(material, uniforms) {
    material.onBeforeCompile = (shader) => {
        // 1. Add uniforms
        Object.keys(uniforms).forEach(key => {
            shader.uniforms[key] = uniforms[key];
        });

        // 2. Add vUv varying to both shaders
        shader.vertexShader = shader.vertexShader.replace(
            '#include <uv_pars_vertex>',
            `#include <uv_pars_vertex>
            varying vec2 vUv;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <uv_pars_fragment>',
            `#include <uv_pars_fragment>
            varying vec2 vUv;`
        );

        // 3. Set vUv in vertex shader
        shader.vertexShader = shader.vertexShader.replace(
            '#include <uv_vertex>',
            `#include <uv_vertex>
            vUv = uv;`
        );

        // 4. Replace transformation using Three.js chunks
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            vec3 transformed = position;

            // Apply twist
            float twistAngle = uTwist * transformed.y * 3.14159;
            mat2 rot = rotate2D(twistAngle);
            transformed.xz = rot * transformed.xz;

            // Apply displacement
            float noiseValue = hash(transformed * 3.0 + vec3(uTime * 0.2));
            transformed += normal * (noiseValue - 0.5) * 2.0 * uDispAmp;
            `
        );

        // 5. Replace color calculation
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `
            #ifdef USE_MAP
                vec4 sampledDiffuseColor = texture2D( map, vUv );
                diffuseColor *= sampledDiffuseColor;
            #endif

            // Override with our custom blending
            vec3 customColor = blendTextures(vUv);
            diffuseColor.rgb = customColor;
            `
        );
    };

    material.needsUpdate = true;
    return material;
}
```

### Step 2: Debug Helper
Add a debug function to inspect compiled shaders:

```javascript
function debugShader(material) {
    const originalOnBeforeCompile = material.onBeforeCompile;
    material.onBeforeCompile = (shader) => {
        console.log('=== VERTEX SHADER ===');
        console.log(shader.vertexShader);
        console.log('=== FRAGMENT SHADER ===');
        console.log(shader.fragmentShader);

        if (originalOnBeforeCompile) {
            originalOnBeforeCompile(shader);
        }
    };
}
```

### Step 3: Testing Strategy
1. Start with just vertex deformation (no texture changes)
2. Verify twist works on PhysicalMaterial
3. Add displacement
4. Finally add texture/color transitions
5. Test with different lighting conditions

## 🎯 Success Criteria

- [ ] Twist deformation visible on PhysicalMaterial
- [ ] Displacement noise visible on PhysicalMaterial
- [ ] Texture/color transitions work correctly
- [ ] Lighting still works properly after deformations
- [ ] No console errors or warnings
- [ ] Performance remains good (60 FPS)

## 📝 Alternative Approach

If the above doesn't work, we could:
1. Use `material.customProgramCacheKey()` to force recompilation
2. Create a custom version of MeshPhysicalMaterial
3. Use `WebGLRenderer.onBeforeCompile` global hook
4. Modify Three.js shader chunks directly

## 🚀 Next Actions

1. **Immediate**: Add debug logging to see actual shader code
2. **Then**: Fix vUv varying issue
3. **Next**: Update vertex transformation approach
4. **Finally**: Fix fragment shader color injection
5. **Test**: Verify all effects work on both materials