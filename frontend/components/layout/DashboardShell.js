"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { adminNav, superAdminNav } from "@/lib/navigation";
import { clearSession } from "@/lib/session";
import { clearAuth } from "@/redux/slices/authSlice";
import { setSidebarOpen } from "@/redux/slices/uiSlice";

function SidebarContent({ role, pathname, profile, onNavigate, onLogout }) {
  const items = role === "SUPER_ADMIN" ? superAdminNav : adminNav;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-400 to-violet-400 font-black text-slate-950 shadow-[0_0_20px_rgba(79,209,197,0.4)]">
          <Sparkles size={14} className="absolute -right-1 -top-1 text-cyan-300 drop-shadow-md" />
          MR
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight">MyReport</div>
          <div className="text-xs uppercase tracking-[0.26em] text-white/45">
            {role === "SUPER_ADMIN" ? "Platform HQ" : "Store OS"}
          </div>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent p-4 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative z-10 text-xs uppercase tracking-[0.24em] text-white/50">Signed in</div>
        <div className="relative z-10 mt-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold shadow-inner ring-1 ring-white/20">
            {mounted && profile?.fullName
              ? profile.fullName
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
              : "MR"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{mounted && profile?.fullName ? profile.fullName : "MyReport User"}</div>
            <div className="truncate text-xs text-[var(--muted)]">{mounted && profile?.email ? profile.email : "Workspace ready"}</div>
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

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={onLogout}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition-all hover:bg-rose-500/20 hover:text-rose-100 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
        >
          <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
          Secure Logout
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

  const handleLogout = () => {
    clearSession();
    dispatch(clearAuth());
    dispatch(setSidebarOpen(false));
    router.push("/");
  };

  const closeSidebar = () => dispatch(setSidebarOpen(false));

  return (
    <div className="dashboard-shell relative">
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[1000px] -translate-x-1/2 opacity-20 blur-[100px]">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/30 via-violet-500/10 to-transparent" />
      </div>
      <div className="relative z-10 flex min-h-screen">
        <aside className="theme-sidebar hidden w-[300px] p-6 backdrop-blur-2xl lg:block">
          <SidebarContent role={role} pathname={pathname} profile={profile} onLogout={handleLogout} />
        </aside>

        <AnimatePresence>
          {sidebarOpen ? (
            <motion.div
              className="theme-overlay fixed inset-0 z-40 backdrop-blur-md lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.aside
                initial={{ x: -28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="theme-sidebar-strong h-full w-[290px] p-6"
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

        <div className="min-w-0 flex-1">
          <main className="px-4 pb-10 pt-8 md:px-8 md:pt-10">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
              className="content-max mx-auto"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function DashboardContentWrapper({ children }) {
  return <div className="grid gap-6">{children}</div>;
}
