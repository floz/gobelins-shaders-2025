precision highp float;

#import("random")
#import("value-noise")
#import("perlin")
#import("simplex")
#import("curl-noise")
#import("color")

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_scale;
uniform float u_speed;
uniform float u_octaves;
uniform float u_colorize;
uniform float u_aspectCorrection;
uniform float u_noiseType;
uniform float u_contrast;

// Fractal Brownian Motion with selectable noise type
float fbm(vec2 st, float octaves, float noiseType) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 4; i++) {
    if (float(i) >= octaves) break;

    float n = 0.0;
    if (noiseType < 0.5) {
      // Value noise
      n = valueNoise(st * frequency);
    } else if (noiseType < 1.5) {
      // Perlin noise
      n = perlinNoise(st * frequency);
    } else if (noiseType < 2.5) {
      // Simplex noise
      n = simplexNoise(st * frequency);
    } else {
      // Curl noise (using magnitude)
      vec2 curl = curlNoise(st * frequency);
      n = length(curl);
    }

    value += amplitude * n;
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  vec2 uv = vUv;

  // Apply aspect ratio correction if enabled
  if (u_aspectCorrection > 0.5) {
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x = (uv.x - 0.5) * aspectRatio + 0.5;
  }

  vec2 st = uv * u_scale;

  // Animate
  st += u_time * u_speed * 0.1;

  // Generate noise with selected type
  float n = fbm(st, u_octaves, u_noiseType);

  vec3 color;

  if (u_colorize > 0.5) {
    // Colorized version
    vec3 color1 = vec3(0.1, 0.2, 0.5);
    vec3 color2 = vec3(0.9, 0.4, 0.1);
    vec3 color3 = vec3(0.2, 0.8, 0.4);

    if (n < 0.33) {
      color = mix(color1, color2, n * 3.0);
    } else if (n < 0.66) {
      color = mix(color2, color3, (n - 0.33) * 3.0);
    } else {
      color = mix(color3, vec3(1.0), (n - 0.66) * 3.0);
    }
  } else {
    // Grayscale
    color = vec3(n);
  }

  // Apply contrast adjustment
  color = contrast(color, u_contrast);
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}