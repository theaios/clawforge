import {useState, useEffect} from "react";
import { getStoredThemeMode } from "../lib/themeMode";

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


const CASHFLOW_DATA = [
  { month: "Oct", inflow: 890, outflow: 420 },
  { month: "Nov", inflow: 1240, outflow: 580 },
  { month: "Dec", inflow: 1890, outflow: 720 },
  { month: "Jan", inflow: 2650, outflow: 1100 },
  { month: "Feb", inflow: 4290, outflow: 1840 },
  { month: "Mar*", inflow: 3800, outflow: 2200, projected: true },
  { month: "Apr*", inflow: 5200, outflow: 2600, projected: true },
];

const TRANSACTIONS = [
  { id: "TXN-089", date: "Feb 25", desc: "Atlas Construction — Executive Build", amount: "+$899.00", type: "income", method: "Stripe", status: "completed" },
  { id: "TXN-088", date: "Feb 24", desc: "AWS Infrastructure — February", amount: "-$487.22", type: "expense", method: "AWS", status: "completed", flagged: true, flag: "12% above forecast" },
  { id: "TXN-087", date: "Feb 22", desc: "Sunrise Bakery — Core Setup", amount: "+$499.00", type: "income", method: "Stripe", status: "completed" },
  { id: "TXN-086", date: "Feb 20", desc: "OpenRouter API Credits", amount: "-$124.50", type: "expense", method: "OpenRouter", status: "completed" },
  { id: "TXN-085", date: "Feb 20", desc: "ClearView Analytics — Core Setup", amount: "+$499.00", type: "income", method: "Stripe", status: "completed" },
  { id: "TXN-084", date: "Feb 19", desc: "Google Ads — Campaign Spend", amount: "-$387.00", type: "expense", method: "Google", status: "completed" },
  { id: "TXN-083", date: "Feb 18", desc: "Meta Ads — Campaign Spend", amount: "-$156.00", type: "expense", method: "Meta", status: "completed" },
  { id: "TXN-082", date: "Feb 18", desc: "LinkedIn Ads — Sponsored Posts", amount: "-$210.00", type: "expense", method: "LinkedIn", status: "completed" },
  { id: "TXN-081", date: "Feb 15", desc: "Membership Renewal — Client #4", amount: "+$99.00", type: "income", method: "Stripe", status: "completed" },
  { id: "TXN-080", date: "Feb 15", desc: "Membership Renewal — Client #7", amount: "+$99.00", type: "income", method: "Stripe", status: "completed" },
  { id: "TXN-079", date: "Feb 14", desc: "SendGrid Email — Monthly", amount: "-$0.00", type: "expense", method: "SendGrid", status: "completed" },
  { id: "TXN-078", date: "Feb 12", desc: "Domain Renewal — theclawforge.com", amount: "-$14.99", type: "expense", method: "Namecheap", status: "completed" },
];

const PENDING_APPROVALS = [
  { id: "FA-012", desc: "Process refund — Order #1089", amount: "-$499.00", agent: "Finance CEO", risk: "high", reason: "SLA violation refund" },
  { id: "FA-011", desc: "Increase Meta Ads budget", amount: "-$40.00/day", agent: "Marketing CEO", risk: "medium", reason: "Campaign outperforming" },
];

const EXPENSE_CATEGORIES = [
  { label: "Infrastructure (AWS)", value: 487.22, pct: 26.5, color: C.blue },
  { label: "Advertising", value: 753.00, pct: 40.9, color: C.purple },
  { label: "AI API Credits", value: 124.50, pct: 6.8, color: C.teal },
  { label: "SaaS Tools", value: 89.00, pct: 4.8, color: C.amber },
  { label: "Contractor/Services", value: 372.00, pct: 20.2, color: C.orange },
  { label: "Other", value: 14.99, pct: 0.8, color: C.textMuted },
];

