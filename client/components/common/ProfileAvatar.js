"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export function getProfileInitials(profile, fallback = "MR") {
  const name = String(profile?.fullName || "").trim();
  if (!name) return fallback;
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

export function resolveProfileAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  const value = String(avatarUrl).trim();
  if (!value) return null;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) return value;
  const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const isBrowser = typeof window !== "undefined";
  const isLiveBrowser = isBrowser && !["localhost", "127.0.0.1"].includes(window.location.hostname);
  const browserOrigin = isBrowser ? window.location.origin : "";
  const base = isLiveBrowser && /localhost|127\.0\.0\.1/.test(configuredApiBase) ? browserOrigin : configuredApiBase;
  const apiBase = (base || browserOrigin || "http://localhost:8080").replace(/\/api\/?$/, "");
  return `${apiBase}${value.startsWith("/") ? value : `/${value}`}`;
}

export function ProfileAvatar({ profile, src, size = 80, className, textClassName, fallback = "MR", priority = false }) {
  const resolvedSrc = resolveProfileAvatarUrl(src ?? profile?.avatarUrl);
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = resolvedSrc && failedSrc !== resolvedSrc;

  return (
    <div
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-200/70 bg-gradient-to-br from-cyan-100 via-white to-violet-100 shadow-[0_0_0_4px_rgba(34,211,238,0.08)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={resolvedSrc}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority={priority}
          unoptimized
          onError={() => setFailedSrc(resolvedSrc)}
        />
      ) : (
        <span className={clsx("select-none text-xl font-bold text-teal-800", textClassName)}>
          {getProfileInitials(profile, fallback)}
        </span>
      )}
    </div>
  );
}
