# VeyPri

Application citoyenne permettant aux habitants de Guadeloupe de signaler,
de façon anonyme, un écart entre le prix observé en magasin et le prix
plafond officiel du Bouclier Qualité Prix (BQP).

## Fonctionnalités (v1)

- Formulaire de signalement (magasin, produit, prix observé, prix plafond
  BQP déclaré, photo de l'étiquette comme preuve, date automatique)
- Liste publique des signalements récents, présentation factuelle
- Aucun compte, aucune donnée personnelle collectée
- Suppression automatique des métadonnées EXIF (GPS, modèle, horodatage)
  des photos avant stockage
- Vérification anti-fraude légère (voir ci-dessous) + file de modération
- Bouton « Signaler comme douteux » sur chaque entrée publique
- Limite de 3 signalements par heure et par navigateur (anti-spam)
- Page `/admin` protégée par mot de passe (file de modération, compteur
  de signalements suspects)

## Anti-fraude : ce qui est fait, et ses limites

Avant de supprimer les métadonnées EXIF d'une photo, VeyPri vérifie
qu'elle contient un modèle d'appareil et une date de prise de vue dans
les dernières 48h. Si ce n'est pas le cas, le signalement est mis de
côté dans une file de modération (`/admin`) au lieu d'être publié
immédiatement.

**Ce que ça détecte :** les captures d'écran, les images réutilisées ou
téléchargées ailleurs, et les photos dont les métadonnées ont été
supprimées en cours de route (par ex. par une appli de messagerie).

**Ce que ça ne détecte PAS :**

- **Les métadonnées EXIF falsifiées volontairement.** N'importe quel
  outil gratuit (exiftool, etc.) permet de réécrire le modèle d'appareil
  et la date avant l'envoi. Cette vérification arrête la négligence, pas
  la fraude déterminée.
- **Les faux positifs sur de vraies photos.** Beaucoup d'utilisateurs
  s'envoient leur photo via WhatsApp/Messenger/Signal avant de l'uploader
  — ces applis suppriment souvent l'EXIF à l'envoi. Une photo 100 %
  authentique peut donc atterrir dans la file de modération. À surveiller
  une fois en usage réel : si la file se remplit trop, le seuil devra
  être assoupli.
- **Le contenu de la photo.** Rien ne vérifie qu'elle montre vraiment le
  magasin et le produit déclarés dans le formulaire — une photo récente
  et authentique d'une autre étiquette, ou d'un prix modifié à la main,
  passerait la vérification sans problème.
- **La géolocalisation.** Le GPS n'est jamais lu ni comparé au magasin
  déclaré — choix délibéré pour ne jamais retenir cette donnée, même
  temporairement, au prix d'un signal anti-fraude en moins.
- **Les doublons.** La même photo peut être soumise plusieurs fois sous
  des prétextes différents ; aucune détection de similarité d'image
  n'est en place.
- **Le bouton « Signaler comme douteux ».** Aucune authentification :
  une seule personne (ou un magasin visé) peut cliquer plusieurs fois
  depuis différents navigateurs pour gonfler ou fausser le signal.
- **La limite de 3/heure.** Contournable en vidant les cookies, en
  navigation privée, ou simplement avec un autre appareil. C'est une
  friction anti-spam basique, pas un contrôle de sécurité.

En résumé : cette couche relève la barre contre le spam et les erreurs
grossières, elle n'empêche pas un acteur motivé de publier un faux
signalement plausible.

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
