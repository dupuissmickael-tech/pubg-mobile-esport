interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export default function SectionHeading({eyebrow, title, description}: SectionHeadingProps) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent-400">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
      {description && (
        <p className="mt-3 max-w-2xl text-lg text-slate-400">{description}</p>
      )}
    </div>
  );
}
