import { useEffect, useMemo, useState } from 'react'
import AgentArmy from './screens/ClawForge_AgentArmy.jsx'
import AgentConfigurator from './screens/ClawForge_AgentConfigurator.jsx'
import AgentFiles from './screens/ClawForge_AgentFiles.jsx'
import AgentChat from './screens/ClawForge_AgentChat.jsx'
import Chat from './screens/ClawForge_Chat.jsx'
import Brainstorming from './screens/ClawForge_Brainstorming.jsx'
import CostUsage from './screens/ClawForge_CostUsage.jsx'
import CRMSales from './screens/ClawForge_CRM_Sales.jsx'
import EmptyStates from './screens/ClawForge_EmptyStates.jsx'
import Finance from './screens/ClawForge_Finance.jsx'
import Integrations from './screens/ClawForge_Integrations.jsx'
import InDevelopment from './screens/ClawForge_InDevelopment.jsx'
import Kanban from './screens/ClawForge_Kanban_Board.jsx'
import CommsCenter from './screens/ClawForge_CommsCenter.jsx'
import ApprovalsBlockers from './screens/ClawForge_ApprovalsBlockers.jsx'
import KeyModals from './screens/ClawForge_KeyModals.jsx'
import MarketingCommandCenter from './screens/ClawForge_MarketingCommandCenter.jsx'
import Overview from './screens/ClawForge_Overview.jsx'
import SecuritySystem from './screens/ClawForge_SecuritySystem.jsx'
import Settings from './screens/ClawForge_Settings.jsx'
import RunHistory from './screens/ClawForge_RunHistory.jsx'
import TemplatesLibrary from './screens/ClawForge_TemplatesLibrary.jsx'
import Timeline from './screens/ClawForge_Timeline.jsx'
import WebDelivery from './screens/ClawForge_WebDelivery.jsx'
import Files from './screens/ClawForge_Files.jsx'
import StartHere from './screens/ClawForge_StartHere.jsx'
import { MissionControlProvider, useMissionControl } from './lib/missionControlContext.jsx'
import { getStoredThemeMode } from './lib/themeMode.js'

function getRoute() {
  const hash = window.location.hash.replace('#', '') || '/overview'
  const pathOnly = hash.split('?')[0] || '/overview'
  return pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
}

function Placeholder({ title }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0c10', color: '#e8eaed', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ color: '#9ca3af' }}>Loaded and clickable. Integration wiring comes next.</p>
    </div>
  )
}

const sections = [
  {
    title: 'MAIN',
    items: [
      { path: '/start-here', label: 'Start Here', comp: StartHere },
      { path: '/chat', label: 'Chat', comp: Chat },
      { path: '/overview', label: 'Overview', comp: Overview },
      { path: '/boards', label: 'Tasks', comp: Kanban },
      { path: '/army', label: 'Org Chart', comp: AgentArmy },
      { path: '/configurator', label: 'Add Agent', comp: AgentConfigurator },
      { path: '/agent-files', label: 'Agent Files', comp: AgentFiles },
      { path: '/agent-chat', label: 'Agent Chat', comp: AgentChat },
      { path: '/brainstorm', label: 'Brainstorming', comp: Brainstorming },
      { path: '/files', label: 'Files', comp: Files },
    ],
  },
  {
    title: 'OPS',
    items: [
      { path: '/comms', label: 'Comms Center', comp: CommsCenter },
      { path: '/runs', label: 'Run History', comp: RunHistory },
      { path: '/timeline', label: 'Timeline', comp: Timeline },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/security', label: 'Security', comp: SecuritySystem },
      { path: '/integrations', label: 'Integrations', comp: Integrations },
      { path: '/costs', label: 'Cost & Usage', comp: CostUsage },
      { path: '/settings', label: 'Settings', comp: Settings },
      { path: '/development', label: 'Under Development', comp: InDevelopment },
    ],
  },
]

