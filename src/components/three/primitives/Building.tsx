interface BuildingProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}

/** A single low-poly box building block — the entire compound is made of these. */
export default function Building({position, size = [1.4, 1, 1.4], color = '#334155'}: BuildingProps) {
  const [width, height, depth] = size;
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}
