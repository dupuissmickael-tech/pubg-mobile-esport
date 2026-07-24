import { Link } from "react-router-dom";
import { institutionalContext } from "../data/context";
import { groups } from "../data/groups";
import { sectors } from "../data/sectors";
import GroupCard from "../components/GroupCard";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="max-w-3xl">
        <span className="badge">Cartographie économique</span>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
          Qui mène l'économie en Guadeloupe ?
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-800">
          KiMèt (« qui mène », en créole guadeloupéen) recense de façon
          factuelle et sourcée les principaux groupes économiques actifs en
          Guadeloupe : leur secteur, leur position, et les faits documentés
          qui les concernent. Aucune analyse, aucune accusation — uniquement
          des faits publiés par des médias et institutions, avec un lien
          direct vers chaque source.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/secteurs"
            className="rounded-sm bg-marine-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marine-700"
          >
            Explorer les secteurs
          </Link>
          <Link
            to="/proposer-une-source"
            className="rounded-sm border border-ink-700/25 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:border-marine-600 hover:text-marine-600"
          >
            Proposer une source
          </Link>
        </div>
      </section>

      <section className="mt-14 rounded-sm border border-ink-700/15 bg-white p-6 sm:p-8">
        <h2 className="font-serif text-xl font-bold text-ink-900">
          Contexte institutionnel
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-800">
          {institutionalContext.text}
        </p>
        <p className="mt-3 text-sm text-ink-700/60">
          {institutionalContext.note}
        </p>
      </section>

      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-bold text-ink-900">
            Fiches disponibles
          </h2>
          <Link
            to="/secteurs"
            className="text-sm font-medium text-marine-600 hover:underline"
          >
            Voir tous les secteurs →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-5 sm:grid-cols-2">
        {sectors.map((sector) => (
          <div
            key={sector.id}
            className="rounded-sm border border-ink-700/15 bg-white p-5"
          >
            <h3 className="font-serif text-lg font-bold text-ink-900">
              {sector.name}
            </h3>
            <p className="mt-2 text-sm text-ink-700/80">
              {sector.description}
            </p>
          </div>
        ))}
        <div className="rounded-sm border border-dashed border-ink-700/25 p-5 text-sm text-ink-700/60 sm:col-span-2">
          D'autres secteurs (BTP, énergie, banque, agroalimentaire…) seront
          ajoutés au fur et à mesure que des faits sourcés seront documentés.
        </div>
      </section>

      <section className="mt-14 border-t border-ink-700/15 pt-8">
        <h2 className="font-serif text-lg font-bold text-ink-900">
          Méthode
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-800">
          <li>
            — Chaque fiche repose sur au moins une source publique déjà
            publiée (article de presse, document institutionnel), citée et
            reliée à l'original.
          </li>
          <li>
            — KiMèt ne formule pas de jugement : les citations et faits
            rapportés sont attribués à leurs auteurs (journalistes,
            économistes cités dans la source).
          </li>
          <li>
            — Toute personne peut proposer une source pour enrichir ou
            corriger une fiche via le formulaire dédié. Rien n'est publié
            automatiquement : chaque proposition est modérée avant intégration.
          </li>
        </ul>
      </section>
    </div>
  );
}
