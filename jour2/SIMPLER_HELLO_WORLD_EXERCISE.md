# Hello World Shader Exercise - Plan

## 🎯 Objectif
Créer un premier shader simple qui utilise du noise pour déformer une sphère et modifier ses normales. C'est le "Hello World" des shaders 3D - une introduction douce aux concepts fondamentaux.

## 📚 Concepts abordés
- **Vertex Shader** : Déformation de géométrie avec du noise
- **Fragment Shader** : Éclairage simple et mélange de couleurs
- **Simplex Noise** : Fonction de bruit procédural pour créer des animations organiques
- **Normal Mapping** : Calcul de nouvelles normales après déformation

## 🛠️ Structure du projet

### Démo complète
- `/src/demos/hello-world.js` : Démo fonctionnelle avec tous les paramètres
- `/src/shaders/hello-world/vertex.glsl` : Vertex shader complet
- `/src/shaders/hello-world/fragment.glsl` : Fragment shader complet

### Exercice squelette
- `/src/exercises/hello-world/index.js` : Base JavaScript avec TODOs
- `/src/exercises/hello-world/vertex.glsl` : Vertex shader à compléter
- `/src/exercises/hello-world/fragment.glsl` : Fragment shader à compléter

## 📝 Étapes de l'exercice

### Étape 1 : Configuration des uniforms (index.js)
- Ajouter les uniforms pour contrôler le noise :
  - `uNoiseScale` : Échelle du bruit (3.0)
  - `uNoiseSpeed` : Vitesse d'animation (0.2)
  - `uNoiseAmplitude` : Amplitude de déformation (0.15)

### Étape 2 : Vertex Shader
1. **Ajouter la fonction de noise** (simplex noise fournie dans la démo)
2. **Calculer le noise** basé sur la position et le temps
3. **Déplacer les vertices** le long de leurs normales
4. **Recalculer les normales** pour un éclairage correct

### Étape 3 : Fragment Shader
1. **Implémenter un éclairage simple** (directional light)
2. **Mélanger les couleurs** en fonction du noise
3. **Appliquer l'éclairage** au résultat final
4. **Bonus** : Ajouter un effet fresnel

### Étape 4 : Interface GUI
- Ajouter les contrôles pour les paramètres de noise
- Organiser dans un folder "Noise Parameters"

## 💡 Points clés à retenir

### Simplicité avant tout
- Pas de matériaux complexes (pas de MeshPhysicalMaterial)
- Un seul ShaderMaterial custom
- Focus sur les concepts de base

### Flux de données
```
CPU (JavaScript) → Uniforms → GPU (Shaders)
                     ↓
            Vertex Shader → Varyings → Fragment Shader
```

### Calcul des normales perturbées
Pour obtenir un éclairage correct après déformation, il faut recalculer les normales en échantillonnant les positions voisines et en utilisant le produit vectoriel.

## 🎮 Résultat attendu
Une sphère animée avec :
- Surface ondulante grâce au noise
- Dégradé de couleurs qui suit les déformations
- Éclairage réaliste qui s'adapte aux nouvelles normales
- Contrôles interactifs pour expérimenter

## 🚀 Extensions possibles
Une fois l'exercice de base complété :
1. Ajouter différents types de noise (Perlin, Voronoi)
2. Combiner plusieurs octaves de noise
3. Ajouter des textures
4. Implémenter d'autres modèles d'éclairage (Phong, PBR simplifié)

## 📖 Ressources
- [The Book of Shaders - Noise](https://thebookofshaders.com/11/)
- [Three.js ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [Simplex Noise](https://github.com/ashima/webgl-noise)