# VeyPri

Application citoyenne permettant aux habitants de Guadeloupe de signaler,
de façon anonyme, un écart entre le prix observé en magasin et le prix
que ce magasin affiche lui-même en rayon sous le logo du Bouclier Qualité
Prix (BQP). **Important** : le BQP ne fixe pas de prix plafond par
produit — seulement un prix plafond pour le panier total (105 produits
pour 306 € en 2025, négocié chaque année entre l'État et les distributeurs
volontaires). Le prix affiché sous le logo BQP en rayon est celui que
chaque magasin choisit pour respecter son engagement de panier global, pas
un plafond officiel individuel. Voir « Comment ça marche » dans
l'application pour le détail.

## Fonctionnalités

- Formulaire de signalement (magasin — liste déroulante + ajout libre,
  produit, catégorie, commune, prix observé, prix affiché en rayon sous
  le logo BQP,
  photo de l'étiquette comme preuve, date automatique)
- Liste publique des signalements récents, filtrable par catégorie et
  commune, présentation factuelle
- Compteur global de signalements sur la page d'accueil
- Aucun compte, aucune donnée personnelle collectée
- Pages « Comment ça marche » et « Mentions légales »

### Traitement des photos (avant tout stockage)

1. Vérification EXIF (voir « Anti-fraude » ci-dessous)
2. ~~Floutage automatique des visages détectés~~ — **temporairement
   désactivé**, voir « Floutage des visages » plus bas
3. Suppression des métadonnées EXIF (GPS, modèle, horodatage) et
   compression/redimensionnement (1600px max, qualité 80)
4. Calcul d'une empreinte visuelle (hash perceptuel) pour repérer les
   doublons probables, réservé à l'admin

### Sécurité

- Page `/admin` protégée par mot de passe (Basic Auth, `ADMIN_PASSWORD`) —
  badge métadonnées non vérifiées, doublons possibles, compteur de
  signalements suspects
- CAPTCHA Cloudflare Turnstile sur le formulaire (anti-bot)
- En-têtes de sécurité HTTP posés par `middleware.ts` (CSP par nonce
  généré à chaque requête + `strict-dynamic`, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Le nonce
  est lu dans `app/layout.tsx` (`headers()`), ce qui force tout le site
  en rendu dynamique — nécessaire pour que le nonce embarqué dans le HTML
  corresponde toujours à celui de l'en-tête CSP ; sans ça, les pages
  encore prérendues statiquement embarqueraient un nonce périmé et
  casseraient la CSP en production (bug rencontré et corrigé)
- Bouton « Signaler comme douteux » sur chaque entrée publique
- Limite de 3 signalements par heure et par navigateur (anti-spam)
- Aucun outil de tracking/analytics (voir détail plus bas)

## Anti-fraude : ce qui est fait, et ses limites

Avant de supprimer les métadonnées EXIF d'une photo, VeyPri vérifie
qu'elle contient un modèle d'appareil et une date de prise de vue dans
les dernières 48h. **Le signalement est publié immédiatement dans tous
les cas** — le résultat sert uniquement de badge de modération interne
(« métadonnées non vérifiées »), visible seulement sur `/admin`, jamais
par le public. Ce choix est délibéré : bloquer la publication aurait
pénalisé de vrais citoyens (voir plus bas), pour un gain anti-fraude
limité puisque les métadonnées se falsifient facilement de toute façon.

**Ce que ça détecte :** les captures d'écran, les images réutilisées ou
téléchargées ailleurs, et les photos dont les métadonnées ont été
supprimées en cours de route (par ex. par une appli de messagerie) — de
quoi orienter une revue manuelle a posteriori, sans jamais retarder la
publication.

**Ce que ça ne détecte PAS :**

- **Les métadonnées EXIF falsifiées volontairement.** N'importe quel
  outil gratuit (exiftool, etc.) permet de réécrire le modèle d'appareil
  et la date avant l'envoi. Cette vérification arrête la négligence, pas
  la fraude déterminée.
- **Un badge « non vérifié » à tort sur une vraie photo.** Beaucoup
  d'utilisateurs s'envoient leur photo via WhatsApp/Messenger/Signal
  avant de l'uploader — ces applis suppriment souvent l'EXIF à l'envoi.
  Une photo 100 % authentique peut donc porter ce badge en interne, sans
  aucune conséquence publique puisqu'elle reste publiée normalement.
- **Le contenu de la photo.** Rien ne vérifie qu'elle montre vraiment le
  magasin et le produit déclarés dans le formulaire — une photo récente
  et authentique d'une autre étiquette, ou d'un prix modifié à la main,
  passerait la vérification sans problème.
- **La géolocalisation.** Le GPS n'est jamais lu ni comparé au magasin
  déclaré — choix délibéré pour ne jamais retenir cette donnée, même
  temporairement, au prix d'un signal anti-fraude en moins.
- **Le bouton « Signaler comme douteux ».** Aucune authentification :
  une seule personne (ou un magasin visé) peut cliquer plusieurs fois
  depuis différents navigateurs pour gonfler ou fausser le signal.
  Protection anti-rejeu uniquement côté client (localStorage), donc
  contournable en vidant le stockage du navigateur.
- **La limite de 3/heure.** Contournable en vidant les cookies, en
  navigation privée, ou simplement avec un autre appareil. C'est une
  friction anti-spam basique, pas un contrôle de sécurité.
- **Le CAPTCHA Turnstile.** Ralentit les bots automatisés simples ; ne
  bloque pas quelqu'un prêt à résoudre le défi manuellement ou à payer un
  service de résolution de CAPTCHA.

### Détection de doublons (hash perceptuel)

`/admin` regroupe les signalements dont l'empreinte visuelle des photos
se ressemble fortement (probable même photo resoumise, avec prix ou
magasin différents). C'est une comparaison approximative (dHash 64 bits,
distance de Hamming ≤ 10) : elle repère les quasi-doublons évidents
(même photo, légère recompression) mais peut manquer une photo reprise
sous un angle différent, et ne prend aucune action automatique — c'est
un signal pour la modération humaine, pas un filtre.

En résumé : cette couche relève la barre contre le spam et les erreurs
grossières, elle n'empêche pas un acteur motivé de publier un faux
signalement plausible.

## Floutage des visages : DÉSACTIVÉ pour ce déploiement

**Statut actuel : retiré du pipeline, pas seulement inactif.** Pour ce
premier déploiement avec de vrais utilisateurs, la dépendance
`@tensorflow/tfjs-node` (+ `@tensorflow/tfjs` + `@vladmandic/face-api`)
a été complètement désinstallée, pas juste désactivée par un flag —
cela élimine aussi le risque que le *build* Vercel lui-même échoue à
cause du binaire natif (pas seulement un risque à l'exécution). Le
formulaire, la page « Comment ça marche » et les mentions légales ont
été corrigés en conséquence : ils ne promettent plus de floutage tant
qu'il n'est pas réactivé et revérifié.

**Pourquoi ce retrait, en résumé** (détails complets dans l'historique
git, commit `39306da`) :
- Dépendance native lourde, jamais vérifiée sur les fonctions serverless
  Vercel (réseau bloqué dans l'environnement de développement) — risque
  de taille de fonction, cold start, ou incompatibilité pure et simple.
- Ses dépendances d'installation (`node-pre-gyp`/`tar`/`adm-zip`)
  portaient 6 vulnérabilités HIGH + 1 CRITICAL.
- Fiabilité de détection jamais testée sur une vraie photo de visage
  (seulement un pipeline validé mécaniquement sur image synthétique).

**En attendant, le formulaire invite les déclarants à cadrer sur
l'étiquette et à éviter de photographier des personnes reconnaissables.**

### Réactiver le floutage plus tard

1. Récupérer le code retiré :
   `git show 39306da:lib/faceBlur.ts > lib/faceBlur.ts`
2. Réinstaller les dépendances :
   `npm install @tensorflow/tfjs @tensorflow/tfjs-node @vladmandic/face-api`
3. Dans `lib/upload.ts`, réimporter `blurFaces` et rétablir l'appel
   `await blurFaces(rawBuffer)` avant `stripMetadataAndCompress` (voir
   le diff du commit `39306da` pour l'emplacement exact).
4. Retirer les mentions « temporairement désactivé » dans
   `components/SignalementForm.tsx`, `app/comment-ca-marche/page.tsx` et
   `app/mentions-legales/page.tsx`.
5. **Tester avec une vraie photo contenant un visage en local, puis sur
   un déploiement preview Vercel**, avant toute mise en production —
   c'est précisément ce qui n'a pas pu être fait la première fois.

## Tracking et vie privée

Aucune bibliothèque d'analytics ou de tracking n'est présente dans le
code ou les dépendances (vérifié par recherche exhaustive dans le code
et `package.json`). Nuance à connaître : **Cloudflare Turnstile exécute
un script tiers dans le navigateur du visiteur** pour son évaluation
anti-bot. Turnstile est conçu pour être plus respectueux de la vie
privée qu'un reCAPTCHA classique (pas de profilage publicitaire, pas de
cookie tiers persistant par défaut), mais ce n'est techniquement pas «
zéro code tiers » — c'est un compromis accepté en échange de la
protection anti-bot demandée.

## Services tiers : coûts et limites gratuites

| Service | Rôle | Forfait gratuit | Limite à surveiller |
|---|---|---|---|
| **Turso** | Base de données | ~9 Go stockage, 1 milliard de lectures/mois (offre gratuite actuelle, à reconfirmer sur turso.tech) | Au-delà : passage payant |
| **Vercel Blob** | Stockage des photos | Quota inclus dans le plan Vercel Hobby (faible, de l'ordre du Go) | Peut se remplir vite avec des photos ; suivre l'usage dans le dashboard Vercel |
| **Cloudflare Turnstile** | CAPTCHA | Gratuit, sans limite de volume publiée | Nécessite un compte Cloudflare (gratuit) |
| **Vercel Hobby** | Hébergement | Gratuit pour usage non-commercial | Limites de bande passante / temps d'exécution des fonctions |

Chiffres à reconfirmer sur les sites officiels au moment de la mise en
production — les forfaits gratuits évoluent.

## Démarrer en local

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000). Aucune
variable d'environnement n'est requise pour développer en local (voir
`.env.example` pour ce qui bascule automatiquement en mode « repli »).

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Turso (`@libsql/client`)
· Vercel Blob (`@vercel/blob`) · Cloudflare Turnstile

(`@vladmandic/face-api` + `@tensorflow/tfjs-node` pour le floutage de
visages, actuellement retirés — voir section dédiée ci-dessus)

## Production vs local

| | Local (par défaut) | Production (Vercel) |
|---|---|---|
| Base de données | fichier SQLite local (`./data/veypri.db`) via le même client libSQL | Turso (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`) |
| Photos | disque local (`./uploads`), servies par `/api/uploads/[filename]` | Vercel Blob (`BLOB2_READ_WRITE_TOKEN`, store public, fourni automatiquement par Vercel) |
| CAPTCHA | désactivé (pas de clé) | Turnstile actif si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` configurées |

Le code bascule automatiquement selon la présence de ces variables
d'environnement — voir `.env.example`.

---

*Note : le BQP ne plafonne pas le prix de chaque produit individuellement,
seulement le prix total du panier (105 produits pour 314 € + 60 € pour les
6 produits multimédia/automobile selon l'Accord de Modération de Prix
Guadeloupe 2024, source de `PRODUCT_CATEGORIES` et `BQP_PRODUCTS` dans
`lib/constants.ts` — ce montant total est renégocié chaque année, 306 €
pour l'accord 2025 selon les informations les plus récentes). Chaque
magasin répartit ce budget comme il le souhaite entre les produits du
panier et affiche en rayon le prix qu'il a lui-même choisi pour chacun ;
c'est ce prix, saisi par la personne qui signale tel qu'affiché en rayon,
qu'enregistre le champ « prix affiché sous le logo BQP » du formulaire —
il n'existe donc pas de base de prix officielle centralisée par produit à
interroger. Liste des communes de Guadeloupe établie de mémoire (à
vérifier/compléter si besoin) ; liste des produits et catégories extraite
du document officiel fourni (accord 2024) — à mettre à jour si un nouvel
accord est publié.*
