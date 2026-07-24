# KiMèt

**KiMèt** (« qui mène », en créole guadeloupéen) est une application web qui
cartographie de façon factuelle et sourcée les principaux groupes
économiques actifs en Guadeloupe.

Chaque fiche repose sur une source publique déjà publiée (article de presse,
document institutionnel), citée et reliée à l'original. Aucune information
inédite n'est publiée ; les visiteurs peuvent proposer de nouvelles sources
via un formulaire, modéré avant toute intégration.

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [React Router](https://reactrouter.com/) pour la navigation
- [Tailwind CSS](https://tailwindcss.com/) pour le design

## Développement

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production
```

## Contenu

- `src/data/sectors.ts` — liste des secteurs économiques suivis
- `src/data/groups.ts` — fiches par groupe (fait documenté + source)
- `src/data/context.ts` — contexte institutionnel affiché en page d'accueil

Pour ajouter une fiche : compléter `src/data/groups.ts` (et `sectors.ts` si
un nouveau secteur est nécessaire) avec un fait sourcé et un lien cliquable
vers l'article ou le document d'origine.
