import {
  BarChart3,
  BellRing,
  Boxes,
  CreditCard,
  FileBarChart2,
  FileText,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShieldCheck,
  Store,
  Users,
  WalletCards,
} from "lucide-react";

export const superAdminNav = [
  { label: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
  { label: "Admins", href: "/superadmin/admins", icon: ShieldCheck },
  { label: "Stores", href: "/superadmin/stores", icon: Store },
  { label: "Plans", href: "/superadmin/plans", icon: WalletCards },
  { label: "Invoices", href: "/superadmin/invoices", icon: CreditCard },
  { label: "Reports", href: "/superadmin/reports", icon: FileBarChart2 },
  { label: "Settings", href: "/superadmin/settings", icon: Settings },
];

export const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Products", href: "/admin/products", icon: PackageSearch },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
  { label: "My Plan", href: "/admin/my-plan", icon: Boxes },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function resolvePageMeta(pathname, role) {
  const collection = role === "SUPER_ADMIN" ? superAdminNav : adminNav;
  const current = collection.find((item) => pathname.startsWith(item.href));

  return {
    title: current?.label ?? "Dashboard",
    subtitle:
      role === "SUPER_ADMIN"
        ? "Control pricing, onboarding, revenue visibility, and platform health."
        : "Operate your store, sales, stock, and reporting from one workspace.",
    icon: current?.icon ?? BellRing,
  };
}
