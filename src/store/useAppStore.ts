import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {modules} from '@/data/modules';

interface AppState {
  visited: Record<string, boolean>;
  markVisited: (id: string) => void;
  progressCount: () => number;
  progressPercent: () => number;

  /** User override; null means "follow automatic detection". */
  lowPerfOverride: boolean | null;
  setLowPerfOverride: (value: boolean | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      visited: {},
      markVisited: (id) =>
        set((state) => (state.visited[id] ? state : {visited: {...state.visited, [id]: true}})),
      progressCount: () => Object.keys(get().visited).length,
      progressPercent: () => {
        const total = modules.filter((m) => m.trackProgress).length;
        if (total === 0) return 0;
        return Math.round((get().progressCount() / total) * 100);
      },

      lowPerfOverride: null,
      setLowPerfOverride: (value) => set({lowPerfOverride: value})
    }),
    {
      name: 'pubg-guide-progress',
      partialize: (state) => ({
        visited: state.visited,
        lowPerfOverride: state.lowPerfOverride
      })
    }
  )
);
