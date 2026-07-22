import {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import type {PriorityPhase} from '@/data/content/priority';
import {cn} from '@/lib/utils';

/** Clickable phase timeline — the "priority" module's interactive centerpiece. */
export default function PriorityTimeline({phases}: {phases: PriorityPhase[]}) {
  const [activeId, setActiveId] = useState<PriorityPhase['id']>(phases[0].id);
  const active = phases.find((p) => p.id === activeId)!;

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {phases.map((phase) => (
          <button
            key={phase.id}
            type="button"
            onClick={() => setActiveId(phase.id)}
            className={cn(
              'rounded-xl border p-4 text-left transition',
              phase.id === activeId
                ? 'border-accent-500/50 bg-accent-500/10'
                : 'border-white/10 hover:border-white/25'
            )}
          >
            <p
              className={cn(
                'text-sm font-black',
                phase.id === activeId ? 'text-accent-300' : 'text-slate-200'
              )}
            >
              {phase.label}
            </p>
            <p className="mt-1 text-xs text-slate-500">{phase.timing}</p>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{opacity: 0, y: 8}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: -8}}
          transition={{duration: 0.25}}
          className="rounded-2xl border border-white/10 bg-slate-900/60 p-6"
        >
          <p className="mb-3 text-sm leading-relaxed text-slate-300">{active.summary}</p>
          <ul className="space-y-2">
            {active.priorities.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="mt-0.5 text-accent-400">→</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
