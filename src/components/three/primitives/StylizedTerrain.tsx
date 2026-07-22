interface StylizedTerrainProps {
  size?: number;
  color?: string;
}

/** Flat low-poly ground plane used as the base of every map-like scene. */
export default function StylizedTerrain({size = 20, color = '#0f172a'}: StylizedTerrainProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
      <planeGeometry args={[size, size, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
    </mesh>
  );
}
