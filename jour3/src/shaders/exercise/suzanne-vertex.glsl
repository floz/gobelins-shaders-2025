uniform float uTime;
uniform float uProgress;
uniform float uMinY;
uniform float uMaxY;

varying float vReveal;
varying vec3 vNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);

    // TODO: Calculer la position Y normalisée (0 en bas, 1 en haut)
    float normalizedY = 0.0; // À compléter

    // TODO: Créer le reveal de bas en haut
    vReveal = 0.0; // À compléter avec smoothstep()

    // TODO: Déplacer les vertices non révélés vers le bas
    vec3 displacedPosition = position;
    // if (vReveal < 0.5) { ... }

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displacedPosition, 1.0);
}