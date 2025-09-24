import * as THREE from 'three';
import GUI from 'lil-gui';
import { createScene } from './utils/scene.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { initializeShaderChunks } from './utils/shaderChunks.js';

import groundVertexShader from './shaders/ground/vertex.glsl';
import groundFragmentShader from './shaders/ground/fragment.glsl';
import suzanneVertexShader from './shaders/suzanne/vertex.glsl';
import suzanneFragmentShader from './shaders/suzanne/fragment.glsl';
import particlesVertexShader from './shaders/particles/vertex.glsl';
import particlesFragmentShader from './shaders/particles/fragment.glsl';
import skyVertexShader from './shaders/sky/vertex.glsl';
import skyFragmentShader from './shaders/sky/fragment.glsl';

// Initialize shader chunks
initializeShaderChunks();

const params = {
    progress: 0,
    groundProgress: 0,
    suzanneProgress: 0,
    particlesProgress: 0,
    skyProgress: 0,
    noiseScale: 2.5,
    noiseSpeed: 0.3,
    displacementScale: 2,
    particleCount: 500,
    particleSpeed: 0.5,
    particleRadius: 1.5,
    skyBrightness: 0.7
};

const { scene, camera, start } = createScene({
    cameraPosition: new THREE.Vector3(3, 2, 5),
    clearColor: 0x0a0a0a,
    enableOrbitControls: true
});

camera.lookAt(0, 0, 0);

const textureLoader = new THREE.TextureLoader();
const maskTexture = textureLoader.load('/textures/mask.jpg');
maskTexture.wrapS = maskTexture.wrapT = THREE.RepeatWrapping;

