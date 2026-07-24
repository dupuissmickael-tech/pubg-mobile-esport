import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { groups } from "../data/groups";

const MODERATION_EMAIL = "dupuissmickael@gmail.com";
const NEW_FICHE = "nouvelle-fiche";

export default function ProposerSource() {
  const [searchParams] = useSearchParams();
  const presetFiche = searchParams.get("fiche") ?? "";

  const [fiche, setFiche] = useState(presetFiche || NEW_FICHE);
  const [url, setUrl] = useState("");
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [copied, setCopied] = useState(false);

  const fichesLabel =
    groups.find((g) => g.id === fiche)?.name ??
    (fiche === NEW_FICHE ? "Nouvelle fiche / nouveau groupe" : fiche);

  const buildMessage = () => {
    const lines = [
      `Fiche concernée : ${fichesLabel}`,
      `Lien de l'article : ${url}`,
      comment ? `Commentaire : ${comment}` : null,
      contact ? `Contact (facultatif) : ${contact}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const mailtoHref = () => {
    const subject = `[KiMèt] Proposition de source — ${fichesLabel}`;
    const body = buildMessage();
    return `mailto:${MODERATION_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    window.location.href = mailtoHref();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-serif text-3xl font-bold text-ink-900 sm:text-4xl">
        Proposer une source
      </h1>
      <p className="mt-3 text-ink-800">
        Vous avez trouvé un article ou un document public qui documente un
        fait économique en Guadeloupe ? Proposez-le pour enrichir ou corriger
        une fiche.
      </p>
      <div className="mt-4 rounded-sm border border-ink-700/20 bg-white p-4 text-sm text-ink-700/80">
        <strong className="text-ink-900">Aucune publication automatique.</strong>{" "}
        Chaque proposition est envoyée à l'équipe de modération de KiMèt et
        vérifiée avant tout ajout au site.
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="fiche" className="block text-sm font-medium text-ink-900">
            Fiche concernée
          </label>
          <select
            id="fiche"
            value={fiche}
            onChange={(e) => setFiche(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink-700/25 bg-white px-3 py-2 text-ink-900 focus:border-marine-600 focus:outline-none"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
                {g.brands.length > 0 ? ` (${g.brands.join(", ")})` : ""}
              </option>
            ))}
            <option value={NEW_FICHE}>Nouvelle fiche / nouveau groupe</option>
          </select>
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-ink-900">
            Lien de l'article ou du document *
          </label>
          <input
            id="url"
            type="url"
            required
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink-700/25 bg-white px-3 py-2 text-ink-900 focus:border-marine-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-ink-900">
            Commentaire (facultatif)
          </label>
          <textarea
            id="comment"
            rows={4}
            placeholder="Quel fait cette source documente-t-elle ? Citation utile, contexte..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink-700/25 bg-white px-3 py-2 text-ink-900 focus:border-marine-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-ink-900">
            Votre email (facultatif, pour vous recontacter)
          </label>
          <input
            id="contact"
            type="email"
            placeholder="vous@exemple.com"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink-700/25 bg-white px-3 py-2 text-ink-900 focus:border-marine-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!url}
            className="rounded-sm bg-marine-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marine-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Envoyer par email
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!url}
            className="rounded-sm border border-ink-700/25 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:border-marine-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copié ✓" : "Copier le message"}
          </button>
        </div>
        <p className="text-xs text-ink-700/60">
          Le bouton « Envoyer par email » ouvre votre client de messagerie
          avec un message pré-rempli à destination de la modération de KiMèt.
          Si rien ne s'ouvre, utilisez « Copier le message » et envoyez-le
          manuellement à {MODERATION_EMAIL}.
        </p>
      </form>
    </div>
  );
}
