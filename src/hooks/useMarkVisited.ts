import {useEffect} from 'react';
import {useAppStore} from '@/store/useAppStore';

/** Marks a module as visited (for the progress bar) once its page mounts. */
export function useMarkVisited(id: string): void {
  const markVisited = useAppStore((s) => s.markVisited);
  useEffect(() => {
    markVisited(id);
  }, [id, markVisited]);
}
