import { useEffect, useMemo, useState } from 'react'
import { getStoredThemeMode } from '../lib/themeMode'

const themes = {
  dark: {
    bg: '#0a0c10',
    panel: '#12151b',
    panelAlt: '#151a22',
    border: '#2a303d',
    text: '#e8eaed',
    muted: '#9ca3af',
    accent: '#7c8bff',
    accentSoft: 'rgba(124,139,255,0.16)',
  },
  light: {
    bg: '#f4f6fa',
    panel: '#ffffff',
    panelAlt: '#f8fafc',
    border: '#cbd5e1',
    text: '#0f172a',
    muted: '#64748b',
    accent: '#4f46e5',
    accentSoft: 'rgba(79,70,229,0.12)',
  },
  trippy: {
    bg: '#140825',
    panel: '#24113F',
    panelAlt: '#2f1a53',
    border: '#6B36A8',
    text: '#F8F3FF',
    muted: '#BFA2EF',
    accent: '#D77DFF',
    accentSoft: 'rgba(215,125,255,0.18)',
  },
}

const seedText = `# ClawForge Editor\n\nDraft and iterate on campaign copy, agent prompts, and internal docs in one place.\n\n## Quick ideas\n- Build launch brief\n- Refine outreach sequence\n- Shape team handoff notes\n`

export default function ClawForgeEditor() {
  const [mode, setMode] = useState(getStoredThemeMode())
  const [docTitle, setDocTitle] = useState('Untitled Draft')
  const [content, setContent] = useState(seedText)

  useEffect(() => {
    const sync = () => setMode(getStoredThemeMode())
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const t = useMemo(() => themes[mode] || themes.dark, [mode])
  const charCount = content.length
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.text,
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          display: 'grid',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Creative Editor</h2>
            <p style={{ margin: '6px 0 0', color: t.muted, fontSize: 14 }}>
              Internal draft workspace for ClawForge. (Not live in main nav)
            </p>
          </div>
          <a
            href="#/development"
            style={{
              fontSize: 13,
              textDecoration: 'none',
              color: t.text,
              border: `1px solid ${t.border}`,
              padding: '8px 10px',
              borderRadius: 9,
              background: t.panel,
            }}
          >
            ← Back to Under Development
          </a>
        </div>

        <div
          style={{
            background: t.panel,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: 12,
            display: 'grid',
            gap: 10,
          }}
        >
          <input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="Document title"
            style={{
              width: '100%',
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              background: t.panelAlt,
              color: t.text,
              padding: '10px 12px',
              fontSize: 16,
              fontWeight: 600,
              outline: 'none',
            }}
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: '62vh',
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              background: t.panelAlt,
              color: t.text,
              padding: '12px 14px',
              fontSize: 14,
              lineHeight: 1.55,
              resize: 'vertical',
              outline: 'none',
              fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
            }}
          />

          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ color: t.muted, fontSize: 12 }}>
              {wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars
            </div>
            <div
              style={{
                border: `1px solid ${t.border}`,
                background: t.accentSoft,
                color: t.accent,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                padding: '5px 10px',
              }}
            >
              Prototype Surface
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
