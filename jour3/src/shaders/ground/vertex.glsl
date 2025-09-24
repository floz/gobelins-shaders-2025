uniform float uTime;
uniform float uProgress;
uniform sampler2D uMask;
uniform float uNoiseScale;
uniform float uNoiseSpeed;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vDisplacement;

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

    // Distance depuis le centre
    float distanceFromCenter = length(vUv - 0.5) * 2.0;

    // Noise pour variation
    vec2 noiseUv = vUv * uNoiseScale + uTime * uNoiseSpeed;
    float noise = snoise(noiseUv) * 0.5 + 0.5;

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
    float edgeInfluence = 1.0 - smoothstep(0.0, 0.15, edgeDistance);

    // Déplacement uniquement sur les zones non-révélées près du bord
    float displacement = edgeInfluence * (1.0 - combinedReveal);
    vDisplacement = displacement; // Passe au fragment shader

    // Déplacement des vertices en Z
    vec3 displacedPosition = position;
    // displacedPosition.z += displacement * .3 * (noise - 0.5) * 2.0; // Variation avec le noise

    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}