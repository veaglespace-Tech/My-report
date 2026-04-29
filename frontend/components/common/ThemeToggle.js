"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setThemeMode } from "@/redux/slices/uiSlice";
import { persistThemeMode } from "@/lib/theme";

export function ThemeToggle({ compact = false }) {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.ui.themeMode);
  const isLight = themeMode === "light";

  const handleToggle = () => {
    const nextTheme = isLight ? "dark" : "light";
    dispatch(setThemeMode(nextTheme));
    persistThemeMode(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`theme-action-button rounded-2xl ${compact ? "px-3 py-3" : "px-4 py-3"} text-sm font-semibold transition`}
      aria-label={`Switch to ${isLight ? "night" : "light"} mode`}
    >
      <span className="inline-flex items-center gap-2">
        {isLight ? <MoonStar size={16} /> : <SunMedium size={16} />}
        <span className={compact ? "hidden md:inline" : ""}>{isLight ? "Night Mode" : "Light Mode"}</span>
      </span>
    </button>
  );
}
