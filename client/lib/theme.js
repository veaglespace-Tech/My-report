const THEME_KEY = "myreport_theme";

export function getStoredThemeMode() {
  if (typeof window === "undefined") {
    return null;
  }

  const theme = localStorage.getItem(THEME_KEY);
  return theme === "light" || theme === "dark" ? theme : null;
}

export function persistThemeMode(themeMode) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(THEME_KEY, themeMode);
}

export function resolveThemeMode(preference) {
  const storedTheme = getStoredThemeMode();
  if (storedTheme) {
    return storedTheme;
  }

  if (typeof preference === "boolean") {
    return preference ? "dark" : "light";
  }

  return "dark";
}

export function applyThemeMode(themeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = themeMode;
  if (themeMode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  document.documentElement.style.colorScheme = themeMode === "light" ? "light" : "dark";
}
