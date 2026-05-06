"use client";

import { usePathname } from "next/navigation";
import { MarketingNavbar } from "@/components/layout/MarketingNavbar";

function shouldHideMarketingNavbar(pathname) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/customers")
  );
}

export function RootChrome({ children }) {
  const pathname = usePathname();
  const hideNavbar = shouldHideMarketingNavbar(pathname);

  if (hideNavbar) return children;

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute -bottom-36 -right-36 h-[32rem] w-[32rem] rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>
      <MarketingNavbar />
      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}
