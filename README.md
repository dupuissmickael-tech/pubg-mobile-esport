# StatDrop

Application web pour consulter les statistiques de joueurs PUBG (kills, dégâts,
classement, Chicken Dinner) via l'API officielle [developer.pubg.com](https://developer.pubg.com).

## Stack

- Backend : Node.js + Express
- Frontend : HTML / CSS / JS vanilla
- Cache mémoire + rate limiter pour respecter la limite de 10 requêtes/minute de l'API PUBG

## Installation

```bash
npm install
cp .env.example .env
```

Édite `.env` et renseigne ta clé API PUBG (générée sur https://developer.pubg.com) :

```
PUBG_API_KEY=ta_cle_api
PORT=3000
```

## Lancer le serveur

```bash
npm start
```

Puis ouvre http://localhost:3000

## Fonctionnement

1. La page d'accueil propose un formulaire : pseudo PUBG + plateforme (Steam, Xbox, PlayStation).
2. Le backend interroge l'API PUBG pour retrouver le joueur, puis récupère le détail
   de ses 5 dernières parties.
3. Les résultats (mode, date, kills, dégâts, classement, Chicken Dinner) s'affichent
   dans un tableau.
4. Les réponses de l'API PUBG sont mises en cache en mémoire (2 min pour les joueurs,
   30 min pour les parties, car une partie terminée ne change jamais) et les appels
   sortants sont mis en file d'attente pour ne jamais dépasser 10 requêtes/minute.

## Structure du projet

```
server.js                  Point d'entrée Express
src/routes/players.js      Route GET /api/player
src/services/pubgApi.js     Appels à l'API PUBG (shards, joueur, parties)
src/utils/cache.js          Cache mémoire simple avec TTL
src/utils/rateLimiter.js    File d'attente à fenêtre glissante (10 req/min)
public/                     Frontend (index.html, css/, js/)
```
