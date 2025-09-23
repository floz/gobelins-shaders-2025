varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform float uThreshold;
uniform bool uUseTextures;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform sampler2D uMapA;
uniform sampler2D uMapB;

float edge(float x, float t) {
    return smoothstep(t - 0.02, t + 0.02, x);
}

void main() {
    // Choose between textures or colors
    vec3 A = uUseTextures ? texture2D(uMapA, vUv).rgb : uColorA;
    vec3 B = uUseTextures ? texture2D(uMapB, vUv).rgb : uColorB;

    // Create transition mask
    float mask = edge(vUv.y, uThreshold);
    vec3 finalColor = mix(A, B, mask);

    // Simple lighting
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
    float diff = max(dot(normal, lightDir), 0.0);

    vec3 ambient = finalColor * 0.3;
    vec3 diffuse = finalColor * diff * 0.7;

    vec3 result = ambient + diffuse;

    gl_FragColor = vec4(result, 1.0);
}