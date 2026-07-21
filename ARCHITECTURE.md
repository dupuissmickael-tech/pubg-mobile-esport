# PUBG Mobile Esport — Architecture technique

> Document de proposition à valider **avant** le développement complet.
> Version 1.0 — 2026-07-21

---

## 1. Stack technique

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/ISR natifs, Server Components pour limiter le JS client, déploiement Vercel direct |
| Style | **Tailwind CSS v4** | Mobile-first, dark mode par défaut via `class`, thème clair en option |
| Base de données | **PostgreSQL** (Supabase ou Neon) | Relationnel adapté aux entités liées (équipes ↔ joueurs ↔ tournois ↔ matchs) |
| ORM | **Drizzle ORM** | Léger, typé bout-en-bout, migrations SQL lisibles, fonctionne en serverless (driver HTTP Neon/Supabase) |
| i18n | **next-intl** | Intégration App Router de première classe, routing `/{locale}/…`, détection navigateur + choix manuel persisté en cookie |
| Tâches planifiées | **Vercel Cron → routes `/api/cron/*`** | Pas de worker à héberger ; protégées par `CRON_SECRET` |
| Cache | **ISR + `revalidateTag`** | Pages statiques régénérées ; revalidation courte (60 s) sur les pages live |
| Validation | **Zod** | Validation des payloads externes (Liquipedia) avant insertion en base |
| Hébergement | **Vercel** | Cible demandée |

Langues prévues au lancement : **FR, EN** (extensible ES, PT, AR, ID — l'arabe imposera un support RTL, prévu dans le layout dès le départ via `dir` dynamique).

---

## 2. Arborescence du projet

```
pubg-mobile-esport/
├── src/
│   ├── app/
│   │   ├── [locale]/                    # Tout le site est préfixé par la locale
│   │   │   ├── layout.tsx               # Header, footer (crédit Liquipedia), thème
│   │   │   ├── page.tsx                 # 1. Accueil (matchs 48h, bandeau live, news)
│   │   │   ├── tournaments/
│   │   │   │   ├── page.tsx             # 2. Calendrier + filtres région/tier/date
│   │   │   │   └── [slug]/page.tsx      #    Fiche tournoi (format, prize pool, bracket)
│   │   │   ├── live/page.tsx            # 3. Scores en direct + classement + points/manche
│   │   │   ├── news/
│   │   │   │   ├── page.tsx             # 4. Liste des news + filtres par tag
│   │   │   │   └── [slug]/page.tsx      #    Article
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx             # 5. Grille des équipes (logo, région)
│   │   │   │   └── [slug]/page.tsx      #    Fiche équipe : roster, résultats, transferts
│   │   │   └── admin/page.tsx           # 7. Mini-admin : forcer une sync, voir les logs
│   │   ├── api/
│   │   │   ├── cron/
│   │   │   │   ├── sync-tournaments/route.ts   # Toutes les 6 h
│   │   │   │   ├── sync-teams/route.ts         # 1×/jour
│   │   │   │   ├── sync-live/route.ts          # Toutes les 5 min pendant un tournoi actif
│   │   │   │   └── sync-news/route.ts          # Toutes les 2 h
│   │   │   ├── admin/sync/route.ts      # Déclenchement manuel (token admin)
│   │   │   └── rss/route.ts             # Flux RSS interne des news
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── layout/        # Header, Footer, LocaleSwitcher, ThemeToggle
│   │   ├── home/          # LiveBanner, UpcomingMatches, NewsCards
│   │   ├── tournaments/   # TournamentCard, Filters, Countdown, Bracket
│   │   ├── live/          # Scoreboard, StandingsTable, PointsBreakdown
│   │   ├── teams/         # TeamCard, RosterTable, TransferHistory
│   │   └── ui/            # Primitives partagées (Badge, Card, Tabs, Skeleton…)
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts               # Schéma Drizzle (source de vérité, §3)
│   │   │   ├── index.ts                # Client + helpers
│   │   │   └── queries/                # Requêtes par domaine (teams, tournaments…)
│   │   ├── liquipedia/
│   │   │   ├── client.ts               # Fetch avec User-Agent identifiable + rate limiter
│   │   │   ├── parsers.ts              # Payload API → types internes (validés Zod)
│   │   │   └── types.ts
│   │   ├── sync/
│   │   │   ├── tournaments.ts          # Logique upsert + fallback + log
│   │   │   ├── teams.ts
│   │   │   ├── live.ts
│   │   │   └── news.ts
│   │   ├── i18n/                       # Config next-intl, helpers de traduction des données
│   │   └── utils.ts
│   ├── messages/                       # Traductions de l'interface statique
│   │   ├── fr.json
│   │   └── en.json
│   └── middleware.ts                   # Détection de langue + routing next-intl
├── drizzle/                            # Migrations SQL générées
├── public/                             # Fallback logos, favicon, OG images
├── .env.example
├── drizzle.config.ts
├── vercel.json                         # Définition des crons
└── README.md
```

**Choix structurants :**

- **Server Components par défaut** : les pages lisent la base directement côté serveur ; le client ne reçoit que le HTML + les îlots interactifs (filtres, compte à rebours, sélecteur de langue).
- **La base est la seule source lue par les pages.** Liquipedia n'est *jamais* appelé pendant le rendu d'une page — uniquement par les jobs de sync. C'est ce qui garantit à la fois le respect du rate limiting et le fallback (si l'API tombe, le site continue de servir les dernières données connues).
- **Revalidation ciblée** : chaque job de sync termine par `revalidateTag('tournaments' | 'teams' | 'live' | 'news')` ; les pages live utilisent en plus `revalidate = 60`.

