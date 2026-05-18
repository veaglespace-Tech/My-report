"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  IndianRupee,
  ReceiptText,
  ShieldCheck,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";

const accentMap = {
  cyan: "from-info to-info/10 text-info",
  emerald: "from-success to-success/10 text-success",
  amber: "from-warning to-warning/10 text-warning",
  violet: "from-secondary to-secondary/10 text-secondary",
  rose: "from-error to-error/10 text-error",
};

const metricIcons = {
  money: IndianRupee,
  people: Users,
  products: Boxes,
  invoices: ReceiptText,
  stores: Store,
  plans: ShieldCheck,
  alerts: AlertTriangle,
  growth: TrendingUp,
  default: BarChart3,
};

function resolveMetricIconKey(label = "") {
  const normalized = label.toLowerCase();
  if (normalized.includes("revenue") || normalized.includes("sales") || normalized.includes("amount")) return "money";
  if (normalized.includes("customer") || normalized.includes("admin") || normalized.includes("user")) return "people";
  if (normalized.includes("product") || normalized.includes("stock")) return "products";
  if (normalized.includes("invoice") || normalized.includes("billing")) return "invoices";
  if (normalized.includes("store")) return "stores";
  if (normalized.includes("plan") || normalized.includes("approval")) return "plans";
  if (normalized.includes("low") || normalized.includes("alert") || normalized.includes("overdue")) return "alerts";
  if (normalized.includes("growth") || normalized.includes("trend")) return "growth";
  return "default";
}

function useAnimatedValue(textValue) {
  const rawValue = String(textValue ?? "");
  const parsedValue = useMemo(() => {
    const valueMatch = rawValue.match(/^([^0-9.-]*)(-?[0-9][0-9,.]*)(.*)$/);
    return {
      prefix: valueMatch?.[1] || "",
      suffix: valueMatch?.[3] || "",
      numericValue: valueMatch ? Number(valueMatch[2].replace(/,/g, "")) : Number.NaN,
    };
  }, [rawValue]);
  const canAnimate = Number.isFinite(parsedValue.numericValue) && parsedValue.numericValue > 0;
  const [display, setDisplay] = useState(rawValue);

  useEffect(() => {
    const { numericValue, prefix, suffix } = parsedValue;
    if (!canAnimate) return;

    let frame;
    const start = performance.now();
    const duration = 900;

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const current = Math.round(numericValue * progress);
      setDisplay(`${prefix}${current.toLocaleString("en-IN")}${suffix}`);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [canAnimate, parsedValue]);

  return canAnimate ? display : rawValue;
}

export function MetricCard({ item, index = 0 }) {
  const animatedValue = useAnimatedValue(item.value);
  const Icon = item.icon || metricIcons[resolveMetricIconKey(item.label)] || metricIcons.default;
  const accentClass = accentMap[item.accent] || accentMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <GlassPanel className="relative h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className={clsx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accentClass)} />
        <div className="card-body gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="badge badge-outline border-base-300 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-base-content/65">
              {item.label}
            </div>
            <div className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-box bg-gradient-to-br shadow-sm", accentClass)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-base-content">{animatedValue}</div>
          <div className="text-sm leading-6 text-base-content/65">{item.helper}</div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
