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


const CAMPAIGNS = [
  {
    id: "c1", name: "AI Agents for SMBs — Google Ads", channel: "Google Ads", status: "active",
    budget: "$1,200/mo", spent: "$387", remaining: "$813",
    metrics: { impressions: "12,400", clicks: "521", ctr: "4.2%", cpc: "$0.74", conversions: 8, cpa: "$48.38", roas: "3.8x" },
    approval: false,
    drip: [
      { type: "ad", label: "Search Ad", status: "active", abt: null },
      { type: "landing", label: "Landing Page", status: "active", abt: null },
      { type: "form", label: "Lead Capture", status: "active", abt: null },
      { type: "email", label: "Welcome Email", status: "active", abt: null },
      { type: "wait", label: "2 days", status: null, abt: null },
      { type: "email", label: "Case Study", status: "active", abt: "A/B" },
      { type: "wait", label: "3 days", status: null, abt: null },
      { type: "email", label: "Demo CTA", status: "queued", abt: null },
    ],
    aiInsight: "CTR 2.3x above benchmark. Recommend increasing budget to $80/day to capture demand during launch window.",
  },
  {
    id: "c2", name: "Retargeting — Meta Ads", channel: "Meta Ads", status: "active",
    budget: "$800/mo", spent: "$156", remaining: "$644",
    metrics: { impressions: "28,900", clicks: "347", ctr: "1.2%", cpc: "$0.45", conversions: 3, cpa: "$52.00", roas: "2.9x" },
    approval: true,
    drip: [
      { type: "ad", label: "Retarget Ad", status: "active", abt: "A/B" },
      { type: "landing", label: "Pricing Page", status: "active", abt: null },
      { type: "form", label: "Book Demo", status: "active", abt: null },
    ],
    aiInsight: "Lookalike audience outperforming interest-based 2:1. Shift remaining budget to lookalike.",
  },
  {
    id: "c3", name: "LinkedIn Thought Leadership", channel: "LinkedIn", status: "active",
    budget: "$600/mo", spent: "$210", remaining: "$390",
    metrics: { impressions: "8,200", clicks: "189", ctr: "2.3%", cpc: "$1.11", conversions: 2, cpa: "$105.00", roas: "1.4x" },
    approval: false,
    drip: [
      { type: "post", label: "Organic Post", status: "active", abt: null },
      { type: "ad", label: "Sponsored Post", status: "active", abt: null },
      { type: "landing", label: "Case Study", status: "active", abt: null },
      { type: "form", label: "Lead Form", status: "active", abt: null },
    ],
    aiInsight: "CPA too high. Recommend pausing sponsored content and doubling down on organic for 2 weeks.",
  },
  {
    id: "c4", name: "Email Nurture — Trial Users", channel: "Email", status: "draft",
    budget: "$0", spent: "$0", remaining: "$0",
    metrics: { impressions: "—", clicks: "—", ctr: "—", cpc: "—", conversions: 0, cpa: "—", roas: "—" },
    approval: true,
    drip: [
      { type: "trigger", label: "Sign-up", status: "queued", abt: null },
      { type: "email", label: "Welcome", status: "draft", abt: null },
      { type: "wait", label: "1 day", status: null, abt: null },
      { type: "email", label: "Quick Win Guide", status: "draft", abt: null },
      { type: "wait", label: "2 days", status: null, abt: null },
      { type: "branch", label: "Engaged?", status: null, abt: null },
      { type: "email", label: "Security Focus", status: "draft", abt: "A/B" },
      { type: "wait", label: "3 days", status: null, abt: null },
      { type: "email", label: "Book Demo CTA", status: "draft", abt: null },
    ],
    aiInsight: "Sequence pending approval. Email #3 subject updated per Orchestrator instructions to focus on security.",
  },
  {
    id: "c5", name: "Blog SEO — Organic Content", channel: "Blog", status: "active",
    budget: "$0", spent: "$0", remaining: "$0",
    metrics: { impressions: "3,100", clicks: "220", ctr: "7.1%", cpc: "$0", conversions: 1, cpa: "$0", roas: "∞" },
    approval: false,
    drip: [
      { type: "post", label: "Blog Post", status: "active", abt: null },
      { type: "landing", label: "Internal CTA", status: "active", abt: null },
      { type: "form", label: "Newsletter", status: "active", abt: null },
    ],
    aiInsight: "\"What are AI agents\" ranking #14 on Google. With 2 more backlinks, could reach page 1.",
  },
];

const CHANNEL_ICONS = {
  "Google Ads": { icon: "🔍", color: "#4285F4" },
  "Meta Ads": { icon: "📘", color: "#1877F2" },
  "LinkedIn": { icon: "💼", color: "#0A66C2" },
  "Email": { icon: "✉️", color: C.amber },
  "Blog": { icon: "📝", color: C.green },
};

