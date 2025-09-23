import * as THREE from 'three';
import GUI from 'lil-gui';
import { createScene } from '../utils/scene.js';
import vertexShader from '../shaders/hello-world/vertex.glsl';
import fragmentShader from '../shaders/hello-world/fragment.glsl';

let gui;

export function initHelloWorldDemo() {
    const { scene, start, cleanup } = createScene({
        cameraPosition: new THREE.Vector3(0, 0, 3),
        enableOrbitControls: true
    });

    const uniforms = {
        uTime: { value: 0 },
        uNoiseScale: { value: 3.0 },
        uNoiseSpeed: { value: 0.2 },
        uNoiseAmplitude: { value: 0.15 },
        uColorA: { value: new THREE.Color(0x6366f1) },
        uColorB: { value: new THREE.Color(0xec4899) }
    };

    const sphereGeometry = new THREE.SphereGeometry(1, 128, 64);

    const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    const sphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
    scene.add(sphere);

    const params = {
        noiseScale: 3.0,
        noiseSpeed: 0.2,
        noiseAmplitude: 0.15,
        colorA: '#6366f1',
        colorB: '#ec4899'
    };

    gui = new GUI();

    const noiseFolder = gui.addFolder('Noise Parameters');
    noiseFolder.add(params, 'noiseScale', 0.5, 10).onChange(value => {
        uniforms.uNoiseScale.value = value;
    });
    noiseFolder.add(params, 'noiseSpeed', 0, 1).onChange(value => {
        uniforms.uNoiseSpeed.value = value;
    });
    noiseFolder.add(params, 'noiseAmplitude', 0, 0.5).onChange(value => {
        uniforms.uNoiseAmplitude.value = value;
    });
    noiseFolder.open();

    const colorFolder = gui.addFolder('Colors');
    colorFolder.addColor(params, 'colorA').onChange(value => {
        uniforms.uColorA.value.set(value);
    });
    colorFolder.addColor(params, 'colorB').onChange(value => {
        uniforms.uColorB.value.set(value);
    });
    colorFolder.open();

    start((elapsedTime) => {
        uniforms.uTime.value = elapsedTime;
    });

    return {
        cleanup: () => {
            cleanup();
            if (gui) gui.destroy();
        }
    };
}

export function disposeHelloWorldDemo() {
    if (gui) {
        gui.destroy();
        gui = null;
    }
}