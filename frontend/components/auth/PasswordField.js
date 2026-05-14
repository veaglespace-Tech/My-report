"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  name,
  helper,
  autoComplete = "new-password",
  required = false,
  status = "idle",
  inputProps,
}) {
  const [visible, setVisible] = useState(false);

  const statusClassName =
    status === "error"
      ? "border-red-400 shadow-[0_0_0_1px_rgba(248,113,113,0.28)] focus:border-red-400 focus:ring-2 focus:ring-red-300/80 focus:shadow-[0_0_24px_rgba(248,113,113,0.22)]"
      : status === "success"
        ? "border-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.22)] focus:border-emerald-400 focus:ring-2 focus:ring-cyan-300/70 focus:shadow-[0_0_24px_rgba(45,212,191,0.24)]"
        : "border-transparent focus:border-cyan-300 focus:ring-2 focus:ring-violet-300/60 focus:shadow-[0_0_24px_rgba(34,211,238,0.22)]";

  return (
    <label className="grid w-full content-start gap-2 text-sm">
      <span className="font-medium text-[var(--muted-strong)]">{label}</span>
      <div className="relative">
        <input
          suppressHydrationWarning
          required={required}
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`theme-input h-14 w-full rounded-xl bg-white/70 px-5 py-4 pr-12 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 ${statusClassName}`}
          {...(inputProps || {})}
        />
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          className="theme-action-button absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {helper ? <span className="text-xs text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}
