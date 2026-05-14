import clsx from "clsx";

const toneMap = {
  ACTIVE: "text-[#059669] ring-1 ring-emerald-500/20",
  PENDING: "bg-amber-500/16 text-amber-100 ring-1 ring-amber-400/30",
  PENDING_APPROVAL: "bg-amber-500/16 text-amber-100 ring-1 ring-amber-400/30",
  BLOCKED: "text-[#dc2626] ring-1 ring-rose-500/20",
  PAID: "bg-cyan-500/16 text-cyan-100 ring-1 ring-cyan-400/30",
  LOW: "bg-rose-500/16 text-rose-200 ring-1 ring-rose-400/30",
};

const toneStyleMap = {
  ACTIVE: { backgroundColor: "rgba(16,185,129,0.14)" },
  BLOCKED: { backgroundColor: "rgba(239,68,68,0.14)" },
};

export function StatusBadge({ value }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase",
        toneMap[value] || "bg-white/8 text-white/70 ring-1 ring-white/10"
      )}
      style={toneStyleMap[value]}
    >
      {String(value).replaceAll("_", " ")}
    </span>
  );
}
