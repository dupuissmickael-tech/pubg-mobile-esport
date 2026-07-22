import {useState} from 'react';
import {OrbitControls} from '@react-three/drei';
import SceneCanvas from './SceneCanvas';
import StylizedTerrain from './primitives/StylizedTerrain';
import Building from './primitives/Building';
import Hotspot from './primitives/Hotspot';
import {cn} from '@/lib/utils';

export interface CompoundPoint {
  id: string;
  position: [number, number, number];
  label: string;
  description: string;
}

interface CompoundSceneProps {
  points: CompoundPoint[];
}

/**
 * Generic interactive compound: a fixed low-poly building layout with
 * clickable hotspots supplied by the caller. Reused as-is by both the
 * "Compound" module (positions haute/basse, angle mort…) and the "Rôles"
 * module (position habituelle de chaque rôle) — only the `points` differ.
 */
export default function CompoundScene({points}: CompoundSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(points[0]?.id ?? null);
  const selected = points.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[440px]">
        <SceneCanvas camera={{position: [0, 9, 9.5], fov: 45}} className="h-full w-full">
          <OrbitControls
            enablePan={false}
            minDistance={6}
            maxDistance={14}
            maxPolarAngle={Math.PI / 2.1}
          />
          <StylizedTerrain size={14} />
          <Building position={[-3.2, 0, -2]} size={[2.6, 1.3, 1.8]} />
          <Building position={[2.2, 0, -1.4]} size={[1.6, 2.2, 1.6]} color="#3f4b63" />
          <Building position={[-1, 0, 2.6]} size={[2.1, 0.8, 1.4]} />
          <Building position={[3.4, 0, 2.4]} size={[1.4, 0.9, 1.4]} color="#3f4b63" />
          <Building position={[0.2, 0, -0.2]} size={[1.1, 0.5, 1.1]} color="#243044" />
          {points.map((point) => (
            <Hotspot
              key={point.id}
              position={point.position}
              label={point.label}
              active={point.id === selectedId}
              onSelect={() => setSelectedId(point.id)}
            />
          ))}
        </SceneCanvas>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {selected ? (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-400">
              {selected.label}
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{selected.description}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">Cliquez un point sur le compound.</p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {points.map((point) => (
            <button
              key={point.id}
              type="button"
              onClick={() => setSelectedId(point.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                point.id === selectedId
                  ? 'border-accent-400 bg-accent-500/15 text-accent-300'
                  : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200'
              )}
            >
              {point.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
