# Brief — Module “Shaders pour Creative Dev (2e année)” — 4 jours

## Objectifs pédagogiques

* Dédramatiser les shaders : sortir de l’effet “magie noire”.
* Entrer par le visuel et le jeu (sin/cos, noise, UV) avant d’aller vers des usages plus “data”.
* Comprendre que les shaders manipulent à la fois l’image (textures, couleurs) et les données (textures comme containers d’informations).
* Passer d’un playground simple (vanilla ou minimal) à Three.js, avec modèle 3D et shaders éditables.
* En fin de parcours, ouvrir sur la logique vertex + fragment appliquée à un système de particules, puis sur le futur langage TSL de Three.js.

## Public & durée

* **Public** : étudiants de 2e année Creative Development.
* **Durée** : 4 jours consécutifs.

## Stack & formats

* **Langage** : JavaScript.
* **Librairie** : Three.js (avec possibilité d’un setup vanilla pour le tout premier contact).
* **Contenus** : alternance d’exemples guidés + livrables “prêts à jouer” → expérimentations immédiates.

---

## Progression / séquencement

### Jour 1 — Déclic visuel (fragment shader en playground simple)

* Découvrir le fragment shader en contexte minimal.
* Vocabulaire de base : UV, gl\_FragCoord, sin/cos, noise.
* Expérimentations ludiques et visuelles pour dédramatiser et donner le déclic.

---

### Jour 2 — Passage direct au 3D + Vertex shader

* Passage dans Three.js, chargement d’un modèle simple.
* Modification du fragment shader appliqué au modèle.
* Introduction du vertex shader : comprendre rôle vs fragment.
* Exercices : déformer une géométrie avec sin/cos.

---

### Jour 3 — Textures comme données + système de particules

* Découvrir que les textures peuvent stocker des infos (positions, vitesses…).
* Exemple concret : un système de particules simple piloté par une data texture.
* Relier vertex + fragment avec la logique “data mindset”.

---

### Jour 4 — Introduction à TSL (Three.js Shader Language)

*(animé par un autre intervenant, mais gardé en tête dans la progression)*

* Comparaison GLSL classique ↔ TSL.
* Reprise d’exercices précédents dans TSL (déformations, UV, particules simplifiées).
* Ouverture sur les workflows modernes (TSL + r3f, node-based).

---

## Livrables & supports attendus

* Exemples concrets à chaque étape → faciles à modifier/jouer.
* Un modèle 3D dans Three.js avec shaders customisables.
* En fin de parcours : un exemple fonctionnel de système de particules utilisant une data texture.

---

## Principes pédagogiques

* Démarrer par le plaisir visuel et la curiosité.
* Introduire progressivement la complexité (maths, vertex, data).
* Toujours donner des livrables concrets et manipulables.
* Évolution progressive : playground simple → Three.js + modèle → vertex → data → particules → TSL.
