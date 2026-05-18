"use client";

import { usePathname } from "next/navigation";
import SuperAdminDashboardLayout from "@/components/layout/SuperAdminDashboardLayout";

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/superadmin/login") {
    return children;
  }

  return <SuperAdminDashboardLayout>{children}</SuperAdminDashboardLayout>;
}
