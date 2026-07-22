import {lazy} from 'react';
import ModuleLayout from '@/layouts/ModuleLayout';
import Scene3DBoundary from '@/components/three/Scene3DBoundary';
import RotationFallback from '@/components/fallback/RotationFallback';
import {rotationsIntro, rotationConcepts} from '@/data/content/rotations';

const RotationScene = lazy(() => import('@/components/three/RotationScene'));

export default function RotationsPage() {
  return (
    <ModuleLayout moduleId="rotations" eyebrow="Module 4" title="Les rotations">
      <p className="max-w-2xl text-slate-300">{rotationsIntro}</p>

      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Comparer deux axes de rotation</h2>
        <Scene3DBoundary scene={<RotationScene />} fallback={<RotationFallback />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rotationConcepts.map((c) => (
          <div key={c.title} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="mb-2 text-sm font-bold text-accent-300">{c.title}</p>
            <p className="text-sm text-slate-400">{c.body}</p>
          </div>
        ))}
      </div>
    </ModuleLayout>
  );
}
