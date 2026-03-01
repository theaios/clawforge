import {useState, useEffect} from "react";
import { useMissionControl } from "../lib/missionControlContext";

function getTheme(dark) {
  if (dark) return {
    bg: "#0A0C10", surface: "#12151B", elevated: "#1A1E26",
    border: "#252A34", borderLight: "#2E3440",
    text: "#E8EAED", textSec: "#8B919E", textMuted: "#5C6370",
    blue: "#3B82F6", blueGlow: "rgba(59,130,246,0.15)",
    green: "#22C55E", greenGlow: "rgba(34,197,94,0.12)",
    amber: "#F59E0B", amberGlow: "rgba(245,158,11,0.12)",
    red: "#EF4444", redGlow: "rgba(239,68,68,0.12)",
    purple: "#8B5CF6", purpleGlow: "rgba(139,92,246,0.12)",
    teal: "#06B6D4", orange: "#F97316", pink: "#EC4899",
    scrollTrack: "#12151B", scrollThumb: "#252A34", scrollHover: "#2E3440",
  };
  return {
    bg: "#F4F5F8", surface: "#FFFFFF", elevated: "#E9EBF0",
    border: "#D5D8E0", borderLight: "#E2E4EA",
    text: "#111827", textSec: "#374151", textMuted: "#6B7280",
    blue: "#2563EB", blueGlow: "rgba(37,99,235,0.10)",
    green: "#16A34A", greenGlow: "rgba(22,163,74,0.10)",
    amber: "#D97706", amberGlow: "rgba(217,119,6,0.10)",
    red: "#DC2626", redGlow: "rgba(220,38,38,0.10)",
    purple: "#7C3AED", purpleGlow: "rgba(124,58,237,0.10)",
    teal: "#0891B2", orange: "#EA580C", pink: "#DB2777",
    scrollTrack: "#E9EBF0", scrollThumb: "#C4C8D4", scrollHover: "#A0A5B5",
  };
}

// Module-level default for data constants (component-level C shadows this for rendering)
let C = getTheme(true);


const CATEGORIES = ["All", "Communication", "Cloud & Infra", "Finance", "Marketing", "Development", "Analytics", "AI Models"];

