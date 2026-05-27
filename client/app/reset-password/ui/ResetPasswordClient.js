"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "@/services/authService";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [visibility, setVisibility] = useState({ password: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const next = {};
    if (!token) next.token = "Reset token is missing.";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords must match.";
    return next;
  }, [form.confirmPassword, form.password, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (Object.keys(errors).length) {
      toast.error(errors.token || errors.password || errors.confirmPassword || "Please fix the errors.");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({ token, password: form.password });
      toast.success(response?.message || "Password updated successfully.");
      router.push("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setVisibility((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const blockConfirmPasswordPaste = (event) => {
    event.preventDefault();
    toast.error("Please type the confirm password manually.");
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-6 py-12">
      <div className="glass-panel frost-line w-full rounded-[32px] p-8 shadow-[var(--shadow-xl)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--primary)]">Secure Reset</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Reset Password</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Create a new password for your MyReport account.</p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-[var(--muted-strong)]">
            New Password
            <div className="relative">
              <input
                suppressHydrationWarning
                type={visibility.password ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
                className="theme-input rounded-xl border border-[var(--stroke)] bg-white/80 px-4 py-3 pr-12 text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-cyan-300"
                placeholder="Enter new password"
              />
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => toggleVisibility("password")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--muted)] transition hover:text-[var(--foreground)]"
                aria-label={visibility.password ? "Hide password" : "Show password"}
              >
                {visibility.password ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--muted-strong)]">
            Confirm Password
            <div className="relative">
              <input
                suppressHydrationWarning
                type={visibility.confirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) => setForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                onPaste={blockConfirmPasswordPaste}
                className="theme-input rounded-xl border border-[var(--stroke)] bg-white/80 px-4 py-3 pr-12 text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-cyan-300"
                placeholder="Confirm new password"
              />
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => toggleVisibility("confirmPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--muted)] transition hover:text-[var(--foreground)]"
                aria-label={visibility.confirmPassword ? "Hide password" : "Show password"}
              >
                {visibility.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            suppressHydrationWarning
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--theme-primary-button-text)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="mt-6 text-sm text-[var(--muted)]">
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
