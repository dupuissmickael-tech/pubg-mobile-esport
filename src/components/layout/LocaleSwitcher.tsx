'use client';

import {useLocale} from 'next-intl';
import {useParams} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {usePathname, useRouter} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function switchTo(nextLocale: string) {
    router.replace(
      // Typed navigation can't know the concrete dynamic params here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {pathname, params: params as any} as any,
      {locale: nextLocale}
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-zinc-300 p-0.5 dark:border-zinc-700">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          className={cn(
            'rounded px-2 py-1 text-xs font-semibold uppercase transition',
            l === locale
              ? 'bg-accent-500 text-zinc-950'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
