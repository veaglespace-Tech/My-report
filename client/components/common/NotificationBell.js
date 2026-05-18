"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/format";

export function NotificationBell({ loader }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      if (!loader) {
        return;
      }

      const response = await loader();
      const nextItems = response.items || response.notifications || [];
      if (active) {
        setItems(nextItems);
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, [loader]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="relative rounded-full border border-white/10 bg-white/6 p-3 text-white/80 transition hover:bg-white/10"
      >
        <Bell size={18} />
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">
          {items.length}
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-panel frost-line absolute right-0 z-40 mt-3 w-[min(20rem,calc(100vw-2rem))] max-w-full rounded-[28px] p-4"
          >
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Notifications</div>
            <div className="grid max-h-80 gap-3 overflow-y-auto scrollbar-thin">
              {items.length ? (
                items.map((item) => (
                  <div key={`${item.title}-${item.createdAt}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <p className="mt-1 text-xs leading-5 text-white/55">{item.message}</p>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-cyan-200/70">{formatDate(item.createdAt)}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-white/55">
                  All clear for now.
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
