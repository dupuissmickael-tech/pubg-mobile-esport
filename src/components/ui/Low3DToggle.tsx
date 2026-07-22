import {useLowPerfMode} from '@/hooks/useLowPerfMode';

export default function Low3DToggle() {
  const [lowPerf, setOverride] = useLowPerfMode();

  return (
    <button
      type="button"
      onClick={() => setOverride(!lowPerf)}
      className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-accent-500/50 hover:text-accent-300"
      title="Basculer entre scène 3D et schéma 2D équivalent"
    >
      <span className={lowPerf ? 'text-slate-500' : 'text-accent-400'}>●</span>
      {lowPerf ? 'Schémas 2D' : 'Scènes 3D'}
    </button>
  );
}
