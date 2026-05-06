"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";

export default function CustomersLayout({ children }) {
  return <DashboardShell role="ADMIN">{children}</DashboardShell>;
}

