import {useEffect, useState} from 'react';
import {useAppStore} from '@/store/useAppStore';

function detectLowPerfDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & {deviceMemory?: number}).deviceMemory ?? 8;
  return prefersReducedMotion || cores <= 4 || memory <= 4;
}

/**
 * Resolves whether 3D scenes should render at all: the user's manual
 * toggle wins if set, otherwise falls back to automatic device detection.
 */
export function useLowPerfMode(): [boolean, (value: boolean | null) => void] {
  const override = useAppStore((s) => s.lowPerfOverride);
  const setOverride = useAppStore((s) => s.setLowPerfOverride);
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    setAutoDetected(detectLowPerfDevice());
  }, []);

  const active = override ?? autoDetected;
  return [active, setOverride];
}
