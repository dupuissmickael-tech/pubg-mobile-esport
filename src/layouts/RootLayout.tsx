import {NavLink, Outlet} from 'react-router-dom';
import {modules} from '@/data/modules';
import ProgressBar from '@/components/ui/ProgressBar';
import Low3DToggle from '@/components/ui/Low3DToggle';
import {cn} from '@/lib/utils';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <NavLink to="/" className="flex shrink-0 items-center gap-2 font-black tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/15 text-accent-400">
              ▲
            </span>
            <span className="hidden sm:inline">Guide Compétitif</span>
          </NavLink>

          <nav className="scrollbar-none flex flex-1 items-center gap-1 overflow-x-auto">
            {modules.map((m) => (
              <NavLink
                key={m.id}
                to={m.slug}
                className={({isActive}) =>
                  cn(
                    'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-accent-500/15 text-accent-300'
                      : 'text-slate-400 hover:text-slate-100'
                  )
                }
              >
                {m.shortTitle}
              </NavLink>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Low3DToggle />
            <ProgressBar />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 border-t border-white/5 py-2 lg:hidden">
          <Low3DToggle />
          <ProgressBar />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        Guide non officiel à but pédagogique. Aucune affiliation avec PUBG MOBILE ou ses éditeurs.
      </footer>
    </div>
  );
}