function MiniBarChart({ data, maxVal }) {
  const barW = 32;
  const h = 120;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: h, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: barW }}>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: h - 18 }}>
            <div style={{
              width: 12, borderRadius: "3px 3px 0 0",
              height: `${(d.inflow / maxVal) * (h - 18)}px`,
              background: d.projected ? `${C.green}44` : C.green,
              border: d.projected ? `1px dashed ${C.green}66` : "none",
            }} />
            <div style={{
              width: 12, borderRadius: "3px 3px 0 0",
              height: `${(d.outflow / maxVal) * (h - 18)}px`,
              background: d.projected ? `${C.red}44` : C.red,
              border: d.projected ? `1px dashed ${C.red}66` : "none",
            }} />
          </div>
          <span style={{ fontSize: 8, color: d.projected ? C.textMuted : C.textSec, fontWeight: 600 }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function ExpenseDonut({ categories }) {
  const total = categories.reduce((s, c) => s + c.value, 0);
  let cumAngle = 0;
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 44;
  const strokeW = 14;

  const arcs = categories.map(cat => {
    const angle = (cat.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = (((startAngle + angle) - 90) * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    return { ...cat, d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}` };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={strokeW} strokeLinecap="round" />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={C.text} fontSize="14" fontWeight="800">${(total / 1000).toFixed(1)}k</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill={C.textMuted} fontSize="8" fontWeight="600">TOTAL</text>
    </svg>
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
              const m = { 'start-here': '/start-here', overview: '/overview', boards: '/boards', timeline: '/timeline', brainstorm: '/brainstorm', brainstorming: '/brainstorm', templates: '/templates', agentarmy: '/army', configurator: '/configurator?step=1', files: '/files', crm: '/crm', marketing: '/marketing', finance: '/finance', webdelivery: '/web', security: '/security', integrations: '/integrations', costusage: '/costs', settings: '/settings' };
              const href = `#${m[item.key] || '/overview'}`;
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


export default function FinanceDashboard() {
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [txnFilter, setTxnFilter] = useState("all");
  const maxCashflow = Math.max(...CASHFLOW_DATA.map(d => Math.max(d.inflow, d.outflow)));

  const filteredTxns = txnFilter === "all" ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === txnFilter);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="finance" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Business</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Finance</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search transactions...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> Finance CEO online</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Finance Dashboard</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Managed by Finance CEO • February 2026</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled title="Prototype control — not wired yet" style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>📄 Export</button>
              <button disabled title="Prototype control — not wired yet" style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>📊 P&L Report</button>
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Revenue (Feb)", value: "$4,290", change: "+62%", changeColor: C.green, icon: "💰" },
              { label: "Expenses (Feb)", value: "$1,841", change: "+24%", changeColor: C.amber, icon: "📉" },
              { label: "Net Profit", value: "$2,449", change: null, changeColor: null, icon: "📈", valueColor: C.green },
              { label: "Gross Margin", value: "57.1%", change: null, changeColor: null, icon: "📊" },
              { label: "Cash Runway", value: "4.2 mo", change: null, changeColor: null, icon: "🏦", valueColor: C.amber },
            ].map((s, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.valueColor || C.text, letterSpacing: -0.5 }}>{s.value}</div>
                {s.change && <div style={{ fontSize: 10, color: s.changeColor, fontWeight: 600, marginTop: 2 }}>{s.change} vs Jan</div>}
              </div>
            ))}
          </div>

          {/* Middle row: cashflow chart + expense donut + pending approvals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Cashflow */}
            <div style={{ padding: "16px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Cash Flow</span>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 9, color: C.green, display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 4, background: C.green, borderRadius: 1 }} /> Inflow</span>
                  <span style={{ fontSize: 9, color: C.red, display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 4, background: C.red, borderRadius: 1 }} /> Outflow</span>
                </div>
              </div>
              <MiniBarChart data={CASHFLOW_DATA} maxVal={maxCashflow} />
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 6, textAlign: "center" }}>* Mar & Apr projected</div>
            </div>

            {/* Expense breakdown */}
            <div style={{ padding: "16px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text, display: "block", marginBottom: 12 }}>Expense Breakdown</span>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ExpenseDonut categories={EXPENSE_CATEGORIES} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  {EXPENSE_CATEGORIES.map((cat, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 9, color: C.textSec, flex: 1 }}>{cat.label}</span>
                      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{cat.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending financial approvals */}
            <div style={{ padding: "16px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Pending Approvals</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 9999, background: C.amberGlow, color: C.amber }}>{PENDING_APPROVALS.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PENDING_APPROVALS.map(a => (
                  <div key={a.id} style={{ padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}`, borderLeft: `3px solid ${a.risk === "high" ? C.red : C.amber}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{a.desc}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: a.amount.startsWith("-") ? C.red : C.green, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{a.amount}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6 }}>{a.agent} • {a.reason}</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button disabled title="Prototype control — not wired yet" style={{ padding: "3px 10px", borderRadius: 4, border: "none", background: C.green, color: "#fff", fontSize: 9, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                      <button disabled title="Prototype control — not wired yet" style={{ padding: "3px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 9, cursor: "pointer" }}>Review</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction table */}
          <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Recent Transactions</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["all", "income", "expense"].map(f => (
                  <button key={f} onClick={() => setTxnFilter(f)} style={{
                    padding: "4px 10px", borderRadius: 5, border: `1px solid ${txnFilter === f ? C.blue : C.border}`,
                    background: txnFilter === f ? C.blueGlow : "transparent",
                    color: txnFilter === f ? C.blue : C.textMuted,
                    fontSize: 10, fontWeight: 500, cursor: "pointer", textTransform: "capitalize",
                  }}>{f}</button>
                ))}
              </div>
            </div>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 130px 100px 80px", padding: "8px 16px", background: C.elevated, borderBottom: `1px solid ${C.border}` }}>
              {["Date", "Description", "Amount", "Method", "Status"].map(h => (
                <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {filteredTxns.map((txn, i) => (
              <div key={txn.id} style={{
                display: "grid", gridTemplateColumns: "80px 1fr 130px 100px 80px",
                padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
                background: i % 2 === 0 ? "transparent" : `${C.elevated}44`,
              }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>{txn.date}</span>
                <div>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{txn.desc}</span>
                  {txn.flagged && (
                    <span style={{ fontSize: 9, color: C.amber, marginLeft: 8, fontWeight: 500 }}>⚠ {txn.flag}</span>
                  )}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                  color: txn.amount.startsWith("+") ? C.green : C.red,
                }}>{txn.amount}</span>
                <span style={{ fontSize: 10, color: C.textSec }}>{txn.method}</span>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, alignSelf: "center", width: "fit-content",
                  background: C.greenGlow, color: C.green, border: `1px solid rgba(34,197,94,0.3)`,
                }}>✓ {txn.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
