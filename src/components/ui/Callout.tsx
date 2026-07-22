import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

const VARIANTS = {
  tip: {
    label: 'Astuce',
    classes: 'border-accent-500/30 bg-accent-500/10 text-accent-100'
  },
  warning: {
    label: 'Erreur fréquente',
    classes: 'border-amber-500/30 bg-amber-500/10 text-amber-100'
  },
  example: {
    label: 'Exemple',
    classes: 'border-violet-500/30 bg-violet-500/10 text-violet-100'
  }
} as const;

interface CalloutProps {
  variant?: keyof typeof VARIANTS;
  title?: string;
  children: ReactNode;
}

export default function Callout({variant = 'tip', title, children}: CalloutProps) {
  const config = VARIANTS[variant];
  return (
    <div className={cn('rounded-xl border p-4', config.classes)}>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide opacity-80">
        {title ?? config.label}
      </p>
      <div className="text-sm leading-relaxed text-slate-200">{children}</div>
    </div>
  );
}
