"use client";

import Image from "next/image";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Ban, CheckCircle2, Pencil, Plus, Printer, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { DataTable } from "@/components/common/DataTable";
import { DownloadToolbar } from "@/components/common/DownloadToolbar";
import { GlassPanel } from "@/components/common/GlassPanel";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { MetricCard } from "@/components/common/MetricCard";
import { Modal } from "@/components/common/Modal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { exportTableExcel, exportTablePdf } from "@/lib/exportReports";
import { persistSession, updateStoredProfile } from "@/lib/session";
import { setCredentials, updateProfile as syncProfile } from "@/redux/slices/authSlice";
import { superAdminService } from "@/services/superAdminService";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const SUPERADMIN_PAGE_SIZE = 5;
const DOT_COM_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.com$/;
const TEN_DIGIT_PHONE_REGEX = /^[0-9]{10}$/;
const FULL_ADDRESS_REGEX = /^(?=.*[A-Za-z])(?=.*\s).{10,}$/;
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

function getContactValidationError({ email, phone, address }) {
  if (email !== undefined && !DOT_COM_EMAIL_REGEX.test(String(email || "").trim())) {
    return "Please enter a valid .com email address.";
  }
  if (phone !== undefined && !TEN_DIGIT_PHONE_REGEX.test(String(phone || "").trim())) {
    return "Please enter a valid 10-digit phone number.";
  }
  if (address !== undefined && !FULL_ADDRESS_REGEX.test(String(address || "").trim())) {
    return "Please enter a full address with at least 10 characters.";
  }
  return null;
}

function getAdminFormValidationErrors(form, editingItem) {
  const errors = [];
  const fullName = String(form.fullName || "").trim();
  const email = String(form.email || "").trim();
  const mobileNumber = String(form.mobileNumber || "").trim();
  const password = String(form.password || "");
  const storeName = String(form.storeName || "").trim();
  const city = String(form.city || "").trim();
  const address = String(form.address || "").trim();

  if (fullName.length < 2) {
    errors.push("Full name must contain at least 2 characters.");
  }
  if (!DOT_COM_EMAIL_REGEX.test(email)) {
    errors.push("Email must be a valid .com address.");
  }
  if (!TEN_DIGIT_PHONE_REGEX.test(mobileNumber)) {
    errors.push("Mobile number must be exactly 10 digits.");
  }
  if (!editingItem && !password.trim()) {
    errors.push("Password is required for a new admin.");
  }
  if (password.trim() && !STRONG_PASSWORD_REGEX.test(password)) {
    errors.push("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
  }
  if (storeName.length < 2) {
    errors.push("Store name must contain at least 2 characters.");
  }
  if (city.length < 2 || !/[A-Za-z]/.test(city)) {
    errors.push("City must contain at least 2 letters.");
  }
  if (!FULL_ADDRESS_REGEX.test(address)) {
    errors.push("Address must be a full address with at least 10 characters and a space.");
  }
  if (!form.planId) {
    errors.push("Please select a plan.");
  }

  return errors;
}

function useAsyncLoader(loader, initialState) {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      try {
        const response = await loader();
        if (active) {
          setData(response);
        }
      } catch (error) {
        if (active) {
          toast.error(error?.message || "Failed to load data from server.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [loader]);

  return { data, setData, loading };
}

function ControlButton({ children, variant = "default", className = "", ...props }) {
  const base =
    variant === "primary"
      ? "theme-primary-button"
      : "theme-action-button";

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = "text", required = false, disabled = false, className = "", inputClassName = "" }) {
  return (
    <label className={`grid gap-2 text-sm ${className}`}>
      <span className="font-medium text-[var(--muted-strong)]">{label}</span>
      <input
        required={required}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`theme-input w-full rounded-2xl px-4 py-3 outline-none transition ${disabled ? "cursor-not-allowed opacity-70" : ""} ${inputClassName}`}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--muted-strong)]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="theme-input w-full rounded-2xl px-4 py-3 outline-none transition"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <GlassPanel className="max-w-full overflow-hidden p-5 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
      {children}
    </GlassPanel>
  );
}

function PaginationFooter({ currentPage, totalPages, visibleCount, totalCount, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col items-center justify-center gap-4 border-t border-slate-200/80 px-4 py-6 sm:flex-row sm:justify-between">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
        Showing <span className="text-[var(--muted-strong)]">{visibleCount}</span> of{" "}
        <span className="text-[var(--muted-strong)]">{totalCount}</span> items
      </div>

      <div className="flex max-w-full items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Prev
        </button>

        <div className="flex items-center gap-1.5 px-2">
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                currentPage === pageNumber
                  ? "scale-105 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
        </button>
      </div>

      <div className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] sm:block">
        Page {currentPage} / {totalPages}
      </div>
    </div>
  );
}

