"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/admin/login" || pathname === "/admin/signup") {
    return children;
  }

  return <DashboardShell role="ADMIN">{children}</DashboardShell>;
}
