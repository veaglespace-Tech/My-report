import Link from "next/link";

export const metadata = {
  title: "Billing & Store Policy Templates · MyReport Store OS",
};

const TEMPLATES = [
  {
    title: "Billing Policy Template",
    description: "Use this template to define billing flow, GST rules, invoice generation, and payment handling.",
    outline: [
      "Invoice generation rules",
      "GST and tax setup",
      "Discount and coupon handling",
      "Refund and cancellation policy",
      "Cash/card/UPI payment workflow",
    ],
  },
  {
    title: "Inventory Management Template",
    description: "Best for stores managing stock, products, and supplier tracking.",
    outline: [
      "Product categories and SKU setup",
      "Low stock alert handling",
      "Supplier and purchase management",
      "Inventory update process",
      "Product return workflow",
    ],
  },
  {
    title: "Customer Management Template",
    description: "Use this template for customer records, loyalty tracking, and purchase history management.",
    outline: [
      "Customer registration process",
      "Purchase history tracking",
      "Loyalty/reward management",
      "Customer billing records",
      "Customer support workflow",
    ],
  },
  {
    title: "Multi-Store Operations Template",
    description: "Ideal for businesses managing multiple stores or branches.",
    outline: [
      "Branch/store setup process",
      "Role-based access control",
      "Store-wise reporting",
      "Shared inventory management",
      "Centralized analytics workflow",
    ],
  },
];

function TemplateCard({ template }) {
  return (
    <section className="group relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--panel)] p-7 shadow-[0_18px_60px_rgba(3,10,25,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[var(--panel-strong)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]"
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{template.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)] sm:text-base">{template.description}</p>
          </div>
          <div className="hidden h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 via-indigo-400/18 to-fuchsia-400/16 ring-1 ring-[var(--stroke)] sm:block" />
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--stroke)] bg-[var(--surface-soft)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-strong)]">Template Outline</p>
          <ul className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
            {template.outline.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[var(--foreground)] ring-1 ring-[var(--stroke)]">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.415l-7.25 7.32a1 1 0 0 1-1.42.003L3.29 9.268a1 1 0 1 1 1.42-1.4l3.62 3.676 6.54-6.6a1 1 0 0 1 1.414-.006Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="leading-6">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function TemplatesPage() {
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-medium tracking-wide text-[var(--muted-strong)] backdrop-blur">
              Billing &amp; Store Policy Templates
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Billing &amp; Store Policy Templates
            </h1>
            <p className="mt-4 text-pretty text-base leading-7 text-[var(--muted)] sm:text-lg">
              Ready-to-use templates and operational blueprints for billing, inventory, customers, and store workflows.
            </p>
          </div>

          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_18px_60px_rgba(3,10,25,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-strong)]"
          >
            Back to Resources
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {TEMPLATES.map((template) => (
            <TemplateCard key={template.title} template={template} />
          ))}
        </div>

      </div>
    </>
  );
}

