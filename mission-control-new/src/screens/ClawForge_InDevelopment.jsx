import { useEffect, useMemo, useState } from 'react'
import { PRIMARY_NAV_ITEMS, SYSTEM_NAV_ITEMS } from '../lib/systemNav'
import { getStoredThemeMode } from '../lib/themeMode'

const links = [
  { label: 'Timeline', path: '#/timeline', type: 'ops' },
  { label: 'Comms Center', path: '#/comms', type: 'ops' },
  { label: 'CRM & Sales', path: '#/crm', type: 'business' },
  { label: 'Marketing Command Center', path: '#/marketing', type: 'business' },
  { label: 'Finance', path: '#/finance', type: 'business' },
  { label: 'Web & Delivery', path: '#/web', type: 'delivery' },
  { label: 'Templates Library', path: '#/templates', type: 'delivery' },
  { label: 'Creative Editor (Internal)', path: '#/editor', type: 'internal' },
  { label: 'Question Cloud Onboarding (Internal)', path: '#/question-cloud', type: 'internal' },
  { label: 'Agent Files (Internal)', path: '#/agent-files', type: 'internal' },
  { label: 'Activity Log & Rollback', path: '#/activity-log', type: 'system' },
]

const themes = {
  dark: { bg: '#0a0c10', surface: '#12151b', elevated: '#1a1e26', border: '#252a34', text: '#e8eaed', muted: '#9ca3af', link: '#d9dce3', blue: '#3b82f6', blueGlow: 'rgba(59,130,246,0.15)' },
  light: { bg: '#f4f6fa', surface: '#ffffff', elevated: '#f8fafc', border: '#cbd5e1', text: '#0f172a', muted: '#64748b', link: '#1e293b', blue: '#2563eb', blueGlow: 'rgba(37,99,235,0.10)' },
  trippy: { bg: '#140825', surface: '#24113F', elevated: '#321759', border: '#6B36A8', text: '#F8F3FF', muted: '#BFA2EF', link: '#F8F3FF', blue: '#00E5FF', blueGlow: 'rgba(0,229,255,0.20)' },
}

function Sidebar({ t }) {
  const sections = [
    { title: 'MAIN', items: PRIMARY_NAV_ITEMS },
    { title: 'SYSTEM', items: SYSTEM_NAV_ITEMS },
  ]
  return (
    <div style={{ width: 220, flexShrink: 0, background: t.surface, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, letterSpacing: -0.3 }}>ClawForge</div>
          <div style={{ fontSize: 9, color: t.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Mission Control</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.muted, letterSpacing: 1.2, textTransform: 'uppercase', padding: '12px 10px 4px' }}>{section.title}</div>
            {section.items.map((item) => {
              const active = item.key === 'development'
              return (
                <a
                  key={item.key}
                  href={`#${item.path || '/boards'}`}
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 10px',
                    borderRadius: 6,
                    background: active ? t.blueGlow : 'transparent',
                    borderLeft: active ? `2px solid ${t.blue}` : '2px solid transparent',
                    marginBottom: 1,
                  }}
                >
                  <span style={{ fontSize: 14, color: active ? t.blue : t.muted, width: 20, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? t.blue : t.link, flex: 1 }}>{item.label}</span>
                </a>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InDevelopment() {
  const [mode, setMode] = useState(getStoredThemeMode())
  const [filter, setFilter] = useState('all')

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
  const filteredLinks = useMemo(() => {
    if (filter === 'all') return links
    return links.filter((l) => l.type === filter)
  }, [filter])

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: t.bg, color: t.text, fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      <Sidebar t={t} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, borderBottom: `1px solid ${t.border}`, background: t.surface }}>
          <span style={{ fontSize: 12, color: t.muted }}>System</span><span style={{ color: t.muted }}>/</span><span style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>Under Development</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Under Development</h2>
          <p style={{ color: t.muted, marginTop: 0 }}>Internal pages moved here so the main menu stays clean.</p>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {['all', 'ops', 'business', 'delivery', 'internal', 'system'].map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                style={{
                  border: `1px solid ${filter === tag ? t.blue : t.border}`,
                  background: filter === tag ? t.blueGlow : t.elevated,
                  color: filter === tag ? t.blue : t.muted,
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {filteredLinks.length === 0 ? (
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px', color: t.muted, fontSize: 14, maxWidth: 520 }}>
              No in-progress pages for this filter.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8, maxWidth: 580 }}>
              {filteredLinks.map((l) => (
                <a
                  key={l.path}
                  href={l.path}
                  style={{ textDecoration: 'none', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', color: t.link, fontSize: 14, fontWeight: 600 }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
