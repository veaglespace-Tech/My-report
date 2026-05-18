export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex max-w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-full">
        {eyebrow ? (
          <div className="badge badge-primary badge-outline px-3 py-3 text-[11px] font-bold uppercase tracking-[0.2em]">{eyebrow}</div>
        ) : null}
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-base-content sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/65">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">{action}</div> : null}
    </div>
  );
}
