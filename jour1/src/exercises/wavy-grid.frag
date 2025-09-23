// SHADER 10: WAVY GRID - Combinaison complexe de techniques
// ==========================================================
// CONCEPTS APPRIS:
// - Combinaison de multiples techniques (grilles + waves + bruit)
// - FBM personnalisé (Fractal Brownian Motion)
// - Superposition de fonctions d'onde
// - Grilles déformées horizontales ET verticales
// - Effets d'intersection entre lignes
// - Variation de couleur procédurale
//
// TECHNIQUES AVANCÉES:
// - Multiples ondes sinusoïdales combinées
// - Bruit multi-octave pour mouvement organique
// - Jitter pour aspect fait main
// - Intersections mises en valeur
// - Vignettage pour la profondeur
//
// STRUCTURE:
// 1. Fonction d'onde complexe (3 sinus combinés)
// 2. Ajout de bruit FBM pour organicité
// 3. Dessin de lignes horizontales ondulées
// 4. Dessin de lignes verticales ondulées
// 5. Mise en valeur des intersections
// 6. Post-processing (vignette, variations)
//
// EXERCICES:
// - Créez des patterns de vagues différents
// - Ajoutez de la rotation aux vagues
// - Implémentez un effet de distorsion radiale

precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_lineJitter;
uniform float u_lineWidth;
uniform float u_gridSpacing;
uniform float u_waveAmplitude;
uniform float u_waveFrequency;
uniform float u_noiseScale;
uniform float u_speed;
uniform vec3 u_lineColor;
uniform vec3 u_bgColor;
uniform float u_animate;
uniform float u_smoothness;

#define PI 3.14159265359

// Random function
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// 2D Noise function
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// Multi-octave noise for more organic movement
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 3; i++) {
        value += amplitude * noise(st * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }

    return value;
}

// Function that defines the wave pattern
float waveFunction(float x, float time) {
    // Combine multiple sine waves for complex pattern
    float wave = sin(x * u_waveFrequency * 2.0 + time) * 0.3;
    wave += sin(x * u_waveFrequency * 3.7 - time * 0.7) * 0.2;
    wave += cos(x * u_waveFrequency * 1.3 + time * 1.2) * 0.15;

    // Add noise-based displacement
    float noiseValue = fbm(vec2(x * u_noiseScale, time * 0.3)) - 0.5;
    wave += noiseValue * u_lineJitter;

    return wave * u_waveAmplitude;
}

// Draw a single wavy line
float drawWavyLine(vec2 st, float yBase, float time) {
    // Calculate the y position of the wave at this x coordinate
    float waveY = yBase + waveFunction(st.x, time);

    // Add some jitter to the line for organic feel
    float jitter = (noise(vec2(st.x * 50.0, yBase * 10.0 + time)) - 0.5) * u_lineJitter * 0.02;
    waveY += jitter;

    // Calculate distance to the wave
    float dist = abs(st.y - waveY);

    // Create the line with smooth edges
    float line = smoothstep(u_lineWidth + u_smoothness, u_lineWidth, dist);

    return line;
}

// Draw vertical wavy lines
float drawVerticalWaves(vec2 st, float time) {
    float lines = 0.0;

    // Fixed number of vertical lines
    const int maxLines = 20;

    for (int i = 0; i < maxLines; i++) {
        float linePos = float(i) * u_gridSpacing;

        // Skip lines outside the viewport
        if (linePos > 1.0) break;

        // Calculate the x position of the wave at this y coordinate
        float waveX = waveFunction(st.y, time + float(i) * 0.1);

        // Add jitter
        float jitter = (noise(vec2(st.y * 50.0, linePos * 10.0 + time)) - 0.5) * u_lineJitter * 0.02;
        waveX += jitter;

        float dist = abs(st.x - (linePos + waveX));
        lines = max(lines, smoothstep(u_lineWidth + u_smoothness, u_lineWidth, dist));
    }

    return lines;
}

void main() {
    vec2 st = vUv;

    // Animation time
    float time = u_animate > 0.5 ? u_time * u_speed : 0.0;

    // Draw horizontal wavy lines
    float horizontalLines = 0.0;
    const int maxLines = 20;

    for (int i = 0; i < maxLines; i++) {
        float yPos = float(i) * u_gridSpacing;

        // Skip lines outside the viewport
        if (yPos > 1.0) break;

        horizontalLines = max(horizontalLines, drawWavyLine(st, yPos, time + float(i) * 0.1));
    }

    // Draw vertical wavy lines
    float verticalLines = drawVerticalWaves(st, time);

    // Combine horizontal and vertical lines
    float allLines = max(horizontalLines, verticalLines);

    // Create grid intersections effect
    float intersections = horizontalLines * verticalLines;
    allLines = max(allLines, intersections * 1.5);

    // Apply colors
    vec3 color = mix(u_bgColor, u_lineColor, allLines);

    // Add subtle gradient for depth
    float vignette = 1.0 - length(st - 0.5) * 0.4;
    color *= mix(0.9, 1.0, vignette);

    // Add slight color variation based on wave position
    if (allLines > 0.1) {
        float colorShift = fbm(st * 10.0 + time * 0.1) * 0.1;
        color += vec3(colorShift, -colorShift * 0.5, colorShift * 0.8) * 0.2;
    }

    gl_FragColor = vec4(color, 1.0);
}