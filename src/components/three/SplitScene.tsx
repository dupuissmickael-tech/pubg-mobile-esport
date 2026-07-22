import {useState} from 'react';
import {OrbitControls} from '@react-three/drei';
import SceneCanvas from './SceneCanvas';
import StylizedTerrain from './primitives/StylizedTerrain';
import Building from './primitives/Building';
import Hotspot from './primitives/Hotspot';

interface DuoPoint {
  id: string;
  position: [number, number, number];
  label: string;
  description: string;
  color: string;
}

const DUOS: DuoPoint[] = [
  {
    id: 'duo-a',
    position: [-3, 0.3, -1.5],
    label: 'Duo A — angle nord',
    color: '#22d3ee',
    description:
      "Ce binôme prend l'angle nord du compound. Il peut voir et couvrir toute approche par l'extérieur, sans être visible depuis l'intérieur du bâtiment principal."
  },
  {
    id: 'duo-b',
    position: [2.5, 0.3, 2],
    label: 'Duo B — angle sud-est',
    color: '#a78bfa',
    description:
      "Ce binôme prend l'angle opposé. Résultat : un ennemi qui entre dans le compound se retrouve pris entre deux angles de tir — c'est tout l'intérêt du split, plutôt que de rester groupés en un seul point vulnérable à une seule direction."
  }
];

/**
 * Top-down-ish view of a compound showing a squad split into two duos on
 * opposite angles — the core idea of the "split" module.
 */
export default function SplitScene() {
  const [selectedId, setSelectedId] = useState<string>(DUOS[0].id);
  const selected = DUOS.find((d) => d.id === selectedId)!;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[420px]">
        <SceneCanvas camera={{position: [0, 12, 0.5], fov: 42}} className="h-full w-full">
          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={16}
            minPolarAngle={0.1}
            maxPolarAngle={0.9}
          />
          <StylizedTerrain size={14} />
          <Building position={[-1, 0, 0]} size={[3, 1, 3]} color="#334155" />
          <Building position={[3, 0, -2.5]} size={[1.2, 0.7, 1.2]} />
          <Building position={[-3.5, 0, 2.5]} size={[1.2, 0.7, 1.2]} />
          {DUOS.map((duo) => (
            <group key={duo.id}>
              <mesh position={[duo.position[0] - 0.25, 0.25, duo.position[2]]}>
                <capsuleGeometry args={[0.14, 0.3, 4, 8]} />
                <meshStandardMaterial color={duo.color} />
              </mesh>
              <mesh position={[duo.position[0] + 0.25, 0.25, duo.position[2]]}>
                <capsuleGeometry args={[0.14, 0.3, 4, 8]} />
                <meshStandardMaterial color={duo.color} />
              </mesh>
              <Hotspot
                position={duo.position}
                label={duo.label}
                active={duo.id === selectedId}
                onSelect={() => setSelectedId(duo.id)}
              />
            </group>
          ))}
        </SceneCanvas>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{color: selected.color}}>
          {selected.label}
        </p>
        <p className="text-sm leading-relaxed text-slate-300">{selected.description}</p>
        <div className="mt-auto flex gap-2 pt-4">
          {DUOS.map((duo) => (
            <button
              key={duo.id}
              type="button"
              onClick={() => setSelectedId(duo.id)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition"
              style={{
                borderColor: duo.id === selectedId ? duo.color : 'rgba(255,255,255,0.1)',
                color: duo.id === selectedId ? duo.color : '#94a3b8'
              }}
            >
              {duo.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