function ActivityList({ title, items, render, pageSize = null }) {
  const [page, setPage] = useState(1);
  const shouldPaginate = Number(pageSize) > 0 && (items?.length || 0) > Number(pageSize);
  const totalPages = shouldPaginate ? Math.ceil((items?.length || 0) / Number(pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);
  const visibleItems = shouldPaginate
    ? items.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize))
    : items;

  return (
    <GlassPanel className="max-w-full overflow-hidden p-5 sm:p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className={`mt-5 grid gap-3 ${shouldPaginate ? "max-h-[430px] overflow-y-scroll pr-1 scrollbar-thin" : ""}`}>
        {visibleItems?.length ? (
          visibleItems.map((item, index) => (
            <div key={`${item.title || item.storeName}-${index}`} className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
              {render(item)}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 text-sm text-[var(--muted)]">Nothing to show yet.</div>
        )}
      </div>
      <PaginationFooter
        currentPage={currentPage}
        totalPages={totalPages}
        visibleCount={visibleItems?.length || 0}
        totalCount={items?.length || 0}
        onPageChange={setPage}
      />
    </GlassPanel>
  );
}

export function SuperAdminDashboardScreen() {
  const dashboardLoader = useMemo(() => superAdminService.getDashboard, []);
  const { data, loading } = useAsyncLoader(dashboardLoader, {
    metrics: [],
    revenueSeries: [],
    growthSeries: [],
    recentActivities: [],
    expiringPlans: [],
    notifications: [],
  });

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  const extendedMetrics = [
    ...data.metrics,
    { label: "Total Invoices", value: "2.4k", helper: "Platform wide", accent: "violet" },
    { label: "Total Enquiries", value: "148", helper: "Support queue", accent: "amber" },
  ];

  return (
    <div className="grid max-w-full gap-8">
      <SectionHeading
        eyebrow="Platform Executive"
        title="Command Central"
        description="Monitor platform health, track store growth, and manage renewal risks in real-time."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {extendedMetrics.map((item, index) => (
          <MetricCard key={item.label} item={item} index={index} />
        ))}
      </div>

      <div className="grid max-w-full gap-6 lg:grid-cols-[1fr_0.4fr]">
        <div className="grid gap-6">
          <ChartCard title="Revenue Performance" description="Monthly platform revenue trajectory across all active subscriptions.">
            <div className="h-72 w-full max-w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueSeries}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#4fd1c5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4fd1c5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(26,16,53,0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
                  <Tooltip
                    labelStyle={{ display: "none" }}
                    contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4fd1c5" strokeWidth={2.5} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <GlassPanel className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Expiry Plan Alerts</h3>
                  <p className="text-sm text-[var(--muted)]">Subscription risks requiring attention</p>
                </div>
                <div className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {data.expiringPlans?.length || 0} Alerts
                </div>
              </div>
              <div className="grid gap-3">
                {data.expiringPlans?.map((item, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm transition-all hover:bg-white/90">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                          <span className="truncate font-semibold">{item.storeName}</span>
                        </div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{item.owner} • {item.plan} Plan</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                          Expires {formatDate(item.planExpiresAt)}
                        </div>
                        <button className="mt-2 text-xs font-semibold text-cyan-400 hover:underline">Renew Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Growth Analytics</h3>
                <p className="text-sm text-[var(--muted)]">Admin and store onboarding velocity</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.growthSeries}>
                    <CartesianGrid stroke="rgba(26,16,53,0.08)" vertical={false} />
                    <XAxis dataKey="label" stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
                    <Tooltip
                      labelStyle={{ display: "none" }}
                      contentStyle={{
                        background: "rgba(8,14,28,0.96)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 18,
                        padding: "12px 14px",
                      }}
                    />
                    <Bar dataKey="admins" fill="#7c8cff" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="stores" fill="#4fd1c5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>
          </div>
        </div>

        <GlassPanel className="flex flex-col p-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold">Live Activity Feed</h3>
            <p className="text-sm text-[var(--muted)]">Real-time platform events</p>
          </div>
          
          <div className="relative flex flex-1 flex-col gap-8 pl-4">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-400/50 via-slate-300/60 to-transparent" />
            
            {data.recentActivities?.map((item, index) => (
              <div key={index} className="relative flex gap-4 transition-all duration-300 hover:translate-x-1">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 ring-4 ring-white/5">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="text-sm font-bold text-[var(--foreground)]">{item.title}</div>
                  <div className="mt-1 text-xs text-[var(--muted)] leading-relaxed">{item.subtitle}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-cyan-400/60">
                    {formatDate(item.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {data.notifications?.map((item, index) => (
              <div key={`notif-${index}`} className="relative flex gap-4 transition-all duration-300 hover:translate-x-1">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 ring-4 ring-white/5">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.6)]" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="text-sm font-bold text-[var(--foreground)]">{item.title}</div>
                  <div className="mt-1 text-xs text-[var(--muted)] leading-relaxed">{item.message}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-violet-400/60">
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

export function SuperAdminAdminsScreen() {
  const adminsLoader = useMemo(() => superAdminService.getAdmins, []);
  const plansLoader = useMemo(() => superAdminService.getPlans, []);
  const { data: adminsData, setData: setAdminsData, loading } = useAsyncLoader(adminsLoader, { items: [] });
  const { data: plansData } = useAsyncLoader(plansLoader, { items: [] });
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    storeName: "",
    city: "",
    address: "",
    planId: "",
  });

  const filteredAdmins = adminsData.items.filter((item) =>
    [item.fullName, item.email, item.storeName].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormErrors([]);
    setForm({
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      storeName: "",
      city: "",
      address: "",
      planId: String(plansData.items[0]?.id || ""),
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormErrors([]);
    const plan = plansData.items.find((entry) => entry.name === item.plan);
    setForm({
      fullName: item.fullName,
      email: item.email,
      mobileNumber: item.mobileNumber,
      password: "",
      storeName: item.storeName,
      city: item.city,
      address: item.address || item.city,
      planId: String(plan?.id || plansData.items[0]?.id || ""),
    });
    setModalOpen(true);
  };

  const handleFormChange = (event) => {
    const value = ["mobileNumber", "phone"].includes(event.target.name)
      ? event.target.value.replace(/\D/g, "").slice(0, 10)
      : event.target.value;
    setFormErrors([]);
    setForm((previous) => ({ ...previous, [event.target.name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = getAdminFormValidationErrors(form, editingItem);
    if (validationErrors.length) {
      setFormErrors(validationErrors);
      toast.error("Please fix all highlighted validation errors.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = editingItem
          ? await superAdminService.updateAdmin(editingItem.id, { ...form, planId: Number(form.planId) })
          : await superAdminService.createAdmin({ ...form, planId: Number(form.planId) });

        setAdminsData((previous) => {
          const items = editingItem
            ? previous.items.map((item) => (item.id === editingItem.id ? { ...item, ...payload, plan: payload.plan || item.plan } : item))
            : [{ ...payload, createdAt: new Date().toISOString() }, ...previous.items];
          return { ...previous, items };
        });

        toast.success(editingItem ? "Admin updated" : "Admin created");
        setModalOpen(false);
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || "Unable to save admin");
      }
    });
  };

  const updateRow = (adminId, updater) => {
    setAdminsData((previous) => ({
      ...previous,
      items: previous.items.map((item) => (item.id === adminId ? updater(item) : item)),
    }));
  };

  const handleApprove = async (adminId) => {
    await superAdminService.approveAdmin(adminId);
    updateRow(adminId, (item) => ({ ...item, status: "ACTIVE" }));
    toast.success("Signup request approved");
  };

  const handleToggleStatus = async (adminId) => {
    await superAdminService.toggleAdminStatus(adminId);
    updateRow(adminId, (item) => ({ ...item, status: item.status === "BLOCKED" ? "ACTIVE" : "BLOCKED" }));
    toast.success("Admin status updated");
  };

  const handleDelete = async (adminId) => {
    await superAdminService.deleteAdmin(adminId);
    setAdminsData((previous) => ({
      ...previous,
      items: previous.items.filter((item) => item.id !== adminId),
    }));
    toast.success("Admin removed");
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  const selectedPlan = plansData.items.find((plan) => String(plan.id) === String(form.planId));
  const selectedPlanPrice = Number(selectedPlan?.monthlyPrice || selectedPlan?.price || 0);
  const selectedPlanIsPaid = selectedPlanPrice > 0;

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="User management"
        title="Admins"
        description="Approve signup requests, onboard new admins, and keep account status under control."
        action={
          <ControlButton variant="primary" onClick={openCreate}>
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add Admin
            </span>
          </ControlButton>
        }
      />

      <GlassPanel className="p-5">
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-cyan-100/30 via-white/20 to-violet-100/25 px-4 py-3 shadow-[0_6px_20px_rgba(148,163,184,0.16)]">
          <Search size={16} className="shrink-0 text-teal-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search admins, stores, or emails..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </GlassPanel>

      <DataTable
        columns={[
          { key: "fullName", label: "Admin" },
          { key: "email", label: "Email" },
          { key: "storeCode", label: "Store ID" },
          { key: "storeName", label: "Store" },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
          { key: "planExpiresAt", label: "Plan Expiry", render: (value) => formatDate(value) },
          {
            key: "actions",
            label: "Actions",
            headerClassName: "min-w-[240px]",
            cellClassName: "min-w-[240px]",
            render: (_, row) => {
              const isPending = row.status === "PENDING_APPROVAL";

              return (
                <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(row.id)}
                      className="shrink-0 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-800"
                    >
                      Approve
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="shrink-0 rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                  >
                    <span className="inline-flex items-center gap-1"><Pencil size={12} /> Edit</span>
                  </button>
                  {!isPending ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(row.id)}
                      className="shrink-0 rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                    >
                      <span className="inline-flex items-center gap-1"><Ban size={12} /> {row.status === "BLOCKED" ? "Unblock" : "Block"}</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.01] hover:brightness-105 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.99]"
                  >
                    Delete
                  </button>
                </div>
              );
            },
          },
        ]}
        rows={filteredAdmins}
        pageSize={SUPERADMIN_PAGE_SIZE}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Admin" : "Add Admin"}
        description="Create the store owner account, assign a plan, and set secure login access."
      >
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {formErrors.length ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
              <div className="font-semibold">Please fix these details:</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {formErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleFormChange} required />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleFormChange} required />
            <FormField label="Mobile Number" name="mobileNumber" value={form.mobileNumber} onChange={handleFormChange} required />
            <div className="grid gap-2">
              <FormField label="Password" name="password" value={form.password} onChange={handleFormChange} placeholder={editingItem ? "Leave blank to keep current password" : "Create password"} />
              {form.password ? <PasswordStrengthMeter password={form.password} /> : null}
            </div>
            <FormField label="Store Name" name="storeName" value={form.storeName} onChange={handleFormChange} required />
            <FormField label="City" name="city" value={form.city} onChange={handleFormChange} required />
            <FormField label="Address" name="address" value={form.address} onChange={handleFormChange} required />
            <div className="grid gap-2">
              <SelectField
                label="Plan"
                name="planId"
                value={form.planId}
                onChange={handleFormChange}
                options={plansData.items.map((plan) => ({
                  label: `${plan.name} (${formatCurrency(Number(plan.monthlyPrice || plan.price || 0))}/month)`,
                  value: String(plan.id),
                }))}
              />
              <p className="text-xs leading-5 text-[var(--muted)]">
                {selectedPlanIsPaid
                  ? "No payment is collected on Create Admin. This manually provisions the paid plan; the admin can renew/pay later from their Plan page."
                  : "This plan can be assigned without payment."}
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ControlButton onClick={() => setModalOpen(false)}>Cancel</ControlButton>
            <ControlButton type="submit" variant="primary">{editingItem ? "Save Changes" : "Create Admin"}</ControlButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function SuperAdminStoresScreen() {
  const [storeType, setStoreType] = useState("");
  const storesLoader = useMemo(() => () => superAdminService.getStores(storeType || undefined), [storeType]);
  const { data, setData, loading } = useAsyncLoader(storesLoader, { items: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    storeType: "Grocery Shop",
    email: "",
    phone: "",
    city: "",
    address: "",
  });

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Network"
        title="Stores"
        description="Keep visibility on every store, owner, assigned plan, and renewal horizon."
        action={
          <ControlButton variant="primary" onClick={() => setModalOpen(true)}>
            <span className="inline-flex items-center gap-2"><Plus size={16} /> Add Store</span>
          </ControlButton>
        }
      />

      <GlassPanel className="p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div className="grid gap-2">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Store Type</div>
            <select
              value={storeType}
              onChange={(event) => setStoreType(event.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All</option>
              <option value="Grocery Shop">Grocery Shop</option>
              <option value="Clothes Shop">Clothes Shop</option>
              <option value="Shoe Shop">Shoe Shop</option>
              <option value="Electronics Shop">Electronics Shop</option>
              <option value="Beauty Shop">Beauty Shop</option>
              <option value="Accessories Shop">Accessories Shop</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setStoreType("")}
            className="h-12 rounded-2xl border border-slate-200/90 bg-white/85 px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white"
          >
            Clear Filter
          </button>
        </div>
      </GlassPanel>

      <DataTable
        columns={[
          { key: "name", label: "Store" },
          { key: "storeCode", label: "Store ID" },
          { key: "storeType", label: "Store Type" },
          { key: "owner", label: "Owner" },
          { key: "ownerEmail", label: "Email" },
          { key: "city", label: "City" },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
          { key: "planExpiresAt", label: "Plan Expiry", render: (value) => formatDate(value) },
        ]}
        rows={data.items}
        pageSize={SUPERADMIN_PAGE_SIZE}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Store"
        description="Create a store workspace record with contact details for onboarding."
      >
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (saving) return;
            const validationError = getContactValidationError({
              email: form.email,
              phone: form.phone,
              address: form.address,
            });
            if (validationError) {
              toast.error(validationError);
              return;
            }
            setSaving(true);
            try {
              const saved = await superAdminService.createStore(form);
              setData((previous) => ({ ...previous, items: [saved, ...(previous.items || [])] }));
              toast.success("Store created");
              setModalOpen(false);
              setForm({
                name: "",
                storeType: "Grocery Shop",
                email: "",
                phone: "",
                city: "",
                address: "",
              });
            } catch (error) {
              toast.error(error?.message || "Failed to create store");
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Store Name" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted-strong)]">Store Type</span>
              <input
                list="superadmin-store-types"
                value={form.storeType}
                onChange={(e) => setForm((p) => ({ ...p, storeType: e.target.value.slice(0, 60) }))}
                placeholder="Select or type shop type"
                maxLength={60}
                className="h-12 w-full rounded-2xl border border-black/10 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
              <datalist id="superadmin-store-types">
                {STORE_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>
            <FormField label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            <FormField label="Phone" name="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
            <FormField label="City" name="city" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required />
            <FormField label="Address" name="address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} required />
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ControlButton onClick={() => setModalOpen(false)}>Cancel</ControlButton>
            <ControlButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Create Store"}
            </ControlButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function SuperAdminPlansScreen() {
  const plansLoader = useMemo(() => superAdminService.getPlans, []);
  const { data, setData, loading } = useAsyncLoader(plansLoader, { items: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    duration: "Monthly",
    description: "",
    price: "",
    monthlyPrice: "",
    yearlyPrice: "",
    maxProducts: "",
    maxUsers: "1",
    maxCustomers: "",
    features: "",
    trialAvailable: false,
    popular: false,
    buttonText: "Select Plan",
    themeColor: "indigo",
    status: "ACTIVE",
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: "",
      duration: "Monthly",
      description: "",
      price: "",
      monthlyPrice: "",
      yearlyPrice: "",
      maxProducts: "",
      maxUsers: "1",
      maxCustomers: "",
      features: "",
      trialAvailable: false,
      popular: false,
      buttonText: "Select Plan",
      themeColor: "indigo",
      status: "ACTIVE",
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      duration: item.duration || "Monthly",
      description: item.description,
      price: item.price,
      monthlyPrice: item.monthlyPrice,
      yearlyPrice: item.yearlyPrice,
      maxProducts: item.maxProducts,
      maxUsers: item.maxUsers || "1",
      maxCustomers: item.maxCustomers,
      features: item.features,
      trialAvailable: Boolean(item.trialAvailable),
      popular: Boolean(item.popular),
      buttonText: item.buttonText || "Select Plan",
      themeColor: item.themeColor || "indigo",
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      duration: String(form.duration || "").trim(),
      price: Number(form.price || form.monthlyPrice || 0),
      monthlyPrice: Number(form.monthlyPrice || form.price || 0),
      yearlyPrice: Number(form.yearlyPrice || 0),
      maxProducts: Number(form.maxProducts || 0),
      maxUsers: Number(form.maxUsers || 1),
      maxCustomers: Number(form.maxCustomers || 0),
    };

    if (!payload.name?.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!payload.duration) {
      toast.error("Plan duration is required");
      return;
    }
    if (!payload.description?.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!payload.features?.trim()) {
      toast.error("Features are required");
      return;
    }
    if (!Number.isFinite(payload.price) || payload.price < 0) {
      toast.error("Price must be 0 or more");
      return;
    }
    if (!Number.isFinite(payload.monthlyPrice) || payload.monthlyPrice < 0) {
      toast.error("Monthly price must be 0 or more");
      return;
    }
    if (!Number.isFinite(payload.yearlyPrice) || payload.yearlyPrice < 0) {
      toast.error("Yearly price must be 0 or more");
      return;
    }
    if (!Number.isFinite(payload.maxProducts) || payload.maxProducts <= 0) {
      toast.error("Max Products must be greater than 0");
      return;
    }
    if (!Number.isFinite(payload.maxUsers) || payload.maxUsers <= 0) {
      toast.error("Max Users must be greater than 0");
      return;
    }
    if (!Number.isFinite(payload.maxCustomers) || payload.maxCustomers <= 0) {
      toast.error("Max Customers must be greater than 0");
      return;
    }

    try {
      const saved = editingItem
        ? await superAdminService.updatePlan(editingItem.id, payload)
        : await superAdminService.createPlan(payload);

      setData((previous) => ({
        ...previous,
        items: editingItem
          ? previous.items.map((item) => (item.id === editingItem.id ? { ...item, ...saved } : item))
          : [{ ...saved, id: saved.id || Date.now() }, ...previous.items],
      }));
      toast.success(editingItem ? "Plan updated" : "Plan created");
      setModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save plan");
    }
  };

  const handleToggle = async (planId) => {
    await superAdminService.togglePlan(planId);
    setData((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.id === planId ? { ...item, status: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : item
      ),
    }));
  };

  const handleDelete = async (planId) => {
    await superAdminService.deletePlan(planId);
    setData((previous) => ({
      ...previous,
      items: previous.items.filter((item) => item.id !== planId),
    }));
    toast.success("Plan deleted");
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Subscription engine"
        title="Plans"
        description="Publish, adjust, activate, or retire pricing plans and let changes reflect instantly across admin workspaces."
        action={
          <ControlButton variant="primary" onClick={openCreate}>
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Create Plan
            </span>
          </ControlButton>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {data.items.map((plan) => (
          <motion.div key={plan.id} whileHover={{ y: -4 }} className="h-full">
            <GlassPanel className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold">{plan.name}</div>
                  <div className="mt-2 text-sm text-[var(--muted)]">{plan.description}</div>
                </div>
                <StatusBadge value={plan.status} />
              </div>
              <div className="mt-6 text-3xl font-semibold">{formatCurrency(plan.monthlyPrice)}<span className="text-base text-slate-500"> / month</span></div>
              <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{plan.duration || "Monthly"}</div>
              <div className="mt-2 text-sm text-[var(--muted)]">{formatCurrency(plan.yearlyPrice)} annual billing</div>
              <div className="mt-5 grid gap-2 text-sm text-slate-600">
                <div>Products: {plan.maxProducts}</div>
                <div>Users: {plan.maxUsers}</div>
                <div>Customers: {plan.maxCustomers}</div>
                {plan.trialAvailable ? <div className="text-teal-700">Free trial available</div> : null}
                {plan.popular ? <div className="text-violet-700">Most popular</div> : null}
                <div>{plan.features}</div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <ControlButton onClick={() => openEdit(plan)}>
                  <span className="inline-flex items-center gap-2"><Pencil size={14} /> Edit</span>
                </ControlButton>
                <ControlButton onClick={() => handleToggle(plan.id)}>
                  {plan.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </ControlButton>
                <button
                  type="button"
                  onClick={() => handleDelete(plan.id)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.01] hover:brightness-105 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.99]"
                >
                  Delete
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Plan" : "Create Plan"}
        description="Shape pricing, capacity, and value positioning for your subscription catalog."
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Plan Name" name="name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} required />
            <FormField label="Plan Duration" name="duration" value={form.duration} onChange={(event) => setForm((previous) => ({ ...previous, duration: event.target.value }))} placeholder="Monthly / 3 Months / 12 Months" required />
            <SelectField
              label="Status"
              name="status"
              value={form.status}
              onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value }))}
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
                { label: "Draft", value: "DRAFT" },
              ]}
            />
            <FormField label="Price" name="price" type="number" value={form.price} onChange={(event) => setForm((previous) => ({ ...previous, price: event.target.value }))} required />
            <FormField label="Monthly Price" name="monthlyPrice" type="number" value={form.monthlyPrice} onChange={(event) => setForm((previous) => ({ ...previous, monthlyPrice: event.target.value }))} required />
            <FormField label="Yearly Price" name="yearlyPrice" type="number" value={form.yearlyPrice} onChange={(event) => setForm((previous) => ({ ...previous, yearlyPrice: event.target.value }))} required />
            <FormField label="Max Products" name="maxProducts" type="number" value={form.maxProducts} onChange={(event) => setForm((previous) => ({ ...previous, maxProducts: event.target.value }))} required />
            <FormField label="Max Customers" name="maxCustomers" type="number" value={form.maxCustomers} onChange={(event) => setForm((previous) => ({ ...previous, maxCustomers: event.target.value }))} required />
            <FormField className="sm:col-span-2" label="Button Text" name="buttonText" value={form.buttonText} onChange={(event) => setForm((previous) => ({ ...previous, buttonText: event.target.value }))} placeholder="Select Plan" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={form.trialAvailable} onChange={(event) => setForm((previous) => ({ ...previous, trialAvailable: event.target.checked }))} className="theme-input h-4 w-4 rounded" />
              Trial Available
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={form.popular} onChange={(event) => setForm((previous) => ({ ...previous, popular: event.target.checked }))} className="theme-input h-4 w-4 rounded" />
              Most Popular
            </label>
          </div>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-600">Description</span>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
              className="theme-input h-12 w-full rounded-2xl px-4 py-3 outline-none transition"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-600">Features</span>
            <textarea
              rows={3}
              required
              value={form.features}
              onChange={(event) => setForm((previous) => ({ ...previous, features: event.target.value }))}
              className="theme-input h-12 w-full rounded-2xl px-4 py-3 outline-none transition"
            />
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ControlButton onClick={() => setModalOpen(false)}>Cancel</ControlButton>
            <ControlButton type="submit" variant="primary">{editingItem ? "Save Plan" : "Create Plan"}</ControlButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function SuperAdminInvoicesScreen() {
  const [exporting, setExporting] = useState(null);
  const loader = useMemo(() => superAdminService.getInvoices, []);
  const { data, setData, loading } = useAsyncLoader(loader, { items: [] });

  const reloadInvoices = async () => {
    setExporting("refresh");
    try {
      const response = await superAdminService.getInvoices();
      setData(response);
      toast.success("Invoices refreshed");
    } catch (error) {
      toast.error(error?.message || "Failed to refresh invoices");
    } finally {
      setExporting(null);
    }
  };

  const exportInvoicesPdf = async () => {
    setExporting("pdf");
    try {
      await exportTablePdf({
        fileName: "myreport-superadmin-invoices.pdf",
        reportTitle: "Platform Invoices Report",
        rows: data.items || [],
        columns: [
          { key: "invoiceNumber", label: "Invoice", width: 170 },
          { key: "store", label: "Store", width: 130 },
          { key: "customerName", label: "Customer", width: 130 },
          { key: "totalAmount", label: "Amount", value: (row) => formatCurrency(row.totalAmount), width: 110 },
          { key: "status", label: "Status", value: (row) => row.status, width: 100 },
          { key: "createdAt", label: "Date", type: "date", width: 120 },
        ],
      });
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export PDF");
    } finally {
      setExporting(null);
    }
  };

  const exportInvoicesExcel = async () => {
    setExporting("excel");
    try {
      await exportTableExcel({
        fileName: "myreport-superadmin-invoices.xlsx",
        sheetName: "Platform Invoices",
        rows: data.items || [],
        columns: [
          { key: "invoiceNumber", label: "Invoice Number" },
          { key: "store", label: "Store" },
          { key: "customerName", label: "Customer" },
          { key: "totalAmount", label: "Amount", value: (row) => formatCurrency(row.totalAmount), align: "right" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created Date", type: "date" },
        ],
      });
      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export Excel");
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Finance"
        title="Invoices"
        description="Review transaction volume across the platform in a single premium ledger."
        action={
          <DownloadToolbar
            onRefresh={reloadInvoices}
            onExportExcel={exportInvoicesExcel}
            onExportPdf={exportInvoicesPdf}
            exporting={exporting}
            downloadDisabled={!data?.items?.length}
          />
        }
      />
      <DataTable
        columns={[
          { key: "invoiceNumber", label: "Invoice" },
          { key: "store", label: "Store" },
          { key: "customerName", label: "Customer" },
          { key: "totalAmount", label: "Amount", render: (value) => formatCurrency(value) },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
          { key: "createdAt", label: "Date", render: (value) => formatDate(value) },
        ]}
        rows={data.items}
        pageSize={SUPERADMIN_PAGE_SIZE}
      />
    </div>
  );
}

export function SuperAdminEnquiriesScreen() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [enquiriesPage, setEnquiriesPage] = useState(1);

  const loader = useMemo(() => {
    return () => superAdminService.getEnquiries({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      source: sourceFilter === "ALL" ? undefined : sourceFilter,
      q: query || undefined,
    });
  }, [statusFilter, sourceFilter, query]);
  const { data, setData, loading } = useAsyncLoader(loader, { items: [], total: 0, stats: {} });
  const stats = data.stats || {};
  const enquiryItems = data.items || [];
  const enquiryTotalPages = Math.max(1, Math.ceil(enquiryItems.length / SUPERADMIN_PAGE_SIZE));
  const currentEnquiriesPage = Math.min(enquiriesPage, enquiryTotalPages);
  const visibleEnquiries = enquiryItems.slice(
    (currentEnquiriesPage - 1) * SUPERADMIN_PAGE_SIZE,
    currentEnquiriesPage * SUPERADMIN_PAGE_SIZE
  );

  const refresh = async (options = {}) => {
    const silent = options?.silent === true;
    if (refreshing && !silent) return;
    if (!silent) {
      setRefreshing(true);
    }
    try {
      const response = await superAdminService.getEnquiries({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        source: sourceFilter === "ALL" ? undefined : sourceFilter,
        q: query || undefined,
      });
      setData(response);
      setEnquiriesPage(1);
      if (!silent) {
        toast.success("Support enquiries refreshed");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to refresh support enquiries");
    } finally {
      if (!silent) {
        setRefreshing(false);
      }
    }
  };

  const applyReply = async () => {
    if (!selectedItem || !replyMessage.trim()) return;
    setReplying(true);
    try {
      await superAdminService.replyEnquiry({ id: selectedItem.id, replyMessage });
      toast.success("Reply saved");
      setSelectedItem(null);
      setReplyMessage("");
      await refresh({ silent: true });
    } catch (error) {
      toast.error(error?.message || "Unable to save reply");
    } finally {
      setReplying(false);
    }
  };

  const markResolved = async (item) => {
    setUpdating(true);
    try {
      await superAdminService.updateSupportStatus({ id: item.id, status: "RESOLVED" });
      toast.success("Marked as resolved");
      await refresh({ silent: true });
    } catch (error) {
      toast.error(error?.message || "Unable to update status");
    } finally {
      setUpdating(false);
    }
  };

  const deleteItem = async (item) => {
    setUpdating(true);
    try {
      await superAdminService.deleteSupportEnquiry(item.id);
      toast.success("Support enquiry deleted");
      await refresh({ silent: true });
    } catch (error) {
      toast.error(error?.message || "Unable to delete enquiry");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Customer Care"
        title="Support Enquiries"
        description="Contact and chatbot routing"
        action={
          <ControlButton variant="primary" onClick={refresh} disabled={refreshing || updating || replying}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </ControlButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard item={{ label: "Total Enquiries", value: String(data.total || 0), helper: "Total support requests", accent: "cyan" }} />
        <MetricCard item={{ label: "New", value: String(stats.newCount || 0), helper: "Waiting for action", accent: "amber" }} />
        <MetricCard item={{ label: "In Progress", value: String(stats.inProgressCount || 0), helper: "Currently being handled", accent: "violet" }} />
        <MetricCard item={{ label: "Resolved", value: String(stats.resolvedCount || 0), helper: "Closed successfully", accent: "emerald" }} />
        <MetricCard item={{ label: "Email Sent", value: String(stats.emailSentCount || 0), helper: "Support replies delivered", accent: "cyan" }} />
      </div>

      <GlassPanel className="max-w-full overflow-hidden p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.4fr_0.4fr]">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-strong)]">Search</span>
            <input
              value={query}
              onChange={(event) => {
                setEnquiriesPage(1);
                setQuery(event.target.value);
              }}
              placeholder="Search enquiries..."
              className="theme-input w-full rounded-2xl px-4 py-3 outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-strong)]">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setEnquiriesPage(1);
                setStatusFilter(event.target.value);
              }}
              className="theme-input w-full rounded-2xl px-4 py-3 outline-none"
            >
              {["ALL", "NEW", "IN_PROGRESS", "RESOLVED"].map((option) => (
                <option key={option} value={option}>{option.replace("_", " ")}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-strong)]">Source</span>
            <select
              value={sourceFilter}
              onChange={(event) => {
                setEnquiriesPage(1);
                setSourceFilter(event.target.value);
              }}
              className="theme-input w-full rounded-2xl px-4 py-3 outline-none"
            >
              {["ALL", "CONTACT_FORM", "CHATBOT", "WEBSITE", "ADMIN_PANEL"].map((option) => (
                <option key={option} value={option}>{option.replace("_", " ")}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 max-h-[520px] overflow-x-auto overflow-y-scroll rounded-[28px] border border-slate-200/80 bg-white/60 scrollbar-thin">
          <div className="sticky top-0 z-10 grid min-w-[1280px] grid-cols-[1.05fr_1.25fr_1.25fr_0.9fr_1.35fr_0.9fr_0.8fr_2fr] gap-0 border-b border-slate-200/80 bg-slate-100/95 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 backdrop-blur">
            <div>Ticket ID</div>
            <div>Contact Name</div>
            <div>Message</div>
            <div>Status</div>
            <div>Email</div>
            <div>Source</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          <div className="grid min-w-[1280px] gap-2 bg-slate-50/80 p-2">
            {visibleEnquiries.length ? visibleEnquiries.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.05fr_1.25fr_1.25fr_0.9fr_1.35fr_0.9fr_0.8fr_2fr] items-center gap-0 rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200/80 hover:bg-white hover:shadow-md [&>div:nth-child(2)>div:nth-child(2)]:!text-slate-500">
                <div className="text-sm font-semibold text-slate-900">{item.ticketId}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                  <div className="text-xs text-white/55">{item.phone || "—"}</div>
                </div>
                <div className="max-w-[36ch] text-sm leading-6 text-slate-700">{item.message}</div>
                <div className="text-sm font-semibold text-cyan-700">{String(item.status || "").replace("_", " ")}</div>
                <div className="min-w-0 truncate text-sm text-slate-700" title={item.email}>{item.email}</div>
                <div className="text-sm text-slate-700">{String(item.source || "").replace("_", " ")}</div>
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{formatDate(item.createdAt)}</div>
                <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                  <button type="button" onClick={() => setSelectedItem(item)} className="rounded-full border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">View</button>
                  <button type="button" onClick={() => { setSelectedItem(item); setReplyMessage(item.replyMessage || ""); }} className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-500/20">Reply</button>
                  <button type="button" onClick={() => markResolved(item)} disabled={updating} className="rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/20 disabled:opacity-60">Resolved</button>
                  <button type="button" onClick={() => deleteItem(item)} disabled={updating} className="rounded-full bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-500/20 disabled:opacity-60">Delete</button>
                </div>
              </div>
            )) : (
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 p-6 text-sm text-slate-600">Nothing to show yet.</div>
            )}
          </div>
        </div>
        <PaginationFooter
          currentPage={currentEnquiriesPage}
          totalPages={enquiryTotalPages}
          visibleCount={visibleEnquiries.length}
          totalCount={enquiryItems.length}
          onPageChange={setEnquiriesPage}
        />
      </GlassPanel>

      <Modal open={Boolean(selectedItem)} onClose={() => { setSelectedItem(null); setReplyMessage(""); }} title="Support Ticket">
        {selectedItem ? (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{selectedItem.ticketId}</div>
              <div className="mt-2 text-lg font-semibold text-[var(--foreground)]">{selectedItem.name}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{selectedItem.email} • {selectedItem.phone || "No phone"}</div>
              <div className="mt-3 text-sm leading-6 text-slate-700">{selectedItem.message}</div>
            </div>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted-strong)]">Reply</span>
              <textarea value={replyMessage} onChange={(event) => setReplyMessage(event.target.value)} className="theme-input min-h-32 w-full rounded-2xl px-4 py-3 outline-none" placeholder="Type the support reply..." />
            </label>
            <div className="flex flex-wrap gap-3">
              <ControlButton variant="primary" onClick={applyReply} disabled={replying}>{replying ? "Saving..." : "Save Reply"}</ControlButton>
              <ControlButton onClick={() => markResolved(selectedItem)} disabled={updating}>Mark Resolved</ControlButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function SuperAdminReportsScreen() {
  const [range, setRange] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(null);

  const loader = useMemo(
    () => () => superAdminService.getReports({ range, startDate: startDate || undefined, endDate: endDate || undefined }),
    [range, startDate, endDate]
  );
  const { data, setData, loading } = useAsyncLoader(loader, { summary: {}, series: [], planMix: [] });

  const reportRows = useMemo(
    () =>
      (data.series || []).map((item) => ({
        period: item.label,
        revenue: formatCurrency(item.value),
        range: range.charAt(0).toUpperCase() + range.slice(1),
        startDate: startDate || "",
        endDate: endDate || "",
      })),
    [data.series, endDate, range, startDate]
  );

  const reportColumns = useMemo(
    () => [
      { key: "period", label: "Period", width: 160 },
      { key: "revenue", label: "Revenue", width: 150 },
      { key: "range", label: "Range", width: 120 },
      { key: "startDate", label: "Start Date", type: "date", width: 120 },
      { key: "endDate", label: "End Date", type: "date", width: 120 },
    ],
    []
  );

  const reloadReports = async () => {
    if (exporting) return;
    setExporting("refresh");
    try {
      const response = await superAdminService.getReports({
        range,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(response);
      toast.success("Reports refreshed");
    } catch (error) {
      toast.error(error?.message || "Failed to refresh reports");
    } finally {
      setExporting(null);
    }
  };

  const exportReportsPdf = async () => {
    if (!reportRows.length) {
      toast.error("No report data available");
      return;
    }

    setExporting("pdf");
    try {
      await exportTablePdf({
        fileName: "myreport-superadmin-reports.pdf",
        reportTitle: "Platform Reports",
        rows: reportRows,
        columns: reportColumns,
      });
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export PDF");
    } finally {
      setExporting(null);
    }
  };

  const exportReportsExcel = async () => {
    if (!reportRows.length) {
      toast.error("No report data available");
      return;
    }

    setExporting("excel");
    try {
      await exportTableExcel({
        fileName: "myreport-superadmin-reports.xlsx",
        sheetName: "Reports",
        rows: reportRows,
        columns: reportColumns,
      });
      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export Excel");
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Analytics"
        title="Reports"
        description="Deep-dive into revenue performance, store mix, and platform expansion."
        action={
          <DownloadToolbar
            onRefresh={reloadReports}
            onExportExcel={exportReportsExcel}
            onExportPdf={exportReportsPdf}
            exporting={exporting}
            downloadDisabled={!data?.series?.length}
          />
        }
      />

      <GlassPanel className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="theme-input h-12 w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="theme-input h-12 w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
              />
            </label>
            <div className="grid gap-2">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Quick Range</div>
              <div className="flex flex-wrap gap-2">
                <ControlButton variant={range === "daily" ? "primary" : "default"} onClick={() => setRange("daily")}>Daily</ControlButton>
                <ControlButton variant={range === "weekly" ? "primary" : "default"} onClick={() => setRange("weekly")}>Weekly</ControlButton>
                <ControlButton variant={range === "monthly" ? "primary" : "default"} onClick={() => setRange("monthly")}>Monthly</ControlButton>
                <ControlButton variant={range === "yearly" ? "primary" : "default"} onClick={() => setRange("yearly")}>Yearly</ControlButton>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <ControlButton
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setRange("monthly");
              }}
            >
              Reset
            </ControlButton>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard item={{ label: "Revenue", value: formatCurrency(data.summary.revenue || 0), helper: "All-store billing", accent: "cyan" }} />
        <MetricCard item={{ label: "Stores", value: String(data.summary.stores || 0), helper: "Connected workspaces", accent: "emerald" }} />
        <MetricCard item={{ label: "Admins", value: String(data.summary.admins || 0), helper: "Managed operators", accent: "violet" }} />
      </div>

      <div className="grid max-w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Revenue Trend" description="Performance trend for the selected report range.">
          <div className="h-72 w-full max-w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series}>
                <defs>
                  <linearGradient id="reportsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#7c8cff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c8cff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(26,16,53,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }} />
                <Area type="monotone" dataKey="value" stroke="#7c8cff" strokeWidth={2.5} fill="url(#reportsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ActivityList
          title="Plan Mix"
          items={data.planMix}
          pageSize={SUPERADMIN_PAGE_SIZE}
          render={(item) => (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{item.name}</div>
                <StatusBadge value={item.status} />
              </div>
              <div className="mt-2 text-sm text-[var(--muted)]">{item.stores} active stores</div>
            </>
          )}
        />
      </div>
    </div>
  );
}

export function SuperAdminSettingsScreen() {
  const dispatch = useDispatch();
  const loader = useMemo(() => superAdminService.getSettings, []);
  const { data, setData, loading } = useAsyncLoader(loader, { profile: {}, preferences: {} });
  const [isEditing, setIsEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState({
    fullName: "",
    mobileNumber: "",
    city: "",
    address: "",
    email: "",
    avatarUrl: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordTouched, setPasswordTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const syncLiveProfile = (profile) => {
    if (!profile) return;
    dispatch(syncProfile(profile));
    updateStoredProfile(profile);
  };

  const syncProfileSession = (response) => {
    if (response?.token) {
      persistSession({ token: response.token, role: response.role || "SUPER_ADMIN", profile: response.profile });
      dispatch(setCredentials({ token: response.token, role: response.role || "SUPER_ADMIN", profile: response.profile }));
      return;
    }
    syncLiveProfile(response?.profile);
  };

  const handleEditProfile = () => {
    setDraftProfile({
      fullName: data.profile?.fullName || "",
      mobileNumber: data.profile?.mobileNumber || "",
      city: data.profile?.city || "",
      address: data.profile?.address || "",
      email: data.profile?.email || "",
      avatarUrl: data.profile?.avatarUrl || "",
    });
    setIsEditing(true);
  };

  const handleCancelProfile = () => {
    setDraftProfile({
      fullName: data.profile?.fullName || "",
      mobileNumber: data.profile?.mobileNumber || "",
      city: data.profile?.city || "",
      address: data.profile?.address || "",
      email: data.profile?.email || "",
      avatarUrl: data.profile?.avatarUrl || "",
    });
    setIsEditing(false);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    const validationError = getContactValidationError({
      email: draftProfile.email,
      phone: draftProfile.mobileNumber,
      address: draftProfile.address,
    });
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      const response = await superAdminService.updateProfile({
        fullName: draftProfile.fullName,
        email: String(draftProfile.email || "").trim().toLowerCase(),
        mobileNumber: draftProfile.mobileNumber,
        city: draftProfile.city,
        address: draftProfile.address,
      });
      setData(response);
      setDraftProfile({
        fullName: response.profile?.fullName || "",
        mobileNumber: response.profile?.mobileNumber || "",
        city: response.profile?.city || "",
        address: response.profile?.address || "",
        email: response.profile?.email || "",
        avatarUrl: response.profile?.avatarUrl || "",
      });
      syncProfileSession(response);
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update profile");
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingPhoto(true);
    try {
      const response = await superAdminService.uploadProfilePhoto(file);
      setData(response);
      setDraftProfile({
        fullName: response.profile?.fullName || "",
        mobileNumber: response.profile?.mobileNumber || "",
        city: response.profile?.city || "",
        address: response.profile?.address || "",
        email: response.profile?.email || "",
        avatarUrl: response.profile?.avatarUrl || "",
      });
      syncLiveProfile(response.profile);
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!data.profile?.avatarUrl) {
      return;
    }

    setUploadingPhoto(true);
    try {
      const response = await superAdminService.removeProfilePhoto();
      setData(response);
      setDraftProfile({
        fullName: response.profile?.fullName || "",
        mobileNumber: response.profile?.mobileNumber || "",
        city: response.profile?.city || "",
        address: response.profile?.address || "",
        email: response.profile?.email || "",
        avatarUrl: response.profile?.avatarUrl || "",
      });
      syncLiveProfile(response.profile);
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to remove profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setPasswordTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    const current = passwordForm.currentPassword || "";
    const next = passwordForm.newPassword || "";
    const confirm = passwordForm.confirmPassword || "";

    if (!current) {
      toast.error("Current password is required");
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(next)) {
      toast.error("New password must include uppercase, lowercase, number, and special character.");
      return;
    }

    if (next !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await superAdminService.updatePassword(passwordForm);
      toast.success("Password updated");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordTouched({ currentPassword: false, newPassword: false, confirmPassword: false });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update password");
    }
  };

  const passwordErrors = {
    currentPassword: !passwordForm.currentPassword ? "Current password is required." : "",
    newPassword: !passwordForm.newPassword
      ? "New password is required."
      : !STRONG_PASSWORD_REGEX.test(passwordForm.newPassword)
        ? "Use 8+ chars with uppercase, lowercase, number, and special character."
        : "",
    confirmPassword: !passwordForm.confirmPassword
      ? "Confirm password is required."
      : passwordForm.newPassword !== passwordForm.confirmPassword
        ? "Passwords do not match."
        : "",
  };
  const canSubmitPassword =
    Boolean(passwordForm.currentPassword) &&
    STRONG_PASSWORD_REGEX.test(passwordForm.newPassword || "") &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  const profileView = isEditing ? draftProfile : data.profile;
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api").replace(/\/api\/?$/, "");
  const avatarUrl = profileView?.avatarUrl
    ? (String(profileView.avatarUrl).startsWith("http") ? profileView.avatarUrl : `${apiBase}${profileView.avatarUrl}`)
    : null;

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading eyebrow="Profile" title="Super Admin settings" description="Keep your profile and password in sync." />
        <form className="mt-6 grid gap-4" onSubmit={handleProfileSave}>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-200/70 bg-gradient-to-br from-cyan-100 via-white to-violet-100 shadow-[0_0_0_4px_rgba(34,211,238,0.08)]">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Profile avatar" fill sizes="80px" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-teal-800">
                    {String(profileView?.fullName || data.profile?.fullName || "MR")
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0] || "")
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {avatarUrl ? (
                  <>
                    <div className="truncate text-lg font-semibold text-gray-900">{profileView?.fullName || "Super Admin"}</div>
                    <div className="mt-1 truncate text-sm text-gray-500">{data.profile?.email || ""}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-gray-900">Profile Photo</div>
                    <div className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP up to 5MB</div>
                  </>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:justify-end">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <ControlButton className="h-11 px-4" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                <span className="inline-flex items-center gap-2"><Upload size={14} /> {uploadingPhoto ? "Uploading..." : "Upload"}</span>
              </ControlButton>
              <ControlButton className="h-11 px-4" onClick={handleRemovePhoto} disabled={uploadingPhoto || !data.profile?.avatarUrl}>
                <span className="inline-flex items-center gap-2"><Trash2 size={14} /> Remove</span>
              </ControlButton>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Full Name"
              name="fullName"
              value={profileView?.fullName || ""}
              onChange={(event) => setDraftProfile((previous) => ({ ...previous, fullName: event.target.value }))}
              required
              disabled={!isEditing}
            />
            <div className="grid gap-2 text-sm">
              <span className="font-medium text-slate-600">Email</span>
              <input
                type="email"
                value={profileView?.email || ""}
                onChange={(event) => setDraftProfile((previous) => ({ ...previous, email: event.target.value.slice(0, 160) }))}
                disabled={!isEditing}
                className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-slate-800 outline-none transition disabled:bg-slate-50/80 disabled:text-slate-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <FormField
              label="Mobile Number"
              name="mobileNumber"
              value={profileView?.mobileNumber || ""}
              onChange={(event) => setDraftProfile((previous) => ({ ...previous, mobileNumber: event.target.value.replace(/\D/g, "").slice(0, 10) }))}
              required
              disabled={!isEditing}
            />
            <FormField
              label="City"
              name="city"
              value={profileView?.city || ""}
              onChange={(event) => setDraftProfile((previous) => ({ ...previous, city: event.target.value }))}
              required
              disabled={!isEditing}
            />
            <FormField
              className="sm:col-span-2"
              label="Address"
              name="address"
              value={profileView?.address || ""}
              onChange={(event) => setDraftProfile((previous) => ({ ...previous, address: event.target.value }))}
              required
              disabled={!isEditing}
            />
          </div>
          <div className="flex justify-start sm:justify-end">
            {!isEditing ? (
              <ControlButton type="button" variant="primary" onClick={handleEditProfile}>Edit Profile</ControlButton>
            ) : (
              <div className="flex items-center gap-3">
                <ControlButton type="button" onClick={handleCancelProfile}>Cancel</ControlButton>
                <ControlButton type="submit" variant="primary">Save Changes</ControlButton>
              </div>
            )}
          </div>
        </form>

      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <form className="mt-5 grid gap-4" onSubmit={handlePasswordSave}>
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={(event) => {
              setPasswordTouched((previous) => ({ ...previous, currentPassword: true }));
              setPasswordForm((previous) => ({ ...previous, currentPassword: event.target.value }));
            }}
            required
            status={passwordTouched.currentPassword ? (passwordErrors.currentPassword ? "error" : "success") : "idle"}
            helper={passwordTouched.currentPassword ? passwordErrors.currentPassword : ""}
          />
          <div className="grid gap-2">
            <PasswordField
              label="New Password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={(event) => {
                setPasswordTouched((previous) => ({ ...previous, newPassword: true }));
                setPasswordForm((previous) => ({ ...previous, newPassword: event.target.value }));
              }}
              required
              status={passwordTouched.newPassword ? (passwordErrors.newPassword ? "error" : "success") : "idle"}
              helper={passwordTouched.newPassword ? passwordErrors.newPassword : ""}
            />
            <PasswordStrengthMeter password={passwordForm.newPassword} />
          </div>
          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={(event) => {
              setPasswordTouched((previous) => ({ ...previous, confirmPassword: true }));
              setPasswordForm((previous) => ({ ...previous, confirmPassword: event.target.value }));
            }}
            required
            status={passwordTouched.confirmPassword ? (passwordErrors.confirmPassword ? "error" : "success") : "idle"}
            helper={passwordTouched.confirmPassword ? passwordErrors.confirmPassword : ""}
          />
          <div className="flex justify-start sm:justify-end">
            <ControlButton type="submit" variant="primary" disabled={!canSubmitPassword}>Update Password</ControlButton>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}


