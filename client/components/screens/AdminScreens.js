"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import Link from "next/link";
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
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  PackageCheck,
  Plus,
  Printer,
  ReceiptText,
  Search,
  ShoppingCart,
  Upload,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/common/DataTable";
import { DownloadToolbar } from "@/components/common/DownloadToolbar";
import { GlassPanel } from "@/components/common/GlassPanel";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { MetricCard } from "@/components/common/MetricCard";
import { Modal } from "@/components/common/Modal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TopSalesChart } from "@/components/TopSalesChart";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { formatCurrency, formatDate, printPage } from "@/lib/format";
import { exportTableExcel, exportTablePdf } from "@/lib/exportReports";
import { printInvoice } from "@/lib/printInvoice";
import { submitPayUCheckout } from "@/lib/payuCheckout";
import { persistSession, updateStoredProfile } from "@/lib/session";
import { adminService } from "@/services/adminService";
import { createPayUOrder } from "@/services/paymentService";
import { publicPlanService } from "@/services/publicPlanService";
import { setCredentials, updateProfile as syncProfile } from "@/redux/slices/authSlice";

const CUSTOMER_NAME_REGEX = /^[A-Za-z ]{3,40}$/;
const CUSTOMER_CITY_REGEX = /^[A-Za-z ]{3,30}$/;
const STRONG_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.com$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
const REPEATED_DIGIT_MOBILE_REGEX = /^(\d)\1{9}$/;
const FULL_ADDRESS_REGEX = /^(?=.*[A-Za-z])(?=.*\s).{10,}$/;
const DUMMY_TEXT_VALUES = new Set(["aaa", "test", "testtest", "dummy", "random", "abc"]);
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function isLikelyDummyText(value) {
  const compact = value.toLowerCase().replace(/\s+/g, "");
  if (!compact) return false;
  if (DUMMY_TEXT_VALUES.has(compact)) return true;
  return /^([a-z])\1+$/.test(compact);
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

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = "",
  inputClassName = "",
  helper,
  ...inputProps
}) {
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
        className={`theme-input w-full rounded-2xl px-4 py-3 outline-none transition duration-300 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/40 ${inputClassName}`}
        {...inputProps}
      />
      {helper ? <span className="text-xs text-red-400">{helper}</span> : null}
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

function ProductSearchField({
  label,
  value,
  placeholder,
  options,
  open,
  activeIndex,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onSelect,
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--muted-strong)]">{label}</span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="theme-input w-full rounded-2xl px-10 py-3 outline-none transition duration-300 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/40"
        />
        {open ? (
          <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-cyan-200/70 bg-white p-1 shadow-[0_16px_34px_rgba(15,23,42,0.14)]">
            {options.length ? (
              options.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={() => onSelect(product)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    index === activeIndex
                      ? "bg-cyan-50 text-teal-800 ring-1 ring-cyan-200/70"
                      : "text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{product.name}</span>
                    <span className="block text-xs text-slate-500">{formatCurrency(product.price)} / {product.unit}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    Stock {Number(product.quantity || 0).toLocaleString("en-IN")}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2.5 text-sm font-medium text-slate-500">No matching products</div>
            )}
          </div>
        ) : null}
      </div>
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

function getStockHealthStatus(quantity) {
  const safeQuantity = Number(quantity || 0);
  if (safeQuantity <= 0) return "OUT OF STOCK";
  if (safeQuantity <= 10) return "LOW STOCK";
  return "IN STOCK";
}

function StockHealthBadge({ quantity }) {
  const status = getStockHealthStatus(quantity);
  const toneClass =
    status === "IN STOCK"
      ? "text-[#059669] ring-1 ring-emerald-500/20"
      : status === "LOW STOCK"
        ? "text-[#dc2626] ring-1 ring-rose-500/20"
        : "text-[#374151] ring-1 ring-slate-500/20";
  const dotClass =
    status === "IN STOCK"
      ? "bg-emerald-500"
      : status === "LOW STOCK"
        ? "bg-orange-500"
        : "bg-slate-700";
  const toneStyle =
    status === "IN STOCK"
      ? { backgroundColor: "rgba(16,185,129,0.14)" }
      : status === "LOW STOCK"
        ? { backgroundColor: "rgba(239,68,68,0.14)" }
        : { backgroundColor: "rgba(107,114,128,0.14)" };

  return (
    <span
      className={`inline-flex min-w-[132px] items-center justify-center gap-1.5 rounded-full px-[14px] py-2 text-[12px] font-bold uppercase tracking-[1px] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_10px_20px_rgba(99,102,241,0.16)] ${toneClass}`}
      style={toneStyle}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {status}
    </span>
  );
}

export function AdminDashboardScreen() {
  const loader = useMemo(() => adminService.getDashboard, []);
  const { data, setData, loading } = useAsyncLoader(loader, {
    metrics: [],
    revenueSeries: [],
    topSales: [],
    store: {},
    highlights: [],
  });

  useEffect(() => {
    let active = true;
    const refreshDashboard = async () => {
      try {
        const response = await adminService.getDashboard();
        if (active) {
          setData(response);
          sessionStorage.removeItem("myreport:billing-updated-at");
        }
      } catch {
        // Keep the currently displayed dashboard data if a background refresh fails.
      }
    };

    const handleBillingUpdated = () => refreshDashboard();
    window.addEventListener("myreport:billing-updated", handleBillingUpdated);
    if (sessionStorage.getItem("myreport:billing-updated-at")) {
      refreshDashboard();
    }

    return () => {
      active = false;
      window.removeEventListener("myreport:billing-updated", handleBillingUpdated);
    };
  }, [setData]);

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  const metricValue = (label) => data.metrics.find((item) => item.label === label)?.value;
  const lowStockCount = Number(metricValue("Low Stock") || 0);
  const todaysSales = metricValue("Today's Sales") || "Rs. 0";
  const invoiceHighlight = data.highlights.find((item) => String(item).toLowerCase().includes("invoice"));
  const planExpiresAt = data.store?.planExpiresAt ? new Date(data.store.planExpiresAt) : null;
  const daysUntilRenewal = planExpiresAt
    ? Math.ceil((planExpiresAt.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
    : null;
  const dashboardNotifications = [
    {
      title: "Plan renewal",
      message:
        daysUntilRenewal == null
          ? "No renewal date available for the current plan."
          : daysUntilRenewal < 0
            ? `${data.store.plan || "Current plan"} expired on ${formatDate(data.store.planExpiresAt)}.`
            : `${data.store.plan || "Current plan"} renews on ${formatDate(data.store.planExpiresAt)} (${daysUntilRenewal} days left).`,
      icon: CalendarClock,
      tone: daysUntilRenewal != null && daysUntilRenewal <= 7 ? "amber" : "cyan",
    },
    {
      title: "Stock alert",
      message: lowStockCount > 0 ? `${lowStockCount} product${lowStockCount === 1 ? "" : "s"} need restock attention.` : "Stock levels look healthy right now.",
      icon: PackageCheck,
      tone: lowStockCount > 0 ? "rose" : "emerald",
    },
    {
      title: "Invoice update",
      message: `${invoiceHighlight || "Active invoices: 0"}. Today's sales: ${todaysSales}.`,
      icon: ReceiptText,
      tone: "violet",
    },
  ];
  const notificationToneClass = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Store performance"
        title={data.store?.name || "MyReport"}
        description={`${data.store?.storeCode ? `Store ID: ${data.store.storeCode} | ` : ""}Stay on top of daily cashflow, fast movers, inventory risk, and plan usage.`}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((item, index) => (
          <MetricCard key={item.label} item={item} index={index} />
        ))}
      </div>
      <div className="grid max-w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Revenue Graph" description="Recent revenue performance for your store.">
          <div className="h-72 w-full max-w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="adminRevenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#4fd1c5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4fd1c5" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(26,16,53,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }} />
                <Area type="monotone" dataKey="value" stroke="#4fd1c5" strokeWidth={2.5} fill="url(#adminRevenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <TopSalesChart items={data.topSales} />
      </div>
      <div className="grid max-w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Notifications</div>
              <h3 className="mt-2 text-lg font-bold text-gray-900">Store alerts</h3>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-teal-700">
              <BellRing size={18} />
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {dashboardNotifications.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${notificationToneClass[item.tone]}`}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900">{item.title}</div>
                    <div className="mt-1 text-sm leading-5 text-gray-600">{item.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Workspace Highlights</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-sm text-slate-700 shadow-sm">
                {highlight}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-cyan-200/50 bg-cyan-50/40 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-teal-800">Current plan</div>
            <div className="mt-2 text-2xl font-semibold">{data.store.plan}</div>
            {data.store?.storeCode ? <div className="mt-1 text-sm font-semibold text-[var(--primary)]">Store ID: {data.store.storeCode}</div> : null}
            <div className="mt-1 text-sm text-[var(--muted)]">Renews on {formatDate(data.store.planExpiresAt)}</div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

export function AdminCustomersScreen() {
  const loader = useMemo(() => adminService.getCustomers, []);
  const { data, setData, loading } = useAsyncLoader(loader, { items: [] });
  const [query, setQuery] = useState("");
  const [nameSort, setNameSort] = useState("asc");
  const [exporting, setExporting] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    mobileNumber: false,
    city: false,
  });
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    city: "",
    blocked: false,
  });

  const reloadCustomers = async (options = {}) => {
    const silent = options?.silent === true;
    if (exporting && !silent) return;
    if (!silent) {
      setExporting("refresh");
    }
    try {
      const response = await adminService.getCustomers();
      setData(response);
      if (!silent) {
        toast.success("Customers refreshed");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to refresh customers");
    } finally {
      if (!silent) {
        setExporting(null);
      }
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    const filtered = data.items.filter((item) =>
      [item.fullName, item.email, item.mobileNumber, item.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );

    return [...filtered].sort((a, b) => {
      const aName = String(a.fullName || "");
      const bName = String(b.fullName || "");
      return nameSort === "desc" ? bName.localeCompare(aName) : aName.localeCompare(bName);
    });
  }, [data.items, nameSort, normalizedQuery]);

  const fieldErrors = useMemo(() => {
    const errors = {};
    const fullName = form.fullName.trim().replace(/\s+/g, " ");
    const email = form.email.trim();
    const mobileNumber = form.mobileNumber.trim();
    const city = form.city.trim().replace(/\s+/g, " ");

    if (!fullName) {
      errors.fullName = "Full name is required.";
    } else if (!CUSTOMER_NAME_REGEX.test(fullName) || isLikelyDummyText(fullName)) {
      errors.fullName = "Customer name must be 3–40 characters and contain only letters.";
    }

    if (!email) {
      errors.email = "Please enter a valid .com email address.";
    } else if (!STRONG_EMAIL_REGEX.test(email) || email.includes("..")) {
      errors.email = "Please enter a valid .com email address.";
    }

    if (!mobileNumber) {
      errors.mobileNumber = "Mobile number is required.";
    } else if (!MOBILE_REGEX.test(mobileNumber) || REPEATED_DIGIT_MOBILE_REGEX.test(mobileNumber)) {
      errors.mobileNumber = "Please enter a valid 10-digit mobile number.";
    }

    if (!city) {
      errors.city = "City is required.";
    } else if (!CUSTOMER_CITY_REGEX.test(city) || isLikelyDummyText(city)) {
      errors.city = "Please enter a valid city name.";
    }
    return errors;
  }, [form]);

  const exportCustomersPdf = async () => {
    setExporting("pdf");
    try {
      await exportTablePdf({
        fileName: "customers-report.pdf",
        reportTitle: "Customers Report",
        rows: filteredItems,
        columns: [
          { key: "fullName", label: "Customer Name" },
          { key: "email", label: "Email" },
          { key: "mobileNumber", label: "Mobile" },
          { key: "category", label: "Category", value: () => "" },
          { key: "price", label: "Price", value: () => "" },
          { key: "quantity", label: "Quantity", value: () => "" },
          { key: "status", label: "Status", value: (row) => (row.blocked ? "BLOCKED" : "ACTIVE") },
          { key: "createdAt", label: "Created Date", type: "date" },
        ],
      });
      toast.success("Export completed successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export PDF");
    } finally {
      setExporting(null);
    }
  };

  const exportCustomersExcel = async () => {
    setExporting("excel");
    try {
      await exportTableExcel({
        fileName: "customers-report.xlsx",
        sheetName: "Customers",
        rows: filteredItems,
        columns: [
          { key: "fullName", label: "Customer Name" },
          { key: "email", label: "Email" },
          { key: "mobileNumber", label: "Mobile" },
          { key: "category", label: "Category", value: () => "" },
          { key: "price", label: "Price", value: () => "" },
          { key: "quantity", label: "Quantity", value: () => "" },
          { key: "status", label: "Status", value: (row) => (row.blocked ? "BLOCKED" : "ACTIVE") },
          { key: "createdAt", label: "Created Date", type: "date" },
        ],
      });
      toast.success("Export completed successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export Excel");
    } finally {
      setExporting(null);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ fullName: "", email: "", mobileNumber: "", city: "", blocked: false });
    setSubmitted(false);
    setTouched({ fullName: false, email: false, mobileNumber: false, city: false });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      fullName: item.fullName,
      email: item.email,
      mobileNumber: item.mobileNumber,
      city: item.city,
      blocked: item.blocked,
    });
    setSubmitted(false);
    setTouched({ fullName: false, email: false, mobileNumber: false, city: false });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setTouched({ fullName: true, email: true, mobileNumber: true, city: true });
    if (Object.keys(fieldErrors).length) {
      toast.error(fieldErrors.email || Object.values(fieldErrors)[0] || "Please check your inputs.");
      return;
    }
    try {
      const payload = {
        ...form,
        fullName: form.fullName.trim().replace(/\s+/g, " "),
        email: form.email.trim(),
        mobileNumber: form.mobileNumber.trim(),
        city: form.city.trim().replace(/\s+/g, " "),
      };
      await (editingItem ? adminService.updateCustomer(editingItem.id, payload) : adminService.createCustomer(payload));
      await reloadCustomers({ silent: true });
      toast.success(editingItem ? "Customer updated" : "Customer created");
      setModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save customer.");
    }
  };

  const handleToggleBlock = async (customerId) => {
    try {
      await adminService.toggleCustomerBlock(customerId);
      await reloadCustomers({ silent: true });
    } catch (error) {
      toast.error(error?.message || "Failed to update customer status.");
    }
  };

  const handleDelete = async (customerId) => {
    try {
      await adminService.deleteCustomer(customerId);
      await reloadCustomers({ silent: true });
      toast.success("Customer deleted");
    } catch (error) {
      toast.error(error?.message || "Failed to delete customer.");
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="CRM"
        title="Customers"
        description="Manage profiles, purchase activity, and customer access in one clean table."
        action={
          <>
            <DownloadToolbar
              onRefresh={reloadCustomers}
              onExportPdf={exportCustomersPdf}
              onExportExcel={exportCustomersExcel}
              exporting={exporting}
              className="w-full lg:w-auto"
            />
            <ControlButton variant="primary" onClick={openCreate}>
              <span className="inline-flex items-center gap-2"><Plus size={16} /> Add Customer</span>
            </ControlButton>
          </>
        }
      />

      <GlassPanel className="p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
          <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-cyan-100/30 via-white/20 to-violet-100/25 px-4 py-3 shadow-[0_6px_20px_rgba(148,163,184,0.16)] transition-all duration-300 focus-within:border-cyan-300/80 focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.15)]">
            <Search size={18} className="shrink-0 text-teal-600" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer, city, email, or mobile"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
            />
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-cyan-200/45 bg-gradient-to-r from-cyan-100/30 via-white/15 to-violet-100/30 px-3 py-2.5 text-sm text-slate-700 shadow-[0_6px_20px_rgba(148,163,184,0.14)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(99,102,241,0.16)] focus-within:border-cyan-300/80 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]">
            <span className="shrink-0 text-xs font-semibold tracking-[0.12em] text-slate-600">Sort By</span>
            <select
              value={nameSort}
              onChange={(event) => setNameSort(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
            >
              <option value="asc" className="bg-slate-900 text-white">Name (A-Z)</option>
              <option value="desc" className="bg-slate-900 text-white">Name (Z-A)</option>
            </select>
          </label>
        </div>
      </GlassPanel>

      <DataTable
        columns={[
          { key: "fullName", label: "Customer" },
          { key: "email", label: "Email" },
          { key: "mobileNumber", label: "Mobile" },
          { key: "city", label: "City" },
          { key: "totalSpent", label: "Spent", render: (value) => formatCurrency(value) },
          { key: "purchaseCount", label: "Orders" },
          { key: "blocked", label: "Status", render: (value) => <StatusBadge value={value ? "BLOCKED" : "ACTIVE"} /> },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max items-center gap-[10px]">
                  <Link
                    href={`/admin/customers/${row.id}`}
                    className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl border border-slate-200/90 bg-white/80 px-3.5 text-xs font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:bg-white"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl border border-slate-200/90 bg-white/80 px-3.5 text-xs font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:bg-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleBlock(row.id)}
                    className={[
                      "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl px-3.5 text-xs font-semibold transition-all duration-300",
                      "hover:-translate-y-[2px]",
                      row.blocked
                        ? "border border-indigo-300/35 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-[0_6px_14px_rgba(59,130,246,0.28)] hover:brightness-105 hover:shadow-[0_10px_20px_rgba(99,102,241,0.16)]"
                        : "border border-slate-200/90 bg-white/80 text-slate-700 hover:bg-white hover:shadow-[0_10px_20px_rgba(99,102,241,0.16)]",
                    ].join(" ")}
                  >
                    {row.blocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 px-3.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-[2px] hover:brightness-105 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.99]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ),
          },
        ]}
        rows={filteredItems}
        pageSize={4}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Edit Customer" : "Add Customer"}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={(event) => {
                setTouched((previous) => ({ ...previous, fullName: true }));
                setForm((previous) => ({ ...previous, fullName: event.target.value }));
              }}
              required
              minLength={3}
              maxLength={40}
              inputClassName={
                touched.fullName || submitted
                  ? fieldErrors.fullName
                    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-300/70"
                    : "border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/70"
                  : ""
              }
              helper={touched.fullName || submitted ? fieldErrors.fullName : ""}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => {
                setTouched((previous) => ({ ...previous, email: true }));
                setForm((previous) => ({ ...previous, email: event.target.value }));
              }}
              required
              maxLength={120}
              inputClassName={
                touched.email || submitted
                  ? fieldErrors.email
                    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-300/70"
                    : "border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/70"
                  : ""
              }
              helper={touched.email || submitted ? fieldErrors.email : ""}
            />
            <FormField
              label="Mobile Number"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={(event) => {
                setTouched((previous) => ({ ...previous, mobileNumber: true }));
                setForm((previous) => ({ ...previous, mobileNumber: event.target.value.replace(/\D/g, "").slice(0, 10) }));
              }}
              required
              inputMode="numeric"
              minLength={10}
              maxLength={10}
              inputClassName={
                touched.mobileNumber || submitted
                  ? fieldErrors.mobileNumber
                    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-300/70"
                    : "border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/70"
                  : ""
              }
              helper={touched.mobileNumber || submitted ? fieldErrors.mobileNumber : ""}
            />
            <FormField
              label="City"
              name="city"
              value={form.city}
              onChange={(event) => {
                setTouched((previous) => ({ ...previous, city: true }));
                setForm((previous) => ({ ...previous, city: event.target.value }));
              }}
              required
              minLength={3}
              maxLength={30}
              inputClassName={
                touched.city || submitted
                  ? fieldErrors.city
                    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-300/70"
                    : "border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/70"
                  : ""
              }
              helper={touched.city || submitted ? fieldErrors.city : ""}
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-600">
            <input type="checkbox" checked={form.blocked} onChange={(event) => setForm((previous) => ({ ...previous, blocked: event.target.checked }))} />
            Mark customer as blocked
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ControlButton onClick={() => setModalOpen(false)}>Cancel</ControlButton>
            <ControlButton type="submit" variant="primary">{editingItem ? "Save Customer" : "Create Customer"}</ControlButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function AdminProductsScreen() {
  const loader = useMemo(() => adminService.getProducts, []);
  const { data, setData, loading } = useAsyncLoader(loader, { items: [] });
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "PIECE",
    active: true,
  });

  const reloadProducts = async (options = {}) => {
    const silent = options?.silent === true;
    if (exporting && !silent) return;
    if (!silent) {
      setExporting("refresh");
    }
    try {
      const response = await adminService.getProducts();
      setData(response);
      if (!silent) {
        toast.success("Products refreshed");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to refresh products");
    } finally {
      if (!silent) {
        setExporting(null);
      }
    }
  };

  const filteredItems = data.items.filter((item) =>
    [item.name, item.category].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const exportProductsPdf = async () => {
    setExporting("pdf");
    try {
      await exportTablePdf({
        fileName: "products-report.pdf",
        reportTitle: "Products Report",
        rows: filteredItems,
        columns: [
          { key: "name", label: "Product Name" },
          { key: "unit", label: "Unit", value: (row) => row.unit || "" },
          { key: "price", label: "Price", value: (row) => row.price },
          { key: "quantity", label: "Quantity", value: (row) => row.quantity },
          { key: "status", label: "Stock Status", value: (row) => getStockHealthStatus(row.quantity) },
          { key: "createdAt", label: "Created Date", type: "date" },
        ],
      });
      toast.success("Export completed successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export PDF");
    } finally {
      setExporting(null);
    }
  };

  const exportProductsExcel = async () => {
    setExporting("excel");
    try {
      await exportTableExcel({
        fileName: "products-report.xlsx",
        sheetName: "Products",
        rows: filteredItems,
        columns: [
          { key: "name", label: "Product Name" },
          { key: "unit", label: "Unit", value: (row) => row.unit || "" },
          { key: "price", label: "Price", value: (row) => row.price },
          { key: "quantity", label: "Quantity", value: (row) => row.quantity },
          { key: "status", label: "Stock Status", value: (row) => getStockHealthStatus(row.quantity) },
          { key: "createdAt", label: "Created Date", type: "date" },
        ],
      });
      toast.success("Export completed successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export Excel");
    } finally {
      setExporting(null);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: "",
      price: "",
      quantity: "",
      unit: "PIECE",
      active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      active: item.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      await (editingItem ? adminService.updateProduct(editingItem.id, payload) : adminService.createProduct(payload));
      await reloadProducts({ silent: true });
      toast.success(editingItem ? "Product updated" : "Product created");
      setModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save product.");
    }
  };

  const handleDelete = async (productId) => {
    try {
      await adminService.deleteProduct(productId);
      await reloadProducts({ silent: true });
      toast.success("Product deleted");
    } catch (error) {
      toast.error(error?.message || "Failed to delete product.");
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Inventory"
        title="Products"
        description="Maintain pricing, stock units, and quantity status in one clean catalog."
        action={
          <>
            <DownloadToolbar
              onRefresh={reloadProducts}
              onExportPdf={exportProductsPdf}
              onExportExcel={exportProductsExcel}
              exporting={exporting}
              className="w-full lg:w-auto"
            />
            <ControlButton variant="primary" onClick={openCreate}>
              <span className="inline-flex items-center gap-2"><Plus size={16} /> Add Product</span>
            </ControlButton>
          </>
        }
      />

      <GlassPanel className="p-5">
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-cyan-100/30 via-white/20 to-violet-100/25 px-4 py-3 shadow-[0_6px_20px_rgba(148,163,184,0.16)]">
          <Search size={16} className="shrink-0 text-teal-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </GlassPanel>
      <DataTable
        columns={[
          { key: "name", label: "Product" },
          { key: "unit", label: "Unit" },
          { key: "quantity", label: "Qty" },
          { key: "price", label: "Price", render: (value) => formatCurrency(value) },
          {
            key: "stockHealth",
            label: "Stock Health",
            cellClassName: "align-middle",
            render: (_, row) => <StockHealthBadge quantity={row.quantity} />,
          },
          {
            key: "actions",
            label: "Actions",
            headerClassName: "text-right",
            cellClassName: "text-right",
            render: (_, row) => (
              <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                <button type="button" onClick={() => openEdit(row)} className="rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2 text-xs font-semibold text-slate-700">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.01] hover:brightness-105 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.99]"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        rows={filteredItems}
        pageSize={4}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Edit Product" : "Add Product"}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <FormField label="Product Name" name="name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} required inputClassName="h-12" />
            <FormField label="Price" name="price" type="number" value={form.price} onChange={(event) => setForm((previous) => ({ ...previous, price: event.target.value }))} required inputClassName="h-12" />
            <FormField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={(event) => setForm((previous) => ({ ...previous, quantity: event.target.value }))} required inputClassName="h-12" />
            <SelectField
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={(event) => setForm((previous) => ({ ...previous, unit: event.target.value }))}
              options={["KG", "GRAM", "LITRE", "ML", "PIECE", "BOX"].map((unit) => ({ label: unit, value: unit }))}
            />
          </div>
          <label className="mt-1 inline-flex items-center gap-3 text-sm text-slate-600">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm((previous) => ({ ...previous, active: event.target.checked }))} className="h-4 w-4 rounded border border-cyan-300/60 accent-cyan-400" />
            Product is active
          </label>
          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ControlButton onClick={() => setModalOpen(false)}>Cancel</ControlButton>
            <ControlButton type="submit" variant="primary">{editingItem ? "Save Product" : "Create Product"}</ControlButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function AdminBillingScreen() {
  const customersLoader = useMemo(() => adminService.getCustomers, []);
  const productsLoader = useMemo(() => adminService.getProducts, []);
  const { data: customersData, setData: setCustomersData, loading: customersLoading } = useAsyncLoader(customersLoader, { items: [] });
  const { data: productsData, setData: setProductsData, loading: productsLoading } = useAsyncLoader(productsLoader, { items: [] });
  const [rows, setRows] = useState([{ id: 1, productId: "", productSearch: "", quantity: 1 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(0);
  const [openProductRowId, setOpenProductRowId] = useState(null);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState("Thank you for choosing MyReport POS.");
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [nextRowId, setNextRowId] = useState(2);
  const [exporting, setExporting] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const loading = customersLoading || productsLoading;
  const productItems = productsData.items || [];
  const activeProducts = productItems.filter((item) => item.active !== false);
  const productLabel = (product) => product ? `${product.name} (${product.unit})` : "";

  const lineItems = rows
    .map((row) => {
      const product = productItems.find((item) => String(item.id) === row.productId);
      if (!product) {
        return null;
      }
      return {
        ...row,
        productId: String(product.id),
        productName: product.name,
        unit: product.unit,
        availableQuantity: Number(product.quantity || 0),
        rate: Number(product.price),
        total: Number(product.price) * Number(row.quantity || 0),
      };
    })
    .filter(Boolean);
  const selectedCustomer = customersData.items.find(
    (item) => String(item.fullName || "").toLowerCase() === String(customerName || "").toLowerCase()
  );

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * Number(gstPercentage || 0)) / 100;
  const percentageDiscount = ((subtotal + taxAmount) * Number(discountValue || 0)) / 100;
  const rupeesDiscount = Number(discountValue || 0);
  const normalizedDiscountAmount = discountType === "PERCENTAGE" ? percentageDiscount : rupeesDiscount;
  const discountAmount = Math.max(0, Math.min(normalizedDiscountAmount, subtotal + taxAmount));
  const totalAmount = subtotal + taxAmount - discountAmount;
  const normalizedCustomerSearch = customerSearch.trim().toLowerCase();
  const filteredCustomers = customersData.items.filter((item) =>
    String(item.fullName || "").toLowerCase().includes(normalizedCustomerSearch)
  );
  const requestedQuantityByProduct = rows.reduce((accumulator, row) => {
    if (!row.productId) return accumulator;
    const quantity = Number(row.quantity || 0);
    accumulator[row.productId] = (accumulator[row.productId] || 0) + (Number.isFinite(quantity) ? quantity : 0);
    return accumulator;
  }, {});

  const filteredProductsForRow = (row) => {
    const query = String(row.productSearch || "").trim().toLowerCase();
    if (!query) return activeProducts;
    return activeProducts.filter((product) =>
      `${product.name} ${product.unit} ${product.price}`.toLowerCase().includes(query)
    );
  };

  const getRowStockWarning = (row) => {
    const product = productItems.find((item) => String(item.id) === row.productId);
    if (!product) return "";
    const requestedQuantity = Number(requestedQuantityByProduct[row.productId] || 0);
    const availableQuantity = Number(product.quantity || 0);
    if (requestedQuantity > availableQuantity) {
      return `Only ${availableQuantity.toLocaleString("en-IN")} ${product.unit} available.`;
    }
    return "";
  };

  const validateBillBeforeSubmit = () => {
    if (!customerName || !lineItems.length) {
      return "Select a customer and at least one product";
    }

    for (const [index, row] of rows.entries()) {
      if (!row.productId) {
        return `Select a product for Product ${index + 1}.`;
      }
      const quantity = Number(row.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return `Enter a valid quantity for Product ${index + 1}.`;
      }
    }

    for (const [productId, requestedQuantity] of Object.entries(requestedQuantityByProduct)) {
      const product = productItems.find((item) => String(item.id) === productId);
      if (!product) {
        return "Selected product is no longer available. Refresh the billing workspace.";
      }
      const availableQuantity = Number(product.quantity || 0);
      if (requestedQuantity > availableQuantity) {
        return `Insufficient stock for ${product.name}. Available: ${availableQuantity.toLocaleString("en-IN")} ${product.unit}, requested: ${requestedQuantity.toLocaleString("en-IN")} ${product.unit}.`;
      }
    }

    return "";
  };

  const refreshWorkspace = async () => {
    setExporting("refresh");
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        adminService.getCustomers(),
        adminService.getProducts(),
      ]);
      setCustomersData(customersResponse);
      setProductsData(productsResponse);
      toast.success("Workspace refreshed");
    } catch (error) {
      toast.error(error?.message || "Failed to refresh workspace.");
    } finally {
      setExporting(null);
    }
  };

  const exportBillPdf = async () => {
    setExporting("pdf");
    try {
      await exportTablePdf({
        fileName: "billing-report.pdf",
        reportTitle: "Billing Report",
        rows: lineItems,
        columns: [
          { key: "productName", label: "Product" },
          { key: "email", label: "Email", value: () => "" },
          { key: "mobile", label: "Mobile", value: () => "" },
          { key: "category", label: "Category", value: () => "" },
          { key: "rate", label: "Price", value: (row) => row.rate },
          { key: "quantity", label: "Quantity", value: (row) => row.quantity },
          { key: "status", label: "Status", value: () => invoiceResult?.status || "DRAFT" },
          { key: "createdAt", label: "Created Date", type: "date", value: () => new Date().toISOString() },
        ],
      });
      toast.success("Export completed successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export PDF");
    } finally {
      setExporting(null);
    }
  };

  const exportBillExcel = async () => {
    setExporting("excel");
    try {
      await exportTableExcel({
        fileName: "billing-report.xlsx",
        sheetName: "Billing",
        rows: lineItems,
        columns: [
          { key: "productName", label: "Product" },
          { key: "email", label: "Email", value: () => "" },
          { key: "mobile", label: "Mobile", value: () => "" },
          { key: "category", label: "Category", value: () => "" },
          { key: "rate", label: "Price", value: (row) => row.rate },
          { key: "quantity", label: "Quantity", value: (row) => row.quantity },
          { key: "status", label: "Status", value: () => invoiceResult?.status || "DRAFT" },
          { key: "createdAt", label: "Created Date", type: "date", value: () => new Date().toISOString() },
        ],
      });
      toast.success("Export completed successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export Excel");
    } finally {
      setExporting(null);
    }
  };

  const handleGenerate = async () => {
    const billingError = validateBillBeforeSubmit();
    if (billingError) {
      toast.error(billingError);
      return;
    }
    if (discountType === "PERCENTAGE" && (Number(discountValue) < 0 || Number(discountValue) > 100)) {
      toast.error("Percentage discount must be between 0 and 100.");
      return;
    }
    if (discountType === "RUPEES" && Number(discountValue) > subtotal + taxAmount) {
      toast.error("Rupees discount cannot exceed subtotal plus GST.");
      return;
    }

    const payload = {
      customerName,
      gstPercentage: Number(gstPercentage),
      discountAmount: Number(discountAmount),
      notes,
      items: lineItems.map((item) => ({
        productId: Number(item.productId),
        productName: item.productName,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };

    try {
      const response = await adminService.createInvoice(payload);
      setInvoiceResult({ ...response, totalAmount: response.totalAmount || totalAmount });
      try {
        const productsResponse = await adminService.getProducts();
        setProductsData(productsResponse);
      } catch {
        toast.error("Invoice generated, but stock refresh failed. Refresh the workspace to see latest stock.");
      }
      sessionStorage.setItem("myreport:billing-updated-at", String(Date.now()));
      window.dispatchEvent(new Event("myreport:billing-updated"));
      toast.success("Invoice generated successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to generate invoice.");
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading
          eyebrow="POS"
          title="Billing Workspace"
          description="Create a customer bill with GST, discounts, print flow, and invoice generation."
          action={null}
        />
        <div className="mt-6 grid gap-4">
          <div className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-strong)]">Customer</span>
            <div className="relative">
              <input
                value={customerSearch}
                onChange={(event) => {
                  setCustomerSearch(event.target.value);
                  setCustomerDropdownOpen(true);
                  setActiveCustomerIndex(0);
                }}
                onFocus={() => setCustomerDropdownOpen(true)}
                onKeyDown={(event) => {
                  if (!customerDropdownOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                    setCustomerDropdownOpen(true);
                    return;
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveCustomerIndex((previous) => Math.min(previous + 1, Math.max(filteredCustomers.length - 1, 0)));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveCustomerIndex((previous) => Math.max(previous - 1, 0));
                  }
                  if (event.key === "Enter" && customerDropdownOpen && filteredCustomers[activeCustomerIndex]) {
                    event.preventDefault();
                    const selected = filteredCustomers[activeCustomerIndex];
                    setCustomerName(selected.fullName);
                    setCustomerSearch(selected.fullName);
                    setCustomerDropdownOpen(false);
                  }
                  if (event.key === "Escape") {
                    setCustomerDropdownOpen(false);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setCustomerDropdownOpen(false), 120);
                }}
                placeholder="Search customer name..."
                className="theme-input h-12 w-full rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-cyan-100/25 via-white/15 to-violet-100/20 px-4 py-3 outline-none transition duration-300 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/40"
              />
              {customerDropdownOpen ? (
                <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-cyan-200/70 bg-white p-1 shadow-[0_16px_34px_rgba(15,23,42,0.14)]">
                  {filteredCustomers.length ? (
                    filteredCustomers.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={() => {
                          setCustomerName(item.fullName);
                          setCustomerSearch(item.fullName);
                          setCustomerDropdownOpen(false);
                        }}
                        className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                          index === activeCustomerIndex
                            ? "bg-cyan-50 text-teal-800 ring-1 ring-cyan-200/70"
                            : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        {item.fullName}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2.5 text-sm font-medium text-slate-500">No matching customers</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-4 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 lg:grid-cols-[1.4fr_0.6fr_auto]">
              <ProductSearchField
                label={`Product ${index + 1}`}
                value={row.productSearch || productLabel(productItems.find((item) => String(item.id) === row.productId))}
                placeholder="Search product name..."
                options={filteredProductsForRow(row)}
                open={openProductRowId === row.id}
                activeIndex={activeProductIndex}
                onChange={(event) => {
                  const searchValue = event.target.value;
                  setRows((previous) =>
                    previous.map((entry) =>
                      entry.id === row.id ? { ...entry, productId: "", productSearch: searchValue } : entry
                    )
                  );
                  setOpenProductRowId(row.id);
                  setActiveProductIndex(0);
                  setInvoiceResult(null);
                }}
                onFocus={() => {
                  setOpenProductRowId(row.id);
                  setActiveProductIndex(0);
                }}
                onBlur={() => {
                  setTimeout(() => setOpenProductRowId(null), 120);
                }}
                onKeyDown={(event) => {
                  const filteredProducts = filteredProductsForRow(row);
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setOpenProductRowId(row.id);
                    setActiveProductIndex((previous) => Math.min(previous + 1, Math.max(filteredProducts.length - 1, 0)));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setOpenProductRowId(row.id);
                    setActiveProductIndex((previous) => Math.max(previous - 1, 0));
                  }
                  if (event.key === "Enter" && filteredProducts[activeProductIndex]) {
                    event.preventDefault();
                    const selectedProduct = filteredProducts[activeProductIndex];
                    setRows((previous) =>
                      previous.map((entry) =>
                        entry.id === row.id
                          ? { ...entry, productId: String(selectedProduct.id), productSearch: productLabel(selectedProduct) }
                          : entry
                      )
                    );
                    setOpenProductRowId(null);
                    setInvoiceResult(null);
                  }
                  if (event.key === "Escape") {
                    setOpenProductRowId(null);
                  }
                }}
                onSelect={(product) => {
                  setRows((previous) =>
                    previous.map((entry) =>
                      entry.id === row.id
                        ? { ...entry, productId: String(product.id), productSearch: productLabel(product) }
                        : entry
                    )
                  );
                  setOpenProductRowId(null);
                  setInvoiceResult(null);
                }}
              />
              <FormField
                label="Quantity"
                name="quantity"
                type="number"
                value={row.quantity}
                onChange={(event) => {
                  setRows((previous) =>
                    previous.map((entry) => (entry.id === row.id ? { ...entry, quantity: event.target.value } : entry))
                  );
                  setInvoiceResult(null);
                }}
                required
                min={0.01}
                step="any"
                helper={getRowStockWarning(row)}
              />
              <div className="self-end">
                <button
                  type="button"
                  onClick={() => {
                    setRows((previous) => (previous.length === 1 ? previous : previous.filter((entry) => entry.id !== row.id)));
                    setInvoiceResult(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.01] hover:brightness-105 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.99]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div>
            <ControlButton
              className="w-full sm:w-auto"
              onClick={() => {
                setRows((previous) => [...previous, { id: nextRowId, productId: "", productSearch: "", quantity: 1 }]);
                setNextRowId((previous) => previous + 1);
                setInvoiceResult(null);
              }}
            >
              <span className="inline-flex items-center gap-2"><Plus size={16} /> Add Product</span>
            </ControlButton>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="GST %" name="gstPercentage" type="number" value={gstPercentage} onChange={(event) => setGstPercentage(event.target.value)} inputClassName="h-12" />
            <SelectField
              label="Discount Type"
              name="discountType"
              value={discountType}
              onChange={(event) => setDiscountType(event.target.value)}
              options={[
                { label: "% Percentage", value: "PERCENTAGE" },
                { label: "₹ Rupees", value: "RUPEES" },
              ]}
            />
            <FormField
              label="Discount Value"
              name="discountValue"
              type="number"
              value={discountValue}
              onChange={(event) => setDiscountValue(event.target.value)}
              min={0}
              max={discountType === "PERCENTAGE" ? 100 : Math.max(subtotal + taxAmount, 0)}
              inputClassName="h-12"
            />
          </div>
          <div className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-strong)]">Notes</span>
            <textarea
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add billing notes or customer message..."
              className="theme-input min-h-[100px] w-full rounded-2xl border border-cyan-200/35 bg-gradient-to-r from-cyan-100/20 via-white/10 to-violet-100/20 px-4 py-3 outline-none transition duration-300 focus:border-cyan-300/75 focus:ring-2 focus:ring-cyan-300/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <ControlButton variant="primary" className="w-auto" onClick={handleGenerate}>
              <span className="inline-flex items-center gap-2"><ShoppingCart size={16} /> Generate Bill</span>
            </ControlButton>
            <ControlButton
              className="w-auto"
              disabled={!invoiceResult || pdfGenerating}
              onClick={async () => {
                if (!invoiceResult) {
                  toast.error("Generate the bill first");
                  return;
                }

                setPdfGenerating(true);
                try {
                  printInvoice({
                    storeName: "MyReport",
                    invoiceNumber: invoiceResult?.invoiceNumber,
                    customerName,
                    customerMobile: selectedCustomer?.mobileNumber || "",
                    customerAddress: selectedCustomer?.city || "",
                    createdAt: invoiceResult?.createdAt || new Date().toISOString(),
                    items: lineItems,
                    gstPercentage: Number(gstPercentage || 0),
                    discountAmount: Number(discountAmount || 0),
                    subtotal,
                    taxAmount,
                    totalAmount,
                    notes,
                  });
                  toast.success("Print preview opened");
                } catch (error) {
                  toast.error(error?.message || "Failed to open print preview");
                } finally {
                  setPdfGenerating(false);
                }
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Printer size={16} />
                {pdfGenerating ? "Generating PDF..." : "Print Bill"}
              </span>
            </ControlButton>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading eyebrow="Invoice preview" title={invoiceResult?.invoiceNumber || "Live bill summary"} description="Preview totals before printing or exporting." />
        <div className="mt-6 grid gap-4">
          {lineItems.length ? (
            lineItems.map((item) => (
              <div key={`${item.productName}-${item.id}`} className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/90 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{item.productName}</div>
                  <div className="text-[var(--muted)]">{item.quantity} x {formatCurrency(item.rate)}</div>
                </div>
                <div className="font-semibold">{formatCurrency(item.total)}</div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 text-sm text-[var(--muted)]">Add products to build a bill.</div>
          )}

          <div className="rounded-3xl border border-slate-200/80 bg-white/75 p-5">
            <div className="flex items-center justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600"><span>GST</span><span>{formatCurrency(taxAmount)}</span></div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600"><span>Discount</span><span>{formatCurrency(discountAmount)}</span></div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-4 text-lg font-semibold text-[var(--foreground)]"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div>
          </div>

          {invoiceResult ? (
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={16} />
                Invoice created: {invoiceResult.invoiceNumber}
              </div>
              <div className="mt-2 text-sm text-slate-600">Grand total {formatCurrency(invoiceResult.totalAmount || totalAmount)}</div>
            </div>
          ) : null}
        </div>
      </GlassPanel>
    </div>
  );
}

export function AdminInvoicesScreen() {
  const loader = useMemo(() => adminService.getInvoices, []);
  const { data, setData, loading } = useAsyncLoader(loader, { items: [] });
  const [exporting, setExporting] = useState(null);

  const reloadInvoices = async (options = {}) => {
    const silent = options?.silent === true;
    if (exporting && !silent) return;
    if (!silent) {
      setExporting("refresh");
    }
    try {
      const response = await adminService.getInvoices();
      setData(response);
      if (!silent) {
        toast.success("Invoices refreshed");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to refresh invoices");
    } finally {
      if (!silent) {
        setExporting(null);
      }
    }
  };

  const exportInvoicesPdf = async () => {
    setExporting("pdf");
    try {
      await exportTablePdf({
        fileName: "invoices-report.pdf",
        reportTitle: "Invoices Report",
        rows: data.items,
        columns: [
          { key: "invoiceNumber", label: "Invoice" },
          { key: "customerName", label: "Customer" },
          { key: "email", label: "Email", value: () => "" },
          { key: "mobile", label: "Mobile", value: () => "" },
          { key: "category", label: "Category", value: () => "" },
          { key: "subtotal", label: "Subtotal", value: (row) => row.subtotal },
          { key: "totalAmount", label: "Total", value: (row) => row.totalAmount },
          { key: "status", label: "Status", value: (row) => row.status },
          { key: "createdAt", label: "Created Date", type: "date" },
        ],
      });
      toast.success("Export completed successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to export PDF");
    } finally {
      setExporting(null);
    }
  };

  const exportInvoicesExcel = async () => {
    setExporting("excel");
    try {
      const normalizePaymentStatus = (status) => {
        const normalized = String(status || "").toUpperCase();
        if (normalized === "PAID" || normalized === "PENDING" || normalized === "FAILED") {
          return normalized;
        }
        return "PENDING";
      };

      await exportTableExcel({
        fileName: "invoices-report.xlsx",
        sheetName: "Invoices",
        rows: data.items,
        columns: [
          { key: "invoiceNumber", label: "Invoice Number" },
          { key: "customerName", label: "Customer Name" },
          { key: "subtotal", label: "Subtotal", value: (row) => row.subtotal },
          { key: "totalAmount", label: "Total Amount", value: (row) => row.totalAmount },
          { key: "status", label: "Payment Status", value: (row) => normalizePaymentStatus(row.status) },
          { key: "createdAt", label: "Created Date", type: "date" },
        ],
      });
      toast.success("Export completed successfully");
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
        eyebrow="Ledger"
        title="Invoices"
        description="Browse generated bills, GST summaries, and payment completion history."
        action={
          <DownloadToolbar
            onRefresh={reloadInvoices}
            onExportPdf={exportInvoicesPdf}
            onExportExcel={exportInvoicesExcel}
            exporting={exporting}
            className="w-full lg:w-auto"
          />
        }
      />
      <DataTable
        columns={[
          { key: "invoiceNumber", label: "Invoice" },
          { key: "customerName", label: "Customer" },
          { key: "subtotal", label: "Subtotal", render: (value) => formatCurrency(value) },
          { key: "taxAmount", label: "GST", render: (value) => formatCurrency(value) },
          { key: "totalAmount", label: "Total", render: (value) => formatCurrency(value) },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
          { key: "createdAt", label: "Date", render: (value) => formatDate(value) },
        ]}
        rows={data.items}
        pageSize={4}
      />
    </div>
  );
}

export function AdminPlanScreen() {
  const loader = useMemo(() => adminService.getPlan, []);
  const { data, setData, loading } = useAsyncLoader(loader, { plan: null });
  const [orderState, setOrderState] = useState(null);
  const [paying, setPaying] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedRenewPlanId, setSelectedRenewPlanId] = useState("");

  const currentPlanName = String(data.plan?.name || "").toUpperCase();

  const openRenewModal = async () => {
    setPlansModalOpen(true);
    setPlansLoading(true);
    try {
      const response = await publicPlanService.getPlans();
      const plans =
        (Array.isArray(response) && response) ||
        response?.items ||
        response?.data?.items ||
        [];
      setAvailablePlans(plans);
      const defaultSelected =
        plans.find((item) => String(item.name || "").toUpperCase() === currentPlanName)?.id ||
        plans[0]?.id ||
        "";
      setSelectedRenewPlanId(String(defaultSelected || ""));
    } catch (error) {
      toast.error(error?.message || "Unable to load plans.");
    } finally {
      setPlansLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!data.plan) {
      return;
    }
    const selectedPlan = availablePlans.find((plan) => String(plan.id) === String(selectedRenewPlanId));
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    setPaying(true);
    try {
      const amount = Number(selectedPlan.monthlyPrice ?? selectedPlan.price ?? 0);
      const response = await createPayUOrder({
        planName: selectedPlan.planName || selectedPlan.name,
        amount,
      });

      setOrderState(response);

      if (!response?.configured || !response?.paymentUrl || !response?.formFields) {
        toast.error("PayU is not configured on server. Add valid PayU keys in server.");
        return;
      }

      toast.message("Redirecting to PayU checkout...");
      submitPayUCheckout(response);
    } catch (e) {
      toast.error(e?.message || "Failed to open PayU checkout");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={2} />;
  }

  if (!data.plan) {
    return <LoadingSkeleton rows={1} />;
  }

  return (
    <div className="grid max-w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <GlassPanel className="p-5 sm:p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Current subscription</div>
        <h2 className="mt-3 text-3xl font-bold text-gray-900">{data.plan.name}</h2>
        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-gray-600">{data.plan.description}</p>
        <div className="mt-6 text-4xl font-bold text-gray-900">
          {data.plan.freeTrial ? "Rs. 0" : formatCurrency(data.plan.monthlyPrice)}
          <span className="text-base font-semibold text-gray-500"> / {data.plan.duration}</span>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-cyan-200/70 bg-cyan-50/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Current Plan</div>
            <div className="mt-2 text-lg font-bold text-gray-900">{data.plan.name}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Plan Duration</div>
            <div className="mt-2 text-lg font-bold text-gray-900">{data.plan.duration}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">{data.plan.freeTrial ? "Expiry Date" : "Renewal Date"}</div>
            <div className="mt-2 text-lg font-bold text-gray-900">{formatDate(data.plan.expiresAt)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Days Left</div>
            <div className="mt-2 text-lg font-bold text-gray-900">{data.plan.daysLeft}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">Plan Started</div>
            <div className="mt-2 text-sm font-bold text-gray-900">{formatDate(data.plan.startedAt)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 text-sm font-semibold text-gray-700">Products limit: <span className="font-bold text-gray-900">{data.plan.maxProducts}</span></div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 text-sm font-semibold text-gray-700">Customers limit: <span className="font-bold text-gray-900">{data.plan.maxCustomers}</span></div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 text-sm font-semibold leading-6 text-gray-700 sm:col-span-2">{data.plan.features}</div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading eyebrow="PayU" title="Renew or upgrade" description="The server creates a secure PayU checkout request and verifies the returned hash before updating your plan." />
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 text-sm text-slate-600">
            Days left on current plan: <span className="font-semibold text-[var(--foreground)]">{data.plan.daysLeft}</span>
          </div>
          <ControlButton variant="primary" className="w-full sm:w-auto" onClick={openRenewModal}>
            {data.plan.freeTrial ? "Upgrade Plan" : "Renew with PayU"}
          </ControlButton>
          {orderState ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/75 p-5 text-sm text-slate-600">
              <div>Mode: {orderState.mode || (orderState.configured ? "live" : "demo")}</div>
              <div className="mt-2">Transaction ID: {orderState.txnid || orderState.orderId || "Created"}</div>
              <div className="mt-2">Gateway: {orderState.gateway || "PAYU"}</div>
            </div>
          ) : null}
        </div>
      </GlassPanel>

      <Modal open={plansModalOpen} onClose={() => setPlansModalOpen(false)} title="Choose Plan">
        <div className="grid gap-4">
          {plansLoading ? (
            <div className="text-sm text-slate-600">Loading plans...</div>
          ) : (
            <div className="grid gap-3">
              {availablePlans.map((plan) => {
                const isActive = String(plan.id) === String(selectedRenewPlanId);
                const isCurrent = String(plan.name || "").toUpperCase() === currentPlanName;
                const isFree = String(plan.name || "").toUpperCase() === "FREE TRIAL" || Number(plan.monthlyPrice ?? plan.price ?? 0) === 0;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedRenewPlanId(String(plan.id))}
                    className={`rounded-2xl border p-4 text-left transition ${isActive ? "border-cyan-300/70 bg-cyan-300/12" : "border-slate-200/90 bg-white/80 hover:bg-white"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-semibold">{plan.planName || plan.name}</div>
                      {isCurrent ? <span className="rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100">Current Plan</span> : null}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{plan.duration || (isFree ? "7 Days" : "1 Month")}</div>
                    <div className="mt-2 text-xl font-bold">{isFree ? "Rs. 0 / 7 Days" : `${formatCurrency(plan.monthlyPrice ?? plan.price ?? 0)} / month`}</div>
                    <div className="mt-2 text-sm text-slate-600">{plan.description}</div>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <ControlButton onClick={() => setPlansModalOpen(false)}>Cancel</ControlButton>
            <ControlButton variant="primary" onClick={handleUpgrade} disabled={paying || plansLoading || !selectedRenewPlanId}>
              {paying ? "Opening PayU..." : "Continue"}
            </ControlButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AdminReportsScreen() {
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [appliedFilters, setAppliedFilters] = useState({ startDate: "", endDate: "", range: "" });
  const [quickRange, setQuickRange] = useState("");
  const [exporting, setExporting] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const loader = useMemo(
    () => {
      const refreshNonce = refreshTick;
      return () => {
        void refreshNonce;
        return adminService.getReports(
          appliedFilters.startDate || undefined,
          appliedFilters.endDate || undefined,
          appliedFilters.range || undefined
        );
      };
    },
    [appliedFilters.endDate, appliedFilters.range, appliedFilters.startDate, refreshTick]
  );
  const { data, setData, loading } = useAsyncLoader(loader, { summary: {}, series: [] });

  const applyQuickRange = (range) => {
    setQuickRange(range);
    setFilters({ startDate: "", endDate: "" });
    setAppliedFilters({ startDate: "", endDate: "", range });
  };

  const handleExport = async (type) => {
    if (exporting) return;
    const startDate = appliedFilters.startDate || undefined;
    const endDate = appliedFilters.endDate || undefined;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("Please select a valid date range.");
      return;
    }
    if (!data?.series?.length) {
      toast.error("No data available");
      return;
    }

    setExporting(type);
    try {
      const fileBase = `myreport-admin-report-${startDate || "all"}-${endDate || "all"}`;
      const rows = data.series.map((item) => ({
        period: item.label,
        revenue: item.value,
        startDate: startDate || data?.range?.startDate || "",
        endDate: endDate || data?.range?.endDate || "",
      }));
      const columns = [
        { key: "period", label: "Period" },
        { key: "revenue", label: "Revenue" },
        { key: "startDate", label: "Start Date", type: "date" },
        { key: "endDate", label: "End Date", type: "date" },
      ];

      if (type === "excel") {
        await exportTableExcel({
          fileName: `${fileBase}.xlsx`,
          sheetName: "Reports",
          rows,
          columns,
        });
      } else {
        await exportTablePdf({
          fileName: `${fileBase}.pdf`,
          reportTitle: "Admin Reports",
          rows,
          columns,
        });
      }

      toast.success("Report downloaded");
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("no data")) {
        toast.error("No data available");
      } else if (message.includes("server")) {
        toast.error("Server export error");
      } else {
        toast.error("Failed to generate report");
      }
    } finally {
      setExporting(null);
    }
  };

  const handleRefresh = async () => {
    if (exporting) return;
    setExporting("refresh");
    try {
      setFilters({ startDate: "", endDate: "" });
      setAppliedFilters({ startDate: "", endDate: "", range: "" });
      setQuickRange("");
      const response = await adminService.getReports();
      setData(response);
      setRefreshTick((previous) => previous + 1);
      toast.success("Reports refreshed successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to refresh reports");
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
        eyebrow="Insights"
        title="Reports"
        description="Export clean store performance views by date range."
        action={
          <DownloadToolbar
            onRefresh={handleRefresh}
            onExportPdf={() => handleExport("pdf")}
            onExportExcel={() => handleExport("excel")}
            exporting={exporting}
            downloadDisabled={!data?.series?.length}
            className="w-full lg:w-auto"
          />
        }
      />

      <GlassPanel className="p-5">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[minmax(320px,1fr)_minmax(320px,1fr)_190px_120px] lg:items-end">
            <FormField
              label="Start Date"
              name="startDate"
              type="date"
              value={filters.startDate}
              className="w-full"
              inputClassName="h-12"
              onChange={(event) => {
                setQuickRange("");
                setFilters((previous) => ({ ...previous, startDate: event.target.value }));
              }}
            />
            <FormField
              label="End Date"
              name="endDate"
              type="date"
              value={filters.endDate}
              className="w-full"
              inputClassName="h-12"
              onChange={(event) => {
                setQuickRange("");
                setFilters((previous) => ({ ...previous, endDate: event.target.value }));
              }}
            />

            <ControlButton
              variant="primary"
              className="h-12 w-full"
              onClick={() => {
                setQuickRange("");
                setAppliedFilters({ ...filters, range: "" });
              }}
            >
              Apply Filters
            </ControlButton>
            <ControlButton
              className="h-12 w-full"
              onClick={() => {
                setQuickRange("");
                setFilters({ startDate: "", endDate: "" });
                setAppliedFilters({ startDate: "", endDate: "", range: "" });
              }}
            >
              Clear
            </ControlButton>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { key: "daily", label: "Daily" },
              { key: "weekly", label: "Weekly" },
              { key: "monthly", label: "Monthly" },
              { key: "yearly", label: "Yearly" },
            ].map((item) => {
              const active = quickRange === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => applyQuickRange(item.key)}
                  className={[
                    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
                    "ring-1 ring-white/10 backdrop-blur-md",
                    active
                      ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 text-white shadow-lg shadow-indigo-500/25 ring-white/20"
                      : "bg-white/6 text-slate-700 hover:bg-white/10 hover:text-slate-900 hover:shadow-lg hover:shadow-indigo-500/10",
                  ].join(" ")}
                  style={active ? { boxShadow: "0 0 0 1px rgba(255,255,255,0.16), 0 16px 40px rgba(99,102,241,0.28)" } : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard item={{ label: "Revenue", value: formatCurrency(data.summary.revenue || 0), helper: "Selected range", accent: "cyan" }} />
        <MetricCard item={{ label: "Invoices", value: String(data.summary.invoices || 0), helper: "Generated bills", accent: "emerald" }} />
        <MetricCard item={{ label: "Customers", value: String(data.summary.customers || 0), helper: "Customer base", accent: "violet" }} />
        <MetricCard item={{ label: "Products", value: String(data.summary.products || 0), helper: "Catalog size", accent: "amber" }} />
      </div>

      <ChartCard title="Revenue Trend" description="Weekly, monthly, and yearly views can all be driven from this reporting layer.">
        <div className="h-72 w-full max-w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.series}>
              <defs>
                <linearGradient id="adminReportsGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#7c8cff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c8cff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(26,16,53,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(26,16,53,0.48)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }} />
              <Area type="monotone" dataKey="value" stroke="#7c8cff" strokeWidth={2.5} fill="url(#adminReportsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

export function AdminSettingsScreen() {
  const dispatch = useDispatch();
  const loader = useMemo(() => adminService.getSettings, []);
  const { data, setData, loading } = useAsyncLoader(loader, {
    profile: {},
  });
  const [isEditing, setIsEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState({});
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

  const mediaBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, "");
  const avatarUrl = data.profile?.avatarUrl
    ? (String(data.profile.avatarUrl).startsWith("http") ? data.profile.avatarUrl : `${mediaBaseUrl}${data.profile.avatarUrl}`)
    : null;
  const profileView = isEditing ? draftProfile : data.profile;

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  const handleEditProfile = () => {
    setDraftProfile(data.profile || {});
    setIsEditing(true);
  };

  const handleCancelProfile = () => {
    setDraftProfile(data.profile || {});
    setIsEditing(false);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    const payload = {
      fullName: String(draftProfile.fullName || "").trim(),
      email: String(draftProfile.email || "").trim().toLowerCase(),
      mobileNumber: String(draftProfile.mobileNumber || "").trim(),
      city: String(draftProfile.city || "").trim(),
      address: String(draftProfile.address || "").trim(),
      storeName: String(draftProfile.storeName || "").trim(),
    };
    if (!payload.fullName || !payload.email || !payload.city || !payload.address || !payload.storeName) {
      toast.error("Please complete all required profile fields");
      return;
    }
    if (!STRONG_EMAIL_REGEX.test(payload.email)) {
      toast.error("Please enter a valid .com email address.");
      return;
    }
    if (!/^[0-9]{10}$/.test(payload.mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!FULL_ADDRESS_REGEX.test(payload.address)) {
      toast.error("Please enter a full address with at least 10 characters.");
      return;
    }
    try {
      const response = await adminService.updateProfile(payload);
      setData(response);
      if (response.token) {
        persistSession({ token: response.token, role: response.role || "ADMIN", profile: response.profile });
        dispatch(setCredentials({ token: response.token, role: response.role || "ADMIN", profile: response.profile }));
      } else {
        dispatch(syncProfile(response.profile));
        updateStoredProfile(response.profile);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes((file.type || "").toLowerCase())) {
      toast.error("Only JPG, PNG, and WEBP files are allowed.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }
    setUploadingPhoto(true);
    try {
      const response = await adminService.uploadProfilePhoto(file);
      setData(response);
      dispatch(syncProfile(response.profile));
      updateStoredProfile(response.profile);
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error?.message || "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      const response = await adminService.removeProfilePhoto();
      setData(response);
      dispatch(syncProfile(response.profile));
      updateStoredProfile(response.profile);
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error(error?.message || "Failed to remove profile photo");
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
    await adminService.updatePassword(passwordForm);
    toast.success("Password updated successfully");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordTouched({ currentPassword: false, newPassword: false, confirmPassword: false });
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

  return (
    <div className="grid max-w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading eyebrow="Profile" title="Workspace settings" description="Keep your store profile and password in sync." />
        <form className="mt-6 grid gap-4" onSubmit={handleProfileSave}>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-200/70 bg-gradient-to-br from-cyan-100 via-white to-violet-100 shadow-[0_0_0_4px_rgba(34,211,238,0.08)]">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Profile avatar" fill sizes="80px" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-teal-800">
                    {String(profileView?.fullName || data.profile.fullName || "MR")
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
                    <div className="truncate text-lg font-semibold text-gray-900">{profileView?.fullName || data.profile.fullName || "Admin User"}</div>
                    <div className="mt-1 truncate text-sm text-gray-500">{data.profile.email || ""}</div>
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
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
              <ControlButton className="h-11 px-4" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                <span className="inline-flex items-center gap-2"><Upload size={14} /> {uploadingPhoto ? "Uploading..." : "Upload"}</span>
              </ControlButton>
              <ControlButton className="h-11 px-4" onClick={handleRemovePhoto} disabled={uploadingPhoto || !data.profile?.avatarUrl}>
                <span className="inline-flex items-center gap-2"><Trash2 size={14} /> Remove</span>
              </ControlButton>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" name="fullName" value={profileView?.fullName || ""} onChange={(event) => setDraftProfile((previous) => ({ ...previous, fullName: event.target.value }))} required disabled={!isEditing} />
            <div className="grid gap-2 text-sm">
              <span className="font-medium text-slate-600">Email</span>
              <input
                type="email"
                value={profileView?.email || ""}
                onChange={(event) => setDraftProfile((previous) => ({ ...previous, email: event.target.value.slice(0, 160) }))}
                disabled={!isEditing}
                className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-800 outline-none transition disabled:bg-slate-50/80 disabled:text-slate-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <FormField label="Mobile Number" name="mobileNumber" value={profileView?.mobileNumber || ""} onChange={(event) => setDraftProfile((previous) => ({ ...previous, mobileNumber: event.target.value.replace(/\D/g, "").slice(0, 10) }))} required disabled={!isEditing} />
            <div className="grid gap-2 text-sm">
              <span className="font-medium text-slate-600">Store ID</span>
              <input
                readOnly
                value={profileView?.storeCode || data.profile.storeCode || ""}
                className="w-full rounded-2xl border border-cyan-200/80 bg-cyan-50/70 px-4 py-3 font-semibold tracking-[0.12em] text-slate-800 outline-none"
              />
            </div>
            <FormField label="Store Name" name="storeName" value={profileView?.storeName || ""} onChange={(event) => setDraftProfile((previous) => ({ ...previous, storeName: event.target.value }))} required disabled={!isEditing} />
            <FormField label="City" name="city" value={profileView?.city || ""} onChange={(event) => setDraftProfile((previous) => ({ ...previous, city: event.target.value }))} required disabled={!isEditing} />
            <FormField label="Address" name="address" value={profileView?.address || ""} onChange={(event) => setDraftProfile((previous) => ({ ...previous, address: event.target.value }))} required disabled={!isEditing} />
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

      <div className="grid gap-6">
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
    </div>
  );
}