// Sky avec gradient rouge
const skyGeometry = new THREE.IcosahedronGeometry(1, 5);
const skyMaterial = new THREE.ShaderMaterial({
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    uniforms: {
        uColor1: { value: new THREE.Color(0xff0a0a) }, // Dark red
        uColor2: { value: new THREE.Color(0xf4de24) }, // Bright red
        uColor3: { value: new THREE.Color(0xf47724) }, // Orange-red
        uBrightness: { value: 0.7 },
        uProgress: { value: 0 },
        uMask: { value: maskTexture }
    },
    side: THREE.BackSide,
    transparent: true,
    depthTest: false
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.scale.setScalar(10000);


// Textures pour le ground
const vegetalTexture = textureLoader.load('/textures/vegetal_floor.jpg');
vegetalTexture.wrapS = vegetalTexture.wrapT = THREE.RepeatWrapping;
vegetalTexture.repeat.set(8, 8);

const levelTexture = textureLoader.load('/textures/level.jpg');
levelTexture.wrapS = levelTexture.wrapT = THREE.RepeatWrapping;

const groundGeometry = new THREE.PlaneGeometry(15, 15, 15, 15);
// Apply rotation to the ground geometry using applyMatrix
const rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
groundGeometry.applyMatrix4(rotationMatrix);


const groundMaterial = new THREE.ShaderMaterial({
    vertexShader: groundVertexShader,
    fragmentShader: groundFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uMask: { value: maskTexture },
        uVegetalTexture: { value: vegetalTexture },
        uLevelTexture: { value: levelTexture },
        uNoiseScale: { value: params.noiseScale },
        uNoiseSpeed: { value: params.noiseSpeed },
        uColor1: { value: new THREE.Color(0xff4444) }, // Vert comme dans la ref
        uColor2: { value: new THREE.Color(0xf4de24) },
        uDisplacementScale: { value: params.displacementScale}
    },
    transparent: true,
    side: THREE.DoubleSide,
    // depthWrite: true
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.renderOrder = 1

// ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);
scene.add(sky);

const loader = new GLTFLoader();
let suzanne = null;
let suzanneMaterial = null;
let suzanneBBox = null;

loader.load(
    './models/suzanne.glb',
    (gltf) => {
        const originalMesh = gltf.scene.children[0];
        const geometry = originalMesh.geometry;

        suzanneBBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);

        suzanneMaterial = new THREE.ShaderMaterial({
            vertexShader: suzanneVertexShader,
            fragmentShader: suzanneFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uProgress: { value: 0 },
                uMask: { value: maskTexture },
                uMinY: { value: suzanneBBox.min.y },
                uMaxY: { value: suzanneBBox.max.y },
                uColor1: { value: new THREE.Color(0xff4444) },
                uColor2: { value: new THREE.Color(0x4444ff) },
                uNoiseScale: { value: params.noiseScale }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        suzanne = new THREE.Mesh(geometry, suzanneMaterial);
        suzanne.scale.setScalar(0.8);
        scene.add(suzanne);
        suzanne.renderOrder = 2
    }
);

const particleCount = params.particleCount;
const positions = new Float32Array(particleCount * 3);
const randoms = new Float32Array(particleCount * 4);

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const i4 = i * 4;

    const angle = (i / particleCount) * Math.PI * 2;
    const radius = params.particleRadius + (Math.random() - 0.5) * 0.5;

    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = (Math.random() - 0.5) * 2;
    positions[i3 + 2] = Math.sin(angle) * radius;

    randoms[i4] = Math.random();
    randoms[i4 + 1] = Math.random();
    randoms[i4 + 2] = Math.random();
    randoms[i4 + 3] = Math.random();
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 4));

const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uSize: { value: 20.0 },
        uSpeed: { value: params.particleSpeed },
        uRadius: { value: params.particleRadius },
        uMask: { value: maskTexture },
        uNoiseScale: { value: params.noiseScale }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const gui = new GUI();

const animationFolder = gui.addFolder('Animation');
animationFolder.add(params, 'progress', 0, 1, 0.01).name('Global Progress').onChange((value) => {
    params.groundProgress = value;
    params.suzanneProgress = value;
    params.particlesProgress = value;
    params.skyProgress = value;
});
animationFolder.add(params, 'groundProgress', 0, 1, 0.01).name('Ground Progress');
animationFolder.add(params, 'suzanneProgress', 0, 1, 0.01).name('Suzanne Progress');
animationFolder.add(params, 'particlesProgress', 0, 1, 0.01).name('Particles Progress');
animationFolder.add(params, 'skyProgress', 0, 1, 0.01).name('Sky Progress');

const noiseFolder = gui.addFolder('Noise');
noiseFolder.add(params, 'noiseScale', 0.5, 5, 0.1).name('Noise Scale');
noiseFolder.add(params, 'noiseSpeed', 0, 1, 0.01).name('Noise Speed');
noiseFolder.add(params, 'displacementScale', 0, 5, 0.01).name('Displacement');

const particlesFolder = gui.addFolder('Particles');
particlesFolder.add(params, 'particleSpeed', 0, 2, 0.01).name('Speed');
particlesFolder.add(params, 'particleRadius', 0.5, 3, 0.1).name('Radius');

const skyFolder = gui.addFolder('Sky');
skyFolder.add(params, 'skyBrightness', 0, 1.2, 0.01).name('Brightness');

animationFolder.open();

start((elapsedTime) => {
    groundMaterial.uniforms.uTime.value = elapsedTime;
    groundMaterial.uniforms.uProgress.value = params.groundProgress;
    groundMaterial.uniforms.uNoiseScale.value = params.noiseScale;
    groundMaterial.uniforms.uNoiseSpeed.value = params.noiseSpeed;
    groundMaterial.uniforms.uDisplacementScale.value = params.displacementScale;

    if (suzanneMaterial) {
        suzanneMaterial.uniforms.uTime.value = elapsedTime;
        suzanneMaterial.uniforms.uProgress.value = params.suzanneProgress;
        suzanneMaterial.uniforms.uNoiseScale.value = params.noiseScale;
    }

    particlesMaterial.uniforms.uTime.value = elapsedTime;
    particlesMaterial.uniforms.uProgress.value = params.particlesProgress;
    particlesMaterial.uniforms.uSpeed.value = params.particleSpeed;
    particlesMaterial.uniforms.uRadius.value = params.particleRadius;
    particlesMaterial.uniforms.uNoiseScale.value = params.noiseScale;

    // Animer le ciel avec le progress
    skyMaterial.uniforms.uProgress.value = params.skyProgress;
    skyMaterial.uniforms.uBrightness.value = params.skyBrightness * (0.3 + params.skyProgress * 0.7);
});