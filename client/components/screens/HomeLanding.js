"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Check, Footprints, Gem, Glasses, Shirt, ShoppingBag, Sparkles, Watch } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { fallbackPublicPlans, getPublicPlanItems, publicPlanService } from "@/services/publicPlanService";

const HERO_BACKGROUNDS = {
  grocery:
    "/assets/grocery.jpg",
  clothing:
    "/assets/clothing.jpg",
  shoes:
    "/assets/shoes.jpg",
  electronics:
    "/assets/Electronics.jpg",
  beauty:
    "/assets/beauty.jpg",
  accessories:
    "/assets/accessories.jpg",
};

const CATEGORY_CARDS = [
  {
    icon: ShoppingBag,
    title: "Grocery",
    text: "Fast checkout, reorder flow, and expiry tracking.",
    store: "grocery",
    image: HERO_BACKGROUNDS.grocery,
    imagePosition: "center 42%",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    icon: Shirt,
    title: "Clothing",
    text: "Sizes, colors, variants, and fast-moving SKUs.",
    store: "clothing",
    image: HERO_BACKGROUNDS.clothing,
    imagePosition: "center 38%",
    accent: "from-violet-400 to-indigo-500",
  },
  {
    icon: Footprints,
    title: "Shoes",
    text: "Pairs, sizes, restock alerts, and returns.",
    store: "shoes",
    image: HERO_BACKGROUNDS.shoes,
    imagePosition: "center 50%",
    accent: "from-rose-400 to-orange-500",
  },
  {
    icon: Glasses,
    title: "Electronics",
    text: "Warranty, serial numbers, and invoicing.",
    store: "electronics",
    image: HERO_BACKGROUNDS.electronics,
    imagePosition: "center 38%",
    accent: "from-sky-400 to-blue-600",
  },
  {
    icon: Gem,
    title: "Beauty",
    text: "New arrivals, bundles, and repeat purchases.",
    store: "beauty",
    image: HERO_BACKGROUNDS.beauty,
    imagePosition: "center 42%",
    accent: "from-pink-400 to-fuchsia-500",
  },
  {
    icon: Watch,
    title: "Accessories",
    text: "Bundles, attach-rate, promos, and add-ons.",
    store: "accessories",
    image: HERO_BACKGROUNDS.accessories,
    imagePosition: "center 45%",
    accent: "from-amber-300 to-yellow-500",
  },
];

