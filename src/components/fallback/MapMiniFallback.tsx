import TopDownSchema from './TopDownSchema';
import type {MapZone} from '@/components/three/MapMiniScene';

interface MapMiniFallbackProps {
  terrainColor: string;
  accentColor: string;
  zones: MapZone[];
}

/** 2D equivalent of MapMiniScene. */
export default function MapMiniFallback({terrainColor, accentColor, zones}: MapMiniFallbackProps) {
  const points = zones.map((z) => ({
    id: z.id,
    x: z.position[0],
    z: z.position[2],
    label: z.label,
    description: z.description,
    color: z.kind === 'hot' ? '#f87171' : accentColor
  }));

  return (
    <TopDownSchema
      points={points}
      background={terrainColor}
      descriptionKindLabel={(p) => (p.color === '#f87171' ? 'Zone chaude' : 'Axe de rotation')}
    />
  );
}
