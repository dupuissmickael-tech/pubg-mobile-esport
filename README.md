# PMEsport Hub — Site esport PUBG Mobile

Site web complet dédié à l'esport PUBG Mobile : calendrier des tournois, scores en direct, actualités et fiches des équipes professionnelles. Multilingue (FR/EN), dark mode par défaut, mobile-first, données rafraîchies automatiquement.

> L'architecture détaillée et le schéma de base de données sont documentés dans [ARCHITECTURE.md](./ARCHITECTURE.md).

## Stack

- **Next.js 15** (App Router) + TypeScript, **Tailwind CSS 4**
- **PostgreSQL** (Neon recommandé, Supabase compatible) via **Drizzle ORM**
- **next-intl** pour l'internationalisation (interface + données)
- **Vercel Cron** pour la synchronisation automatique des données
- Source de données tournois/équipes : **API Liquipedia** (MediaWiki API, conforme à leurs conditions d'utilisation)

## Démarrage rapide

```bash
npm install
npm run dev
```

C'est tout : **sans `DATABASE_URL`, le site tourne en mode démo** avec un jeu de données d'exemple intégré (tournoi en cours, match live, compte à rebours, news FR/EN). Idéal pour développer l'interface.

Ouvrez http://localhost:3000 — vous êtes redirigé vers `/en` ou `/fr` selon la langue du navigateur.

## Configuration complète (base de données réelle)

1. **Créer une base PostgreSQL** sur [Neon](https://neon.tech) (ou Supabase) et récupérer la chaîne de connexion.

2. **Configurer l'environnement** :

   ```bash
   cp .env.example .env
   ```

   | Variable | Rôle |
   |---|---|
   | `DATABASE_URL` | Connexion PostgreSQL (pooler serverless conseillé) |
   | `LIQUIPEDIA_USER_AGENT` | User-Agent identifiable **exigé par Liquipedia** — format `MonApp/1.0 (email@contact)` |
   | `LIQUIPEDIA_API_KEY` | Optionnel, si un accès LPDB vous a été accordé |
   | `CRON_SECRET` | Secret protégeant les routes `/api/cron/*` |
   | `ADMIN_TOKEN` | Token protégeant la page `/admin` et les routes `/api/admin/*` |
   | `NEXT_PUBLIC_SITE_URL` | URL canonique du site (RSS, sitemap) |

3. **Créer les tables et charger les données d'exemple.** Deux méthodes équivalentes :

   - **Depuis un terminal** :
     ```bash
     npm run db:push    # applique le schéma Drizzle à la base
     npm run db:seed    # insère le jeu de données d'exemple
     ```
   - **Sans terminal, depuis `/{locale}/admin`** (utile en déployant depuis un téléphone) : ouvrez la page, saisissez `ADMIN_TOKEN`, puis cliquez « Apply schema (migrations) » et « Seed demo data ». Ces boutons appellent respectivement `/api/admin/migrate` (applique les fichiers SQL de `drizzle/`, générés par `npm run db:generate`) et `/api/admin/seed` (vide puis recharge le jeu de données d'exemple).

   ⚠️ Ces deux méthodes nécessitent que l'environnement d'exécution ait un accès réseau direct à la base (c'est le cas de Vercel et de votre machine ; ce n'est **pas** toujours le cas d'un environnement sandboxé dont la politique réseau bloque les connexions brutes vers des bases externes).

## Synchronisation automatique des données

Quatre jobs tournent via Vercel Cron (définis dans `vercel.json`), **1×/jour chacun** — limite du plan Vercel **Hobby** (gratuit), qui rejette tout cron plus fréquent :

| Job | Fréquence | Rôle |
|---|---|---|
| `sync-tournaments` | 1×/jour (05:00 UTC) | Met à jour les tournois **ciblés** (liste `TARGET_TOURNAMENTS` dans `src/lib/sync/tournaments.ts`, actuellement « PUBG Mobile Power Camp 2026 ») et enregistre leurs équipes participantes |
| `sync-teams` | 1×/jour (04:30 UTC) | Complète logo/roster/région des équipes déjà découvertes via les tournois ci-dessus |
| `sync-live` | 1×/jour (06:00 UTC) | Statuts des manches + recalcul du classement général (ne fait rien hors tournoi) |
| `sync-news` | 1×/jour (08:15 UTC) | Génération de news à partir des événements observés (début/fin de tournoi) |

⚠️ **Suivi live pendant un tournoi** : avec une seule exécution quotidienne, `sync-live` ne suffit pas à suivre un tournoi en cours. Pendant un match que vous suivez, ouvrez `/{locale}/admin` sur votre téléphone et tapez le bouton **« Live scores »** toutes les quelques minutes pour rafraîchir manuellement le classement — c'est la même route que le cron, juste déclenchée à la demande. Pour un rafraîchissement automatique toutes les 5 minutes, il faut le **plan Vercel Pro** : dans ce cas, changez le schedule de `sync-live` dans `vercel.json` en `*/5 * * * *`.

- Chaque exécution (automatique ou manuelle) est journalisée dans `sync_logs`, consultable sur **`/{locale}/admin`** (bouton « Forcer la mise à jour », protégé par `ADMIN_TOKEN`).
- Les pages ne lisent **que** la base locale : si l'API Liquipedia est indisponible, le site continue de servir les dernières données connues (fallback naturel).
- Test manuel d'un job en local :

  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sync-tournaments
  ```

### Conformité Liquipedia

- API officielle uniquement (`api.php`), **aucun scraping HTML** ;
- User-Agent identifiable obligatoire sur chaque requête ;
- rate limiting intégré (1 req/30 s pour `action=parse`, 1 req/2 s sinon) et petits lots par exécution ;
- crédit « Données fournies par Liquipedia » dans le pied de page (licence CC-BY-SA 3.0).

## Internationalisation

- Interface : fichiers `src/messages/{en,fr}.json` (ajouter une langue = ajouter un fichier + l'inscrire dans `src/i18n/routing.ts`).
- Données : table `translations` (clé `entity_type + entity_id + field + locale`) avec fallback anglais → valeur brute.
- Détection automatique de la langue du navigateur à la première visite (middleware next-intl), changement manuel via le sélecteur du header (persisté en cookie).

## Ingestion des scores live

`sync-live` recalcule le classement général et l'historique de points **à partir des lignes `match_results`** stockées en base. Pour brancher une source temps réel (API officielle PUBG Mobile Esports, API d'organisateur, saisie manuelle), il suffit d'insérer les résultats de manche dans `matches` + `match_results` : l'affichage (page Live, classements, points kills/placement) suit automatiquement.

## Déploiement sur Vercel

1. **Importer le dépôt** dans Vercel ([vercel.com/new](https://vercel.com/new)) — le framework Next.js est détecté automatiquement, aucun réglage de build à changer.
2. **Renseigner les variables d'environnement** (Project Settings → Environment Variables), pour Production **et** Preview :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | Chaîne de connexion **pooled** de Neon (celle avec `-pooler` dans le nom d'hôte — recommandée pour les fonctions serverless) |
   | `LIQUIPEDIA_USER_AGENT` | `PMEsportHub/1.0 (votre@email.com)` |
   | `CRON_SECRET` | Une valeur secrète générée aléatoirement |
   | `ADMIN_TOKEN` | Une autre valeur secrète générée aléatoirement |
   | `NEXT_PUBLIC_SITE_URL` | L'URL de production, ex. `https://votre-site.vercel.app` |

3. **Déployer.** `vercel.json` enregistre les 4 crons automatiquement (1×/jour chacun, compatible plan Hobby) ; Vercel signe chaque appel avec `Authorization: Bearer $CRON_SECRET`, vérifié par `/api/cron/[job]`. Voir la section « Synchronisation automatique des données » ci-dessus pour le suivi live pendant un tournoi.
4. **Appliquer le schéma et charger les données.** Une fois le déploiement terminé, ouvrez `https://votre-site.vercel.app/{locale}/admin` (fonctionne depuis un téléphone, aucun terminal requis), saisissez `ADMIN_TOKEN`, puis cliquez « Apply schema (migrations) » et, si souhaité, « Seed demo data ».
5. **Vérifier** : toujours sur `/{locale}/admin`, lancez chaque job de synchronisation une fois manuellement pour confirmer que la connexion à la base et à Liquipedia fonctionne en production.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run db:push` | Applique le schéma à la base directement (dev rapide) |
| `npm run db:generate` | Génère les fichiers de migration SQL dans `drizzle/` (à committer) |
| `npm run db:migrate` | Applique les migrations de `drizzle/` (aussi disponible via le bouton `/admin`) |
| `npm run db:seed` | Charge le jeu de données d'exemple (aussi disponible via le bouton `/admin`) |

## Structure du projet

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour l'arborescence commentée, le schéma des tables et les choix techniques.
