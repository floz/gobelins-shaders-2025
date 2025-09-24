uniform float uTime;
uniform float uProgress;

varying vec2 vUv;

void main() {
    // TODO: Calculer la distance depuis le centre
    float distanceFromCenter = 0.0; // À compléter avec length()

    // TODO: Créer l'effet de reveal circulaire
    // Utiliser smoothstep() avec uProgress et distanceFromCenter
    float reveal = 1.0; // À compléter

    // TODO: Discard si pas visible
    // if (reveal < 0.01) discard;

    // TODO: Définir la couleur
    vec3 color = vec3(0.2, 0.3, 0.4);

    gl_FragColor = vec4(color, reveal);
}