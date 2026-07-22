import {Link} from 'react-router-dom';
import {getAdjacentModules} from '@/data/modules';

export default function PrevNextNav({moduleId}: {moduleId: string}) {
  const {prev, next} = getAdjacentModules(moduleId);

  if (!prev && !next) return null;

  return (
    <nav className="mt-16 flex items-center justify-between gap-4 border-t border-white/10 pt-8">
      {prev ? (
        <Link
          to={prev.slug}
          className="group flex max-w-[45%] flex-col rounded-xl border border-white/10 px-4 py-3 text-left transition hover:border-accent-500/50"
        >
          <span className="text-xs text-slate-500">← Précédent</span>
          <span className="truncate font-semibold text-slate-200 group-hover:text-accent-300">
            {prev.shortTitle}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={next.slug}
          className="group flex max-w-[45%] flex-col rounded-xl border border-white/10 px-4 py-3 text-right transition hover:border-accent-500/50"
        >
          <span className="text-xs text-slate-500">Suivant →</span>
          <span className="truncate font-semibold text-slate-200 group-hover:text-accent-300">
            {next.shortTitle}
          </span>
        </Link>
      ) : (
        <Link
          to="/a-venir"
          className="group flex max-w-[45%] flex-col rounded-xl border border-white/10 px-4 py-3 text-right transition hover:border-accent-500/50"
        >
          <span className="text-xs text-slate-500">Suivant →</span>
          <span className="truncate font-semibold text-slate-200 group-hover:text-accent-300">
            Prochains modules
          </span>
        </Link>
      )}
    </nav>
  );
}
