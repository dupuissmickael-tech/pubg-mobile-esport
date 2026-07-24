import { NavLink, Outlet } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
    isActive
      ? "border-marine-600 text-ink-900"
      : "border-transparent text-ink-700/70 hover:text-ink-900 hover:border-ink-700/30"
  }`;

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink-700/15 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <NavLink to="/" className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-ink-900">
              Ki<span className="text-marine-600">Mèt</span>
            </span>
            <span className="hidden text-xs uppercase tracking-widest text-ink-700/60 sm:inline">
              Qui mène en Guadeloupe ?
            </span>
          </NavLink>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Accueil
            </NavLink>
            <NavLink to="/secteurs" className={navLinkClass}>
              Secteurs &amp; groupes
            </NavLink>
            <NavLink to="/proposer-une-source" className={navLinkClass}>
              Proposer une source
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-700/15 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-ink-700/70 sm:px-6">
          <p className="max-w-3xl">
            KiMèt ne publie aucune information inédite : chaque fait présenté
            provient d'une source publique déjà publiée, citée et reliée à
            l'article ou au document d'origine. En cas d'erreur ou
            d'imprécision, utilisez le formulaire{" "}
            <NavLink to="/proposer-une-source" className="underline hover:text-ink-900">
              Proposer une source
            </NavLink>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
