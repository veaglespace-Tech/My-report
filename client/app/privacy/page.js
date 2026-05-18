import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · MyReport",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:py-16">
      <div className="rounded-3xl border border-white/35 bg-white/60 p-8 shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-700">Privacy Policy</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Your privacy matters.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          This is a placeholder privacy policy page. Update this content with your companyâ€™s official policy.
        </p>

        <div className="mt-8 grid gap-4 text-sm leading-7 text-slate-700">
          <div>
            <div className="font-semibold text-slate-900">Data collection</div>
            <div className="mt-1">We may collect basic account and usage information to provide the service.</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Data usage</div>
            <div className="mt-1">We use your data to operate, improve, and secure the platform.</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Contact</div>
            <div className="mt-1">
              For privacy questions, email{" "}
              <a className="font-semibold text-indigo-700 hover:underline" href="mailto:info@veaglespace.com">
                info@veaglespace.com
              </a>
              .
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 active:scale-[0.99]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

