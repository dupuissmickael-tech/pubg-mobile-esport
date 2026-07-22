import {Link, Navigate, useParams} from 'react-router-dom';
import {motion} from 'framer-motion';
import SectionHeading from '@/components/ui/SectionHeading';
import Callout from '@/components/ui/Callout';
import MapSchema from '@/components/maps/MapSchema';
import {maps, getMapBySlug} from '@/data/content/maps';
import {useMarkVisited} from '@/hooks/useMarkVisited';

export default function MapDetailPage() {
  const {slug = ''} = useParams();
  const map = getMapBySlug(slug);
  useMarkVisited('maps');

  if (!map) return <Navigate to="/cartes" replace />;

  const index = maps.findIndex((m) => m.id === map.id);
  const prevMap = maps[index - 1];
  const nextMap = maps[index + 1];

  return (
    <motion.div initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{duration: 0.4}}>
      <Link to="/cartes" className="mb-4 inline-block text-sm text-slate-500 hover:text-accent-400">
        ← Toutes les cartes
      </Link>
      <SectionHeading eyebrow={map.size} title={map.name} description={map.tagline} />

      <div className="space-y-10">
        <div>
          <h2 className="mb-4 text-lg font-bold text-white">Schéma de la carte</h2>
          <MapSchema map={map} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-accent-400">
              Spécificités de la carte
            </h3>
            <ul className="space-y-2">
              {map.specifics.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="mt-0.5 text-accent-400">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <Callout variant="warning" title="Erreurs fréquentes des débutants">
            <ul className="space-y-2">
              {map.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </Callout>
        </div>
      </div>

      <nav className="mt-16 flex items-center justify-between gap-4 border-t border-white/10 pt-8">
        {prevMap ? (
          <Link
            to={`/cartes/${prevMap.slug}`}
            className="group flex max-w-[45%] flex-col rounded-xl border border-white/10 px-4 py-3 text-left transition hover:border-white/30"
          >
            <span className="text-xs text-slate-500">← Précédent</span>
            <span className="truncate font-semibold text-slate-200">{prevMap.name}</span>
          </Link>
        ) : (
          <Link
            to="/ligne-avion"
            className="group flex max-w-[45%] flex-col rounded-xl border border-white/10 px-4 py-3 text-left transition hover:border-white/30"
          >
            <span className="text-xs text-slate-500">← Précédent</span>
            <span className="truncate font-semibold text-slate-200">Ligne d'avion</span>
          </Link>
        )}
        {nextMap ? (
          <Link
            to={`/cartes/${nextMap.slug}`}
            className="group flex max-w-[45%] flex-col rounded-xl border border-white/10 px-4 py-3 text-right transition hover:border-white/30"
          >
            <span className="text-xs text-slate-500">Suivant →</span>
            <span className="truncate font-semibold text-slate-200">{nextMap.name}</span>
          </Link>
        ) : (
          <Link
            to="/a-venir"
            className="group flex max-w-[45%] flex-col rounded-xl border border-white/10 px-4 py-3 text-right transition hover:border-white/30"
          >
            <span className="text-xs text-slate-500">Suivant →</span>
            <span className="truncate font-semibold text-slate-200">Prochains modules</span>
          </Link>
        )}
      </nav>
    </motion.div>
  );
}
