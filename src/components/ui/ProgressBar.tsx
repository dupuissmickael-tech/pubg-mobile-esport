import {useAppStore} from '@/store/useAppStore';

export default function ProgressBar() {
  const percent = useAppStore((s) => s.progressPercent());

  return (
    <div className="flex items-center gap-2" title={`Progression : ${percent}%`}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10 sm:w-32">
        <div
          className="h-full rounded-full bg-accent-400 transition-all duration-500"
          style={{width: `${percent}%`}}
        />
      </div>
      <span className="text-xs font-semibold text-slate-400">{percent}%</span>
    </div>
  );
}
