uniform vec3 uColor1;
uniform vec3 uColor2;

varying float vReveal;
varying vec3 vNormal;

void main() {
    // TODO: Discard si pas visible
    // if (vReveal < 0.01) discard;

    // TODO: Mixer les couleurs selon le reveal
    vec3 color = vec3(1.0, 0.0, 0.0); // À compléter avec mix()

    // BONUS: Ajouter un effet fresnel
    // float fresnel = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);

    gl_FragColor = vec4(color, vReveal);
}