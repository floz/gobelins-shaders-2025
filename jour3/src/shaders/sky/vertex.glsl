uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uBrightness;
uniform float uProgress;
uniform sampler2D uMask;

varying vec3 vColor;
varying vec2 vUv;
varying float vReveal;

vec3 light(vec3 lightColor, vec3 lightPos, float intensity, vec3 pos){
    float d = smoothstep(0.0, distance(lightPos, pos), intensity);
    return lightColor * d;
}

void main() {
    // Calcul des UV sphériques pour le masque
    vec3 normalizedPos = normalize(position);
    vUv = vec2(
        0.5 + atan(normalizedPos.z, normalizedPos.x) / (2.0 * 3.14159),
        0.5 + asin(normalizedPos.y) / 3.14159
    );

    // Distance depuis le centre (en projection sphérique)
    float distanceFromCenter = length(vUv - 0.5) * 2.0;

    // Texture mask
    float maskValue = texture2D(uMask, vUv * 2.0).r;

    // Même technique de reveal que le ground : cercle inversé
    float circleReveal = smoothstep(uProgress * 2.0 - 0.2, uProgress * 2.0 + 0.2, distanceFromCenter);

    // Combinaison avec le masque
    float revealValue = maskValue * circleReveal;
    vReveal = step(revealValue, uProgress);

    vColor = vec3(0.05);

    // Trois points de lumière pour créer le gradient
    vColor += light(uColor1, vec3(0.2, 0.3, 1.0), 0.4, position);
    vColor += light(uColor2, vec3(1.0, 0.5, 0.3), 0.4, position);
    vColor += light(uColor3, vec3(-1.0, -0.3, 1.0), 0.4, position);

    // Normalisation et ajustement de la luminosité
    vColor = normalize(vColor) * uBrightness + 0.1;
    vColor = min(vec3(1.0), max(vec3(0.0), vColor));

    // Variation basée sur la hauteur
    vColor *= mix(vec3(1.0), vec3(0.6), abs(position.y)) * 1.1;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}