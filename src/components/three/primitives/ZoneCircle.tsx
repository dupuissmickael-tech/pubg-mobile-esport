interface ZoneCircleProps {
  radius: number;
  color?: string;
  y?: number;
}

/** A flat ring on the ground representing the safe zone boundary. */
export default function ZoneCircle({radius, color = '#22d3ee', y = 0.02}: ZoneCircleProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <ringGeometry args={[Math.max(radius - 0.08, 0.01), radius, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}
