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
import { Ban, CheckCircle2, Pencil, Plus, Printer, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/common/DataTable";
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
        toast.error(error.message || "Unable to save admin");
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
                <button type="button" onClick={() => handleDelete(row.id)} className="rounded-xl border border-rose-400/20 bg-rose-500/12 px-3 py-2 text-xs font-semibold text-rose-100">
                  <span className="inline-flex items-center gap-1"><Trash2 size={12} /> Delete</span>
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
  const storesLoader = useMemo(() => superAdminService.getStores, []);
  const { data, loading } = useAsyncLoader(storesLoader, { items: [] });

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading
        eyebrow="Network"
        title="Stores"
        description="Keep visibility on every store, owner, assigned plan, and renewal horizon."
      />
      <DataTable
        columns={[
          { key: "name", label: "Store" },
          { key: "owner", label: "Owner" },
          { key: "city", label: "City" },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
          { key: "planExpiresAt", label: "Plan Expiry", render: (value) => formatDate(value) },
        ]}
        rows={data.items}
      />
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
    description: "",
    monthlyPrice: "",
    yearlyPrice: "",
    maxProducts: "",
    maxCustomers: "",
    features: "",
    status: "ACTIVE",
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: "",
      description: "",
      monthlyPrice: "",
      yearlyPrice: "",
      maxProducts: "",
      maxCustomers: "",
      features: "",
      status: "ACTIVE",
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      monthlyPrice: item.monthlyPrice,
      yearlyPrice: item.yearlyPrice,
      maxProducts: item.maxProducts,
      maxCustomers: item.maxCustomers,
      features: item.features,
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      monthlyPrice: Number(form.monthlyPrice),
      yearlyPrice: Number(form.yearlyPrice),
      maxProducts: Number(form.maxProducts),
      maxCustomers: Number(form.maxCustomers),
    };

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
              <div className="mt-2 text-sm text-white/55">{formatCurrency(plan.yearlyPrice)} annual billing</div>
              <div className="mt-5 grid gap-2 text-sm text-white/68">
                <div>Products: {plan.maxProducts}</div>
                <div>Customers: {plan.maxCustomers}</div>
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
                  className="rounded-2xl border border-rose-400/20 bg-rose-500/12 px-4 py-3 text-sm font-semibold text-rose-100"
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
            <FormField label="Monthly Price" name="monthlyPrice" type="number" value={form.monthlyPrice} onChange={(event) => setForm((previous) => ({ ...previous, monthlyPrice: event.target.value }))} required />
            <FormField label="Yearly Price" name="yearlyPrice" type="number" value={form.yearlyPrice} onChange={(event) => setForm((previous) => ({ ...previous, yearlyPrice: event.target.value }))} required />
            <FormField label="Max Products" name="maxProducts" type="number" value={form.maxProducts} onChange={(event) => setForm((previous) => ({ ...previous, maxProducts: event.target.value }))} required />
            <FormField label="Max Customers" name="maxCustomers" type="number" value={form.maxCustomers} onChange={(event) => setForm((previous) => ({ ...previous, maxCustomers: event.target.value }))} required />
          </div>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-white/72">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 outline-none transition focus:border-cyan-300/40"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-white/72">Features</span>
            <textarea
              rows={3}
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
  const loader = useMemo(() => superAdminService.getInvoices, []);
  const { data, loading } = useAsyncLoader(loader, { items: [] });

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading eyebrow="Finance" title="Invoices" description="Review transaction volume across the platform in a single premium ledger." />
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

export function SuperAdminReportsScreen() {
  const loader = useMemo(() => superAdminService.getReports, []);
  const { data, loading } = useAsyncLoader(loader, { summary: {}, monthly: [], planMix: [] });

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
          <div className="flex flex-wrap gap-3">
            <ControlButton onClick={() => downloadCsv("myreport-superadmin-reports.csv", data.monthly)}>
              Export Excel
            </ControlButton>
            <ControlButton onClick={printPage}>
              <span className="inline-flex items-center gap-2"><Printer size={16} /> Export PDF</span>
            </ControlButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard item={{ label: "Revenue", value: formatCurrency(data.summary.revenue || 0), helper: "All-store billing", accent: "cyan" }} />
        <MetricCard item={{ label: "Stores", value: String(data.summary.stores || 0), helper: "Connected workspaces", accent: "emerald" }} />
        <MetricCard item={{ label: "Admins", value: String(data.summary.admins || 0), helper: "Managed operators", accent: "violet" }} />
      </div>

      <div className="grid max-w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Monthly Revenue" description="Performance trend over recent months.">
          <div className="h-72 w-full max-w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly}>
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
  const { data, loading } = useAsyncLoader(loader, { profile: {} });

  if (loading) {
    return <LoadingSkeleton rows={2} />;
  }

  return (
    <div className="grid max-w-full gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <GlassPanel className="p-5 sm:p-6">
        <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/75">Profile</div>
        <h2 className="mt-3 text-2xl font-semibold">{data.profile.fullName || "SuperAdmin"}</h2>
        <div className="mt-5 grid gap-3 text-sm text-white/62">
          <div>Email: {data.profile.email || "N/A"}</div>
          <div>Mobile: {data.profile.mobileNumber || "N/A"}</div>
          <div>Role: SUPER_ADMIN</div>
        </div>
      </GlassPanel>
      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading
          eyebrow="Workspace notes"
          title="Platform settings"
          description="This screen is ready for advanced tenant controls, pricing policies, support routing, and audit preferences."
        />
        <div className="mt-6">
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            "Audit-ready activity trails",
            "Global notification preferences",
            "Pricing and billing defaults",
            "Support escalation routing",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/72">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-200" /> {item}</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
