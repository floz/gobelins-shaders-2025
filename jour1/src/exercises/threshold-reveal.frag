// SHADER 12: THRESHOLD REVEAL - Masques et révélation progressive
// =================================================================
// CONCEPTS APPRIS:
// - Création de masques avec seuillage
// - Révélation progressive de textures
// - Différents patterns de révélation
// - FBM pour effets organiques
// - Transitions dures vs douces
// - Inversion de masques
//
// MODES DE RÉVÉLATION:
// 0. Dissolution par bruit: effet organique aléatoire
// 1. Gradient radial: du centre vers l'extérieur
// 2. Gradient horizontal: de gauche à droite
// 3. Gradient vertical: de bas en haut
// 4. Gradient diagonal: coin à coin
// 5. Spirale: révélation en spirale
// 6. Diamond: pattern en diamant
// 7. Wave: révélation ondulée
//
// TECHNIQUES:
// - FBM pour bruit organique multi-échelle
// - smoothstep vs step pour contrôler la douceur
// - Patterns géométriques pour révélation
// - Animation du seuil pour effet temporel
//
// APPLICATIONS:
// - Transitions entre scènes
// - Effets de dissolution
// - Révélation de texte/images
// - Masques dynamiques
//
// EXERCICES:
// - Créez un pattern de révélation en grille
// - Combinez plusieurs modes simultanément
// - Utilisez le masque pour mélanger 2 textures

precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform float u_threshold;
uniform float u_revealMode;
uniform float u_smoothness;
uniform float u_animate;
uniform float u_speed;
uniform float u_noiseScale;
uniform float u_invert;
uniform float u_aspectCorrection;

#define PI 3.14159265359

// Simple 2D noise function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// FBM (Fractal Brownian Motion) for more organic noise
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
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

    // Get the threshold value
    float threshold = u_threshold;
    if (u_animate > 0.5) {
        threshold = sin(u_time * u_speed) * 0.5 + 0.5;
    }

    // Generate the reveal pattern based on mode
    float revealValue = 0.0;

    if (u_revealMode < 0.5) {
        // Mode 0: Noise dissolution
        revealValue = fbm(uv * u_noiseScale + u_time * u_speed * 0.1);

    } else if (u_revealMode < 1.5) {
        // Mode 1: Radial gradient (center to edges)
        vec2 center = uv - 0.5;
        revealValue = 1.0 - length(center) * 1.414;

    } else if (u_revealMode < 2.5) {
        // Mode 2: Horizontal gradient
        revealValue = uv.x;

    } else if (u_revealMode < 3.5) {
        // Mode 3: Vertical gradient
        revealValue = uv.y;

    } else if (u_revealMode < 4.5) {
        // Mode 4: Diagonal gradient
        revealValue = (uv.x + uv.y) * 0.5;

    } else if (u_revealMode < 5.5) {
        // Mode 5: Spiral reveal
        vec2 center = uv - 0.5;
        float angle = atan(center.y, center.x) / (2.0 * PI) + 0.5;
        float radius = length(center);
        revealValue = fract(angle * 3.0 - radius * 2.0 + u_time * u_speed * 0.2);

    } else if (u_revealMode < 6.5) {
        // Mode 6: Diamond pattern
        vec2 center = abs(uv - 0.5);
        revealValue = 1.0 - (center.x + center.y);

    } else {
        // Mode 7: Wave reveal
        revealValue = sin(uv.x * 10.0 + u_time * u_speed) * 0.5 + 0.5;
    }

    // Invert the reveal value if needed
    if (u_invert > 0.5) {
        revealValue = 1.0 - revealValue;
    }

    // Create the mask using threshold
    float mask;
    if (u_smoothness > 0.001) {
        // Use smoothstep for soft transitions
        mask = smoothstep(threshold - u_smoothness, threshold + u_smoothness, revealValue);
    } else {
        // Use step for hard transitions
        mask = step(threshold, revealValue);
    }

    // Sample the texture
    vec3 textureColor = texture2D(u_texture, vUv).rgb;

    // Apply the mask to reveal the texture
    vec3 finalColor = textureColor * mask;

    // Optional: Add a subtle background color for unrevealed areas
    vec3 backgroundColor = vec3(0.05, 0.05, 0.1);
    finalColor = mix(backgroundColor, textureColor, mask);

    gl_FragColor = vec4(finalColor, 1.0);
}