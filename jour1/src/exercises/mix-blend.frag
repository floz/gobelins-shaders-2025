precision highp float;

#import("blending")

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_mixFactor;
uniform float u_blendMode;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform float u_animate;
uniform float u_aspectCorrection;

// Pattern functions
float stripes(vec2 uv, float freq) {
  return step(0.5, fract(uv.x * freq));
}

float circles(vec2 uv, float freq) {
  vec2 st = fract(uv * freq);
  float d = distance(st, vec2(0.5));
  return 1.0 - step(0.3, d);
}

void main() {
  vec2 uv = vUv;

  // Apply aspect ratio correction if enabled
  if (u_aspectCorrection > 0.5) {
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x = (uv.x - 0.5) * aspectRatio + 0.5;
  }

  // Animated mix factor
  float mixFactor = u_mixFactor;
  if (u_animate > 0.5) {
    mixFactor = sin(u_time) * 0.5 + 0.5;
  }
  
  // Create two patterns
  float pattern1 = stripes(uv, 10.0);
  float pattern2 = circles(uv, 5.0);
  
  // Color the patterns
  vec3 col1 = u_colorA * pattern1;
  vec3 col2 = u_colorB * pattern2;
  
  vec3 result;
  
  if (u_blendMode < 0.5) {
    // Normal mix
    result = mix(col1, col2, mixFactor);
  } else if (u_blendMode < 1.5) {
    // Multiply
    result = blendMultiply(col1, col2);
  } else if (u_blendMode < 2.5) {
    // Screen
    result = blendScreen(col1, col2);
  } else {
    // Overlay
    result = blendOverlay(col1, col2);
  }
  
  gl_FragColor = vec4(result, 1.0);
}