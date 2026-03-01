import { useEffect, useMemo, useState } from 'react'
import { flattenTasks, getApprovalsAndBlockers, readKanbanTasks, writeKanbanTasks } from '../lib/missionData'

const COMMS_EVENT = 'mc:comms-push'

function getTheme(dark) {
  if (dark) return {
    bg: '#0a0c10', panel: '#12151b', elevated: '#171c25', border: '#252a34', borderLight: '#2e3440',
    text: '#e8eaed', textSec: '#d1d5db', textMuted: '#9ca3af',
    blue: '#3b82f6', blueGlow: 'rgba(59,130,246,0.15)', green: '#22c55e', amber: '#f59e0b', red: '#ef4444', purple: '#8b5cf6', orange: '#f97316',
    cardShadow: '0 2px 10px rgba(0,0,0,0.25)', cardHover: '0 10px 24px rgba(0,0,0,0.34)',
    subtleTint: 'rgba(255,255,255,0.02)',
  }
  return {
    bg: '#f4f5f8', panel: '#ffffff', elevated: '#e9ebf0', border: '#d5d8e0', borderLight: '#e2e4ea',
    text: '#1a1e26', textSec: '#475569', textMuted: '#7c8597',
    blue: '#2563eb', blueGlow: 'rgba(37,99,235,0.1)', green: '#16a34a', amber: '#d97706', red: '#dc2626', purple: '#7c3aed', orange: '#ea580c',
    cardShadow: '0 1px 4px rgba(15,23,42,0.08)', cardHover: '0 8px 24px rgba(15,23,42,0.12)',
    subtleTint: 'rgba(15,23,42,0.02)',
  }
}

