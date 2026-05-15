import Link from "next/link";

export const metadata = {
  title: "About MyReport",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
      <section className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-medium tracking-wide text-[var(--muted-strong)] shadow-[0_12px_50px_rgba(3,10,25,0.18)] backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_0_4px_rgba(79,209,197,0.14)]" />
          Multi-store SaaS management platform
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          <div className="max-w-3xl">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              About MyReport
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--muted)] sm:text-lg">
              MyReport helps modern stores manage billing, customers, inventory, reports, and daily operations through one
              powerful dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-stretch">
              {[
                {
                  title: "Designed for every store type",
                  text: "Grocery, clothing, electronics, beauty, shoes, and accessories built for real-world retail workflows.",
                },
                {
                  title: "Fast onboarding and scaling",
                  text: "Start with one store and scale to multiple branches with consistent data, roles, and controls.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex h-full flex-1 flex-col justify-between rounded-[22px] border border-cyan-200/50 bg-white/78 p-5 shadow-[0_16px_42px_rgba(59,130,246,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-white/90 hover:shadow-[0_18px_46px_rgba(59,130,246,0.16)]"
                >
                  <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="group flex h-full flex-col justify-between rounded-[24px] border border-indigo-200/60 bg-white/80 p-6 shadow-[0_18px_48px_rgba(99,102,241,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300/70 hover:bg-white/92">
            <p className="text-sm font-semibold text-slate-950">What you get</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                "Centralized multi-store management",
                "Billing + POS with customer tracking",
                "Product catalog + stock movement visibility",
                "Role-based Admin & SuperAdmin dashboards",
                "Subscriptions, plans, and renewals",
                "Reports built for daily decisions",
              ].map((feature) => (
                <li key={feature} className="group/item flex gap-3 transition-all duration-300 hover:translate-x-0.5 hover:text-slate-950">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-teal-700 ring-1 ring-cyan-200 transition-all duration-300 group-hover/item:bg-teal-600 group-hover/item:text-white">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.415l-7.25 7.32a1 1 0 0 1-1.42.003L3.29 9.268a1 1 0 1 1 1.42-1.4l3.62 3.676 6.54-6.6a1 1 0 0 1 1.414-.006Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="leading-6 transition-colors duration-300 group-hover/item:text-slate-950">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-[72px] pb-[42px]">
        <div className="max-w-3xl">
          <h2 className="mb-3 text-2xl font-bold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-3xl">
            How it works
          </h2>
          <p className="mt-[14px] max-w-[820px] text-sm leading-[1.7] text-[var(--muted)]">
            Built around real store operations: billing, inventory, customers, reporting, and subscription governance.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: "Fast billing and invoicing",
              text: "Create invoices, print receipts, and track sales with a premium POS flow.",
            },
            {
              title: "Customers that convert",
              text: "Capture mobile, purchase history, and customer profiles to drive repeat business.",
            },
            {
              title: "Reports that drive decisions",
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
            {
              title: "Secure role-based access",
              text: "JWT authentication, role routing, and premium security best-practices baked in.",
            },
          ].map((item) => (
            <div
              key={item.title}
            className="group relative flex min-h-[230px] flex-col justify-start overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/82 p-8 shadow-[0_18px_52px_rgba(59,130,246,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/90 hover:bg-white hover:shadow-[0_20px_52px_rgba(59,130,246,0.17)]"
          >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_45%)] opacity-80" />
              <div className="relative flex h-full flex-col justify-start">
                <p className="text-base font-semibold leading-6 text-slate-950">{item.title}</p>
                <p className="mt-3 max-w-[30ch] text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 sm:mt-16 lg:mt-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">Resources</h2>
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
                Our support team helps businesses with onboarding, billing workflows, dashboard setup, and operational guidance.
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
    </div>
  );
}

function ResourceCard({ title, description, buttonLabel, href, accent }) {
  const accentStyles = {
    primary: {
      ring: "ring-[rgba(79,209,197,0.2)]",
      badge: "bg-[rgba(79,209,197,0.14)] text-[var(--primary)]",
      button: "bg-[rgba(79,209,197,0.14)] text-[var(--foreground)] hover:bg-[rgba(79,209,197,0.22)]",
    },
    secondary: {
      ring: "ring-[rgba(124,140,255,0.22)]",
      badge: "bg-[rgba(124,140,255,0.14)] text-[var(--secondary)]",
      button: "bg-[rgba(124,140,255,0.14)] text-[var(--foreground)] hover:bg-[rgba(124,140,255,0.22)]",
    },
    accent: {
      ring: "ring-[rgba(255,184,107,0.22)]",
      badge: "bg-[rgba(255,184,107,0.14)] text-[var(--accent)]",
      button: "bg-[rgba(255,184,107,0.14)] text-[var(--foreground)] hover:bg-[rgba(255,184,107,0.22)]",
    },
  }[accent];

  return (
    <div
      className={[
        "group relative flex h-full flex-1 flex-col justify-between overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/82 p-7 shadow-[0_18px_48px_rgba(59,130,246,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/90 hover:bg-white hover:shadow-[0_18px_48px_rgba(59,130,246,0.17)]",
        "ring-1",
        accentStyles.ring,
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%)]"
      />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
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

        <div className="mt-6 flex items-stretch">
          <Link
            href={href}
            className={[
              "inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-300",
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