const hiddenRoutes = [
  { path: '/overview', label: 'Overview', comp: Overview },
  { path: '/timeline', label: 'Timeline', comp: Timeline },
  { path: '/comms', label: 'Comms Center', comp: CommsCenter },
  { path: '/approvals', label: 'Approvals & Blockers', comp: ApprovalsBlockers },
  { path: '/crm', label: 'CRM & Sales', comp: CRMSales },
  { path: '/marketing', label: 'Marketing Cmd', comp: MarketingCommandCenter },
  { path: '/finance', label: 'Finance', comp: Finance },
  { path: '/security', label: 'Security', comp: SecuritySystem },
  { path: '/integrations', label: 'Integrations', comp: Integrations },
  { path: '/runs', label: 'Run History', comp: RunHistory },
  { path: '/costs', label: 'Cost & Usage', comp: CostUsage },
  { path: '/settings', label: 'Settings', comp: Settings },
  { path: '/web', label: 'Web & Delivery', comp: WebDelivery },
  { path: '/templates', label: 'Templates', comp: TemplatesLibrary },
  { path: '/modals', label: 'Key Modals', comp: KeyModals },
  { path: '/empty', label: 'Empty States', comp: EmptyStates },
]

const allRoutes = [...sections.flatMap((s) => s.items), ...hiddenRoutes]
const SYSTEM_PATHS = new Set(['/security', '/integrations', '/costs', '/settings', '/development'])

// Makes existing in-screen text nav items clickable without changing their layout.
const textNavMap = new Map([
  ['start here', '/start-here'],
  ['overview', '/overview'],
  ['tasks', '/boards'],
  ['boards', '/boards'],
  ['kanban board', '/boards'],
  ['timeline', '/timeline'],
  ['brainstorm', '/brainstorm'],
  ['brainstorming', '/brainstorm'],
  ['files', '/files'],
  ['comms center', '/comms'],
  ['approvals', '/approvals'],
  ['approvals & blockers', '/approvals'],
  ['org chart', '/army'],
  ['agent army', '/army'],
  ['add agent', '/configurator?step=1'],
  ['agent files', '/agent-files'],
  ['agent chat', '/agent-chat'],
  ['chat', '/chat'],
  ['configurator', '/configurator'],
  ['agent configurator', '/configurator'],
  ['crm & sales', '/crm'],
  ['marketing', '/marketing'],
  ['marketing cmd', '/marketing'],
  ['finance', '/finance'],
  ['system', '/settings'],
  ['security', '/security'],
  ['integrations', '/integrations'],
  ['run history', '/runs'],
  ['cost & usage', '/costs'],
  ['web & delivery', '/web'],
  ['templates', '/templates'],
  ['settings', '/settings'],
  ['under development', '/development'],
  ['review now', '/approvals'],
  ['view error', '/boards'],
  ['view timeline', '/timeline'],
])

