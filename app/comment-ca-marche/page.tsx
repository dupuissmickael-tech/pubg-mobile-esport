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
          <p>
            Le Bouclier Qualité Prix (BQP) est un dispositif réglementaire qui
            plafonne le prix d&apos;une liste de produits de première
            nécessité en Guadeloupe. Chaque magasin concerné doit légalement
            afficher cette liste en rayon.
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
            le prix plafond BQP affiché à côté, et vous joignez une photo de
            l&apos;étiquette comme preuve. Aucune information personnelle
            n&apos;est demandée.
          </p>
          <p>
            Avant l&apos;envoi, la photo est automatiquement retouchée : les
            visages visibles sont floutés et les métadonnées (position GPS,
            heure précise, modèle du téléphone) sont supprimées.
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
            observé, prix plafond. Un système automatique et discret aide à
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
