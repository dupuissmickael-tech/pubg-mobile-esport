"use client";

import { useEffect, useState } from "react";

const NEW_STORE_VALUE = "__nouveau__";

export default function MagasinField() {
  const [magasins, setMagasins] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/magasins")
      .then((res) => res.json())
      .then((data) => setMagasins(Array.isArray(data.magasins) ? data.magasins : []))
      .catch(() => setMagasins([]))
      .finally(() => setLoading(false));
  }, []);

  const isNewStore = selected === NEW_STORE_VALUE || (!loading && magasins.length === 0);

  return (
    <div>
      <label htmlFor="magasin-select" className="mb-1 block text-sm font-medium text-veypri-ink">
        Nom du magasin
      </label>

      {!isNewStore && (
        <select
          id="magasin-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          required
          disabled={loading}
          className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
        >
          <option value="" disabled>
            {loading ? "Chargement…" : "Sélectionnez un magasin"}
          </option>
          {magasins.map((nom) => (
            <option key={nom} value={nom}>
              {nom}
            </option>
          ))}
          <option value={NEW_STORE_VALUE}>+ Ajouter un nouveau magasin</option>
        </select>
      )}

      {isNewStore && (
        <div className="space-y-2">
          <input
            id="magasin-select"
            name="magasin"
            type="text"
            required
            minLength={2}
            maxLength={200}
            placeholder="Ex : Supermarché X, commune"
            className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
          />
          {magasins.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected("")}
              className="text-xs text-veypri-ink/50 underline hover:text-veypri-ink/80"
            >
              Choisir un magasin existant à la place
            </button>
          )}
        </div>
      )}

      {!isNewStore && (
        <input type="hidden" name="magasin" value={selected} />
      )}
    </div>
  );
}
