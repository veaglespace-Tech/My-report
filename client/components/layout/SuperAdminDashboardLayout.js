import { DashboardShell } from "@/components/layout/DashboardShell";

export default function SuperAdminDashboardLayout({ children }) {
  return <DashboardShell role="SUPER_ADMIN">{children}</DashboardShell>;
}
