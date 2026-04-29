"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({ label, value, onChange, placeholder, name, helper, required = false }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-white/72">{label}</span>
      <div className="relative">
        <input
          required={required}
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="theme-input w-full rounded-2xl px-4 py-3 pr-12 text-sm outline-none transition"
        />
        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          className="theme-action-button absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {helper ? <span className="text-xs text-[var(--muted)]">{helper}</span> : null}
    </label>
  );
}
