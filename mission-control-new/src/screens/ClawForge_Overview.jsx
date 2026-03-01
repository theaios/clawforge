import { useEffect, useMemo, useState } from "react";
import { getApprovalsAndBlockers, readKanbanTasks } from "../lib/missionData";
import { cycleThemeMode, getStoredThemeMode, persistThemeMode } from "../lib/themeMode";

function getTheme(mode) {
  if (mode === "trippy") return {
    bg: "#140825", surface: "#24113F", elevated: "#311759",
    border: "#6B36A8", borderLight: "#8E4CD4",
    text: "#F8F3FF", textSec: "#DCC9FF", textMuted: "#BFA2EF",
    blue: "#00E5FF", blueGlow: "rgba(0,229,255,0.22)",
    green: "#39FF88", greenGlow: "rgba(57,255,136,0.20)",
    amber: "#FFD166", amberGlow: "rgba(255,209,102,0.20)",
    red: "#FF5FA2", redGlow: "rgba(255,95,162,0.20)",
    purple: "#B26BFF", purpleGlow: "rgba(178,107,255,0.20)",
    teal: "#20D9FF", orange: "#FF9F45", pink: "#FF6BDA",
    scrollTrack: "#24113F", scrollThumb: "#6B36A8", scrollHover: "#8E4CD4",
  };
  const dark = mode !== "light";
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
    text: "#1A1E26", textSec: "#5C6370", textMuted: "#8B919E",
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


const COMMAND_ACTIONS = [
  { icon: "⬡", label: "New Agent", shortcut: "⌘N", color: C.blue },
  { icon: "▦", label: "New Board", shortcut: "⌘B", color: C.purple },
  { icon: "◈", label: "New Channel", shortcut: "⌘C", color: C.teal },
  { icon: "📊", label: "Run Report", shortcut: "⌘R", color: C.green },
  { icon: "🚨", label: "Incident", shortcut: "⌘I", color: C.red },
];

const LIVE_FEED = [
  { time: "10:52 AM", agent: "Operations CEO", agentColor: C.blue, action: "Deployed Mission Control v1.3.2 to production", type: "deploy" },
  { time: "10:48 AM", agent: "Security Sentinel", agentColor: C.red, action: "Scanning customer instances (8/12 complete)", type: "security" },
  { time: "10:45 AM", agent: "Marketing CEO", agentColor: C.purple, action: "Requesting approval: Increase Meta Ads budget to $80/day", type: "approval" },
  { time: "10:42 AM", agent: "DevOps Engineer", agentColor: C.orange, action: "Terraform apply — VPC security groups updated", type: "infra" },
  { time: "10:38 AM", agent: "Sales CEO", agentColor: C.green, action: "Sent Executive Build proposal to Meridian Consulting", type: "sales" },
  { time: "10:35 AM", agent: "Content Writer", agentColor: C.pink, action: "Updated homepage hero section — staging deployed", type: "content" },
  { time: "10:30 AM", agent: "DevOps Engineer", agentColor: C.orange, action: "Build #347 failed — TypeScript error in scheduler.ts", type: "error" },
  { time: "10:22 AM", agent: "Security Sentinel", agentColor: C.red, action: "Blocked IP range 185.220.100.0/24 via WAF", type: "security" },
];

const PIPELINE_SUMMARY = [
  { stage: "Prospect", count: 14, value: "$5,286", color: C.textMuted },
  { stage: "Qualified", count: 8, value: "$2,794", color: C.blue },
  { stage: "Proposal", count: 3, value: "$1,397", color: C.purple },
  { stage: "Negotiation", count: 2, value: "$1,398", color: C.amber },
  { stage: "Won (Feb)", count: 3, value: "$1,897", color: C.green },
];

const UPCOMING = [
  { time: "11:30 AM", title: "Demo call — BrightPath Education", agent: "Sales CEO", type: "call" },
  { time: "2:00 PM", title: "Community call — weekly open office", agent: "Orchestrator", type: "community" },
  { time: "4:00 PM", title: "Security scan results review", agent: "Security Sentinel", type: "review" },
  { time: "Tomorrow", title: "SSL certificate auto-renewal check", agent: "DevOps Engineer", type: "task" },
];

const AGENT_STATUS = [
  { name: "Operations CEO", initials: "OP", color: C.blue, status: "online", queue: 4, model: "Claude Sonnet" },
  { name: "Marketing CEO", initials: "MK", color: C.purple, status: "online", queue: 6, model: "GPT-4o" },
  { name: "Sales CEO", initials: "SL", color: C.green, status: "online", queue: 3, model: "Claude Sonnet" },
  { name: "Finance CEO", initials: "FN", color: C.amber, status: "online", queue: 2, model: "Gemini Pro" },
  { name: "CX CEO", initials: "CX", color: C.teal, status: "online", queue: 5, model: "GPT-4o" },
  { name: "Security Sentinel", initials: "SS", color: C.red, status: "degraded", queue: 8, model: "Claude Opus" },
  { name: "Content Writer", initials: "CW", color: C.pink, status: "online", queue: 2, model: "Claude Sonnet" },
  { name: "DevOps Engineer", initials: "DV", color: C.orange, status: "online", queue: 3, model: "Claude Sonnet" },
  { name: "Full-Stack Dev", initials: "FS", color: "#60A5FA", status: "online", queue: 4, model: "Claude Sonnet" },
  { name: "QA Tester", initials: "QA", color: "#FB923C", status: "online", queue: 1, model: "Claude Haiku" },
  { name: "SEO Specialist", initials: "SE", color: "#A78BFA", status: "online", queue: 2, model: "GPT-4o" },
  { name: "Onboarding Spec.", initials: "ON", color: "#34D399", status: "offline", queue: 0, model: "Claude Sonnet" },
];

const STATUS_DOT = { online: C.green, degraded: C.amber, offline: C.red };

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

function ThemeToggle({ themeMode, setThemeMode, C }) {
  const labels = {
    light: { icon: "☀️", label: "Light" },
    dark: { icon: "🌙", label: "Dark" },
    trippy: { icon: "🪩", label: "Trippy" },
  };
  const current = labels[themeMode] || labels.dark;
  return (
    <div
      onClick={() => setThemeMode(cycleThemeMode(themeMode))}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px", borderRadius: 6, cursor: "pointer",
        background: C.blueGlow,
        border: `1px solid ${C.border}`,
        transition: "all 0.2s ease",
      }}
      title="Cycle theme: Light → Dark → Trippy"
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{current.icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: C.textSec }}>{current.label}</span>
    </div>
  );
}

