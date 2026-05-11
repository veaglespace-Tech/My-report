"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { publicPlanService } from "@/services/publicPlanService";

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

const fallbackPlans = [];

function formatInr(amount) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return "Rs. 0";
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

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
            <div className="text-sm font-semibold text-white/90">{plan.name}</div>
            <div className="mt-2 text-4xl font-black tracking-tight text-white">
              <span className="bg-gradient-to-r from-cyan-200 via-blue-200 to-violet-200 bg-clip-text text-transparent">
                {plan.price}
              </span>
            </div>
            <div className="mt-2 text-sm text-white/70">{plan.cycle}</div>
          </div>

          {plan.trialAvailable ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
              Free Trial Available
            </div>
          ) : null}

          {plan.badge ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
              {plan.badge}
            </div>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-3 text-sm text-white/80">
              <div className="mt-0.5 rounded-full bg-cyan-400/15 p-1 ring-1 ring-cyan-200/15">
                <Check className="h-4 w-4 text-cyan-200" />
              </div>
              <span className="leading-6">{feature}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelect(plan.id)}
          className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 hover:shadow-2xl hover:shadow-indigo-500/25 active:scale-[0.99]"
        >
          {plan.buttonText || "Select Plan"}
        </button>
      </div>
    </motion.div>
  );
}

export default function PricingClient() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const handleSelect = (planId) => {
    try {
      localStorage.setItem("myreport:selectedPlanId", String(planId));
    } catch {
      // ignore
    }
    router.push(`/register/store-details?planId=${encodeURIComponent(String(planId))}`);
  };

  useEffect(() => {
    let active = true;
    async function load() {
      setLoadingPlans(true);
      try {
        const response = await publicPlanService.getPlans();
        console.log("Plans response:", response);
        if (active) {
          let fetchedPlans = [];
          if (Array.isArray(response)) {
            fetchedPlans = response;
          } else if (response && Array.isArray(response.items)) {
            fetchedPlans = response.items;
          } else if (response && Array.isArray(response.data)) {
            fetchedPlans = response.data;
          } else if (response && response.data && Array.isArray(response.data.items)) {
            fetchedPlans = response.data.items;
          }
          setPlans(fetchedPlans);
        }
      } catch (error) {
        console.error("Failed to load plans:", error);
        if (active) {
          setPlans([]);
        }
      } finally {
        if (active) {
          setLoadingPlans(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const dynamicPlans = useMemo(() => {
    if (plans.length === 0) return [];
    const normalized = plans.map((plan, index) => ({
      id: String(plan.id),
      name: plan.planName || plan.name,
      price: formatInr(plan.price ?? plan.monthlyPrice),
      cycle: plan.duration || "Monthly",
      featured: Boolean(plan.popular) || index === 1,
      badge: plan.popular ? "Most Popular" : index === 1 ? "Most Popular" : undefined,
      trialAvailable: Boolean(plan.trialAvailable),
      buttonText: plan.buttonText,
      features: String(plan.features || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));

    return normalized.slice(0, 4);
  }, [plans]);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="w-full"
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

        {loadingPlans ? (
          <motion.div variants={item} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-[520px] rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-xl backdrop-blur-md" />
            ))}
          </motion.div>
        ) : dynamicPlans.length ? (
          <motion.div variants={item} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dynamicPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} onSelect={handleSelect} />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={item} className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-center text-white/80 shadow-xl backdrop-blur-md">
            No pricing plans available currently.
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
