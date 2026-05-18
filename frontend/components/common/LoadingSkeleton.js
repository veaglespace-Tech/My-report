import { GlassPanel } from "@/components/common/GlassPanel";

export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: rows }).map((_, index) => (
        <GlassPanel key={index} className="p-5">
          <div className="skeleton h-20 rounded-box bg-base-300/70" />
        </GlassPanel>
      ))}
    </div>
  );
}
