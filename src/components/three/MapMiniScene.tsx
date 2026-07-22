import {useState} from 'react';
import {OrbitControls} from '@react-three/drei';
import SceneCanvas from './SceneCanvas';
import Hotspot from './primitives/Hotspot';
import {cn} from '@/lib/utils';

export interface MapZone {
  id: string;
  position: [number, number, number];
  label: string;
  description: string;
  kind: 'hot' | 'rotation';
}

interface MapMiniSceneProps {
  terrainColor: string;
  accentColor: string;
  zones: MapZone[];
  /** Extra low-poly terrain features specific to this map (dunes, forest patches...). */
  features?: Array<{position: [number, number, number]; size: number; color: string}>;
}

/**
 * Generic navigable stylized mini-map, reused for Erangel/Rondo/Miramar —
 * only the terrain color, features and zone data change per map.
 */
export default function MapMiniScene({terrainColor, accentColor, zones, features = []}: MapMiniSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(zones[0]?.id ?? null);
  const selected = zones.find((z) => z.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[420px]">
        <SceneCanvas camera={{position: [0, 13, 1], fov: 40}} className="h-full w-full">
          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={20}
            minPolarAngle={0.15}
            maxPolarAngle={1}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[18, 18]} />
            <meshStandardMaterial color={terrainColor} roughness={0.95} />
          </mesh>
          {features.map((f, i) => (
            <mesh key={i} position={[f.position[0], f.size / 2, f.position[2]]}>
              <dodecahedronGeometry args={[f.size]} />
              <meshStandardMaterial color={f.color} flatShading />
            </mesh>
          ))}
          {zones.map((zone) => (
            <group key={zone.id}>
              <mesh position={[zone.position[0], 0.03, zone.position[2]]}>
                <cylinderGeometry args={[0.5, 0.5, 0.05, 20]} />
                <meshStandardMaterial
                  color={zone.kind === 'hot' ? '#f87171' : accentColor}
                  transparent
                  opacity={zone.id === selectedId ? 0.9 : 0.45}
                />
              </mesh>
              <Hotspot
                position={[zone.position[0], 0.6, zone.position[2]]}
                label={zone.label}
                active={zone.id === selectedId}
                onSelect={() => setSelectedId(zone.id)}
              />
            </group>
          ))}
        </SceneCanvas>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {selected ? (
          <>
            <p
              className={cn(
                'mb-2 text-xs font-bold uppercase tracking-wide',
                selected.kind === 'hot' ? 'text-red-400' : ''
              )}
              style={selected.kind === 'rotation' ? {color: accentColor} : undefined}
            >
              {selected.label} · {selected.kind === 'hot' ? 'Zone chaude' : 'Axe de rotation'}
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{selected.description}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">Cliquez un point sur la carte.</p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedId(zone.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                zone.id === selectedId
                  ? 'border-accent-400 bg-accent-500/15 text-accent-300'
                  : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200'
              )}
            >
              {zone.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
