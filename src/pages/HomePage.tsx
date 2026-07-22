import {lazy} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {modules, comingSoon} from '@/data/modules';
import ModuleNavCard from '@/components/ui/ModuleNavCard';
import Scene3DBoundary from '@/components/three/Scene3DBoundary';
import HeroFallback from '@/components/fallback/HeroFallback';

// Lazy: keeps three.js/@react-three/fiber out of the initial bundle and out
// of low-perf mode entirely (Scene3DBoundary never renders this element
// there, so React never calls the import()).
const HeroPlaneScene = lazy(() => import('@/components/three/HeroPlaneScene'));

export default function HomePage() {
  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{opacity: 0, y: 16}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent-400">
            Guide interactif · non officiel
          </p>
          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            Comprendre PUBG Mobile <span className="text-accent-400">compétitif</span>, de A à Z
          </h1>
          <p className="mb-8 max-w-xl text-lg text-slate-400">
            Priorité, rôles, split, rotations, positionnement en compound, micro/macro, ligne
            d'avion et spécificités des cartes — expliqués avec des scènes 3D interactives plutôt
            qu'un mur de texte.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={modules[0].slug}
              className="rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-accent-400"
            >
              Commencer le guide →
            </Link>
            <Link
              to="/cartes"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-slate-200 transition hover:border-accent-500/50"
            >
              Voir les cartes
            </Link>
          </div>
        </motion.div>

        <div className="canvas-frame h-[320px] sm:h-[400px]">
          <Scene3DBoundary scene={<HeroPlaneScene />} fallback={<HeroFallback />} />
        </div>
      </div>

      <section className="mt-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">Les modules</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <ModuleNavCard key={m.id} module={m} index={i} />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-dashed border-white/10 p-6 text-center">
        <p className="text-sm font-semibold text-slate-400">{comingSoon.title}</p>
        <p className="mt-1 text-sm text-slate-500">{comingSoon.summary}</p>
      </section>
    </div>
  );
}
