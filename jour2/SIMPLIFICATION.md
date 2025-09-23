# Shader Injection Simplification Analysis

## 🎯 Current Problem

The current approach targets specific Three.js includes like:
- `#include <common>`
- `#include <uv_pars_vertex>`
- `#include <begin_vertex>`
- `#include <map_fragment>`

This requires students to understand Three.js internal architecture, which is complex and not intuitive.

## 💡 Proposed Simplification

Target more obvious points in the shader:
1. **Before `void main() {`** - Add uniforms, varyings, and helper functions
2. **Inside `void main() {`** - Modify the actual execution

## 🔍 Analysis of Three.js Shaders

### Vertex Shader Structure
```glsl
// HEADER - Everything before main
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
// ... more includes ...

void main() {  // <-- LINE 25 in meshphysical
    #include <uv_vertex>
    // ... vertex processing ...
    #include <begin_vertex>  // Creates: vec3 transformed = vec3(position);
    // ... more processing ...
}
```

### Fragment Shader Structure
```glsl
// HEADER - Everything before main
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_fragment>
// ... more includes ...

void main() {  // <-- LINE 163 in meshphysical
    vec4 diffuseColor = vec4( diffuse, opacity );
    // ... fragment processing ...
    #include <map_fragment>  // Modifies diffuseColor
    // ... more processing ...
}
```

## ✅ Simplified Approach

### Method 1: Target `void main()` directly

```javascript
// VERTEX SHADER - Add header before main
shader.vertexShader = shader.vertexShader.replace(
    'void main() {',
    `
    // Custom uniforms and functions
    uniform float uTwist;
    uniform float uDispAmp;
    uniform float uTime;
    varying vec2 vCustomUv;

    float hash(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
    }

    mat2 rotate2D(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
    }

    void main() {`
);

// VERTEX SHADER - Modify inside main
shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    vCustomUv = uv; // Set our custom UV

    vec3 transformed = vec3( position );

    // Apply deformations
    float twistAngle = uTwist * transformed.y * 3.14159;
    transformed.xz = rotate2D(twistAngle) * transformed.xz;

    float noiseValue = hash(transformed * 3.0 + vec3(uTime * 0.2));
    transformed += normal * (noiseValue - 0.5) * 2.0 * uDispAmp;
    `
);
```

### Method 2: Even Simpler - Two Replacements Total

```javascript
// VERTEX: One replacement for everything before main
const vertexHeader = `/* all uniforms, varyings, functions */`;
shader.vertexShader = vertexHeader + '\n' +
    shader.vertexShader.substring(shader.vertexShader.indexOf('void main()'));

// FRAGMENT: One replacement for everything before main
const fragmentHeader = `/* all uniforms, varyings, functions */`;
shader.fragmentShader = fragmentHeader + '\n' +
    shader.fragmentShader.substring(shader.fragmentShader.indexOf('void main()'));
```

## 🎓 Student-Friendly Version

```javascript
customMaterial.onBeforeCompile = (shader) => {
    // 1. Add uniforms
    Object.assign(shader.uniforms, uniforms);

    // 2. VERTEX: Add stuff before main()
    shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `
        // My custom stuff here
        uniform float uTwist;
        varying vec2 vCustomUv;

        void main() {`
    );

    // 3. VERTEX: Replace the transformation
    shader.vertexShader = shader.vertexShader.replace(
        'vec3 transformed = vec3( position );',
        `
        vCustomUv = uv;
        vec3 transformed = vec3( position );

        // My transformations
        transformed.y += sin(uTime) * 0.1;
        `
    );

    // 4. FRAGMENT: Add stuff before main()
    shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        // My custom stuff
        uniform vec3 uColorA;
        varying vec2 vCustomUv;

        void main() {`
    );

    // 5. FRAGMENT: Override the color
    shader.fragmentShader = shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `
        vec4 diffuseColor = vec4( diffuse, opacity );

        // My custom color
        diffuseColor.rgb = uColorA;
        `
    );
};
```

## 📊 Comparison

### Current Approach (Complex)
- ❌ Need to know about `#include <common>`
- ❌ Need to know about `#include <uv_pars_vertex>`
- ❌ Need to know about `#include <begin_vertex>`
- ❌ Multiple cryptic replacement points
- ❌ Not obvious what's happening

### Simplified Approach
- ✅ Target obvious `void main() {`
- ✅ Target obvious `vec3 transformed = vec3( position );`
- ✅ Target obvious `vec4 diffuseColor = vec4( diffuse, opacity );`
- ✅ Students understand "before main" and "inside main"
- ✅ More like traditional shader editing

## 🚀 Implementation Strategy

### For Our Specific Case

Since we need:
1. Custom uniforms (uTwist, uThreshold, etc.)
2. Custom varying (vCustomUv)
3. Vertex deformation
4. Color override

We can do it in just **4 simple replacements**:

```javascript
// 1. Vertex header (before main)
'void main() {' → 'uniforms + functions + void main() {'

// 2. Vertex body (transformation)
'vec3 transformed = vec3( position );' → 'vCustomUv = uv; transformed with deformations'

// 3. Fragment header (before main)
'void main() {' → 'uniforms + functions + void main() {'

// 4. Fragment body (color)
'vec4 diffuseColor = vec4( diffuse, opacity );' → 'diffuseColor with custom colors'
```

## 🎯 Conclusion

**YES, we should use this simpler approach!**

Benefits:
- More intuitive for students
- Less knowledge of Three.js internals required
- Cleaner, more readable code
- Same results with less complexity

The only cases where the complex approach would be needed:
- When modifying very specific shader chunks
- When needing to preserve certain includes
- When order of operations is critical

For our use case (teaching shader customization), the simple approach is perfect!