uniform float uTime;
uniform float uProgress;
uniform sampler2D uMask;
uniform sampler2D uLevelTexture;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uDisplacementScale;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vDisplacement;
varying vec3 vNormal;

#include <noise2D>

void main() {
    vUv = uv;

    // Distance depuis le centre
    float distanceFromCenter = length(vUv - 0.5) * 2.0;

    // Texture mask
    float maskValue = texture2D(uMask, vUv * 2.0).r;

    // Cercle inversé pour le reveal
    float circleReveal = smoothstep(uProgress * 2.0 - 0.2, uProgress * 2.0 + 0.2, distanceFromCenter);

    // Valeur avant le step pour détecter la proximité du bord
    float revealValue = maskValue * circleReveal;

    // Step pour le reveal net
    float combinedReveal = step(revealValue, uProgress);

    // Détection de la zone de bord : quand revealValue est proche de uProgress
    float edgeDistance = abs(revealValue - uProgress);
    float edgeInfluence = 1.0 - smoothstep(0.0, 0.3, edgeDistance);

    // Déplacement uniquement sur les zones non-révélées près du bord
    float displacement = edgeInfluence * (1.0 - combinedReveal);
    vDisplacement = displacement; // Passe au fragment shader

    // Lecture de la texture de level pour displacement
    float levelHeight = texture2D(uLevelTexture, vUv).r - .5;

    // Déplacement des vertices en Z basé sur la texture + edge effect
    vec3 displacedPosition = position;
    float displacedValue = levelHeight * uDisplacementScale - uDisplacementScale * .25; // Height map
    displacedValue = displacedValue * distanceFromCenter + displacedValue * -circleReveal;
    displacedPosition.y += displacedValue;

    // Calculer une normale perturbée basée sur le displacement et le noise
    vec3 perturbedNormal = normal;

    // Perturber la normale en fonction du displacement height pour créer des variations
    // perturbedNormal.z += (levelHeight - 0.5) * 0.3;
    perturbedNormal.y += 0.8; // Garder principalement vers le haut
    perturbedNormal.y += displacedValue; // Garder principalement vers le haut

    vNormal = (normalMatrix * perturbedNormal);

    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}