const INITIAL_INTEGRATIONS = [
  // Communication
  { name: "Slack", icon: "💬", cat: "Communication", status: "connected", health: "healthy", agents: ["CX CEO", "Operations CEO", "Marketing CEO"], apiCalls: "2,480", lastSync: "2m ago", desc: "Team messaging and agent notifications", config: { workspace: "ClawForge HQ", channels: 8, webhooks: 3 } },
  { name: "Discord", icon: "🎮", cat: "Communication", status: "connected", health: "healthy", agents: ["CX CEO", "Content Writer"], apiCalls: "840", lastSync: "5m ago", desc: "Community hub and client support", config: { server: "ClawForge Community", channels: 4, bots: 1 } },
  { name: "Gmail", icon: "✉️", cat: "Communication", status: "connected", health: "healthy", agents: ["Sales CEO", "CX CEO", "Finance CEO"], apiCalls: "1,120", lastSync: "1m ago", desc: "Email for proposals, invoices, and support", config: { account: "team@theclawforge.com", labels: 12, filters: 6 } },
  { name: "Telegram", icon: "📱", cat: "Communication", status: "connected", health: "healthy", agents: ["CX CEO"], apiCalls: "320", lastSync: "8m ago", desc: "Client quick-response channel", config: { bot: "@ClawForgeBot", groups: 2 } },
  // Cloud & Infra
  { name: "AWS", icon: "☁️", cat: "Cloud & Infra", status: "connected", health: "healthy", agents: ["Operations CEO", "DevOps Engineer", "Security Sentinel"], apiCalls: "4,200", lastSync: "30s ago", desc: "Core infrastructure — EC2, S3, VPC, CloudWatch", config: { region: "us-east-1", instances: 14, buckets: 6 } },
  { name: "Docker", icon: "🐳", cat: "Cloud & Infra", status: "connected", health: "healthy", agents: ["Operations CEO", "DevOps Engineer"], apiCalls: "680", lastSync: "3m ago", desc: "Container orchestration for client instances", config: { containers: 18, images: 9, networks: 3 } },
  { name: "Terraform", icon: "🏗️", cat: "Cloud & Infra", status: "connected", health: "healthy", agents: ["DevOps Engineer"], apiCalls: "124", lastSync: "12m ago", desc: "Infrastructure as code for provisioning", config: { stateFiles: 4, modules: 7, providers: 2 } },
  { name: "GitHub", icon: "🐙", cat: "Development", status: "connected", health: "healthy", agents: ["Full-Stack Dev", "DevOps Engineer", "QA Tester"], apiCalls: "1,840", lastSync: "1m ago", desc: "Source code, CI/CD, and issue tracking", config: { repos: 6, actions: 12, secrets: 8 } },
  // Finance
  { name: "Stripe", icon: "💳", cat: "Finance", status: "connected", health: "healthy", agents: ["Finance CEO"], apiCalls: "340", lastSync: "4m ago", desc: "Payment processing and subscription management", config: { products: 3, subscriptions: 8, webhooks: 4 } },
  { name: "QuickBooks", icon: "📒", cat: "Finance", status: "connected", health: "degraded", agents: ["Finance CEO"], apiCalls: "86", lastSync: "45m ago", desc: "Accounting, invoicing, and P&L reports", config: { company: "The Claw Forge LLC", accounts: 14 }, alert: "Token refresh delayed — reconnect may be needed" },
  // Marketing
  { name: "Google Ads", icon: "🔍", cat: "Marketing", status: "connected", health: "healthy", agents: ["Marketing CEO"], apiCalls: "920", lastSync: "6m ago", desc: "Search and display ad campaigns", config: { campaigns: 3, budget: "$387/mo", conversions: 8 } },
  { name: "Meta Ads", icon: "📘", cat: "Marketing", status: "connected", health: "healthy", agents: ["Marketing CEO"], apiCalls: "740", lastSync: "4m ago", desc: "Facebook & Instagram advertising", config: { campaigns: 2, budget: "$156/mo", pixels: 1 } },
  { name: "LinkedIn Ads", icon: "💼", cat: "Marketing", status: "connected", health: "healthy", agents: ["Marketing CEO"], apiCalls: "280", lastSync: "15m ago", desc: "B2B thought leadership campaigns", config: { campaigns: 1, budget: "$210/mo" } },
  { name: "Google Analytics", icon: "📊", cat: "Analytics", status: "connected", health: "healthy", agents: ["Marketing CEO", "Content Writer"], apiCalls: "1,640", lastSync: "2m ago", desc: "Website traffic and conversion tracking", config: { property: "theclawforge.com", goals: 5, events: 24 } },
  // AI Models
  { name: "Anthropic API", icon: "🧠", cat: "AI Models", status: "connected", health: "healthy", agents: ["All agents"], apiCalls: "834", lastSync: "10s ago", desc: "Claude Opus, Sonnet, Haiku — primary AI backbone", config: { models: 3, tier: "Scale", rateLimit: "4K RPM" } },
  { name: "OpenAI API", icon: "🤖", cat: "AI Models", status: "connected", health: "healthy", agents: ["Marketing CEO", "CX CEO"], apiCalls: "286", lastSync: "2m ago", desc: "GPT-4o for content and customer tasks", config: { models: 1, tier: "Tier 3", rateLimit: "10K RPM" } },
  { name: "Google AI", icon: "💎", cat: "AI Models", status: "connected", health: "healthy", agents: ["Finance CEO", "QA Tester"], apiCalls: "198", lastSync: "8m ago", desc: "Gemini Pro for data extraction", config: { models: 1, tier: "Pay-as-you-go" } },
  // Available / not connected
  { name: "Zapier", icon: "⚡", cat: "Development", status: "available", health: null, agents: [], apiCalls: "—", lastSync: "—", desc: "Automate workflows across 5,000+ apps", config: {} },
  { name: "HubSpot", icon: "🟠", cat: "Marketing", status: "available", health: null, agents: [], apiCalls: "—", lastSync: "—", desc: "CRM and marketing automation platform", config: {} },
  { name: "Notion", icon: "📝", cat: "Communication", status: "available", health: null, agents: [], apiCalls: "—", lastSync: "—", desc: "Knowledge base and documentation hub", config: {} },
];

