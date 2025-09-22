# Stack (Jour 1 — fragment only)

* **Vite** (dev server + HMR, bundling simple).
* **JavaScript vanilla** (modules ES).
* **OGL** (renderer léger, `Renderer`, `Program`, `Triangle/Mesh`).
* **lil-gui** (UI des sliders/boutons).
* *(Optionnel plus tard :)* un petit **loader d’assets** (images) si vous faites “image warp”.

# Interface souhaitée

* **Canvas principal** à gauche (plein écran ou large colonne).
* **Panneau latéral** à droite avec :

  * **Sélecteur d’exercice** (dropdown ou boutons).
  * **Contrôles contextuels** (sliders/boutons/checkboxes) mappés aux `uniforms`.
  * Boutons **Reset**, **Random**, **Before/After** (si utile).
  * Affichage court du **nom de l’exercice** et, si possible, **la formule active** (1 ligne GLSL).

# Concept “exercices chargeables”

* Chaque exercice = un **frag shader différent** + une **définition d’uniforms** (types, min/max, valeurs).
* Un **manifeste** (JSON ou JS) liste les exercices :

  * `id`, `name`, `fragPath` (ou `fragSource` inline),
  * `uniforms` (structure déclarative),
  * éventuellement `assets` (textures) et **mapping GUI** (min/max/step, type `color/float/bool`).
* Au changement d’exercice : on **(re)construit** le `Program` OGL (vertex identique), on **applique** les uniforms par défaut, on **rebind** la GUI.

# Arborescence minimale

```
/src
  /core
    ShaderExerciseManager.js
    GuiBinder.js
  /exercises
    manifest.js            // liste des exos
    uv-heatmap.frag
    gradient.frag
    sinwave.frag
    step-vs-smooth.frag
    threshold.frag
    image-warp.frag
    kaleidoscope.frag
  main.js                  // bootstrap OGL + Manager + GUI
  index.html
```

# Manifeste d’exercices (exemple)

```js
// src/exercises/manifest.js
export const exercises = [
  {
    id: 'uv-heatmap',
    name: 'UV Heatmap',
    fragPath: '/src/exercises/uv-heatmap.frag',
    uniforms: {
      u_time:    { type: 'float', value: 0, gui: false },
      u_colorA:  { type: 'color', value: [0.0, 0.0, 0.0], gui: false },
      u_colorB:  { type: 'color', value: [1.0, 1.0, 1.0], gui: false }
    }
  },
  {
    id: 'sinwave',
    name: 'Sin Wave',
    fragPath: '/src/exercises/sinwave.frag',
    uniforms: {
      u_time:  { type: 'float', value: 0, gui: false },
      u_freq:  { type: 'float', value: 10, min: 1, max: 40, step: 0.1, gui: true, label: 'Frequency' },
      u_amp:   { type: 'float', value: 0.15, min: 0, max: 0.6, step: 0.005, gui: true, label: 'Amplitude' },
      u_speed: { type: 'float', value: 1.0, min: -3, max: 3, step: 0.01, gui: true, label: 'Speed' },
      u_colorA:{ type: 'color', value: [0.95, 0.45, 0.15], gui: true, label: 'Color A' },
      u_colorB:{ type: 'color', value: [0.10, 0.60, 0.95], gui: true, label: 'Color B' }
    }
  },
  // ... autres exos (threshold, image-warp, kaleidoscope, etc.)
];
```

# Classe de gestion — `ShaderExerciseManager`

**Rôle :** charger un exercice, compiler le fragment, injecter les uniforms, exposer une API simple.

**API proposée :**

* `constructor(gl, commonVertexSource)`
* `async loadExercise(exerciseDef)` → crée `Program`, retourne `{ program, uniforms }`
* `update(timeDelta)` → met à jour `u_time` (si présent)
* `dispose()` → détruit le `Program` courant

**Implémentation (pseudo/JS) :**

```js
// src/core/ShaderExerciseManager.js
import { Program } from 'ogl';

export class ShaderExerciseManager {
  constructor(gl, vertexSource) {
    this.gl = gl;
    this.vertexSource = vertexSource;
    this.current = null; // { program, uniforms, fragSource }
  }

  async loadExercise(def) {
    const fragSource = await fetch(def.fragPath).then(r => r.text());
    const uniforms = this._buildUniforms(def.uniforms);
    const program = new Program(this.gl, {
      vertex: this.vertexSource,
      fragment: fragSource,
      uniforms
    });
    this.current?.program?.remove?.();
    this.current = { program, uniforms, fragSource, def };
    return this.current;
  }

  update(dt) {
    if (!this.current) return;
    const u = this.current.uniforms;
    if (u.u_time) u.u_time.value += dt;
  }

  dispose() {
    if (this.current?.program) {
      // OGL libère quand plus référencé ; prévoir un cleanup si textures plus tard
      this.current = null;
    }
  }

  _buildUniforms(defUniforms = {}) {
    const uniforms = {};
    for (const [name, u] of Object.entries(defUniforms)) {
      switch (u.type) {
        case 'float':
          uniforms[name] = { value: Number(u.value ?? 0) };
          break;
        case 'color':
          uniforms[name] = { value: u.value ?? [1,1,1] }; // [0..1]
          break;
        // textures plus tard si besoin
        default:
          uniforms[name] = { value: u.value };
      }
    }
    return uniforms;
  }
}
```

# Binder GUI — `GuiBinder`

**Rôle :** créer les contrôles à partir de la définition `uniforms` de l’exercice.

```js
// src/core/GuiBinder.js
import GUI from 'lil-gui';

export class GuiBinder {
  constructor(containerEl) {
    this.gui = new GUI({ container: containerEl });
  }

  bindUniforms(uniformDefs, uniforms) {
    this.gui.destroy();
    this.gui = new GUI({ container: document.querySelector('#gui') });

    for (const [name, def] of Object.entries(uniformDefs)) {
      if (!def.gui) continue;
      const label = def.label || name;

      if (def.type === 'float') {
        this.gui.add(uniforms[name], 'value', def.min ?? 0, def.max ?? 1, def.step ?? 0.01).name(label);
      } else if (def.type === 'color') {
        const to255 = v => [Math.round(v[0]*255), Math.round(v[1]*255), Math.round(v[2]*255)];
        const to01  = v => [v[0]/255, v[1]/255, v[2]/255];
        const proxy = { [name]: to255(uniforms[name].value) };
        this.gui.addColor(proxy, name).name(label).onChange(v => uniforms[name].value = to01(v));
      } else if (def.type === 'bool') {
        const proxy = { [name]: !!uniforms[name].value };
        this.gui.add(proxy, name).name(label).onChange(v => uniforms[name].value = v ? 1.0 : 0.0);
      }
    }
  }

  destroy() { this.gui.destroy(); }
}
```

# Bootstrap (idée)

* `main.js` crée le **renderer OGL**, un **fullscreen triangle Mesh**, instancie `ShaderExerciseManager`, **charge le premier exercice**, instancie `GuiBinder` pour générer l’UI à droite, et lance la **boucle** (maj `u_time`, `render`).

**Points clés à retenir :**

* **Jour 1 = fragment only** : un **vertex commun minimal** (fullscreen triangle) suffit pour tous les exos.
* Le **manifeste** permet d’ajouter/retirer des exos sans toucher au code cœur.
* `ShaderExerciseManager` + `GuiBinder` = séparation claire **rendu** vs **UI**.
* Plus tard, si vous ajoutez des **textures** : étendre le manifeste (`assets`) et la construction des uniforms (`sampler2D` + `Texture` OGL).
