# Guide Compétitif PUBG Mobile

Site éducatif interactif en 3D pour comprendre le fonctionnement de PUBG Mobile en compétition : priorité, rôles, split, rotations, positionnement en compound, micro/macro, ligne d'avion et spécificités des cartes Erangel / Rondo / Miramar.

## Stack

- **React 18 + Vite + TypeScript**
- **React Three Fiber + drei** pour les scènes 3D (formes low-poly stylisées, aucune texture lourde)
- **Tailwind CSS** pour le design
- **Framer Motion** pour les transitions d'interface
- **React Router** — une page par module, chargée en *lazy loading*
- **Zustand** (avec persistance `localStorage`) pour la progression utilisateur et le mode "réduire la 3D"

## Démarrage

```bash
npm install
npm run dev
```

## Build de production

```bash
npm run build     # tsc -b && vite build
npm run preview   # sert le build de dist/
```

## Architecture

```
src/
├── data/
│   ├── modules.ts        # Registre des modules — pilote nav, progression, prev/next
│   └── content/          # Contenu pédagogique (textes + données des scènes) par module
├── store/useAppStore.ts  # Zustand : progression + mode 3D/2D
├── hooks/                # useLowPerfMode, useMarkVisited
├── layouts/               # RootLayout (nav globale), ModuleLayout (coquille de page module)
├── pages/                # Une page par route
├── components/
│   ├── ui/                # Composants d'interface réutilisables
│   ├── three/             # Scènes 3D (React Three Fiber) + primitives partagées
│   └── fallback/          # Équivalents 2D (SVG) de chaque scène 3D
└── router.tsx             # Déclaration des routes, toutes lazy-loaded
```

## Mode "réduire la 3D"

Chaque scène 3D a un équivalent 2D dans `components/fallback/`, affiché automatiquement :
- si l'utilisateur active le bouton **"Schémas 2D"** dans le header,
- si l'appareil est détecté comme peu puissant (`prefers-reduced-motion`, peu de cœurs CPU ou peu de mémoire),
- ou si le rendu WebGL échoue (garde-fou via une error boundary).

**Point important de performance** : chaque scène 3D est chargée via `React.lazy()`, jamais en import direct. Résultat : le runtime three.js/@react-three/fiber (~220 Ko gzippé) n'est **jamais téléchargé** en mode 2D — seulement au premier besoin réel d'une scène 3D, puis mis en cache pour les scènes suivantes.

## Ajouter un module

1. Ajouter une entrée dans `src/data/modules.ts` (id, slug, titre, résumé)
2. Créer le contenu dans `src/data/content/monModule.ts`
3. Créer la page dans `src/pages/MonModulePage.tsx`, avec `ModuleLayout` comme coquille
4. Si le module a une scène 3D : créer `components/three/MaScene.tsx` + son équivalent `components/fallback/MaSceneFallback.tsx`, et la charger en `lazy()` dans la page
5. Ajouter la route dans `src/router.tsx`

## Contenu

Tout le contenu pédagogique est écrit en français, sans utiliser de noms réels d'équipes ou de joueurs professionnels (noms génériques/fictifs uniquement), conformément au brief. Site non officiel, sans affiliation avec PUBG MOBILE ou ses éditeurs.
