import TopDownSchema, {toSvg} from './TopDownSchema';
import type {CompoundPoint} from '@/components/three/CompoundScene';

/** 2D equivalent of CompoundScene — same point data, drawn as SVG. */
export default function CompoundFallback({points}: {points: CompoundPoint[]}) {
  const schemaPoints = points.map((p) => ({
    id: p.id,
    x: p.position[0],
    z: p.position[2],
    label: p.label,
    description: p.description
  }));

  const buildings = [
    {x: -3.2, z: -2, w: 2.6, h: 1.8},
    {x: 2.2, z: -1.4, w: 1.6, h: 1.6},
    {x: -1, z: 2.6, w: 2.1, h: 1.4},
    {x: 3.4, z: 2.4, w: 1.4, h: 1.4}
  ];

  return (
    <TopDownSchema
      points={schemaPoints}
      extraSvg={
        <g>
          {buildings.map((b, i) => (
            <rect
              key={i}
              x={toSvg(b.x) - b.w * 5}
              y={toSvg(b.z) - b.h * 5}
              width={b.w * 10}
              height={b.h * 10}
              fill="#334155"
              rx={3}
            />
          ))}
        </g>
      }
    />
  );
}
