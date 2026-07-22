import {useMemo, useState} from 'react';
import {toSvg} from '@/components/fallback/TopDownSchema';
import {cn} from '@/lib/utils';
import type {MapDefinition} from '@/data/content/maps';

type Selection =
  | {type: 'zone' | 'arrow' | 'split'; id: string}
  | null;

type LayerKey = 'zones' | 'rotations' | 'split';

const SQUAD_COLORS: Record<'A' | 'B', string> = {
  A: '#38bdf8',
  B: '#facc15'
};

/** Bows the path away from the map centre, so a rotation reads as following the terrain/edge rather than a straight beeline. */
function arcPath(from: [number, number], to: [number, number]) {
  const x1 = toSvg(from[0]);
  const y1 = toSvg(from[1]);
  const x2 = toSvg(to[0]);
  const y2 = toSvg(to[1]);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = mx - 100;
  const dy = my - 100;
  const dist = Math.hypot(dx, dy) || 1;
  const bow = 16;
  const cx = mx + (dx / dist) * bow;
  const cy = my + (dy / dist) * bow;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

interface MapSchemaProps {
  map: MapDefinition;
}

/**
 * Original schematic (drawn, not a capture of the game) top-down view of a
 * map: key zones, an example rotation with covered-vs-exposed axes, and an
 * example 2-2 split — all as clickable annotations, toggleable by layer.
 */
export default function MapSchema({map}: MapSchemaProps) {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    zones: true,
    rotations: true,
    split: true
  });
  const [selected, setSelected] = useState<Selection>(map.zones[0] ? {type: 'zone', id: map.zones[0].id} : null);

  const groupBounds = useMemo(() => {
    const bounds: Record<'A' | 'B', {minX: number; maxX: number; minZ: number; maxZ: number} | null> = {
      A: null,
      B: null
    };
    (['A', 'B'] as const).forEach((group) => {
      const points = map.squads.filter((s) => s.group === group);
      if (points.length === 0) return;
      const xs = points.map((p) => p.position[0]);
      const zs = points.map((p) => p.position[1]);
      bounds[group] = {minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs)};
    });
    return bounds;
  }, [map.squads]);

  function toggleLayer(key: LayerKey) {
    setLayers((prev) => ({...prev, [key]: !prev[key]}));
  }

  const selectedZone = selected?.type === 'zone' ? map.zones.find((z) => z.id === selected.id) : undefined;
  const selectedArrow = selected?.type === 'arrow' ? map.rotationArrows.find((a) => a.id === selected.id) : undefined;
  const selectedSplit = selected?.type === 'split' ? selected.id : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['zones', 'Zones clés'],
              ['rotations', 'Exemple de rotation'],
              ['split', 'Exemple de split']
            ] as [LayerKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleLayer(key)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                layers[key]
                  ? 'border-accent-400 bg-accent-500/15 text-accent-300'
                  : 'border-white/10 text-slate-500 hover:border-white/30 hover:text-slate-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[460px]">
          <svg viewBox="0 0 200 200" className="h-full w-full" style={{background: map.terrainColor}}>
            <defs>
              <marker id={`arrow-${map.id}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#e2e8f0" />
              </marker>
            </defs>

            {layers.split &&
              (['A', 'B'] as const).map((group) => {
                const b = groupBounds[group];
                if (!b) return null;
                const pad = 2;
                const x = toSvg(b.minX - pad);
                const y = toSvg(b.minZ - pad);
                const w = toSvg(b.maxX + pad) - x;
                const h = toSvg(b.maxZ + pad) - y;
                const isSelected = selectedSplit === group;
                return (
                  <rect
                    key={group}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={10}
                    fill={SQUAD_COLORS[group]}
                    fillOpacity={isSelected ? 0.16 : 0.08}
                    stroke={SQUAD_COLORS[group]}
                    strokeOpacity={isSelected ? 0.9 : 0.5}
                    strokeWidth={isSelected ? 1.6 : 1}
                    strokeDasharray="4 3"
                    onClick={() => setSelected({type: 'split', id: group})}
                    className="cursor-pointer"
                  />
                );
              })}

            {layers.rotations &&
              map.rotationArrows.map((arrow) => {
                const isSelected = selected?.type === 'arrow' && selected.id === arrow.id;
                const d = arcPath(arrow.from, arrow.to);
                return (
                  <g key={arrow.id} onClick={() => setSelected({type: 'arrow', id: arrow.id})} className="cursor-pointer">
                    <path d={d} fill="none" stroke="transparent" strokeWidth={10} />
                    <path
                      d={d}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeOpacity={isSelected ? 1 : 0.65}
                      strokeWidth={isSelected ? 2.4 : 1.6}
                      strokeDasharray="5 4"
                      markerEnd={`url(#arrow-${map.id})`}
                    />
                  </g>
                );
              })}

            {layers.split &&
              map.squads.map((s) => (
                <circle
                  key={s.id}
                  cx={toSvg(s.position[0])}
                  cy={toSvg(s.position[1])}
                  r={3}
                  fill={SQUAD_COLORS[s.group]}
                  stroke="#0b1324"
                  strokeWidth={1}
                  onClick={() => setSelected({type: 'split', id: s.group})}
                  className="cursor-pointer"
                />
              ))}

            {layers.zones &&
              map.zones.map((zone) => {
                const isSelected = selected?.type === 'zone' && selected.id === zone.id;
                return (
                  <g key={zone.id} onClick={() => setSelected({type: 'zone', id: zone.id})} className="cursor-pointer">
                    <circle
                      cx={toSvg(zone.position[0])}
                      cy={toSvg(zone.position[1])}
                      r={isSelected ? 7 : 5.5}
                      fill={zone.kind === 'hot' ? '#f87171' : map.accentColor}
                      stroke={isSelected ? '#f8fafc' : 'transparent'}
                      strokeWidth={2}
                    />
                    <text
                      x={toSvg(zone.position[0])}
                      y={toSvg(zone.position[1]) - 10}
                      textAnchor="middle"
                      fontSize={7}
                      fill={isSelected ? '#f8fafc' : '#cbd5e1'}
                      fontWeight={700}
                    >
                      {zone.label}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{background: '#f87171'}} /> Zone chaude
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{background: map.accentColor}} /> Axe de
            rotation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{background: SQUAD_COLORS.A}} /> Binôme A
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{background: SQUAD_COLORS.B}} /> Binôme B
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{background: '#e2e8f0'}} /> Trajectoire de rotation
          </span>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {selectedZone && (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-400">
              {selectedZone.label} · {selectedZone.kind === 'hot' ? 'Zone chaude' : 'Axe de rotation'}
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{selectedZone.description}</p>
          </>
        )}
        {selectedArrow && (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-400">
              {selectedArrow.label} · Rotation
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{selectedArrow.description}</p>
          </>
        )}
        {selectedSplit && (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-400">
              Split binôme {selectedSplit}
            </p>
            <p className="text-sm leading-relaxed text-slate-300">{map.splitNote}</p>
          </>
        )}
        {!selected && <p className="text-sm text-slate-500">Cliquez un point, une flèche ou une zone en pointillés.</p>}

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {map.zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelected({type: 'zone', id: zone.id})}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                selected?.type === 'zone' && selected.id === zone.id
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
