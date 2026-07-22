import {lazy} from 'react';
import ModuleLayout from '@/layouts/ModuleLayout';
import Scene3DBoundary from '@/components/three/Scene3DBoundary';
import CompoundFallback from '@/components/fallback/CompoundFallback';
import {compoundIntro, compoundPoints, compoundConcepts} from '@/data/content/compound';

const CompoundScene = lazy(() => import('@/components/three/CompoundScene'));

export default function CompoundPage() {
  return (
    <ModuleLayout moduleId="compound" eyebrow="Module 5" title="Les positions dans un compound">
      <p className="max-w-2xl text-slate-300">{compoundIntro}</p>

      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Cliquez les points du compound</h2>
        <Scene3DBoundary
          scene={<CompoundScene points={compoundPoints} />}
          fallback={<CompoundFallback points={compoundPoints} />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {compoundConcepts.map((c) => (
          <div key={c.title} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="mb-2 text-sm font-bold text-accent-300">{c.title}</p>
            <p className="text-sm text-slate-400">{c.body}</p>
          </div>
        ))}
      </div>
    </ModuleLayout>
  );
}
