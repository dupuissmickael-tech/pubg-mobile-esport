import {Suspense, type ReactNode} from 'react';
import {Canvas} from '@react-three/fiber';

interface SceneCanvasProps {
  children: ReactNode;
  camera?: {position: [number, number, number]; fov?: number};
  className?: string;
}

/**
 * Shared <Canvas> wrapper: consistent lighting/camera defaults, capped
 * pixel ratio and no shadows anywhere — this project favors stylized
 * low-poly shapes over expensive lighting, per the performance brief.
 */
export default function SceneCanvas({
  children,
  camera = {position: [6, 6, 6], fov: 45},
  className
}: SceneCanvasProps) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={camera}
        gl={{antialias: true, powerPreference: 'low-power'}}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <directionalLight position={[-5, 4, -5]} intensity={0.3} color="#22d3ee" />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