---

## 3. Schéma de base de données

Diagramme des relations :

```
teams ──< players
teams ──< tournament_teams >── tournaments
tournaments ──< matches ──< match_results >── teams
players ──< transfers >── teams (from/to)
news ──< news_tags >── tags
translations (polymorphe : entity_type + entity_id + field + locale)
sync_logs
```

### `teams`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | URL (`/teams/nova-esports`) |
| name | text | Nom court affiché |
| full_name | text NULL | Nom complet officiel |
| logo_url | text NULL | WebP/SVG ; fallback local si absent |
| region | enum `region` | `global, asia, sea, south_asia, mena, europe, na, sa` |
| org_name | text NULL | Organisation mère |
| liquipedia_page | text NULL UNIQUE | Clé de rapprochement pour la sync |
| is_active | boolean default true | |
| created_at / updated_at | timestamptz | |

### `players`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| team_id | uuid FK → teams NULL | NULL = agent libre |
| nickname | text | Pseudo (affichage principal) |
| real_name | text NULL | |
| role | enum `player_role` NULL | `igl, assaulter, support, sniper, scout, coach, sub` |
| country_code | text(2) NULL | ISO 3166-1 pour le drapeau |
| liquipedia_page | text NULL UNIQUE | |
| is_active | boolean default true | |
| created_at / updated_at | timestamptz | |

### `tournaments`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | |
| name | text | |
| tier | enum `tier` | `s, a, b, qualifier` |
| region | enum `region` | |
| start_date / end_date | date | |
| prize_pool | numeric NULL | |
| prize_currency | text(3) default 'USD' | |
| format | text NULL | Ex. « 20 équipes, points system SUPER » |
| status | enum `tournament_status` | `upcoming, ongoing, completed` — calculé à la sync |
| stream_url | text NULL | Twitch/YouTube officiel |
| bracket_data | jsonb NULL | Structure de bracket si disponible |
| liquipedia_page | text NULL UNIQUE | |
| created_at / updated_at | timestamptz | |

### `tournament_teams` (participations + classement général)
| Colonne | Type | Notes |
|---|---|---|
| tournament_id | uuid FK | PK composite (tournament_id, team_id) |
| team_id | uuid FK | |
| seed | int NULL | |
| final_rank | int NULL | |
| total_points | int default 0 | Classement général, mis à jour par sync-live |
| total_kills | int default 0 | |

### `matches` (une manche / map jouée ou planifiée)
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tournament_id | uuid FK → tournaments | |
| stage | text NULL | « Group Stage – Day 2 », « Grand Finals »… |
| match_number | int NULL | N° de manche dans la journée |
| map | text NULL | Erangel, Miramar… |
| scheduled_at | timestamptz | Sert au « prochaines 48 h » et au bandeau live |
| status | enum `match_status` | `scheduled, live, completed, cancelled` |
| stream_url | text NULL | Override du stream tournoi si besoin |
| created_at / updated_at | timestamptz | |

### `match_results` (points par équipe et par manche)
| Colonne | Type | Notes |
|---|---|---|
| match_id | uuid FK | PK composite (match_id, team_id) |
| team_id | uuid FK | |
| placement | int | 1–20 (mode Battle Royale) |
| kills | int | |
| placement_points | int | Selon le barème du tournoi |
| kill_points | int | En général 1 pt/kill |
| total_points | int | placement_points + kill_points |

> L'historique « points par manche » (fonctionnalité 3) sort directement de cette table ; le classement général de `tournament_teams` en est l'agrégat.

### `transfers`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| player_id | uuid FK → players | |
| from_team_id | uuid FK NULL | NULL = arrivée depuis le statut libre |
| to_team_id | uuid FK NULL | NULL = départ (inactif/libre) |
| transfer_date | date | |
| source_url | text NULL | |

### `news`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | |
| title / excerpt / body | text | Langue par défaut (EN) ; traductions via `translations` |
| cover_url | text NULL | |
| source_name / source_url | text NULL | Crédit de la source agrégée |
| published_at | timestamptz | |
| created_at / updated_at | timestamptz | |

