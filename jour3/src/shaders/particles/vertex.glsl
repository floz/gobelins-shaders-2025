uniform float uTime;
uniform float uProgress;
uniform float uSize;
uniform float uSpeed;
uniform float uRadius;
uniform sampler2D uMask;
uniform float uNoiseScale;

attribute vec4 aRandom;

varying float vAlpha;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec3 pos = position;

    float angle = atan(pos.z, pos.x) + uTime * uSpeed * (1.0 + aRandom.x * 0.5);
    float radius = length(pos.xz);

    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius;

    float yOffset = sin(uTime * 2.0 + aRandom.y * 6.28) * 0.3;
    pos.y += yOffset;

    pos.y = mod(pos.y + uTime * uSpeed * 0.5 + aRandom.z * 2.0, 3.0) - 1.5;

    vec2 maskUV = pos.xz * uNoiseScale * 0.2 + 0.5;
    float noise = snoise(maskUV + uTime * 0.2) * 0.5 + 0.5;
    float maskReveal = smoothstep(uProgress - 0.3, uProgress + 0.2, noise);

    float heightReveal = smoothstep(-1.5, 1.5, pos.y + 1.5);

    vAlpha = maskReveal * heightReveal * (0.5 + aRandom.w * 0.5);

    vec4 viewPosition = viewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float sizeVariation = 1.0 + sin(uTime * 3.0 + aRandom.x * 10.0) * 0.2;
    gl_PointSize = uSize * sizeVariation * (1.0 / -viewPosition.z);
}