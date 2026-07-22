import {motion} from 'framer-motion';
import ModuleLayout from '@/layouts/ModuleLayout';
import {microMacroIntro, microPoints, macroPoints, microMacroConclusion} from '@/data/content/microMacro';

export default function MicroMacroPage() {
  return (
    <ModuleLayout moduleId="micro-macro" eyebrow="Module 6" title="Micro vs Macro">
      <p className="max-w-2xl text-slate-300">{microMacroIntro}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{opacity: 0, x: -12}}
          whileInView={{opacity: 1, x: 0}}
          viewport={{once: true}}
          className="rounded-2xl border border-accent-500/20 bg-accent-500/5 p-6"
        >
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-accent-400">Micro</p>
          <p className="mb-4 text-sm text-slate-400">Le niveau du duel, de l'instant</p>
          <ul className="space-y-2">
            {microPoints.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="mt-0.5 text-accent-400">→</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{opacity: 0, x: 12}}
          whileInView={{opacity: 1, x: 0}}
          viewport={{once: true}}
          className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6"
        >
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-violet-400">Macro</p>
          <p className="mb-4 text-sm text-slate-400">La lecture de la partie entière</p>
          <ul className="space-y-2">
            {macroPoints.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="mt-0.5 text-violet-400">→</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <p className="max-w-2xl text-sm text-slate-400">{microMacroConclusion}</p>
    </ModuleLayout>
  );
}
