import clsx from "clsx";

const toneMap = {
  ACTIVE: "bg-emerald-500/16 text-emerald-200 ring-1 ring-emerald-400/30",
  PENDING: "bg-amber-500/16 text-amber-100 ring-1 ring-amber-400/30",
  PENDING_APPROVAL: "bg-amber-500/16 text-amber-100 ring-1 ring-amber-400/30",
  BLOCKED: "bg-rose-500/16 text-rose-200 ring-1 ring-rose-400/30",
  PAID: "bg-cyan-500/16 text-cyan-100 ring-1 ring-cyan-400/30",
  LOW: "bg-rose-500/16 text-rose-200 ring-1 ring-rose-400/30",
};

export function StatusBadge({ value }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase",
        toneMap[value] || "bg-white/8 text-white/70 ring-1 ring-white/10"
      )}
    >
      {String(value).replaceAll("_", " ")}
    </span>
  );
}
