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
      ? "input-error"
      : status === "success"
        ? "input-success"
        : "focus:border-primary focus:ring-2 focus:ring-primary/20";

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
          className={`input input-bordered h-14 w-full bg-base-100/80 pr-12 text-sm text-base-content shadow-sm transition-all duration-300 placeholder:text-base-content/40 ${statusClassName}`}
          {...(inputProps || {})}
        />
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          className="btn btn-ghost btn-circle btn-sm absolute right-3 top-1/2 -translate-y-1/2"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {helper ? <span className={`text-xs ${status === "error" ? "text-red-500" : "text-[var(--muted)]"}`}>{helper}</span> : null}
    </label>
  );
}
