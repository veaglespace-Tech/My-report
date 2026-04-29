export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">{eyebrow}</div> : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
