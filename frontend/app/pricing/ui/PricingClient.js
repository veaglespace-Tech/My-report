"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const features = [
  "Up to 500 users",
  "Manual Attendance",
  "Face Recognition",
  "Advanced PDF Reports",
  "Excel Export",
  "Chat Support",
];

const plans = [
  { value: "TRIAL", name: "Free Trial", price: "Rs. 0", cycle: "7 Days Trial", featured: false },
  { value: "3_MONTHS", name: "Plan 1", price: "Rs. 3,000", cycle: "3 Months", featured: false },
  { value: "6_MONTHS", name: "Plan 2", price: "Rs. 4,500", cycle: "6 Months", featured: true, badge: "Most Popular" },
  { value: "12_MONTHS", name: "Plan 3", price: "Rs. 6,000", cycle: "12 Months", featured: false },
];

function PricingCard({ plan, onSelect }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.05, y: -6 }}
      className={[
        "relative h-full rounded-3xl border bg-slate-950/80 p-6 shadow-xl backdrop-blur-md transition",
        plan.featured
          ? "border-cyan-300/60 shadow-2xl shadow-indigo-500/25 ring-1 ring-cyan-200/25"
          : "border-white/10 shadow-slate-900/20",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div
          className={[
            "absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl",
            plan.featured ? "bg-cyan-400/20" : "bg-indigo-500/10",
          ].join(" ")}
        />
        <div
          className={[
            "absolute -left-10 bottom-0 h-36 w-36 rounded-full blur-3xl",
            plan.featured ? "bg-indigo-400/20" : "bg-fuchsia-500/10",
          ].join(" ")}
        />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white/80">{plan.name}</div>
            <div className="mt-2 text-4xl font-black tracking-tight text-white">{plan.price}</div>
            <div className="mt-2 text-sm text-white/60">{plan.cycle}</div>
          </div>

          {plan.badge ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
              {plan.badge}
            </div>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-3 text-sm text-white/70">
              <div className="mt-0.5 rounded-full bg-cyan-400/15 p-1 ring-1 ring-cyan-200/15">
                <Check className="h-4 w-4 text-cyan-200" />
              </div>
              <span className="leading-6">{feature}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelect(plan.value)}
          className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 hover:shadow-2xl hover:shadow-indigo-500/25 active:scale-[0.99]"
        >
          Select Plan
        </button>
      </div>
    </motion.div>
  );
}

export default function PricingClient() {
  const router = useRouter();

  const handleSelect = (planValue) => {
    try {
      localStorage.setItem("myreport:selectedPlan", planValue);
    } catch {
      // ignore
    }
    router.push(`/register?plan=${encodeURIComponent(planValue)}&step=3`);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-cyan-300/50 blur-3xl" />
        <div className="absolute -right-28 top-8 h-96 w-96 rounded-full bg-indigo-300/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-300/40 blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="relative mx-auto w-full max-w-7xl px-6 py-12 sm:py-14"
      >
        <motion.div variants={item} className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-700 ring-1 ring-black/5 backdrop-blur-md">
            Flexible Pricing
          </div>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Plans for{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">
              Every Scale
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-7 text-slate-700">
            Transparent pricing with no hidden fees. Choose the plan that matches your organization’s needs.
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard key={plan.value} plan={plan} onSelect={handleSelect} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
