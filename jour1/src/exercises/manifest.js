import textureUrl from '/assets/lapin.png';
import { Vec2 } from 'ogl';

// Import all shader files as text modules
import uvHeatmapFrag from './uv-heatmap.frag?raw';
import gradientFrag from './gradient.frag?raw';
import sinwaveFrag from './sinwave.frag?raw';
import stepVsSmoothFrag from './step-vs-smooth.frag?raw';
import shapesFrag from './shapes.frag?raw';
import noiseIntroFrag from './noise-intro.frag?raw';
import mixBlendFrag from './mix-blend.frag?raw';
import kaleidoscopeFrag from './kaleidoscope.frag?raw';
import noiseLinesFrag from './noise-lines.frag?raw';
import textureWarpFrag from './texture-warp.frag?raw';
import helloworldFrag from './helloworld.frag?raw';
import thresholdRevealFrag from './threshold-reveal.frag?raw';
import gridFrag from './grid.frag?raw';
import wavyGridFrag from './wavy-grid.frag?raw';

export const exercises = [
  {
    id: 'helloworld',
    name: 'Hello world',
    description: 'Petit test',
    fragSource: helloworldFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_texture: { type: 'texture', value: textureUrl, gui: false },
      u_contrast: { type: 'float', value: 1.0, min: 0.5, max: 3.0, step: 0.01, gui: true, label: 'Contraste'}
    }
  },
  {
    id: 'uv-heatmap',
    name: 'UV Heatmap',
    description: 'Visualisation des coordonnées UV',
    fragSource: uvHeatmapFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_mode: { type: 'select', value: 0, options: [
        { label: 'Rouge (X)', value: 0 },
        { label: 'Vert (Y)', value: 1 },
        { label: 'Rouge + Vert', value: 2 }
      ], gui: true, label: 'Mode' }
    }
  },
  {
    id: 'gradient',
    name: 'Gradient Simple',
    description: 'Dégradés linéaires et radiaux',
    fragSource: gradientFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_colorA: { type: 'color', value: [0.1, 0.1, 0.2], gui: true, label: 'Couleur A' },
      u_colorB: { type: 'color', value: [0.9, 0.4, 0.2], gui: true, label: 'Couleur B' },
      u_angle: { type: 'float', value: 0, min: 0, max: 6.28, step: 0.01, gui: true, label: 'Angle' },
      u_radial: { type: 'bool', value: false, gui: true, label: 'Mode Radial' }
    }
  },
  {
    id: 'sinwave',
    name: 'Sin Wave',
    description: 'Ondes sinusoïdales animées',
    fragSource: sinwaveFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_freq: { type: 'float', value: 10, min: 1, max: 40, step: 0.1, gui: true, label: 'Fréquence' },
      u_amp: { type: 'float', value: 0.15, min: 0, max: 0.6, step: 0.005, gui: true, label: 'Amplitude' },
      u_speed: { type: 'float', value: 1.0, min: -3, max: 3, step: 0.01, gui: true, label: 'Vitesse' },
      u_thickness: { type: 'float', value: 0.01, min: 0.001, max: 0.1, step: 0.001, gui: true, label: 'Épaisseur' },
      u_colorA: { type: 'color', value: [0.95, 0.45, 0.15], gui: true, label: 'Couleur A' },
      u_colorB: { type: 'color', value: [0.10, 0.60, 0.95], gui: true, label: 'Couleur B' }
    }
  },
  {
    id: 'step-vs-smooth',
    name: 'Step vs Smoothstep',
    description: 'Comparaison step() et smoothstep()',
    fragSource: stepVsSmoothFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_threshold: { type: 'float', value: 0.5, min: 0, max: 1, step: 0.01, gui: true, label: 'Seuil' },
      u_smoothness: { type: 'float', value: 0.1, min: 0.001, max: 0.5, step: 0.001, gui: true, label: 'Lissage' },
      u_mode: { type: 'select', value: 0, options: [
        { label: 'Step', value: 0 },
        { label: 'Smooth', value: 1 },
        { label: 'Both', value: 2 }
      ], gui: true, label: 'Mode' },
      u_animate: { type: 'bool', value: false, gui: true, label: 'Animer' }
    }
  },
  {
    id: 'threshold-reveal',
    name: 'Threshold Reveal',
    description: 'Révélation progressive avec masque binaire',
    fragSource: thresholdRevealFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_texture: { type: 'texture', value: textureUrl, gui: false },
      u_threshold: { type: 'float', value: 0.5, min: 0, max: 1, step: 0.01, gui: true, label: 'Seuil' },
      u_revealMode: { type: 'select', value: 0, options: [
        { label: 'Noise', value: 0 },
        { label: 'Radial', value: 1 },
        { label: 'Horizontal', value: 2 },
        { label: 'Vertical', value: 3 },
        { label: 'Diagonal', value: 4 },
        { label: 'Spiral', value: 5 },
        { label: 'Diamond', value: 6 },
        { label: 'Wave', value: 7 }
      ], gui: true, label: 'Mode' },
      u_smoothness: { type: 'float', value: 0.02, min: 0, max: 0.2, step: 0.001, gui: true, label: 'Lissage' },
      u_animate: { type: 'bool', value: false, gui: true, label: 'Animer' },
      u_speed: { type: 'float', value: 1, min: 0, max: 3, step: 0.01, gui: true, label: 'Vitesse' },
      u_noiseScale: { type: 'float', value: 5, min: 1, max: 20, step: 0.1, gui: true, label: 'Échelle Noise' },
      u_invert: { type: 'bool', value: false, gui: true, label: 'Inverser' },
      u_aspectCorrection: { type: 'bool', value: false, gui: true, label: 'Correction Aspect' }
    }
  },
  {
    id: 'grid',
    name: 'Grid Pattern',
    description: 'Grilles et motifs répétitifs',
    fragSource: gridFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_gridSize: { type: 'float', value: 10, min: 2, max: 50, step: 1, gui: true, label: 'Taille Grille' },
      u_lineWidth: { type: 'float', value: 0.02, min: 0.001, max: 0.1, step: 0.001, gui: true, label: 'Largeur Ligne' },
      u_lineColor: { type: 'color', value: [0.2, 0.8, 1.0], gui: true, label: 'Couleur Ligne' },
      u_bgColor: { type: 'color', value: [0.05, 0.05, 0.1], gui: true, label: 'Couleur Fond' },
      u_gridMode: { type: 'select', value: 0, options: [
        { label: 'Grille Standard', value: 0 },
        { label: 'Points', value: 1 },
        { label: 'Lignes Pointillées', value: 2 },
        { label: 'Grille Diagonale', value: 3 },
        { label: 'Hexagones', value: 4 },
        { label: 'Hachures', value: 5 },
        { label: 'Grille Circulaire', value: 6 },
        { label: 'Croix', value: 7 }
      ], gui: true, label: 'Mode' },
      u_animate: { type: 'bool', value: false, gui: true, label: 'Animer' },
      u_dotSize: { type: 'float', value: 0.1, min: 0.01, max: 0.3, step: 0.01, gui: true, label: 'Taille Points' },
      u_smoothness: { type: 'float', value: 0.01, min: 0, max: 0.05, step: 0.001, gui: true, label: 'Lissage' },
      u_aspectCorrection: { type: 'bool', value: true, gui: true, label: 'Correction Aspect' }
    }
  },
  {
    id: 'shapes',
    name: 'Formes Géométriques',
    description: 'Cercles, rectangles, polygones',
    fragSource: shapesFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_shape: { type: 'select', value: 0, options: [
        { label: 'Cercle', value: 0 },
        { label: 'Carré', value: 1 },
        { label: 'Rectangle', value: 2 },
        { label: 'Hexagone', value: 3 }
      ], gui: true, label: 'Forme' },
      u_size: { type: 'float', value: 0.3, min: 0.05, max: 0.8, step: 0.01, gui: true, label: 'Taille' },
      u_rotation: { type: 'float', value: 0, min: 0, max: 6.28, step: 0.01, gui: true, label: 'Rotation' },
      u_smoothness: { type: 'float', value: 0.01, min: 0.001, max: 0.1, step: 0.001, gui: true, label: 'Lissage' },
      u_color: { type: 'color', value: [0.2, 0.8, 0.5], gui: true, label: 'Couleur' },
      u_aspectCorrection: { type: 'bool', value: true, gui: true, label: 'Correction Aspect' }
    }
  },
  {
    id: 'noise-intro',
    name: 'Introduction au Noise',
    description: 'Noise 2D simple',
    fragSource: noiseIntroFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_noiseType: { type: 'select', value: 0, options: [
        { label: 'Value Noise', value: 0 },
        { label: 'Perlin Noise', value: 1 },
        { label: 'Simplex Noise', value: 2 }
      ], gui: true, label: 'Type de Noise' },
      u_scale: { type: 'float', value: 5, min: 1, max: 50, step: 0.1, gui: true, label: 'Échelle' },
      u_speed: { type: 'float', value: 0.5, min: 0, max: 2, step: 0.01, gui: true, label: 'Vitesse' },
      u_octaves: { type: 'float', value: 1, min: 1, max: 4, step: 1, gui: true, label: 'Octaves (FBM)' },
      u_contrast: { type: 'float', value: 1.0, min: 0.5, max: 3.0, step: 0.01, gui: true, label: 'Contraste' },
      u_colorize: { type: 'bool', value: false, gui: true, label: 'Coloriser' },
      u_aspectCorrection: { type: 'bool', value: true, gui: true, label: 'Correction Aspect' }
    }
  },
  {
    id: 'mix-blend',
    name: 'Mix et Blending',
    description: 'Mélange de couleurs et patterns',
    fragSource: mixBlendFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_mixFactor: { type: 'float', value: 0.5, min: 0, max: 1, step: 0.01, gui: true, label: 'Mix Factor' },
      u_blendMode: { type: 'select', value: 0, options: [
        { label: 'Mix', value: 0 },
        { label: 'Add', value: 1 },
        { label: 'Multiply', value: 2 },
        { label: 'Screen', value: 3 }
      ], gui: true, label: 'Blend Mode' },
      u_colorA: { type: 'color', value: [1.0, 0.2, 0.3], gui: true, label: 'Couleur A' },
      u_colorB: { type: 'color', value: [0.2, 0.4, 1.0], gui: true, label: 'Couleur B' },
      u_animate: { type: 'bool', value: false, gui: true, label: 'Animer' },
      u_aspectCorrection: { type: 'bool', value: true, gui: true, label: 'Correction Aspect' }
    }
  },
  {
    id: 'kaleidoscope',
    name: 'Kaléidoscope',
    description: 'Répétitions et symétries',
    fragSource: kaleidoscopeFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_segments: { type: 'float', value: 6, min: 2, max: 16, step: 1, gui: true, label: 'Segments' },
      u_rotation: { type: 'float', value: 0, min: -3.14, max: 3.14, step: 0.01, gui: true, label: 'Rotation' },
      u_scale: { type: 'float', value: 1, min: 0.5, max: 3, step: 0.01, gui: true, label: 'Échelle' },
      u_animate: { type: 'bool', value: true, gui: true, label: 'Animer' },
      u_colorShift: { type: 'float', value: 0.5, min: 0, max: 1, step: 0.01, gui: true, label: 'Décalage couleur' },
      u_aspectCorrection: { type: 'bool', value: true, gui: true, label: 'Correction Aspect' }
    }
  },
  {
    id: 'wavy-grid',
    name: 'Wavy Grid',
    description: 'Grille ondulée avec distorsion noise',
    fragSource: wavyGridFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_lineJitter: { type: 'float', value: 0.5, min: 0, max: 2, step: 0.01, gui: true, label: 'Jitter' },
      u_lineWidth: { type: 'float', value: 0.003, min: 0.001, max: 0.02, step: 0.0001, gui: true, label: 'Largeur Ligne' },
      u_gridSpacing: { type: 'float', value: 0.1, min: 0.02, max: 0.3, step: 0.01, gui: true, label: 'Espacement' },
      u_waveAmplitude: { type: 'float', value: 0.05, min: 0, max: 0.2, step: 0.001, gui: true, label: 'Amplitude' },
      u_waveFrequency: { type: 'float', value: 10, min: 1, max: 30, step: 0.1, gui: true, label: 'Fréquence' },
      u_noiseScale: { type: 'float', value: 5, min: 1, max: 20, step: 0.1, gui: true, label: 'Échelle Noise' },
      u_speed: { type: 'float', value: 0.5, min: 0, max: 2, step: 0.01, gui: true, label: 'Vitesse' },
      u_lineColor: { type: 'color', value: [0.1, 0.1, 0.1], gui: true, label: 'Couleur Ligne' },
      u_bgColor: { type: 'color', value: [0.95, 0.95, 0.9], gui: true, label: 'Couleur Fond' },
      u_animate: { type: 'bool', value: true, gui: true, label: 'Animer' },
      u_smoothness: { type: 'float', value: 0.002, min: 0, max: 0.01, step: 0.0001, gui: true, label: 'Lissage' }
    }
  },
  {
    id: 'noise-lines',
    name: 'Lignes Noise',
    description: 'Lignes verticales déformées par du noise',
    fragSource: noiseLinesFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: [800, 600], gui: false },
      u_lineWidth: { type: 'float', value: 0.02, min: 0.001, max: 0.1, step: 0.001, gui: true, label: 'Largeur Ligne' },
      u_lineSpacing: { type: 'float', value: 0.33, min: 0.1, max: 0.5, step: 0.01, gui: true, label: 'Espacement' },
      u_noiseStrength: { type: 'float', value: 0.1, min: 0, max: 0.5, step: 0.001, gui: true, label: 'Force Noise' },
      u_noiseScale: { type: 'float', value: 5, min: 1, max: 20, step: 0.1, gui: true, label: 'Échelle Noise' },
      u_speed: { type: 'float', value: 1, min: 0, max: 3, step: 0.01, gui: true, label: 'Vitesse' },
      u_lineColor: { type: 'color', value: [0.2, 0.6, 1.0], gui: true, label: 'Couleur Ligne' },
      u_bgColor: { type: 'color', value: [0.05, 0.05, 0.1], gui: true, label: 'Couleur Fond' },
      u_aspectCorrection: { type: 'bool', value: true, gui: true, label: 'Correction Aspect' }
    }
  },
  {
    id: 'texture-warp',
    name: 'Texture Warp',
    description: 'Déformations UV sur texture',
    fragSource: textureWarpFrag,
    uniforms: {
      u_time: { type: 'float', value: 0, gui: false },
      u_resolution: { type: 'vec2', value: new Vec2( 800, 600 ), gui: false },
      u_texture: { type: 'texture', value: textureUrl, gui: false },
      u_warpMode: { type: 'select', value: 0, options: [
        { label: 'Ripple croisé', value: 0 },
        { label: 'Vague diagonale', value: 1 },
        { label: 'Swirl radial', value: 2 },
        { label: 'Barrel/Pincushion', value: 3 },
        { label: 'Kaleidoscope', value: 4 },
        { label: 'Checker warp', value: 5 },
        { label: 'Zoom pulsé', value: 6 },
        { label: 'Wave tunnel', value: 7 },
        { label: 'Shear animé', value: 8 },
        { label: 'Twist damier', value: 9 },
        { label: 'Vortex doux', value: 10 },
        { label: 'Chroma split', value: 11 }
      ], gui: true, label: 'Mode' },
      u_warpStrength: { type: 'float', value: 1, min: 0, max: 2, step: 0.01, gui: true, label: 'Intensité' },
      u_speed: { type: 'float', value: 1, min: 0, max: 3, step: 0.01, gui: true, label: 'Vitesse' },
      u_aspectCorrection: { type: 'bool', value: false, gui: true, label: 'Correction Aspect' }
    }
  }
];