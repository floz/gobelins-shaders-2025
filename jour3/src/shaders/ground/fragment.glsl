uniform float uTime;
uniform float uProgress;
uniform sampler2D uMask;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform vec3 uColor1;
uniform vec3 uColor2;

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
    float distanceFromCenter = length(vUv - 0.5) * 2.0;

    vec2 noiseUv = vUv * uNoiseScale + uTime * uNoiseSpeed;
    float noise = snoise(noiseUv) * 0.5 + 0.5;

    float maskValue = texture2D(uMask, vUv * 2.0).r;

    // Cercle inversé : bord net qui grandit avec le progress
    // Plus la distance est grande, plus on est loin du centre
    float circleReveal = smoothstep(uProgress * 2.0 - 0.2, uProgress * 2.0 + 0.2, distanceFromCenter);

    // Threshold net : on multiplie mask et cercle, puis on compare à progress
    // Ça crée un pattern qui dépend à la fois du cercle ET du mask
    float combinedMask = step(maskValue * circleReveal, uProgress);

    // Le reveal final adoucit légèrement la transition
    float noiseReveal = smoothstep(0.0, 1.0, combinedMask + uProgress);
    float reveal = mix(0.0, 1.0, noiseReveal);

    // Couleur de base avec highlight sur les zones déplacées
    vec3 color = uColor1;

    // Ajoute une couleur plus brillante sur les bords déplacés
    if (vDisplacement > 0.01) {
        color = mix(color, uColor2, vDisplacement);
    }

    gl_FragColor = vec4(color, reveal);
    // Vignetting direct pour effet illustration
    gl_FragColor *= 1.0 - distanceFromCenter;
}