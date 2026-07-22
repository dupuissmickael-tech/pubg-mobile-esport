import {Link} from 'react-router-dom';
import {comingSoon} from '@/data/modules';

export default function ComingSoonPage() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="mb-3 text-4xl">🚧</p>
      <h1 className="mb-2 text-2xl font-black text-white">{comingSoon.title}</h1>
      <p className="mb-8 text-slate-400">{comingSoon.summary}</p>
      <ul className="mb-8 space-y-2 text-left text-sm text-slate-500">
        <li>• Gestion du matériel et des armes par phase de jeu</li>
        <li>• Communication vocale et appels d'équipe</li>
        <li>• Lecture de replay et analyse post-partie</li>
      </ul>
      <Link
        to="/"
        className="inline-block rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-accent-400"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
