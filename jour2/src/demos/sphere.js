import * as THREE from 'three';
import GUI from 'lil-gui';
import { createScene } from '../utils/scene.js';
import { patchPhysicalMaterial, buildShaderMaterial } from '../shaders/inject.js';

let gui;

export function initSphereDemo() {
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
        uColorA: { value: new THREE.Color(0x00ff88) },
        uColorB: { value: new THREE.Color(0xff0088) },
        uMapA: { value: textureA },
        uMapB: { value: textureB }
    };

    const sphereGeometry = new THREE.SphereGeometry(1, 256, 128);

    let physicalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1
    });
    physicalMaterial = patchPhysicalMaterial(physicalMaterial, uniforms);

    const shaderMaterial = buildShaderMaterial(uniforms);

    const sphere = new THREE.Mesh(sphereGeometry, physicalMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    const params = {
        threshold: 0.5,
        twist: 0.0,
        dispAmp: 0.0,
        useTextures: false,
        colorA: '#00ff88',
        colorB: '#ff0088',
        materialMode: 'physical',
        reset: () => {
            params.threshold = 0.5;
            params.twist = 0.0;
            params.dispAmp = 0.0;
            params.useTextures = false;
            gui.controllers.forEach(c => c.updateDisplay());
        }
    };

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
        if (value === 'physical') {
            sphere.material = physicalMaterial;
        } else {
            sphere.material = shaderMaterial;
        }
    });
    materialFolder.open();

    gui.add(params, 'reset');

    start((elapsedTime) => {
        uniforms.uTime.value = elapsedTime;
        sphere.rotation.y = elapsedTime * 0.1;
    });

    return {
        cleanup: () => {
            cleanup();
            if (gui) gui.destroy();
        }
    };
}

export function disposeSphereDemo() {
    if (gui) {
        gui.destroy();
        gui = null;
    }
}