function OpenClawLiveBanner() {
  const { store } = useMissionControl()
  const conn = store?.ui?.openclaw || { connected: false, lastRequestId: null }
  const isConnected = !!conn.connected
  const lastError = store?.ui?.lastError || null
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        pointerEvents: 'none',
      }}
    >
      <button
        type='button'
        onClick={() => setExpanded((v) => !v)}
        title={isConnected ? 'OpenClaw connected' : 'OpenClaw disconnected'}
        style={{
          border: `1px solid ${isConnected ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.45)'}`,
          background: isConnected ? 'rgba(16,185,129,0.16)' : 'rgba(239,68,68,0.14)',
          color: isConnected ? '#34d399' : '#f87171',
          borderRadius: 999,
          padding: '6px 10px',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          backdropFilter: 'blur(3px)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
          pointerEvents: 'auto',
        }}
      >
        <span style={{ fontSize: 9 }}>●</span>
        {isConnected ? 'OpenClaw Online' : 'OpenClaw Offline'}
      </button>

      {expanded && (
        <div
          style={{
            maxWidth: 420,
            border: `1px solid ${isConnected ? 'rgba(16,185,129,0.38)' : 'rgba(239,68,68,0.35)'}`,
            background: 'rgba(8,10,14,0.92)',
            color: '#d1d5db',
            borderRadius: 12,
            padding: '8px 10px',
            fontSize: 11,
            lineHeight: 1.45,
            fontFamily: 'Inter, system-ui, sans-serif',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ fontWeight: 700, color: isConnected ? '#34d399' : '#f87171' }}>
            {isConnected ? 'Connected to OpenClaw' : 'Disconnected from OpenClaw'}
          </div>
          {conn.lastRequestId && (
            <div style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", opacity: 0.92 }}>
              requestId: {conn.lastRequestId}
            </div>
          )}
          {!isConnected && lastError?.debugCode && (
            <div style={{ opacity: 0.95 }}>
              debug: {lastError.debugCode}
              {lastError.status ? ` · HTTP ${lastError.status}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AppContent() {
  const [route, setRoute] = useState(getRoute())
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true })
  const [themeMode, setThemeMode] = useState(getStoredThemeMode)
  const hideMenu = false

  useEffect(() => {
    const syncTheme = () => setThemeMode(getStoredThemeMode())
    const onHash = () => {
      setRoute(getRoute())
      syncTheme()
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('focus', syncTheme)
    window.addEventListener('storage', syncTheme)
    if (!window.location.hash) window.location.hash = '/overview'
    syncTheme()
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('focus', syncTheme)
      window.removeEventListener('storage', syncTheme)
    }
  }, [])

  useEffect(() => {
    const navEntries = [...textNavMap.entries()].sort((a, b) => b[0].length - a[0].length)

    const normalize = (value = '') => value.toLowerCase().replace(/\s+/g, ' ').trim()
    const matchRoute = (text = '') => {
      const normalized = normalize(text)
      if (!normalized) return null

      for (const [label, path] of navEntries) {
        if (normalized === label) return path
        if (normalized.startsWith(`${label} `) || normalized.startsWith(`${label}/`)) return path
        if (label.length > 6 && normalized.includes(` ${label} `)) return path
      }
      return null
    }

    const routeFromElement = (start) => {
      let el = start
      for (let depth = 0; el && depth < 5; depth += 1) {
        const candidates = [
          el.getAttribute?.('aria-label'),
          el.getAttribute?.('title'),
          el.dataset?.label,
          el.dataset?.nav,
          el.innerText,
          el.textContent,
        ]

        for (const candidate of candidates) {
          const routeMatch = matchRoute(candidate)
          if (routeMatch) return routeMatch
        }

        el = el.parentElement
      }
      return null
    }

    const clickHandler = (event) => {
      const target = event.target?.nodeType === Node.TEXT_NODE ? event.target.parentElement : event.target
      const el = target?.closest?.('*')
      if (!el) return
      if (el.closest('input, textarea, [contenteditable="true"]')) return

      const match = routeFromElement(el)
      if (!match) return

      event.preventDefault()
      window.location.hash = match
    }

    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  }, [])

  // Keep SYSTEM submenu hidden by default, briefly open when user enters a system page.
  useEffect(() => {
    let t
    if (SYSTEM_PATHS.has(route)) {
      setCollapsedSections((prev) => ({ ...prev, SYSTEM: false }))
      t = setTimeout(() => {
        setCollapsedSections((prev) => ({ ...prev, SYSTEM: true }))
      }, 12000)
    } else {
      setCollapsedSections((prev) => ({ ...prev, SYSTEM: true }))
    }
    return () => t && clearTimeout(t)
  }, [route])

  const Screen = useMemo(() => {
    const found = allRoutes.find((r) => r.path === route)
    return found?.comp || (() => <Placeholder title='Not Found' />)
  }, [route])

  const appThemeMap = {
    dark: { bg: '#0a0c10' },
    light: { bg: '#f4f5f8' },
    trippy: { bg: '#140825' },
  }
  const { bg } = appThemeMap[themeMode] || appThemeMap.dark

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <OpenClawLiveBanner />
      <Screen />
    </div>
  )
}

export default function App() {
  return (
    <MissionControlProvider>
      <AppContent />
    </MissionControlProvider>
  )
}
