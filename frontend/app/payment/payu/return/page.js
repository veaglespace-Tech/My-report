"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { PENDING_PAYU_SIGNUP_KEY } from "@/lib/payuCheckout";
import { clearSession } from "@/lib/session";
import { persistThemeMode } from "@/lib/theme";
import { getSignupPayUStatus, register } from "@/services/authService";
import { getPayUPaymentStatus } from "@/services/paymentService";
import { clearAuth } from "@/redux/slices/authSlice";
import { setThemeMode } from "@/redux/slices/uiSlice";

function successPath(flow, txnid) {
  const params = new URLSearchParams({
    flow: flow || "renewal",
    txnid: txnid || "",
  });
  return `/payment/success?${params.toString()}`;
}

export default function PayUReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const handledRef = useRef(false);
  const [state, setState] = useState({
    status: "checking",
    title: "Verifying PayU payment",
    message: "Please wait while we confirm your payment response.",
  });

  const query = useMemo(
    () => ({
      flow: searchParams?.get("flow") || "",
      txnid: searchParams?.get("txnid") || "",
      verified: searchParams?.get("verified") === "true",
      status: searchParams?.get("status") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    async function finishPayment() {
      if (!query.txnid) {
        setState({
          status: "failed",
          title: "Payment reference missing",
          message: "PayU did not return a transaction ID. Please try again.",
        });
        return;
      }

      try {
        if (query.flow === "signup") {
          const pendingRaw = localStorage.getItem(PENDING_PAYU_SIGNUP_KEY);
          const pending = pendingRaw ? JSON.parse(pendingRaw) : null;

          if (!pending || String(pending.txnid) !== String(query.txnid)) {
            throw new Error("Pending signup details were not found for this payment.");
          }

          const paymentStatus = await getSignupPayUStatus(query.txnid);
          if (!paymentStatus?.verified) {
            throw new Error("Payment is not verified yet.");
          }

          await register({
            ...pending.form,
            planId: Number(pending.planId),
          });
          localStorage.removeItem(PENDING_PAYU_SIGNUP_KEY);
          clearSession();
          dispatch(clearAuth());
          persistThemeMode("light");
          dispatch(setThemeMode("light"));
          toast.success("Registration completed successfully");
          setState({
            status: "success",
            title: "Registration completed",
            message: "Your PayU payment was verified.",
          });
          router.replace(successPath("signup", query.txnid));
          return;
        }

        const paymentStatus = await getPayUPaymentStatus(query.txnid);
        if (!paymentStatus?.verified) {
          throw new Error("Payment is not verified yet.");
        }

        toast.success("Payment verified with PayU");
        setState({
          status: "success",
          title: "Payment verified",
          message: "Your plan has been updated.",
        });
        router.replace(successPath(query.flow || "renewal", query.txnid));
      } catch (error) {
        setState({
          status: "failed",
          title: "Payment could not be completed",
          message: error?.message || "Unable to verify this PayU payment.",
        });
        toast.error(error?.message || "Unable to verify PayU payment");
      }
    }

    finishPayment();
  }, [dispatch, query.flow, query.txnid, router]);

  const success = state.status === "success";
  const failed = state.status === "failed";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-6 py-12">
      <div className="glass-panel frost-line w-full rounded-[32px] p-8 text-center shadow-[var(--shadow-xl)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-[var(--primary)] shadow-sm">
          {success ? <CheckCircle2 size={28} /> : failed ? <XCircle size={28} /> : <Loader2 className="animate-spin" size={28} />}
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--primary)]">PayU Payment</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{state.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{state.message}</p>
        <div className="mt-4 text-xs text-[var(--muted)]">Transaction ID: {query.txnid || "-"}</div>

        {failed ? (
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={query.flow === "signup" ? "/register/store-details" : "/admin/my-plan"} className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--theme-primary-button-text)] transition hover:brightness-105">
              Try Again
            </Link>
            <Link href="/" className="rounded-xl border border-[var(--stroke)] bg-white/75 px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white">
              Go Home
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
