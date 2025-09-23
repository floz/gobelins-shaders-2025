import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createScene } from '../utils/scene.js';

let gui;

export function initExercise() {
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
        // TODO: Create a MeshPhysicalMaterial
        // Start with a basic material - students will customize this
        customMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.5
        });

        // TODO: Apply shader customization using onBeforeCompile
        // Students will implement the shader injection here
        // Hints:
        // 1. Use customMaterial.onBeforeCompile = (shader) => { ... }
        // 2. Add uniforms to shader.uniforms
        // 3. Modify shader.vertexShader for deformations
        // 4. Modify shader.fragmentShader for texture transitions

        customMaterial.onBeforeCompile = (shader) => {
            // TODO: Add uniforms to the shader
            // Example: shader.uniforms.uThreshold = uniforms.uThreshold;

            // TODO: Inject vertex shader code for deformations
            // - Add twist deformation based on Y position
            // - Add displacement using noise function

            // TODO: Inject fragment shader code for transitions
            // - Implement texture/color mixing based on uThreshold
            // - Use smoothstep for smooth transitions
            // - Consider different mask types (vertical, radial, etc.)

            console.log('Exercise: Implement shader customization here!');
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
        reset: () => {
            params.threshold = 0.5;
            params.twist = 0.0;
            params.dispAmp = 0.0;
            params.useTextures = false;
            params.autoRotate = true;
            if (gui) gui.controllers.forEach(c => c.updateDisplay());
        }
    };

    function setupGUI() {
        gui = new GUI();

        const exerciseInfo = gui.addFolder('Exercise Instructions');
        exerciseInfo.add({
            info: () => {
                console.log(`
                === EXERCISE: Customize Suzanne Shaders ===

                Your task is to implement shader customization:

                1. VERTEX SHADER:
                   - Add twist deformation around Y axis
                   - Add displacement based on noise
                   - Use the uniforms: uTwist, uDispAmp, uTime

                2. FRAGMENT SHADER:
                   - Implement texture/color transitions
                   - Use smoothstep for smooth blending
                   - Experiment with different mask types
                   - Use the uniforms: uThreshold, uUseTextures, uColorA/B, uMapA/B

                3. BONUS CHALLENGES:
                   - Try different mask patterns (radial, noise-based)
                   - Add animated transitions
                   - Implement custom lighting effects

                Look at demos/sphere.js and shaders/inject.js for reference!
                `);
            }
        }, 'info').name('📖 Click for Instructions');
        exerciseInfo.open();

        const shaderFolder = gui.addFolder('Shader Parameters');
        shaderFolder.add(params, 'threshold', 0, 1).onChange(value => {
            uniforms.uThreshold.value = value;
            // TODO: Make sure this uniform is used in your shader
        });
        shaderFolder.add(params, 'twist', -1, 1).onChange(value => {
            uniforms.uTwist.value = value;
            // TODO: Implement twist in vertex shader
        });
        shaderFolder.add(params, 'dispAmp', 0, 0.3).onChange(value => {
            uniforms.uDispAmp.value = value;
            // TODO: Implement displacement in vertex shader
        });
        shaderFolder.open();

        const textureFolder = gui.addFolder('Texture/Color');
        textureFolder.add(params, 'useTextures').name('Use Textures').onChange(value => {
            uniforms.uUseTextures.value = value;
            // TODO: Switch between textures and colors in fragment shader
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
        animFolder.open();

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

export function disposeExercise() {
    if (gui) {
        gui.destroy();
        gui = null;
    }
}