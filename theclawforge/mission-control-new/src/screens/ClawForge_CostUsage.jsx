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


const DAILY_SPEND = [
  { day: "Feb 17", tokens: 42800, cost: 1.24, calls: 186 },
  { day: "Feb 18", tokens: 51200, cost: 1.58, calls: 210 },
  { day: "Feb 19", tokens: 38400, cost: 1.12, calls: 155 },
  { day: "Feb 20", tokens: 61000, cost: 1.89, calls: 248 },
  { day: "Feb 21", tokens: 55800, cost: 1.72, calls: 231 },
  { day: "Feb 22", tokens: 48600, cost: 1.41, calls: 197 },
  { day: "Feb 23", tokens: 32100, cost: 0.94, calls: 128 },
  { day: "Feb 24", tokens: 58200, cost: 1.78, calls: 240 },
  { day: "Feb 25", tokens: 34600, cost: 1.02, calls: 142 },
];

const MODEL_BREAKDOWN = [
  { model: "Claude Opus", provider: "Anthropic", color: "#D4A574", tokens: "82,400", cost: "$6.18", pct: 42.2, calls: 124, avgLatency: "7.8s", quality: 98 },
  { model: "Claude Sonnet", provider: "Anthropic", color: "#C19A6B", tokens: "124,600", cost: "$1.87", pct: 12.8, calls: 412, avgLatency: "2.9s", quality: 93 },
  { model: "Claude Haiku", provider: "Anthropic", color: "#A0845C", tokens: "48,200", cost: "$0.05", pct: 0.3, calls: 298, avgLatency: "0.7s", quality: 84 },
  { model: "GPT-4o", provider: "OpenAI", color: "#74AA9C", tokens: "96,800", cost: "$2.42", pct: 16.5, calls: 286, avgLatency: "3.8s", quality: 91 },
  { model: "Gemini Pro", provider: "Google", color: "#4285F4", tokens: "71,400", cost: "$0.50", pct: 3.4, calls: 198, avgLatency: "2.1s", quality: 87 },
];

const AGENT_COSTS = [
  { name: "Operations CEO", initials: "OP", color: C.blue, cost: "$2.14", tokens: "28,400", calls: 86, trend: "+12%", trendDir: "up" },
  { name: "Security Sentinel", initials: "SS", color: C.red, cost: "$1.89", tokens: "24,200", calls: 72, trend: "+45%", trendDir: "up", alert: true },
  { name: "Marketing CEO", initials: "MK", color: C.purple, cost: "$1.72", tokens: "22,800", calls: 94, trend: "-8%", trendDir: "down" },
  { name: "Sales CEO", initials: "SL", color: C.green, cost: "$1.48", tokens: "19,600", calls: 68, trend: "+5%", trendDir: "up" },
  { name: "DevOps Engineer", initials: "DV", color: C.orange, cost: "$1.36", tokens: "18,100", calls: 52, trend: "+22%", trendDir: "up" },
  { name: "Content Writer", initials: "CW", color: C.pink, cost: "$1.24", tokens: "16,400", calls: 88, trend: "-3%", trendDir: "down" },
  { name: "Finance CEO", initials: "FN", color: C.amber, cost: "$1.08", tokens: "14,200", calls: 46, trend: "+2%", trendDir: "up" },
  { name: "CX CEO", initials: "CX", color: C.teal, cost: "$0.96", tokens: "12,800", calls: 54, trend: "-15%", trendDir: "down" },
  { name: "Full-Stack Dev", initials: "FS", color: "#60A5FA", cost: "$0.88", tokens: "11,600", calls: 42, trend: "+8%", trendDir: "up" },
  { name: "QA Tester", initials: "QA", color: "#FB923C", cost: "$0.72", tokens: "9,400", calls: 36, trend: "+1%", trendDir: "up" },
];

