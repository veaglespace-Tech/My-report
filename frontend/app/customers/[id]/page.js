"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { customerService } from "@/services/customerService";
import { GlassPanel } from "@/components/common/GlassPanel";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { SectionHeading } from "@/components/common/SectionHeading";
import { formatCurrency, formatDate } from "@/lib/format";

function Table({ rows, customer }) {
  const customerName = customer?.fullName ?? customer?.customerName ?? "-";
  const customerMobile = customer?.mobileNumber ?? customer?.mobile ?? "";
  const customerAddress = customer?.address ?? customer?.city ?? "";

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/30">
      <table className="w-full min-w-[720px] text-left text-sm text-slate-700 dark:text-white/75">
        <thead className="text-xs uppercase text-slate-500 dark:text-white/45">
          <tr className="border-b border-slate-200/70 dark:border-white/10">
            <th className="px-5 py-3">Customer Name</th>
            <th className="px-5 py-3">Order Date</th>
            <th className="px-5 py-3">Product</th>
            <th className="px-5 py-3">Qty</th>
            <th className="px-5 py-3">Price</th>
            <th className="px-5 py-3">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60 dark:divide-white/8">
          {rows.map((row) => (
            <tr key={row.id} className="transition hover:bg-slate-900/[0.03] dark:hover:bg-white/5">
              <td
                className="px-5 py-3 font-semibold text-slate-900 dark:text-white/90"
                title={[customerMobile, customerAddress].filter(Boolean).join(" • ")}
              >
                {row.customerName || customerName}
              </td>
              <td className="whitespace-nowrap px-5 py-3">{formatDate(row.orderDate)}</td>
              <td className="px-5 py-3">{row.productName || "-"}</td>
              <td className="px-5 py-3">{row.quantity ?? "-"}</td>
              <td className="whitespace-nowrap px-5 py-3">{formatCurrency(row.price || 0)}</td>
              <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900 dark:text-white/90">
                {formatCurrency(row.totalAmount || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const canFilter = useMemo(() => Boolean(startDate || endDate), [startDate, endDate]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((row) =>
      [row.customerName, row.productName, row.orderDate, row.id].join(" ").toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  async function loadInitial(customerId) {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line no-console
      console.log("CustomerDetails: loading", { customerId });
      const [customer, customerOrders] = await Promise.all([
        customerService.getCustomer(customerId),
        customerService.getCustomerOrders(customerId),
      ]);
      // eslint-disable-next-line no-console
      console.log("CustomerDetails: loaded", { customer, orders: customerOrders });
      setDetails(customer);
      setOrders(customerOrders || []);
    } catch (e) {
      setError(e?.message || "Failed to load customer.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInitial(id);
  }, [id]);

  async function applyFilters() {
    setLoading(true);
    setError(null);
    try {
      const customerOrders = await customerService.getCustomerOrders(id, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setOrders(customerOrders || []);
    } catch (e) {
      setError(e?.message || "Failed to filter orders.");
    } finally {
      setLoading(false);
    }
  }

  async function clearFilters() {
    setStartDate("");
    setEndDate("");
    setLoading(true);
    setError(null);
    try {
      const customerOrders = await customerService.getCustomerOrders(id);
      setOrders(customerOrders || []);
    } catch (e) {
      setError(e?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !details) return <LoadingSkeleton rows={3} />;

  const mobile = details?.mobileNumber ?? details?.mobile ?? "-";
  const address = details?.address ?? details?.city ?? "-";
  const totalBilling = details?.totalBilling ?? details?.totalSpent ?? 0;
  const totalOrders = details?.totalOrders ?? details?.purchaseCount ?? 0;

  return (
    <div className="grid gap-6">
      <SectionHeading
        eyebrow="Customers"
        title={details?.fullName || "Customer Details"}
        description="View profile and complete purchase history."
      />

      {error ? (
        <GlassPanel className="p-5">
          <div className="text-sm font-medium text-rose-600 dark:text-rose-100">{error}</div>
        </GlassPanel>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <GlassPanel className="p-5 lg:col-span-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">Mobile</div>
              <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white/90">{mobile || "-"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">Address</div>
              <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white/90">{address || "-"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">Total Billing</div>
              <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white/90">{formatCurrency(totalBilling || 0)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/6">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">Total Orders</div>
              <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white/90">{totalOrders ?? 0}</div>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-base font-semibold tracking-tight text-slate-900 dark:text-white/90">Purchase History</div>
          <div className="text-xs text-slate-500 dark:text-white/55">{filteredOrders.length} rows</div>
        </div>

        <GlassPanel className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-[var(--muted-strong)]">
                Customer Search
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name (or product)"
                  className="theme-input h-12 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 transition dark:text-white dark:placeholder:text-white/40"
                />
              </label>
              <label className="grid gap-2 text-sm text-[var(--muted-strong)]">
                Start Date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="theme-input h-12 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none transition dark:text-white"
                />
              </label>
              <label className="grid gap-2 text-sm text-[var(--muted-strong)]">
                End Date
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="theme-input h-12 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none transition dark:text-white"
                />
              </label>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={applyFilters}
                disabled={loading || !canFilter}
                className="theme-primary-button inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "Apply Filters"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  clearFilters();
                }}
                disabled={loading}
                className="theme-action-button inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-[var(--muted)]">
            Search and select a date range and apply to filter this customer’s order history.
          </div>
        </GlassPanel>

        {loading ? (
          <LoadingSkeleton rows={2} />
        ) : orders.length === 0 ? (
          <GlassPanel className="p-6">
            <div className="text-sm font-medium text-slate-600 dark:text-white/70">No Purchase History Found</div>
          </GlassPanel>
        ) : (
          <Table rows={filteredOrders} customer={details} />
        )}
      </div>
    </div>
  );
}
