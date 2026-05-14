"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassPanel } from "@/components/common/GlassPanel";

function buildChartData(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      name: item?.name ?? item?.productName ?? item?.title ?? "",
      value: Number(item?.value ?? item?.quantity ?? item?.sales ?? item?.count ?? 0),
      revenue: Number(item?.revenue ?? 0),
      unit: item?.unit ?? "",
    }))
    .filter((item) => item.name && Number.isFinite(item.value) && item.value > 0);
}

export function TopSalesChart({ items = [], loading = false }) {
  const chartData = useMemo(() => buildChartData(items), [items]);
  const hasSalesData = chartData.length > 0;

  return (
    <GlassPanel className="max-w-full overflow-hidden p-5 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Top Sales</h3>
          <p className="mt-1 text-sm text-white/55">Best-performing products based on sales.</p>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/60 sm:block">
          {loading ? "Loading" : `${chartData.length} products`}
        </div>
      </div>

      <div className="h-72 w-full max-w-full sm:h-80">
        {hasSalesData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="topSalesGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="color-mix(in srgb, var(--secondary) 92%, white 8%)" stopOpacity={0.98} />
                  <stop offset="55%" stopColor="color-mix(in srgb, var(--primary) 85%, white 15%)" stopOpacity={0.78} />
                  <stop offset="100%" stopColor="color-mix(in srgb, var(--secondary) 40%, transparent)" stopOpacity={0.28} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "rgba(8,14,28,0.96)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 18,
                  boxShadow: "0 18px 60px rgba(2, 8, 20, 0.35)",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.72)" }}
                formatter={(value, _name, entry) => {
                  const unit = entry?.payload?.unit ? ` ${entry.payload.unit}` : "";
                  return [`${value}${unit}`, "Quantity sold"];
                }}
              />
              <Bar
                dataKey="value"
                fill="url(#topSalesGradient)"
                radius={[14, 14, 10, 10]}
                animationDuration={700}
                className="transition-[filter] duration-300 hover:[filter:brightness(1.08)]"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-6 text-center text-sm font-medium text-white/58">
            No sales data available yet.
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

