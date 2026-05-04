"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Menu, X } from "lucide-react";

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

export function MarketingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeIndex = useMemo(() => NAV_LINKS.findIndex((link) => isActivePath(pathname, link.href)), [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-[color-mix(in_srgb,var(--panel)_80%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/18 to-indigo-300/14 ring-1 ring-white/10 transition group-hover:brightness-110">
            <BarChart3 className="h-5 w-5 text-cyan-200" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">My</span>
            <span className="bg-gradient-to-r from-cyan-200 to-indigo-200 bg-clip-text text-transparent">report</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link, index) => {
            const active = index === activeIndex;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "relative rounded-full px-4 py-2 text-sm font-medium transition",
                  "hover:bg-white/6 hover:text-white",
                  active ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" : "text-white/70",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded-full px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/6 hover:text-white"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="theme-primary-button frost-line rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
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
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/8 bg-[color-mix(in_srgb,var(--panel)_88%,transparent)] backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-6xl gap-2 px-4 py-4 sm:px-6">
            <div className="grid gap-1 rounded-3xl border border-white/8 bg-white/5 p-2">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active ? "bg-white/10 text-white ring-1 ring-white/10" : "text-white/75 hover:bg-white/6 hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-2 rounded-3xl border border-white/8 bg-white/5 p-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/login");
                }}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white/80 transition hover:bg-white/6 hover:text-white"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/register");
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
