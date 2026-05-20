"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Store } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { adminNav, resolvePageMeta, superAdminNav } from "@/lib/navigation";
import { ProfileAvatar } from "@/components/common/ProfileAvatar";
import { clearSession } from "@/lib/session";
import { clearAuth } from "@/redux/slices/authSlice";
import { setSidebarOpen } from "@/redux/slices/uiSlice";

const subscribeToClientSnapshot = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function ProfileChip({ profile, mounted, size = "sm" }) {
  const avatarSize = size === "md" ? 40 : 32;

  return (
    <div className="card card-compact min-w-0 border border-base-300/70 bg-base-100/75 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="avatar placeholder p-2">
          <ProfileAvatar
            profile={mounted ? profile : null}
            size={avatarSize}
            className="border-0 bg-primary text-primary-content ring ring-primary/15 shadow-none"
            textClassName="text-xs text-primary-content"
          />
        </div>
        <div className="min-w-0 flex-1 py-2 pr-3 text-left leading-tight">
          <div suppressHydrationWarning className="truncate text-sm font-bold text-base-content">
            {profile?.fullName || "MyReport User"}
          </div>
          <div suppressHydrationWarning className="mt-0.5 truncate text-xs text-base-content/55">
            {profile?.email || "Workspace ready"}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ role, pathname, profile, mounted = false, onNavigate, onLogout }) {
  const items = role === "SUPER_ADMIN" ? superAdminNav : adminNav;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto pr-1">
      <div className="mb-6 sm:mb-8">
        <div className="card card-compact border border-base-300/70 bg-base-100/85 shadow-xl">
          <div className="flex items-center gap-4 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-box bg-primary text-primary-content shadow-lg shadow-primary/20">
            <Store className="h-8 w-8" />
          </div>

          <div className="flex min-w-0 flex-col leading-tight">
            <h1 className="truncate text-3xl font-bold text-base-content">MyReport</h1>
            <p className="text-xs uppercase tracking-[0.32em] text-base-content/55">
              {role === "SUPER_ADMIN" ? "Platform HQ" : "My Store"}
            </p>
          </div>
          </div>
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <ProfileChip profile={profile} mounted={mounted} size="md" />
      </div>

      <nav className="menu relative grid gap-1.5 p-0">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`relative group flex items-center gap-3.5 rounded-box px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                active
                  ? "bg-primary text-primary-content shadow-lg shadow-primary/20"
                  : "text-base-content/65 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-tab"
                  className="absolute inset-0 rounded-box border border-primary-content/10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon 
                size={20} 
                className={`relative z-10 shrink-0 transition-transform duration-300 ${
                  active 
                    ? "scale-110 text-primary-content" 
                    : "group-hover:scale-110"
                }`} 
              />
              <span className="relative z-10 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 sm:pt-8">
        <button
          type="button"
          onClick={onLogout}
          className="btn btn-primary w-full gap-2 shadow-lg shadow-primary/20"
        >
          <LogOut size={16} />
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
  const mounted = useSyncExternalStore(subscribeToClientSnapshot, getClientSnapshot, getServerSnapshot);
  const profile = useSelector((state) => state.auth.profile);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
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
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="theme-sidebar hidden w-[280px] shrink-0 bg-base-100/80 p-6 backdrop-blur-2xl lg:block xl:w-[300px]">
          <SidebarContent role={role} pathname={pathname} profile={profile} mounted={mounted} onLogout={handleLogout} />
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
                className="theme-sidebar-strong h-full w-[min(85vw,20rem)] max-w-full bg-base-100/95 p-5 shadow-2xl sm:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <SidebarContent
                  role={role}
                  pathname={pathname}
                  profile={profile}
                  mounted={mounted}
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
              <div className="card border border-base-300/70 bg-base-100/80 px-4 py-4 shadow-xl backdrop-blur-xl sm:px-5 lg:px-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3 sm:items-center">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                      <button
                        type="button"
                        onClick={() => dispatch(setSidebarOpen(true))}
                        className="btn btn-square btn-ghost shrink-0 lg:hidden"
                        aria-label="Open navigation menu"
                      >
                        <Menu size={18} />
                      </button>
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-box bg-primary/10 text-primary sm:flex">
                          <PageIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <h1 className="truncate text-xl font-bold tracking-tight text-base-content sm:text-2xl">
                            {pageMeta.title}
                          </h1>
                          <p className="mt-1 max-w-2xl text-sm leading-6 text-base-content/60">
                            {pageMeta.subtitle}
                          </p>
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
