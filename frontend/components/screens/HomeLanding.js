"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Check, Footprints, Gem, Glasses, Shirt, ShoppingBag, Sparkles, Watch } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";
import { publicPlanService } from "@/services/publicPlanService";

const HERO_BACKGROUNDS = {
  grocery:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80",
  clothing:
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1800&q=80",
  shoes: "/hero/best affordable shopping products.jpg",
  electronics:
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1800&q=80",
  beauty:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&q=80",
  accessories:
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1800&q=80",
};

const CATEGORY_CARDS = [
  {
    icon: ShoppingBag,
    title: "Grocery",
    text: "Fast checkout, reorder flow, and expiry tracking.",
    store: "grocery",
    image: HERO_BACKGROUNDS.grocery,
  },
  {
    icon: Shirt,
    title: "Clothing",
    text: "Sizes, colors, variants, and fast-moving SKUs.",
    store: "clothing",
    image: HERO_BACKGROUNDS.clothing,
  },
  {
    icon: Footprints,
    title: "Shoes",
    text: "Pairs, sizes, restock alerts, and returns.",
    store: "shoes",
    image: HERO_BACKGROUNDS.shoes,
  },
  {
    icon: Glasses,
    title: "Electronics",
    text: "Warranty, serial numbers, and invoicing.",
    store: "electronics",
    image: HERO_BACKGROUNDS.electronics,
  },
  {
    icon: Gem,
    title: "Beauty",
    text: "New arrivals, bundles, and repeat purchases.",
    store: "beauty",
    image: HERO_BACKGROUNDS.beauty,
  },
  {
    icon: Watch,
    title: "Accessories",
    text: "Bundles, attach-rate, promos, and add-ons.",
    store: "accessories",
    image: HERO_BACKGROUNDS.accessories,
  },
];

export function HomeLanding() {
  const [activeStore, setActiveStore] = useState("clothing");
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setPlansLoading(true);
      try {
        const response = await publicPlanService.getPlans();
        if (active) {
          setPlans(Array.isArray(response?.items) ? response.items : []);
        }
      } catch {
        if (active) {
          setPlans([]);
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
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      features: String(plan.features || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));

    const hasTrial = normalized.some((p) => (p.name || "").toLowerCase().includes("trial"));
    const seeded = hasTrial
      ? normalized
      : [
          {
            id: "TRIAL",
            name: "Free Trial",
            description: "Explore the dashboard and export-ready reports with a starter workspace.",
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: ["Basic reports", "PDF/Excel exports", "Starter catalog"],
          },
          ...normalized,
        ];

    return seeded.slice(0, 3);
  }, [plans]);

  return (
    <div className="relative">
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-5xl px-6 pb-12 pt-10 text-center transition-colors duration-300 sm:pb-14 sm:pt-12"
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
            >
              <ShoppingBag size={16} />
              Login to your store
            </Link>
            <Link
              href="/admin/signup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--surface-soft)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] shadow-md shadow-black/10 transition hover:bg-[var(--surface-strong)]"
            >
              <Sparkles size={16} />
              Create store account
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
              return (
                <motion.button
                  key={item.title}
                  type="button"
                  onMouseEnter={() => setActiveStore(item.store)}
                  onFocus={() => setActiveStore(item.store)}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/45 text-left shadow-md shadow-black/10 backdrop-blur-md"
                  style={{ transformOrigin: "center" }}
                >
                  <div className="relative h-36 w-full">
                    <Image
                      src={item.image}
                      alt={`${item.title} store background`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/40 to-transparent" />
                  </div>
                  <div className="relative p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-indigo-700 shadow-sm shadow-black/10 ring-1 ring-black/10 transition group-hover:bg-white/85">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900">{item.title}</div>
                        <div className="mt-1 text-sm text-gray-700">{item.text}</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-indigo-500/6 to-purple-500/8" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

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
                        Rs. {Number(plan.monthlyPrice || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="ml-2 text-sm font-semibold text-slate-600">/ month</span>
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
    </div>
  );
}
