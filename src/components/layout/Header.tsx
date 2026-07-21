'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import LocaleSwitcher from './LocaleSwitcher';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  {href: '/', key: 'home'},
  {href: '/tournaments', key: 'tournaments'},
  {href: '/live', key: 'live'},
  {href: '/news', key: 'news'},
  {href: '/teams', key: 'teams'}
] as const;

export default function Header() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-100/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="rounded bg-accent-500 px-1.5 py-0.5 text-sm text-zinc-950">PM</span>
          <span>{tCommon('siteName')}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                isActive(item.href)
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-200 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label={t('menu')}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-zinc-200 px-4 py-2 md:hidden dark:border-zinc-800">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium',
                isActive(item.href)
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 dark:text-zinc-400'
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
