// // SHADER 14: HELLO WORLD - Exemple complexe avancé
// // =================================================
// // CONCEPTS COMBINÉS:
// // - Simplex noise implémentation complète
// // - Déformations UV multiples et chaînées
// // - Utilisation de textures externes
// // - Animations complexes avec sin/cos
// // - Effets de distorsion radiale
// // - Contraste ajustable
// //
// // CE SHADER DÉMONTRE:
// // - Comment combiner plusieurs techniques
// // - Chaînage de transformations UV
// // - Utilisation du bruit pour effets organiques
// // - Animation fluide multi-couches
// // - Déformation basée sur la distance au centre
// //
// // ANALYSE DU CODE:
// // - Ligne 62: rotation UV avec cos/sin + time
// // - Ligne 63: déformation horizontale selon distance
// // - Ligne 64: déformation verticale avec puissance
// // - Ligne 65: ajout de bruit pour organicité
// // - Ligne 66: calcul de distance pour effet radial
// // - Ligne 67: répétition fractale
// //
// // NOTE: Ce shader est intentionnellement complexe
// // pour montrer l'accumulation de techniques.
// // En production, privilégiez la lisibilité!
// //
// // EXERCICES:
// // - Décomposez chaque transformation séparément
// // - Simplifiez pour comprendre chaque effet
// // - Reconstruisez étape par étape

// precision highp float;

// #import("kaleidoscope")

// varying vec2 vUv;
// uniform float u_time;
// uniform float u_contrast;
// uniform sampler2D u_texture;
// uniform vec2 u_resolution;

// #define PI 3.14159265359



// // Simplex noise helpers
// vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
// vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
// vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

// // Simplex noise
// float simplexNoise(vec2 v) {
//   const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
//                       0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
//                      -0.577350269189626,  // -1.0 + 2.0 * C.x
//                       0.024390243902439); // 1.0 / 41.0

//   // First corner
//   vec2 i  = floor(v + dot(v, C.yy));
//   vec2 x0 = v - i + dot(i, C.xx);

//   // Other corners
//   vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//   vec4 x12 = x0.xyxy + C.xxzz;
//   x12.xy -= i1;

//   // Permutations
//   i = mod289(i);
//   vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
//                           + i.x + vec3(0.0, i1.x, 1.0));

//   vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
//   m = m*m;
//   m = m*m;

//   // Gradients
//   vec3 x = 2.0 * fract(p * C.www) - 1.0;
//   vec3 h = abs(x) - 0.5;
//   vec3 ox = floor(x + 0.5);
//   vec3 a0 = x - ox;

//   // Normalize gradients
//   m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

//   // Compute final value
//   vec3 g;
//   g.x  = a0.x * x0.x + h.x * x0.y;
//   g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//   return 130.0 * dot(m, g) * 0.5 + 0.5;
// }

// void main() {
//   vec2 uv = vUv;

//   // uv.y += cos( uv.x * 10. ) * .2;
//   // float distFromCenter = 1. - length(uv.y - .5 );
//   // // float line = step( .998, distFromCenter );
//   // float line = step( .998, distFromCenter );
//   // gl_FragColor = vec4( vec3( line ), 1. );

//   // float aspectRatio = u_resolution.x / u_resolution.y;
//   // uv.x = (uv.x - 0.5) * aspectRatio + 0.5;

//   // Calculate grid lines
//     vec2 grid = abs(fract(uv * 2. - 0.5 ) - 0.5 );
//     vec2 gridLines = smoothstep(.0, .001, grid);
//     gl_FragColor = vec4(vec3(min(gridLines.x, gridLines.y)), 1.);

//   float circle = length(uv - .5 ) * .5;
//   // circle = step(0.5, circle);
//   circle = 1. - smoothstep(0.099, 0.1, circle);
//   gl_FragColor.rgb = mix( gl_FragColor.rgb, vec3(circle), circle );
//   // gl_FragColor = vec4(vec3(circle), 1.);

// 	// vec2 uvKaleid = kaleidoscopeRotate( uv, 6., .5 );
// 	// vec4 tex = texture2D( u_texture, uvKaleid );
// 	// gl_FragColor = tex;

// /////
// 	// // uv = cos( uv * 2.0 * PI + u_time ) * 0.5 + 0.5;
// 	// uv.x += .2 * cos( u_time ) * length( uv - 0.5 );
// 	// float noise = simplexNoise( uv * 3.0 + u_time * 0.1 );
// 	// uv.y += pow( .4 * sin( uv.x + u_time * .41 )* length( uv - 0.5 ), 3. );
// 	// uv += max( 0., noise * .8 );
// 	// float d = length( abs(uv)-.3 );
// 	// uv += fract( d * 10. );
// 	// // uv.y += pow( sin( uv.y ), 4. );
// 	// vec4 tex = texture2D( u_texture, uv );

// 	// // Apply contrast adjustment
// 	// float noiseTest = noise;
//   // noiseTest = (noiseTest - 0.5) * u_contrast + 0.5;
//   // noiseTest = clamp(noiseTest, 0.0, 1.0);

//   // gl_FragColor = vec4( uv, 0., 1. );
//   // gl_FragColor = vec4( vec3( noiseTest ), 1. );
// }

precision highp float;

uniform float u_time;
uniform vec3 u_color;
uniform sampler2D u_texture;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

// gl_FragColor = vec4( uv.y, 0., 0., 1. );
// gl_FragColor = vec4( uv.x, uv.y, 0., 1. );
// gl_FragColor = vec4( uv, 0., 1. );
  // gl_FragColor = vec4(u_color, 1.0);
  // uv.x *= .15;
  // uv = fract( uv * 10. );
  // float linesX = step( uv.x, .1 );
  // float linesY = step( uv.y, .1 );
  // float lines = max( linesX, linesY );
  uv.x += sin( uv.x * 20. + u_time ) * .1;
  uv.y += cos( uv.x * .2 + u_time * 10. ) * .1;
  // float linesC = step( uv.x, .1 );
  // uv.x += abs( sin( uv.y * .5 ) );
  // uv.x *= abs( cos( uv.x * .5 + u_time ) );
  uv = mod( uv, 2. );

  // gl_FragColor = vec4( uv.x, 0., 0., 1. );
  // gl_FragColor = vec4( vec3( lines ), 1. );
  gl_FragColor = texture2D( u_texture, uv );
}