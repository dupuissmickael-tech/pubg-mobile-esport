import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import type {Group} from 'three';

interface PlaneModelProps {
  position?: [number, number, number];
  rotationY?: number;
  bob?: boolean;
}

/** Stylized low-poly plane: a cone fuselage + a flattened wing box. */
export default function PlaneModel({position = [0, 3, 0], rotationY = 0, bob = true}: PlaneModelProps) {
  const group = useRef<Group>(null);

  useFrame(({clock}) => {
    if (bob && group.current) {
      group.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5) * 0.15;
    }
  });

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.22, 1.1, 8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh>
        <boxGeometry args={[1.4, 0.06, 0.25]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} />
      </mesh>
      <mesh position={[-0.4, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.3, 0.05, 0.5]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} />
      </mesh>
    </group>
  );
}
