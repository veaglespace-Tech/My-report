"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ReceiptText } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const flow = searchParams?.get("flow") || "renewal";
  const txnid = searchParams?.get("txnid") || "";
  const isSignup = flow === "signup";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-6 py-12">
      <div className="glass-panel frost-line w-full rounded-[28px] p-8 text-center shadow-[var(--shadow-xl)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm">
          <CheckCircle2 size={34} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Payment Successful</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          {isSignup ? "Registration completed" : "Plan updated"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
          {isSignup
            ? "Your payment is verified and your MyReport account has been created."
            : "Your payment is verified and your selected plan is active."}
        </p>

        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-[var(--stroke)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
          <ReceiptText size={18} className="text-[var(--primary)]" />
          <span className="truncate">Transaction ID: {txnid || "-"}</span>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={isSignup ? "/admin/login" : "/admin/my-plan"} className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--theme-primary-button-text)] transition hover:brightness-105">
            {isSignup ? "Go to Login" : "View My Plan"}
          </Link>
          <Link href="/" className="rounded-xl border border-[var(--stroke)] bg-white/75 px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