const DRIP_ICONS = {
  ad: { icon: "📢", color: C.blue },
  landing: { icon: "🖥", color: C.purple },
  form: { icon: "📋", color: C.green },
  email: { icon: "✉️", color: C.amber },
  wait: { icon: "⏳", color: C.textMuted },
  trigger: { icon: "⚡", color: C.orange },
  branch: { icon: "🔀", color: C.teal },
  post: { icon: "📝", color: C.pink },
};

const STATUS_STYLES = {
  active: { bg: C.greenGlow, color: C.green, border: "rgba(34,197,94,0.3)", label: "Active" },
  draft: { bg: "rgba(92,99,112,0.12)", color: C.textSec, border: "rgba(92,99,112,0.3)", label: "Draft" },
  paused: { bg: C.amberGlow, color: C.amber, border: "rgba(245,158,11,0.3)", label: "Paused" },
  queued: { bg: C.blueGlow, color: C.blue, border: "rgba(59,130,246,0.3)", label: "Queued" },
};

function DripFlow({ steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "8px 0" }}>
      {steps.map((step, i) => {
        const d = DRIP_ICONS[step.type];
        const st = step.status ? STATUS_STYLES[step.status] : null;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 8px", borderRadius: 6, minWidth: 56,
              background: st ? `${st.color}08` : "transparent",
              border: `1px solid ${st ? `${st.color}20` : C.border}`,
              position: "relative",
            }}>
              <span style={{ fontSize: 14 }}>{d.icon}</span>
              <span style={{ fontSize: 8, color: st ? st.color : C.textMuted, fontWeight: 600, whiteSpace: "nowrap", textAlign: "center", lineHeight: "10px" }}>{step.label}</span>
              {step.abt && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  fontSize: 7, fontWeight: 700, padding: "1px 3px", borderRadius: 3,
                  background: C.purple, color: "#fff",
                }}>{step.abt}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 16, height: 1.5,
                background: step.status === "active" || step.status === null ? C.border : `${C.border}66`,
                flexShrink: 0,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CampaignCard({ campaign, isExpanded, onToggle, onSelect }) {
  const ch = CHANNEL_ICONS[campaign.channel];
  const st = STATUS_STYLES[campaign.status];

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
      overflow: "hidden", borderLeft: `3px solid ${ch.color}`,
    }}>
      {/* Header */}
      <div onClick={onToggle} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{ch.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{campaign.name}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
            {campaign.approval && <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: C.amberGlow, color: C.amber, border: `1px solid rgba(245,158,11,0.3)` }}>⛨ Needs Approval</span>}
          </div>
          {/* Quick metrics */}
          <div style={{ display: "flex", gap: 16, fontSize: 10, color: C.textMuted }}>
            <span>Budget: <span style={{ color: C.text, fontWeight: 600 }}>{campaign.budget}</span></span>
            <span>Spent: <span style={{ color: C.amber, fontWeight: 600 }}>{campaign.spent}</span></span>
            {campaign.metrics.ctr !== "—" && <span>CTR: <span style={{ color: parseFloat(campaign.metrics.ctr) > 2 ? C.green : C.text, fontWeight: 600 }}>{campaign.metrics.ctr}</span></span>}
            {campaign.metrics.roas !== "—" && <span>ROAS: <span style={{ color: parseFloat(campaign.metrics.roas) > 2 ? C.green : C.amber, fontWeight: 600 }}>{campaign.metrics.roas}</span></span>}
          </div>
        </div>
        <span style={{ fontSize: 16, color: C.textMuted, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0, marginTop: 4 }}>▾</span>
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
          {/* Drip flow visualization */}
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 6 }}>Campaign Flow</div>
            <DripFlow steps={campaign.drip} />
          </div>

          {/* Full metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
            {[
              { label: "Impressions", value: campaign.metrics.impressions },
              { label: "Clicks", value: campaign.metrics.clicks },
              { label: "CTR", value: campaign.metrics.ctr, color: parseFloat(campaign.metrics.ctr) > 2 ? C.green : C.text },
              { label: "CPC", value: campaign.metrics.cpc },
              { label: "Conversions", value: campaign.metrics.conversions, color: campaign.metrics.conversions > 0 ? C.green : C.textMuted },
              { label: "CPA", value: campaign.metrics.cpa },
              { label: "ROAS", value: campaign.metrics.roas, color: parseFloat(campaign.metrics.roas) > 2 ? C.green : C.amber },
              { label: "Budget Left", value: campaign.remaining, color: C.text },
            ].map((m, i) => (
              <div key={i} style={{ padding: "8px 10px", borderRadius: 6, background: C.elevated, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2, fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: m.color || C.text }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div style={{
            padding: "10px 12px", borderRadius: 8, marginBottom: 12,
            background: C.purpleGlow, border: `1px solid rgba(139,92,246,0.2)`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 11 }}>🧠</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, letterSpacing: 0.5, textTransform: "uppercase" }}>AI Insight</span>
            </div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: "18px" }}>{campaign.aiInsight}</div>
          </div>

          {/* Budget bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: C.textMuted }}>Budget Utilization</span>
              <span style={{ fontSize: 10, color: C.textSec }}>{campaign.spent} / {campaign.budget}</span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 3,
                width: campaign.budget === "$0" ? "0%" : `${(parseFloat(campaign.spent.replace(/[$,]/g, "")) / parseFloat(campaign.budget.replace(/[$,/mo]/g, ""))) * 100}%`,
                background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`,
              }} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            {campaign.status === "active" && <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.amber}44`, background: C.amberGlow, color: C.amber, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Pause</button>}
            {campaign.status === "draft" && <button style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: C.green, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Launch</button>}
            <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, cursor: "pointer" }}>Edit</button>
            <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, cursor: "pointer" }}>Duplicate</button>
            <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, cursor: "pointer" }}>Analytics</button>
          </div>
        </div>
      )}
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


export default function MarketingCommandCenter() {
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [expandedCampaign, setExpandedCampaign] = useState("c1");
  const [filterStatus, setFilterStatus] = useState("all");

  const activeCampaigns = CAMPAIGNS.filter(c => c.status === "active").length;
  const totalSpent = CAMPAIGNS.reduce((s, c) => s + parseFloat(c.spent.replace(/[$,]/g, "") || 0), 0);
  const totalConversions = CAMPAIGNS.reduce((s, c) => s + (c.metrics.conversions || 0), 0);

  const filtered = filterStatus === "all" ? CAMPAIGNS : CAMPAIGNS.filter(c => c.status === filterStatus);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="marketing" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Business</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Marketing</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search campaigns...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> Marketing CEO online</span>
        </div>

        <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Marketing Command Center</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Managed by Marketing CEO • 30-day launch campaign in progress</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>📊 Analytics</button>
              <button style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: C.purple, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ New Campaign</button>
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Active Campaigns", value: activeCampaigns, color: C.green },
              { label: "Total Spend (Feb)", value: `$${totalSpent.toFixed(0)}`, color: C.amber },
              { label: "Total Budget", value: "$2,600/mo", color: C.text },
              { label: "Conversions", value: totalConversions, color: C.green },
              { label: "Avg CPA", value: "$51.35", color: C.text },
              { label: "Blended ROAS", value: "2.7x", color: C.green },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Channel performance bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 6 }}>Spend by Channel</div>
            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2 }}>
              {[
                { label: "Google", width: "51%", color: "#4285F4" },
                { label: "Meta", width: "21%", color: "#1877F2" },
                { label: "LinkedIn", width: "28%", color: "#0A66C2" },
              ].map((ch, i) => (
                <div key={i} style={{ width: ch.width, background: ch.color, borderRadius: 2, position: "relative" }} title={`${ch.label}: ${ch.width}`} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              {[
                { label: "Google Ads", color: "#4285F4", value: "$387" },
                { label: "Meta Ads", color: "#1877F2", value: "$156" },
                { label: "LinkedIn", color: "#0A66C2", value: "$210" },
              ].map((ch, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: ch.color }} />
                  <span style={{ fontSize: 10, color: C.textMuted }}>{ch.label}: <span style={{ color: C.text, fontWeight: 600 }}>{ch.value}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 0, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
            {[
              { key: "all", label: "All", count: CAMPAIGNS.length },
              { key: "active", label: "Active", count: activeCampaigns, color: C.green },
              { key: "draft", label: "Drafts", count: CAMPAIGNS.filter(c => c.status === "draft").length, color: C.textSec },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{
                padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer",
                fontSize: 12, fontWeight: filterStatus === f.key ? 700 : 500,
                color: filterStatus === f.key ? C.text : C.textMuted,
                borderBottom: filterStatus === f.key ? `2px solid ${f.color || C.blue}` : "2px solid transparent",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {f.label}
                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 9999, background: filterStatus === f.key ? `${(f.color || C.blue)}20` : C.elevated, color: filterStatus === f.key ? (f.color || C.blue) : C.textMuted }}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Campaign list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 960 }}>
            {filtered.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                isExpanded={expandedCampaign === campaign.id}
                onToggle={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
