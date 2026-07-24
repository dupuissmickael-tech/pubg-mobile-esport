import type { Metadata } from "next";
import { listPendingSignalements, listFlaggedSignalements } from "@/lib/db";
import { publishAction, rejectAction } from "./actions";

export const metadata: Metadata = {
  title: "Administration — VeyPri",
  robots: { index: false, follow: false },
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

export default async function AdminPage() {
  const [pending, flagged] = await Promise.all([
    listPendingSignalements(),
    listFlaggedSignalements(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-veypri-ink">
        Administration VeyPri
      </h1>

      <section className="mb-12">
        <h2 className="mb-1 text-lg font-semibold text-veypri-ink">
          À vérifier ({pending.length})
        </h2>
        <p className="mb-4 text-sm text-veypri-ink/60">
          Photos sans métadonnées d&apos;appareil exploitables ou hors
          fenêtre de 48h. Non visibles publiquement tant qu&apos;elles ne
          sont pas publiées ici.
        </p>
        {pending.length === 0 ? (
          <p className="rounded border border-veypri-ink/10 bg-veypri-ink/[0.02] p-4 text-sm text-veypri-ink/50">
            Aucun signalement en attente.
          </p>
        ) : (
          <ul className="space-y-4">
            {pending.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-4 rounded-lg border border-veypri-gold/40 bg-veypri-gold/5 p-4 sm:flex-row"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.photo_url}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded border border-veypri-ink/10 object-cover"
                />
                <div className="flex-1 text-sm">
                  <p className="text-veypri-ink">
                    <strong>{s.magasin}</strong> — {s.produit} —{" "}
                    {priceFormatter.format(s.prix_observe)} (plafond{" "}
                    {priceFormatter.format(s.prix_plafond_bqp)})
                  </p>
                  <p className="mt-1 text-xs text-veypri-ink/60">
                    {dateFormatter.format(new Date(s.created_at))}
                  </p>
                  <p className="mt-1 text-xs italic text-veypri-ink/60">
                    Motif : {s.exif_notes}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <form action={publishAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="rounded bg-veypri-green px-3 py-1.5 text-xs font-medium text-white hover:bg-veypri-green-dark"
                      >
                        Publier
                      </button>
                    </form>
                    <form action={rejectAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="rounded border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Rejeter
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold text-veypri-ink">
          Signalements suspects ({flagged.length})
        </h2>
        <p className="mb-4 text-sm text-veypri-ink/60">
          Signalements publiés ayant reçu au moins un clic « Signaler comme
          douteux ». Ce compteur n&apos;est visible que sur cette page.
        </p>
        {flagged.length === 0 ? (
          <p className="rounded border border-veypri-ink/10 bg-veypri-ink/[0.02] p-4 text-sm text-veypri-ink/50">
            Aucun signalement marqué comme douteux.
          </p>
        ) : (
          <ul className="space-y-2">
            {flagged.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded border border-veypri-ink/10 bg-white p-3 text-sm"
              >
                <span>
                  <strong>{s.magasin}</strong> — {s.produit} —{" "}
                  {priceFormatter.format(s.prix_observe)}
                </span>
                <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                  {s.flag_count} signalement{s.flag_count > 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
