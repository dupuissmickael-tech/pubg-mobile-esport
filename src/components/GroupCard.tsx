import { Link } from "react-router-dom";
import type { Group } from "../types";

export default function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      to={`/groupes/${group.id}`}
      className="block rounded-sm border border-ink-700/15 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <h3 className="font-serif text-xl font-bold text-ink-900">
        {group.name}
      </h3>
      {group.brands.length > 0 && (
        <p className="mt-1 text-sm text-ink-700/70">
          Enseigne{group.brands.length > 1 ? "s" : ""} : {group.brands.join(", ")}
        </p>
      )}
      <p className="mt-3 line-clamp-3 text-sm text-ink-800">
        {group.facts[0]?.text}
      </p>
      <span className="mt-3 inline-block text-sm font-medium text-marine-600 group-hover:underline">
        Voir la fiche →
      </span>
    </Link>
  );
}
