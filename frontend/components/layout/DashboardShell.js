"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { adminNav, resolvePageMeta, superAdminNav } from "@/lib/navigation";
import { clearSession } from "@/lib/session";
import { clearAuth } from "@/redux/slices/authSlice";
import { setSidebarOpen } from "@/redux/slices/uiSlice";
import { LogoMark } from "@/components/common/LogoMark";

function SidebarContent({ role, pathname, profile, onNavigate, onLogout }) {
  const items = role === "SUPER_ADMIN" ? superAdminNav : adminNav;
  const profileName = profile?.fullName || "MyReport User";
  const profileInitials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
    : "MR";
  const profileEmail = profile?.email || "Workspace ready";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto pr-1">
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/18 to-indigo-300/14 ring-1 ring-white/10 shadow-[0_0_20px_rgba(79,209,197,0.25)]">
          <LogoMark className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight">MyReport</div>
          <div className="text-xs uppercase tracking-[0.26em] text-white/45">
            {role === "SUPER_ADMIN" ? "Platform HQ" : "Store OS"}
          </div>
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent p-4 shadow-2xl backdrop-blur-xl sm:mb-8">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative z-10 text-xs uppercase tracking-[0.24em] text-white/50">Signed in</div>
        <div className="relative z-10 mt-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold shadow-inner ring-1 ring-white/20">
            {profileInitials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{profileName}</div>
            <div className="truncate text-xs text-[var(--muted)]">{profileEmail}</div>
          </div>
        </div>
      </div>

      <nav className="relative grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`relative group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${active ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-tab"
                  className="absolute inset-0 rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 shadow-sm"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} className={`relative z-10 transition-transform duration-300 ${active ? "scale-110 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]" : "group-hover:scale-110"}`} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 sm:pt-8">
        <button
          type="button"
          onClick={onLogout}
          className="group flex w-full items-center justify-start gap-3 rounded-2xl border border-rose-300/20 bg-gradient-to-r from-rose-600/25 to-fuchsia-600/15 px-4 py-3 text-sm font-semibold text-rose-100 shadow-[0_10px_30px_rgba(15,23,42,0.25)] ring-1 ring-white/10 transition hover:from-rose-600/35 hover:to-fuchsia-600/25 hover:shadow-[0_16px_44px_rgba(244,63,94,0.18)] active:scale-[0.99]"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
          </span>
          <span className="truncate">Secure Logout</span>
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ role, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.profile);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const navItems = role === "SUPER_ADMIN" ? superAdminNav : adminNav;
  const pageMeta = resolvePageMeta(pathname, role);
  const PageIcon = pageMeta.icon;

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    clearSession();
    dispatch(clearAuth());
    dispatch(setSidebarOpen(false));
    router.push("/");
  };

  const closeSidebar = () => dispatch(setSidebarOpen(false));

  return (
    <div className="dashboard-shell relative overflow-x-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[1000px] -translate-x-1/2 opacity-20 blur-[100px]">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/30 via-violet-500/10 to-transparent" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="theme-sidebar hidden w-[280px] shrink-0 p-6 backdrop-blur-2xl lg:block xl:w-[300px]">
          <SidebarContent role={role} pathname={pathname} profile={profile} onLogout={handleLogout} />
        </aside>

        <AnimatePresence>
          {sidebarOpen ? (
            <motion.div
              className="theme-overlay fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
            >
              <motion.aside
                initial={{ x: -32, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 28 }}
                className="theme-sidebar-strong h-full w-[min(85vw,20rem)] max-w-full p-5 shadow-2xl sm:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <SidebarContent
                  role={role}
                  pathname={pathname}
                  profile={profile}
                  onNavigate={closeSidebar}
                  onLogout={handleLogout}
                />
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1 overflow-hidden">
          <main className="px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
              className="content-max mx-auto flex max-w-full flex-col gap-4 sm:gap-6"
            >
              <div className="theme-navbar frost-line overflow-hidden rounded-[28px] px-4 py-4 shadow-[0_16px_40px_rgba(3,10,25,0.18)] sm:px-5 lg:px-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3 sm:items-center">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                      <button
                        type="button"
                        onClick={() => dispatch(setSidebarOpen(true))}
                        className="theme-action-button inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl lg:hidden"
                        aria-label="Open navigation menu"
                      >
                        <Menu size={18} />
                      </button>
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="theme-soft-panel hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-cyan-200 sm:flex">
                          <PageIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
                            {role === "SUPER_ADMIN" ? "Platform command" : "Store workspace"}
                          </div>
                          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
                            {pageMeta.title}
                          </h1>
                          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                            {pageMeta.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden min-w-0 items-center gap-3 sm:flex">
                      <div className="theme-soft-panel min-w-0 rounded-2xl px-4 py-3 text-right">
                        <div className="truncate text-sm font-semibold">
                          {profile?.fullName || "MyReport User"}
                        </div>
                        <div className="truncate text-xs text-[var(--muted)]">
                          {profile?.email || "Workspace ready"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function DashboardContentWrapper({ children }) {
  return <div className="grid max-w-full gap-4 sm:gap-6">{children}</div>;
}
