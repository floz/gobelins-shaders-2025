precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform float u_angle;
uniform float u_radial;

void main() {
  vec2 uv = vUv;
  float t = 0.0;
  
  if (u_radial > 0.5) {
    // Radial gradient
    vec2 center = vec2(0.5);
    t = distance(uv, center) * 2.0;
    t = clamp(t, 0.0, 1.0);
  } else {
    // Linear gradient with angle
    vec2 dir = vec2(cos(u_angle), sin(u_angle));
    t = dot(uv - 0.5, dir) + 0.5;
    t = clamp(t, 0.0, 1.0);
  }
  
  vec3 color = mix(u_colorA, u_colorB, t);
  
  gl_FragColor = vec4(color, 1.0);
}