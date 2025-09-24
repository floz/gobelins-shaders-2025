import * as THREE from 'three';
import GUI from 'lil-gui';
import { createScene } from './utils/scene.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import groundVertexShader from './shaders/exercise/ground-vertex.glsl';
import groundFragmentShader from './shaders/exercise/ground-fragment.glsl';
import suzanneVertexShader from './shaders/exercise/suzanne-vertex.glsl';
import suzanneFragmentShader from './shaders/exercise/suzanne-fragment.glsl';

const params = {
    progress: 0
};

const { scene, camera, start } = createScene({
    cameraPosition: new THREE.Vector3(3, 2, 5),
    clearColor: 0x0a0a0a,
    enableOrbitControls: true
});

camera.lookAt(0, 0, 0);

// TODO: Créer le sol
// - PlaneGeometry de 5x5
// - ShaderMaterial avec les shaders ground
// - Rotation -PI/2 sur X
// - Position Y = -0.5
const groundGeometry = null; // TODO
const groundMaterial = null; // TODO: ShaderMaterial avec uniforms uTime et uProgress

// TODO: Charger Suzanne
// - Utiliser GLTFLoader
// - Créer ShaderMaterial avec les shaders suzanne
// - Récupérer la bounding box pour uMinY et uMaxY
const loader = new GLTFLoader();
// TODO: loader.load('https://threejs.org/examples/models/gltf/Suzanne.gltf', ...)

// GUI
const gui = new GUI();
gui.add(params, 'progress', 0, 1, 0.01).name('Progress');

// Animation loop
start((elapsedTime) => {
    // TODO: Mettre à jour les uniforms
    // - groundMaterial.uniforms.uTime.value = elapsedTime
    // - groundMaterial.uniforms.uProgress.value = params.progress
    // - Pareil pour suzanneMaterial si elle existe
});