function Sidebar({ activePage, themeMode, setThemeMode, C }) {
  const isDark = themeMode !== "light";
  const NAV = [
    { section: "COMMAND", items: [
      { icon: "🚀", label: "Start Here", key: "start-here" },
      { icon: "◎", label: "Overview", key: "overview" },
      { icon: "▦", label: 'Tasks', key: "boards" },
      { icon: "◷", label: "Timeline", key: "timeline" },
    ]},
    { section: "CREATIVE", items: [
      { icon: "💡", label: "Brainstorming", key: "brainstorming" },
      { icon: "◫", label: "Templates", key: "templates" },
    ]},
    { section: "AGENTS", items: [
      { icon: "⬡", label: "Org Chart", key: "agentarmy" },
      { icon: "⚙", label: "Add Agent", key: "configurator" },
      { icon: "🗂", label: "Files", key: "files" },
    ]},
    { section: "BUSINESS", items: [
      { icon: "◇", label: "CRM & Sales", key: "crm" },
      { icon: "◆", label: "Marketing", key: "marketing" },
      { icon: "◈", label: "Finance", key: "finance" },
    ]},
    { section: "DELIVER", items: [
      { icon: "🌐", label: "Web Delivery", key: "webdelivery" },
    ]},
    { section: "SYSTEM", items: [
      { icon: "⛨", label: "Security", key: "security" },
      { icon: "⊞", label: "Integrations", key: "integrations" },
      { icon: "📊", label: "Cost & Usage", key: "costusage" },
      { icon: "⚙️", label: "Settings", key: "settings" },
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
              return (
                <div key={ii} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6,
                  cursor: "pointer", background: active ? C.blueGlow : "transparent",
                  borderLeft: active ? `2px solid ${C.blue}` : "2px solid transparent", marginBottom: 1,
                  transition: "all 0.15s ease",
                }}>
                  <span style={{ fontSize: 14, color: active ? C.blue : C.textMuted, width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? (isDark ? "#fff" : C.blue) : C.textSec, flex: 1 }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
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


export default function Overview() {
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  useEffect(() => { persistThemeMode(themeMode); }, [themeMode]);
  const isDark = themeMode !== "light";
  const C = getTheme(themeMode);
  const [tasks, setTasks] = useState(() => readKanbanTasks());

  useEffect(() => {
    const syncTheme = () => setThemeMode(getStoredThemeMode());
    window.addEventListener("focus", syncTheme);
    window.addEventListener("storage", syncTheme);
    window.addEventListener("hashchange", syncTheme);
    return () => {
      window.removeEventListener("focus", syncTheme);
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("hashchange", syncTheme);
    };
  }, []);

  useEffect(() => {
    const onSync = () => setTasks(readKanbanTasks());
    window.addEventListener('mission-data-updated', onSync);
    window.addEventListener('storage', onSync);
    return () => {
      window.removeEventListener('mission-data-updated', onSync);
      window.removeEventListener('storage', onSync);
    };
  }, []);

  const { approvals, blockers, all } = useMemo(() => getApprovalsAndBlockers(tasks), [tasks]);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="overview" themeMode={themeMode} setThemeMode={setThemeMode} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Mission Control</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 320 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Command palette — search anything...</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> 11 agents online</span>
            <span style={{ fontSize: 10, color: C.amber, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> 1 degraded</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          {/* Greeting + command strip */}
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Good morning, Joseph</h2>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 14px" }}>Tuesday, Feb 25, 2026 • 12 agents deployed • 47% launch progress</p>
            <div style={{ display: "flex", gap: 8 }}>
              {COMMAND_ACTIONS.map((a, i) => (
                <button key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                  <span style={{ color: a.color }}>{a.icon}</span> {a.label}
                  <span style={{ fontSize: 9, color: C.textMuted, marginLeft: 4 }}>{a.shortcut}</span>
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Revenue (Feb)", value: "$4,290", change: "+62%", changeColor: C.green, icon: "💰" },
              { label: "Pipeline Value", value: "$10,185", change: "27 deals", changeColor: C.textMuted, icon: "📊" },
              { label: "Tasks In Progress", value: String(all.length || 0), change: `${blockers.length} blocked`, changeColor: blockers.length ? C.red : C.green, icon: "▦" },
              { label: "Pending Approvals", value: String(approvals.length), change: blockers.length ? `${blockers.length} with blockers` : "queue clear", changeColor: approvals.length ? C.amber : C.green, icon: "◉" },
              { label: "AI Spend Today", value: "$14.64", change: "48.6% budget", changeColor: C.amber, icon: "💸" },
              { label: "Days to Launch", value: "17", change: "Mar 14 target", changeColor: C.blue, icon: "🚀" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 12 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: s.changeColor, fontWeight: 500, marginTop: 2 }}>{s.change}</div>
              </div>
            ))}
          </div>

          {/* 3-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
            {/* Col 1: Live Feed */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 6, color: C.green }}>●</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Live Activity Feed</span>
                </div>
                <span style={{ fontSize: 9, color: C.textMuted }}>Real-time</span>
              </div>
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {LIVE_FEED.map((item, i) => (
                  <div key={i} style={{ padding: "8px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", minWidth: 56, flexShrink: 0, paddingTop: 1 }}>{item.time}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: item.agentColor }}>{item.agent}</span>
                      <div style={{ fontSize: 11, color: item.type === "error" ? C.red : item.type === "approval" ? C.amber : C.textSec, lineHeight: "15px", marginTop: 1 }}>{item.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Agent Grid */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Org Chart Status</span>
                <span style={{ fontSize: 9, color: C.textMuted }}>12 total</span>
              </div>
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {AGENT_STATUS.map((agent, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, fontWeight: 700, color: "#fff",
                      }}>{agent.initials}</div>
                      <div style={{
                        position: "absolute", bottom: -1, right: -1, width: 8, height: 8,
                        borderRadius: "50%", background: STATUS_DOT[agent.status],
                        border: `2px solid ${C.surface}`,
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.name}</div>
                      <div style={{ fontSize: 9, color: C.textMuted }}>{agent.model}</div>
                    </div>
                    {agent.queue > 0 && (
                      <span style={{
                        fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 9999,
                        background: agent.queue > 5 ? C.amberGlow : C.elevated,
                        color: agent.queue > 5 ? C.amber : C.textSec,
                        border: `1px solid ${agent.queue > 5 ? `${C.amber}33` : C.border}`,
                      }}>{agent.queue} queued</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Pipeline + Upcoming */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Pipeline funnel */}
              <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Sales Pipeline</span>
                </div>
                <div style={{ padding: "8px 12px" }}>
                  {PIPELINE_SUMMARY.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 4px" }}>
                      <span style={{ fontSize: 10, color: C.textMuted, width: 70 }}>{s.stage}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.elevated }}>
                        <div style={{ width: `${(s.count / 14) * 100}%`, height: "100%", borderRadius: 3, background: s.color, minWidth: 4 }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.text, minWidth: 20, textAlign: "right" }}>{s.count}</span>
                      <span style={{ fontSize: 9, color: C.textMuted, minWidth: 45, textAlign: "right", fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming */}
              <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden", flex: 1 }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Upcoming</span>
                </div>
                <div style={{ padding: "4px 0" }}>
                  {UPCOMING.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 10, color: C.blue, fontWeight: 600, minWidth: 60, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{item.time}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{item.title}</div>
                        <div style={{ fontSize: 9, color: C.textMuted }}>{item.agent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar: Alerts + Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            {/* Alerts strip */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>⚡ Action Items</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { icon: "🔴", text: "Build #347 failed — TypeScript error needs fix", action: "View Error", color: C.red },
                  { icon: "🟡", text: "Security Sentinel running at degraded performance", action: "Check Status", color: C.amber },
                  { icon: "🟡", text: "QuickBooks token refresh delayed — may need reconnection", action: "Reconnect", color: C.amber },
                  { icon: "🔵", text: "5 approvals pending your review (2 high-risk)", action: "Review Now", color: C.blue },
                  { icon: "🟢", text: "Website live target in 3 days — Stripe checkout on critical path", action: "View Timeline", color: C.green },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 6, background: C.elevated, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12 }}>{a.icon}</span>
                    <span style={{ fontSize: 11, color: C.textSec, flex: 1 }}>{a.text}</span>
                    <button style={{ padding: "3px 10px", borderRadius: 4, border: `1px solid ${a.color}33`, background: `${a.color}15`, color: a.color, fontSize: 9, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{a.action}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* System health mini */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>System Health</div>
              {[
                { label: "System Uptime", value: "99.97%", color: C.green },
                { label: "Avg Response Time", value: "3.2s", color: C.green },
                { label: "Integrations", value: "17/18 healthy", color: C.green },
                { label: "Security Threats", value: "1 active", color: C.amber },
                { label: "OpenClaw Version", value: "v2.1.4", color: C.blue },
                { label: "Last Backup", value: "2h ago", color: C.green },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 11, color: C.textSec }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
