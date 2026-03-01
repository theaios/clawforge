import {useState, useEffect} from "react";

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


const EMPTY_STATES = [
  {
    key: "agents",
    navLabel: "No Agents",
    icon: "⬡",
    iconGradient: [C.blue, C.purple],
    title: "Deploy your first agent",
    subtitle: "Your Org Chart is empty. Create your first AI agent to start automating tasks, handling customer inquiries, and running your business operations around the clock.",
    primaryAction: "⬡ Create First Agent",
    primaryColor: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
    secondaryAction: "Watch Setup Tutorial",
    tips: [
      { icon: "🚀", text: "Start with a single CEO agent — it can manage sub-agents later" },
      { icon: "🧠", text: "The Configurator wizard walks you through model selection, permissions, and guardrails" },
      { icon: "📋", text: "Use one of 15 pre-built role templates to get started in under 5 minutes" },
    ],
    breadcrumb: ["Agents", "Org Chart"],
  },
  {
    key: "boards",
    navLabel: "No Boards",
    icon: "▦",
    iconGradient: [C.purple, C.pink],
    title: "Create your first board",
    subtitle: "Boards let your agents organize, prioritize, and track work across departments. Set up a Kanban board to visualize your team's workflow.",
    primaryAction: "▦ Create First Board",
    primaryColor: C.purple,
    secondaryAction: "Browse Templates",
    tips: [
      { icon: "📌", text: "Start with the Kanban template — it includes Backlog, In Progress, Review, and Done columns" },
      { icon: "🤖", text: "Agents automatically move tasks between columns as work progresses" },
      { icon: "⏱", text: "Set WIP limits to prevent agents from taking on too many tasks at once" },
    ],
    breadcrumb: ["Command", "Tasks"],
  },
  {
    key: "conversations",
    navLabel: "No Conversations",
    icon: "◈",
    iconGradient: [C.teal, C.blue],
    title: "Start your first conversation",
    subtitle: "The Comms Center is where you and your clients talk to your agents. Connect a channel to start routing messages to the right agent automatically.",
    primaryAction: "◈ Connect First Channel",
    primaryColor: C.teal,
    secondaryAction: "View Supported Platforms",
    tips: [
      { icon: "💬", text: "Slack, Discord, Telegram, Email, and SMS are all supported" },
      { icon: "🔀", text: "The Orchestrator routes messages to the best-fit agent based on content and context" },
      { icon: "✅", text: "Enable auto-response for instant replies, or require approval for sensitive channels" },
    ],
    breadcrumb: ["Communicate", "Comms Center"],
  },
  {
    key: "campaigns",
    navLabel: "No Campaigns",
    icon: "◆",
    iconGradient: [C.purple, C.orange],
    title: "Launch your first campaign",
    subtitle: "The Marketing Command Center manages ad campaigns, email sequences, content calendars, and SEO — all coordinated by your Marketing CEO agent.",
    primaryAction: "◆ Create First Campaign",
    primaryColor: `linear-gradient(135deg, ${C.purple}, ${C.orange})`,
    secondaryAction: "Import from Google Ads",
    tips: [
      { icon: "📢", text: "Connect Google Ads, Meta, or LinkedIn to start managing campaigns from Mission Control" },
      { icon: "📧", text: "Build email drip sequences with AI-generated content and A/B testing" },
      { icon: "📈", text: "Your Marketing CEO tracks ROAS and CPA in real-time and suggests optimizations" },
    ],
    breadcrumb: ["Business", "Marketing"],
  },
  {
    key: "deals",
    navLabel: "No Deals",
    icon: "◇",
    iconGradient: [C.green, C.teal],
    title: "Add your first deal",
    subtitle: "The CRM pipeline tracks every prospect from first contact to closed-won. Your Sales CEO agent can qualify leads, send proposals, and follow up automatically.",
    primaryAction: "◇ Add First Deal",
    primaryColor: C.green,
    secondaryAction: "Import from CSV",
    tips: [
      { icon: "🔥", text: "Deals are scored automatically — Hot, Warm, Cold, or At Risk based on engagement signals" },
      { icon: "🧠", text: "AI insights surface buying signals like 'visited pricing page 3x' or 'opened proposal twice'" },
      { icon: "📊", text: "Pipeline value, win rate, and forecast update in real-time as deals progress" },
    ],
    breadcrumb: ["Business", "CRM & Sales"],
  },
  {
    key: "incidents",
    navLabel: "No Incidents",
    icon: "⛨",
    iconGradient: [C.green, "#34D399"],
    title: "No security incidents",
    subtitle: "Your Security Sentinel is actively monitoring all systems. When threats are detected, they'll appear here for review and response.",
    primaryAction: "⛨ Run Manual Scan",
    primaryColor: C.green,
    secondaryAction: "View Security Settings",
    isGoodEmpty: true,
    tips: [
      { icon: "🛡️", text: "Security Sentinel scans customer instances every 30 minutes automatically" },
      { icon: "🔒", text: "Prompt injection defense, WAF rules, and IP blocking are all active" },
      { icon: "📋", text: "Full audit trail of every agent action is logged for compliance" },
    ],
    breadcrumb: ["System", "Security"],
  },
];

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
      { icon: "🧾", label: "Activity Log", key: "activitylog" },
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
              const m = { 'start-here': '/start-here',   chat: '/chat',  brainstorm: '/brainstorm', brainstorming: '/brainstorm', tasks: '/boards', agentarmy: '/army', configurator: '/configurator?step=1', security: '/security', integrations: '/integrations', costusage: '/costs', settings: '/settings', development: '/development', activitylog: '/activity-log', 'activity log': '/activity-log', approvals: '/approvals', files: '/files' };
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


