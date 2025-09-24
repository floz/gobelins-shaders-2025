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

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    // Projection XZ pour le masque (exactement comme le ground)
    vec2 maskUV = worldPosition.xz * 0.1 + 0.5;
    vMaskValue = texture2D(uMask, maskUV * 2.0).r;

    // Noise pour variation
    float noise = snoise(maskUV * uNoiseScale + uTime * 0.1) * 0.5 + 0.5;

    // Reveal de haut en bas
    float normalizedY = clamp((position.y - uMinY) / (uMaxY - uMinY), 0.0, 1.0);
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
    vec3 displacedPosition = position;
    displacedPosition.x += normal.x * displacement * 0.4;
    displacedPosition.z += normal.z * displacement * 0.2; // Un peu en Z aussi pour plus d'effet

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displacedPosition, 1.0);
}