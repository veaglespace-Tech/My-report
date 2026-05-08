"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I create a customer bill?",
    a: "Go to Billing Workspace → Select Customer → Add Products → Generate Bill.",
  },
  {
    q: "How do I add new products?",
    a: "Go to Products section → Click Add Product → Fill product details → Save.",
  },
  {
    q: "How do I export reports?",
    a: "Open Reports page → Select date range → Click Download → Export PDF or Excel.",
  },
  {
    q: "How do I manage low stock alerts?",
    a: "Low stock products automatically appear in dashboard alerts and reports.",
  },
  {
    q: "Can I manage multiple stores?",
    a: "Yes, MyReport Store OS supports multi-store and branch management.",
  },
  {
    q: "How do I reset admin password?",
    a: "Use the Forgot Password option from the login page.",
  },
  {
    q: "Can I use the system on mobile devices?",
    a: "Yes, the dashboard is fully responsive for mobile, tablet, and desktop.",
  },
];

function FaqItem({ item, index, openIndex, setOpenIndex }) {
  const open = openIndex === index;
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--panel)] shadow-[0_18px_60px_rgba(3,10,25,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[var(--panel-strong)]">
      <button
        type="button"
        onClick={() => setOpenIndex(open ? -1 : index)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[var(--foreground)] sm:text-lg">{item.q}</span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--surface-soft)] ring-1 ring-[var(--stroke)] transition group-hover:bg-[var(--surface-strong)]">
          <ChevronDown className={`h-5 w-5 text-[var(--muted-strong)] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      <div
        className={[
          "grid transition-[grid-template-rows,opacity] duration-300",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden px-6 pb-6">
          <p className="text-sm leading-6 text-[var(--muted)] sm:text-base">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqClient() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="mt-10">
      <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--surface-soft)] p-4 shadow-[0_18px_60px_rgba(3,10,25,0.18)] backdrop-blur sm:p-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search FAQs..."
          className="theme-input w-full rounded-2xl bg-white/70 px-5 py-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-300 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
        />
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.map((item, index) => (
          <FaqItem key={item.q} item={item} index={index} openIndex={openIndex} setOpenIndex={setOpenIndex} />
        ))}
      </div>
    </div>
  );
}

