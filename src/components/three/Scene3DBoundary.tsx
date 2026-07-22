import {Component, Suspense, type ReactNode} from 'react';
import {useLowPerfMode} from '@/hooks/useLowPerfMode';

class WebGLErrorBoundary extends Component<
  {children: ReactNode; fallback: ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface Scene3DBoundaryProps {
  /**
   * The interactive 3D scene, built from a `React.lazy()`-loaded component
   * (e.g. `<LazyCompoundScene points={...} />`). This must be lazy, not a
   * direct import — otherwise three.js/@react-three/fiber end up in every
   * page's bundle even when 2D mode never renders them.
   */
  scene: ReactNode;
  /** Equivalent 2D schema shown while the scene chunk loads, in low-perf mode, or if WebGL fails. */
  fallback: ReactNode;
}

/**
 * Switches between a 3D scene and its 2D equivalent based on the "reduce
 * 3D" mode (manual toggle or auto-detected low-end device), and falls back
 * to 2D automatically if WebGL throws or while the scene's chunk is still
 * loading — a scene should never be a hard requirement to read the content.
 */
export default function Scene3DBoundary({scene, fallback}: Scene3DBoundaryProps) {
  const [lowPerf] = useLowPerfMode();

  if (lowPerf) return <>{fallback}</>;
  return (
    <WebGLErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>{scene}</Suspense>
    </WebGLErrorBoundary>
  );
}
