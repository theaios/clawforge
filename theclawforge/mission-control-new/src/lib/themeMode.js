export const THEME_STORAGE_KEY = "cf-theme";
export const THEME_MODES = ["dark", "light", "trippy"];

export function normalizeThemeMode(value) {
  if (!value) return "dark";
  const mode = String(value).toLowerCase().trim();
  if (THEME_MODES.includes(mode)) return mode;

  // Compatibility with legacy persisted values.
  if (mode === "0" || mode === "false") return "light";
  if (mode === "1" || mode === "true") return "dark";
  if (mode.includes("light")) return "light";
  if (mode.includes("trip")) return "trippy";
  return "dark";
}

export function getStoredThemeMode() {
  if (typeof window === "undefined") return "dark";
  return normalizeThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
}

export function persistThemeMode(mode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, normalizeThemeMode(mode));
}

export function cycleThemeMode(mode) {
  const idx = THEME_MODES.indexOf(normalizeThemeMode(mode));
  return THEME_MODES[(idx + 1) % THEME_MODES.length];
}
