"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 shadow-sm backdrop-blur-md transition">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/12 to-purple-600/10 ring-1 ring-black/10 transition group-hover:brightness-110">
            <LogoMark className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold tracking-tight text-gray-900">Myreport</span>
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
                  "hover:bg-black/5 hover:text-gray-900",
                  active ? "bg-black/5 text-gray-900 shadow-sm ring-1 ring-black/10" : "text-gray-800/80",
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
            onClick={() => dispatch(setThemeMode(isLight ? "dark" : "light"))}
            className="theme-action-button inline-flex h-11 w-11 items-center justify-center rounded-2xl transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            aria-label={`Switch to ${themeLabel.toLowerCase()} mode`}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/5 text-gray-900">
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded-full px-3 py-2 text-sm font-semibold text-gray-800/80 transition hover:bg-black/5 hover:text-gray-900"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
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
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/20 bg-white/70 shadow-sm backdrop-blur-md md:hidden">
          <div className="mx-auto grid max-w-6xl gap-2 px-4 py-4 sm:px-6">
            <div className="grid gap-1 rounded-3xl border border-black/10 bg-white/30 p-2">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active ? "bg-black/5 text-gray-900 ring-1 ring-black/10" : "text-gray-800/80 hover:bg-black/5 hover:text-gray-900",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-2 rounded-3xl border border-black/10 bg-white/30 p-2">
              <button
                type="button"
                onClick={() => dispatch(setThemeMode(isLight ? "dark" : "light"))}
                className="theme-action-button inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition"
                aria-label={`Switch to ${themeLabel.toLowerCase()} mode`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/5 text-gray-900">
                  {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/login");
                }}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-gray-800/80 transition hover:bg-black/5 hover:text-gray-900"
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
