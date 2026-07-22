import {useState} from 'react';
import {OrbitControls, Line} from '@react-three/drei';
import SceneCanvas from './SceneCanvas';
import StylizedTerrain from './primitives/StylizedTerrain';
import ZoneCircle from './primitives/ZoneCircle';

interface RoutePoint {
  id: string;
  label: string;
  color: string;
  points: Array<[number, number, number]>;
  description: string;
}

const ROUTES: RoutePoint[] = [
  {
    id: 'covered',
    label: 'Axe couvert',
    color: '#22d3ee',
    points: [
      [-6, 0.05, -5],
      [-3.5, 0.05, -3],
      [-2, 0.05, -0.5],
      [0, 0.05, 0]
    ],
    description:
      "Cet axe suit des rochers et un relief qui cassent les lignes de vue. Plus lent (détour), mais l'équipe arrive en zone sans avoir été visible en plein champ — le risque de se faire cross (prendre des tirs de loin sans pouvoir riposter) est bien plus faible."
  },
  {
    id: 'exposed',
    label: 'Axe direct',
    color: '#fb923c',
    points: [
      [-6, 0.05, -5],
      [0, 0.05, 0]
    ],
    description:
      "Ligne droite, la plus rapide pour rejoindre la zone. Mais elle traverse un champ ouvert : toute équipe déjà positionnée en hauteur peut voir et tirer sur toute la traversée. À réserver aux cas où le temps de zone ne laisse pas le choix."
  }
];

/** A shrinking zone with two comparable rotation axes the user can toggle. */
export default function RotationScene() {
  const [selectedId, setSelectedId] = useState<string>(ROUTES[0].id);
  const selected = ROUTES.find((r) => r.id === selectedId)!;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[420px]">
        <SceneCanvas camera={{position: [0, 11, 10], fov: 45}} className="h-full w-full">
          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={18}
            maxPolarAngle={Math.PI / 2.2}
          />
          <StylizedTerrain size={18} />
          <ZoneCircle radius={7} color="#64748b" />
          <ZoneCircle radius={2.2} color="#22d3ee" />

          {/* Cover rocks along the "covered" axis */}
          <mesh position={[-3.5, 0.35, -3]}>
            <dodecahedronGeometry args={[0.6]} />
            <meshStandardMaterial color="#475569" flatShading />
          </mesh>
          <mesh position={[-2, 0.3, -0.5]}>
            <dodecahedronGeometry args={[0.5]} />
            <meshStandardMaterial color="#475569" flatShading />
          </mesh>

          {ROUTES.map((route) => (
            <Line
              key={route.id}
              points={route.points}
              color={route.color}
              lineWidth={route.id === selectedId ? 4 : 1.5}
              transparent
              opacity={route.id === selectedId ? 1 : 0.3}
            />
          ))}
        </SceneCanvas>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{color: selected.color}}>
          {selected.label}
        </p>
        <p className="text-sm leading-relaxed text-slate-300">{selected.description}</p>
        <div className="mt-auto flex gap-2 pt-4">
          {ROUTES.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => setSelectedId(route.id)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition"
              style={{
                borderColor: route.id === selectedId ? route.color : 'rgba(255,255,255,0.1)',
                color: route.id === selectedId ? route.color : '#94a3b8'
              }}
            >
              {route.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
