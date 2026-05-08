"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Moon, Store, Sun, X } from "lucide-react";
import { LogoMark } from "@/components/common/LogoMark";
import { setThemeMode } from "@/redux/slices/uiSlice";

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
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.ui.themeMode);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeIndex = useMemo(() => NAV_LINKS.findIndex((link) => isActivePath(pathname, link.href)), [pathname]);
  const isLight = themeMode === "light";
  const themeLabel = isLight ? "Dark" : "Light";

  return (
    <header className="theme-navbar sticky top-0 z-50 w-full shadow-sm backdrop-blur-xl transition-colors duration-300">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-200 via-indigo-200 to-purple-200 shadow-lg shadow-indigo-500/10 ring-1 ring-black/10 transition group-hover:brightness-105 dark:ring-white/10">
            <Store className="h-9 w-9 text-slate-900" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">MyReport</span>
            <span className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">My Store</span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-8">
          {NAV_LINKS.map((link, index) => {
            const active = index === activeIndex;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "relative rounded-full px-4 py-2 text-sm font-medium transition",
                  "hover:bg-white/10 hover:text-[var(--foreground)] dark:hover:bg-white/5",
                  active
                    ? "bg-white/10 text-[var(--foreground)] shadow-sm ring-1 ring-white/25 dark:bg-white/5"
                    : "text-[var(--muted-strong)]",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => dispatch(setThemeMode(isLight ? "dark" : "light"))}
            className="theme-action-button inline-flex h-11 w-11 items-center justify-center rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            aria-label={`Switch to ${themeLabel.toLowerCase()} mode`}
          >
            <span className="theme-soft-panel inline-flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--foreground)]">
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted-strong)] transition hover:bg-white/10 hover:text-[var(--foreground)] dark:hover:bg-white/5"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => router.push("/register/store-details")}
            className="theme-primary-button frost-line rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/20 active:translate-y-0"
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
                    href={link.href}
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
                onClick={() => dispatch(setThemeMode(isLight ? "dark" : "light"))}
                className="theme-action-button inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition"
                aria-label={`Switch to ${themeLabel.toLowerCase()} mode`}
              >
                <span className="theme-soft-panel inline-flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--foreground)]">
                  {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/login");
                }}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[var(--muted-strong)] transition hover:bg-white/10 hover:text-[var(--foreground)] dark:hover:bg-white/5"
              >
                Login
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
