import { cycleThemeMode } from "../lib/themeMode";

const labels = {
  light: { icon: "☀️", label: "Light" },
  dark: { icon: "🌙", label: "Dark" },
  trippy: { icon: "🪩", label: "Trippy" },
};

export default function ThemeModeToggle({ mode = "dark", onChange, compact = false }) {
  const current = labels[mode] || labels.dark;
  const isLight = mode === "light";

  return (
    <button
      type="button"
      onClick={() => onChange?.(cycleThemeMode(mode))}
      title="Cycle theme: Light → Dark → Trippy"
      aria-label={`Theme mode: ${current.label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        border: `1px solid ${isLight ? "rgba(148,163,184,0.5)" : "rgba(148,163,184,0.32)"}`,
        background: isLight ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.48)",
        color: isLight ? "#334155" : "#E5E7EB",
        padding: compact ? "6px 10px" : "8px 12px",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        backdropFilter: "blur(8px)",
        boxShadow: "0 10px 24px rgba(2,8,23,0.24)",
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{current.icon}</span>
      <span>{current.label}</span>
      <span
        style={{
          marginLeft: 2,
          fontSize: 10,
          opacity: 0.75,
          letterSpacing: 0.2,
        }}
      >
        Light / Dark / Trippy
      </span>
    </button>
  );
}
