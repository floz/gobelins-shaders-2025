# Plan: Sphere Demo with MeshPhysicalMaterial

## 🎯 Objectif
Transformer la démo sphère pour montrer comment enrichir un MeshPhysicalMaterial avec des shaders custom tout en gardant les propriétés PBR (Physically Based Rendering).

## 🔑 Concept clé : MeshPhysicalMaterial vs ShaderMaterial

### ShaderMaterial (Hello World)
```javascript
// Contrôle total mais on perd tout le système de Three.js
new THREE.ShaderMaterial({
    vertexShader: myVertex,
    fragmentShader: myFragment,
    uniforms: {...}
})
```
✅ Contrôle total
❌ Perd: ombres, lumières, PBR, fog, etc.
❌ Doit tout réimplémenter

### MeshPhysicalMaterial avec onBeforeCompile
```javascript
// On garde tout et on ajoute nos modifications
const material = new THREE.MeshPhysicalMaterial({
    metalness: 0.3,
    roughness: 0.4,
    clearcoat: 0.5
});

material.onBeforeCompile = (shader) => {
    // Injection de code custom
};
```
✅ Garde toutes les features Three.js
✅ PBR, ombres, lumières fonctionnent
✅ Plus simple pour des effets additifs
❌ Moins de contrôle total

## 📋 Architecture de la transformation

### 1. Structure actuelle (sphere.js)
- Deux matériaux : PhysicalMaterial + ShaderMaterial
- Switch entre les deux
- Système complexe avec patchPhysicalMaterial

### 2. Structure cible
- UN SEUL MeshPhysicalMaterial enrichi
- Noise deformation comme hello-world
- Fresnel effect intégré
- Suppression du material switching

## 🛠️ Implémentation étape par étape

### Étape 1: Uniforms et Material de base
```javascript
const uniforms = {
    uTime: { value: 0 },
    uNoiseScale: { value: 3.0 },
    uNoiseSpeed: { value: 0.2 },
    uNoiseAmplitude: { value: 0.15 },
    uColorA: { value: new THREE.Color(0x6366f1) },
    uColorB: { value: new THREE.Color(0xec4899) }
};

const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.4,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1
});
```

### Étape 2: onBeforeCompile - Structure
```javascript
material.onBeforeCompile = (shader) => {
    // 1. Ajouter les uniforms
    Object.keys(uniforms).forEach(key => {
        shader.uniforms[key] = uniforms[key];
    });

    // 2. Modifier le vertex shader
    shader.vertexShader = modifyVertexShader(shader.vertexShader);

    // 3. Modifier le fragment shader
    shader.fragmentShader = modifyFragmentShader(shader.fragmentShader);
};
```

### Étape 3: Vertex Shader Modifications

#### Points d'injection Three.js:
- `#include <common>` : Ajouter fonctions helper (noise)
- `#include <begin_vertex>` : Modifier positions
- `#include <beginnormal_vertex>` : Modifier normales

```javascript
// Ajouter le simplex noise
shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>

    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uNoiseSpeed;
    uniform float uNoiseAmplitude;

    // [Simplex noise function here]
    float snoise(vec3 v) { ... }

    varying float vNoise;
    varying vec3 vViewPosition;`
);

// Déformer les vertices
shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `vec3 transformed = position;

    // Noise calculation
    vec3 noiseCoord = position * uNoiseScale + uTime * uNoiseSpeed;
    float noise = snoise(noiseCoord);
    vNoise = noise;

    // Displace along normal
    transformed += normal * noise * uNoiseAmplitude;`
);
```

### Étape 4: Fragment Shader Modifications

#### Points d'injection:
- `#include <common>` : Ajouter varyings
- `#include <color_fragment>` : Modifier les couleurs
- `#include <output_fragment>` : Ajouter effets finaux

```javascript
// Ajouter les varyings
shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>

    uniform vec3 uColorA;
    uniform vec3 uColorB;

    varying float vNoise;
    varying vec3 vViewPosition;`
);

// Mixer les couleurs basé sur le noise
shader.fragmentShader = shader.fragmentShader.replace(
    '#include <color_fragment>',
    `#include <color_fragment>

    vec3 noiseColor = mix(uColorA, uColorB, vNoise * 0.5 + 0.5);
    diffuseColor.rgb *= noiseColor;`
);

// Ajouter le fresnel
shader.fragmentShader = shader.fragmentShader.replace(
    '#include <output_fragment>',
    `
    // Fresnel effect
    vec3 viewDirection = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(0.0, dot(viewDirection, normal)), 2.0);
    gl_FragColor.rgb += fresnel * 0.3;

    #include <output_fragment>`
);
```

## 🎮 GUI Simplifiée

### Avant (complexe)
- Shader Parameters
- Texture/Color
- Material Mode (switch)
- Reset

### Après (simple et focused)
- Noise Parameters
- Colors
- Material Properties (PBR)

```javascript
const noiseFolder = gui.addFolder('Noise');
noiseFolder.add(params, 'noiseScale', 0.5, 10);
noiseFolder.add(params, 'noiseSpeed', 0, 1);
noiseFolder.add(params, 'noiseAmplitude', 0, 0.5);

const materialFolder = gui.addFolder('Material PBR');
materialFolder.add(material, 'metalness', 0, 1);
materialFolder.add(material, 'roughness', 0, 1);
materialFolder.add(material, 'clearcoat', 0, 1);
```

## 🔍 Points techniques importants

### 1. Shader Chunks System
Three.js utilise un système de "chunks" - petits morceaux de GLSL réutilisables. On peut les remplacer ou les étendre.

### 2. Variables prédéfinies
- `position` : Position du vertex
- `normal` : Normale du vertex
- `diffuseColor` : Couleur diffuse dans le fragment
- `gl_FragColor` : Couleur finale

### 3. Material needs recompile
```javascript
material.customProgramCacheKey = () => {
    return JSON.stringify(uniforms);
};
```

### 4. Varyings automatiques
Three.js passe déjà beaucoup de varyings. On ajoute les nôtres sans casser les existants.

## 💡 Avantages de cette approche

1. **Conservation du PBR** : Metalness, roughness, clearcoat fonctionnent
2. **Ombres automatiques** : castShadow/receiveShadow marchent
3. **Lumières intégrées** : Toutes les lumières Three.js sont supportées
4. **Moins de code** : Pas besoin de réimplémenter l'éclairage
5. **Performance** : Utilise les optimisations Three.js

## 🚀 Extensions possibles

1. **Multi-layer noise** : Combiner plusieurs octaves
2. **Texture mixing** : Ajouter des textures en plus des couleurs
3. **Displacement mapping** : Utiliser une texture pour le déplacement
4. **Animated properties** : Animer metalness/roughness avec le noise

## 📝 Résumé

**Avant** : 2 matériaux séparés, switching complexe
**Après** : 1 MeshPhysicalMaterial enrichi, simple et puissant

Cette approche montre la puissance de `onBeforeCompile` pour étendre les matériaux Three.js sans perdre leurs fonctionnalités.