const BUDGET_ALERTS = [
  { type: "warning", msg: "Security Sentinel spend up 45% vs 7-day avg — elevated scans active", time: "1h ago" },
  { type: "info", msg: "Monthly AI budget 48.6% utilized ($14.64 of $30.00) — on track", time: "3h ago" },
  { type: "success", msg: "Cost optimization: Haiku routing saved $2.40 today on classification tasks", time: "6h ago" },
];

function SparkBar({ data, maxVal, height = 80 }) {
  const barW = Math.max(16, Math.floor((320 - data.length * 3) / data.length));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height, padding: "0 2px" }}>
      {data.map((d, i) => {
        const isToday = i === data.length - 1;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: barW }}>
            <span style={{ fontSize: 7, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>${d.cost.toFixed(2)}</span>
            <div style={{
              width: "100%", borderRadius: "3px 3px 0 0",
              height: `${(d.cost / maxVal) * (height - 24)}px`,
              background: isToday ? `linear-gradient(180deg, ${C.blue}, ${C.purple})` : `${C.blue}66`,
              border: isToday ? `1px solid ${C.blue}` : "none",
            }} />
            <span style={{ fontSize: 7, color: isToday ? C.blue : C.textMuted, fontWeight: isToday ? 700 : 400 }}>{d.day.split(" ")[1]}</span>
          </div>
        );
      })}
    </div>
  );
}

function QualityBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, width: 80 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.elevated }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 2, background: color }} />
      </div>
      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", minWidth: 24 }}>{value}%</span>
    </div>
  );
}

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


