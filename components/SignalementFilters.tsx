"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCT_CATEGORIES, GUADELOUPE_COMMUNES } from "@/lib/constants";

export default function SignalementFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/signalements${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const categorie = searchParams.get("categorie") ?? "";
  const commune = searchParams.get("commune") ?? "";
  const hasFilters = categorie || commune;

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="filter-categorie" className="mb-1 block text-xs font-medium text-veypri-ink/70">
          Catégorie
        </label>
        <select
          id="filter-categorie"
          value={categorie}
          onChange={(e) => updateParam("categorie", e.target.value)}
          className="rounded border border-veypri-ink/20 px-2 py-1.5 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
        >
          <option value="">Toutes</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-commune" className="mb-1 block text-xs font-medium text-veypri-ink/70">
          Commune
        </label>
        <select
          id="filter-commune"
          value={commune}
          onChange={(e) => updateParam("commune", e.target.value)}
          className="rounded border border-veypri-ink/20 px-2 py-1.5 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
        >
          <option value="">Toutes</option>
          {GUADELOUPE_COMMUNES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push("/signalements")}
          className="rounded px-2 py-1.5 text-xs text-veypri-ink/50 underline hover:text-veypri-ink/80"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
