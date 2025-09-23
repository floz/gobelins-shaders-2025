// SHADER 06: GRID - Patterns répétitifs et modulo
// =================================================
// CONCEPTS APPRIS:
// - fract(): répétition de motifs (partie fractionnaire)
// - mod(): opération modulo pour patterns cycliques
// - Création de grilles avec mathématiques simples
// - Différents types de grilles (lignes, points, hexagones)
// - Animation de patterns
//
// TECHNIQUES CLÉS:
// - fract(uv * gridSize): divise l'espace en cellules
// - abs(fract(x - 0.5) - 0.5): crée des lignes
// - length(cellCenter - 0.5): points aux intersections
// - step() et smoothstep() pour le rendu
//
// MODES IMPLÉMENTÉS:
// - Grille standard
// - Points aux intersections
// - Lignes pointillées
// - Grille diagonale
// - Grille hexagonale
// - Crosshatch
// - Grille circulaire/polaire
//
// EXERCICES:
// - Créez une grille triangulaire
// - Ajoutez de la couleur par cellule
// - Déformez la grille avec du bruit

precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_gridSize;
uniform float u_lineWidth;
uniform vec3 u_lineColor;
uniform vec3 u_bgColor;
uniform float u_gridMode;
uniform float u_animate;
uniform float u_dotSize;
uniform float u_smoothness;
uniform float u_aspectCorrection;

#define PI 3.14159265359

void main() {
    vec2 uv = vUv;

    // Apply aspect ratio correction if enabled
    if (u_aspectCorrection > 0.5) {
        float aspectRatio = u_resolution.x / u_resolution.y;
        uv.x = (uv.x - 0.5) * aspectRatio + 0.5;
    }

    // Animate the grid if enabled
    vec2 animatedUV = uv;
    if (u_animate > 0.5) {
        animatedUV += vec2(u_time * 0.05, u_time * 0.03);
    }

    // Scale UV by grid size
    vec2 gridUV = animatedUV * u_gridSize;

    // Calculate grid lines
    vec2 grid = abs(fract(gridUV - 0.5) - 0.5);
    vec2 gridLines = smoothstep(u_lineWidth, u_lineWidth + u_smoothness, grid);

    // Initialize color with background
    vec3 color = u_bgColor;

    if (u_gridMode < 0.5) {
        // Mode 0: Standard grid lines
        float lines = min(gridLines.x, gridLines.y);
        color = mix(u_lineColor, u_bgColor, lines);

    } else if (u_gridMode < 1.5) {
        // Mode 1: Dots at intersections
        vec2 cellCenter = fract(gridUV);
        float dist = length(cellCenter - 0.5);
        float dot = smoothstep(u_dotSize + u_smoothness, u_dotSize, dist);
        color = mix(u_bgColor, u_lineColor, dot);

    } else if (u_gridMode < 2.5) {
        // Mode 2: Dashed lines
        vec2 dash = step(0.5, fract(gridUV * 4.0));
        float dashMask = dash.x * dash.y;
        float lines = min(gridLines.x, gridLines.y);
        vec3 gridColor = mix(u_lineColor, u_bgColor, lines);
        color = mix(gridColor, u_bgColor, dashMask * (1.0 - lines));

    } else if (u_gridMode < 3.5) {
        // Mode 3: Diagonal grid
        vec2 diagUV1 = vec2(gridUV.x + gridUV.y, gridUV.x - gridUV.y) * 0.707;
        vec2 diagGrid = abs(fract(diagUV1 - 0.5) - 0.5);
        vec2 diagLines = smoothstep(u_lineWidth, u_lineWidth + u_smoothness, diagGrid);
        float lines = min(diagLines.x, diagLines.y);
        color = mix(u_lineColor, u_bgColor, lines);

    } else if (u_gridMode < 4.5) {
        // Mode 4: Hexagonal grid (approximation)
        vec2 hexUV = gridUV;
        float hex1 = abs(fract(hexUV.x) - 0.5);
        float hex2 = abs(fract(hexUV.y + hexUV.x * 0.5) - 0.5);
        float hex3 = abs(fract(hexUV.y - hexUV.x * 0.5) - 0.5);

        float hexLines = min(min(
            smoothstep(u_lineWidth, u_lineWidth + u_smoothness, hex1),
            smoothstep(u_lineWidth, u_lineWidth + u_smoothness, hex2)
        ), smoothstep(u_lineWidth, u_lineWidth + u_smoothness, hex3));

        color = mix(u_lineColor, u_bgColor, hexLines);

    } else if (u_gridMode < 5.5) {
        // Mode 5: Crosshatch pattern
        float lines = min(gridLines.x, gridLines.y);
        vec2 diagUV = vec2(gridUV.x + gridUV.y, gridUV.x - gridUV.y) * 0.707;
        vec2 diagGrid = abs(fract(diagUV - 0.5) - 0.5);
        vec2 diagLines = smoothstep(u_lineWidth * 0.7, u_lineWidth * 0.7 + u_smoothness, diagGrid);
        float diagonals = min(diagLines.x, diagLines.y);

        color = mix(u_lineColor, u_bgColor, lines * diagonals);

    } else if (u_gridMode < 6.5) {
        // Mode 6: Circular grid
        vec2 center = vec2(0.5);
        float dist = length(uv - center);
        float circles = abs(fract(dist * u_gridSize) - 0.5);
        float circleLines = smoothstep(u_lineWidth, u_lineWidth + u_smoothness, circles);

        // Add radial lines
        float angle = atan(uv.y - 0.5, uv.x - 0.5);
        float radials = abs(fract(angle * u_gridSize / (2.0 * PI)) - 0.5);
        float radialLines = smoothstep(u_lineWidth, u_lineWidth + u_smoothness, radials);

        float allLines = min(circleLines, radialLines);
        color = mix(u_lineColor, u_bgColor, allLines);

    } else {
        // Mode 7: Plus signs at intersections
        vec2 cellPos = fract(gridUV);
        vec2 cellCenter = abs(cellPos - 0.5);

        float plusH = step(cellCenter.y, u_lineWidth) * step(cellCenter.x, 0.2);
        float plusV = step(cellCenter.x, u_lineWidth) * step(cellCenter.y, 0.2);
        float plus = max(plusH, plusV);

        color = mix(u_bgColor, u_lineColor, plus);
    }

    // Add subtle gradient for depth
    float vignette = 1.0 - length(uv - 0.5) * 0.3;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
}