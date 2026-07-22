import {useMemo, useState} from 'react';
import {toSvg} from './TopDownSchema';

const LINE_START: [number, number] = [-7, -3];
const LINE_END: [number, number] = [7, 3];

const DROP_POINTS = [
  {id: 'hot', label: 'Zone chaude', t: 0.22, offset: 0.6, strategy: 'early' as const},
  {id: 'mid', label: 'Zone intermédiaire', t: 0.5, offset: -1.4, strategy: 'safe' as const},
  {id: 'edge', label: 'Bord de carte', t: 0.85, offset: 1.8, strategy: 'safe' as const}
];

const REACH_WINDOW = 0.16;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** 2D equivalent of PlaneLineScene, same time-slider interaction. */
export default function PlaneLineFallback() {
  const [t, setT] = useState(0.22);

  const dropPositions = useMemo(() => {
    const dx = LINE_END[0] - LINE_START[0];
    const dz = LINE_END[1] - LINE_START[1];
    const len = Math.hypot(dx, dz);
    const perp: [number, number] = [-dz / len, dx / len];
    return DROP_POINTS.map((d) => {
      const bx = lerp(LINE_START[0], LINE_END[0], d.t);
      const bz = lerp(LINE_START[1], LINE_END[1], d.t);
      return {...d, x: bx + perp[0] * d.offset, z: bz + perp[1] * d.offset};
    });
  }, []);

  const planeX = lerp(LINE_START[0], LINE_END[0], t);
  const planeZ = lerp(LINE_START[1], LINE_END[1], t);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[420px]">
        <svg viewBox="0 0 200 200" className="h-full w-full" style={{background: '#0b1324'}}>
          <line
            x1={toSvg(LINE_START[0])}
            y1={toSvg(LINE_START[1])}
            x2={toSvg(LINE_END[0])}
            y2={toSvg(LINE_END[1])}
            stroke="#64748b"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          {dropPositions.map((d) => {
            const reachable = Math.abs(t - d.t) < REACH_WINDOW;
            return (
              <circle
                key={d.id}
                cx={toSvg(d.x)}
                cy={toSvg(d.z)}
                r={7}
                fill={reachable ? (d.strategy === 'early' ? '#fb923c' : '#22d3ee') : '#334155'}
              />
            );
          })}
          <g transform={`translate(${toSvg(planeX)}, ${toSvg(planeZ)})`}>
            <circle r={6} fill="#e2e8f0" />
          </g>
        </svg>
      </div>
      <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-400">
          Position de l'avion sur la ligne
        </p>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          className="mb-4 w-full accent-accent-500"
        />
        <ul className="space-y-3 text-sm">
          {dropPositions.map((d) => {
            const reachable = Math.abs(t - d.t) < REACH_WINDOW;
            return (
              <li
                key={d.id}
                className={`rounded-lg border p-2.5 transition ${
                  reachable
                    ? d.strategy === 'early'
                      ? 'border-orange-500/40 bg-orange-500/10'
                      : 'border-accent-500/40 bg-accent-500/10'
                    : 'border-white/5 opacity-50'
                }`}
              >
                <p className="font-semibold text-slate-100">{d.label}</p>
                <p className="text-xs text-slate-400">
                  {d.strategy === 'early' ? 'Drop early — proche du début de ligne' : 'Drop safe — loin de la trajectoire directe'}
                  {reachable ? ' · sautable maintenant' : ''}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
