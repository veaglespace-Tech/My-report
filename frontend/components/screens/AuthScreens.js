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
import { createSignupPayUOrder, login, register } from "@/services/authService";
import { fallbackPublicPlans, getPublicPlanItems, publicPlanService } from "@/services/publicPlanService";
import { clearAuth, setCredentials } from "@/redux/slices/authSlice";
import { setThemeMode } from "@/redux/slices/uiSlice";
import { PENDING_PAYU_SIGNUP_KEY, submitPayUCheckout } from "@/lib/payuCheckout";

const ADMIN_SIGNUP_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const STRONG_PASSWORD_MESSAGE = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
const EMAIL_LOCAL_PART_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const EMAIL_DOMAIN_LABEL_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const FULL_ADDRESS_REGEX = /^(?=.*[A-Za-z])(?=.*\s).{10,}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*[A-Za-z]$/;
const STORE_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9 &'().-]*[A-Za-z0-9]$/;
const PLACE_REGEX = /^[A-Za-z][A-Za-z .'-]*[A-Za-z]$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const STORE_ID_REGEX = /^MR-[A-Z0-9]{8}$/i;
const STORE_TYPE_OPTIONS = [
  "Shoe Shop",
  "Clothes Shop",
  "Grocery Shop",
  "Electronics Shop",
  "Beauty Shop",
  "Accessories Shop",
  "Medical Shop",
  "General Shop",
];

function isDummyText(value) {
  const compact = String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return compact.length > 0 && new Set(compact).size === 1;
}

function hasEnoughVowels(value) {
  const letters = String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (letters.length < 5) return /[aeiou]/.test(letters);
  const vowelCount = (letters.match(/[aeiou]/g) || []).length;
  return vowelCount >= 2;
}

function hasOnlyRepeatedDigits(value) {
  const phone = String(value ?? "").trim();
  return /^(\d)\1{9}$/.test(phone);
}

function getEmailValidationError(value, label = "Email") {
  const email = String(value ?? "").trim();

  if (!email) {
    return `${label} is required.`;
  }

  if (email.length > 254 || /\s/.test(email)) {
    return "Enter a valid email address.";
  }

  const parts = email.split("@");
  if (parts.length !== 2) {
    return "Enter a valid email address.";
  }

  const [localPart, domain] = parts;
  if (!localPart || !domain) {
    return "Enter a valid email address.";
  }

  if (
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !EMAIL_LOCAL_PART_REGEX.test(localPart)
  ) {
    return "Enter a valid email address.";
  }

  if (domain.length > 253 || domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) {
    return "Enter a valid email address.";
  }

  const domainLabels = domain.split(".");
  const topLevelDomain = domainLabels[domainLabels.length - 1] || "";
  const normalizedDomain = domain.toLowerCase();

  if (normalizedDomain.startsWith("gmail.") && normalizedDomain !== "gmail.com") {
    return "Gmail address must end with @gmail.com.";
  }

  if (domainLabels.length < 2 || !/^[A-Za-z]{2,}$/.test(topLevelDomain)) {
    return "Enter a valid email address.";
  }

  if (!domainLabels.every((labelPart) => EMAIL_DOMAIN_LABEL_REGEX.test(labelPart))) {
    return "Enter a valid email address.";
  }

  if (topLevelDomain.toLowerCase() !== "com") {
    return `${label} must be a .com email address.`;
  }

  if (normalizedDomain.includes("gmail") && normalizedDomain !== "gmail.com") {
    return "Gmail address must end with @gmail.com.";
  }

  return null;
}

function isValidFullAddress(value) {
  const address = String(value || "").trim();
  return FULL_ADDRESS_REGEX.test(address) && !isDummyText(address) && hasEnoughVowels(address);
}

function isValidEmailAddress(value) {
  return !getEmailValidationError(value);
}

function getFullNameValidationError(value, label = "Full name") {
  const fullName = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!fullName) return `${label} is required.`;
  if (fullName.length < 3) return `${label} must be at least 3 characters.`;
  if (fullName.length > 60) return `${label} must be at most 60 characters.`;
  if (fullName.split(" ").filter(Boolean).length < 2) return "Please enter first and last name.";
  if (!NAME_REGEX.test(fullName) || isDummyText(fullName) || !hasEnoughVowels(fullName)) {
    return `Please enter a valid ${label.toLowerCase()}.`;
  }
  return null;
}

