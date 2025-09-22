precision highp float;

#import("math")
#import("color")

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_segments;
uniform float u_rotation;
uniform float u_scale;
uniform float u_animate;
uniform float u_colorShift;
uniform float u_aspectCorrection;

// Kaleidoscope transformation
vec2 kaleidoscope(vec2 uv, float segments) {
  // Convert to polar coordinates
  vec2 centered = uv - 0.5;
  float angle = atan(centered.y, centered.x);
  float radius = length(centered);

  // Kaleidoscope effect
  float segmentAngle = TAU / segments;
  angle = mod(angle, segmentAngle);

  // Mirror every other segment
  if (mod(floor(atan(centered.y, centered.x) / segmentAngle), 2.0) == 1.0) {
    angle = segmentAngle - angle;
  }

  // Convert back to cartesian
  return vec2(cos(angle), sin(angle)) * radius + 0.5;
}

// Pattern generation
float pattern(vec2 uv, float time) {
  // Create moving circles
  vec2 st = uv * 3.0;
  st += vec2(cos(time * 0.5), sin(time * 0.3)) * 0.5;

  float d1 = length(st - vec2(1.5, 1.5));
  float d2 = length(st - vec2(2.5, 2.0));
  float d3 = length(st - vec2(2.0, 2.5));

  float pattern = 0.0;
  pattern += sin(d1 * 10.0 - time * 2.0) * 0.5 + 0.5;
  pattern += sin(d2 * 8.0 + time * 1.5) * 0.5 + 0.5;
  pattern += sin(d3 * 6.0 - time * 1.0) * 0.5 + 0.5;
  pattern /= 3.0;

  return pattern;
}

void main() {
  vec2 uv = vUv;

  // Apply aspect ratio correction if enabled
  if (u_aspectCorrection > 0.5) {
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x = (uv.x - 0.5) * aspectRatio + 0.5;
  }

  // Apply scale
  uv = (uv - 0.5) / u_scale + 0.5;

  // Apply rotation
  float rot = u_rotation;
  if (u_animate > 0.5) {
    rot += u_time * 0.2;
  }

  vec2 centered = uv - 0.5;
  float s = sin(rot);
  float c = cos(rot);
  centered = vec2(c * centered.x - s * centered.y, s * centered.x + c * centered.y);
  uv = centered + 0.5;

  // Apply kaleidoscope
  vec2 kaleido = kaleidoscope(uv, u_segments);

  // Generate pattern
  float p = pattern(kaleido, u_animate > 0.5 ? u_time : 0.0);

  // Create color
  float hue = p + u_colorShift;
  if (u_animate > 0.5) {
    hue += u_time * 0.1;
  }
  vec3 color = hsv2rgb(vec3(hue, 0.8, p));

  // Add some contrast
  color = pow(color, vec3(1.2));

  gl_FragColor = vec4(color, 1.0);
}