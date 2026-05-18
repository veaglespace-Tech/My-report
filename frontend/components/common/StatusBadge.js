import clsx from "clsx";

const toneMap = {
  ACTIVE: "badge-success",
  PENDING: "badge-warning",
  PENDING_APPROVAL: "badge-warning",
  BLOCKED: "badge-error",
  PAID: "badge-info",
  OVERDUE: "badge-error",
  FAILED: "badge-error",
  LOW: "badge-error",
  DRAFT: "badge-neutral",
  INACTIVE: "badge-neutral",
  NEW: "badge-info",
  IN_PROGRESS: "badge-warning",
  RESOLVED: "badge-success",
};

const labelMap = {
  PENDING_APPROVAL: "Pending",
};

export function StatusBadge({ value }) {
  return (
    <span
      className={clsx(
        "badge min-h-7 border-0 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] shadow-sm",
        toneMap[value] || "badge-ghost"
      )}
    >
      {labelMap[value] || String(value).replaceAll("_", " ")}
    </span>
  );
}
