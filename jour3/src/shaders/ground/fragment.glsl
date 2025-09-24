uniform float uTime;
uniform float uProgress;
uniform sampler2D uMask;
uniform sampler2D uVegetalTexture;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vDisplacement;
varying vec3 vNormal;

#include <noise2D>
#include <celShading>
#include <rimLight>

float cubicIn(float t) {
  return t * t * t;
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

    // Sample la texture végétale
    vec3 vegetalColor = texture2D(uVegetalTexture, vUv * 4.0).rgb;

    // Mix avec les couleurs uniformes pour teinter
    vec3 color = uColor1 + vegetalColor * .5;

    // Ajoute une couleur plus brillante sur les bords déplacés
    if (vDisplacement > 0.01) {
        color = mix(color, uColor2 * vegetalColor, vDisplacement);
    }

    // Direction de lumière cohérente avec Suzanne
    vec3 lightDir = normalize(vec3(1.0, 10.0, 1.0));
    vec3 viewDir = vec3(0.0, 1.0, 0.0);

    // Applique cel shading avec les normales perturbées
    color = celShading(color, vNormal, lightDir);

    // Alternative : cel shading basé sur le displacement pour plus de contraste
    float heightVariation = abs(vDisplacement);
    // if (heightVariation > 0.01) {
    //     color *= 0.85; // Assombrir les zones avec variation
    // }

    // Ajoute rim light subtil (moins fort sur le sol)
    color = addRimLight(color, vNormal, viewDir, vec3(0.8, 0.9, 1.0) * 0.5);

    gl_FragColor = vec4(color, reveal);
    // Vignetting direct pour effet illustration
    gl_FragColor.a *= 1.0 - cubicIn( distanceFromCenter );
}