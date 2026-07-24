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

Next.js (App Router) · TypeScript · Tailwind CSS · Turso (`@libsql/client`)
· Vercel Blob (`@vercel/blob`)

## Production vs local

| | Local (par défaut) | Production (Vercel) |
|---|---|---|
| Base de données | fichier SQLite local (`./data/veypri.db`) via le même client libSQL | Turso (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`) |
| Photos | disque local (`./uploads`), servies par `/api/uploads/[filename]` | Vercel Blob (`BLOB_READ_WRITE_TOKEN`, fourni automatiquement par Vercel) |

Le code bascule automatiquement selon la présence de ces variables
d'environnement — voir `.env.example`. Aucune configuration nécessaire
pour développer en local.

---

*Note : le prix plafond BQP est saisi par la personne qui signale (affiché
légalement en rayon), il ne provient pas d'une base officielle centralisée.*
