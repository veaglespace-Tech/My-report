import { GlassPanel } from "@/components/common/GlassPanel";

export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: rows }).map((_, index) => (
        <GlassPanel key={index} className="p-6">
          <div className="h-20 rounded-2xl shimmer" />
        </GlassPanel>
      ))}
    </div>
  );
}
