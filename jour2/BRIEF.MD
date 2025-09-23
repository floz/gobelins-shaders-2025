Voici un brief clair pour que le dev prépare la démo “Jour 2”.

# Objectif

Deux démos jouables en VanillaJS basées sur **Three.js r179** + Vite.

1. **Démo A (sphère)** : custom d’un **MeshPhysicalMaterial** via `onBeforeCompile` (transition texture/couleur côté fragment) + petite déformation vertex (twist / displacement).
2. **Démo B (Suzanne)** : chargement d’un modèle **glTF** (Suzanne), même logique de custom shader + déformations vertex plus visibles. Les étudiants doivent implémenter/ajuster la transition (texture→texture ou couleur→couleur).

# Stack & contraintes

* **VanillaJS + Vite + pnpm** (pas de framework UI).
* **Three.js r179** (ou StrixJS r179).
* On peut utiliser lil-gui
* Cible Chrome/Edge/Firefox récents, 60 FPS.
* Arbo light, assets locaux (glTF, textures, HDR optionnel).

# Structure projet (suggestion)

```
/src/main.js             -> bootstrap, routeur très simple (A/B)
/src/demos/sphere.js     -> Démo A
/src/demos/suzanne.js    -> Démo B
/src/shaders/inject.js   -> helpers onBeforeCompile (fragment/vertex)
/public/assets/
  textures/a.jpg, b.jpg
  env/venice_sunset_1k.hdr   (optionnel)
  models/suzanne.glb
/index.html               -> 4 sliders + 3 boutons (sans lib UI)
```

# Scène de base (commune)

* Renderer (physicallyCorrectLights, ACES tone mapping, sRGBEncoding), canvas full-screen.
* Camera `PerspectiveCamera(50, aspect, 0.1, 100)` @ z=4, OrbitControls **optionnels** (sinon drag maison).
* Éclairage : `DirectionalLight` doux + `AmbientLight` faible (ou IBL si HDR dispo).
* Resize handler + simple RAF loop.

# Paramètres exposés (HTML inputs)
* Penser a utiliser lil-gui si besoin, ce sera un bon exemple pour les etudiants.
* **uThreshold** (0→1) : mix textures/couleurs.
* **uTwist** (-1→+1) : torsion autour de l’axe Y.
* **uDispAmp** (0→0.3) : amplitude displacement (bruit simple).
* **uTime** (anim auto, lecture seule).
* Boutons: **Textures | Couleurs**, **PhysMat modifié | ShaderMaterial**, **Reset**.

# Démo A — Sphère

* Géométrie : `SphereGeometry(1, 256, 128)`.
* Matériau de départ : **MeshPhysicalMaterial** (metalness/roughness standard).
* **onBeforeCompile (fragment)** : injecter uniforms `uThreshold`, `uUseTextures`, `uColorA`, `uColorB`, `uMapA`, `uMapB`.
  Logique : `mix(base, alt, smoothstep(uThreshold-δ, uThreshold+δ, mask))` avec `δ=0.02`. `mask` = soit `vUv.y` (démo immédiate), soit une 3e texture masque si dispo.
* **onBeforeCompile (vertex)** : injecter `uTwist`, `uDispAmp`, `uTime`; appliquer twist autour de Y + displacement via bruit cheap (hash-based) pour rester self-contained.

**Snippets (à adapter dans votre helper inject.js)**

*Fragment (idée)*

```glsl
uniform float uThreshold;
uniform bool  uUseTextures;
uniform vec3  uColorA, uColorB;
uniform sampler2D uMapA, uMapB;

float edge(float x, float t){ return smoothstep(t-0.02, t+0.02, x); }

vec3 blendTextures(vec2 uv, vec3 baseCol) {
  vec3 A = uUseTextures ? texture2D(uMapA, uv).rgb : uColorA;
  vec3 B = uUseTextures ? texture2D(uMapB, uv).rgb : uColorB;
  float m = edge(vUv.y, uThreshold);
  return mix(A, B, m);
}
```

Puis remplacer la sortie couleur du physmat (juste avant `gl_FragColor`) par:

```glsl
  vec3 final = blendTextures(vUv, outgoingLight);
  gl_FragColor = vec4( final, diffuseColor.a );
```

*Vertex (idée)*

```glsl
uniform float uTwist;
uniform float uDispAmp;
uniform float uTime;

float hash(vec3 p){ // cheap noise-ish
  return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453);
}

void main() {
  vec3 p = position;

  // Twist autour de Y
  float ang = uTwist * p.y;
  float sx = sin(ang), cx = cos(ang);
  p.xz = mat2(cx,-sx,sx,cx) * p.xz;

  // Displacement simple
  float n = hash(p*3.0 + uTime*0.2);
  p += normal * (n - 0.5) * 2.0 * uDispAmp;

  // réinjecter dans le flux standard (REMPLACER position -> p)
}
```

> Implémentation pratique : cloner `MeshPhysicalMaterial`, attacher uniforms, et dans `onBeforeCompile(shader){ ... }` injecter via remplacements `shader.vertexShader = shader.vertexShader.replace(...)`. Garder une fonction helper qui applique ces injections et renvoie le mat “patché”.

# Démo B — Suzanne (glTF)

* Charger `suzanne.glb` (triangulée, UVs OK).
* Au chargement :

  * **Mode 1 (par défaut)** : garder `MeshPhysicalMaterial` et appliquer **exactement** les mêmes injections `onBeforeCompile` que la sphère.
  * **Mode 2** : proposer un **ShaderMaterial** maison qui reproduit un phys-like simplifié (Lambert + spec rough) pour montrer la différence et laisser les étudiants jouer (même uniforms).
* Même UI que Démo A.
* Tâche étudiante clé : implémenter la **transition texture→texture** (ou couleur→couleur) sur Suzanne + régler un mask différent (par ex. `length(vWorldPosition.xz)` ou une 3e texture masque).

# Assets

* `models/suzanne.glb` (64–128k faces ok).
* `textures/a.jpg` et `b.jpg` (1024² ou 2048²), sRGB.
* `env.hdr` optionnel (PMREM).

# Commandes

* `pnpm i` (ou npm/yarn)
* `pnpm dev` → [http://localhost:5173](http://localhost:5173)
* `pnpm build` / `pnpm preview`

# Critères d’acceptation

* 2 routes/boutons pour basculer **Démo A** ↔ **Démo B** sans recharger la page.
* Sliders modifient **en temps réel** `uThreshold`, `uTwist`, `uDispAmp`.
* Bouton **Textures|Couleurs** commute proprement.
* **Mode PhysMat modifié** et **Mode ShaderMaterial** dispo sur les deux démos.
* 60 FPS sur laptop standard (démo A) ; >45 FPS sur Démo B.
* Code clair : un helper `patchPhysicalMaterial(mat, uniforms)` et un `buildShaderMaterial(uniforms)`.

# Étapes dev (ordre)

1. Bootstrap Vite + Three r179, scène de base.
2. Démo A : sphère + PhysMat patché (frag+vertex) + UI.
3. Démo A : ShaderMaterial alternative (mêmes uniforms).
4. Démo B : chargeur glTF + application patch / alt shader.
5. Petits presets (2–3) : *“Clean PBR”*, *“Edge Reveal”*, *“Full Twist”*.
6. Nettoyage + commentaires dans `inject.js`.

# Extensions (si temps)

* Masque via 3e texture (noise/turbulence).
* Animation auto de `uThreshold` (ping-pong).
* Ajout d’IBL HDR + contrôle roughness/metalness pour montrer l’impact.

