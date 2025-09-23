# Ordre Didactique des Shaders - Progression P\u00e9dagogique

## Vue d'ensemble
Les shaders sont organis\u00e9s dans un ordre croissant de complexit\u00e9, permettant un apprentissage progressif des concepts GLSL et des techniques de shader.

## Ordre de Progression Recommand\u00e9

### 1. **uv-heatmap.frag** - Les Fondamentaux (Niveau: D\u00e9butant)
- **Concepts**: Coordonn\u00e9es UV, canaux de couleur RGB
- **Points cl\u00e9s**: Comprendre que les UV vont de 0 \u00e0 1
- **Exercice**: Visualiser les coordonn\u00e9es comme couleurs

### 2. **gradient.frag** - Interpolation Simple (Niveau: D\u00e9butant)
- **Concepts**: mix(), gradients lin\u00e9aires et radiaux
- **Points cl\u00e9s**: Interpolation entre couleurs, dot product
- **Exercice**: Cr\u00e9er diff\u00e9rents types de gradients

### 3. **step-vs-smooth.frag** - Fonctions de Seuillage (Niveau: D\u00e9butant)
- **Concepts**: step() vs smoothstep()
- **Points cl\u00e9s**: Transitions dures vs douces, antialiasing
- **Exercice**: Comparer visuellement les deux approches

### 4. **sinwave.frag** - Math\u00e9matiques Anim\u00e9es (Niveau: D\u00e9butant+)
- **Concepts**: sin(), animation avec u_time
- **Points cl\u00e9s**: Fr\u00e9quence, amplitude, phase
- **Exercice**: Cr\u00e9er des ondes anim\u00e9es

### 5. **shapes.frag** - Introduction aux SDF (Niveau: Interm\u00e9diaire)
- **Concepts**: Signed Distance Fields
- **Points cl\u00e9s**: Formes math\u00e9matiques, rotation 2D
- **Exercice**: Dessiner et transformer des formes

### 6. **grid.frag** - Patterns R\u00e9p\u00e9titifs (Niveau: Interm\u00e9diaire)
- **Concepts**: fract(), mod(), r\u00e9p\u00e9titions
- **Points cl\u00e9s**: Division de l'espace en cellules
- **Exercice**: Cr\u00e9er diff\u00e9rents types de grilles

### 7. **mix-blend.frag** - Modes de Fusion (Niveau: Interm\u00e9diaire)
- **Concepts**: Blend modes, combinaison de patterns
- **Points cl\u00e9s**: Multiply, Screen, Overlay
- **Exercice**: M\u00e9langer des patterns avec diff\u00e9rents modes

### 8. **noise-intro.frag** - Bruit Proc\u00e9dural (Niveau: Interm\u00e9diaire+)
- **Concepts**: Value/Perlin/Simplex noise, FBM
- **Points cl\u00e9s**: Octaves, fr\u00e9quence, amplitude
- **Exercice**: Explorer diff\u00e9rents types de bruit

### 9. **noise-lines.frag** - Application du Bruit (Niveau: Interm\u00e9diaire+)
- **Concepts**: D\u00e9formation avec bruit
- **Points cl\u00e9s**: Noise of noise, d\u00e9placement organique
- **Exercice**: Cr\u00e9er des lignes ondul\u00e9es organiques

### 10. **wavy-grid.frag** - Combinaisons Complexes (Niveau: Avanc\u00e9)
- **Concepts**: Grilles + waves + bruit
- **Points cl\u00e9s**: Superposition d'effets, FBM custom
- **Exercice**: Cr\u00e9er des grilles d\u00e9form\u00e9es complexes

### 11. **texture-warp.frag** - Manipulation UV Avanc\u00e9e (Niveau: Avanc\u00e9)
- **Concepts**: 12 modes de distorsion diff\u00e9rents
- **Points cl\u00e9s**: Transformations polaires, effets de lentille
- **Exercice**: Explorer chaque mode de distorsion

