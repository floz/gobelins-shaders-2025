// SHADER 05: SHAPES - Introduction aux SDF (Signed Distance Fields)
// ==================================================================
// CONCEPTS APPRIS:
// - SDF: représentation mathématique de formes
// - Distance signée: négative à l'intérieur, positive à l'extérieur
// - Import de fonctions depuis des bibliothèques
// - Rotation 2D avec matrices
// - Correction du ratio d'aspect
//
// FORMES DE BASE:
// - sdCircle: cercle parfait
// - sdBox: rectangle/carré
// - sdHexagon: hexagone régulier
//
// AVANTAGES DES SDF:
// - Facilité de transformation (rotation, scale)
// - Opérations booléennes simples (union, intersection)
// - Antialiasing naturel avec smoothstep
// - Distance exacte pour effets spéciaux
//
// EXERCICES:
// - Combinez plusieurs formes avec min()
// - Créez des formes concentriques
// - Ajoutez un contour avec abs(sdf) < thickness

precision highp float;

#import("sdf")
#import("math")

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_shape;
uniform float u_size;
uniform float u_rotation;
uniform float u_smoothness;
uniform vec3 u_color;
uniform float u_aspectCorrection;

void main() {
  vec2 uv = vUv;

  // Apply aspect ratio correction if enabled
  if (u_aspectCorrection > 0.5) {
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x = (uv.x - 0.5) * aspectRatio + 0.5;
  }

  vec2 center = vec2(0.5);

  // Apply rotation
  vec2 p = rotate(uv - center, u_rotation);

  float sdf = 0.0;

  if (u_shape < 0.5) {
    // Circle
    sdf = sdCircle(p, u_size);
  } else if (u_shape < 1.5) {
    // Square
    sdf = sdBox(p, vec2(u_size));
  } else if (u_shape < 2.5) {
    // Rectangle
    sdf = sdBox(p, vec2(u_size * 1.5, u_size * 0.75));
  } else {
    // Hexagon
    sdf = sdHexagon(p, u_size);
  }

  // Convert SDF to mask
  float mask = 1.0 - smoothstep(0.0, u_smoothness, sdf);

  vec3 color = mix(vec3(0.05), u_color, mask);

  gl_FragColor = vec4(color, 1.0);
}