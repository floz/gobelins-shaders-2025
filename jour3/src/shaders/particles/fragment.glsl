uniform float uProgress;

varying float vAlpha;

void main() {
    vec2 uv = gl_PointCoord;

    float distanceToCenter = length(uv - 0.5);
    float circle = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);

    vec3 color = vec3(0.6, 0.8, 1.0);

    gl_FragColor = vec4(color, circle * vAlpha * 0.8);
}