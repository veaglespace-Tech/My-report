"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({ label, value, onChange, placeholder, name, helper, required = false, status = "idle" }) {
  const [visible, setVisible] = useState(false);

  const statusClassName =
    status === "error"
      ? "border-red-400 focus:ring-2 focus:ring-red-300"
      : status === "success"
        ? "border-green-300 focus:ring-2 focus:ring-cyan-300"
        : "focus:ring-2 focus:ring-cyan-300";

  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--muted-strong)]">{label}</span>
      <div className="relative">
        <input
          required={required}
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`theme-input w-full rounded-xl bg-white/70 px-5 py-4 pr-12 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 ${statusClassName}`}
        />
        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          className="theme-action-button absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {helper ? <span className="text-xs text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}
