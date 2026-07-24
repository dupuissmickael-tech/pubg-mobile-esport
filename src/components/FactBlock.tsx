import type { Fact } from "../types";
import SourceLink from "./SourceLink";

export default function FactBlock({ fact }: { fact: Fact }) {
  return (
    <div className="border-l-2 border-marine-600 pl-4">
      {fact.isQuote ? (
        <blockquote className="font-serif text-lg leading-relaxed text-ink-900">
          « {fact.text} »
        </blockquote>
      ) : (
        <p className="text-lg leading-relaxed text-ink-900">{fact.text}</p>
      )}
      {fact.attributedTo && (
        <p className="mt-2 text-sm text-ink-700/70">— {fact.attributedTo}</p>
      )}
      <div className="mt-3">
        <SourceLink source={fact.source} />
      </div>
    </div>
  );
}
