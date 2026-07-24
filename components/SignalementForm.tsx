"use client";

import { useRef, useState, type FormEvent } from "react";
import MagasinField from "@/components/MagasinField";
import TurnstileWidget from "@/components/TurnstileWidget";
import { PRODUCT_CATEGORIES, GUADELOUPE_COMMUNES } from "@/lib/constants";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Status = "idle" | "submitting" | "success" | "error";

export default function SignalementForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoPreview(null);
    setPhotoError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError("Format non supporté : utilisez une photo JPEG, PNG ou WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setPhotoError("La photo dépasse 5 Mo. Choisissez une image plus légère.");
      event.target.value = "";
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/signalements", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setErrorMessage(
          payload?.error ?? "Une erreur est survenue. Merci de réessayer."
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      formRef.current?.reset();
      setPhotoPreview(null);
    } catch {
      setErrorMessage(
        "Impossible d'envoyer le signalement. Vérifiez votre connexion et réessayez."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-veypri-green/30 bg-veypri-green/5 p-6 text-center">
        <p className="mb-4 text-lg font-semibold text-veypri-green">
          Merci, votre signalement anonyme a été enregistré.
        </p>
        <p className="mb-6 text-sm text-veypri-ink/70">
          Aucune information vous concernant n&apos;a été demandée ni
          conservée.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/signalements"
            className="rounded border border-veypri-green px-4 py-2 text-sm font-medium text-veypri-green hover:bg-veypri-green hover:text-white"
          >
            Voir les signalements récents
          </a>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="rounded bg-veypri-green px-4 py-2 text-sm font-medium text-white hover:bg-veypri-green-dark"
          >
            Faire un autre signalement
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-veypri-ink/10 bg-white p-6 shadow-sm"
    >
      <MagasinField />

      <div>
        <label htmlFor="produit" className="mb-1 block text-sm font-medium text-veypri-ink">
          Nom du produit
        </label>
        <input
          id="produit"
          name="produit"
          type="text"
          required
          minLength={2}
          maxLength={200}
          placeholder="Ex : Lait 1L demi-écrémé"
          className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categorie" className="mb-1 block text-sm font-medium text-veypri-ink">
            Catégorie
          </label>
          <select
            id="categorie"
            name="categorie"
            required
            defaultValue=""
            className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
          >
            <option value="" disabled>
              Choisir…
            </option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="commune" className="mb-1 block text-sm font-medium text-veypri-ink">
            Commune
          </label>
          <select
            id="commune"
            name="commune"
            required
            defaultValue=""
            className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
          >
            <option value="" disabled>
              Choisir…
            </option>
            {GUADELOUPE_COMMUNES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="prix_observe"
            className="mb-1 block text-sm font-medium text-veypri-ink"
          >
            Prix observé en magasin (€)
          </label>
          <input
            id="prix_observe"
            name="prix_observe"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max="100000"
            required
            placeholder="Ex : 3.50"
            className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
          />
        </div>

        <div>
          <label
            htmlFor="prix_plafond_bqp"
            className="mb-1 block text-sm font-medium text-veypri-ink"
          >
            Prix plafond BQP affiché en magasin (€)
          </label>
          <input
            id="prix_plafond_bqp"
            name="prix_plafond_bqp"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max="100000"
            required
            placeholder="Ex : 2.90"
            className="w-full rounded border border-veypri-ink/20 px-3 py-2 text-sm focus:border-veypri-green focus:outline-none focus:ring-1 focus:ring-veypri-green"
          />
          <p className="mt-1 text-xs text-veypri-ink/50">
            Cette information doit légalement être affichée en rayon (liste
            BQP).
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="photo" className="mb-1 block text-sm font-medium text-veypri-ink">
          Photo de l&apos;étiquette (preuve)
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={handlePhotoChange}
          className="w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-veypri-green/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-veypri-green hover:file:bg-veypri-green/20"
        />
        {photoError && (
          <p className="mt-1 text-xs text-red-600">{photoError}</p>
        )}
        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoPreview}
            alt="Aperçu de l'étiquette"
            className="mt-3 max-h-48 rounded border border-veypri-ink/10 object-contain"
          />
        )}
        <p className="mt-1 text-xs text-veypri-ink/50">
          JPEG, PNG ou WebP — 5 Mo maximum. La date du signalement est
          enregistrée automatiquement. Cadrez si possible sur
          l&apos;étiquette uniquement : le floutage automatique des
          visages est temporairement désactivé.
        </p>
      </div>

      <div className="rounded border border-veypri-ink/10 bg-veypri-ink/[0.02] p-3 text-xs text-veypri-ink/60">
        Ce formulaire ne demande aucune information personnelle (ni nom, ni
        email, ni compte). Les données de localisation et autres métadonnées
        de la photo sont automatiquement supprimées avant l&apos;envoi. Votre
        signalement est publié anonymement.
      </div>

      <TurnstileWidget />

      {errorMessage && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !!photoError}
        className="w-full rounded bg-veypri-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-veypri-green-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Envoi en cours…" : "Envoyer le signalement"}
      </button>
    </form>
  );
}
