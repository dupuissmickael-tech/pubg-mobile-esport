import {useMemo, useState} from 'react';
import {OrbitControls, Line} from '@react-three/drei';
import SceneCanvas from './SceneCanvas';
import StylizedTerrain from './primitives/StylizedTerrain';
import PlaneModel from './primitives/PlaneModel';
import Hotspot from './primitives/Hotspot';

const LINE_START: [number, number, number] = [-7, 3.2, -4];
const LINE_END: [number, number, number] = [7, 3.2, 4];

/**
 * Home page hero: a plane flying its jump line over a stylized island.
 * Two hotspots (start / drop point) make it interactive rather than
 * purely decorative, per the "every 3D element needs an interaction"
 * requirement.
 */
export default function HeroPlaneScene() {
  const [active, setActive] = useState<'start' | 'drop' | null>(null);

  const buildings = useMemo(
    () => [
      [-3, 0, 1, '#334155'],
      [-1.5, 0, -2, '#3f4b63'],
      [1, 0, 2, '#334155'],
      [3, 0, -1, '#3f4b63'],
      [0, 0, -3.5, '#334155']
    ] as Array<[number, number, number, string]>,
    []
  );

  return (
    <SceneCanvas className="h-full w-full" camera={{position: [8, 7, 9], fov: 42}}>
      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={16}
        maxPolarAngle={Math.PI / 2.3}
      />
      <StylizedTerrain size={16} color="#0b1324" />
      {buildings.map(([x, , z, color], i) => (
        <mesh key={i} position={[x, 0.25, z]}>
          <boxGeometry args={[0.9, 0.5, 0.9]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      <PlaneModel position={[0, 3.2, 0]} rotationY={Math.atan2(4, 14)} />
      <Line points={[LINE_START, LINE_END]} color="#22d3ee" dashed dashSize={0.3} gapSize={0.2} lineWidth={2} />
      <Hotspot
        position={LINE_START}
        label="Début de ligne"
        active={active === 'start'}
        onSelect={() => setActive('start')}
      />
      <Hotspot
        position={LINE_END}
        label="Point de drop"
        active={active === 'drop'}
        onSelect={() => setActive('drop')}
      />
    </SceneCanvas>
  );
}
