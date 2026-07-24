import type { Metadata } from "next";
import { listRecentSignalements, type Signalement } from "@/lib/db";

export const metadata: Metadata = {
  title: "Signalements récents — VeyPri",
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Guadeloupe",
});

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default async function SignalementsPage() {
  const signalements = await listRecentSignalements(50);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-veypri-ink">
        Signalements récents
      </h1>
      <p className="mb-8 text-sm text-veypri-ink/70">
        Observations transmises anonymement par des particuliers. Présentées
        telles que soumises, sans jugement sur les magasins cités.
      </p>

      {signalements.length === 0 ? (
        <p className="rounded border border-veypri-ink/10 bg-veypri-ink/[0.02] p-6 text-center text-sm text-veypri-ink/60">
          Aucun signalement pour le moment.
        </p>
      ) : (
        <ul className="space-y-4">
          {signalements.map((s) => (
            <SignalementCard key={s.id} signalement={s} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SignalementCard({ signalement }: { signalement: Signalement }) {
  const {
    magasin,
    produit,
    prix_observe,
    prix_plafond_bqp,
    photo_url,
    created_at,
  } = signalement;

  const ecart = prix_observe - prix_plafond_bqp;
  const date = dateFormatter.format(new Date(created_at));

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-veypri-ink/10 bg-white p-5 shadow-sm sm:flex-row">
      <a
        href={photo_url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo_url}
          alt={`Preuve photo : ${produit} chez ${magasin}`}
          className="h-28 w-28 rounded border border-veypri-ink/10 object-cover"
        />
      </a>
      <div className="flex-1 text-sm">
        <p className="text-veypri-ink">
          Prix relevé le <strong>{date}</strong> chez{" "}
          <strong>{magasin}</strong> : <strong>{produit}</strong> à{" "}
          <strong>{priceFormatter.format(prix_observe)}</strong> — prix
          plafond BQP : <strong>{priceFormatter.format(prix_plafond_bqp)}</strong>
        </p>
        <p
          className={`mt-2 inline-block rounded px-2 py-1 text-xs font-medium ${
            ecart > 0
              ? "bg-veypri-gold/15 text-veypri-ink/80"
              : "bg-veypri-green/10 text-veypri-green"
          }`}
        >
          {ecart > 0
            ? `Écart constaté : +${priceFormatter.format(ecart)} au-dessus du plafond`
            : "Prix conforme ou inférieur au plafond BQP déclaré"}
        </p>
      </div>
    </li>
  );
}
