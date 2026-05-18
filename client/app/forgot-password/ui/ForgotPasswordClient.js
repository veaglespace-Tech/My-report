"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { forgotPassword } from "@/services/authService";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email.");

    setLoading(true);
    try {
      const response = await forgotPassword({ email: email.trim() });
      toast.success(response?.message || "Reset link sent to your email.");
      setEmail("");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Email not registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-6 py-12">
      <div className="glass-panel frost-line w-full rounded-[32px] p-8 shadow-[var(--shadow-xl)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--primary)]">Account Recovery</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Forgot Password</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Enter your registered email and we will send a reset link.</p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-[var(--muted-strong)]">
            Email Address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              suppressHydrationWarning
              className="theme-input rounded-xl border border-[var(--stroke)] bg-white/80 px-4 py-3 text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-cyan-300"
              placeholder="you@example.com"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--theme-primary-button-text)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-sm text-[var(--muted)]">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