const HEALTH_STYLES = {
  healthy: { bg: C.greenGlow, color: C.green, border: "rgba(34,197,94,0.3)", label: "Healthy" },
  degraded: { bg: C.amberGlow, color: C.amber, border: "rgba(245,158,11,0.3)", label: "Degraded" },
  down: { bg: C.redGlow, color: C.red, border: "rgba(239,68,68,0.3)", label: "Down" },
};

function ScrollbarStyle({ C }) {
  return (
    <style>{`
      *::-webkit-scrollbar { width: 6px; height: 6px; }
      *::-webkit-scrollbar-track { background: ${C.scrollTrack}; border-radius: 3px; }
      *::-webkit-scrollbar-thumb { background: ${C.scrollThumb}; border-radius: 3px; min-height: 30px; }
      *::-webkit-scrollbar-thumb:hover { background: ${C.scrollHover}; }
      *::-webkit-scrollbar-corner { background: ${C.scrollTrack}; }
      * { scrollbar-width: thin; scrollbar-color: ${C.scrollThumb} ${C.scrollTrack}; }
    `}</style>
  );
}

function ThemeToggle({ isDark, setIsDark }) {
  return (
    <div
      onClick={() => setIsDark(!isDark)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px", borderRadius: 6, cursor: "pointer",
        background: isDark ? "rgba(59,130,246,0.08)" : "rgba(37,99,235,0.06)",
        border: "1px solid transparent",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{isDark ? "🌙" : "☀️"}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: isDark ? "#8B919E" : "#5C6370" }}>
        {isDark ? "Dark" : "Light"}
      </span>
      <div style={{
        width: 30, height: 16, borderRadius: 8, position: "relative",
        background: isDark ? "#3B82F6" : "#CBD5E1",
        transition: "background 0.2s ease", flexShrink: 0,
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: "50%",
          background: "#fff", position: "absolute", top: 2,
          left: isDark ? 16 : 2, transition: "left 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  );
}

function Sidebar({ activePage, isDark, setIsDark, C }) {
  const NAV = [
    { section: "MAIN", items: [
      { icon: "🚀", label: "Start Here", key: "start-here" },
      { icon: "💬", label: "Chat", key: "chat" },
      { icon: "▦", label: "Tasks", key: "boards" },
      { icon: "◉", label: "Approvals", key: "approvals" },
      { icon: "◐", label: "Brainstorming", key: "brainstorm" },
      { icon: "⬡", label: "Org Chart", key: "agentarmy" },
      { icon: "⚙", label: "Add Agent", key: "configurator" },
      { icon: "🗂", label: "Files", key: "files" },
    ]},
    { section: "SYSTEM", items: [
      { icon: "⛨", label: "Security", key: "security" },
      { icon: "⊞", label: "Integrations", key: "integrations" },
      { icon: "📊", label: "Cost & Usage", key: "costusage" },
      { icon: "⚙️", label: "Settings", key: "settings" },
      { icon: "🛠", label: "Under Development", key: "development" },
    ]},
  ];
  return (
    <div style={{ width: 220, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.orange}, #c2410c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>ClawForge</div>
          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>Mission Control</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {NAV.map((s, si) => (
          <div key={si} style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, letterSpacing: 1.2, textTransform: "uppercase", padding: "12px 10px 4px" }}>{s.section}</div>
            {s.items.map((item, ii) => {
              const active = item.key === activePage;
              const m = { 'start-here': '/start-here',   chat: '/chat',  brainstorm: '/brainstorm', brainstorming: '/brainstorm', tasks: '/boards', agentarmy: '/army', configurator: '/configurator', security: '/security', integrations: '/integrations', costusage: '/costs', settings: '/settings', development: '/development', approvals: '/approvals', files: '/files' };
              const href = `#${m[item.key] || '/boards'}`;
              return (
                <a key={ii} href={href} style={{
                  textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6,
                  cursor: "pointer", background: active ? C.blueGlow : "transparent",
                  borderLeft: active ? `2px solid ${C.blue}` : "2px solid transparent", marginBottom: 1,
                  transition: "all 0.15s ease",
                }}>
                  <span style={{ fontSize: 14, color: active ? C.blue : C.textMuted, width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? (isDark ? "#fff" : C.blue) : C.textSec, flex: 1 }}>{item.label}</span>
                </a>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>JC</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Joseph</div>
          <div style={{ fontSize: 9, color: C.textMuted }}>Orchestrator</div>
        </div>
      </div>
    </div>
  );
}


function ConfigDrawer({ integration, onClose, C, onAction, actionBusy }) {
  if (!integration) return null;
  const hs = integration.health ? HEALTH_STYLES[integration.health] : null;
  return (
    <div style={{ width: 380, flexShrink: 0, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{integration.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{integration.name}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{integration.cat}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div style={{ fontSize: 11, color: C.textSec, lineHeight: "17px", marginBottom: 16 }}>{integration.desc}</div>

        {/* Status */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>Status</div>
            {integration.status === "connected" ? (
              <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>● Connected</span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>○ Available</span>
            )}
          </div>
          {hs && (
            <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>Health</div>
              <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: hs.bg, color: hs.color, border: `1px solid ${hs.border}` }}>{hs.label}</span>
            </div>
          )}
        </div>

        {integration.alert && (
          <div style={{ padding: "10px 12px", borderRadius: 8, background: C.amberGlow, border: `1px solid ${C.amber}22`, borderLeft: `3px solid ${C.amber}`, marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: C.text, lineHeight: "16px" }}>⚠ {integration.alert}</span>
          </div>
        )}

        {/* Metrics */}
        {integration.status === "connected" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2, fontWeight: 600 }}>API Calls (Feb)</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{integration.apiCalls}</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2, fontWeight: 600 }}>Last Sync</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{integration.lastSync}</div>
            </div>
          </div>
        )}

        {/* Used by agents */}
        {integration.agents.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>Used by Agents</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {integration.agents.map((a, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 500, padding: "4px 10px", borderRadius: 6, background: C.elevated, color: C.textSec, border: `1px solid ${C.border}` }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Configuration */}
        {Object.keys(integration.config).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>Configuration</div>
            <div style={{ padding: "12px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>
              {Object.entries(integration.config).map(([k, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < Object.keys(integration.config).length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 10, color: C.textMuted, textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</span>
                  <span style={{ fontSize: 10, color: C.text, fontWeight: 600, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        {integration.status === "connected" ? (
          <>
            <button onClick={() => onAction('configure', integration)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>⚙ Configure</button>
            <button disabled={actionBusy} onClick={() => onAction('resync', integration)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer", opacity: actionBusy ? 0.7 : 1 }}>🔄 {actionBusy ? 'Syncing…' : 'Re-sync'}</button>
            <button onClick={() => onAction('disconnect', integration)} style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.red}33`, background: C.redGlow, color: C.red, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Disconnect</button>
          </>
        ) : (
          <button onClick={() => onAction('connect', integration)} style={{ flex: 1, padding: "10px", borderRadius: 6, border: "none", background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Connect {integration.name}</button>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsHub() {
  const { store } = useMissionControl();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("cf-theme") === "dark");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState(null);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [opMessage, setOpMessage] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const connected = integrations.filter(i => i.status === "connected");
  const available = integrations.filter(i => i.status === "available");
  const filtered = cat === "All" ? integrations : integrations.filter(i => i.cat === cat);
  const degraded = connected.filter(i => i.health === "degraded").length;

  const updateIntegration = (name, patch) => {
    setIntegrations((prev) => prev.map((i) => i.name === name ? { ...i, ...patch } : i));
    setSelected((prev) => (prev?.name === name ? { ...prev, ...patch } : prev));
  };

  const handleAction = async (type, integration) => {
    if (!integration) return;
    if (type === 'configure') {
      setOpMessage(`Opened ${integration.name} configuration panel.`);
      return;
    }
    if (type === 'connect') {
      updateIntegration(integration.name, { status: 'connected', health: 'healthy', lastSync: 'just now', apiCalls: integration.apiCalls === '—' ? '0' : integration.apiCalls });
      setOpMessage(`${integration.name} connected successfully.`);
      return;
    }
    if (type === 'disconnect') {
      updateIntegration(integration.name, { status: 'available', health: null, lastSync: '—', apiCalls: '—' });
      setOpMessage(`${integration.name} disconnected.`);
      return;
    }
    if (type === 'resync') {
      setActionBusy(true);
      await new Promise((r) => setTimeout(r, 500));
      updateIntegration(integration.name, { lastSync: 'just now', health: 'healthy', alert: null });
      setActionBusy(false);
      setOpMessage(`${integration.name} re-sync completed.`);
      return;
    }
    if (type === 'add') {
      setCat('All');
      const candidate = integrations.find((i) => i.status === 'available');
      if (candidate) {
        setSelected(candidate);
        setOpMessage(`Pick an available integration and press Connect to enable it.`);
      } else {
        setOpMessage('All listed integrations are already connected.');
      }
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="integrations" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>System</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Integrations</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search integrations...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: store.ui.degraded ? C.red : (degraded > 0 ? C.amber : C.green), display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 6 }}>●</span> {store.ui.degraded ? 'OpenClaw degraded mode' : (degraded > 0 ? `${degraded} degraded` : 'All healthy')}
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Integrations Hub</h2>
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Manage all connected services and APIs</p>
              </div>
              <button onClick={() => handleAction('add')} style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Add Integration</button>
            </div>
            {opMessage && <p style={{ fontSize: 11, color: C.blue, margin: '4px 0 0' }}>{opMessage}</p>}

            {/* Summary strip */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Connected", value: connected.length, color: C.green },
                { label: "Healthy", value: connected.filter(i => i.health === "healthy").length, color: C.green },
                { label: "Degraded", value: degraded, color: degraded > 0 ? C.amber : C.textMuted },
                { label: "Available", value: available.length, color: C.blue },
                { label: "Total API Calls (Feb)", value: "15.7K", color: C.text },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 6, background: C.surface, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Category filter */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer",
                  border: `1px solid ${cat === c ? C.blue : C.border}`,
                  background: cat === c ? C.blueGlow : "transparent",
                  color: cat === c ? C.blue : C.textMuted,
                }}>{c}</button>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {filtered.map((integ, i) => {
                const isConn = integ.status === "connected";
                const hs = integ.health ? HEALTH_STYLES[integ.health] : null;
                return (
                  <div key={i} onClick={() => setSelected(integ)} style={{
                    padding: "16px", borderRadius: 10, cursor: "pointer",
                    background: selected?.name === integ.name ? C.blueGlow : C.surface,
                    border: `1px solid ${selected?.name === integ.name ? C.blue : C.border}`,
                    opacity: isConn ? 1 : 0.7,
                    transition: "all 0.15s ease",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{integ.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{integ.name}</div>
                          <div style={{ fontSize: 9, color: C.textMuted }}>{integ.cat}</div>
                        </div>
                      </div>
                      {isConn && hs && (
                        <span style={{ fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: hs.bg, color: hs.color, border: `1px solid ${hs.border}` }}>{hs.label}</span>
                      )}
                      {!isConn && (
                        <span style={{ fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: C.elevated, color: C.textMuted, border: `1px solid ${C.border}` }}>Available</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: C.textSec, lineHeight: "15px", marginBottom: 10 }}>{integ.desc}</div>
                    {isConn ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 9, color: C.textMuted }}><span style={{ fontWeight: 600, color: C.textSec }}>{integ.apiCalls}</span> calls</span>
                          <span style={{ fontSize: 9, color: C.textMuted }}>synced {integ.lastSync}</span>
                        </div>
                        <div style={{ display: "flex" }}>
                          {integ.agents.slice(0, 3).map((_, ai) => (
                            <div key={ai} style={{
                              width: 18, height: 18, borderRadius: "50%", border: `2px solid ${C.surface}`,
                              background: C.elevated, marginLeft: ai > 0 ? -6 : 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 7, color: C.textMuted, fontWeight: 700,
                            }}>{integ.agents.length > 3 && ai === 2 ? `+${integ.agents.length - 2}` : ""}</div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); handleAction('connect', integ); }} style={{
                        width: "100%", padding: "6px", borderRadius: 5, border: `1px dashed ${C.blue}55`,
                        background: "transparent", color: C.blue, fontSize: 10, fontWeight: 600, cursor: "pointer",
                      }}>+ Connect</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Config drawer */}
          {selected && <ConfigDrawer integration={selected} onClose={() => setSelected(null)} C={C} onAction={handleAction} actionBusy={actionBusy} />}
        </div>
      </div>
    </div>
  );
}
