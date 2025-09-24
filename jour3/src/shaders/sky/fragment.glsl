varying vec3 vColor;
varying vec2 vUv;
varying float vReveal;

void main() {
    // Discard si pas révélé
    if (vReveal < 0.01) discard;

    // Affiche le ciel avec le reveal
    gl_FragColor = vec4(vColor, vReveal);
}