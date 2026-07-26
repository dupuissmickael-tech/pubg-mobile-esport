import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — VeyPri",
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-veypri-ink">
        Mentions légales
      </h1>

      <div className="mb-8 rounded border border-veypri-gold/40 bg-veypri-gold/5 p-4 text-sm text-veypri-ink/70">
        <strong>À compléter avant mise en ligne publique.</strong> Ce modèle
        ne peut pas être rempli automatiquement : la loi française (LCEN,
        article 6-III) impose d&apos;identifier l&apos;éditeur du site et son
        hébergeur avec des informations réelles, que je n&apos;ai pas la
        possibilité de connaître ou d&apos;inventer. Un particulier
        n&apos;agissant pas à titre professionnel peut, sous certaines
        conditions, garder son identité confidentielle du public tout en la
        communiquant à son hébergeur — vérifiez ce point (par exemple via
        service-public.fr ou un professionnel du droit) avant de choisir
        entre publication du nom ou confidentialité.
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-veypri-ink/80">
        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            Éditeur du site
          </h2>
          <p className="italic text-veypri-ink/50">
            [Nom, prénom ou raison sociale de l&apos;éditeur — ou mention de
            la confidentialité si applicable] <br />
            [Adresse ou, à défaut, moyen de contact] <br />
            [Adresse email de contact]
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            Hébergement
          </h2>
          <p className="italic text-veypri-ink/50">
            [Raison sociale de l&apos;hébergeur, ex. Vercel Inc.] <br />
            [Adresse de l&apos;hébergeur] <br />
            [Contact de l&apos;hébergeur]
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            Nature du site
          </h2>
          <p>
            VeyPri est une initiative citoyenne indépendante, non affiliée à
            l&apos;État, à la préfecture de Guadeloupe ou à la DGCCRF. Le site
            permet de publier, de façon anonyme, des observations de prix en
            magasin comparées au prix que chaque magasin affiche en rayon
            sous le logo du Bouclier Qualité Prix (BQP) — un dispositif qui
            plafonne le prix total d&apos;un panier de produits, pas le prix
            de chaque produit pris individuellement (voir «{" "}
            <a href="/comment-ca-marche" className="underline">
              Comment ça marche
            </a>{" "}
            »).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            Données personnelles
          </h2>
          <p>
            Le formulaire de signalement ne collecte aucune donnée
            personnelle identifiante (ni nom, ni email, ni compte). Les
            photos jointes sont automatiquement retouchées avant publication
            : suppression des métadonnées EXIF (position GPS, horodatage,
            modèle d&apos;appareil). Le floutage automatique des visages
            détectés est temporairement désactivé ; évitez de photographier
            des personnes reconnaissables. Un cookie technique anonyme et
            temporaire (1 heure) limite le nombre de signalements par
            navigateur ; il n&apos;identifie pas l&apos;utilisateur et
            n&apos;est pas partagé avec un tiers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            Contenu publié par les utilisateurs
          </h2>
          <p>
            Les signalements publiés reflètent des observations transmises
            par des particuliers et ne constituent pas une accusation
            formelle. [Adresse email ou formulaire de contact] permet de
            signaler un contenu à retirer.
          </p>
        </section>
      </div>
    </div>
  );
}
