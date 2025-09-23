// SHADER 02: GRADIENT - Interpolation et mélange
// ===============================================
// CONCEPTS APPRIS:
// - La fonction mix() pour interpoler entre deux valeurs
// - Création de gradients linéaires et radiaux
// - Utilisation de dot product pour projeter des vecteurs
// - distance() pour calculer la distance entre deux points
// - clamp() pour limiter les valeurs entre 0 et 1
// - Transformation de direction avec cos/sin
//
// TECHNIQUES:
// - Gradient linéaire: projection sur un vecteur direction
// - Gradient radial: distance depuis un centre
// - Rotation du gradient avec angle
//
// EXERCICES:
// - Créez un gradient carré (utilisez max(abs(x), abs(y)))
// - Ajoutez plusieurs couleurs (gradient multi-stops)
// - Animez la transition entre linéaire et radial

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

  vec2 center = vec2(0.5);
  vec2 dist = abs(uv - center);
  // Mélange entre carré (max) et cercle (length) pour arrondir
  float squareDist = max(dist.x, dist.y);
  float circleDist = length(dist);
  t = mix(squareDist, circleDist, sin(u_time)) * 2.0; // 0.3 contrôle l'arrondi
  t = clamp(t, 0.0, 1.0);
  t = step( t, .5 );
  vec3 color = mix(u_colorA, u_colorB, t);

  // =========================================
  // SOLUTIONS DES EXERCICES
  // =========================================

  // -----------------------------------------
  // EXERCICE 1: Gradient carré
  // -----------------------------------------
  // Utilise la distance de Chebyshev (max des distances sur chaque axe)
  // au lieu de la distance euclidienne

  // VERSION 1: Gradient carré simple
  /*
  vec2 center = vec2(0.5);
  vec2 dist = abs(uv - center);
  t = max(dist.x, dist.y) * 2.0; // Distance de Chebyshev
  t = clamp(t, 0.0, 1.0);
  color = mix(u_colorA, u_colorB, t);
  */

  // VERSION 2: Gradient carré avec coins arrondis
  /*
  vec2 center = vec2(0.5);
  vec2 dist = abs(uv - center);
  // Mélange entre carré (max) et cercle (length) pour arrondir
  float squareDist = max(dist.x, dist.y);
  float circleDist = length(dist);
  t = mix(squareDist, circleDist, 0.3) * 2.0; // 0.3 contrôle l'arrondi
  t = clamp(t, 0.0, 1.0);
  color = mix(u_colorA, u_colorB, t);
  */

  // VERSION 3: Gradient diamant (Manhattan distance)
  /*
  vec2 center = vec2(0.5);
  vec2 dist = abs(uv - center);
  t = (dist.x + dist.y); // Distance de Manhattan
  t = clamp(t, 0.0, 1.0);
  color = mix(u_colorA, u_colorB, t);
  */

  // -----------------------------------------
  // EXERCICE 2: Gradient multi-stops
  // -----------------------------------------
  // Ajoute plusieurs couleurs intermédiaires dans le gradient

  // VERSION 1: 3 couleurs avec stops fixes
  /*
  vec3 colorC = vec3(1.0, 1.0, 0.0); // Jaune au milieu

  if (t < 0.5) {
    // Première moitié: de colorA à colorC
    color = mix(u_colorA, colorC, t * 2.0);
  } else {
    // Deuxième moitié: de colorC à colorB
    color = mix(colorC, u_colorB, (t - 0.5) * 2.0);
  }
  */

  // VERSION 2: 4 couleurs avec transitions douces
  /*
  vec3 color1 = u_colorA;
  vec3 color2 = vec3(1.0, 0.0, 0.5); // Magenta
  vec3 color3 = vec3(0.0, 1.0, 0.5); // Cyan
  vec3 color4 = u_colorB;

  if (t < 0.333) {
    color = mix(color1, color2, t * 3.0);
  } else if (t < 0.666) {
    color = mix(color2, color3, (t - 0.333) * 3.0);
  } else {
    color = mix(color3, color4, (t - 0.666) * 3.0);
  }
  */

  // VERSION 3: Arc-en-ciel (utilise sin pour créer des bandes)
  /*
  color.r = sin(t * 3.14159) * 0.5 + 0.5;
  color.g = sin(t * 3.14159 + 2.094) * 0.5 + 0.5; // +120 degrés
  color.b = sin(t * 3.14159 + 4.188) * 0.5 + 0.5; // +240 degrés
  // Mélange avec les couleurs originales
  color = mix(color, mix(u_colorA, u_colorB, t), 0.5);
  */

  // VERSION 4: Gradient avec fonction smoothstep pour transitions
  /*
  vec3 color1 = u_colorA;
  vec3 color2 = vec3(1.0, 0.5, 0.0); // Orange
  vec3 color3 = vec3(0.5, 0.0, 1.0); // Violet
  vec3 color4 = u_colorB;

  // Utilise smoothstep pour des transitions plus douces
  float s1 = smoothstep(0.0, 0.33, t);
  float s2 = smoothstep(0.33, 0.66, t);
  float s3 = smoothstep(0.66, 1.0, t);

  color = mix(color1, color2, s1);
  color = mix(color, color3, s2);
  color = mix(color, color4, s3);
  */

  // -----------------------------------------
  // EXERCICE 3: Animation entre linéaire et radial
  // -----------------------------------------
  // Transition fluide entre les deux types de gradients

  // VERSION 1: Transition simple avec sin
  /*
  float transition = sin(u_time) * 0.5 + 0.5; // Oscille entre 0 et 1

  // Calcule les deux gradients
  vec2 center = vec2(0.5);
  float radialT = distance(uv, center) * 2.0;

  vec2 dir = vec2(cos(u_angle), sin(u_angle));
  float linearT = dot(uv - 0.5, dir) + 0.5;

  // Mélange entre les deux
  t = mix(linearT, radialT, transition);
  t = clamp(t, 0.0, 1.0);
  color = mix(u_colorA, u_colorB, t);
  */

  // VERSION 2: Morphing avec rotation
  /*
  float morphTime = u_time * 0.5;
  float morph = sin(morphTime) * 0.5 + 0.5;

  // Gradient linéaire qui tourne
  vec2 dir = vec2(cos(u_angle + morphTime), sin(u_angle + morphTime));
  float linearT = dot(uv - 0.5, dir) + 0.5;

  // Gradient radial qui pulse
  vec2 center = vec2(0.5);
  float radialT = distance(uv, center * (1.0 + sin(morphTime * 2.0) * 0.2)) * 2.0;

  t = mix(linearT, radialT, morph);
  t = clamp(t, 0.0, 1.0);
  color = mix(u_colorA, u_colorB, t);
  */

  // VERSION 3: Transition avec effet de spiral
  /*
  float transition = sin(u_time * 0.7) * 0.5 + 0.5;

  // Gradient spiral (mélange de radial et angulaire)
  vec2 center = vec2(0.5);
  vec2 delta = uv - center;
  float angle = atan(delta.y, delta.x);
  float radius = length(delta);

  // Combine angle et radius pour créer une spirale
  float spiralT = fract(angle / (2.0 * 3.14159) + radius * 3.0 - u_time * 0.2);

  // Gradient linéaire standard
  vec2 dir = vec2(cos(u_angle), sin(u_angle));
  float linearT = dot(uv - 0.5, dir) + 0.5;

  t = mix(linearT, spiralT, transition);
  color = mix(u_colorA, u_colorB, t);
  */

  // VERSION 4: Multi-gradient avec animation
  /*
  float time = u_time * 0.3;

  // Calcule 4 types de gradients
  vec2 center = vec2(0.5);
  float radial = distance(uv, center) * 2.0;
  float square = max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0;
  float diamond = abs(uv.x - 0.5) + abs(uv.y - 0.5);

  vec2 dir = vec2(cos(u_angle), sin(u_angle));
  float linear = dot(uv - 0.5, dir) + 0.5;

  // Sélectionne le gradient basé sur le temps
  float selector = mod(time, 4.0);
  if (selector < 1.0) {
    t = mix(linear, radial, fract(selector));
  } else if (selector < 2.0) {
    t = mix(radial, square, fract(selector));
  } else if (selector < 3.0) {
    t = mix(square, diamond, fract(selector));
  } else {
    t = mix(diamond, linear, fract(selector));
  }

  t = clamp(t, 0.0, 1.0);
  color = mix(u_colorA, u_colorB, t);
  */

  gl_FragColor = vec4(color, 1.0);
}