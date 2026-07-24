import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <section className="text-center">
        <h1 className="mb-4 text-3xl font-bold leading-tight text-veypri-ink sm:text-4xl">
          VeyPri permet à tout citoyen de Guadeloupe de signaler, en une
          minute et de façon anonyme, un écart entre le prix observé en
          magasin et le prix plafond du Bouclier Qualité Prix (BQP).
        </h1>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signaler"
            className="rounded bg-veypri-green px-6 py-3 text-sm font-semibold text-white hover:bg-veypri-green-dark"
          >
            Faire un signalement
          </Link>
          <Link
            href="/signalements"
            className="rounded border border-veypri-green px-6 py-3 text-sm font-semibold text-veypri-green hover:bg-veypri-green hover:text-white"
          >
            Voir les signalements récents
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        <Step
          number="1"
          title="Vous constatez un écart"
          text="Le prix en rayon dépasse le prix plafond BQP affiché dans le même magasin."
        />
        <Step
          number="2"
          title="Vous photographiez l'étiquette"
          text="La photo sert de preuve. Aucune information personnelle n'est demandée."
        />
        <Step
          number="3"
          title="C'est publié, anonymement"
          text="Le signalement rejoint la liste publique, présenté de façon factuelle."
        />
      </section>

      <section className="mt-16 rounded-lg border border-veypri-gold/40 bg-veypri-gold/5 p-6 text-sm text-veypri-ink/70">
        <p>
          Le Bouclier Qualité Prix (BQP) est un dispositif réglementaire qui
          plafonne le prix d&apos;une liste de produits de première nécessité
          en Guadeloupe. VeyPri ne remplace pas les canaux de signalement
          officiels : il donne à chacun un moyen simple d&apos;objectiver les
          écarts constatés sur le terrain.
        </p>
      </section>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-veypri-ink/10 p-5">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-veypri-green text-sm font-bold text-white">
        {number}
      </div>
      <h3 className="mb-1 font-semibold text-veypri-ink">{title}</h3>
      <p className="text-sm text-veypri-ink/70">{text}</p>
    </div>
  );
}
