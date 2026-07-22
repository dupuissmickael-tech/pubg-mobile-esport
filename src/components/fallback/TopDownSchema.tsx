import {useState, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

export interface SchemaPoint {
  id: string;
  /** -10..10 */
  x: number;
  /** -10..10 (maps to the vertical axis of the top-down view) */
  z: number;
  label: string;
  description: string;
  color?: string;
}

interface TopDownSchemaProps {
  points: SchemaPoint[];
  background?: string;
  /** Extra SVG content (lines, zones) drawn under the points, in the same 0..200 viewBox. */
  extraSvg?: ReactNode;
  descriptionKindLabel?: (point: SchemaPoint) => string;
}

export const toSvg = (v: number) => ((v + 10) / 20) * 200;

/**
 * 2D equivalent of the 3D top-down scenes (compound, split, rotation, mini
 * maps): same "points + clickable legend + description panel" shape, drawn
 * as SVG instead of WebGL. Shown automatically in low-perf mode.
 */
export default function TopDownSchema({
  points,
  background = '#0b1324',
  extraSvg,
  descriptionKindLabel
}: TopDownSchemaProps) {
  const [selectedId, setSelectedId] = useState<string | null>(points[0]?.id ?? null);
  const selected = points.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[420px]">
        <svg viewBox="0 0 200 200" className="h-full w-full" style={{background}}>
          {extraSvg}
          {points.map((p) => (
            <g key={p.id} onClick={() => setSelectedId(p.id)} className="cursor-pointer">
              <circle
                cx={toSvg(p.x)}
                cy={toSvg(p.z)}
                r={p.id === selectedId ? 7 : 5.5}
                fill={p.color ?? (p.id === selectedId ? '#22d3ee' : '#f8fafc')}
                stroke={p.id === selectedId ? '#22d3ee' : 'transparent'}
                strokeWidth={2}
                strokeOpacity={0.5}
              />
              <text
                x={toSvg(p.x)}
                y={toSvg(p.z) - 10}
                textAnchor="middle"
                fontSize={7}
                fill={p.id === selectedId ? '#67e8f9' : '#cbd5e1'}
                fontWeight={700}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {selected ? (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-400">
              {selected.label}
              {descriptionKindLabel ? ` · ${descriptionKindLabel(selected)}` : ''}
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{selected.description}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">Sélectionnez un point.</p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {points.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                p.id === selectedId
                  ? 'border-accent-400 bg-accent-500/15 text-accent-300'
                  : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
