"use client";

import { usePathname } from "next/navigation";
import { MarketingNavbar } from "@/components/layout/MarketingNavbar";

function shouldHideMarketingNavbar(pathname) {
  if (!pathname) return false;
  return pathname.startsWith("/admin") || pathname.startsWith("/superadmin");
}

export function RootChrome({ children }) {
  const pathname = usePathname();
  const hideNavbar = shouldHideMarketingNavbar(pathname);

  if (hideNavbar) return children;

  return (
    <div className="flex min-h-full flex-col">
      <MarketingNavbar />
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}

