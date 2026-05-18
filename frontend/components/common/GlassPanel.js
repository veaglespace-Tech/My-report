import clsx from "clsx";

export function GlassPanel({ className, children }) {
  return (
    <div
      className={clsx(
        "card glass-card frost-line border-base-300/70 bg-base-100/80 text-base-content shadow-xl backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
