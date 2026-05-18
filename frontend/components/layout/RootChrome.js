"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MarketingNavbar } from "@/components/layout/MarketingNavbar";
import { SiteFooter } from "@/components/common/SiteFooter";

function shouldHideMarketingNavbar(pathname) {
  if (!pathname) return false;
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/signup" ||
    pathname === "/admin/register" ||
    pathname === "/superadmin/login" ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return false;
  }
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/customers")
  );
}

function isAuthPage(pathname) {
  return (
    pathname === "/admin/login" ||
    pathname === "/admin/signup" ||
    pathname === "/admin/register" ||
    pathname === "/superadmin/login" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/register/")
  );
}

export function RootChrome({ children }) {
  const pathname = usePathname();
  const hideNavbar = shouldHideMarketingNavbar(pathname);
  const authPage = isAuthPage(pathname);

  useEffect(() => {
    if (pathname === "/") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  if (hideNavbar) return children;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(135deg,#ecfdf5_0%,#eff6ff_52%,#fffbeb_100%)] text-base-content">
      {authPage ? null : <MarketingNavbar />}
      <main className={`relative z-10 mx-auto w-full px-6 ${authPage ? "flex min-h-screen max-w-none items-center justify-center py-10" : "max-w-[1280px] flex-1 pb-12 pt-[120px]"}`}>
        {children}
      </main>
      {authPage ? null : <SiteFooter />}
    </div>
  );
}
