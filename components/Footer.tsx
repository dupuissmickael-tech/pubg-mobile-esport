export default function Footer() {
  return (
    <footer className="mt-16 border-t border-veypri-ink/10 bg-veypri-ink/[0.02]">
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-veypri-ink/60">
        <p className="mb-2">
          <strong className="text-veypri-ink/80">VeyPri</strong> est une
          initiative citoyenne indépendante. Ce site n&apos;est ni édité ni
          affilié à l&apos;État, à la préfecture de Guadeloupe ou à la DGCCRF.
        </p>
        <p className="mb-2">
          Les signalements publiés reflètent des observations transmises par
          des particuliers et ne constituent pas une accusation formelle. Pour
          un signalement officiel, utilisez la plateforme{" "}
          <a
            href="https://signal.conso.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-veypri-green"
          >
            SignalConso
          </a>{" "}
          de la DGCCRF.
        </p>
        <p>
          Aucun compte n&apos;est requis et aucune donnée personnelle
          n&apos;est collectée : les signalements sont anonymes.
        </p>
      </div>
    </footer>
  );
}
