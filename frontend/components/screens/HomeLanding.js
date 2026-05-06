"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Backpack, Footprints, Gem, Glasses, Shirt, ShoppingBag, Sparkles, Watch } from "lucide-react";
import { GlassPanel } from "@/components/common/GlassPanel";

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
  return (
    <div className="relative min-h-screen">
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-5xl px-6 pb-12 pt-10 text-center sm:pb-14 sm:pt-12"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-800 shadow-sm ring-1 ring-black/10 backdrop-blur">
            <Sparkles size={14} />
            MyReport Store OS
          </div>

          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
            A premium dashboard for modern retail stores.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-700 sm:text-lg">
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/50 px-6 py-3 text-sm font-semibold text-gray-900 shadow-md shadow-black/10 transition hover:bg-white/65"
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
    </div>
  );
}
