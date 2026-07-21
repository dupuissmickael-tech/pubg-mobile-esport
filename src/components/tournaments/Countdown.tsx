'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    done: diff === 0
  };
}

/** Automatic countdown to a tournament start date (UTC midnight). */
export default function Countdown({startDate}: {startDate: string}) {
  const t = useTranslations('tournaments');
  const target = new Date(`${startDate}T00:00:00Z`).getTime();
  const [state, setState] = useState(() => remaining(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setState(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (state.done) {
    return (
      <p className="text-sm font-semibold text-red-500">{t('started')}</p>
    );
  }

  const cells = [
    [state.days, t('countdown.days')],
    [state.hours, t('countdown.hours')],
    [state.minutes, t('countdown.minutes')],
    [state.seconds, t('countdown.seconds')]
  ] as const;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        {t('startsIn')}
      </p>
      <div className="flex gap-2" suppressHydrationWarning>
        {cells.map(([value, label]) => (
          <div
            key={label}
            className="flex w-16 flex-col items-center rounded-lg border border-zinc-200 bg-white py-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl font-bold tabular-nums" suppressHydrationWarning>
              {mounted ? String(value).padStart(2, '0') : '--'}
            </span>
            <span className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
