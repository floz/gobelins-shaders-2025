// SHADER 01: UV HEATMAP - Les fondamentaux
// ==========================================
// CONCEPTS APPRIS:
// - Les coordonnées UV (texture coordinates) vont de 0 à 1
// - vUv.x représente la position horizontale (U)
// - vUv.y représente la position verticale (V)
// - Les canaux de couleur RGB peuvent être contrôlés indépendamment
// - Comment visualiser les données sous forme de couleurs
//
// EXERCICES:
// - Essayez de créer un dégradé diagonal
// - Inversez les coordonnées (1.0 - vUv)
// - Multipliez les UV pour créer des répétitions

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
  
  vec2 uv = vUv;
  uv.x *= 10.;
  // uv.x = mod( uv.x, 1.);
  uv.x = fract( uv.x );
  if (u_mode < 0.5) {
    // Show U coordinate in red
    color.r = uv.x;
  } else if (u_mode < 1.5) {
    // Show V coordinate in green
    color.g = uv.y;
  } else {
    // Show both UV coordinates
    color.rg = uv;
  }
  
  gl_FragColor = vec4(color, 1.0);
}