import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import ModuleLayout from '@/layouts/ModuleLayout';
import {maps} from '@/data/content/maps';

export default function MapsIndexPage() {
  return (
    <ModuleLayout
      moduleId="maps"
      eyebrow="Module 8"
      title="Les cartes"
      description="Chaque carte impose son propre style de jeu. Voici les spécificités à connaître avant d'y jouer en compétition."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {maps.map((map, i) => (
          <motion.div
            key={map.id}
            initial={{opacity: 0, y: 16}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{delay: i * 0.08}}
          >
            <Link
              to={`/cartes/${map.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-white/30"
              style={{borderColor: undefined}}
            >
              <div
                className="mb-3 h-2 w-10 rounded-full"
                style={{backgroundColor: map.accentColor}}
              />
              <h3 className="mb-1 text-lg font-black text-white">{map.name}</h3>
              <p className="mb-3 text-xs text-slate-500">{map.size}</p>
              <p className="text-sm text-slate-400">{map.tagline}</p>
              <span className="mt-4 text-sm font-semibold text-accent-400 group-hover:underline">
                Explorer →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </ModuleLayout>
  );
}
