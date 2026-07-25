import type { Metadata } from "next";
import { headers } from "next/headers";
import SignalementForm from "@/components/SignalementForm";

export const metadata: Metadata = {
  title: "Faire un signalement — VeyPri",
};

export default async function SignalerPage() {
  // Le nonce (posé par middleware.ts) doit être transmis explicitement au
  // <Script> du widget Turnstile : sous 'strict-dynamic', le domaine
  // autorisé dans le CSP est ignoré par la spec pour tout script qui n'a
  // ni nonce ni lien de confiance avec un script déjà noncé.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-veypri-ink">
        Faire un signalement
      </h1>
      <p className="mb-8 text-sm text-veypri-ink/70">
        Prend moins d&apos;une minute. Aucun compte, aucune donnée
        personnelle.
      </p>
      <SignalementForm nonce={nonce} />
    </div>
  );
}
