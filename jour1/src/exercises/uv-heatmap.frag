precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_mode;

void main() {
  vec3 color = vec3(0.0);
  
  // Mode 0: Red channel (U)
  // Mode 1: Green channel (V)  
  // Mode 2: Red + Green (UV)
  
  if (u_mode < 0.5) {
    // Show U coordinate in red
    color.r = vUv.x;
  } else if (u_mode < 1.5) {
    // Show V coordinate in green
    color.g = vUv.y;
  } else {
    // Show both UV coordinates
    color.rg = vUv;
  }
  
  gl_FragColor = vec4(color, 1.0);
}