function alpha(hex, a = 1) {
  const n = (hex || '').replace('#', '')
  if (n.length !== 6) return `rgba(148,163,184,${a})`
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function priorityColor(priority, C) {
  if (priority === 'P0') return C.red
  if (priority === 'P1') return C.amber
  if (priority === 'P2') return C.blue
  return C.green
}

function MainMenuSidebar({ activePage, collapsedSections, onToggleSection, C, isDark }) {
  const NAV = [
    { section: 'MAIN', items: [
      { icon: '🚀', label: 'Start Here', key: 'start-here' },
      { icon: '💬', label: 'Chat', key: 'chat' },
      { icon: '▦', label: 'Tasks', key: 'boards' },
      { icon: '◉', label: 'Approvals', key: 'approvals' },
      { icon: '◐', label: 'Brainstorming', key: 'brainstorm' },
      { icon: '⬡', label: 'Org Chart', key: 'agentarmy' },
      { icon: '⚙', label: 'Add Agent', key: 'configurator' },
      { icon: '🗂', label: 'Files', key: 'files' },
    ]},
    { section: 'SYSTEM', items: [
      { icon: '⛨', label: 'Security', key: 'security' },
      { icon: '⊞', label: 'Integrations', key: 'integrations' },
      { icon: '📊', label: 'Cost & Usage', key: 'costusage' },
      { icon: '⚙️', label: 'Settings', key: 'settings' },
      { icon: '🛠', label: 'Under Development', key: 'development' },
    ]},
  ]

  const routeMap = {
    chat: '/chat', brainstorm: '/brainstorm', brainstorming: '/brainstorm', tasks: '/boards', boards: '/boards',
    agentarmy: '/army', configurator: '/configurator?step=1', approvals: '/approvals', files: '/files',
    security: '/security', integrations: '/integrations', costusage: '/costs', settings: '/settings', development: '/development',
  }

  return (
    <div style={{ width: 220, flexShrink: 0, background: C.panel, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.orange}, #c2410c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>ClawForge</div>
          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>Mission Control</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {NAV.map((s) => {
          const collapsed = !!collapsedSections[s.section]
          return (
            <div key={s.section} style={{ marginBottom: 4 }}>
              <button
                onClick={() => onToggleSection(s.section)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700,
                  color: C.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', padding: '12px 10px 6px',
                }}
              >
                <span>{s.section}</span>
                <span style={{ minWidth: 18, height: 18, borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}`, background: C.elevated, fontSize: 13, fontWeight: 800, lineHeight: 1, color: C.textSec }}>{collapsed ? '+' : '−'}</span>
              </button>

              {!collapsed && s.items.map((item) => {
                const active = item.key === activePage
                const href = `#${routeMap[item.key] || '/boards'}`
                return (
                  <a key={item.key} href={href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', background: active ? C.blueGlow : 'transparent', borderLeft: active ? `2px solid ${C.blue}` : '2px solid transparent', marginBottom: 1, transition: 'all 0.15s ease' }}>
                    <span style={{ fontSize: 14, color: active ? C.blue : C.textMuted, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? (isDark ? '#fff' : C.blue) : C.textSec, flex: 1 }}>{item.label}</span>
                  </a>
                )
              })}
            </div>
          )
        })}
      </div>

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>JC</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Joseph</div>
          <div style={{ fontSize: 9, color: C.textMuted }}>Orchestrator</div>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalsBlockers() {
  const [tasks, setTasks] = useState(() => readKanbanTasks())
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true })
  const [isDark, setIsDark] = useState(() => localStorage.getItem('cf-theme') !== 'light')

  useEffect(() => {
    const syncTheme = () => setIsDark(localStorage.getItem('cf-theme') !== 'light')
    window.addEventListener('storage', syncTheme)
    window.addEventListener('focus', syncTheme)
    return () => {
      window.removeEventListener('storage', syncTheme)
      window.removeEventListener('focus', syncTheme)
    }
  }, [])

  useEffect(() => {
    const onSync = () => setTasks(readKanbanTasks())
    window.addEventListener('mission-data-updated', onSync)
    return () => window.removeEventListener('mission-data-updated', onSync)
  }, [])

  const C = getTheme(isDark)
  const all = useMemo(() => flattenTasks(tasks), [tasks])
  const { approvals, blockers } = useMemo(() => getApprovalsAndBlockers(tasks), [tasks])

  const unified = useMemo(() => {
    const tagged = []
    approvals.forEach((t) => tagged.push({ ...t, queue: 'approval', id: `apr-${t.id}` }))
    blockers.forEach((t) => tagged.push({ ...t, queue: 'blocker', id: `blk-${t.id}` }))
    return tagged
  }, [approvals, blockers])

  const filtered = useMemo(() => {
    return unified
      .filter((t) => tab === 'all' ? true : t.queue === tab)
      .filter((t) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return [t.title, t.description, t.labels?.join(' ')].join(' ').toLowerCase().includes(q)
      })
      .sort((a, b) => Number(a.priority?.replace('P', '') ?? 9) - Number(b.priority?.replace('P', '') ?? 9))
  }, [unified, query, tab])

  const filteredApprovals = useMemo(() => filtered.filter((t) => t.queue === 'approval'), [filtered])
  const filteredBlockers = useMemo(() => filtered.filter((t) => t.queue === 'blocker'), [filtered])

  const mutateTask = (taskId, updater, note) => {
    const next = structuredClone(tasks)
    for (const key of Object.keys(next)) {
      next[key] = (next[key] || []).map((item) => item.id === taskId ? updater(item) : item)
    }
    setTasks(next)
    writeKanbanTasks(next, { source: 'approvals' })
    window.dispatchEvent(new CustomEvent(COMMS_EVENT, { detail: { channel: 'telegram', from: 'Approvals Bot', text: note } }))
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", display: 'flex' }}>
      <MainMenuSidebar
        activePage='approvals'
        collapsedSections={collapsedSections}
        onToggleSection={(section) => setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))}
        C={C}
        isDark={isDark}
      />

      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', boxShadow: C.cardShadow }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, letterSpacing: -0.3 }}>Approvals & Blockers</h2>
            <div style={{ marginTop: 6, color: C.textMuted, fontSize: 13 }}>Live queue synced with Kanban board execution state.</div>
          </div>
          <button onClick={() => window.location.hash = '/boards'} style={{ background: C.purple, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 13px', fontWeight: 700, cursor: 'pointer', boxShadow: `0 6px 14px ${alpha(C.purple, 0.22)}` }}>Open Kanban</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          <Metric C={C} label='Pending Approvals' value={approvals.length} color={C.blue} />
          <Metric C={C} label='Active Blockers' value={blockers.length} color={C.red} />
          <Metric C={C} label='Open Work Items' value={all.length} color={C.text} />
          <Metric C={C} label='Critical (P0/P1)' value={unified.filter((x) => ['P0', 'P1'].includes(x.priority)).length} color={C.amber} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10, boxShadow: C.cardShadow }}>
          {['all', 'approval', 'blocker'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              border: `1px solid ${tab === t ? alpha(C.orange, 0.45) : C.border}`,
              background: tab === t ? alpha(C.orange, 0.18) : C.elevated,
              color: tab === t ? C.orange : C.textSec,
              borderRadius: 999,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}>{t}</button>
          ))}
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search title or description...' style={{ marginLeft: 'auto', width: 300, background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', outline: 'none' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(320px, 1fr))', gap: 12, alignItems: 'start' }}>
          <QueueColumn
            title='Approvals'
            icon='◉'
            queue='approval'
            accent={C.blue}
            items={filteredApprovals}
            C={C}
            mutateTask={mutateTask}
            showEmpty={tab !== 'blocker'}
          />
          <QueueColumn
            title='Blockers'
            icon='◐'
            queue='blocker'
            accent={C.red}
            items={filteredBlockers}
            C={C}
            mutateTask={mutateTask}
            showEmpty={tab !== 'approval'}
          />
        </div>
      </div>
    </div>
  )
}

