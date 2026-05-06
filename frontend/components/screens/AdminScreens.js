"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
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
  CheckCircle2,
  Plus,
  Printer,
  Search,
  ShoppingCart,
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
import { downloadCsv, formatCurrency, formatDate, printPage } from "@/lib/format";
import { exportTableExcel, exportTablePdf } from "@/lib/exportReports";
import { adminService } from "@/services/adminService";
import { createRazorpayOrder } from "@/services/paymentService";
import { updateProfile as syncProfile } from "@/redux/slices/authSlice";

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

export function AdminDashboardScreen() {
  const loader = useMemo(() => adminService.getDashboard, []);
  const { data, loading } = useAsyncLoader(loader, {
    metrics: [],
    revenueSeries: [],
    topSales: [],
    notifications: [],
    store: {},
    highlights: [],
  });

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="grid max-w-full gap-6">
      <SectionHeading eyebrow="Store performance" title="MyReport" description="Stay on top of daily cashflow, fast movers, inventory risk, and plan usage." />
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
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }} />
                <Area type="monotone" dataKey="value" stroke="#4fd1c5" strokeWidth={2.5} fill="url(#adminRevenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Top Sales" description="Best-performing products this cycle.">
          <div className="h-72 w-full max-w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topSales}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,14,28,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }} />
                <Bar dataKey="value" fill="#7c8cff" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <div className="grid max-w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="mt-5 grid gap-3">
            {data.notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="mt-1 text-sm text-white/55">{item.message}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-200/70">{formatDate(item.createdAt)}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Workspace Highlights</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/72">
                {highlight}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-cyan-300/12 bg-cyan-300/8 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/75">Current plan</div>
            <div className="mt-2 text-2xl font-semibold">{data.store.plan}</div>
            <div className="mt-1 text-sm text-white/55">Renews on {formatDate(data.store.planExpiresAt)}</div>
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
  const [exporting, setExporting] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    city: "",
    blocked: false,
  });

  const reloadCustomers = async () => {
    const response = await adminService.getCustomers();
    setData(response);
  };

  const filteredItems = data.items.filter((item) =>
    [item.fullName, item.email, item.mobileNumber].join(" ").toLowerCase().includes(query.toLowerCase())
  );

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
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await (editingItem ? adminService.updateCustomer(editingItem.id, form) : adminService.createCustomer(form));
      await reloadCustomers();
      toast.success(editingItem ? "Customer updated" : "Customer created");
      setModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save customer.");
    }
  };

  const handleToggleBlock = async (customerId) => {
    try {
      await adminService.toggleCustomerBlock(customerId);
      await reloadCustomers();
    } catch (error) {
      toast.error(error?.message || "Failed to update customer status.");
    }
  };

  const handleDelete = async (customerId) => {
    try {
      await adminService.deleteCustomer(customerId);
      await reloadCustomers();
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
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
          <Search size={16} className="text-white/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
          />
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
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(row)} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white/75">
                  Edit
                </button>
                <button type="button" onClick={() => handleToggleBlock(row.id)} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white/75">
                  {row.blocked ? "Unblock" : "Block"}
                </button>
                <button type="button" onClick={() => handleDelete(row.id)} className="rounded-xl border border-rose-400/20 bg-rose-500/12 px-3 py-2 text-xs font-semibold text-rose-100">
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        rows={filteredItems}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Edit Customer" : "Add Customer"}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" name="fullName" value={form.fullName} onChange={(event) => setForm((previous) => ({ ...previous, fullName: event.target.value }))} required />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))} />
            <FormField label="Mobile Number" name="mobileNumber" value={form.mobileNumber} onChange={(event) => setForm((previous) => ({ ...previous, mobileNumber: event.target.value }))} required />
            <FormField label="City" name="city" value={form.city} onChange={(event) => setForm((previous) => ({ ...previous, city: event.target.value }))} required />
          </div>
          <label className="flex items-center gap-3 text-sm text-white/68">
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
    sku: "",
    price: "",
    quantity: "",
    reorderThreshold: "",
    unit: "PIECE",
    active: true,
  });

  const reloadProducts = async () => {
    const response = await adminService.getProducts();
    setData(response);
  };

  const filteredItems = data.items.filter((item) =>
    [item.name, item.sku, item.category].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase())
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
          { key: "email", label: "Email", value: () => "" },
          { key: "mobile", label: "Mobile", value: () => "" },
          { key: "category", label: "Category", value: (row) => row.category || row.unit || "" },
          { key: "price", label: "Price", value: (row) => row.price },
          { key: "quantity", label: "Quantity", value: (row) => row.quantity },
          { key: "status", label: "Status", value: (row) => (row.active ? (row.lowStock ? "LOW" : "ACTIVE") : "BLOCKED") },
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
          { key: "email", label: "Email", value: () => "" },
          { key: "mobile", label: "Mobile", value: () => "" },
          { key: "category", label: "Category", value: (row) => row.category || row.unit || "" },
          { key: "price", label: "Price", value: (row) => row.price },
          { key: "quantity", label: "Quantity", value: (row) => row.quantity },
          { key: "status", label: "Status", value: (row) => (row.active ? (row.lowStock ? "LOW" : "ACTIVE") : "BLOCKED") },
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
      sku: "",
      price: "",
      quantity: "",
      reorderThreshold: "",
      unit: "PIECE",
      active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      sku: item.sku,
      price: item.price,
      quantity: item.quantity,
      reorderThreshold: item.reorderThreshold,
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
      reorderThreshold: Number(form.reorderThreshold),
    };

    try {
      await (editingItem ? adminService.updateProduct(editingItem.id, payload) : adminService.createProduct(payload));
      await reloadProducts();
      toast.success(editingItem ? "Product updated" : "Product created");
      setModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save product.");
    }
  };

  const handleDelete = async (productId) => {
    try {
      await adminService.deleteProduct(productId);
      await reloadProducts();
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
        description="Maintain pricing, stock units, quantity health, and replenishment thresholds."
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
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
          <Search size={16} className="text-white/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
          />
        </div>
      </GlassPanel>
      <DataTable
        columns={[
          { key: "name", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "unit", label: "Unit" },
          { key: "quantity", label: "Qty" },
          { key: "price", label: "Price", render: (value) => formatCurrency(value) },
          {
            key: "lowStock",
            label: "Stock Health",
            render: (value, row) => <StatusBadge value={value ? "LOW" : row.active ? "ACTIVE" : "BLOCKED"} />,
          },
          {
            key: "actions",
            label: "Actions",
            headerClassName: "text-right",
            cellClassName: "text-right",
            render: (_, row) => (
              <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                <button type="button" onClick={() => openEdit(row)} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white/75">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(row.id)} className="rounded-xl border border-rose-400/20 bg-rose-500/12 px-3 py-2 text-xs font-semibold text-rose-100">
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        rows={filteredItems}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Edit Product" : "Add Product"}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Product Name" name="name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} required />
            <FormField label="SKU" name="sku" value={form.sku} onChange={(event) => setForm((previous) => ({ ...previous, sku: event.target.value }))} required />
            <FormField label="Price" name="price" type="number" value={form.price} onChange={(event) => setForm((previous) => ({ ...previous, price: event.target.value }))} required />
            <FormField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={(event) => setForm((previous) => ({ ...previous, quantity: event.target.value }))} required />
            <FormField label="Reorder Threshold" name="reorderThreshold" type="number" value={form.reorderThreshold} onChange={(event) => setForm((previous) => ({ ...previous, reorderThreshold: event.target.value }))} required />
            <SelectField
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={(event) => setForm((previous) => ({ ...previous, unit: event.target.value }))}
              options={["KG", "GRAM", "LITRE", "ML", "PIECE", "BOX"].map((unit) => ({ label: unit, value: unit }))}
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-white/68">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm((previous) => ({ ...previous, active: event.target.checked }))} />
            Product is active
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
  const [rows, setRows] = useState([{ id: 1, productId: "", quantity: 1 }]);
  const [customerName, setCustomerName] = useState("");
  const [gstPercentage, setGstPercentage] = useState(18);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("Thank you for choosing MyReport POS.");
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [nextRowId, setNextRowId] = useState(2);
  const [exporting, setExporting] = useState(null);

  const loading = customersLoading || productsLoading;

  const lineItems = rows
    .map((row) => {
      const product = productsData.items.find((item) => String(item.id) === row.productId);
      if (!product) {
        return null;
      }
      return {
        ...row,
        productName: product.name,
        rate: Number(product.price),
        total: Number(product.price) * Number(row.quantity || 0),
      };
    })
    .filter(Boolean);

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * Number(gstPercentage || 0)) / 100;
  const totalAmount = subtotal + taxAmount - Number(discountAmount || 0);

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
    if (!customerName || !lineItems.length) {
      toast.error("Select a customer and at least one product");
      return;
    }

    const payload = {
      customerName,
      gstPercentage: Number(gstPercentage),
      discountAmount: Number(discountAmount),
      notes,
      items: lineItems.map((item) => ({
        productName: item.productName,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };

    try {
      const response = await adminService.createInvoice(payload);
      setInvoiceResult({ ...response, totalAmount: response.totalAmount || totalAmount });
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
          action={
            <DownloadToolbar
              onRefresh={refreshWorkspace}
              onExportPdf={exportBillPdf}
              onExportExcel={exportBillExcel}
              exporting={exporting}
              downloadDisabled={!lineItems.length}
              className="w-full lg:w-auto"
            />
          }
        />
        <div className="mt-6 grid gap-4">
          <SelectField
            label="Customer"
            name="customerName"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            options={[
              { label: "Select customer", value: "" },
              ...customersData.items.map((item) => ({ label: item.fullName, value: item.fullName })),
            ]}
          />

          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1.4fr_0.6fr_auto]">
              <SelectField
                label={`Product ${index + 1}`}
                name="productId"
                value={row.productId}
                onChange={(event) =>
                  setRows((previous) =>
                    previous.map((entry) => (entry.id === row.id ? { ...entry, productId: event.target.value } : entry))
                  )
                }
                options={[
                  { label: "Select product", value: "" },
                  ...productsData.items.map((item) => ({ label: `${item.name} (${item.unit})`, value: String(item.id) })),
                ]}
              />
              <FormField
                label="Quantity"
                name="quantity"
                type="number"
                value={row.quantity}
                onChange={(event) =>
                  setRows((previous) =>
                    previous.map((entry) => (entry.id === row.id ? { ...entry, quantity: event.target.value } : entry))
                  )
                }
                required
              />
              <div className="self-end">
                <button
                  type="button"
                  onClick={() =>
                    setRows((previous) => (previous.length === 1 ? previous : previous.filter((entry) => entry.id !== row.id)))
                  }
                  className="rounded-2xl border border-rose-400/20 bg-rose-500/12 px-4 py-3 text-sm font-semibold text-rose-100"
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
                setRows((previous) => [...previous, { id: nextRowId, productId: "", quantity: 1 }]);
                setNextRowId((previous) => previous + 1);
              }}
            >
              <span className="inline-flex items-center gap-2"><Plus size={16} /> Add Product</span>
            </ControlButton>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="GST %" name="gstPercentage" type="number" value={gstPercentage} onChange={(event) => setGstPercentage(event.target.value)} />
            <FormField label="Discount" name="discountAmount" type="number" value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} />
            <FormField label="Notes" name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>

          <div className="flex flex-wrap gap-3">
            <ControlButton variant="primary" className="w-full sm:w-auto" onClick={handleGenerate}>
              <span className="inline-flex items-center gap-2"><ShoppingCart size={16} /> Generate Bill</span>
            </ControlButton>
            <ControlButton className="w-full sm:w-auto" onClick={printPage}>
              <span className="inline-flex items-center gap-2"><Printer size={16} /> Print Bill</span>
            </ControlButton>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading eyebrow="Invoice preview" title={invoiceResult?.invoiceNumber || "Live bill summary"} description="Preview totals before printing or exporting." />
        <div className="mt-6 grid gap-4">
          {lineItems.length ? (
            lineItems.map((item) => (
              <div key={`${item.productName}-${item.id}`} className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{item.productName}</div>
                  <div className="text-white/55">{item.quantity} x {formatCurrency(item.rate)}</div>
                </div>
                <div className="font-semibold">{formatCurrency(item.total)}</div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-white/55">Add products to build a bill.</div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
            <div className="flex items-center justify-between text-sm text-white/65"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="mt-3 flex items-center justify-between text-sm text-white/65"><span>GST</span><span>{formatCurrency(taxAmount)}</span></div>
            <div className="mt-3 flex items-center justify-between text-sm text-white/65"><span>Discount</span><span>{formatCurrency(discountAmount)}</span></div>
            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4 text-lg font-semibold"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div>
          </div>

          {invoiceResult ? (
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100">
                <CheckCircle2 size={16} />
                Invoice created: {invoiceResult.invoiceNumber}
              </div>
              <div className="mt-2 text-sm text-white/65">Grand total {formatCurrency(invoiceResult.totalAmount || totalAmount)}</div>
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

  const reloadInvoices = async () => {
    const response = await adminService.getInvoices();
    setData(response);
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
      await exportTableExcel({
        fileName: "invoices-report.xlsx",
        sheetName: "Invoices",
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
      />
    </div>
  );
}

export function AdminPlanScreen() {
  const loader = useMemo(() => adminService.getPlan, []);
  const { data, loading } = useAsyncLoader(loader, { plan: null });
  const [orderState, setOrderState] = useState(null);

  const handleUpgrade = async () => {
    if (!data.plan) {
      return;
    }

    const response = await createRazorpayOrder({
      planName: data.plan.name,
      amount: Number(data.plan.monthlyPrice),
    });

    setOrderState(response);
    toast.success(response.configured ? "Razorpay order created" : "Demo Razorpay order prepared");
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
        <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/75">Current subscription</div>
        <h2 className="mt-3 text-3xl font-semibold">{data.plan.name}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">{data.plan.description}</p>
        <div className="mt-6 text-4xl font-semibold">{formatCurrency(data.plan.monthlyPrice)}<span className="text-base text-white/45"> / month</span></div>
        <div className="mt-2 text-sm text-white/55">Renews on {formatDate(data.plan.expiresAt)}</div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/72">Products limit: {data.plan.maxProducts}</div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/72">Customers limit: {data.plan.maxCustomers}</div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/72 sm:col-span-2">{data.plan.features}</div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <SectionHeading eyebrow="Razorpay" title="Renew or upgrade" description="The backend creates a live order when keys are configured, and falls back to demo mode otherwise." />
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/72">
            Days left on current plan: <span className="font-semibold text-white">{data.plan.daysLeft}</span>
          </div>
          <ControlButton variant="primary" className="w-full sm:w-auto" onClick={handleUpgrade}>
            Renew with Razorpay
          </ControlButton>
          {orderState ? (
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5 text-sm text-white/65">
              <div>Mode: {orderState.mode || (orderState.configured ? "live" : "demo")}</div>
              <div className="mt-2">Order ID: {orderState.orderId || orderState.gatewayResponse?.id || "Created"}</div>
              <div className="mt-2">Key ID: {orderState.keyId}</div>
            </div>
          ) : null}
        </div>
      </GlassPanel>
    </div>
  );
}

export function AdminReportsScreen() {
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [appliedFilters, setAppliedFilters] = useState({ startDate: "", endDate: "" });
  const loader = useMemo(
    () => () => adminService.getReports(appliedFilters.startDate || undefined, appliedFilters.endDate || undefined),
    [appliedFilters.endDate, appliedFilters.startDate]
  );
  const { data, loading } = useAsyncLoader(loader, { summary: {}, series: [] });

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
          <div className="flex flex-wrap gap-3">
            <ControlButton onClick={() => downloadCsv("myreport-admin-reports.csv", data.series)}>Export Excel</ControlButton>
            <ControlButton onClick={printPage}>
              <span className="inline-flex items-center gap-2"><Printer size={16} /> Export PDF</span>
            </ControlButton>
          </div>
        }
      />

      <GlassPanel className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <FormField label="Start Date" name="startDate" type="date" value={filters.startDate} onChange={(event) => setFilters((previous) => ({ ...previous, startDate: event.target.value }))} />
          <FormField label="End Date" name="endDate" type="date" value={filters.endDate} onChange={(event) => setFilters((previous) => ({ ...previous, endDate: event.target.value }))} />
          <div className="self-end">
            <ControlButton variant="primary" className="w-full lg:w-auto" onClick={() => setAppliedFilters(filters)}>Apply Filters</ControlButton>
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
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
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
    preferences: {},
  });
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
    const response = await adminService.updateProfile(data.profile);
    setData(response);
    dispatch(syncProfile(response.profile));
    toast.success("Profile updated");
  };

  const handlePreferenceToggle = async (key) => {
    const nextPreferences = {
      ...data.preferences,
      [key]: !data.preferences[key],
    };
    const response = await adminService.updatePreferences(nextPreferences);
    setData(response);
    dispatch(syncProfile({ preferences: response.preferences }));
    toast.success("Preferences updated");
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    await adminService.updatePassword(passwordForm);
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
        <SectionHeading eyebrow="Profile" title="Workspace settings" description="Keep your store profile, password, and notification controls in sync." />
        <form className="mt-6 grid gap-4" onSubmit={handleProfileSave}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" name="fullName" value={data.profile.fullName || ""} onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, fullName: event.target.value } }))} required />
              <div className="grid gap-2 text-sm">
                <span className="font-medium text-white/72">Email</span>
                <input
                  readOnly
                  type="email"
                  value={data.profile.email || ""}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/60 outline-none"
                />
              </div>
            <FormField label="Mobile Number" name="mobileNumber" value={data.profile.mobileNumber || ""} onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, mobileNumber: event.target.value } }))} required />
            <FormField label="Store Name" name="storeName" value={data.profile.storeName || ""} onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, storeName: event.target.value } }))} required />
            <FormField label="City" name="city" value={data.profile.city || ""} onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, city: event.target.value } }))} required />
            <FormField label="Address" name="address" value={data.profile.address || ""} onChange={(event) => setData((previous) => ({ ...previous, profile: { ...previous.profile, address: event.target.value } }))} required />
          </div>
          <div className="flex justify-start sm:justify-end">
            <ControlButton type="submit" variant="primary">Save Profile</ControlButton>
          </div>
        </form>
      </GlassPanel>

      <div className="grid gap-6">
        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
          <div className="mt-5 grid gap-3">
            {Object.entries(data.preferences)
              .filter(([key]) => key !== "darkMode")
              .map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePreferenceToggle(key)}
                className="theme-action-button flex items-center justify-between rounded-2xl px-4 py-4 text-sm"
              >
                <span className="capitalize text-white/75">{key.replace(/([A-Z])/g, " $1")}</span>
                <StatusBadge value={value ? "ACTIVE" : "BLOCKED"} />
              </button>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <form className="mt-5 grid gap-4" onSubmit={handlePasswordSave}>
            <FormField label="Current Password" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((previous) => ({ ...previous, currentPassword: event.target.value }))} required />
            <FormField label="New Password" name="newPassword" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((previous) => ({ ...previous, newPassword: event.target.value }))} required />
            <FormField label="Confirm Password" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((previous) => ({ ...previous, confirmPassword: event.target.value }))} required />
            <div className="flex justify-start sm:justify-end">
              <ControlButton type="submit" variant="primary">Update Password</ControlButton>
            </div>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
