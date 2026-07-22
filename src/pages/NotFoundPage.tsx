import {Link} from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <p className="mb-2 text-5xl font-black text-accent-500">404</p>
      <h1 className="mb-2 text-xl font-bold text-white">Page introuvable</h1>
      <p className="mb-6 text-slate-400">Cette page n'existe pas ou a été déplacée.</p>
      <Link
        to="/"
        className="inline-block rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-accent-400"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
