// SHADER 15: CURL FLOW - Flux dynamique avec curl noise
// =======================================================
// CONCEPTS APPRIS:
// - Curl noise: champ de vecteurs sans divergence
// - Création de flux/écoulements naturels
// - Advection de particules (simulation)
// - Déformation fluide des UV
// - Visualisation de champs de forces
// - Combinaison avec des textures
//
// QU'EST-CE QUE LE CURL NOISE?
// - Dérivé du rotationnel (curl) d'un champ de bruit
// - Crée des vecteurs qui ne divergent jamais
// - Parfait pour simuler fluides et turbulences
// - Pas de "sources" ou "puits" dans le flux
//
// APPLICATIONS:
// - Effets de fumée et vapeur
// - Distorsion d'eau et liquides
// - Patterns de marbre organique
// - Effets de vent et particules
//
// EXERCICES:
// - Créez un effet de fumée colorée
// - Appliquez le curl noise à une texture
// - Simulez des courants marins
// - Combinez avec du FBM pour plus de détails

precision highp float;

#import("curl-noise")
#import("color")
#import("random")

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_scale;
uniform float u_speed;
uniform float u_strength;
uniform float u_visualizeFlow;
uniform float u_advectionSteps;
uniform float u_colorMix;
uniform sampler2D u_texture;

void main() {
  vec2 uv = vUv;

  // Scale pour le noise
  vec2 noiseCoord = uv * u_scale;

  // Animation temporelle
  float t = u_time * u_speed;

  // Calcul du curl noise 2D avec animation temporelle
  vec2 animatedCoord = noiseCoord + vec2(t * 0.1, t * 0.05);
  vec2 curl = curlNoise2D(animatedCoord, 0.01);

  // Advection: on suit le flux
  vec2 flowUV = uv;
  float stepSize = u_strength * 0.01;

  for(int i = 0; i < 10; i++) {
    if(float(i) >= u_advectionSteps) break;
    vec2 flowCoord = flowUV * u_scale + vec2(t * 0.1, t * 0.05);
    vec2 flow = curlNoise2D(flowCoord, 0.01);
    flowUV += flow * stepSize;
  }

  // Couleur de base depuis le flux
  float flowIntensity = length(curl);
  vec3 flowColor = vec3(flowIntensity);

  // Coloration artistique basée sur la direction
  if(u_colorMix > 0.0) {
    float angle = atan(curl.y, curl.x);
    vec3 color1 = hsv2rgb(vec3(angle * 0.15 + 0.5, 0.8, 0.9));
    vec3 color2 = hsv2rgb(vec3(angle * 0.15 + t * 0.1, 0.6, 1.0));
    flowColor = mix(flowColor, mix(color1, color2, flowIntensity), u_colorMix);
  }

  // Visualisation optionnelle des lignes de flux
  if(u_visualizeFlow > 0.0) {
    // Créer des lignes dans la direction du flux
    float linePattern = sin(dot(uv * 20.0, normalize(curl))) * 0.5 + 0.5;
    linePattern = pow(linePattern, 3.0);
    flowColor = mix(flowColor, vec3(linePattern), u_visualizeFlow * 0.5);
  }

  // Application de la distorsion sur une texture si disponible
  vec3 textureColor = vec3(1.0);
  #ifdef HAS_TEXTURE
    textureColor = texture2D(u_texture, flowUV).rgb;
    flowColor = mix(flowColor, textureColor, 0.7);
  #endif

  gl_FragColor = vec4(flowColor, 1.0);
}