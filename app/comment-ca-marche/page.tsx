import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comment ça marche — VeyPri",
};

export default function CommentCaMarchePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-veypri-ink">
        Comment ça marche
      </h1>

      <div className="space-y-8 text-sm leading-relaxed text-veypri-ink/80">
        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            1. Le Bouclier Qualité Prix, en bref
          </h2>
          <p className="mb-3">
            Le Bouclier Qualité Prix (BQP) est un accord négocié chaque année
            entre l&apos;État et les distributeurs volontaires de
            Guadeloupe. Contrairement à une idée reçue, <strong>il ne fixe
            pas de prix plafond pour chaque produit pris individuellement</strong> :
            il plafonne uniquement le prix total d&apos;un panier de 105
            produits de première nécessité (306 € pour l&apos;ensemble du
            panier en 2025).
          </p>
          <p>
            Chaque magasin participant reste libre de répartir ce budget
            comme il le souhaite entre les produits du panier. C&apos;est
            donc le magasin lui-même — pas un texte officiel — qui choisit
            le prix affiché en rayon sous le logo BQP pour chaque produit.
            Ce que VeyPri permet de signaler, c&apos;est l&apos;écart entre
            ce prix affiché par le magasin et le prix réellement pratiqué,
            pas une violation d&apos;un plafond officiel par produit qui
            n&apos;existe dans aucun document.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            2. Faire un signalement
          </h2>
          <p className="mb-2">
            Sur la page{" "}
            <Link href="/signaler" className="text-veypri-green underline">
              Faire un signalement
            </Link>
            , vous indiquez le magasin, le produit, le prix observé en rayon,
            le prix que le magasin affiche à côté sous le logo BQP, et vous
            joignez une photo de l&apos;étiquette comme preuve. Aucune
            information personnelle n&apos;est demandée.
          </p>
          <p>
            Avant l&apos;envoi, la photo est automatiquement retouchée :
            les métadonnées (position GPS, heure précise, modèle du
            téléphone) sont supprimées. Le floutage automatique des
            visages est temporairement désactivé le temps d&apos;être
            testé plus largement — cadrez si possible sur
            l&apos;étiquette uniquement.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            3. Publication
          </h2>
          <p>
            Le signalement est publié immédiatement sur la{" "}
            <Link href="/signalements" className="text-veypri-green underline">
              liste publique
            </Link>
            , présenté de façon factuelle : date, magasin, produit, prix
            observé, prix affiché sous le logo BQP. Un système automatique et discret aide à
            repérer les signalements douteux ou les doublons pour la
            modération, sans jamais retarder la publication d&apos;un
            signalement authentique.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-veypri-ink">
            4. Ce que VeyPri n&apos;est pas
          </h2>
          <p>
            VeyPri ne remplace pas les canaux de signalement officiels et ne
            constitue pas une accusation formelle envers un magasin. Pour un
            signalement ayant une portée légale, utilisez{" "}
            <a
              href="https://signal.conso.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-veypri-green underline"
            >
              SignalConso
            </a>{" "}
            (DGCCRF).
          </p>
        </section>
      </div>
    </div>
  );
}
