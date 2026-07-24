# VeyPri

Application citoyenne permettant aux habitants de Guadeloupe de signaler,
de façon anonyme, un écart entre le prix observé en magasin et le prix
plafond officiel du Bouclier Qualité Prix (BQP).

## Fonctionnalités

- Formulaire de signalement (magasin — liste déroulante + ajout libre,
  produit, catégorie, commune, prix observé, prix plafond BQP déclaré,
  photo de l'étiquette comme preuve, date automatique)
- Liste publique des signalements récents, filtrable par catégorie et
  commune, présentation factuelle
- Compteur global de signalements sur la page d'accueil
- Aucun compte, aucune donnée personnelle collectée
- Pages « Comment ça marche » et « Mentions légales »

### Traitement des photos (avant tout stockage)

1. Vérification EXIF (voir « Anti-fraude » ci-dessous)
2. Floutage automatique des visages détectés — toute personne visible sur
   la photo, pas seulement le déclarant (voir limites plus bas)
3. Suppression des métadonnées EXIF (GPS, modèle, horodatage) et
   compression/redimensionnement (1600px max, qualité 80)
4. Calcul d'une empreinte visuelle (hash perceptuel) pour repérer les
   doublons probables, réservé à l'admin

### Sécurité

- Page `/admin` protégée par mot de passe (Basic Auth, `ADMIN_PASSWORD`) —
  badge métadonnées non vérifiées, doublons possibles, compteur de
  signalements suspects
- CAPTCHA Cloudflare Turnstile sur le formulaire (anti-bot)
- En-têtes de sécurité HTTP (CSP, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy)
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

## Floutage des visages : fonctionnement et risques

Chaque photo passe par un détecteur de visages local (`@vladmandic/face-api`,
modèle `tiny_face_detector`) avant stockage ; les zones détectées sont
pixelisées. **Best-effort, jamais bloquant** : si la détection échoue
pour une raison quelconque, la photo est publiée non retouchée plutôt que
de faire échouer tout le signalement.

**Pourquoi ce choix technique :** contrairement à la plupart des modèles
TF.js qui se téléchargent depuis un CDN au premier appel, celui-ci est
embarqué directement dans le paquet npm — aucune photo n'est donc envoyée
à un service tiers pour la détection, et ça fonctionne même si le CDN du
modèle est injoignable (c'est d'ailleurs comme ça que le problème a été
découvert : `tfhub.dev`, la source par défaut, est bloqué dans cet
environnement de développement).

**Risques non vérifiés, à tester après déploiement :**

- **Dépendance native lourde.** Nécessite `@tensorflow/tfjs-node`
  (binaire natif compilé, pas de version JS pure compatible avec ce
  paquet). Sharp fonctionne bien sur Vercel, mais `tfjs-node` est un
  poids beaucoup plus lourd et moins couramment déployé en serverless —
  **son fonctionnement sur les fonctions serverless Vercel n'a pas pu
  être vérifié** (réseau bloqué dans cet environnement de dev). Risques
  concrets : dépassement de la taille limite d'une fonction, temps de
  démarrage à froid allongé (le binaire natif + le modèle doivent se
  charger à chaque cold start), voire incompatibilité pure et simple
  selon la version glibc du runtime Vercel.
- **Dépendances de build vulnérables.** L'installation de `tfjs-node`
  passe par `node-pre-gyp`, qui dépend de versions anciennes de `tar` et
  `adm-zip` : `npm audit` remonte 6 vulnérabilités HIGH et 1 CRITICAL
  (traversée de chemin / zip bomb dans les outils d'installation). Ce
  sont des dépendances d'installation, pas du code exécuté à la demande
  d'un visiteur qui uploade une photo — mais elles restent dans
  `node_modules` et méritent d'être surveillées (`npm audit`) avant une
  mise en production sérieuse.
- **Précision non garantie.** `tiny_face_detector` est le modèle le plus
  léger de la bibliothèque (rapide, mais moins précis que ses
  alternatives plus lourdes) : visages petits, de profil, partiellement
  masqués ou mal éclairés peuvent ne pas être détectés. **Je n'ai pas pu
  tester la détection sur une vraie photo de visage** dans cet
  environnement (pas d'appareil photo, pas de photo réelle disponible ;
  j'ai délibérément évité d'utiliser l'outil de génération d'image
  payant sans votre accord). Le pipeline est validé mécaniquement (charge
  le modèle, tourne sans erreur, ne détecte rien sur une image de test
  synthétique) mais **pas la fiabilité réelle de détection** — à tester
  avec de vraies photos avant de compter dessus pour la confidentialité.

**Recommandation :** traiter cette fonctionnalité comme bêta. Tester
avec une vraie photo contenant un visage dès le premier déploiement, et
prévoir un plan B (ex. modération manuelle des photos avec personnes
visibles) si la fiabilité ou la compatibilité Vercel s'avère insuffisante.

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
| **Vercel Hobby** | Hébergement | Gratuit pour usage non-commercial | Limites de bande passante / temps d'exécution des fonctions ; le floutage de visage (calcul lourd) pourrait consommer plus de temps de fonction que la moyenne |

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
· Vercel Blob (`@vercel/blob`) · `@vladmandic/face-api` + `@tensorflow/tfjs-node`
(floutage de visages) · Cloudflare Turnstile

## Production vs local

| | Local (par défaut) | Production (Vercel) |
|---|---|---|
| Base de données | fichier SQLite local (`./data/veypri.db`) via le même client libSQL | Turso (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`) |
| Photos | disque local (`./uploads`), servies par `/api/uploads/[filename]` | Vercel Blob (`BLOB_READ_WRITE_TOKEN`, fourni automatiquement par Vercel) |
| CAPTCHA | désactivé (pas de clé) | Turnstile actif si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` configurées |

Le code bascule automatiquement selon la présence de ces variables
d'environnement — voir `.env.example`.

---

*Note : le prix plafond BQP est saisi par la personne qui signale (affiché
légalement en rayon), il ne provient pas d'une base officielle centralisée.
Liste des communes de Guadeloupe et catégories de produits établies de
mémoire (voir `lib/constants.ts`) — à vérifier/compléter si besoin.*
