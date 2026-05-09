"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Globe, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, Sparkles, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { GlassPanel } from "@/components/common/GlassPanel";
import { clearSession, persistSession } from "@/lib/session";
import { persistThemeMode } from "@/lib/theme";
import { createSignupRazorpayOrder, login, register, verifySignupRazorpayPayment } from "@/services/authService";
import { setCredentials } from "@/redux/slices/authSlice";
import { setThemeMode } from "@/redux/slices/uiSlice";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";

function AuthBackdrop() {
  return (
    <>
      <div className="hero-orb left-[8%] top-[8%] h-48 w-48 bg-cyan-400/30" />
      <div className="hero-orb right-[6%] top-[16%] h-64 w-64 bg-violet-400/24" />
      <div className="hero-orb bottom-[10%] left-[20%] h-52 w-52 bg-amber-300/18" />
    </>
  );
}

function AuthShell({ headline, title, description, children, footer, hidePromo = false, containerClassName = "" }) {
  const pathname = usePathname();
  const isMarketingAuth = pathname === "/login" || pathname?.startsWith("/register");

  return (
    <div
      className={[
        "relative flex w-full justify-center overflow-hidden px-4 pb-10",
        isMarketingAuth ? "min-h-0 items-start bg-transparent pt-0" : "min-h-screen items-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 pt-10",
      ].join(" ")}
    >
      <AuthBackdrop />
      <div
        className={[
          hidePromo
            ? ["relative z-10 w-full max-w-2xl", containerClassName].filter(Boolean).join(" ")
            : "content-max relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.95fr]",
        ].join(" ")}
      >
        {hidePromo ? null : (
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
        )}

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {hidePromo ? (
            <div className="rounded-2xl bg-white p-8 shadow-lg md:p-10">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="text-xs uppercase tracking-[0.28em] text-[var(--primary)]">{title}</div>
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{description}</h2>
              <div className="mt-8">{children}</div>
              {footer ? <div className="mt-8 border-t border-black/10 pt-6 text-slate-600">{footer}</div> : null}
            </div>
          ) : (
            <GlassPanel className="p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="text-xs uppercase tracking-[0.28em] text-[var(--primary)]">{title}</div>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{description}</h2>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-8 border-t border-white/8 pt-6">{footer}</div> : null}
          </GlassPanel>
          )}
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

function AuthFormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  helper,
  autoComplete,
  required = false,
  status = "idle",
}) {
  const statusClassName =
    status === "error"
      ? "border-red-400 focus:ring-2 focus:ring-red-300"
      : status === "success"
        ? "border-green-300 focus:ring-2 focus:ring-cyan-300"
        : "focus:ring-2 focus:ring-cyan-300";

  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--muted-strong)]">{label}</span>
      <input
        suppressHydrationWarning
        required={required}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`theme-input w-full rounded-xl bg-white/70 px-5 py-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 ${statusClassName}`}
      />
      {helper ? <span className="text-xs text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}

export function LoginScreen({ role }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
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
    setTouched(true);
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const errors = useMemo(() => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    return nextErrors;
  }, [form.email, form.password]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (!isValid) {
      return;
    }
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
      description={role === "ADMIN" ? "Login to manage your store" : copy.description}
      hidePromo={role === "ADMIN"}
      containerClassName={role === "ADMIN" ? "max-w-md" : ""}
      footer={
        <div className={role === "ADMIN" ? "flex items-center justify-between text-sm text-slate-600" : "flex items-center justify-between text-sm text-white/55"}>
          <Link href="/" className={role === "ADMIN" ? "transition hover:text-slate-900" : "transition hover:text-white"}>
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
      <form className="grid gap-5" onSubmit={handleSubmit} autoComplete="off">
        <AuthFormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
          autoComplete="off"
          helper={touched && errors.email ? errors.email : undefined}
          status={
            touched
              ? errors.email
                ? "error"
                : form.email.trim()
                  ? "success"
                  : "idle"
              : "idle"
          }
        />
        <PasswordField
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Enter your password"
          autoComplete="new-password"
          status={
            touched
              ? errors.password
                ? "error"
                : form.password
                  ? "success"
                  : "idle"
              : "idle"
          }
          helper={
            touched && errors.password
              ? errors.password
              : role === "SUPER_ADMIN"
                ? "Fixed credentials seeded in the backend configuration."
                : undefined
          }
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
          disabled={loading || !isValid}
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
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);

  // Allow selecting a plan from `/pricing` and jumping directly to plan selection.
  // Supported inputs:
  // - Query string: `/register?plan=6_MONTHS&step=3`
  // - Local storage: `myreport:selectedPlan`
  const preselectPlan = useMemo(() => {
    const planParam = searchParams?.get("plan");
    if (planParam) return planParam;
    try {
      return localStorage.getItem("myreport:selectedPlan");
    } catch {
      return null;
    }
  }, [searchParams]);

  const preselectStep = useMemo(() => {
    const step = Number(searchParams?.get("step") || "");
    return Number.isFinite(step) ? step : null;
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState(() => {
    if (preselectStep && preselectStep >= 1 && preselectStep <= 2) {
      return preselectStep;
    }
    return 1;
  });

  const [form, setForm] = useState(() => ({
    organization: {
      organizationName: "",
      storeType: "",
      businessEmail: "",
      city: "",
      state: "",
      country: "",
      address: "",
      phone: "",
    },
    admin: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      gender: "MALE",
    },
    plan: preselectPlan || "3_MONTHS",
  }));

  const planCards = [
    {
      value: "TRIAL",
      chip: "7 Days Trial",
      title: "Free Trial",
      price: "Rs. 0",
      amount: 0,
      note: "Explore the dashboard before committing.",
      features: ["Starter workspace", "Up to 250 products", "7-day access"],
    },
    {
      value: "3_MONTHS",
      chip: "3 Months",
      title: "Launch",
      price: "Rs. 3,000",
      amount: 3000,
      note: "Best for new stores getting started fast.",
      features: ["Starter workspace", "Priority setup", "Quarterly plan cycle"],
    },
    {
      value: "6_MONTHS",
      chip: "6 Months",
      title: "Growth",
      price: "Rs. 5,500",
      amount: 5500,
      note: "More runway for teams building momentum.",
      features: ["Starter workspace", "Longer runway", "Biannual plan cycle"],
    },
    {
      value: "12_MONTHS",
      chip: "12 Months",
      title: "Scale",
      price: "Rs. 10,500",
      amount: 10500,
      note: "Lowest cost for serious long-term operators.",
      features: ["Starter workspace", "Annual cycle", "Best value"],
    },
  ];

  const selectedPlan = planCards.find((item) => item.value === form.plan) ?? planCards[1];

  const isStep1Complete = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    return (
      Boolean(form.organization.organizationName.trim()) &&
      Boolean(form.organization.storeType.trim()) &&
      Boolean(form.organization.businessEmail.trim()) &&
      emailRegex.test(form.organization.businessEmail.trim()) &&
      Boolean(form.organization.phone.trim()) &&
      phoneRegex.test(form.organization.phone.trim())
    );
  }, [form.organization]);

  const isStep2Complete = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const email = form.admin.email.trim();
    const mobile = form.admin.mobile.trim();

    return (
      Boolean(form.admin.fullName.trim()) &&
      Boolean(email) &&
      emailRegex.test(email) &&
      Boolean(form.admin.password) &&
      form.admin.password.length >= 8 &&
      form.admin.password === form.admin.confirmPassword &&
      Boolean(mobile) &&
      phoneRegex.test(mobile)
    );
  }, [form.admin]);

  const isPlanSelected = Boolean(form.plan);

  useEffect(() => {
    if (preselectStep && preselectStep >= 3 && preselectStep <= 4) {
      toast.error("Please complete previous steps first");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(1);
    }
  }, [preselectStep]);

  useEffect(() => {
    if (currentStep >= 3 && !isStep1Complete) {
      toast.error("Please complete all required fields");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(1);
      return;
    }

    if (currentStep >= 3 && !isStep2Complete) {
      toast.error("Please complete all required fields");
      setCurrentStep(2);
      return;
    }

    if (currentStep === 4 && !isPlanSelected) {
      toast.error("Please select a plan");
      setCurrentStep(3);
    }
  }, [currentStep, isPlanSelected, isStep1Complete, isStep2Complete]);

  const getStepErrors = useMemo(() => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (currentStep === 1) {
      if (!form.organization.organizationName.trim()) {
        errors.organizationName = "Store name is required.";
      }
      if (!form.organization.storeType.trim()) {
        errors.storeType = "Store type is required.";
      }
      if (!form.organization.businessEmail.trim()) {
        errors.businessEmail = "Business email is required.";
      } else if (!emailRegex.test(form.organization.businessEmail.trim())) {
        errors.businessEmail = "Enter a valid email address.";
      }
      if (!form.organization.phone.trim()) {
        errors.phone = "Phone number is required.";
      } else if (!phoneRegex.test(form.organization.phone.trim())) {
        errors.phone = "Phone number must be exactly 10 digits.";
      }
    }

    if (currentStep === 2) {
      if (!form.admin.email.trim()) {
        errors.adminEmail = "Admin email is required.";
      } else if (!emailRegex.test(form.admin.email.trim())) {
        errors.adminEmail = "Enter a valid email address.";
      }
      if (!form.admin.mobile.trim()) {
        errors.adminMobile = "Mobile is required.";
      } else if (!phoneRegex.test(form.admin.mobile.trim())) {
        errors.adminMobile = "Mobile must be exactly 10 digits.";
      }
      if (!form.admin.password) {
        errors.password = "Password is required.";
      } else if (form.admin.password.length < 8) {
        errors.password = "Password must contain minimum 8 characters.";
      }
      if (!form.admin.confirmPassword) {
        errors.confirmPassword = "Confirm password is required.";
      } else if (form.admin.password !== form.admin.confirmPassword) {
        errors.confirmPassword = "Password and confirm password must match.";
      }
    }

    return errors;
  }, [currentStep, form]);

  const isCurrentStepValid = Object.keys(getStepErrors).length === 0;

  const updateSection = (section, field, value) => {
    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const validateCurrentStep = () => {
    setAttemptedNext(true);
    if (!isCurrentStepValid) {
      const firstError = Object.values(getStepErrors)[0];
      toast.error(firstError || "Please complete all required fields");
      return false;
    }

    if (currentStep === 1) {
      const requiredFields = [
        ["organizationName", "Store name"],
        ["storeType", "Store type"],
        ["businessEmail", "Business email"],
        ["phone", "Phone number"],
      ];

      for (const [field, label] of requiredFields) {
        if (!form.organization[field].trim()) {
          toast.error(`${label} is required`);
          return false;
        }
      }
    }

    if (currentStep === 2) {
      const requiredFields = [
        ["fullName", "Full name"],
        ["email", "Admin email"],
        ["password", "Password"],
        ["confirmPassword", "Confirm password"],
        ["mobile", "Mobile"],
        ["gender", "Gender"],
      ];

      for (const [field, label] of requiredFields) {
        if (!String(form.admin[field] || "").trim()) {
          toast.error(`${label} is required`);
          return false;
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10}$/;

      if (!emailRegex.test(form.admin.email.trim())) {
        toast.error("Invalid email format");
        return false;
      }

      if (!phoneRegex.test(form.admin.mobile.trim())) {
        toast.error("Invalid mobile number");
        return false;
      }

      if (form.admin.password.length < 8) {
        toast.error("Password must contain minimum 8 characters");
        return false;
      }

      if (form.admin.password !== form.admin.confirmPassword) {
        toast.error("Password and confirm password must match");
        return false;
      }
    }

    if (currentStep === 3 && !form.plan) {
      toast.error("Please select a plan");
      return false;
    }

    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setAttemptedNext(false);
    setCurrentStep((previous) => Math.min(4, previous + 1));
  };

  const goBack = () => {
    setAttemptedNext(false);
    setCurrentStep((previous) => Math.max(1, previous - 1));
  };

  const handleConfirm = async () => {
    setLoading(true);
    startTransition(async () => {
      try {
        clearSession();

        const selectedPlan = planCards.find((item) => item.value === form.plan) ?? planCards[1];

        if (!selectedPlan) {
          throw new Error("Please select a plan");
        }

        const amount = Number(selectedPlan.amount ?? 0);
        if (Number.isNaN(amount) || amount < 0) {
          throw new Error("Invalid plan amount");
        }

        if (!amount) {
          const payload = await register(form);
          persistSession(payload);
          dispatch(setCredentials(payload));
          const nextTheme = payload.profile?.preferences?.darkMode ? "dark" : "light";
          persistThemeMode(nextTheme);
          dispatch(setThemeMode(nextTheme));
          toast.success("Registration completed successfully");
          router.push("/admin/dashboard");
          return;
        }

        const order = await createSignupRazorpayOrder({
          email: form.admin.email,
          planName: selectedPlan.title,
          amount,
        });

        if (!order?.configured || !order?.orderId) {
          throw new Error("Razorpay is not configured on server");
        }

        await openRazorpayCheckout({
          key: order.keyId,
          orderId: order.orderId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "MyReport",
          description: `Signup - ${order.planName || selectedPlan.title}`,
          prefill: {
            name: form.admin.fullName,
            email: form.admin.email,
            contact: form.admin.mobile,
          },
          onSuccess: async (rzpResponse) => {
            const verification = await verifySignupRazorpayPayment({
              razorpayOrderId: rzpResponse.razorpay_order_id,
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpaySignature: rzpResponse.razorpay_signature,
            });

            if (!verification?.verified) {
              throw new Error("Payment verification failed");
            }

            const payload = await register(form);
            persistSession(payload);
            dispatch(setCredentials(payload));
            const nextTheme = payload.profile?.preferences?.darkMode ? "dark" : "light";
            persistThemeMode(nextTheme);
            dispatch(setThemeMode(nextTheme));
            toast.success("Registration completed successfully");
            router.push("/admin/dashboard");
          },
          onDismiss: () => {
            toast.message("Payment cancelled");
          },
        });
      } catch (error) {
        toast.error(error.message || "Unable to complete registration");
      } finally {
        setLoading(false);
      }
    });
  };

  const stepPill = `Step ${currentStep} of 4`;
  const renderField = (label, icon, input, error) => (
    <label className="grid gap-2 text-sm">
      <span className="font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{label}</span>
      <div
        className={[
          "theme-input flex items-center gap-3 rounded-[28px] px-4 py-3",
          error ? "ring-1 ring-red-500/60" : "",
        ].join(" ")}
      >
        <span className="text-[var(--muted)]">{icon}</span>
        {input}
      </div>
      {error ? <div className="text-sm text-red-500">{error}</div> : null}
    </label>
  );

  return (
    <AuthShell
      headline="SaaS onboarding"
      title="Register your organization"
      description="A four-step setup flow for your store, admin, plan, and activation."
      hidePromo
      footer={
        <div className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/admin/login" className="transition hover:text-slate-900">
            Already have an account? Login
          </Link>
          <Link href="/" className="font-semibold text-[var(--primary)] transition hover:opacity-80">
            Back to role selection
          </Link>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="mx-auto inline-flex rounded-full border border-white/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
          {stepPill}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition ${
                step <= currentStep ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-slate-200/70"
              }`}
            />
          ))}
        </div>

        {currentStep === 1 ? (
          <div className="grid gap-5">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Store details</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Set up your organization profile before we create the admin account.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField(
                "Store Name",
                <Building2 size={18} />,
                <input
                  value={form.organization.organizationName}
                  onChange={(event) => updateSection("organization", "organizationName", event.target.value)}
                  placeholder="GlowMart"
                  className="w-full bg-transparent text-sm outline-none"
                />,
                attemptedNext ? getStepErrors.organizationName : null
              )}
              {renderField(
                "Store Type",
                <Building2 size={18} />,
                <select
                  value={form.organization.storeType}
                  onChange={(event) => updateSection("organization", "storeType", event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="">Select store type</option>
                  <option value="Shoe Shop">Shoe Shop</option>
                  <option value="Clothes Shop">Clothes Shop</option>
                  <option value="Grocery Shop">Grocery Shop</option>
                  <option value="Electronics Shop">Electronics Shop</option>
                  <option value="Beauty Shop">Beauty Shop</option>
                  <option value="Accessories Shop">Accessories Shop</option>
                </select>,
                attemptedNext ? getStepErrors.storeType : null
              )}
              {renderField(
                "Business Email",
                <Mail size={18} />,
                <input
                  type="email"
                  value={form.organization.businessEmail}
                  onChange={(event) => updateSection("organization", "businessEmail", event.target.value)}
                  placeholder="store@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                />,
                attemptedNext ? getStepErrors.businessEmail : null
              )}
              {renderField(
                "City",
                <MapPin size={18} />,
                <input
                  value={form.organization.city}
                  onChange={(event) => updateSection("organization", "city", event.target.value)}
                  placeholder="City"
                  className="w-full bg-transparent text-sm outline-none"
                />
              )}
              {renderField(
                "State",
                <Globe size={18} />,
                <input
                  value={form.organization.state}
                  onChange={(event) => updateSection("organization", "state", event.target.value)}
                  placeholder="State"
                  className="w-full bg-transparent text-sm outline-none"
                />
              )}
              {renderField(
                "Country",
                <Globe size={18} />,
                <input
                  value={form.organization.country}
                  onChange={(event) => updateSection("organization", "country", event.target.value)}
                  placeholder="Country"
                  className="w-full bg-transparent text-sm outline-none"
                />
              )}
              {renderField(
                "Phone Number",
                <Phone size={18} />,
                <input
                  value={form.organization.phone}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(event) => updateSection("organization", "phone", event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit phone number"
                  className="w-full bg-transparent text-sm outline-none"
                />,
                attemptedNext ? getStepErrors.phone : null
              )}
            </div>
            {renderField(
              "Address",
              <MapPin size={18} />,
              <input
                value={form.organization.address}
                onChange={(event) => updateSection("organization", "address", event.target.value)}
                placeholder="Street, area, landmark"
                className="w-full bg-transparent text-sm outline-none"
              />
            )}
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="grid gap-5">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Admin profile</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Create the primary administrator who will manage the dashboard.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField(
                "Full Name",
                <UserRound size={18} />,
                <input
                  value={form.admin.fullName}
                  onChange={(event) => updateSection("admin", "fullName", event.target.value)}
                  placeholder="Full name"
                  className="w-full bg-transparent text-sm outline-none"
                />
              )}
              {renderField(
                "Admin Email",
                <Mail size={18} />,
                <input
                  type="email"
                  value={form.admin.email}
                  onChange={(event) => updateSection("admin", "email", event.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-transparent text-sm outline-none"
                />,
                attemptedNext ? getStepErrors.adminEmail : null
              )}
              {renderField(
                "Mobile",
                <Phone size={18} />,
                <input
                  value={form.admin.mobile}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(event) => updateSection("admin", "mobile", event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="w-full bg-transparent text-sm outline-none"
                />,
                attemptedNext ? getStepErrors.adminMobile : null
              )}
              {renderField(
                "Gender",
                <UserRound size={18} />,
                <select
                  value={form.admin.gender}
                  onChange={(event) => updateSection("admin", "gender", event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-3">
                <PasswordField
                  label="Password"
                  name="password"
                  value={form.admin.password}
                  onChange={(event) => updateSection("admin", "password", event.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <PasswordStrengthMeter password={form.admin.password} />
              </div>
              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={form.admin.confirmPassword}
                onChange={(event) => updateSection("admin", "confirmPassword", event.target.value)}
                required
                placeholder="Confirm your password"
                inputProps={{
                  onPaste: (event) => event.preventDefault(),
                  onCopy: (event) => event.preventDefault(),
                  onCut: (event) => event.preventDefault(),
                }}
              />
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid gap-5">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Select your growth plan</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Choose the onboarding cycle that best matches your rollout speed.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {planCards.map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() => setForm((previous) => ({ ...previous, plan: plan.value }))}
                  className={`rounded-[30px] border p-6 text-left transition ${
                    form.plan === plan.value
                      ? "border-blue-300/60 bg-blue-500/8 shadow-[0_20px_50px_rgba(59,130,246,0.16)]"
                      : "border-white/12 bg-white/55 hover:border-blue-200/40"
                  }`}
                >
                  <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {plan.chip}
                  </div>
                  <div className="mt-5 text-3xl font-semibold text-slate-900">{plan.title}</div>
                  <div className="mt-2 text-4xl font-black tracking-tight text-slate-900">{plan.price}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{plan.note}</p>
                  <div className="mt-5 grid gap-2 text-sm text-slate-700">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-5">
              <div>
                <h3 className="text-3xl font-semibold tracking-tight">Secure and complete your registration</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Review the organization, admin, and plan details below. We’ll create the account, issue a JWT, and take you straight into the dashboard.
                </p>
              </div>
              {[
                {
                  icon: <LockKeyhole size={20} />,
                  title: "Enterprise-grade security",
                  text: "Credentials are encrypted and the session token is saved after registration.",
                },
                {
                  icon: <Sparkles size={20} />,
                  title: "Instant activation",
                  text: "You’ll land directly on `/admin/dashboard` after success.",
                },
                {
                  icon: <Store size={20} />,
                  title: "Store-ready workspace",
                  text: "Your organization, admin profile, and plan assignment are created together.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-[24px] border border-white/12 bg-white/55 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-600">{item.icon}</div>
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-500">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[32px] border border-white/12 bg-white/70 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Your plan summary</div>
              <div className="mt-5 grid gap-5">
                <div className="rounded-[24px] border border-slate-100 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-2xl font-semibold text-slate-900">{selectedPlan.title}</div>
                      <div className="mt-2 text-sm text-slate-500">{selectedPlan.chip}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black tracking-tight text-slate-900">{selectedPlan.price}</div>
                      <div className="mt-1 text-sm text-slate-500">per cycle</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/80 p-5 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-900">Store:</span> {form.organization.organizationName}</div>
                  <div><span className="font-semibold text-slate-900">Store type:</span> {form.organization.storeType}</div>
                  <div><span className="font-semibold text-slate-900">Business email:</span> {form.organization.businessEmail}</div>
                  <div><span className="font-semibold text-slate-900">Location:</span> {form.organization.city}, {form.organization.state}, {form.organization.country}</div>
                  <div><span className="font-semibold text-slate-900">Phone:</span> {form.organization.phone}</div>
                  <div><span className="font-semibold text-slate-900">Admin:</span> {form.admin.fullName}</div>
                  <div><span className="font-semibold text-slate-900">Admin email:</span> {form.admin.email}</div>
                  <div><span className="font-semibold text-slate-900">Mobile:</span> {form.admin.mobile}</div>
                  <div><span className="font-semibold text-slate-900">Gender:</span> {form.admin.gender}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 1 || loading}
            className="rounded-2xl border border-white/12 bg-white/55 px-5 py-3 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {currentStep < 4 ? (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={goNext}
                disabled={loading || !isCurrentStepValid}
                className="theme-primary-button rounded-2xl px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                type="button"
                onClick={handleConfirm}
                className="theme-primary-button rounded-2xl px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Completing..." : "Confirm & Pay"}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
