uniform float uTime;
uniform float uProgress;
uniform sampler2D uMask;
uniform float uMinY;
uniform float uMaxY;
uniform float uNoiseScale;

varying float vReveal;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vMaskValue;

#include <noise2D>

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float cubicIn(float t) {
  return t * t * t;
}

void main() {
    vUv = uv;

    // Apply twist effect based on progress
    vec3 twistedPosition = position;
    float twistAmount = 2.0; // Twist de 4 comme demandé
    float twistAngle = ( 1. - cubicOut( uProgress ) ) * twistAmount * cubicIn( twistedPosition.y ) * 3.14159;
    mat2 rot = rotate2D(twistAngle);
    twistedPosition.yz = rot * twistedPosition.yz;

    // Update normal to follow the twist
    vec3 twistedNormal = normal;
    twistedNormal.yz = rot * twistedNormal.yz;
    vNormal = normalize(normalMatrix * twistedNormal);

    vec4 worldPosition = modelMatrix * vec4(twistedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;

    // Projection XZ pour le masque (exactement comme le ground)
    vec2 maskUV = worldPosition.xz * 0.1 + 0.5;
    vMaskValue = texture2D(uMask, maskUV * 2.0).r;

    // Noise pour variation
    float noise = snoise(maskUV * uNoiseScale + uTime * 0.1) * 0.5 + 0.5;

    // Reveal de haut en bas
    float normalizedY = clamp((twistedPosition.y - uMinY) / (uMaxY - uMinY), 0.0, 1.0);
    float yReveal = smoothstep(uProgress * 2.0 - 0.2, uProgress * 2.0 + 0.2, normalizedY);

    // Valeur avant le step pour détecter la proximité du bord
    float revealValue = vMaskValue * yReveal;

    // Même technique edgy que le ground : mask * yReveal, puis step
    float combinedReveal = step(revealValue, uProgress);
    vReveal = combinedReveal;

    // Détection de la zone de bord : quand revealValue est proche de uProgress
    float edgeDistance = abs(revealValue - uProgress);
    float edgeInfluence = 1.0 - smoothstep(0.0, 0.15, edgeDistance);

    // Déplacement uniquement sur les zones non-révélées près du bord
    float displacement = edgeInfluence * (1.0 - combinedReveal);

    // Déplacement des vertices selon la normale en X
    vec3 displacedPosition = twistedPosition;
    displacedPosition.x += twistedNormal.x * displacement * 0.4;
    displacedPosition.z += twistedNormal.z * displacement * 0.2; // Un peu en Z aussi pour plus d'effet

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displacedPosition, 1.0);
}