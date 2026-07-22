import {useState} from 'react';
import {toSvg} from './TopDownSchema';

const ROUTES = [
  {
    id: 'covered',
    label: 'Axe couvert',
    color: '#22d3ee',
    points: [
      [-6, -5],
      [-3.5, -3],
      [-2, -0.5],
      [0, 0]
    ] as Array<[number, number]>,
    description:
      "Cet axe suit des rochers et un relief qui cassent les lignes de vue. Plus lent (détour), mais l'équipe arrive en zone sans avoir été visible en plein champ."
  },
  {
    id: 'exposed',
    label: 'Axe direct',
    color: '#fb923c',
    points: [
      [-6, -5],
      [0, 0]
    ] as Array<[number, number]>,
    description:
      "Ligne droite, la plus rapide pour rejoindre la zone. Mais elle traverse un champ ouvert : toute équipe déjà positionnée en hauteur peut voir et tirer sur toute la traversée."
  }
];

/** 2D equivalent of RotationScene. */
export default function RotationFallback() {
  const [selectedId, setSelectedId] = useState(ROUTES[0].id);
  const selected = ROUTES.find((r) => r.id === selectedId)!;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[420px]">
        <svg viewBox="0 0 200 200" className="h-full w-full" style={{background: '#0b1324'}}>
          <circle cx={toSvg(0)} cy={toSvg(0)} r={70} fill="none" stroke="#64748b" strokeWidth={2} />
          <circle cx={toSvg(0)} cy={toSvg(0)} r={22} fill="none" stroke="#22d3ee" strokeWidth={2} />
          {ROUTES.map((route) => (
            <polyline
              key={route.id}
              points={route.points.map(([x, z]) => `${toSvg(x)},${toSvg(z)}`).join(' ')}
              fill="none"
              stroke={route.color}
              strokeWidth={route.id === selectedId ? 3.5 : 1.5}
              strokeOpacity={route.id === selectedId ? 1 : 0.3}
              strokeDasharray={route.id === selectedId ? undefined : '4 3'}
            />
          ))}
        </svg>
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
