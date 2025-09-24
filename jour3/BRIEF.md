Voilà la version challengée du brief, qui garde la base claire mais ouvre des options bonus pour aller plus loin :

---

### 1. **Sol**

* Sol plat au centre de la scène.
* Apparition progressive depuis le centre, basée sur un *threshold* appliqué sur un **noise** ou une **texture type peinture**.
* Shader utilisant `length` et la texture/noise pour contrôler la révélation.

**Challenge :**

* Mélanger deux textures/noises pour complexifier l’effet.
* Animer le noise dans le temps pour donner un rendu organique (comme une peinture qui se répand).

---

### 2. **Mesh central (Suzanne)**

* Apparition de bas en haut via une transition par vertices.
* Ensuite, transition de couleur, contrôlée par un pourcentage de progression et la **même texture/noise que pour le sol**.

**Challenge :**

* Varier la logique de révélation : radiale, sphérique ou en diagonale.
* Créer une transition de couleur en gradient, pas seulement un switch binaire.
* Synchroniser la vitesse de transition de chaque vertex à la texture/noise → apparition non uniforme.

---

### 3. **Particules**

* Particules tournant autour du mesh central.
* Déplacement de bas en haut, animé de manière **sinusoïdale**.

**Challenge :**

* Faire varier taille et opacité des particules selon leur hauteur ou distance au mesh.
* Relier leur comportement (vitesse, couleur, densité) à la même texture/noise utilisée pour sol et Suzanne.
* Interaction : particules qui changent d’état (ex. couleur) quand elles traversent une zone du sol en cours d’apparition.

---

### 4. **Contrôle global (option bonus)**

* Ajouter un uniforme `progress` qui synchronise toutes les transitions (sol, Suzanne, particules) avec un seul paramètre.
* Ou au contraire, séparer les contrôles pour tester la structuration d’un shader avec plusieurs uniforms indépendants.

--

Voici le brief technique:

* **Langages & environnement** : JavaScript Vanilla avec **Three.js R179**.
* **Build** : **ViteJS** avec **vite-plugin-glsl** pour importer les shaders.
* **Package manager** : **PNPM**.
* **Interface de contrôle** : **LIL GUI** pour piloter les uniforms (ex. `progress`).
* **Code base** : reprise sur une ancienne base de code existante.
* **Shaders** :

  * Sol → **ShaderMaterial**.
  * Suzanne → **ShaderMaterial** (pas de MeshStandard ou Physical par défaut, tout en custom).

Tu veux que je fusionne ce résumé directement avec le **brief créatif/scénique** qu’on a établi (sol, Suzanne, particules, reveal avec texture) pour obtenir un **document unique** ?

--

Exemple pour l'idee des mask:
Oui, ça fait totalement sens. La **texture sert uniquement de masque de révélation (threshold)** pour l’anim d’intro — pas pour teinter. Tu l’emploies comme carte de contrôle “où/quand ça apparaît”, point.

Voici un schéma d’implémentation rapide (même masque partout) :

### 1) Sol (fragment)

* Idée : révéler depuis le centre **ET** valider par le masque.

```glsl
uniform sampler2D uMask;   // texture “peinture”
uniform float uProgress;   // 0→1
uniform vec2 uMaskUVScale, uMaskUVOffset;

varying vec2 vUv;          // UV sol, centrées ou non

void main() {
  // rayon depuis le centre (en UV)
  float r = length(vUv - 0.5);
  float circle = 1.0 - smoothstep(uProgress - 0.02, uProgress + 0.02, r);

  // masque texture (gris)
  float m = texture2D(uMask, vUv * uMaskUVScale + uMaskUVOffset).r;

  // seuil par masque: n’apparaît que là où m < uProgress (ou l’inverse selon ton visuel)
  float maskReveal = step(m, uProgress);

  float reveal = circle * maskReveal;
  if (reveal < 0.5) discard;            // ou alpha *= reveal
  // … puis draw ton sol
}
```

### 2) Suzanne (vertex → fragment)

* Apparition **de bas en haut** (Y) *et* validée par le même masque projeté en XZ.

```glsl
// VERTEX
uniform float uProgress;       // 0→1
uniform sampler2D uMask;
uniform vec2 uMaskXZScale, uMaskXZOffset;

attribute vec3 position;
varying float vReveal;

void main() {
  vec3 wp = (modelMatrix * vec4(position,1.)).xyz;

  // 0 en bas → 1 en haut (normalise selon ta bbox Y)
  float by = clamp((wp.y - uMinY) / (uMaxY - uMinY), 0., 1.);
  float vertical = smoothstep(uProgress - 0.02, uProgress + 0.02, by);

  // masque via projection XZ
  vec2 maskUV = wp.xz * uMaskXZScale + uMaskXZOffset;
  float m = texture2D(uMask, maskUV).r;
  float maskReveal = step(m, uProgress);

  vReveal = vertical * maskReveal;

  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.);
}
```

```glsl
// FRAGMENT
varying float vReveal;
void main() {
  if (vReveal < 0.5) discard; // pas de teinte, juste le reveal
  // … puis shading normal
}
```

### 3) Particules (spawn ou discard)

* Les particules “existent” seulement là où le masque est révélé (m < progress), et elles tournent en hélice sinus de bas en haut.

```glsl
// côté CPU/compute au spawn
float m = sampleMaskAtXZ(p.x, p.z);      // même UV que Suzanne
bool alive = (m < uProgress);
if (!alive) skip;

// côté shader (optionnel)
if (step(texture2D(uMask, uv).r, uProgress) < 0.5) discard;
```

* Mouvement : `theta = baseAngle + angularSpeed * t; y = y0 + sin(freq * t + phase) * amp + riseSpeed * t; xz = radius * vec2(cos(theta), sin(theta));`

### Tips rapides

* Choisis une **convention unique** (révélation si `m < uProgress` ou l’inverse) et garde-la partout.
* Utilise `smoothstep` sur le cercle ou sur `uProgress` pour des bords doux (évite le popping).
* Contrôle d’un seul **`uProgress`** global pour synchroniser sol/Suzanne/particules.
* Si la texture masque est peinte à la main, pense au **tiling/offset** et au **mipmapping** (éviter le bruit scintillant).

Bref : **une seule carte** = **un seul langage visuel** pour déclencher les reveals, sans teindre. Ça colle exactement à ce que tu veux.
-- PAs forcemetn a suivre, juste en ref, et pour debattre.
