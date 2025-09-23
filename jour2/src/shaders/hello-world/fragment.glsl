uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vPosition;
varying vec3 vViewPosition; // Position non déformée pour le fresnel
varying float vNoise;

void main() {
    // Simple lighting calculation (en espace vue)
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
    float lightIntensity = dot(normalize(vViewNormal), lightDirection) * 0.5 + 0.5;

    // Mix colors based on noise
    vec3 color = mix(uColorA, uColorB, vNoise * 0.5 + 0.5);

    // Apply lighting
    color *= lightIntensity;

    // Fresnel avec position non déformée pour stabilité
    vec3 viewDirection = normalize(-vPosition); // En espace vue, la caméra est à l'origine
    float fresnel = 1.0 - abs(dot(viewDirection, normalize(vNormal)));
    float fresnel2 = 1.0 - abs(dot(viewDirection, normalize(vViewNormal)));
    fresnel = pow(fresnel + fresnel2, 2.0) * .5;

    color += fresnel;

    gl_FragColor = vec4(color, 1.0);
}