import type { Metadata } from "next";
import {
  listUnverifiedSignalements,
  listFlaggedSignalements,
  listPossibleDuplicates,
} from "@/lib/db";
import { rejectAction } from "./actions";

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
  const [unverified, flagged, duplicates] = await Promise.all([
    listUnverifiedSignalements(),
    listFlaggedSignalements(),
    listPossibleDuplicates(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-veypri-ink">
        Administration VeyPri
      </h1>

      <section className="mb-12">
        <h2 className="mb-1 text-lg font-semibold text-veypri-ink">
          Métadonnées non vérifiées ({unverified.length})
        </h2>
        <p className="mb-4 text-sm text-veypri-ink/60">
          Déjà publiés — ce badge est un signal de modération interne, pas un
          blocage. Beaucoup de photos authentiques perdent leur EXIF en
          transitant par WhatsApp ou Messenger avant l&apos;envoi.
        </p>
        {unverified.length === 0 ? (
          <p className="rounded border border-veypri-ink/10 bg-veypri-ink/[0.02] p-4 text-sm text-veypri-ink/50">
            Aucun signalement avec métadonnées non vérifiées.
          </p>
        ) : (
          <ul className="space-y-4">
            {unverified.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-4 rounded-lg border border-veypri-ink/10 bg-white p-4 sm:flex-row"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.photo_url}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded border border-veypri-ink/10 object-cover"
                />
                <div className="flex-1 text-sm">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-veypri-gold/20 px-2 py-0.5 text-xs font-medium text-veypri-ink/70">
                      Métadonnées non vérifiées
                    </span>
                  </div>
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
                  <div className="mt-3">
                    <form action={rejectAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="rounded border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Rejeter (dépublier)
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-1 text-lg font-semibold text-veypri-ink">
          Doublons possibles ({duplicates.length})
        </h2>
        <p className="mb-4 text-sm text-veypri-ink/60">
          Photos dont l&apos;empreinte visuelle se ressemble fortement
          (probable même photo resoumise). Détection automatique
          approximative — à vérifier visuellement, aucune action
          automatique n&apos;est prise.
        </p>
        {duplicates.length === 0 ? (
          <p className="rounded border border-veypri-ink/10 bg-veypri-ink/[0.02] p-4 text-sm text-veypri-ink/50">
            Aucun doublon probable détecté.
          </p>
        ) : (
          <ul className="space-y-4">
            {duplicates.map((group) => (
              <li
                key={group.signalement.id}
                className="rounded-lg border border-veypri-ink/10 bg-white p-4"
              >
                <div className="flex flex-wrap gap-3">
                  {[group.signalement, ...group.matches].map((s) => (
                    <div key={s.id} className="w-24 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.photo_url}
                        alt=""
                        className="h-24 w-24 rounded border border-veypri-ink/10 object-cover"
                      />
                      <p className="mt-1 truncate text-xs text-veypri-ink/60">
                        {s.magasin}
                      </p>
                      <p className="text-xs text-veypri-ink/40">
                        {dateFormatter.format(new Date(s.created_at))}
                      </p>
                    </div>
                  ))}
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
                  {!s.metadata_verified && (
                    <span className="ml-2 rounded bg-veypri-gold/20 px-2 py-0.5 text-xs font-medium text-veypri-ink/70">
                      Métadonnées non vérifiées
                    </span>
                  )}
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
