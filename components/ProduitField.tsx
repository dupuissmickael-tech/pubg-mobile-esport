"use client";

import { useState } from "react";
import { BQP_PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/constants";

const OTHER_VALUE = "__autre__";

export default function ProduitField({
  onCategorieHint,
}: {
  onCategorieHint: (categorie: string) => void;
}) {
  const [mode, setMode] = useState<"list" | "other">("list");
  const [selected, setSelected] = useState("");

  function handleSelectChange(value: string) {
    if (value === OTHER_VALUE) {
      setMode("other");
      setSelected("");
      return;
    }
    setSelected(value);
    const product = BQP_PRODUCTS.find((p) => p.nom === value);
    if (product) onCategorieHint(product.categorie);
  }

  return (
    <div>
      <label htmlFor="produit-select" className="mb-1 block text-sm font-medium text-veypri-ink">
        Nom du produit
      </label>

      {mode === "list" ? (
        <select
          id="produit-select"
          value={selected}
          onChange={(e) => handleSelectChange(e.target.value)}
          required
          className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
        >
          <option value="" disabled>
            Sélectionnez un produit du panier BQP, ou « Autre »
          </option>
          {PRODUCT_CATEGORIES.filter((c) => c !== "Autre").map((categorie) => {
            const products = BQP_PRODUCTS.filter((p) => p.categorie === categorie);
            if (products.length === 0) return null;
            return (
              <optgroup key={categorie} label={categorie}>
                {products.map((p) => (
                  <option key={p.nom} value={p.nom}>
                    {p.nom}
                    {p.quantiteNominale ? ` (${p.quantiteNominale})` : ""}
                  </option>
                ))}
              </optgroup>
            );
          })}
          <option value={OTHER_VALUE}>+ Autre produit (non listé)</option>
        </select>
      ) : (
        <div className="space-y-2">
          <input
            id="produit-select"
            name="produit"
            type="text"
            required
            minLength={2}
            maxLength={200}
            placeholder="Ex : Lait 1L demi-écrémé"
            className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
          />
          <button
            type="button"
            onClick={() => setMode("list")}
            className="text-xs text-veypri-ink/50 underline hover:text-veypri-ink/80"
          >
            Choisir un produit de la liste BQP à la place
          </button>
        </div>
      )}

      {mode === "list" && <input type="hidden" name="produit" value={selected} />}

      <p className="mt-1 text-xs text-veypri-ink/50">
        Liste issue de l&apos;Annexe 1 du Bouclier Qualité Prix 2024 (105
        produits). Le prix plafond n&apos;y figure pas : il reste à
        renseigner ci-dessous, tel qu&apos;affiché en rayon.
      </p>
    </div>
  );
}
