"use client";

import Link from "next/link";
import { useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Store, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { GlassPanel } from "@/components/common/GlassPanel";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { clearSession, persistSession } from "@/lib/session";
import { persistThemeMode } from "@/lib/theme";
import { login, signupAdmin, verifyOtp } from "@/services/authService";
import { setCredentials } from "@/redux/slices/authSlice";
import { setThemeMode } from "@/redux/slices/uiSlice";

function AuthBackdrop() {
  return (
    <>
      <div className="hero-orb left-[8%] top-[8%] h-48 w-48 bg-cyan-400/30" />
      <div className="hero-orb right-[6%] top-[16%] h-64 w-64 bg-violet-400/24" />
      <div className="hero-orb bottom-[10%] left-[20%] h-52 w-52 bg-amber-300/18" />
    </>
  );
}

function AuthShell({ headline, title, description, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuthBackdrop />
      <div className="content-max relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-panel frost-line flex flex-col justify-between rounded-[36px] p-8 md:p-10"
        >
          <div>
            <div className="theme-soft-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--primary)]">
              <Sparkles size={14} />
              {headline}
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Premium operations intelligence for high-growth retail teams.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">
              Run approvals, inventory, billing, reporting, and renewals from a polished SaaS control tower built for real scale.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { label: "Platform ready", value: "JWT + RBAC" },
              { label: "Premium UX", value: "Animated glass UI" },
              { label: "Revenue visibility", value: "Charts + export" },
            ].map((item) => (
              <div key={item.label} className="theme-soft-panel rounded-[28px] p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">{item.label}</div>
                <div className="mt-3 text-lg font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <GlassPanel className="p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="text-xs uppercase tracking-[0.28em] text-[var(--primary)]">{title}</div>
              <ThemeToggle compact />
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{description}</h2>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-8 border-t border-white/8 pt-6">{footer}</div> : null}
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}

export function RoleSelectionScreen() {
  return (
    <AuthShell
      headline="Welcome to MyReport"
      title="Choose login type"
      description="Start with the role you want to access today."
      footer={
        <div className="text-sm text-white/55">
          Need an account?{" "}
          <Link href="/admin/signup" className="font-semibold text-[var(--primary)] transition hover:opacity-80">
            Sign Up
          </Link>
        </div>
      }
    >
      <div className="grid gap-4">
        <Link href="/superadmin/login">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.985 }}
            className="theme-soft-panel invert-hover rounded-[28px] p-6 transition"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/14 text-cyan-200">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-lg font-semibold">Super Admin Login</div>
                <p className="mt-2 text-sm leading-6 text-white/55">Review admin requests, manage plans, and monitor platform revenue.</p>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link href="/admin/login">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.985 }}
            className="theme-soft-panel invert-hover rounded-[28px] p-6 transition"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/14 text-violet-200">
                <Store size={24} />
              </div>
              <div>
                <div className="text-lg font-semibold">Admin Login</div>
                <p className="mt-2 text-sm leading-6 text-white/55">Operate billing, inventory, customers, and reports from your store dashboard.</p>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </AuthShell>
  );
}

