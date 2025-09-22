precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform float u_warpMode;
uniform float u_warpStrength;
uniform float u_speed;
uniform float u_aspectCorrection;

#define PI 3.14159265359

void main() {
  vec2 uv = vUv;

  // Apply aspect ratio correction if enabled
  if (u_aspectCorrection > 0.5) {
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x = (uv.x - 0.5) * aspectRatio + 0.5;
  }

  vec2 distortedUV = uv;
  float animTime = u_time * u_speed;

  if (u_warpMode < 0.5) {
    // 1) Ripple croisé
    distortedUV = uv + u_warpStrength * 0.02 * sin(vec2(10.0 * uv.y, 10.0 * uv.x) + animTime);

  } else if (u_warpMode < 1.5) {
    // 2) Vague diagonale
    distortedUV = uv + u_warpStrength * 0.03 * sin(12.0 * (uv.x + uv.y) + animTime);

  } else if (u_warpMode < 2.5) {
    // 3) Swirl radial léger
    vec2 c = uv - 0.5;
    float r = length(c);
    float a = atan(c.y, c.x) + u_warpStrength * 0.5 * r * sin(animTime);
    distortedUV = 0.5 + vec2(cos(a), sin(a)) * r;

  } else if (u_warpMode < 3.5) {
    // 4) Barrel/Pincushion
    vec2 d = (uv - 0.5);
    float k = u_warpStrength * 0.2 * sin(animTime);
    distortedUV = 0.5 + d * (1.0 + k * dot(d, d));

  } else if (u_warpMode < 4.5) {
    // 5) Kaleidoscope abs
    distortedUV = abs(fract(uv * 2.0) - 0.5) + 0.25;

  } else if (u_warpMode < 5.5) {
    // 6) Checker warp (mod)
    distortedUV = uv + u_warpStrength * 0.03 * sign(sin(6.2831 * mod(uv.x + uv.y, 0.25) * 4.0));

  } else if (u_warpMode < 6.5) {
    // 7) Zoom pulsé (cos)
    float z = u_warpStrength * 0.1 * cos(animTime) + 0.9;
    distortedUV = 0.5 + (uv - 0.5) * z;

  } else if (u_warpMode < 7.5) {
    // 8) Wave tunnel (sin + length)
    vec2 q = uv - 0.5;
    distortedUV = 0.5 + q * (0.8 + u_warpStrength * 0.2 * sin(20.0 * length(q) - animTime));

  } else if (u_warpMode < 8.5) {
    // 9) Shear animé (sin)
    distortedUV = uv + vec2(u_warpStrength * 0.06 * sin(8.0 * uv.y + animTime), 0.0);

  } else if (u_warpMode < 9.5) {
    // 10) Twist damier (mod + sin)
    vec2 m = mod(uv * 4.0, 1.0);
    distortedUV = uv + u_warpStrength * 0.02 * sin(20.0 * m.xyx + animTime).xy;

  } else if (u_warpMode < 10.5) {
    // 11) Vortex doux (atan + sin)
    vec2 p = uv - 0.5;
    float ang = atan(p.y, p.x) + u_warpStrength * 0.25 * sin(3.0 * atan(p.y, p.x) + animTime);
    distortedUV = 0.5 + vec2(cos(ang), sin(ang)) * length(p);

  } else {
    // 12) Chroma split (RGB décalés)
    vec2 w = uv + u_warpStrength * 0.01 * sin(vec2(8.0 * uv.y, 8.0 * uv.x) + animTime);
    vec3 color = vec3(
      texture2D(u_texture, mod(w + 0.002, 1.) ).r,
      texture2D(u_texture, mod(w, 1.) ).g,
      texture2D(u_texture, mod(w - 0.002, 1.) ).b
    );
    gl_FragColor = vec4(color, 1.0);
    return;
  }

  // Sample the texture with distorted UVs
  vec3 color = texture2D(u_texture,  distortedUV ).rgb;

  gl_FragColor = vec4(color, 1.0);
}