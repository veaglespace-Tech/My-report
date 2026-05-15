"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { GlassPanel } from "@/components/common/GlassPanel";

const accentMap = {
  cyan: "from-cyan-400/50 to-cyan-200/10",
  emerald: "from-emerald-400/50 to-emerald-200/10",
  amber: "from-amber-400/50 to-amber-200/10",
  violet: "from-violet-400/50 to-violet-200/10",
};

function useAnimatedValue(textValue) {
  const numericValue = Number(String(textValue).replace(/[^0-9.]/g, ""));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return;
    }

    let frame;
    const start = performance.now();
    const duration = 900;
    const prefix = String(textValue).replace(/[0-9.,\s]/g, "");

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const current = Math.round(numericValue * progress);
      setDisplay(prefix ? `${prefix} ${current.toLocaleString("en-IN")}` : current.toLocaleString("en-IN"));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numericValue, textValue]);

  return Number.isFinite(numericValue) && numericValue > 0 ? display : textValue;
}

export function MetricCard({ item, index = 0 }) {
  const animatedValue = useAnimatedValue(item.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <GlassPanel className="relative overflow-hidden p-6">
        <div className={clsx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accentMap[item.accent] || accentMap.cyan)} />
        <div className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">{item.label}</div>
        <div className="mt-4 text-3xl font-semibold tracking-tight text-[var(--muted-strong)]">{animatedValue}</div>
        <div className="mt-3 text-sm text-[var(--muted)]">{item.helper}</div>
      </GlassPanel>
    </motion.div>
  );
}
