precision highp float;

#import("value-noise")

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_lineWidth;
uniform float u_lineSpacing;
uniform float u_noiseStrength;
uniform float u_noiseScale;
uniform float u_speed;
uniform vec3 u_lineColor;
uniform vec3 u_bgColor;
uniform float u_aspectCorrection;

void main() {
  vec2 uv = vUv;

  // Apply aspect ratio correction if enabled
  if (u_aspectCorrection > 0.5) {
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x = (uv.x - 0.5) * aspectRatio + 0.5;
  }

  // Calculate noise displacement
  float noiseValue = valueNoise(vec2(uv.y * u_noiseScale, u_time * u_speed));
  noiseValue = valueNoise( vec2(noiseValue * u_noiseScale + uv.x * u_noiseScale, uv.y * u_noiseScale - u_time * u_speed));
  noiseValue = (noiseValue - 0.5) * 2.0; // Remap to -1 to 1

  // Apply noise to x coordinate
  float xDisplaced = uv.x + noiseValue * u_noiseStrength;

  // Create vertical lines
  float line1 = abs(xDisplaced - 0.33);
  float line2 = abs(xDisplaced - 0.66);

  // Calculate line masks with smoothstep for antialiasing
  float mask1 = 1.0 - smoothstep(0.0, u_lineWidth, line1);
  float mask2 = 1.0 - smoothstep(0.0, u_lineWidth, line2);

  // Combine masks
  float totalMask = max(mask1, mask2);

  // Mix colors
  vec3 color = mix(u_bgColor, u_lineColor, totalMask);

  gl_FragColor = vec4(color, 1.0);
}