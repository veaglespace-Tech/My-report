import Link from "next/link";

export const metadata = {
  title: "Store Setup & Operations Guide · MyReport Store OS",
};

const SECTIONS = [
  {
    title: "Store Launch Checklist",
    description:
      "Set up your store workspace before onboarding staff so billing, inventory, customers, and reporting work smoothly from day one.",
    steps: [
      "Verify store details, GST/business information, store type, and admin profile before operations begin.",
      "Set up product categories, inventory units, stock alerts, and pricing structure properly.",
      "Add staff members, assign roles such as Admin, Manager, Cashier, or Inventory Staff.",
      "Test billing flow, invoice generation, customer creation, and product stock updates before launching the store.",
    ],
  },
  {
    title: "Admin & Staff Access Flow",
    description: "Control user permissions and ensure every staff member has the correct dashboard access.",
    steps: [
      "Invite staff using email or mobile number from the Users section.",
      "Assign appropriate roles and permissions for billing, products, reports, and customer management.",
      "Allow managers to monitor inventory, billing, and customer activity securely.",
      "Verify login access and dashboard visibility before daily usage.",
    ],
  },
  {
    title: "Daily Store Operations Workflow",
    description: "Use a structured daily workflow for smooth retail operations.",
    steps: [
      "Open store dashboard and verify inventory status before store hours begin.",
      "Generate customer bills and invoices using the Billing Workspace.",
      "Monitor low stock products and update inventory regularly.",
      "Export sales and billing reports daily or weekly for tracking and analysis.",
    ],
  },
  {
    title: "Reports & Analytics Workflow",
    description: "Use reports and analytics to improve business decisions and store performance.",
    steps: [
      "Review daily sales and billing summaries.",
      "Track top-selling products and customer purchase history.",
      "Export Excel/PDF reports for accounting and GST tracking.",
      "Analyze inventory movement and low-stock alerts regularly.",
    ],
  },
];

function Step({ index, text }) {
  const step = String(index + 1).padStart(2, "0");
  return (
    <li className="relative flex gap-4">
      <div className="flex shrink-0 flex-col items-center">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-sm font-semibold text-[var(--foreground)] ring-1 ring-[var(--stroke)]">
          {step}
        </div>
        <div className="mt-3 hidden h-full w-px bg-[var(--stroke)] sm:block" />
      </div>
      <div className="pb-6">
        <p className="text-sm leading-6 text-[var(--muted-strong)] sm:text-base">{text}</p>
      </div>
    </li>
  );
}

export default function StoreGuidePage() {
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-medium tracking-wide text-[var(--muted-strong)] backdrop-blur">
              Store Setup & Operations Guide
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Store Setup &amp; Operations Guide
            </h1>
            <p className="mt-4 text-pretty text-base leading-7 text-[var(--muted)] sm:text-lg">
              Complete guidance for store onboarding, billing setup, inventory management, customer handling, and
              operational workflows.
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
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--panel)] p-7 shadow-[0_18px_60px_rgba(3,10,25,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-[var(--panel-strong)]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]"
              />
              <div className="relative">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)] sm:text-base">{section.description}</p>
                <ol className="mt-6">
                  {section.steps.map((step, index) => (
                    <Step key={step} index={index} text={step} />
                  ))}
                </ol>
              </div>
            </section>
          ))}
        </div>

      </div>
    </>
  );
}

