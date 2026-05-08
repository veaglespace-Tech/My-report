import Link from "next/link";
import { SiteFooter } from "@/components/common/SiteFooter";

export const metadata = {
  title: "About MyReport",
};

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[var(--body-landscape)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-80 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-260px] -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,209,197,0.35),transparent_65%)] blur-2xl"
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
        <section className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-medium tracking-wide text-[var(--muted-strong)] shadow-[0_12px_50px_rgba(3,10,25,0.18)] backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_0_4px_rgba(79,209,197,0.14)]" />
            Multi-store SaaS management platform
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
                About MyReport
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--muted)] sm:text-lg">
                MyReport helps modern stores manage billing, customers, inventory, reports, and daily
                operations through one powerful dashboard.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Designed for every store type",
                    text: "Grocery, clothing, electronics, beauty, shoes, and accessories—built for real-world retail workflows.",
                  },
                  {
                    title: "Fast onboarding and scaling",
                    text: "Start with one store and scale to multiple branches with consistent data, roles, and controls.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel)] p-5 shadow-[0_18px_60px_rgba(3,10,25,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[var(--panel-strong)]"
                  >
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--panel)] p-6 shadow-[var(--shadow-xl)] backdrop-blur">
              <p className="text-sm font-semibold text-[var(--foreground)]">What you get</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                {[
                  "Centralized multi-store management",
                  "Billing + POS with customer tracking",
                  "Product catalog + stock movement visibility",
                  "Role-based Admin & SuperAdmin dashboards",
                  "Subscriptions, plans, and renewals",
                  "Reports built for daily decisions",
                ].map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(124,140,255,0.18)] text-[var(--secondary)]">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 0 1 .006 1.415l-7.25 7.32a1 1 0 0 1-1.42.003L3.29 9.268a1 1 0 1 1 1.42-1.4l3.62 3.676 6.54-6.6a1 1 0 0 1 1.414-.006Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="leading-6">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14 sm:mt-16 lg:mt-20">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Built for multi-store operations
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              MyReport is a multi-store SaaS management and billing platform built for modern retail.
              From onboarding new branches to daily billing, stock tracking, and reports, everything is
              connected in a single workflow-aware system.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Multi-store management",
                text: "Manage multiple branches under one account with consistent settings, roles, and store-level visibility.",
              },
              {
                title: "Billing & POS system",
                text: "Fast billing flows that keep queues moving with saved customers, products, and configurable billing rules.",
              },
              {
                title: "Customer management",
                text: "Maintain customer profiles, purchase history, and insights to improve retention and service.",
              },
              {
                title: "Product & stock tracking",
                text: "Track products, variants, stock movements, and low-stock alerts to stay in control of inventory.",
              },
              {
                title: "Reports & analytics",
                text: "Daily sales, store comparisons, inventory insights, and trend views for confident decision-making.",
              },
              {
                title: "Admin & SuperAdmin dashboards",
                text: "Separate operational controls from platform oversight with role-based dashboards and governance.",
              },
              {
                title: "Subscription & plan management",
                text: "Plan upgrades, renewals, and billing status tracking built for SaaS subscription operations.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative rounded-3xl border border-[var(--stroke)] bg-[var(--panel)] p-6 shadow-[0_18px_60px_rgba(3,10,25,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[var(--panel-strong)]"
              >
                <div className="absolute inset-0 rounded-3xl opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_top,rgba(79,209,197,0.18),transparent_55%)]" />
                <div className="relative">
                  <p className="text-base font-semibold text-[var(--foreground)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 sm:mt-16 lg:mt-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Resources
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Quick links for onboarding, policy templates, and commonly asked questions.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <ResourceCard
              title="Store Setup & Operations"
              description="Complete guidance for store onboarding, billing setup, inventory management, and operational workflows."
              buttonLabel="Open Guide"
              href="/resources/guide"
              accent="primary"
            />
            <ResourceCard
              title="Billing & Store Policies"
              description="Ready-to-use templates and setup guidance for billing rules, inventory policies, and store management."
              buttonLabel="View Templates"
              href="/resources/templates"
              accent="secondary"
            />
            <ResourceCard
              title="Help & Support"
              description="Find answers to common questions about billing flow, subscriptions, dashboards, customer management, and reports."
              buttonLabel="View FAQs"
              href="/resources/faqs"
              accent="accent"
            />
          </div>
        </section>

        <section className="mt-14 sm:mt-16 lg:mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--panel)] p-8 shadow-[var(--shadow-xl)] backdrop-blur sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_top_left,rgba(124,140,255,0.25),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(79,209,197,0.22),transparent_55%)]"
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                  Need Personal Assistance?
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">
                  Our support team helps businesses with onboarding, billing workflows, dashboard
                  setup, and operational guidance.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--theme-primary-button-text)] shadow-[0_20px_70px_rgba(79,209,197,0.28)] transition hover:-translate-y-0.5 hover:bg-white md:w-auto"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-14 border-t border-[var(--stroke)] pt-8 text-center text-xs text-[var(--muted)] sm:mt-16">
          <p>All Rights Reserved © MyReport Technology Pvt. Ltd.</p>
          <p className="mt-2">Designed &amp; Developed by MyReport Technology Pvt. Ltd.</p>
        </footer>
      </div>
    </div>
  );
}

function ResourceCard({ title, description, buttonLabel, href, accent }) {
  const accentStyles = {
    primary: {
      ring: "ring-[rgba(79,209,197,0.2)]",
      badge: "bg-[rgba(79,209,197,0.14)] text-[var(--primary)]",
      button:
        "bg-[rgba(79,209,197,0.14)] text-[var(--foreground)] hover:bg-[rgba(79,209,197,0.22)]",
    },
    secondary: {
      ring: "ring-[rgba(124,140,255,0.22)]",
      badge: "bg-[rgba(124,140,255,0.14)] text-[var(--secondary)]",
      button:
        "bg-[rgba(124,140,255,0.14)] text-[var(--foreground)] hover:bg-[rgba(124,140,255,0.22)]",
    },
    accent: {
      ring: "ring-[rgba(255,184,107,0.22)]",
      badge: "bg-[rgba(255,184,107,0.14)] text-[var(--accent)]",
      button:
        "bg-[rgba(255,184,107,0.14)] text-[var(--foreground)] hover:bg-[rgba(255,184,107,0.22)]",
    },
  }[accent];

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--panel)] p-7 shadow-[0_18px_60px_rgba(3,10,25,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[var(--panel-strong)]",
        "ring-1",
        accentStyles.ring,
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%)]"
      />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-base font-semibold text-[var(--foreground)]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          </div>
          <span
            className={[
              "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-semibold",
              accentStyles.badge,
            ].join(" ")}
          >
            Resource
          </span>
        </div>

        <div className="mt-6">
          <Link
            href={href}
            className={[
              "inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition",
              accentStyles.button,
            ].join(" ")}
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
