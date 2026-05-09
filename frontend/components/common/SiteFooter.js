"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "HOME", href: "/" },
  { label: "PRICING", href: "/pricing" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

function isActivePath(pathname, href) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="w-full pt-6 pb-3 text-center">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-[18px] gap-y-2 text-sm font-semibold tracking-[0.125em] text-slate-600">
          {LINKS.map((link, index) => {
            const active = isActivePath(pathname, link.href);
            return (
              <div key={link.href} className="inline-flex items-center">
                <Link
                  href={link.href}
                  className={[
                    "group relative cursor-pointer px-1 py-1 transition",
                    active ? "text-indigo-700" : "hover:text-indigo-700",
                  ].join(" ")}
                >
                  <span className="relative">
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={[
                        "absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 transition-transform duration-300",
                        active ? "scale-x-100" : "group-hover:scale-x-100",
                      ].join(" ")}
                    />
                  </span>
                </Link>
                {index < LINKS.length - 1 ? (
                  <span className="mx-[18px] inline-flex h-1.5 w-1.5 rounded-full bg-slate-400/70" aria-hidden="true" />
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <Link
            href="https://veaglespace.com/"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer rounded-xl px-2 py-0 font-['Times_New_Roman',serif] text-[15px] font-normal leading-[1.6] tracking-[0.3px] text-[rgba(55,65,81,0.75)] transition hover:text-indigo-700"
          >
            All Rights Reserved © 2026 Veagle Space Technology Pvt. Ltd.
          </Link>
          <a
            href="https://veaglespace.com/"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer rounded-xl px-2 py-0 font-['Times_New_Roman',serif] text-[15px] font-normal leading-[1.6] tracking-[0.3px] text-[rgba(55,65,81,0.65)] transition hover:text-indigo-700"
          >
            Designed &amp; Developed by Veagle Space Technology Pvt. Ltd.
          </a>
        </div>
      </div>
    </footer>
  );
}
