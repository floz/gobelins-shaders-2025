import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createScene } from '../utils/scene.js';
import { patchPhysicalMaterial, buildShaderMaterial } from '../shaders/inject.js';
// Optional: direct shader imports if needed
// import vertexShader from '../shaders/vCustom.glsl';
// import fragmentShader from '../shaders/fCustom.glsl';

let gui;

export function initSuzanneDemo() {
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
        uColorA: { value: new THREE.Color(0xff6600) },
        uColorB: { value: new THREE.Color(0x0066ff) },
        uMapA: { value: textureA },
        uMapB: { value: textureB }
    };

    let suzanne;
    let physicalMaterial;
    let shaderMaterial;

    const loader = new GLTFLoader();

    function createFallbackGeometry() {
        return new THREE.TorusKnotGeometry(0.8, 0.3, 128, 32);
    }

    function setupModel(geometry) {
        physicalMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.4,
            roughness: 0.3,
            clearcoat: 0.3,
            clearcoatRoughness: 0.2
        });
        physicalMaterial = patchPhysicalMaterial(physicalMaterial, uniforms);

        shaderMaterial = buildShaderMaterial(uniforms);

        suzanne = new THREE.Mesh(geometry, physicalMaterial);
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
            console.log('Loading Suzanne model...', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.warn('Failed to load Suzanne model, using fallback geometry', error);
            setupModel(createFallbackGeometry());
        }
    );

    const params = {
        threshold: 0.5,
        twist: 0.0,
        dispAmp: 0.0,
        useTextures: false,
        colorA: '#ff6600',
        colorB: '#0066ff',
        materialMode: 'physical',
        maskType: 'vertical',
        reset: () => {
            params.threshold = 0.5;
            params.twist = 0.0;
            params.dispAmp = 0.0;
            params.useTextures = false;
            params.maskType = 'vertical';
            if (gui) gui.controllers.forEach(c => c.updateDisplay());
        }
    };

    function setupGUI() {
        gui = new GUI();

        const shaderFolder = gui.addFolder('Shader Parameters');
        shaderFolder.add(params, 'threshold', 0, 1).onChange(value => {
            uniforms.uThreshold.value = value;
        });
        shaderFolder.add(params, 'twist', -1, 1).onChange(value => {
            uniforms.uTwist.value = value;
        });
        shaderFolder.add(params, 'dispAmp', 0, 0.3).onChange(value => {
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

        const materialFolder = gui.addFolder('Material Mode');
        materialFolder.add(params, 'materialMode', ['physical', 'shader']).onChange(value => {
            if (suzanne) {
                if (value === 'physical') {
                    suzanne.material = physicalMaterial;
                } else {
                    suzanne.material = shaderMaterial;
                }
            }
        });
        materialFolder.add(params, 'maskType', ['vertical', 'horizontal', 'radial']).onChange(() => {
            updateMaskType();
        });
        materialFolder.open();
    }

    function updateMaskType() {
        const material = suzanne.material;
        if (material.onBeforeCompile) {
            material.needsUpdate = true;
        }
    }

    function startAnimation() {
        start((elapsedTime) => {
            uniforms.uTime.value = elapsedTime;
            if (suzanne) {
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

export function disposeSuzanneDemo() {
    if (gui) {
        gui.destroy();
        gui = null;
    }
}