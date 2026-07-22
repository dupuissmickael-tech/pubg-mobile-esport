import {Html} from '@react-three/drei';
import {cn} from '@/lib/utils';

interface HotspotProps {
  position: [number, number, number];
  label: string;
  active?: boolean;
  onSelect: () => void;
}

/** A clickable marker + floating label — every interactive 3D point uses this. */
export default function Hotspot({position, label, active, onSelect}: HotspotProps) {
  return (
    <group position={position}>
      <mesh onClick={onSelect}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={active ? '#22d3ee' : '#f8fafc'}
          emissive={active ? '#0891b2' : '#000000'}
          emissiveIntensity={active ? 0.6 : 0}
        />
      </mesh>
      <Html center distanceFactor={10} zIndexRange={[10, 0]}>
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            'whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold shadow-lg backdrop-blur transition',
            active
              ? 'border-accent-400 bg-accent-500/90 text-slate-950'
              : 'border-white/20 bg-slate-950/80 text-slate-200 hover:border-accent-400'
          )}
        >
          {label}
        </button>
      </Html>
    </group>
  );
}
