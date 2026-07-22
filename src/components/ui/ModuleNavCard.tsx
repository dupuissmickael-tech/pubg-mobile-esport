import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import type {ModuleMeta} from '@/data/modules';
import {useAppStore} from '@/store/useAppStore';

export default function ModuleNavCard({module, index}: {module: ModuleMeta; index: number}) {
  const visited = useAppStore((s) => s.visited[module.id]);

  return (
    <motion.div
      initial={{opacity: 0, y: 16}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: '-40px'}}
      transition={{duration: 0.4, delay: index * 0.05}}
    >
      <Link
        to={module.slug}
        className="group flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-accent-500/50 hover:bg-slate-900"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/15 text-sm font-black text-accent-400">
            {index + 1}
          </span>
          {visited && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
              Vu
            </span>
          )}
        </div>
        <h3 className="mb-2 font-bold text-white group-hover:text-accent-300">{module.title}</h3>
        <p className="text-sm text-slate-400">{module.summary}</p>
      </Link>
    </motion.div>
  );
}
