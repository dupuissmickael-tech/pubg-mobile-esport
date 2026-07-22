import {lazy} from 'react';
import ModuleLayout from '@/layouts/ModuleLayout';
import Scene3DBoundary from '@/components/three/Scene3DBoundary';
import PlaneLineFallback from '@/components/fallback/PlaneLineFallback';
import {planeLineIntro, planeLineConcepts} from '@/data/content/planeLine';

const PlaneLineScene = lazy(() => import('@/components/three/PlaneLineScene'));

export default function PlaneLinePage() {
  return (
    <ModuleLayout moduleId="plane-line" eyebrow="Module 7" title="La ligne d'avion">
      <p className="max-w-2xl text-slate-300">{planeLineIntro}</p>

      <div>
        <h2 className="mb-4 text-lg font-bold text-white">
          Faites glisser le curseur pour suivre l'avion
        </h2>
        <Scene3DBoundary scene={<PlaneLineScene />} fallback={<PlaneLineFallback />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {planeLineConcepts.map((c) => (
          <div key={c.title} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="mb-2 text-sm font-bold text-accent-300">{c.title}</p>
            <p className="text-sm text-slate-400">{c.body}</p>
          </div>
        ))}
      </div>
    </ModuleLayout>
  );
}