function EmptyStateContent({ state }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        {/* Large icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: "0 auto 20px",
          background: `linear-gradient(135deg, ${state.iconGradient[0]}22, ${state.iconGradient[1]}22)`,
          border: `1px solid ${state.iconGradient[0]}33`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
          boxShadow: `0 0 40px ${state.iconGradient[0]}15`,
        }}>
          {state.icon}
        </div>

        {/* Good-empty celebration badge */}
        {state.isGoodEmpty && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px",
            borderRadius: 9999, background: C.greenGlow, border: `1px solid ${C.green}33`,
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 10 }}>✓</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.green }}>All Clear</span>
          </div>
        )}

        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px", letterSpacing: -0.5 }}>{state.title}</h2>
        <p style={{ fontSize: 13, color: C.textSec, margin: "0 0 24px", lineHeight: "20px" }}>{state.subtitle}</p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }}>
          <button style={{
            padding: "10px 22px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700,
            background: typeof state.primaryColor === "string" && state.primaryColor.includes("gradient") ? state.primaryColor : state.primaryColor,
            color: "#fff", cursor: "pointer",
            boxShadow: `0 4px 16px ${state.iconGradient[0]}33`,
          }}>{state.primaryAction}</button>
          <button style={{
            padding: "10px 22px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.elevated, color: C.textSec, fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>{state.secondaryAction}</button>
        </div>

        {/* Tips */}
        <div style={{ textAlign: "left", padding: "16px 20px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
            {state.isGoodEmpty ? "How it works" : "Getting started"}
          </div>
          {state.tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: i < state.tips.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 16, flexShrink: 0, lineHeight: "20px" }}>{tip.icon}</span>
              <span style={{ fontSize: 12, color: C.textSec, lineHeight: "18px" }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EmptyStates() {
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [activeState, setActiveState] = useState("agents");
  const state = EMPTY_STATES.find(s => s.key === activeState);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="emptystates" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>{state.breadcrumb[0]}</span>
          <span style={{ color: C.textMuted }}>/</span>
          <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{state.breadcrumb[1]}</span>
          <div style={{ flex: 1 }} />
          {/* Switcher for previewing all 6 states */}
          <div style={{ display: "flex", gap: 3, background: C.bg, borderRadius: 8, padding: 3, border: `1px solid ${C.border}` }}>
            {EMPTY_STATES.map(s => (
              <button key={s.key} onClick={() => setActiveState(s.key)} style={{
                padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 500, cursor: "pointer", border: "none",
                background: activeState === s.key ? C.blueGlow : "transparent",
                color: activeState === s.key ? C.blue : C.textMuted,
              }}>{s.navLabel}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
        </div>

        <EmptyStateContent state={state} />
      </div>
    </div>
  );
}
