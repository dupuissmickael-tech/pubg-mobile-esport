import type { Metadata } from "next";
import SignalementForm from "@/components/SignalementForm";

export const metadata: Metadata = {
  title: "Faire un signalement — VeyPri",
};

export default function SignalerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-veypri-ink">
        Faire un signalement
      </h1>
      <p className="mb-8 text-sm text-veypri-ink/70">
        Prend moins d&apos;une minute. Aucun compte, aucune donnée
        personnelle.
      </p>
      <SignalementForm />
    </div>
  );
}