function QueueColumn({ title, icon, queue, accent, items, C, mutateTask, showEmpty }) {
  return (
    <div style={{ background: alpha(accent, 0.08), border: `1px solid ${alpha(accent, 0.3)}`, borderRadius: 12, boxShadow: C.cardShadow, minHeight: 260, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: `1px solid ${alpha(accent, 0.2)}`, background: alpha(accent, 0.12), borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: accent, fontWeight: 800, fontSize: 14 }}>{icon}</span>
          <span style={{ fontSize: 12, color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.9, fontWeight: 800 }}>{title}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: accent, background: alpha(accent, 0.14), border: `1px solid ${alpha(accent, 0.32)}`, borderRadius: 999, padding: '2px 8px' }}>{items.length}</span>
      </div>

      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {items.map((task) => (
          <QueueCard key={task.id} task={task} queue={queue} C={C} mutateTask={mutateTask} />
        ))}
        {items.length === 0 && showEmpty && (
          <div style={{ color: C.textMuted, border: `1px dashed ${C.border}`, borderRadius: 10, padding: 24, textAlign: 'center', background: C.subtleTint, fontSize: 12 }}>
            No {title.toLowerCase()} match this filter.
          </div>
        )}
      </div>
    </div>
  )
}

function QueueCard({ task, queue, C, mutateTask }) {
  const queueColor = queue === 'blocker' ? C.red : C.blue
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: `4px solid ${queueColor}`, borderRadius: 10, padding: 12, boxShadow: C.cardShadow }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{task.title}</span>
            <Chip color={priorityColor(task.priority, C)}>{task.priority || 'P3'}</Chip>
            <span style={{ fontSize: 10, color: C.textMuted }}>{task.colId}</span>
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{task.labels?.join(' • ') || 'No labels'}</div>
          {task.description && <div style={{ marginTop: 8, fontSize: 13, color: C.textSec }}>{task.description}</div>}
          {task.blocked && <div style={{ marginTop: 8, fontSize: 12, color: C.red, background: alpha(C.red, 0.1), border: `1px solid ${alpha(C.red, 0.26)}`, borderRadius: 8, padding: '6px 8px', display: 'inline-flex' }}>⚠ {task.blocked}</div>}
        </div>
        <div style={{ display: 'grid', gap: 6, minWidth: 150 }}>
          {task.approval && <button onClick={() => mutateTask(task.id, (t) => ({ ...t, approval: false }), `✅ Approved: ${task.title}`)} style={btn(C.green, C)}>Approve</button>}
          {task.approval && <button onClick={() => mutateTask(task.id, (t) => ({ ...t, approval: false, blocked: 'Rejected during approval review' }), `❌ Rejected: ${task.title}`)} style={btn(C.red, C)}>Reject</button>}
          {task.blocked && <button onClick={() => mutateTask(task.id, (t) => ({ ...t, blocked: null }), `🟢 Unblocked: ${task.title}`)} style={btn(C.green, C)}>Mark unblocked</button>}
          {!task.blocked && <button onClick={() => mutateTask(task.id, (t) => ({ ...t, blocked: 'Needs revision before approval' }), `🟡 Changes requested: ${task.title}`)} style={btn(C.amber, C)}>Request changes</button>}
          <button onClick={() => window.location.hash = '/boards'} style={btn(C.blue, C)}>Open in board</button>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, color, C }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, boxShadow: C.cardShadow }}>
      <div style={{ color: C.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 24, fontWeight: 800, color }}>{value}</div>
    </div>
  )
}

function Chip({ children, color }) {
  return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, border: `1px solid ${alpha(color, 0.35)}`, color, background: alpha(color, 0.12), textTransform: 'uppercase', fontWeight: 700 }}>{children}</span>
}

function btn(color, C) {
  return {
    border: `1px solid ${alpha(color, 0.35)}`,
    background: alpha(color, 0.14),
    color,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    padding: '7px 9px',
    boxShadow: C.cardShadow,
  }
}
