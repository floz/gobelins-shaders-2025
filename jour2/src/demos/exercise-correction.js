import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createScene } from '../utils/scene.js';

let gui;

export function initExerciseCorrection() {
    const { scene, start, cleanup } = createScene({
        cameraPosition: new THREE.Vector3(0, 0, 4),
        enableOrbitControls: true
    });

    const textureLoader = new THREE.TextureLoader();
    const textureA = textureLoader.load('/assets/textures/a.jpg');
    const textureB = textureLoader.load('/assets/textures/b.jpg');

    const uniforms = {
        uThreshold: { value: 0.5 },
        uTwist: { value: 0.0 },
        uDispAmp: { value: 0.0 },
        uTime: { value: 0 },
        uUseTextures: { value: false },
        uColorA: { value: new THREE.Color(0x00ffff) },
        uColorB: { value: new THREE.Color(0xff00ff) },
        uMapA: { value: textureA },
        uMapB: { value: textureB }
    };

    let suzanne;
    let customMaterial;

    const loader = new GLTFLoader();

    function createFallbackGeometry() {
        return new THREE.TorusKnotGeometry(0.8, 0.3, 128, 32);
    }

    function setupModel(geometry) {
        // SOLUTION: Create a MeshPhysicalMaterial with onBeforeCompile
        customMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.5
        });

        // SOLUTION: Apply shader customization using onBeforeCompile
        customMaterial.onBeforeCompile = (shader) => {
            // 1. Add uniforms to the shader
            Object.keys(uniforms).forEach(key => {
                shader.uniforms[key] = uniforms[key];
            });

            // 2. Add custom UV varying for fragment shader
            shader.vertexShader = shader.vertexShader.replace(
                '#include <uv_pars_vertex>',
                `#include <uv_pars_vertex>
                varying vec2 vCustomUv;`
            );

            shader.vertexShader = shader.vertexShader.replace(
                '#include <uv_vertex>',
                `#include <uv_vertex>
                vCustomUv = uv;`
            );

            // 3. Add helper functions for vertex deformations
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `#include <common>

                uniform float uTwist;
                uniform float uDispAmp;
                uniform float uTime;

                // Simple hash function for noise
                float hash(vec3 p) {
                    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
                }

                // 2D rotation matrix
                mat2 rotate2D(float angle) {
                    float s = sin(angle);
                    float c = cos(angle);
                    return mat2(c, -s, s, c);
                }`
            );

            // 4. Apply vertex deformations
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `vec3 transformed = vec3( position );

                // Apply twist around Y axis
                float twistAngle = uTwist * transformed.y * 3.14159;
                transformed.xz = rotate2D(twistAngle) * transformed.xz;

                // Apply displacement using noise
                float noiseValue = hash(transformed * 3.0 + vec3(uTime * 0.2));
                transformed += normal * (noiseValue - 0.5) * 2.0 * uDispAmp;`
            );

            // 5. Add custom UV varying to fragment shader
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <uv_pars_fragment>',
                `#include <uv_pars_fragment>
                varying vec2 vCustomUv;`
            );

            // 6. Add texture blending functions
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `#include <common>

                uniform float uThreshold;
                uniform bool uUseTextures;
                uniform vec3 uColorA;
                uniform vec3 uColorB;
                uniform sampler2D uMapA;
                uniform sampler2D uMapB;

                // Smooth edge transition
                float edge(float x, float t) {
                    return smoothstep(t - 0.02, t + 0.02, x);
                }

                // Blend between textures or colors
                vec3 blendMaterials(vec2 uv) {
                    vec3 A = uUseTextures ? texture2D(uMapA, uv).rgb : uColorA;
                    vec3 B = uUseTextures ? texture2D(uMapB, uv).rgb : uColorB;

                    // Different mask types
                    float mask = edge(uv.y, uThreshold); // Vertical
                    // float mask = edge(uv.x, uThreshold); // Horizontal
                    // float mask = edge(length(uv - 0.5) * 2.0, uThreshold); // Radial

                    return mix(A, B, mask);
                }`
            );

            // 7. Apply custom colors after standard map processing
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                `#include <map_fragment>

                // Override with our custom blended colors
                vec3 customColor = blendMaterials(vCustomUv);
                diffuseColor.rgb = customColor;`
            );
        };

        suzanne = new THREE.Mesh(geometry, customMaterial);
        suzanne.castShadow = true;
        suzanne.receiveShadow = true;
        scene.add(suzanne);

        setupGUI();
        startAnimation();
    }

    loader.load(
        '/assets/models/suzanne.glb',
        (gltf) => {
            const model = gltf.scene.children[0];
            if (model && model.geometry) {
                setupModel(model.geometry);
            } else {
                console.warn('Suzanne model not found, using fallback geometry');
                setupModel(createFallbackGeometry());
            }
        },
        (progress) => {
            console.log('Loading model...', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.warn('Failed to load model, using fallback geometry', error);
            setupModel(createFallbackGeometry());
        }
    );

    const params = {
        threshold: 0.5,
        twist: 0.0,
        dispAmp: 0.0,
        useTextures: false,
        colorA: '#00ffff',
        colorB: '#ff00ff',
        autoRotate: true,
        maskType: 'vertical',
        reset: () => {
            params.threshold = 0.5;
            params.twist = 0.0;
            params.dispAmp = 0.0;
            params.useTextures = false;
            params.autoRotate = true;
            params.maskType = 'vertical';
            if (gui) gui.controllers.forEach(c => c.updateDisplay());
        }
    };

    function setupGUI() {
        gui = new GUI();

        const solutionInfo = gui.addFolder('💡 Solution Info');
        solutionInfo.add({
            info: () => {
                console.log(`
                === SOLUTION: Shader Customization ===

                This is the complete implementation showing:

                1. VERTEX SHADER:
                   ✅ Twist deformation using rotation matrix
                   ✅ Displacement using hash-based noise
                   ✅ Custom UV passing to fragment shader

                2. FRAGMENT SHADER:
                   ✅ Texture/color blending with threshold
                   ✅ Smooth transitions using smoothstep
                   ✅ Different mask patterns (vertical, horizontal, radial)

                3. KEY POINTS:
                   - Use onBeforeCompile to modify built-in materials
                   - Add uniforms via shader.uniforms
                   - Replace shader chunks at specific includes
                   - Create custom varyings for UV coordinates
                   - Override diffuseColor for custom colors

                4. ADVANTAGES:
                   - Keep PhysicalMaterial lighting
                   - Maintain PBR properties
                   - Simple and understandable code
                   - No external shader files needed
                `);
            }
        }, 'info').name('📖 View Implementation Details');
        solutionInfo.open();

        const shaderFolder = gui.addFolder('Shader Parameters');
        shaderFolder.add(params, 'threshold', 0, 1, 0.01).onChange(value => {
            uniforms.uThreshold.value = value;
        });
        shaderFolder.add(params, 'twist', -1, 1, 0.01).onChange(value => {
            uniforms.uTwist.value = value;
        });
        shaderFolder.add(params, 'dispAmp', 0, 0.3, 0.01).onChange(value => {
            uniforms.uDispAmp.value = value;
        });
        shaderFolder.open();

        const textureFolder = gui.addFolder('Texture/Color');
        textureFolder.add(params, 'useTextures').name('Use Textures').onChange(value => {
            uniforms.uUseTextures.value = value;
        });
        textureFolder.addColor(params, 'colorA').onChange(value => {
            uniforms.uColorA.value.set(value);
        });
        textureFolder.addColor(params, 'colorB').onChange(value => {
            uniforms.uColorB.value.set(value);
        });
        textureFolder.open();

        const animFolder = gui.addFolder('Animation');
        animFolder.add(params, 'autoRotate');

        const maskFolder = gui.addFolder('Mask Types (edit code)');
        maskFolder.add(params, 'maskType', ['vertical', 'horizontal', 'radial']).onChange(() => {
            console.log(`
            To change mask type, modify line ~130 in blendMaterials():

            Vertical:   float mask = edge(uv.y, uThreshold);
            Horizontal: float mask = edge(uv.x, uThreshold);
            Radial:     float mask = edge(length(uv - 0.5) * 2.0, uThreshold);
            `);
        });
        maskFolder.open();

        gui.add(params, 'reset');
    }

    function startAnimation() {
        start((elapsedTime) => {
            uniforms.uTime.value = elapsedTime;
            if (suzanne && params.autoRotate) {
                suzanne.rotation.y = elapsedTime * 0.2;
            }
        });
    }

    return {
        cleanup: () => {
            cleanup();
            if (gui) gui.destroy();
        }
    };
}

export function disposeExerciseCorrection() {
    if (gui) {
        gui.destroy();
        gui = null;
    }
}