### 12. **threshold-reveal.frag** - Masques Dynamiques (Niveau: Avanc\u00e9)
- **Concepts**: Seuillage pour r\u00e9v\u00e9lation progressive
- **Points cl\u00e9s**: Patterns de r\u00e9v\u00e9lation, FBM pour dissolution
- **Exercice**: Cr\u00e9er des transitions entre textures

### 13. **kaleidoscope.frag** - Transformations Polaires (Niveau: Avanc\u00e9)
- **Concepts**: Coordonn\u00e9es polaires, sym\u00e9tries
- **Points cl\u00e9s**: Segmentation angulaire, miroirs math\u00e9matiques
- **Exercice**: Cr\u00e9er des patterns kal\u00e9idoscopiques

### 14. **helloworld.frag** - Synth\u00e8se Complexe (Niveau: Expert)
- **Concepts**: Combinaison de toutes les techniques
- **Points cl\u00e9s**: Simplex noise complet, d\u00e9formations cha\u00een\u00e9es
- **Note**: Exemple intentionnellement complexe pour d\u00e9monstration

## Conseils P\u00e9dagogiques

### Pour les D\u00e9butants
1. Commencez par les shaders 1-4
2. Exp\u00e9rimentez avec chaque param\u00e8tre
3. Modifiez le code pour voir les effets
4. Ne passez au suivant qu'apr\u00e8s compr\u00e9hension

### Pour le Niveau Interm\u00e9diaire
1. Focus sur les shaders 5-9
2. Comprendre les math\u00e9matiques derri\u00e8re
3. Combiner les techniques apprises
4. Cr\u00e9er vos propres variations

### Pour le Niveau Avanc\u00e9
1. \u00c9tudiez les shaders 10-14
2. D\u00e9composez les effets complexes
3. Optimisez les performances
4. Cr\u00e9ez vos propres shaders complexes

## Concepts Transversaux

### Math\u00e9matiques Essentielles
- Vecteurs et op\u00e9rations
- Trigonom\u00e9trie (sin, cos, atan)
- Interpolation (mix, smoothstep)
- Transformations (rotation, scale)

### Techniques R\u00e9currentes
- Animation avec u_time
- R\u00e9p\u00e9tition avec fract/mod
- Bruit proc\u00e9dural
- SDF pour les formes

### Optimisations
- \u00c9viter les branches (if/else)
- Pr\u00e9f\u00e9rer les fonctions built-in
- Minimiser les calculs dans les boucles
- R\u00e9utiliser les calculs

## Ressources Compl\u00e9mentaires

- **The Book of Shaders**: https://thebookofshaders.com/
- **Shadertoy**: https://www.shadertoy.com/
- **GLSL Reference**: https://www.khronos.org/opengl/wiki/GLSL

## Notes Importantes

1. **Ordre Flexible**: Cet ordre est une suggestion, adaptez selon vos besoins
2. **Exp\u00e9rimentation**: La meilleure fa\u00e7on d'apprendre est d'exp\u00e9rimenter
3. **D\u00e9bogage Visuel**: Utilisez les couleurs pour visualiser les valeurs
4. **Performance**: Attention \u00e0 la complexit\u00e9 sur mobile/web

## Exercices de Synth\u00e8se

### Niveau D\u00e9butant
- Cr\u00e9er un d\u00e9grad\u00e9 arc-en-ciel
- Animer un cercle qui pulse
- Faire une grille de points

### Niveau Interm\u00e9diaire
- Cr\u00e9er un effet de plasma avec du bruit
- Faire une transition entre deux textures
- Impl\u00e9menter un effet de vague sur une image

### Niveau Avanc\u00e9
- Cr\u00e9er un effet de portail avec distorsion
- Impl\u00e9menter un effet de glitch
- Faire un shader de terrain proc\u00e9dural

---

*Bonne exploration du monde merveilleux des shaders!*