# VeyPri

Application citoyenne permettant aux habitants de Guadeloupe de signaler,
de façon anonyme, un écart entre le prix observé en magasin et le prix
plafond officiel du Bouclier Qualité Prix (BQP).

## Fonctionnalités (v1)

- Formulaire de signalement (magasin, produit, prix observé, prix plafond
  BQP déclaré, photo de l'étiquette comme preuve, date automatique)
- Liste publique des signalements récents, présentation factuelle
- Aucun compte, aucune donnée personnelle collectée
- Stockage SQLite local (`node:sqlite`)

## Démarrer en local

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · SQLite (`node:sqlite`)

---

*Note : le prix plafond BQP est saisi par la personne qui signale (affiché
légalement en rayon), il ne provient pas d'une base officielle centralisée.*
