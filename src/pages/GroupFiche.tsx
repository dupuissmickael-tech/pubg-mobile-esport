import { Link, useParams } from "react-router-dom";
import { groups } from "../data/groups";
import { sectors } from "../data/sectors";
import FactBlock from "../components/FactBlock";

export default function GroupFiche() {
  const { groupId } = useParams<{ groupId: string }>();
  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-bold text-ink-900">
          Fiche introuvable
        </h1>
        <p className="mt-3 text-ink-700/70">
          Ce groupe n'est pas (encore) documenté sur KiMèt.
        </p>
        <Link
          to="/secteurs"
          className="mt-6 inline-block text-marine-600 hover:underline"
        >
          ← Retour aux secteurs
        </Link>
      </div>
    );
  }

  const sector = sectors.find((s) => s.id === group.sectorId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        to="/secteurs"
        className="text-sm font-medium text-marine-600 hover:underline"
      >
        ← Retour aux secteurs
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {sector && (
          <Link to="/secteurs" className="badge hover:border-marine-600">
            {sector.name}
          </Link>
        )}
      </div>

      <h1 className="mt-3 font-serif text-3xl font-bold text-ink-900 sm:text-4xl">
        {group.name}
      </h1>
      {group.brands.length > 0 && (
        <p className="mt-2 text-ink-700/70">
          Enseigne{group.brands.length > 1 ? "s" : ""} associée
          {group.brands.length > 1 ? "s" : ""} : {group.brands.join(", ")}
        </p>
      )}

      <div className="mt-8 space-y-8">
        {group.facts.map((fact, i) => (
          <FactBlock key={i} fact={fact} />
        ))}
      </div>

      <div className="mt-10 rounded-sm border border-dashed border-ink-700/25 bg-white p-5 text-sm text-ink-700/70">
        Une information à ajouter, corriger ou préciser sur {group.name} ?{" "}
        <Link
          to={`/proposer-une-source?fiche=${group.id}`}
          className="font-medium text-marine-600 hover:underline"
        >
          Proposez une source
        </Link>
        , elle sera examinée avant toute publication.
      </div>
    </div>
  );
}
