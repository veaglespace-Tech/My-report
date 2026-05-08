import Link from "next/link";
import { SiteFooter } from "@/components/common/SiteFooter";
import { FaqClient } from "./FaqClient";

export const metadata = {
  title: "Help & Support FAQs · MyReport Store OS",
};

export default function FaqsPage() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[var(--body-landscape)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-80 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-260px] -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,184,107,0.22),transparent_65%)] blur-2xl"
      />

      <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-medium tracking-wide text-[var(--muted-strong)] backdrop-blur">
              Help &amp; Support FAQs
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Help &amp; Support FAQs
            </h1>
            <p className="mt-4 text-pretty text-base leading-7 text-[var(--muted)] sm:text-lg">
              Find answers to common questions about billing, inventory, products, customers, subscriptions, and reports.
            </p>
          </div>

          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_18px_60px_rgba(3,10,25,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-strong)]"
          >
            Back to Resources
          </Link>
        </div>

        <FaqClient />

        <SiteFooter />
      </div>
    </div>
  );
}