export default function CostUsage() {
  const { store } = useMissionControl();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("cf-theme") === "dark");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [tab, setTab] = useState("daily");
  const totalCostToday = 14.64;
  const monthlyBudget = 30.00;
  const budgetPct = ((totalCostToday / monthlyBudget) * 100).toFixed(1);
  const maxDailyCost = Math.max(...DAILY_SPEND.map(d => d.cost));

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="costusage" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>System</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Cost & Usage</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search costs...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: store.ui.degraded ? C.red : C.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> {store.ui.degraded ? 'Degraded data mode' : 'Real-time tracking'}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Cost & Usage Dashboard</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>AI spend optimization • February 2026</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>⚙ Budget Settings</button>
              <button style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>📄 Export</button>
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Today's Spend", value: `$${totalCostToday.toFixed(2)}`, sub: "9 days into Feb", icon: "💸" },
              { label: "Monthly Budget", value: `$${monthlyBudget.toFixed(2)}`, sub: `${budgetPct}% utilized`, icon: "📊" },
              { label: "Avg Daily Cost", value: "$1.41", sub: "Last 7 days", icon: "📈" },
              { label: "Total Tokens", value: "423K", sub: "Feb to date", icon: "🔤" },
              { label: "Total API Calls", value: "1,318", sub: "Feb to date", icon: "⚡" },
              { label: "Avg Latency", value: "3.2s", sub: "Across all models", icon: "⏱" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 12 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Budget utilization bar */}
          <div style={{ padding: "14px 18px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Monthly AI Budget</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.amber, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>${totalCostToday.toFixed(2)} / ${monthlyBudget.toFixed(2)}</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: C.elevated, overflow: "hidden" }}>
              <div style={{
                width: `${budgetPct}%`, height: "100%", borderRadius: 5,
                background: parseFloat(budgetPct) > 80 ? `linear-gradient(90deg, ${C.amber}, ${C.red})` : `linear-gradient(90deg, ${C.blue}, ${C.purple})`,
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 9, color: C.textMuted }}>$0</span>
              <span style={{ fontSize: 9, color: C.textMuted }}>Projected month-end: ~$42.30</span>
              <span style={{ fontSize: 9, color: C.textMuted }}>$30 budget</span>
            </div>
          </div>

          {/* Middle row: Daily spend chart + Model breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            {/* Daily spend */}
            <div style={{ padding: "16px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Daily Spend (Feb)</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {["daily", "cumulative"].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 500, cursor: "pointer", textTransform: "capitalize",
                      border: `1px solid ${tab === t ? C.blue : C.border}`,
                      background: tab === t ? C.blueGlow : "transparent",
                      color: tab === t ? C.blue : C.textMuted,
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <SparkBar data={DAILY_SPEND} maxVal={maxDailyCost} />
            </div>

            {/* Model breakdown table */}
            <div style={{ padding: "16px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 12 }}>Model Breakdown</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 50px 80px", gap: 4, padding: "0 0 6px", borderBottom: `1px solid ${C.border}` }}>
                {["Model", "Cost", "Calls", "Latency", "Quality"].map(h => (
                  <span key={h} style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
                ))}
              </div>
              {MODEL_BREAKDOWN.map((m, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 50px 80px", gap: 4, padding: "8px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{m.model}</div>
                      <div style={{ fontSize: 8, color: C.textMuted }}>{m.provider}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{m.cost}</span>
                  <span style={{ fontSize: 10, color: C.textSec, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{m.calls}</span>
                  <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{m.avgLatency}</span>
                  <QualityBar value={m.quality} color={m.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row: Agent costs + Budget alerts */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            {/* Agent cost leaderboard */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Cost by Agent</span>
                <span style={{ fontSize: 9, color: C.textMuted }}>Sorted by spend ↓</span>
              </div>
              {AGENT_COSTS.map((agent, i) => {
                const maxCost = 2.14;
                const costNum = parseFloat(agent.cost.replace("$", ""));
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 10, color: C.textMuted, width: 16, textAlign: "right", fontWeight: 600 }}>#{i + 1}</span>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: "#fff",
                    }}>{agent.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{agent.name}</span>
                        {agent.alert && <span style={{ fontSize: 8, padding: "0 4px", borderRadius: 3, background: C.amberGlow, color: C.amber, fontWeight: 600 }}>⚠ Spike</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: C.elevated, maxWidth: 120 }}>
                          <div style={{ width: `${(costNum / maxCost) * 100}%`, height: "100%", borderRadius: 2, background: agent.color }} />
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{agent.tokens}</span>
                    <span style={{ fontSize: 10, color: C.textSec, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", minWidth: 30, textAlign: "right" }}>{agent.calls}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", minWidth: 42, textAlign: "right" }}>{agent.cost}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, minWidth: 36, textAlign: "right",
                      color: agent.trendDir === "up" ? (parseFloat(agent.trend) > 20 ? C.red : C.amber) : C.green,
                    }}>{agent.trendDir === "up" ? "↑" : "↓"} {agent.trend}</span>
                  </div>
                );
              })}
            </div>

            {/* Budget alerts */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Budget Alerts</span>
              </div>
              <div style={{ padding: "8px" }}>
                {BUDGET_ALERTS.map((alert, i) => {
                  const aColor = alert.type === "warning" ? C.amber : alert.type === "info" ? C.blue : C.green;
                  const aBg = alert.type === "warning" ? C.amberGlow : alert.type === "info" ? C.blueGlow : C.greenGlow;
                  const aIcon = alert.type === "warning" ? "⚠" : alert.type === "info" ? "ℹ" : "✓";
                  return (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: aBg, border: `1px solid ${aColor}22`, marginBottom: 6, borderLeft: `3px solid ${aColor}` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 12, flexShrink: 0 }}>{aIcon}</span>
                        <div>
                          <div style={{ fontSize: 11, color: C.text, lineHeight: "16px", fontWeight: 500 }}>{alert.msg}</div>
                          <div style={{ fontSize: 9, color: C.textMuted, marginTop: 3 }}>{alert.time}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI insights */}
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 8 }}>🧠 Optimization Tips</div>
                {[
                  "Route more classification tasks to Haiku — save ~$1.20/day",
                  "Content Writer uses Sonnet for drafts — try Haiku first pass + Sonnet for polish",
                  "Gemini Pro underused for data extraction — shift from GPT-4o for 70% cost savings",
                ].map((tip, i) => (
                  <div key={i} style={{ fontSize: 10, color: C.textSec, lineHeight: "15px", padding: "4px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ color: C.purple, marginRight: 4 }}>→</span> {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
