import {lazy} from 'react';
import ModuleLayout from '@/layouts/ModuleLayout';
import Callout from '@/components/ui/Callout';
import Scene3DBoundary from '@/components/three/Scene3DBoundary';
import SplitFallback from '@/components/fallback/SplitFallback';
import {splitIntro, splitReasons, splitRisks} from '@/data/content/split';

const SplitScene = lazy(() => import('@/components/three/SplitScene'));

export default function SplitPage() {
  return (
    <ModuleLayout moduleId="split" eyebrow="Module 3" title="Le split">
      <p className="max-w-2xl text-slate-300">{splitIntro}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {splitReasons.map((r) => (
          <div key={r.title} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="mb-2 text-sm font-bold text-accent-300">{r.title}</p>
            <p className="text-sm text-slate-400">{r.body}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Vue du dessus : deux duos, deux angles</h2>
        <Scene3DBoundary scene={<SplitScene />} fallback={<SplitFallback />} />
      </div>

      <Callout variant="warning" title="Le risque du split">
        {splitRisks}
      </Callout>
    </ModuleLayout>
  );
}