function AuthFormField({ label, name, type = "text", value, onChange, placeholder, helper, required = false }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--muted-strong)]">{label}</span>
      <input
        required={required}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
      />
      {helper ? <span className="text-xs text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}

export function LoginScreen({ role }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: role === "SUPER_ADMIN" ? "ankitapatil00001@gmail.com" : "admin@myreport.com",
    password: role === "SUPER_ADMIN" ? "Ankita@12345" : "Admin@12345",
    rememberMe: role === "SUPER_ADMIN",
  });

  const copy = useMemo(
    () =>
      role === "SUPER_ADMIN"
        ? {
            headline: "SuperAdmin access",
            title: "Control the business from a premium command center.",
            description: "Fixed enterprise credentials with secure JWT authentication.",
          }
        : {
            headline: "Admin access",
            title: "Run your store with billing, inventory, and insights in sync.",
            description: "Login to manage customers, products, sales, and plan usage.",
          },
    [role]
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    startTransition(async () => {
      try {
        clearSession();
        const payload = await login({
          email: form.email,
          password: form.password,
          role,
          rememberMe: form.rememberMe,
        });

        persistSession(payload);
        dispatch(setCredentials(payload));
        const nextTheme = payload.profile?.preferences?.darkMode ? "dark" : "light";
        persistThemeMode(nextTheme);
        dispatch(setThemeMode(nextTheme));
        toast.success("Login successful");
        router.push(payload.redirectTo);
      } catch (error) {
        toast.error(error.message || "Unable to login");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <AuthShell
      headline={copy.headline}
      title={role === "SUPER_ADMIN" ? "Super Admin Login" : "Admin Login"}
      description={copy.description}
      footer={
        <div className="flex items-center justify-between text-sm text-white/55">
          <Link href="/" className="transition hover:text-white">
            Back to role selection
          </Link>
          {role === "ADMIN" ? (
            <Link href="/admin/signup" className="font-semibold text-[var(--primary)] transition hover:opacity-80">
              Need an account? Sign Up
            </Link>
          ) : null}
        </div>
      }
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <AuthFormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="name@company.com"
        />
        <PasswordField
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Enter secure password"
          helper={role === "SUPER_ADMIN" ? "Fixed credentials seeded in the backend configuration." : undefined}
        />

        <div className="flex items-center justify-between text-sm">
          {role === "SUPER_ADMIN" ? (
            <label className="flex items-center gap-2 text-[var(--muted)]">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="theme-input h-4 w-4 rounded"
              />
              Remember me
            </label>
          ) : (
            <button type="button" className="text-[var(--primary)] transition hover:opacity-80">
              Forgot Password
            </button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          type="submit"
          className="theme-primary-button rounded-2xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Authenticating..." : role === "SUPER_ADMIN" ? "Login to SuperAdmin" : "Login to Admin"}
        </motion.button>
      </form>
    </AuthShell>
  );
}

export function AdminSignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [verified, setVerified] = useState(false);
  const [demoOtp, setDemoOtp] = useState("654321");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    city: "",
    address: "",
    otp: "",
    termsAccepted: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.termsAccepted) {
      toast.error("Accept the terms to continue");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Password and confirm password must match");
      return;
    }

    setLoading(true);
    startTransition(async () => {
      try {
        const response = await signupAdmin({
          fullName: form.fullName,
          email: form.email,
          mobileNumber: form.mobileNumber,
          password: form.password,
          confirmPassword: form.confirmPassword,
          storeName: form.storeName,
          city: form.city,
          address: form.address,
        });
        setDemoOtp(response.demoOtp || "654321");
        setOtpStage(true);
        toast.success(response.message || "Signup submitted. Verify OTP to finish.");
      } catch (error) {
        toast.error(error.message || "Unable to sign up");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    startTransition(async () => {
      try {
        await verifyOtp({ email: form.email, otp: form.otp });
        setVerified(true);
        toast.success("Email verified. Your account is now waiting for approval.");
      } catch (error) {
        toast.error(error.message || "OTP verification failed");
      } finally {
        setVerifying(false);
      }
    });
  };

  return (
    <AuthShell
      headline="Admin signup"
      title="Create your MyReport store workspace."
      description="Premium onboarding with OTP verification UI, password strength feedback, and approval-ready account creation."
      footer={
        <div className="flex items-center justify-between text-sm text-white/55">
          <Link href="/admin/login" className="transition hover:text-white">
            Already have an account? Login
          </Link>
          <Link href="/" className="font-semibold text-[var(--primary)] transition hover:opacity-80">
            Back to role selection
          </Link>
        </div>
      }
    >
      {verified ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5">
          <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/16 text-emerald-200">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="mt-4 text-2xl font-semibold">Signup Completed</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Your email is verified and the account is waiting for SuperAdmin approval. Use the Admin login after approval.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/login")}
            className="theme-primary-button rounded-2xl px-5 py-3 text-sm font-bold"
          >
            Go to Admin Login
          </button>
        </motion.div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <AuthFormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Anita Sharma" />
            <AuthFormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="owner@store.com" />
            <AuthFormField label="Mobile Number" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required placeholder="9876543210" />
            <AuthFormField label="Shop / Store Name" name="storeName" value={form.storeName} onChange={handleChange} required placeholder="GlowMart" />
            <AuthFormField label="City" name="city" value={form.city} onChange={handleChange} required placeholder="Mumbai" />
            <AuthFormField label="Address" name="address" value={form.address} onChange={handleChange} required placeholder="Bandra West, Mumbai" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-3">
              <PasswordField
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Create password"
              />
              <PasswordStrengthMeter password={form.password} />
            </div>
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm password"
            />
          </div>

          <div className="theme-soft-panel rounded-[24px] p-4">
            <div className="text-sm font-semibold">Email verification</div>
            <p className="mt-1 text-sm text-white/55">A demo OTP will be shown after signup so you can complete the UI flow end-to-end.</p>
            {otpStage ? (
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="grid gap-2">
                  <AuthFormField label="OTP" name="otp" value={form.otp} onChange={handleChange} placeholder={`Use demo OTP ${demoOtp}`} required />
                  <div className="text-xs text-cyan-200/80">Demo OTP: {demoOtp}</div>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifying}
                  className="self-end rounded-2xl border border-cyan-300/20 bg-cyan-300/14 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-60"
                >
                  {verifying ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            ) : null}
          </div>

          <label className="theme-soft-panel flex items-start gap-3 rounded-2xl px-4 py-4 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={handleChange}
              className="theme-input mt-1 h-4 w-4 rounded"
            />
            I agree to the terms, privacy policy, and store onboarding review process.
          </label>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            type="submit"
            className="theme-primary-button rounded-2xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Create Admin Account"}
          </motion.button>
        </form>
      )}
    </AuthShell>
  );
}
