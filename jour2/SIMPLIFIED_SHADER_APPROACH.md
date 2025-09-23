# Approche Simplifiée pour les Shaders Custom

## 🎯 Problème
Avec l'approche traditionnelle, on avait **8+ replacements** difficiles à comprendre et à maintenir.

## ✨ Solution : L'Approche Hybride
**Seulement 4 replacements** au total !

### Structure Simplifiée

```javascript
material.onBeforeCompile = (shader) => {
    // VERTEX SHADER - 2 replacements
    // 1. Déclarations avant main()
    shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `/* vos déclarations */ void main() {`
    );

    // 2. Modifications au bon endroit
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `/* vos modifications */`
    );

    // FRAGMENT SHADER - 2 replacements
    // 3. Déclarations avant main()
    shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `/* vos déclarations */ void main() {`
    );

    // 4. Modifications au bon endroit
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        /* vos modifications */`
    );
};
```

## 📚 Les Points d'Injection Clés

### Vertex Shader
- **`'void main() {'`** : Pour ajouter uniforms, varyings, fonctions
- **`#include <begin_vertex>`** : Pour modifier les positions
- **`#include <project_vertex>`** : Pour les transformations finales

### Fragment Shader
- **`'void main() {'`** : Pour ajouter uniforms, varyings
- **`#include <color_fragment>`** : Pour modifier les couleurs
- **`#include <map_fragment>`** : Après le texture mapping
- **`#include <emissivemap_fragment>`** : Pour ajouter de la lumière

## 🔍 Comparaison

### Avant (Complexe)
```javascript
// 8+ replacements !
shader.vertexShader = shader.vertexShader.replace('#include <common>', '...');
shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '...');
shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', '...');
shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', '...');
shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '...');
shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '...');
shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '...');
shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', '...');
```

### Après (Simple)
```javascript
// 4 replacements seulement !
// Vertex: 1 pour déclarer, 1 pour modifier
// Fragment: 1 pour déclarer, 1 pour modifier
```

## 💡 Avantages

1. **Clarté** : Structure évidente (déclarations → modifications)
2. **Simplicité** : Seulement 4 points à retenir
3. **Fiabilité** : Les includes sont des points d'ancrage stables
4. **Pédagogique** : Facile à enseigner et comprendre

## 📝 Exemple Concret : Noise + Couleurs

```javascript
// 1. VERTEX: Déclarations
shader.vertexShader = shader.vertexShader.replace(
    'void main() {',
    `
    uniform float uTime;
    varying float vNoise;

    float noise(vec3 p) { /* fonction */ }

    void main() {`
);

// 2. VERTEX: Déformation
shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    vec3 transformed = position;
    float n = noise(position * 3.0 + uTime);
    transformed += normal * n * 0.1;
    vNoise = n;
    `
);

// 3. FRAGMENT: Déclarations
shader.fragmentShader = shader.fragmentShader.replace(
    'void main() {',
    `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying float vNoise;

    void main() {`
);

// 4. FRAGMENT: Couleurs
shader.fragmentShader = shader.fragmentShader.replace(
    '#include <color_fragment>',
    `
    #include <color_fragment>

    vec3 color = mix(uColorA, uColorB, vNoise);
    diffuseColor.rgb *= color;
    `
);
```

## 🚀 Best Practices

1. **Toujours garder l'include original** si vous voulez étendre (pas remplacer)
   ```javascript
   '#include <color_fragment>',
   `#include <color_fragment>  // Garde l'original !
    // Puis ajoute tes modifications
    diffuseColor.rgb *= myColor;`
   ```

2. **Utiliser des noms custom pour les varyings** pour éviter les conflits
   ```javascript
   varying vec3 vCustomPosition;  // Pas juste vPosition
   ```

3. **Tester avec console.log** pour comprendre la structure
   ```javascript
   console.log(shader.vertexShader);  // Voir le shader original
   ```

## 🎓 Pour l'Enseignement

Cette approche est parfaite pour les étudiants car :

1. **Concept simple** : "Avant main()" et "Au bon endroit"
2. **Pattern répétable** : Toujours la même structure
3. **Moins d'erreurs** : 4 points vs 8+
4. **Progression claire** : D'abord déclarer, puis modifier

## Conclusion

**De 8+ replacements complexes → 4 replacements logiques**

C'est l'approche idéale pour combiner simplicité et puissance !