"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
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
import { Ban, CheckCircle2, Pencil, Plus, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/common/DataTable";
import { DownloadToolbar } from "@/components/common/DownloadToolbar";
import { GlassPanel } from "@/components/common/GlassPanel";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { MetricCard } from "@/components/common/MetricCard";
import { Modal } from "@/components/common/Modal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { downloadCsv, formatCurrency, formatDate, printPage } from "@/lib/format";
import { superAdminService } from "@/services/superAdminService";

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

function FormField({ label, name, value, onChange, placeholder, type = "text", required = false }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--muted-strong)]">{label}</span>
      <input
        required={required}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="theme-input w-full rounded-2xl px-4 py-3 outline-none transition"
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
        <p className="mt-1 text-sm text-white/55">{description}</p>
      </div>
      {children}
    </GlassPanel>
  );
}

function ActivityList({ title, items, render }) {
  return (
    <GlassPanel className="max-w-full overflow-hidden p-5 sm:p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-5 grid gap-3">
        {items?.length ? (
          items.map((item, index) => (
            <div key={`${item.title || item.storeName}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              {render(item)}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-white/55">Nothing to show yet.</div>
        )}
      </div>
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

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Overview"
        title="Platform Pulse"
        description="Track platform growth, approval health, and renewal risk from one premium command layer."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((item, index) => (
          <MetricCard key={item.label} item={item} index={index} />
        ))}
      </div>

      <div className="grid max-w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Revenue Graph" description="Monthly platform revenue across all stores.">
          <div className="h-72 w-full max-w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#4fd1c5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4fd1c5" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }}
                />
                <Area type="monotone" dataKey="value" stroke="#4fd1c5" strokeWidth={2.5} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Growth Chart" description="Admin and store additions month over month.">
          <div className="h-72 w-full max-w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.growthSeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }} />
                <Bar dataKey="admins" fill="#7c8cff" radius={[10, 10, 0, 0]} />
                <Bar dataKey="stores" fill="#4fd1c5" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <ActivityList
          title="Recent Activities"
          items={data.recentActivities}
          render={(item) => (
            <>
              <div className="text-sm font-semibold">{item.title}</div>
              <div className="mt-1 text-sm text-white/55">{item.subtitle}</div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-200/70">{formatDate(item.timestamp)}</div>
            </>
          )}
        />
        <ActivityList
          title="Expiring Plans"
          items={data.expiringPlans}
          render={(item) => (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">{item.storeName}</div>
                <StatusBadge value="PENDING" />
              </div>
              <div className="mt-2 text-sm text-white/55">
                {item.owner} on {item.plan}
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-200/80">Expires {formatDate(item.planExpiresAt)}</div>
            </>
          )}
        />
        <ActivityList
          title="Alerts Feed"
          items={data.notifications}
          render={(item) => (
            <>
              <div className="text-sm font-semibold">{item.title}</div>
              <div className="mt-1 text-sm text-white/55">{item.message}</div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-violet-200/75">{formatDate(item.createdAt)}</div>
            </>
          )}
        />
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
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
          <Search size={16} className="text-white/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search admins, stores, or emails..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
          />
        </div>
      </GlassPanel>

      <DataTable
        columns={[
          { key: "fullName", label: "Admin" },
          { key: "email", label: "Email" },
          { key: "storeName", label: "Store" },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
          { key: "planExpiresAt", label: "Plan Expiry", render: (value) => formatDate(value) },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <div className="flex flex-wrap gap-2">
                {row.status === "PENDING_APPROVAL" ? (
                  <button type="button" onClick={() => handleApprove(row.id)} className="rounded-xl bg-emerald-500/14 px-3 py-2 text-xs font-semibold text-emerald-100">
                    Approve
                  </button>
                ) : null}
                <button type="button" onClick={() => openEdit(row)} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white/75">
                  <span className="inline-flex items-center gap-1"><Pencil size={12} /> Edit</span>
                </button>
                <button type="button" onClick={() => handleToggleStatus(row.id)} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white/75">
                  <span className="inline-flex items-center gap-1"><Ban size={12} /> {row.status === "BLOCKED" ? "Unblock" : "Block"}</span>
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
        rows={filteredAdmins}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Admin" : "Add Admin"}
        description="Provision a store owner with plan assignment, contact details, and secure access."
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleFormChange} required />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleFormChange} required />
            <FormField label="Mobile Number" name="mobileNumber" value={form.mobileNumber} onChange={handleFormChange} required />
            <FormField label="Password" name="password" value={form.password} onChange={handleFormChange} placeholder={editingItem ? "Leave blank to keep current password" : "Create password"} />
            <FormField label="Store Name" name="storeName" value={form.storeName} onChange={handleFormChange} required />
            <FormField label="City" name="city" value={form.city} onChange={handleFormChange} required />
            <FormField label="Address" name="address" value={form.address} onChange={handleFormChange} required />
            <SelectField
              label="Plan"
              name="planId"
              value={form.planId}
              onChange={handleFormChange}
              options={plansData.items.map((plan) => ({ label: plan.name, value: String(plan.id) }))}
            />
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
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Store Type</div>
            <select
              value={storeType}
              onChange={(event) => setStoreType(event.target.value)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All</option>
              <option value="Grocery Shop">Grocery Shop</option>
              <option value="Clothes Shop">Clothes Shop</option>
              <option value="Shoe Shop">Shoe Shop</option>
              <option value="Electronics">Electronics</option>
              <option value="Beauty Shop">Beauty Shop</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setStoreType("")}
            className="h-12 rounded-2xl border border-white/10 bg-white/6 px-5 text-sm font-semibold text-white/75 transition hover:bg-white/10"
          >
            Clear Filter
          </button>
        </div>
      </GlassPanel>

      <DataTable
        columns={[
          { key: "name", label: "Store" },
          { key: "storeType", label: "Store Type" },
          { key: "owner", label: "Owner" },
          { key: "ownerEmail", label: "Email" },
          { key: "city", label: "City" },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
          { key: "planExpiresAt", label: "Plan Expiry", render: (value) => formatDate(value) },
        ]}
        rows={data.items}
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
              <select
                value={form.storeType}
                onChange={(e) => setForm((p) => ({ ...p, storeType: e.target.value }))}
                className="h-12 w-full rounded-2xl border border-black/10 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="Grocery Shop">Grocery Shop</option>
                <option value="Clothes Shop">Clothes Shop</option>
                <option value="Shoe Shop">Shoe Shop</option>
                <option value="Electronics">Electronics</option>
                <option value="Beauty Shop">Beauty Shop</option>
                <option value="Accessories">Accessories</option>
              </select>
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
    maxUsers: "",
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
      maxUsers: "",
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
      maxUsers: item.maxUsers,
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
      maxUsers: Number(form.maxUsers || 0),
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
                  <div className="mt-2 text-sm text-white/55">{plan.description}</div>
                </div>
                <StatusBadge value={plan.status} />
              </div>
              <div className="mt-6 text-3xl font-semibold">{formatCurrency(plan.monthlyPrice)}<span className="text-base text-white/45"> / month</span></div>
              <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/45">{plan.duration || "Monthly"}</div>
              <div className="mt-2 text-sm text-white/55">{formatCurrency(plan.yearlyPrice)} annual billing</div>
              <div className="mt-5 grid gap-2 text-sm text-white/68">
                <div>Products: {plan.maxProducts}</div>
                <div>Users: {plan.maxUsers}</div>
                <div>Customers: {plan.maxCustomers}</div>
                {plan.trialAvailable ? <div className="text-cyan-200/90">Free trial available</div> : null}
                {plan.popular ? <div className="text-violet-200/90">Most popular</div> : null}
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
            <FormField label="Max Users" name="maxUsers" type="number" value={form.maxUsers} onChange={(event) => setForm((previous) => ({ ...previous, maxUsers: event.target.value }))} required />
            <FormField label="Button Text" name="buttonText" value={form.buttonText} onChange={(event) => setForm((previous) => ({ ...previous, buttonText: event.target.value }))} placeholder="Select Plan" />
            <FormField label="Theme Color" name="themeColor" value={form.themeColor} onChange={(event) => setForm((previous) => ({ ...previous, themeColor: event.target.value }))} placeholder="indigo / cyan / violet" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" checked={form.trialAvailable} onChange={(event) => setForm((previous) => ({ ...previous, trialAvailable: event.target.checked }))} className="theme-input h-4 w-4 rounded" />
              Trial Available
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" checked={form.popular} onChange={(event) => setForm((previous) => ({ ...previous, popular: event.target.checked }))} className="theme-input h-4 w-4 rounded" />
              Most Popular
            </label>
          </div>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-white/72">Description</span>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 outline-none transition focus:border-cyan-300/40"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-white/72">Features</span>
            <textarea
              rows={3}
              required
              value={form.features}
              onChange={(event) => setForm((previous) => ({ ...previous, features: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 outline-none transition focus:border-cyan-300/40"
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
  const { data, loading } = useAsyncLoader(loader, { items: [] });

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
            onRefresh={async () => {
              if (exporting) return;
              setExporting("refresh");
              setTimeout(() => setExporting(null), 300);
            }}
            onExportExcel={() => downloadCsv("myreport-superadmin-invoices.csv", data.items || [])}
            onExportPdf={printPage}
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
      />
    </div>
  );
}

export function SuperAdminEnquiriesScreen() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loader = useMemo(() => {
    const tick = refreshTick;
    return () => {
      void tick;
      return superAdminService.getEnquiries({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        source: sourceFilter === "ALL" ? undefined : sourceFilter,
        q: query || undefined,
      });
    };
  }, [statusFilter, sourceFilter, query, refreshTick]);
  const { data, loading } = useAsyncLoader(loader, { items: [], total: 0, stats: {} });
  const stats = data.stats || {};

  const refresh = () => setRefreshTick((value) => value + 1);

  const applyReply = async () => {
    if (!selectedItem || !replyMessage.trim()) return;
    setReplying(true);
    try {
      await superAdminService.replyEnquiry({ id: selectedItem.id, replyMessage });
      toast.success("Reply saved");
      setSelectedItem(null);
      setReplyMessage("");
      refresh();
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
      refresh();
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
      refresh();
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
        eyebrow="Support"
        title="Support Enquiries"
        description="Contact and chatbot routing"
        action={
          <ControlButton variant="primary" onClick={refresh}>
            Refresh
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
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search enquiries..." className="theme-input w-full rounded-2xl px-4 py-3 outline-none" />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-strong)]">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="theme-input w-full rounded-2xl px-4 py-3 outline-none">
              {["ALL", "NEW", "IN_PROGRESS", "RESOLVED"].map((option) => (
                <option key={option} value={option}>{option.replace("_", " ")}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-strong)]">Source</span>
            <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="theme-input w-full rounded-2xl px-4 py-3 outline-none">
              {["ALL", "CONTACT_FORM", "CHATBOT", "WEBSITE", "ADMIN_PANEL"].map((option) => (
                <option key={option} value={option}>{option.replace("_", " ")}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10">
          <div className="grid grid-cols-[1.1fr_1.4fr_0.9fr_1.1fr_0.9fr_0.9fr_0.9fr_1.2fr] gap-0 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
            <div>Ticket ID</div>
            <div>Contact Name</div>
            <div>Message</div>
            <div>Status</div>
            <div>Email</div>
            <div>Source</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          <div className="grid gap-2 bg-black/10 p-2">
            {data.items?.length ? data.items.map((item) => (
              <div key={item.id} className="grid items-center grid-cols-[1.1fr_1.4fr_0.9fr_1.1fr_0.9fr_0.9fr_0.9fr_1.2fr] gap-0 rounded-[24px] border border-white/8 bg-[linear-gradient(135deg,rgba(28,18,38,0.92),rgba(45,18,28,0.88))] px-4 py-4 transition hover:-translate-y-0.5 hover:border-cyan-300/30">
                <div className="text-sm font-semibold text-white">{item.ticketId}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-white/50">{item.phone || "—"}</div>
                </div>
                <div className="max-w-[32ch] text-sm leading-6 text-white/75">{item.message}</div>
                <div className="text-sm font-semibold text-cyan-200">{String(item.status || "").replace("_", " ")}</div>
                <div className="text-sm text-white/75">{item.email}</div>
                <div className="text-sm text-white/75">{String(item.source || "").replace("_", " ")}</div>
                <div className="text-xs uppercase tracking-[0.14em] text-white/55">{formatDate(item.createdAt)}</div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSelectedItem(item)} className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/16">View</button>
                  <button type="button" onClick={() => { setSelectedItem(item); setReplyMessage(item.replyMessage || ""); }} className="rounded-full bg-cyan-400/15 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/25">Reply</button>
                  <button type="button" onClick={() => markResolved(item)} disabled={updating} className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/25 disabled:opacity-60">Resolved</button>
                  <button type="button" onClick={() => deleteItem(item)} disabled={updating} className="rounded-full bg-rose-400/15 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25 disabled:opacity-60">Delete</button>
                </div>
              </div>
            )) : (
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-6 text-sm text-white/55">Nothing to show yet.</div>
            )}
          </div>
        </div>
      </GlassPanel>

      <Modal open={Boolean(selectedItem)} onClose={() => { setSelectedItem(null); setReplyMessage(""); }} title="Support Ticket">
        {selectedItem ? (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/45">{selectedItem.ticketId}</div>
              <div className="mt-2 text-lg font-semibold text-white">{selectedItem.name}</div>
              <div className="mt-1 text-sm text-white/55">{selectedItem.email} • {selectedItem.phone || "No phone"}</div>
              <div className="mt-3 text-sm leading-6 text-white/75">{selectedItem.message}</div>
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
  const { data, loading } = useAsyncLoader(loader, { summary: {}, series: [], planMix: [] });

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
            onRefresh={async () => {
              if (exporting) return;
              setExporting("refresh");
              setTimeout(() => setExporting(null), 300);
            }}
            onExportExcel={() => downloadCsv("myreport-superadmin-reports.csv", data.series || [])}
            onExportPdf={printPage}
            exporting={exporting}
            downloadDisabled={!data?.series?.length}
          />
        }
      />

      <GlassPanel className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-white/85 outline-none transition focus:border-white/20"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-white/85 outline-none transition focus:border-white/20"
              />
            </label>
            <div className="grid gap-2">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Quick Range</div>
              <div className="flex flex-wrap gap-2">
                <ControlButton variant={range === "daily" ? "primary" : "default"} onClick={() => setRange("daily")}>Daily</ControlButton>
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
        <ChartCard title="Monthly Revenue" description="Performance trend over recent months.">
          <div className="h-72 w-full max-w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series}>
                <defs>
                  <linearGradient id="reportsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#7c8cff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c8cff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }} />
                <Area type="monotone" dataKey="value" stroke="#7c8cff" strokeWidth={2.5} fill="url(#reportsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ActivityList
          title="Plan Mix"
          items={data.planMix}
          render={(item) => (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{item.name}</div>
                <StatusBadge value={item.status} />
              </div>
              <div className="mt-2 text-sm text-white/55">{item.stores} active stores</div>
            </>
          )}
        />
      </div>
    </div>
  );
}

export function SuperAdminSettingsScreen() {
  const loader = useMemo(() => superAdminService.getSettings, []);
  const { data, setData, loading } = useAsyncLoader(loader, { profile: {}, preferences: {} });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  const handleProfileSave = async (event) => {
    event.preventDefault();
    const response = await superAdminService.updateProfile({
      fullName: data.profile.fullName,
      mobileNumber: data.profile.mobileNumber,
      city: data.profile.city,
      address: data.profile.address,
    });
    setData(response);
    toast.success("Profile updated");
  };

  const handlePreferenceToggle = async (key) => {
    const nextPreferences = {
      ...(data.preferences || {}),
      [key]: !(data.preferences || {})[key],
    };
    const response = await superAdminService.updatePreferences(nextPreferences);
    setData(response);
    toast.success("Preferences updated");
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    await superAdminService.updatePassword(passwordForm);
    toast.success("Password updated");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="grid max-w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading eyebrow="Profile" title="Super Admin settings" description="Keep your profile, password, and notification preferences in sync." />
        <form className="mt-6 grid gap-4" onSubmit={handleProfileSave}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Full Name"
              name="fullName"
              value={data.profile.fullName || ""}
              onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, fullName: event.target.value } }))}
              required
            />
            <div className="grid gap-2 text-sm">
              <span className="font-medium text-white/72">Email</span>
              <input
                readOnly
                type="email"
                value={data.profile.email || ""}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/60 outline-none"
              />
            </div>
            <FormField
              label="Mobile Number"
              name="mobileNumber"
              value={data.profile.mobileNumber || ""}
              onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, mobileNumber: event.target.value } }))}
              required
            />
            <FormField
              label="City"
              name="city"
              value={data.profile.city || ""}
              onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, city: event.target.value } }))}
              required
            />
            <FormField
              className="sm:col-span-2"
              label="Address"
              name="address"
              value={data.profile.address || ""}
              onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, address: event.target.value } }))}
              required
            />
          </div>
          <div className="flex justify-start sm:justify-end">
            <ControlButton type="submit" variant="primary">Save Profile</ControlButton>
          </div>
        </form>

        <div className="mt-10 border-t border-white/10 pt-8">
          <SectionHeading eyebrow="Security" title="Change password" description="Set a fresh password for this Super Admin account." />
          <form className="mt-6 grid gap-4" onSubmit={handlePasswordSave}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Current Password" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} required />
              <FormField label="New Password" name="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} required />
              <FormField label="Confirm Password" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} required />
            </div>
            <div className="flex justify-start sm:justify-end">
              <ControlButton type="submit" variant="primary">Update Password</ControlButton>
            </div>
          </form>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading eyebrow="Preferences" title="Notifications & theme" description="Tune alerts and dashboard appearance." />
        <div className="mt-6 grid gap-3">
          {[
            { key: "lowStockAlerts", label: "Low stock alerts", helper: "Surface inventory risk signals." },
            { key: "planExpiryAlerts", label: "Plan expiry alerts", helper: "Get reminders about renewals." },
            { key: "paymentAlerts", label: "Payment alerts", helper: "Stay on top of payment status." },
            { key: "darkMode", label: "Dark mode", helper: "Switch UI theme preference." },
          ].map((pref) => (
            <button
              key={pref.key}
              type="button"
              onClick={() => handlePreferenceToggle(pref.key)}
              className="flex w-full items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/6 p-4 text-left transition hover:bg-white/10"
            >
              <div>
                <div className="text-sm font-semibold text-white/90">{pref.label}</div>
                <div className="mt-1 text-xs text-white/55">{pref.helper}</div>
              </div>
              <div className={[
                "h-6 w-11 rounded-full border transition",
                (data.preferences || {})[pref.key] ? "border-cyan-200/50 bg-cyan-400/40" : "border-white/15 bg-white/10",
              ].join(" ")}>
                <div className={[
                  "h-5 w-5 translate-y-[1px] rounded-full bg-white shadow transition",
                  (data.preferences || {})[pref.key] ? "translate-x-5" : "translate-x-1",
                ].join(" ")} />
              </div>
            </button>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}


