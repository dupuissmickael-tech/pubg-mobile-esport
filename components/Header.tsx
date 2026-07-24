import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-veypri-green/20 bg-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-veypri-green">
            VeyPri
          </span>
          <span className="hidden text-sm text-veypri-ink/60 sm:inline">
            Veille citoyenne des prix BQP
          </span>
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-veypri-ink/80">
          <Link href="/" className="hover:text-veypri-green">
            Accueil
          </Link>
          <Link href="/signalements" className="hover:text-veypri-green">
            Signalements récents
          </Link>
          <Link
            href="/signaler"
            className="rounded border border-veypri-green px-3 py-1 text-veypri-green hover:bg-veypri-green hover:text-white"
          >
            Faire un signalement
          </Link>
        </nav>
      </div>
    </header>
  );
}