function getStoreNameValidationError(value) {
  const storeName = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!storeName) return "Store name is required.";
  if (storeName.length < 3) return "Store name must be at least 3 characters.";
  if (storeName.length > 80) return "Store name must be at most 80 characters.";
  if (!STORE_NAME_REGEX.test(storeName) || isDummyText(storeName) || !hasEnoughVowels(storeName)) {
    return "Please enter a valid store name.";
  }
  return null;
}

function getPlaceValidationError(value, label) {
  const place = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!place) return `${label} is required.`;
  if (place.length < 3) return `${label} must be at least 3 characters.`;
  if (place.length > 60) return `${label} must be at most 60 characters.`;
  if (!PLACE_REGEX.test(place) || isDummyText(place) || !hasEnoughVowels(place)) {
    return `Please enter a valid ${label.toLowerCase()}.`;
  }
  return null;
}

function getPhoneValidationError(value, label = "Phone number") {
  const phone = String(value ?? "").trim();
  if (!phone) return `${label} is required.`;
  if (!PHONE_REGEX.test(phone)) return `${label} must be exactly 10 digits.`;
  if (phone === "0000000000" || hasOnlyRepeatedDigits(phone)) return `Please enter a valid ${label.toLowerCase()}.`;
  return null;
}

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
        "relative flex w-full justify-center overflow-hidden",
        isMarketingAuth ? "min-h-0 items-start bg-transparent" : "min-h-[calc(100vh-5rem)] items-center bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100",
      ].join(" ")}
    >
      <AuthBackdrop />
      <div
        className={[
          hidePromo
            ? ["relative z-10 mx-auto w-full max-w-2xl", containerClassName].filter(Boolean).join(" ")
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
      {helper ? <span className={`text-xs ${status === "error" ? "text-red-500" : "text-[var(--muted)]"}`}>{helper}</span> : null}
    </label>
  );
}

