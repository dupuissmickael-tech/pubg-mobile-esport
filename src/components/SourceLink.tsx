import type { Source } from "../types";

export default function SourceLink({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-start gap-2 rounded-sm border border-ink-700/20 bg-[#faf8f3] px-3 py-2 text-sm text-ink-800 transition-colors hover:border-marine-600 hover:bg-white"
    >
      <span className="mt-0.5 text-marine-600">↗</span>
      <span>
        <span className="block font-medium group-hover:underline">
          {source.title}
        </span>
        <span className="text-ink-700/60">{source.publisher}</span>
      </span>
    </a>
  );
}
