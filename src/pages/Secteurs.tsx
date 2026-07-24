import { useMemo, useState } from "react";
import { groups } from "../data/groups";
import { sectors } from "../data/sectors";
import GroupCard from "../components/GroupCard";

const ALL = "tous";

export default function Secteurs() {
  const [active, setActive] = useState<string>(ALL);

  const filtered = useMemo(
    () =>
      active === ALL
        ? groups
        : groups.filter((g) => g.sectorId === active),
    [active],
  );

  const activeSector = sectors.find((s) => s.id === active);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-serif text-3xl font-bold text-ink-900 sm:text-4xl">
        Secteurs &amp; groupes
      </h1>
      <p className="mt-3 max-w-2xl text-ink-800">
        Filtrez par secteur d'activité pour voir quels groupes économiques y
        sont documentés.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActive(ALL)}
          className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
            active === ALL
              ? "border-marine-600 bg-marine-600 text-white"
              : "border-ink-700/20 bg-white text-ink-800 hover:border-marine-600"
          }`}
        >
          Tous les secteurs
        </button>
        {sectors.map((sector) => (
          <button
            key={sector.id}
            onClick={() => setActive(sector.id)}
            className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
              active === sector.id
                ? "border-marine-600 bg-marine-600 text-white"
                : "border-ink-700/20 bg-white text-ink-800 hover:border-marine-600"
            }`}
          >
            {sector.name}
          </button>
        ))}
      </div>

      {activeSector && (
        <p className="mt-4 max-w-2xl text-sm text-ink-700/70">
          {activeSector.description}
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {filtered.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
        {filtered.length === 0 && (
          <p className="text-ink-700/60">
            Aucune fiche documentée pour ce secteur pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
