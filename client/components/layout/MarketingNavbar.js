"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Menu, Store, X } from "lucide-react";
import { LogoMark } from "@/components/common/LogoMark";
import { withBasePath } from "@/lib/site-path";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function isActivePath(pathname, href) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={withBasePath(href)}
      className={[
        "group relative inline-flex min-w-[88px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
        "text-[var(--muted-strong)] hover:-translate-y-0.5 hover:text-[var(--foreground)]",
        "before:absolute before:inset-x-4 before:bottom-1 before:h-px before:origin-center before:scale-x-0 before:bg-gradient-to-r before:from-cyan-400 before:via-indigo-400 before:to-fuchsia-400 before:transition-transform before:duration-300 before:content-['']",
        "after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-cyan-400/0 after:via-indigo-400/0 after:to-fuchsia-400/0 after:opacity-0 after:transition-opacity after:duration-300 after:content-['']",
        "hover:before:scale-x-100 hover:after:opacity-100 hover:after:from-cyan-400/10 hover:after:via-indigo-400/10 hover:after:to-fuchsia-400/10 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_18px_rgba(99,102,241,0.18)]",
        active
          ? "text-[var(--foreground)] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_18px_rgba(99,102,241,0.22)] before:scale-x-100 after:opacity-100 after:from-cyan-400/12 after:via-indigo-400/12 after:to-fuchsia-400/12"
          : "",
      ].join(" ")}
    >
      <span className="relative z-10 transition-transform duration-300 group-hover:scale-[1.03]">{children}</span>
    </Link>
  );
}

export function MarketingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeIndex = useMemo(() => NAV_LINKS.findIndex((link) => isActivePath(pathname, link.href)), [pathname]);

  return (
    <header className="theme-navbar fixed left-0 right-0 top-0 z-50 w-full border-b border-black/10 backdrop-blur-xl transition-colors duration-300">
      <nav className="mx-auto flex h-[88px] w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href={withBasePath("/")} className="group inline-flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-200 via-indigo-200 to-purple-200 shadow-lg shadow-indigo-500/10 ring-1 ring-black/10 transition group-hover:brightness-105 dark:ring-white/10">
            <Store className="h-9 w-9 text-slate-900" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">MyReport</span>
            <span className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">My Store</span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-2 shadow-[0_12px_30px_rgba(3,10,25,0.08)] backdrop-blur-xl">
            {NAV_LINKS.map((link, index) => {
              const active = index === activeIndex;
              return (
                <NavLink key={link.href} href={link.href} active={active}>
                  {link.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="btn btn-sm group relative isolate overflow-hidden rounded-full border-0 bg-slate-950 px-[1px] text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition duration-300 before:absolute before:inset-[-120%] before:-z-10 before:animate-[spin_3.8s_linear_infinite] before:bg-[conic-gradient(from_90deg,#22d3ee,#6366f1,#d946ef,#facc15,#22d3ee)] before:content-[''] hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_16px_36px_rgba(99,102,241,0.34),0_0_0_1px_rgba(255,255,255,0.4)] active:scale-[0.98]"
            suppressHydrationWarning={true}
          >
            <span className="relative z-10 flex h-full items-center gap-2 rounded-full bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.72))] px-3.5 backdrop-blur-xl transition group-hover:bg-[linear-gradient(135deg,rgba(8,47,73,0.86),rgba(49,46,129,0.76))]">
              <span className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/25 transition duration-300 group-hover:translate-x-0.5 group-hover:bg-white/25">
                <LogIn size={14} className="transition duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.95)] transition group-hover:scale-125" />
              Login
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/register/store-details")}
            className="theme-primary-button frost-line rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/20 active:translate-y-0"
            suppressHydrationWarning={true}
          >
            Get Started
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="theme-action-button inline-flex items-center justify-center rounded-2xl p-2 transition md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-[var(--stroke)] bg-[var(--surface-sidebar)] shadow-sm backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-6xl gap-2 px-4 py-4 sm:px-6">
            <div className="grid gap-1 rounded-3xl border border-[var(--stroke)] bg-[var(--surface-soft)] p-2">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={withBasePath(link.href)}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-white/10 text-[var(--foreground)] ring-1 ring-[var(--stroke)] dark:bg-white/5"
                        : "text-[var(--muted-strong)] hover:bg-white/10 hover:text-[var(--foreground)] dark:hover:bg-white/5",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-2 rounded-3xl border border-[var(--stroke)] bg-[var(--surface-soft)] p-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/login");
                }}
                className="btn group relative isolate justify-start overflow-hidden rounded-2xl border-0 bg-slate-950 p-[1px] text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition before:absolute before:inset-[-140%] before:-z-10 before:animate-[spin_4s_linear_infinite] before:bg-[conic-gradient(from_90deg,#22d3ee,#6366f1,#d946ef,#facc15,#22d3ee)] before:content-[''] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.99]"
              >
                <span className="relative z-10 flex h-full w-full items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.72))] px-4 backdrop-blur-xl">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 transition group-hover:translate-x-0.5 group-hover:bg-white/25">
                    <LogIn size={15} className="transition group-hover:translate-x-0.5" />
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.95)] transition group-hover:scale-125" />
                  Login
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/register/store-details");
                }}
                className="theme-primary-button frost-line rounded-2xl px-4 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
