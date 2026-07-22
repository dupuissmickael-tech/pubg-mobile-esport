import {useState} from 'react';
import {toSvg} from './TopDownSchema';

const POINTS = [
  {id: 'start', x: -7, z: -4, label: 'Début de ligne'},
  {id: 'drop', x: 7, z: 4, label: 'Point de drop'}
];

/** 2D equivalent of HeroPlaneScene. */
export default function HeroFallback() {
  const [selectedId, setSelectedId] = useState('start');

  return (
    <div className="canvas-frame h-full w-full">
      <svg viewBox="0 0 200 200" className="h-full w-full" style={{background: '#0b1324'}}>
        <rect x={40} y={90} width={45} height={30} fill="#334155" rx={3} />
        <rect x={95} y={60} width={35} height={35} fill="#3f4b63" rx={3} />
        <rect x={120} y={110} width={40} height={28} fill="#334155" rx={3} />
        <line
          x1={toSvg(-7)}
          y1={toSvg(-4)}
          x2={toSvg(7)}
          y2={toSvg(4)}
          stroke="#22d3ee"
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        {POINTS.map((p) => (
          <g key={p.id} onClick={() => setSelectedId(p.id)} className="cursor-pointer">
            <circle
              cx={toSvg(p.x)}
              cy={toSvg(p.z)}
              r={p.id === selectedId ? 7 : 5.5}
              fill={p.id === selectedId ? '#22d3ee' : '#f8fafc'}
            />
            <text
              x={toSvg(p.x)}
              y={toSvg(p.z) - 10}
              textAnchor="middle"
              fontSize={7}
              fontWeight={700}
              fill={p.id === selectedId ? '#67e8f9' : '#cbd5e1'}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
