import clsx from "clsx";

export function GlassPanel({ className, children }) {
  return <div className={clsx("glass-card frost-line rounded-[28px]", className)}>{children}</div>;
}
