import { useEffect, useState } from 'react'
import { getStoredThemeMode } from '../lib/themeMode'

const links = [
  { label: 'Timeline', path: '#/timeline' },
  { label: 'Comms Center', path: '#/comms' },
  { label: 'CRM & Sales', path: '#/crm' },
  { label: 'Marketing Command Center', path: '#/marketing' },
  { label: 'Finance', path: '#/finance' },
  { label: 'Web & Delivery', path: '#/web' },
  { label: 'Templates Library', path: '#/templates' },
  { label: 'Agent Files (Internal)', path: '#/agent-files' },
  { label: 'Activity Log & Rollback', path: '#/activity-log' },
]

const themes = {
  dark: { bg: '#0a0c10', surface: '#12151b', border: '#2a303d', text: '#e8eaed', muted: '#9ca3af', link: '#d9dce3' },
  light: { bg: '#f4f6fa', surface: '#ffffff', border: '#cbd5e1', text: '#0f172a', muted: '#64748b', link: '#1e293b' },
  trippy: { bg: '#140825', surface: '#24113F', border: '#6B36A8', text: '#F8F3FF', muted: '#BFA2EF', link: '#F8F3FF' },
}

export default function InDevelopment() {
  const [mode, setMode] = useState(getStoredThemeMode())

  useEffect(() => {
    const sync = () => setMode(getStoredThemeMode())
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const t = themes[mode] || themes.dark

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Under Development</h2>
      <p style={{ color: t.muted, marginTop: 0 }}>Internal pages moved here so the main menu stays clean.</p>
      {links.length === 0 ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: '12px 14px',
            color: t.muted,
            fontSize: 14,
            maxWidth: 520,
          }}
        >
          No in-progress internal pages right now.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
          {links.map((l) => (
            <a
              key={l.path}
              href={l.path}
              style={{
                textDecoration: 'none',
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                padding: '10px 12px',
                color: t.link,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
