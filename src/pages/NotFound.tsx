import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-ink-900">
        Page introuvable
      </h1>
      <Link to="/" className="mt-4 inline-block text-marine-600 hover:underline">
        ← Retour à l'accueil
      </Link>
    </div>
  );
}
