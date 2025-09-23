// SHADER 04: SINWAVE - Fonctions trigonométriques animées
// ========================================================
// CONCEPTS APPRIS:
// - Utilisation de sin() pour créer des ondulations
// - Paramètres d'onde: fréquence, amplitude, phase
// - Animation temporelle avec u_time
// - Création de lignes avec smoothstep()
// - Distance à une courbe
//
// FORMULE CLÉ:
// wave = sin(x * frequency + time * speed) * amplitude
//
// TECHNIQUES:
// - Moduler la position Y avec sin()
// - Utiliser abs() pour la distance à la courbe
// - smoothstep() pour l'épaisseur de ligne
//
// EXERCICES:
// - Ajoutez plusieurs ondes superposées
// - Créez une onde carrée avec sign(sin())
// - Modulez l'épaisseur selon la position

precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_freq;
uniform float u_amp;
uniform float u_speed;
uniform float u_thickness;
uniform vec3 u_colorA;
uniform vec3 u_colorB;

void main() {
  vec2 uv = vUv;
  
  // Calculate sin wave
  float wave = sin(uv.x * u_freq + u_time * u_speed) * u_amp + 0.5;
  
  // Create line from wave
  float line = smoothstep(u_thickness, 0.0, abs(uv.y - wave));
  
  // Mix colors based on horizontal position
  vec3 color = mix(u_colorA, u_colorB, uv.x);
  
  // Apply line
  color *= line;
  
  // Add subtle background gradient
  vec3 bg = mix(u_colorA, u_colorB, uv.x) * 0.1;
  color = mix(bg, color, line);
  
  gl_FragColor = vec4(color, 1.0);
}