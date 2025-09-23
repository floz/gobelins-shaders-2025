// SHADER 03: STEP VS SMOOTH - Transitions et seuillage
// =====================================================
// CONCEPTS APPRIS:
// - step(): transition brutale (0 ou 1)
// - smoothstep(): transition douce avec antialiasing
// - Différence entre transitions dures et douces
// - Contrôle de la netteté des bords
// - Animation de seuils
//
// APPLICATIONS:
// - Création de masques
// - Antialiasing manuel
// - Effets de révélation
// - Transitions douces entre états
//
// EXERCICES:
// - Créez un cercle avec step() puis smoothstep()
// - Utilisez plusieurs seuils pour créer des bandes
// - Combinez avec du bruit pour des bords organiques

precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_threshold;
uniform float u_smoothness;
uniform float u_mode;
uniform float u_animate;

void main() {
  vec2 uv = vUv;
  
  // Animate threshold if enabled
  float threshold = u_threshold;
  if (u_animate > 0.5) {
    threshold = sin(u_time) * 0.3 + 0.5;
  }
  
  float value = uv.x;
  float result = 0.0;
  
  if (u_mode < 0.5) {
    // Step function only
    result = step(threshold, value);
  } else if (u_mode < 1.5) {
    // Smoothstep function only
    result = smoothstep(threshold - u_smoothness, threshold + u_smoothness, value);
  } else {
    // Both - split screen
    if (uv.y < 0.5) {
      result = step(threshold, value);
    } else {
      result = smoothstep(threshold - u_smoothness, threshold + u_smoothness, value);
    }
    
    // Add divider line
    float divider = 1.0 - step(0.002, abs(uv.y - 0.5));
    result = mix(result, 0.5, divider);
  }
  
  // Visualize threshold position
  float thresholdLine = 1.0 - step(0.002, abs(uv.x - threshold));
  vec3 color = vec3(result);
  color = mix(color, vec3(1.0, 0.3, 0.3), thresholdLine * 0.5);
  
  gl_FragColor = vec4(color, 1.0);
}