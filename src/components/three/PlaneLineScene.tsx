import {useMemo, useState} from 'react';
import {OrbitControls, Line} from '@react-three/drei';
import * as THREE from 'three';
import SceneCanvas from './SceneCanvas';
import StylizedTerrain from './primitives/StylizedTerrain';
import PlaneModel from './primitives/PlaneModel';
import Building from './primitives/Building';

const LINE_START = new THREE.Vector3(-7, 3, -3);
const LINE_END = new THREE.Vector3(7, 3, 3);

interface DropPoint {
  id: string;
  label: string;
  t: number; // 0..1 position along the line where this drop is reachable
  offset: number; // lateral distance from the line
  strategy: 'early' | 'safe';
}

const DROP_POINTS: DropPoint[] = [
  {id: 'hot', label: 'Zone chaude', t: 0.22, offset: 0.6, strategy: 'early'},
  {id: 'mid', label: 'Zone intermédiaire', t: 0.5, offset: -1.4, strategy: 'safe'},
  {id: 'edge', label: 'Bord de carte', t: 0.85, offset: 1.8, strategy: 'safe'}
];

const REACH_WINDOW = 0.16;

function pointOnLine(t: number): THREE.Vector3 {
  return LINE_START.clone().lerp(LINE_END, t);
}

/**
 * Plane crossing the map along its jump line; a time slider moves the
 * plane, and drop points light up as they become reachable — illustrating
 * how different squads choose "early" (near the line, close to the plane's
 * start) vs "safe" (further, later) drops based on the same line.
 */
export default function PlaneLineScene() {
  const [t, setT] = useState(0.22);

  const planePosition = useMemo<[number, number, number]>(() => {
    const p = pointOnLine(t);
    return [p.x, p.y, p.z];
  }, [t]);

  const rotationY = Math.atan2(LINE_END.z - LINE_START.z, LINE_END.x - LINE_START.x);

  const dropWorldPositions = useMemo(() => {
    const dir = LINE_END.clone().sub(LINE_START).normalize();
    const lateral = new THREE.Vector3(-dir.z, 0, dir.x);
    return DROP_POINTS.map((d) => {
      const base = pointOnLine(d.t);
      const world = base.clone().add(lateral.clone().multiplyScalar(d.offset));
      world.y = 0.05;
      return {...d, position: [world.x, world.y, world.z] as [number, number, number]};
    });
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="canvas-frame aspect-square lg:aspect-auto lg:h-[420px]">
        <SceneCanvas camera={{position: [0, 10, 11], fov: 45}} className="h-full w-full">
          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={18}
            maxPolarAngle={Math.PI / 2.2}
          />
          <StylizedTerrain size={18} color="#0b1324" />
          <Building position={[-4, 0, -1]} size={[1, 0.6, 1]} />
          <Building position={[-3.3, 0, -0.2]} size={[0.8, 0.5, 0.8]} />
          <Building position={[1, 0, 2]} size={[0.9, 0.5, 0.9]} />

          <Line points={[LINE_START, LINE_END]} color="#64748b" dashed dashSize={0.25} gapSize={0.15} lineWidth={2} />
          <PlaneModel position={planePosition} rotationY={rotationY} bob={false} />

          {dropWorldPositions.map((d) => {
            const reachable = Math.abs(t - d.t) < REACH_WINDOW;
            return (
              <mesh key={d.id} position={d.position}>
                <cylinderGeometry args={[0.35, 0.35, 0.06, 24]} />
                <meshStandardMaterial
                  color={reachable ? (d.strategy === 'early' ? '#fb923c' : '#22d3ee') : '#334155'}
                  emissive={reachable ? (d.strategy === 'early' ? '#7c2d12' : '#0891b2') : '#000000'}
                  emissiveIntensity={reachable ? 0.5 : 0}
                />
              </mesh>
            );
          })}
        </SceneCanvas>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-400">
          Position de l'avion sur la ligne
        </p>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          className="mb-4 w-full accent-accent-500"
        />
        <ul className="space-y-3 text-sm">
          {dropWorldPositions.map((d) => {
            const reachable = Math.abs(t - d.t) < REACH_WINDOW;
            return (
              <li
                key={d.id}
                className={`rounded-lg border p-2.5 transition ${
                  reachable
                    ? d.strategy === 'early'
                      ? 'border-orange-500/40 bg-orange-500/10'
                      : 'border-accent-500/40 bg-accent-500/10'
                    : 'border-white/5 opacity-50'
                }`}
              >
                <p className="font-semibold text-slate-100">{d.label}</p>
                <p className="text-xs text-slate-400">
                  {d.strategy === 'early' ? 'Drop early — proche du début de ligne' : 'Drop safe — loin de la trajectoire directe'}
                  {reachable ? ' · sautable maintenant' : ''}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
