varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform float uTwist;
uniform float uDispAmp;
uniform float uTime;

float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    // Twist deformation around Y axis
    float twistAngle = uTwist * pos.y * 3.14159;
    pos.xz = rotate2D(twistAngle) * pos.xz;

    // Displacement with noise
    float noiseValue = hash(pos * 3.0 + vec3(uTime * 0.2));
    pos += normal * (noiseValue - 0.5) * 2.0 * uDispAmp;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}