### `tags` + `news_tags`
`tags(id, slug UNIQUE, label)` — `transferts, resultats, tournois, patch-notes` — et table de jonction `news_tags(news_id, tag_id)` PK composite.

### `translations` (traduction des **données**, pas seulement de l'UI)
| Colonne | Type | Notes |
|---|---|---|
| entity_type | text | `tournament, news, tag, team` |
| entity_id | uuid | |
| field | text | `name, title, excerpt, body, format…` |
| locale | text(5) | `fr, en, es…` |
| value | text | |

PK composite `(entity_type, entity_id, field, locale)`. Helper `translate(entity, field, locale)` avec fallback : locale demandée → EN → valeur brute de la table d'origine. L'UI statique (boutons, menus) reste dans `messages/*.json` via next-intl.

### `sync_logs`
| Colonne | Type | Notes |
|---|---|---|
| id | bigserial PK | |
| job | text | `tournaments, teams, live, news, manual` |
| status | enum | `success, partial, error` |
| items_upserted | int | |
| error_message | text NULL | |
| started_at / finished_at | timestamptz | |

Affiché dans `/admin` pour vérifier que les jobs tournent (fonctionnalité 7).

---

## 4. Intégration Liquipedia (conforme aux conditions d'utilisation)

1. **API officielle uniquement** : MediaWiki API (`action=query`, `action=parse`) de `liquipedia.net/pubgmobile`, ou LPDB API si une clé d'accès est obtenue. **Aucun scraping HTML.**
2. **User-Agent identifiable** obligatoire sur chaque requête : `PubgMobileEsportHub/1.0 (contact@…; +https://<domaine>)` — configuré via `LIQUIPEDIA_USER_AGENT`.
3. **Rate limiting** : limiteur intégré au client (1 requête / 30 s pour `action=parse`, 1 / 2 s pour les autres, conformément aux règles Liquipedia) + les crons espacés font que le site ne dépend jamais d'un appel temps réel.
4. **Cache local = la base PostgreSQL.** Les pages ne lisent que la base ; si l'API est indisponible, le job log une erreur dans `sync_logs` et le site sert les dernières données connues (fallback naturel).
5. **Crédit** : « Données fournies par Liquipedia » avec lien, dans le footer de toutes les pages (licence CC-BY-SA 3.0).

## 5. Jobs planifiés (`vercel.json`)

| Job | Fréquence | Rôle |
|---|---|---|
| `sync-tournaments` | toutes les 6 h | Tournois à venir/en cours/passés, statuts, équipes qualifiées |
| `sync-teams` | 1×/jour | Équipes, rosters, transferts |
| `sync-live` | toutes les 5 min | Ne fait rien s'il n'y a aucun tournoi `ongoing` ; sinon scores, résultats de manche, classement |
| `sync-news` | toutes les 2 h | Agrégation des annonces/actualités |

Chaque route vérifie l'en-tête `Authorization: Bearer ${CRON_SECRET}`. Le bouton « Forcer la mise à jour » de `/admin` appelle les mêmes fonctions de sync avec `ADMIN_TOKEN`.

## 6. Variables d'environnement (`.env.example`)

```
DATABASE_URL=              # PostgreSQL (Supabase/Neon, pooler serverless)
LIQUIPEDIA_USER_AGENT=     # UA identifiable exigé par Liquipedia
LIQUIPEDIA_API_KEY=        # Optionnel (LPDB)
CRON_SECRET=               # Protège /api/cron/*
ADMIN_TOKEN=               # Protège /admin et /api/admin/*
NEXT_PUBLIC_SITE_URL=      # URL canonique (RSS, OG, sitemap)
```

## 7. Design & UX

- **Dark mode par défaut** (`<html class="dark">`), toggle clair/sombre persisté en `localStorage` + cookie (pas de flash au chargement).
- **Mobile-first** : navigation header compacte + menu burger, tableaux de classement scrollables horizontalement, cartes empilées.
- **Performance** : `next/image` (WebP/AVIF automatique), lazy loading natif sur les listes, `Skeleton` pendant les revalidations, polices via `next/font`.
- **Header** : Accueil · Tournois · Live · News · Équipes · sélecteur de langue (codes courts FR/EN…).

---

## Prochaine étape

Une fois cette structure validée (ou amendée), le développement complet suit ce plan :

1. Scaffold Next.js + Tailwind + next-intl + Drizzle, schéma et migrations
2. Seed de données réalistes (équipes/tournois PMGC, PMSL…) pour développer sans dépendre de l'API
3. Pages et composants (accueil → tournois → équipes → news → live → admin)
4. Client Liquipedia + jobs de sync + logs
5. README complet (installation, env, déploiement Vercel)