export function LoginScreen({ role }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loginMode, setLoginMode] = useState("email");
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
            title: "Login for SuperAdmin",
            description: "Login for SuperAdmin",
          }
        : {
            headline: "Admin access",
            title: "Run your store with billing, inventory, and insights in sync.",
            description: "Login to manage customers, products, sales, and plan usage.",
          },
    [role]
  );

  const isStoreIdLogin = role === "ADMIN" && loginMode === "storeId";

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTouched(true);
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLoginModeChange = (nextMode) => {
    setLoginMode(nextMode);
    setTouched(false);
    setForm((previous) => ({
      ...previous,
      email: "",
    }));
  };

  const errors = useMemo(() => {
    const nextErrors = {};
    const identifier = form.email.trim();
    const emailError = isStoreIdLogin ? null : getEmailValidationError(identifier, role === "ADMIN" ? "Admin email" : "Email");

    if (isStoreIdLogin && !identifier) {
      nextErrors.email = "Store ID is required.";
    } else if (isStoreIdLogin && !STORE_ID_REGEX.test(identifier)) {
      nextErrors.email = "Enter a valid Store ID like MR-ABCD2345.";
    } else if (emailError) {
      nextErrors.email = emailError;
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (!ADMIN_SIGNUP_PASSWORD_REGEX.test(form.password)) {
      nextErrors.password = STRONG_PASSWORD_MESSAGE;
    }

    return nextErrors;
  }, [form.email, form.password, isStoreIdLogin, role]);

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
        const loginIdentifier = isStoreIdLogin ? form.email.trim().toUpperCase() : form.email.trim().toLowerCase();
        const payload = await login({
          email: loginIdentifier,
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
      title={role === "SUPER_ADMIN" ? "SuperAdmin Login" : "Admin Login"}
      description={role === "ADMIN" ? "Login to manage your store" : "Login for SuperAdmin"}
      hidePromo
      containerClassName="max-w-md"
      footer={
        <div className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/" className="transition hover:text-slate-900 dark:hover:text-white">
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
        {role === "ADMIN" ? (
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/5">
            {[
              { key: "email", label: "Email ID", icon: Mail },
              { key: "storeId", label: "Store ID", icon: Store },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleLoginModeChange(key)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
                  loginMode === key
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        ) : null}
        <AuthFormField
          label={isStoreIdLogin ? "Store ID" : "Email"}
          name="email"
          type={isStoreIdLogin ? "text" : "email"}
          value={form.email}
          onChange={handleChange}
          required
          placeholder={isStoreIdLogin ? "Enter your Store ID" : "Enter your email"}
          autoComplete="off"
          helper={touched && errors.email ? errors.email : isStoreIdLogin ? "Use the Store ID from your registration email." : undefined}
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
            <Link href="/forgot-password" className="cursor-pointer text-[var(--primary)] transition hover:underline hover:opacity-80">
              Forgot Password
            </Link>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading || !isValid}
          type="submit"
          className={`theme-primary-button rounded-2xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed ${
            role === "SUPER_ADMIN" ? "disabled:opacity-100 disabled:brightness-95" : "disabled:opacity-60"
          }`}
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
  const [touchedFields, setTouchedFields] = useState({});
  const [availablePlans, setAvailablePlans] = useState(fallbackPublicPlans);

  // Allow selecting a plan from `/pricing` and jumping directly to plan selection.
  // Supported input:
  // - Query string: `/register/store-details?planId=123`
  const preselectPlan = searchParams?.get("planId") || "";

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
      gender: "",
    },
    planId: preselectPlan,
  }));
  const normalizedPlans = useMemo(
    () =>
      availablePlans.map((plan) => {
        const monthly = Number(plan.monthlyPrice ?? plan.price ?? 0);
        const duration = String(plan.duration || "").trim();
        const isFreeTrial = String(plan.name || "").toUpperCase() === "FREE TRIAL" || (plan.trialAvailable && monthly === 0);
        return {
          id: String(plan.id),
          title: plan.planName || plan.name || "Plan",
          chip: duration || (isFreeTrial ? "7 Days" : "1 Month"),
          price: isFreeTrial ? "Rs. 0" : `Rs. ${monthly.toLocaleString("en-IN")}`,
          amount: isFreeTrial ? 0 : monthly,
          note: plan.description || "Flexible subscription for your store.",
          features: String(plan.features || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        };
      }),
    [availablePlans]
  );

  const selectedPlanId = form.planId || (preselectPlan ? String(preselectPlan) : "") || normalizedPlans[0]?.id || "";
  const selectedPlan = normalizedPlans.find((item) => item.id === String(selectedPlanId)) || normalizedPlans[0] || null;

  useEffect(() => {
    let active = true;
    async function loadPlans() {
      try {
        const response = await publicPlanService.getPlans();
        const items = getPublicPlanItems(response);
        if (active && Array.isArray(items)) {
          const nextPlans = items.length ? items : fallbackPublicPlans;
          setAvailablePlans(nextPlans);
          setForm((previous) =>
            previous.planId || !nextPlans.length
              ? previous
              : {
                  ...previous,
                  planId: String(nextPlans[0].id),
                }
          );
        }
      } catch {
        if (active) setAvailablePlans(fallbackPublicPlans);
      }
    }
    loadPlans();
    return () => {
      active = false;
    };
  }, []);

  const isStep1Complete = useMemo(() => {
    return (
      !getStoreNameValidationError(form.organization.organizationName) &&
      Boolean(form.organization.storeType.trim()) &&
      !getEmailValidationError(form.organization.businessEmail, "Business email") &&
      !getPlaceValidationError(form.organization.city, "City") &&
      !getPlaceValidationError(form.organization.state, "State") &&
      !getPlaceValidationError(form.organization.country, "Country") &&
      !getPhoneValidationError(form.organization.phone, "Phone number") &&
      isValidFullAddress(form.organization.address)
    );
  }, [form.organization]);

  const isStep2Complete = useMemo(() => {
    return (
      !getFullNameValidationError(form.admin.fullName, "Full name") &&
      !getEmailValidationError(form.admin.email, "Admin email") &&
      Boolean(form.admin.gender.trim()) &&
      ADMIN_SIGNUP_PASSWORD_REGEX.test(form.admin.password) &&
      form.admin.password === form.admin.confirmPassword &&
      !getPhoneValidationError(form.admin.mobile, "Mobile")
    );
  }, [form.admin]);

  const isPlanSelected = Boolean(selectedPlanId);

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

    if (currentStep === 1) {
      const address = form.organization.address.trim();
      const storeNameError = getStoreNameValidationError(form.organization.organizationName);
      const cityError = getPlaceValidationError(form.organization.city, "City");
      const stateError = getPlaceValidationError(form.organization.state, "State");
      const countryError = getPlaceValidationError(form.organization.country, "Country");
      const phoneError = getPhoneValidationError(form.organization.phone, "Phone number");

      if (storeNameError) {
        errors.organizationName = storeNameError;
      }
      if (!form.organization.storeType.trim()) {
        errors.storeType = "Store type is required.";
      }
      const businessEmailError = getEmailValidationError(form.organization.businessEmail, "Business email");
      if (businessEmailError) {
        errors.businessEmail = businessEmailError === "Enter a valid email address."
          ? "Please enter a valid email address."
          : businessEmailError;
      }
      if (cityError) {
        errors.city = cityError;
      }
      if (stateError) {
        errors.state = stateError;
      }
      if (countryError) {
        errors.country = countryError;
      }
      if (phoneError) {
        errors.phone = phoneError;
      }
      if (!isValidFullAddress(address)) {
        errors.address = "Please enter a full address with area and landmark.";
      }
    }

    if (currentStep === 2) {
      const email = form.admin.email.trim();
      const password = form.admin.password;
      const confirmPassword = form.admin.confirmPassword;
      const gender = form.admin.gender.trim();
      const fullNameError = getFullNameValidationError(form.admin.fullName, "Full name");
      const mobileError = getPhoneValidationError(form.admin.mobile, "Mobile");

      if (fullNameError) {
        errors.fullName = fullNameError;
      }
      const adminEmailError = getEmailValidationError(email, "Admin email");
      if (adminEmailError) {
        errors.adminEmail = adminEmailError === "Enter a valid email address."
          ? "Please enter a valid email address."
          : adminEmailError;
      }
      if (!gender) {
        errors.gender = "Please select gender.";
      }
      if (mobileError) {
        errors.adminMobile = mobileError;
      }
      if (!password) {
        errors.password = "Password is required.";
      } else if (!ADMIN_SIGNUP_PASSWORD_REGEX.test(password)) {
        errors.password = "Password must contain uppercase, lowercase, number, and special character.";
      }
      if (!confirmPassword) {
        errors.confirmPassword = "Confirm password is required.";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    return errors;
  }, [currentStep, form]);

  const isCurrentStepValid = Object.keys(getStepErrors).length === 0;

  const updateSection = (section, field, value) => {
    setTouchedFields((previous) => ({
      ...previous,
      [`${section}.${field}`]: true,
    }));
    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const visibleError = (section, field, error) => (attemptedNext || touchedFields[`${section}.${field}`] ? error : null);

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
        ["city", "City"],
        ["state", "State"],
        ["country", "Country"],
        ["phone", "Phone number"],
        ["address", "Address"],
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

      const fullNameError = getFullNameValidationError(form.admin.fullName, "Full name");
      if (fullNameError) {
        toast.error(fullNameError);
        return false;
      }

      const adminEmailError = getEmailValidationError(form.admin.email.trim(), "Admin email");
      if (adminEmailError) {
        toast.error(adminEmailError);
        return false;
      }

      if (!form.admin.gender.trim()) {
        toast.error("Please select gender.");
        return false;
      }

      const mobileError = getPhoneValidationError(form.admin.mobile.trim(), "Mobile");
      if (mobileError) {
        toast.error(mobileError);
        return false;
      }

      if (!ADMIN_SIGNUP_PASSWORD_REGEX.test(form.admin.password)) {
        toast.error("Password must contain uppercase, lowercase, number, and special character.");
        return false;
      }

      if (form.admin.password !== form.admin.confirmPassword) {
        toast.error("Passwords do not match.");
        return false;
      }
    }

    if (currentStep === 3 && !selectedPlanId) {
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

        if (!selectedPlan) {
          throw new Error("Please select a plan");
        }

        const amount = Number(selectedPlan.amount ?? 0);
        if (Number.isNaN(amount) || amount < 0) {
          throw new Error("Invalid plan amount");
        }

        if (!amount) {
          await register({
            ...form,
            planId: Number(selectedPlanId),
          });
          clearSession();
          dispatch(clearAuth());
          persistThemeMode("light");
          dispatch(setThemeMode("light"));
          toast.success("Registration completed successfully");
          router.push("/admin/login");
          return;
        }

        const order = await createSignupPayUOrder({
          email: form.admin.email,
          firstname: form.admin.fullName,
          phone: form.admin.mobile,
          planName: selectedPlan.title,
          amount,
        });

        if (!order?.configured || !order?.paymentUrl || !order?.formFields) {
          throw new Error("PayU is not configured on server");
        }

        localStorage.setItem(
          PENDING_PAYU_SIGNUP_KEY,
          JSON.stringify({
            txnid: order.txnid || order.orderId,
            planId: Number(selectedPlanId),
            form,
          })
        );
        toast.message("Redirecting to PayU checkout...");
        submitPayUCheckout(order);
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
          "theme-input flex items-center gap-3 rounded-[28px] px-4 py-3 transition-all duration-300",
          error ? "border border-red-400 ring-1 ring-red-500/60" : "border border-transparent",
          !error && attemptedNext && String(input?.props?.value ?? "").trim() ? "border border-emerald-400/80 ring-1 ring-emerald-300/40" : "",
        ].join(" ")}
      >
        <span className="text-[var(--muted)]">{icon}</span>
        {input}
      </div>
      {error ? <div className="text-sm text-red-500/90">{error}</div> : null}
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
              <p className="mt-2 text-xs font-medium text-[var(--muted)]">
                Use a valid business email like <span className="font-semibold text-[var(--foreground)]">store@myreport.com</span> and a 10-digit phone number.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField(
                "Store Name",
                <Building2 size={18} />,
                <input
                  value={form.organization.organizationName}
                  onChange={(event) => updateSection("organization", "organizationName", event.target.value.slice(0, 80))}
                  placeholder="GlowMart"
                  maxLength={80}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("organization", "organizationName", getStepErrors.organizationName)
              )}
              {renderField(
                "Store Type",
                <Store size={18} />,
                <>
                  <input
                    list="admin-signup-store-types"
                    value={form.organization.storeType}
                    onChange={(event) => updateSection("organization", "storeType", event.target.value.slice(0, 60))}
                    placeholder="Select or type shop type"
                    maxLength={60}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <datalist id="admin-signup-store-types">
                    {STORE_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </>,
                visibleError("organization", "storeType", getStepErrors.storeType)
              )}
              {renderField(
                "Business Email",
                <Mail size={18} />,
                <input
                  type="email"
                  value={form.organization.businessEmail}
                  onChange={(event) => updateSection("organization", "businessEmail", event.target.value.slice(0, 160))}
                  placeholder="store@company.com"
                  maxLength={160}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("organization", "businessEmail", getStepErrors.businessEmail)
              )}
              {renderField(
                "City",
                <MapPin size={18} />,
                <input
                  value={form.organization.city}
                  onChange={(event) => updateSection("organization", "city", event.target.value.slice(0, 60))}
                  placeholder="City"
                  maxLength={60}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("organization", "city", getStepErrors.city)
              )}
              {renderField(
                "State",
                <Globe size={18} />,
                <input
                  value={form.organization.state}
                  onChange={(event) => updateSection("organization", "state", event.target.value.slice(0, 60))}
                  placeholder="State"
                  maxLength={60}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("organization", "state", getStepErrors.state)
              )}
              {renderField(
                "Country",
                <Globe size={18} />,
                <input
                  value={form.organization.country}
                  onChange={(event) => updateSection("organization", "country", event.target.value.slice(0, 60))}
                  placeholder="Country"
                  maxLength={60}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("organization", "country", getStepErrors.country)
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
                  maxLength={10}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("organization", "phone", getStepErrors.phone)
              )}
            </div>
            {renderField(
              "Address",
              <MapPin size={18} />,
              <input
                value={form.organization.address}
                onChange={(event) => updateSection("organization", "address", event.target.value.slice(0, 180))}
                placeholder="Street, area, landmark"
                maxLength={180}
                className="w-full bg-transparent text-sm outline-none"
              />,
              visibleError("organization", "address", getStepErrors.address)
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
                  onChange={(event) => updateSection("admin", "fullName", event.target.value.slice(0, 60))}
                  placeholder="Full name"
                  maxLength={60}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("admin", "fullName", getStepErrors.fullName)
              )}
              {renderField(
                "Admin Email",
                <Mail size={18} />,
                <input
                  type="email"
                  value={form.admin.email}
                  onChange={(event) => updateSection("admin", "email", event.target.value.slice(0, 160))}
                  placeholder="name@company.com"
                  autoComplete="off"
                  maxLength={160}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("admin", "email", getStepErrors.adminEmail)
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
                  maxLength={10}
                  className="w-full bg-transparent text-sm outline-none"
                />,
                visibleError("admin", "mobile", getStepErrors.adminMobile)
              )}
              {renderField(
                "Gender",
                <UserRound size={18} />,
                <select
                  value={form.admin.gender}
                  onChange={(event) => updateSection("admin", "gender", event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>,
                visibleError("admin", "gender", getStepErrors.gender)
              )}
            </div>
            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
              <div className="grid content-start gap-3">
                <PasswordField
                  label="Password"
                  name="password"
                  value={form.admin.password}
                  onChange={(event) => updateSection("admin", "password", event.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  status={getStepErrors.password ? "error" : form.admin.password ? "success" : "idle"}
                />
                <PasswordStrengthMeter password={form.admin.password} />
                {getStepErrors.password && form.admin.password ? (
                  <div className="text-sm text-red-500/90">{getStepErrors.password}</div>
                ) : null}
              </div>
              <div className="grid content-start gap-3">
                <PasswordField
                  label="Confirm Password"
                  name="confirmPassword"
                  value={form.admin.confirmPassword}
                  onChange={(event) => updateSection("admin", "confirmPassword", event.target.value)}
                  required
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  status={getStepErrors.confirmPassword ? "error" : form.admin.confirmPassword ? "success" : "idle"}
                  inputProps={{
                    onPaste: (event) => event.preventDefault(),
                    onCopy: (event) => event.preventDefault(),
                    onCut: (event) => event.preventDefault(),
                  }}
                />
                {getStepErrors.confirmPassword && form.admin.confirmPassword ? (
                  <div className="text-sm text-red-500/90">{getStepErrors.confirmPassword}</div>
                ) : null}
              </div>
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
              {normalizedPlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    setForm((previous) => ({
                      ...previous,
                      planId: String(plan.id),
                    }));
                  }}
                  className={`group rounded-[30px] border p-6 text-left transition-all duration-300 ${
                    String(selectedPlanId) === String(plan.id)
                      ? "border-cyan-300/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(232,244,255,0.92))] shadow-[0_20px_50px_rgba(59,130,246,0.16),0_0_0_1px_rgba(34,211,238,0.16),0_0_24px_rgba(139,92,246,0.16)]"
                      : "border-white/12 bg-white/55 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-cyan-200/50 hover:shadow-[0_16px_36px_rgba(59,130,246,0.1)]"
                  }`}
                >
                  <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {plan.chip}
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <div className="min-w-0 text-2xl font-semibold text-slate-900 sm:text-3xl">{plan.title}</div>
                    <div className="shrink-0 rounded-full bg-white/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Plan
                    </div>
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-4">
                    <div className="whitespace-nowrap text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                      {plan.price}
                    </div>
                    <div className="pt-2 whitespace-nowrap text-sm text-slate-500">per cycle</div>
                  </div>
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
                  Review the organization, admin, and plan details below. We will create the account and then send you to admin login.
                </p>
              </div>
              {[
                {
                  icon: <LockKeyhole size={20} />,
                  title: "Enterprise-grade security",
                  text: "Credentials are encrypted, and login starts after registration is complete.",
                },
                {
                  icon: <Sparkles size={20} />,
                  title: "Instant activation",
                  text: "You will land on the admin login page after success.",
                },
                {
                  icon: <Store size={20} />,
                  title: "Store-ready workspace",
                  text: "Your organization, admin profile, and plan assignment are created together.",
                },
              ].map((item) => (
                <div key={item.title} className="group flex gap-4 rounded-[24px] border border-white/12 bg-white/55 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-cyan-200/60 hover:bg-white/70 hover:shadow-[0_10px_25px_rgba(99,102,241,0.18),0_0_0_1px_rgba(34,211,238,0.16)]">
                  <div className="flex h-12 w-12 items-center justify-center text-blue-600 transition-colors duration-300 group-hover:text-cyan-600">
                    <span className="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-3">{item.icon}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-500">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="plan-summary-card flex min-w-0 flex-col justify-between overflow-hidden rounded-[32px] border border-white/12 bg-white/70 p-6 pb-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Your plan summary</div>
                <div className="mt-5 overflow-hidden rounded-[24px] border border-cyan-200/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,245,255,0.94))] shadow-[0_14px_34px_rgba(34,211,238,0.12),0_0_0_1px_rgba(139,92,246,0.08)]">
                  <div className="p-5">
                    <div className="flex min-w-0 flex-col gap-3 text-center">
                      <div className="min-w-0">
                        <div className="min-w-0 truncate text-[34px] font-bold leading-tight text-slate-900">{selectedPlan?.title || "Loading..."}</div>
                      </div>
                      <div className="flex min-w-0 items-baseline justify-center gap-2 whitespace-nowrap">
                        <span className="text-[clamp(1.9rem,6.4vw,2.45rem)] font-extrabold leading-none tracking-tight text-slate-900">
                          {selectedPlan?.price || "-"}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">per cycle</span>
                      </div>
                      <div className="text-center text-xl font-medium text-slate-500/80">
                        {selectedPlan?.chip || "..."}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent" />

                  <div className="grid min-w-0 gap-3 bg-slate-50/70 p-5 text-sm text-slate-600">
                    {[
                      ["Store", form.organization.organizationName],
                      ["Store type", form.organization.storeType],
                      ["Business email", form.organization.businessEmail],
                      ["Location", `${form.organization.city}, ${form.organization.state}, ${form.organization.country}`],
                      ["Phone", form.organization.phone],
                      ["Admin", form.admin.fullName],
                      ["Admin email", form.admin.email],
                      ["Mobile", form.admin.mobile],
                      ["Gender", form.admin.gender],
                    ].map(([label, value]) => (
                      <div key={label} className="grid min-w-0 items-start gap-1 sm:grid-cols-[124px_minmax(0,1fr)]">
                        <span className="font-semibold text-slate-900">{label}:</span>
                        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title={String(value || "")}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                type="button"
                onClick={handleConfirm}
                className="mt-6 h-14 w-full rounded-[18px] bg-gradient-to-r from-cyan-400 to-purple-400 px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(99,102,241,0.18)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(99,102,241,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Completing..." : "Confirm & Pay"}
              </motion.button>
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
                disabled={loading}
                className="theme-primary-button rounded-2xl px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </motion.button>
            ) : null}
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