export function HomeLanding() {
  const [activeStore, setActiveStore] = useState("clothing");
  const [canHover, setCanHover] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateCanHover = () => setCanHover(mediaQuery.matches);

    updateCanHover();
    mediaQuery.addEventListener("change", updateCanHover);

    return () => {
      mediaQuery.removeEventListener("change", updateCanHover);
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      setPlansLoading(true);
      try {
        const response = await publicPlanService.getPlans();
        if (active) {
          const fetchedPlans = getPublicPlanItems(response);
          setPlans(fetchedPlans.length ? fetchedPlans : fallbackPublicPlans);
        }
      } catch (error) {
        if (active) {
          setPlans(fallbackPublicPlans);
        }
      } finally {
        if (active) {
          setPlansLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const pricingPlans = useMemo(() => {
    const normalized = plans.map((plan) => ({
      id: plan.id,
      name: plan.planName || plan.name,
      description: plan.description,
      price: plan.price ?? plan.monthlyPrice,
      duration: plan.duration,
      yearlyPrice: plan.yearlyPrice,
      features: String(plan.features || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      trialAvailable: Boolean(plan.trialAvailable),
      popular: Boolean(plan.popular),
      buttonText: plan.buttonText,
      themeColor: plan.themeColor,
    }));

    return normalized.slice(0, 3);
  }, [plans]);

  return (
    <div className="relative">
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-5xl pb-12 text-center transition-colors duration-300 sm:pb-14"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--stroke)] backdrop-blur">
            <Sparkles size={14} />
            Multi Store Management Softwares
          </div>

          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-[var(--foreground)] md:text-6xl">
            A premium dashboard for modern retail stores.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Track sales, inventory, invoices, customers, and reports across grocery, clothing, shoes, electronics, beauty, and accessories — all in one clean workspace.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/admin/login"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:brightness-110 hover:shadow-[0_12px_28px_rgba(59,130,246,0.35),0_0_0_1px_rgba(147,197,253,0.32),0_0_28px_rgba(59,130,246,0.28)] active:scale-[0.97]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <ShoppingBag size={16} />
              <span className="relative z-10">Login to your store</span>
            </Link>
            <Link
              href="/admin/signup"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--surface-soft)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] shadow-md shadow-black/10 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-0.75 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(236,254,255,0.95))] hover:border-[rgba(59,130,246,0.35)] hover:shadow-[0_10px_24px_rgba(168,85,247,0.18),0_0_0_1px_rgba(255,255,255,0.3)] active:scale-[0.97]"
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(124,140,255,0.06),rgba(79,209,197,0.04))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/0 transition-all duration-300 group-hover:border-white/60 group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]" />
              <Sparkles className="relative z-10 transition-transform duration-300 group-hover:rotate-12" size={16} />
              <span className="relative z-10">Create store account</span>
            </Link>
          </div>
        </motion.div>
      </section>

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {CATEGORY_CARDS.map((item, index) => {
              const Icon = item.icon;
              const hoverCardClasses = canHover
                ? "hover:border-white/75 hover:bg-white/70 hover:shadow-[0_22px_48px_rgba(79,70,229,0.22)]"
                : "";
              const hoverImageClasses = canHover
                ? "group-hover:scale-110 group-hover:saturate-[1.22]"
                : "";
              const hoverIconClasses = canHover ? "group-hover:-translate-y-1 group-hover:scale-105" : "";
              return (
                <motion.button
                  key={item.title}
                  type="button"
                  onMouseEnter={() => {
                    if (canHover) {
                      setActiveStore(item.store);
                    }
                  }}
                  onFocus={() => setActiveStore(item.store)}
                  whileHover={canHover ? { y: -6, scale: 1.02 } : undefined}
                  transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  className={`group relative overflow-hidden rounded-2xl border border-white/55 bg-white/60 text-left shadow-[0_14px_34px_rgba(79,70,229,0.14)] ring-1 ring-black/5 backdrop-blur-md transition-all duration-300 ${hoverCardClasses}`}
                  style={{ transformOrigin: "center" }}
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={item.image}
                      alt={`${item.title} store background`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`object-cover saturate-[1.12] contrast-[1.06] transition duration-700 ease-out ${hoverImageClasses}`}
                      style={{ objectPosition: item.imagePosition }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.02)_45%,rgba(238,242,255,0.20))]" />
                    <div className={`absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r ${item.accent}`} />
                    {canHover ? (
                      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                        <div className="absolute -left-1/3 top-0 h-full w-1/2 skew-x-[-18deg] bg-white/18 blur-sm transition-transform duration-700 group-hover:translate-x-[260%]" />
                      </div>
                    ) : null}
                  </div>
                  <div className="relative min-h-[96px] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(245,241,255,0.74))] p-5">
                    <div className="flex h-full items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/60 transition duration-300 ${hoverIconClasses}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900">{item.title}</div>
                        <div className="mt-1 text-sm text-gray-700">{item.text}</div>
                      </div>
                    </div>
                  </div>
                  {canHover ? (
                    <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-indigo-500/6 to-purple-500/8" />
                    </div>
                  ) : null}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {false ? (
      <section className="relative mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--stroke)] backdrop-blur">
            <Sparkles size={14} />
            Pricing
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Super Admin plans, reflected instantly on the homepage.
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-sm leading-7 text-[var(--muted)] sm:text-base">
            Start with a Free Trial, launch quickly, and scale with premium analytics when youâ€™re ready.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(plansLoading ? Array.from({ length: 3 }) : pricingPlans).map((plan, index) => (
            <motion.div
              key={plan?.id ?? index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.06 }}
              className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/55 p-6 shadow-xl shadow-black/10 backdrop-blur-md"
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />
              </div>

              {plansLoading ? (
                <div className="relative space-y-3">
                  <div className="h-5 w-28 rounded-full bg-black/10" />
                  <div className="h-10 w-40 rounded-2xl bg-black/10" />
                  <div className="h-4 w-full rounded-full bg-black/10" />
                  <div className="h-4 w-4/5 rounded-full bg-black/10" />
                  <div className="mt-6 h-10 w-full rounded-2xl bg-black/10" />
                </div>
              ) : (
                <div className="relative grid h-full content-between gap-6">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{plan.name}</div>
                    <div className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                      <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                        Rs. {Number(plan.price || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="ml-2 text-sm font-semibold text-slate-600">{plan.duration ? `/${plan.duration}` : "/ month"}</span>
                    </div>
                    <div className="mt-3 text-sm text-slate-700">{plan.description || "Plan details set by Super Admin."}</div>
                  </div>

                  <div className="grid gap-3">
                    {(plan.features?.length ? plan.features : ["PDF/Excel reports", "Inventory + invoices", "Notifications + renewals"]).slice(0, 4).map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm text-slate-800">
                        <div className="mt-0.5 rounded-full bg-cyan-500/15 p-1 ring-1 ring-cyan-500/15">
                          <Check className="h-4 w-4 text-cyan-700" />
                        </div>
                        <span className="leading-6">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/pricing"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 active:scale-[0.99]"
                  >
                    View full pricing
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
      ) : null}
    </div>
  );
}
