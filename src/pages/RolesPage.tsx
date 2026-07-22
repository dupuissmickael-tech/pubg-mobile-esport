import {lazy} from 'react';
import ModuleLayout from '@/layouts/ModuleLayout';
import Scene3DBoundary from '@/components/three/Scene3DBoundary';
import CompoundFallback from '@/components/fallback/CompoundFallback';
import {roles, roleCompoundPoints} from '@/data/content/roles';

const CompoundScene = lazy(() => import('@/components/three/CompoundScene'));

export default function RolesPage() {
  return (
    <ModuleLayout
      moduleId="roles"
      eyebrow="Module 2"
      title="Les rôles dans une squad"
      description="Quatre rôles reviennent dans presque toutes les compositions compétitives — chacun avec ses responsabilités et sa position habituelle."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <div key={role.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-lg font-black text-accent-300">{role.name}</h3>
              <span className="text-xs text-slate-500">{role.subtitle}</span>
            </div>
            <ul className="mb-4 space-y-1.5">
              {role.responsibilities.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="mt-0.5 text-accent-400">→</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Matériel prioritaire : </span>
              {role.equipment}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Position habituelle dans le compound</h2>
        <Scene3DBoundary
          scene={<CompoundScene points={roleCompoundPoints} />}
          fallback={<CompoundFallback points={roleCompoundPoints} />}
        />
      </div>
    </ModuleLayout>
  );
}
