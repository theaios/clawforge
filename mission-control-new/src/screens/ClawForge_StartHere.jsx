import { useEffect, useState } from "react";
import { getStoredThemeMode } from "../lib/themeMode";
import { PRIMARY_NAV_ITEMS, SYSTEM_NAV_ITEMS } from "../lib/systemNav";

function getTheme(mode) {
  if (mode === "trippy") {
    return {
      bg: "#140825", surface: "#24113F", elevated: "#321759",
      border: "#6B36A8", borderLight: "#8E4CD4",
      text: "#F8F3FF", textSec: "#DCC9FF", textMuted: "#BFA2EF",
      blue: "#00E5FF", blueGlow: "rgba(0,229,255,0.20)",
      green: "#39FF88", greenGlow: "rgba(57,255,136,0.18)",
      amber: "#FFD166", amberGlow: "rgba(255,209,102,0.18)",
      red: "#FF5FA2", redGlow: "rgba(255,95,162,0.18)",
      purple: "#B26BFF", purpleGlow: "rgba(178,107,255,0.18)",
      teal: "#20D9FF", orange: "#FF9F45", pink: "#FF6BDA",
    };
  }
  const dark = mode !== "light";
  if (dark) {
    return {
      bg: "#0A0C10", surface: "#12151B", elevated: "#1A1E26",
      border: "#252A34", borderLight: "#2E3440",
      text: "#E8EAED", textSec: "#8B919E", textMuted: "#5C6370",
      blue: "#3B82F6", blueGlow: "rgba(59,130,246,0.15)", blueDim: "rgba(59,130,246,0.08)",
      green: "#22C55E", greenGlow: "rgba(34,197,94,0.12)",
      amber: "#F59E0B", amberGlow: "rgba(245,158,11,0.12)",
      red: "#EF4444", redGlow: "rgba(239,68,68,0.12)",
      purple: "#8B5CF6", purpleGlow: "rgba(139,92,246,0.12)",
      teal: "#06B6D4", orange: "#F97316", pink: "#EC4899",
    };
  }

  return {
    bg: "#F4F5F8", surface: "#FFFFFF", elevated: "#EEF1F6",
    border: "#C9D0DB", borderLight: "#DCE2EC",
    text: "#111827", textSec: "#374151", textMuted: "#4B5563",
    blue: "#2563EB", blueGlow: "rgba(37,99,235,0.10)", blueDim: "rgba(37,99,235,0.07)",
    green: "#16A34A", greenGlow: "rgba(22,163,74,0.10)",
    amber: "#D97706", amberGlow: "rgba(217,119,6,0.10)",
    red: "#DC2626", redGlow: "rgba(220,38,38,0.10)",
    purple: "#7C3AED", purpleGlow: "rgba(124,58,237,0.10)",
    teal: "#0891B2", orange: "#EA580C", pink: "#DB2777",
  };
}

let C = getTheme(true);

const START_HERE_STORAGE_KEY = "clawforge.startHere.state.v1";

const DEFAULT_MEMORY_SETTINGS = {
  perAgent: true,
  crossAgent: false,
  longTerm: true,
  autoSummarize: true,
  userFacing: false,
};

function readPersistedStartHere() {
  try {
    const raw = localStorage.getItem(START_HERE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

// ── Nav sections (matching other ClawForge screens) ────────────────────────────
const NAV = [
  { section: "COMMAND",     items: [{ icon: "◎", label: "Overview" }, { icon: "▦", label: "Boards" }, { icon: "◷", label: "Timeline" }] },
  { section: "COMMUNICATE", items: [{ icon: "◈", label: "Comms Center", badge: 4 }, { icon: "◉", label: "Approvals", badge: 3 }] },
  { section: "AGENTS",      items: [{ icon: "⬡", label: "Agent Army" }, { icon: "⚙", label: "Configurator" }] },
  { section: "BUSINESS",    items: [{ icon: "◇", label: "CRM & Sales" }, { icon: "◆", label: "Marketing" }, { icon: "◈", label: "Finance" }] },
  { section: "SYSTEM",      items: [{ icon: "⛨", label: "Security" }, { icon: "⊞", label: "Integrations" }, { icon: "◎", label: "Cost & Usage" }] },
];

// ── Capability cards for the discovery wizard ─────────────────────────────────
const CAPABILITIES = [
  { id: "website",    icon: "🌐", label: "Website",           desc: "Landing pages, full site, blog",        agents: ["Full-Stack Dev","Content Writer","SEO Specialist"], color: C.blue },
  { id: "bizplan",    icon: "📋", label: "Business Plan",     desc: "Market research, financials, strategy",  agents: ["Operations CEO","Finance CEO"],                   color: C.purple },
  { id: "marketing",  icon: "📣", label: "Marketing Strategy",desc: "Brand, positioning, go-to-market",       agents: ["Marketing CEO","Content Writer"],                 color: C.pink },
  { id: "social",     icon: "📱", label: "Social Media",      desc: "Content calendar, posting, engagement",  agents: ["Marketing CEO","Content Writer","Community Mgr"], color: C.teal },
  { id: "paidads",    icon: "💰", label: "Paid Advertising",  desc: "Meta, Google, TikTok ad campaigns",      agents: ["Marketing CEO","SEO Specialist"],                 color: C.orange },
  { id: "email",      icon: "✉️",  label: "Email Marketing",   desc: "Sequences, newsletters, automations",    agents: ["Marketing CEO","Content Writer"],                 color: C.amber },
  { id: "ecommerce",  icon: "🛒", label: "E-Commerce",        desc: "Product pages, checkout, catalog",       agents: ["Full-Stack Dev","Sales CEO"],                     color: C.green },
  { id: "sales",      icon: "🤝", label: "Sales System",      desc: "CRM, outreach, pipeline management",     agents: ["Sales CEO","CX CEO"],                            color: C.green },
  { id: "support",    icon: "🎧", label: "Customer Support",  desc: "Help desk, tickets, live chat, FAQs",    agents: ["CX CEO","Onboarding Specialist"],                 color: C.teal },
  { id: "content",    icon: "✍️",  label: "Content Creation",  desc: "Blog posts, videos, copywriting",        agents: ["Content Writer","SEO Specialist"],               color: C.pink },
  { id: "seo",        icon: "🔍", label: "SEO & Growth",      desc: "Keyword strategy, rankings, backlinks",  agents: ["SEO Specialist","Content Writer"],               color: C.blue },
  { id: "finance",    icon: "📊", label: "Finance & Reporting",desc: "Budgets, P&L, forecasting, reporting",  agents: ["Finance CEO","Operations CEO"],                  color: C.amber },
];

const GOALS = [
  { id: "leads",    icon: "🎯", label: "Generate Leads & Clients" },
  { id: "sell",     icon: "💳", label: "Sell Products or Services" },
  { id: "brand",    icon: "⭐", label: "Build Brand Awareness" },
  { id: "automate", icon: "🤖", label: "Automate Business Operations" },
  { id: "scale",    icon: "📈", label: "Scale an Existing Business" },
  { id: "launch",   icon: "🚀", label: "Launch Something New" },
];

const INDUSTRIES = [
  "E-Commerce","SaaS / Software","Agency / Freelance","Consulting","Real Estate",
  "Health & Wellness","Education / Coaching","Food & Beverage","Finance / FinTech",
  "Marketing / Media","Non-Profit","Other",
];

// ── Default core file contents ─────────────────────────────────────────────────
const DEFAULT_PROTOCOL = `# Shared Agent Protocol — ClawForge v1.0

## Core Principles
All agents operating within ClawForge must adhere to the following shared principles at all times.

## 1. Orchestrator Authority
The Orchestrator (human user) has final decision-making authority on all significant actions. Agents must seek approval before:
- Spending money or committing budget
- Publishing content publicly
- Sending external communications
- Making infrastructure changes

## 2. Communication Standards
- Always respond in the language and tone established for this workspace
- Keep responses concise and actionable
- Flag blockers immediately rather than working around them
- Escalate unresolved conflicts to the Orchestrator

## 3. Data & Privacy
- Never share customer data across unauthorized contexts
- All PII must be handled per the workspace privacy policy
- Log all significant actions to the audit trail

## 4. Collaboration Rules
- Agents may request resources from peer agents via structured task requests
- No agent may override another agent's active task without Orchestrator approval
- Disagreements between agents must be surfaced, not silently resolved

## 5. Quality Standards
- Deliverables must meet the quality bar defined in the Knowledge Base
- All code must pass QA review before deployment
- All content must pass brand guidelines before publishing`;

const DEFAULT_KNOWLEDGE = `# Company Knowledge Base

## Company Overview
[Company name and description will appear here once you complete setup]

## Brand Voice & Tone
- Professional yet approachable
- Clear and direct — no jargon
- Empowering and action-oriented

## Target Audience
[Define your primary customer persona here]

## Products & Services
[List your core offerings here]

## Pricing
[Your pricing structure]

## Key Messaging
- Primary value proposition: [TBD]
- Tagline: [TBD]
- Elevator pitch: [TBD]

## Competitors
[Key competitors and how you differentiate]

## Brand Assets
- Logo: /assets/logo.png
- Brand colors: [TBD]
- Fonts: [TBD]

## Important Links
- Website: [TBD]
- Social profiles: [TBD]
- Analytics: [TBD]`;

// ── Shared UI primitives ───────────────────────────────────────────────────────
function Sidebar() {
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true });
  const currentRoute = (window.location.hash.replace('#', '').split('?')[0] || '/start-here');
  const NAV = [
    { section: 'MAIN', items: [{ icon: '🚀', label: 'Start Here', key: 'start-here', path: '/start-here' }, ...PRIMARY_NAV_ITEMS.filter((i) => i.key !== 'start-here')] },
    { section: 'SYSTEM', items: SYSTEM_NAV_ITEMS },
  ];

  return (
    <div style={{ width: 220, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.orange}, #c2410c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>ClawForge</div>
          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>Mission Control</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {NAV.map((s) => {
          const collapsed = !!collapsedSections[s.section];
          return (
            <div key={s.section} style={{ marginBottom: 4 }}>
              <button onClick={() => setCollapsedSections((p) => ({ ...p, [s.section]: !p[s.section] }))} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, color: C.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', padding: '12px 10px 6px' }}>
                <span>{s.section}</span>
                <span style={{ minWidth: 18, height: 18, borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}`, background: C.elevated, fontSize: 13, fontWeight: 800, lineHeight: 1, color: C.textSec }}>{collapsed ? '+' : '−'}</span>
              </button>
              {!collapsed && s.items.map((item) => {
                const targetPath = item.path || '/boards';
                const active = currentRoute === targetPath.split('?')[0];
                return (
                  <a key={item.key} href={`#${targetPath}`} onClick={(e) => { e.preventDefault(); window.location.hash = targetPath; }} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', background: active ? C.blueGlow : 'transparent', borderLeft: active ? `2px solid ${C.blue}` : '2px solid transparent', marginBottom: 1, transition: 'all 0.15s ease' }}>
                    <span style={{ fontSize: 14, color: active ? C.blue : C.textMuted, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? C.text : C.textSec, flex: 1 }}>{item.label}</span>
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionTab({ id, icon, label, active, done, onClick }) {
  return (
    <button onClick={() => onClick(id)} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 9,
      border: `1px solid ${active ? C.blue + "60" : C.border}`,
      background: active ? C.blueGlow : "transparent",
      cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 6,
      transition: "all 0.15s",
    }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: done ? C.green + "20" : active ? C.blueGlow : C.elevated, border: `1.5px solid ${done ? C.green : active ? C.blue : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: done ? 12 : 14, flexShrink: 0 }}>
        {done ? "✓" : icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? C.text : done ? C.green : C.textSec }}>{label}</div>
      </div>
    </button>
  );
}

function SectionCard({ children, title, subtitle, icon }) {
  return (
    <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
      {(title || subtitle) && (
        <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
          <div>
            {title && <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</div>}
          </div>
        </div>
      )}
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>{children}</div>;
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 13px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.elevated, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
      onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border}
    />
  );
}

function SaveBtn({ saved, onClick, label = "Save Changes" }) {
  return (
    <button onClick={onClick} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saved ? C.green + "20" : C.blue, color: saved ? C.green : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s" }}>
      {saved ? "✓ Saved" : label}
    </button>
  );
}

// ── Section: Discovery wizard ──────────────────────────────────────────────────
function DiscoverySection({ data, onChange }) {
  const toggle = (key, val) => {
    const arr = data[key] || [];
    onChange(key, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const selectedIndustries = Array.isArray(data.industry)
    ? data.industry
    : data.industry
      ? [data.industry]
      : [];

  const allAgents = [...new Set(
    (data.capabilities || []).flatMap(id => CAPABILITIES.find(c => c.id === id)?.agents || [])
  )];

  return (
    <div>
      {/* Welcome banner */}
      <div style={{ borderRadius: 14, padding: "28px 30px", marginBottom: 22, background: `linear-gradient(135deg, ${C.blueGlow}, ${C.purpleGlow})`, border: `1px solid ${C.blue}40`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 30, top: "50%", transform: "translateY(-50%)", fontSize: 80, opacity: 0.08 }}>🚀</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 8 }}>Let's build your business together.</div>
        <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.7, maxWidth: 580 }}>
          Answer a few questions so ClawForge can configure your agents, set up your workspace, and get your AI team focused on exactly what you need. This takes about 2 minutes.
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          {["🤖 AI Agent Team","📋 Auto-configured workflows","🎯 Focused on your goals"].map(t => (
            <div key={t} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, background: C.elevated, border: `1px solid ${C.border}`, color: C.textSec }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Business basics */}
      <SectionCard title="Your Business" subtitle="Tell us the basics" icon="🏢">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <Label>Company Name</Label>
            <TextInput value={data.companyName || ""} onChange={v => onChange("companyName", v)} placeholder="e.g. Horizon Labs" />
          </div>
          <div>
            <Label>Your Name / Role</Label>
            <TextInput value={data.founderName || ""} onChange={v => onChange("founderName", v)} placeholder="e.g. Joseph — Founder & CEO" />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Label>Industry / Niche</Label>
          {selectedIndustries.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
              {selectedIndustries.map(ind => (
                <button
                  key={`selected-${ind}`}
                  onClick={() => toggle("industry", ind)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1px solid ${C.blue}`,
                    background: C.blueGlow,
                    color: C.blue,
                    transition: "all 0.15s",
                  }}
                  title="Remove"
                >
                  <span>{ind}</span>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {INDUSTRIES.map(ind => {
              const sel = selectedIndustries.includes(ind);
              return (
                <button key={ind} onClick={() => toggle("industry", ind)} style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${sel ? C.blue : C.border}`, background: sel ? C.blueGlow : C.elevated, color: sel ? C.blue : C.textSec, transition: "all 0.15s" }}>{ind}</button>
              );
            })}
          </div>
        </div>
        <div>
          <Label>What are you building? (one line)</Label>
          <TextInput value={data.description || ""} onChange={v => onChange("description", v)} placeholder="e.g. A SaaS platform that helps freelancers track client payments" />
        </div>
      </SectionCard>

      {/* Primary goals */}
      <SectionCard title="Primary Goals" subtitle="What do you most want ClawForge to help you achieve?" icon="🎯">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {GOALS.map(g => {
            const sel = (data.goals || []).includes(g.id);
            return (
              <button key={g.id} onClick={() => toggle("goals", g.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", borderRadius: 10, cursor: "pointer", border: `1px solid ${sel ? C.blue : C.border}`, background: sel ? C.blueGlow : C.elevated, transition: "all 0.15s", textAlign: "left" }}>
                <span style={{ fontSize: 20 }}>{g.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: sel ? C.text : C.textSec, lineHeight: 1.4 }}>{g.label}</span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Capabilities */}
      <SectionCard title="What Do You Need?" subtitle="Select everything you want your AI team to handle for you" icon="⚡">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {CAPABILITIES.map(cap => {
            const sel = (data.capabilities || []).includes(cap.id);
            return (
              <button key={cap.id} onClick={() => toggle("capabilities", cap.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, cursor: "pointer", border: `1px solid ${sel ? cap.color + "60" : C.border}`, background: sel ? cap.color + "10" : C.elevated, transition: "all 0.15s", textAlign: "left" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: sel ? cap.color + "20" : C.surface, border: `1px solid ${sel ? cap.color + "40" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cap.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: sel ? C.text : C.textSec, marginBottom: 2 }}>{cap.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{cap.desc}</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${sel ? cap.color : C.border}`, background: sel ? cap.color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", transition: "all .15s" }}>{sel ? "✓" : ""}</div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Agent preview */}
      {allAgents.length > 0 && (
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.green}30`, padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Your AI Team — {allAgents.length} agents activated</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Based on your selections, these agents will be configured for your workspace</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {allAgents.map(a => (
              <div key={a} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 99, background: C.elevated, border: `1px solid ${C.green}40`, color: C.green, fontWeight: 500 }}>✓ {a}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section: Shared Protocol editor ───────────────────────────────────────────
function ProtocolSection({ value, onChange }) {
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("edit");
  const [selectedRuleIds, setSelectedRuleIds] = useState([]);
  const [customQuickRules, setCustomQuickRules] = useState([]);
  const [newRuleLabel, setNewRuleLabel] = useState("");
  const [newRuleText, setNewRuleText] = useState("");

  const QUICK_RULES_STORAGE_KEY = "clawforge.startHere.protocol.customQuickRules";
  const BASE_QUICK_RULES = [
    { id: "approval", label: "Approval before spending", rule: "## Budget Approval\nAll agents must seek Orchestrator approval before any spend over $50." },
    { id: "brand-voice", label: "Brand voice enforcement", rule: "## Brand Voice\nAll external content must match the tone defined in the Knowledge Base." },
    { id: "daily-reports", label: "Daily standup reports", rule: "## Daily Reports\nEach CEO-level agent must post a daily standup summary by 9 AM." },
    { id: "data-protection", label: "Customer data protection", rule: "## Data Privacy\nNo customer PII may be used outside its intended context or shared externally." },
    { id: "content-workflow", label: "Content approval workflow", rule: "## Content Workflow\nAll public content requires Orchestrator review before publishing." },
    { id: "error-escalation", label: "Error escalation", rule: "## Error Handling\nAll critical errors must be escalated within 15 minutes with a proposed resolution." },
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUICK_RULES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const sanitized = parsed
        .filter(r => r && typeof r.label === "string" && typeof r.rule === "string")
        .map((r, idx) => ({
          id: typeof r.id === "string" && r.id ? r.id : `custom-${Date.now()}-${idx}`,
          label: r.label.trim(),
          rule: r.rule.trim(),
          custom: true,
        }))
        .filter(r => r.label && r.rule);
      setCustomQuickRules(sanitized);
    } catch {
      // ignore malformed localStorage entries
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(QUICK_RULES_STORAGE_KEY, JSON.stringify(customQuickRules));
  }, [customQuickRules]);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const appendRule = (ruleId, ruleText) => {
    const trimmedRule = ruleText.trim();
    if (!trimmedRule) return;
    const next = value.trimEnd() ? `${value.trimEnd()}\n\n${trimmedRule}` : trimmedRule;
    onChange(next);
    setSelectedRuleIds(ids => ids.includes(ruleId) ? ids : [...ids, ruleId]);
  };

  const addCustomRule = () => {
    const label = newRuleLabel.trim();
    const rule = newRuleText.trim();
    if (!label || !rule) return;
    const created = {
      id: `custom-${Date.now()}`,
      label,
      rule,
      custom: true,
    };
    setCustomQuickRules(prev => [...prev, created]);
    setNewRuleLabel("");
    setNewRuleText("");
  };

  const quickRules = [...BASE_QUICK_RULES, ...customQuickRules];

  return (
    <div>
      <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>📜</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Shared Agent Protocol</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>The rules and principles every agent follows — the single source of truth for agent behaviour</div>
            </div>
          </div>
          <SaveBtn saved={saved} onClick={save} />
        </div>

        {/* What is this callout */}
        <div style={{ margin: "16px 22px 0", padding: "12px 16px", borderRadius: 10, background: C.amberGlow, border: `1px solid ${C.amber}30`, display: "flex", gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>
            <strong style={{ color: C.amber }}>This file is injected into every agent's system prompt.</strong> Changes here affect all agents immediately. Be precise — this is the most powerful file in your workspace.
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, padding: "14px 22px 0", borderBottom: `1px solid ${C.border}`, marginTop: 14 }}>
          {[["edit","✏️ Edit"],["preview","👁 Preview"],["history","🕐 History"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: "8px 16px", border: "none", background: "transparent", color: tab === k ? C.blue : C.textMuted, fontSize: 12, fontWeight: tab === k ? 700 : 400, cursor: "pointer", borderBottom: `2px solid ${tab === k ? C.blue : "transparent"}`, marginBottom: -1 }}>{l}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "20px 22px" }}>
          {tab === "edit" && (
            <textarea value={value} onChange={e => onChange(e.target.value)}
              style={{ width: "100%", minHeight: 420, padding: "14px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.elevated, color: C.text, fontSize: 12.5, fontFamily: "'JetBrains Mono','Fira Code',monospace", lineHeight: 1.75, outline: "none", resize: "vertical", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          )}
          {tab === "preview" && (
            <div style={{ minHeight: 420, padding: "14px 16px", borderRadius: 10, background: C.elevated, border: `1px solid ${C.border}` }}>
              {value.split("\n").map((line, i) => {
                if (line.startsWith("## ")) return <div key={i} style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "18px 0 8px" }}>{line.slice(3)}</div>;
                if (line.startsWith("# "))  return <div key={i} style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 14px" }}>{line.slice(2)}</div>;
                if (line.startsWith("- "))  return <div key={i} style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7, paddingLeft: 16, display: "flex", gap: 8 }}><span style={{ color: C.textMuted }}>•</span>{line.slice(2)}</div>;
                if (line === "") return <div key={i} style={{ height: 6 }} />;
                return <div key={i} style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>{line}</div>;
              })}
            </div>
          )}
          {tab === "history" && (
            <div style={{ minHeight: 200 }}>
              {[
                { ver: "v1.2", date: "Today 10:52 AM", by: "Joseph", note: "Added escalation rules for budget approvals" },
                { ver: "v1.1", date: "Feb 25, 2026",   by: "Joseph", note: "Defined collaboration rules between agents" },
                { ver: "v1.0", date: "Feb 20, 2026",   by: "System", note: "Initial protocol — auto-generated during setup" },
              ].map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: C.elevated, border: `1px solid ${C.border}`, color: C.textMuted, flexShrink: 0 }}>{h.ver}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{h.note}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{h.date} · by {h.by}</div>
                  </div>
                  <button style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, cursor: "pointer" }}>Restore</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick-add sections */}
      <SectionCard title="Quick-Add Protocol Rules" subtitle="Click to append common rules to the protocol" icon="⚡">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {quickRules.map(({ id, label, rule, custom }) => {
            const selected = selectedRuleIds.includes(id);
            return (
              <button key={id} onClick={() => appendRule(id, rule)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 8, border: `1px solid ${selected ? C.blue : C.border}`, background: selected ? C.blueGlow : C.elevated, cursor: "pointer", textAlign: "left", transition: "all .15s" }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueGlow; } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.elevated; } }}
                title={custom ? "Custom quick-add rule" : "Built-in quick-add rule"}
              >
                <span style={{ fontSize: 16, color: selected ? C.blue : C.textMuted }}>{selected ? "✓" : "+"}</span>
                <span style={{ fontSize: 12, color: C.textSec, fontWeight: 500 }}>{label}</span>
                {custom && <span style={{ marginLeft: "auto", fontSize: 10, color: C.textMuted }}>Custom</span>}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.textSec, fontWeight: 600, marginBottom: 8 }}>Create custom quick-add rule</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            <input
              value={newRuleLabel}
              onChange={e => setNewRuleLabel(e.target.value)}
              placeholder="Rule label (e.g. Refund handling SLA)"
              style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.elevated, color: C.text, fontSize: 12.5, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <textarea
              value={newRuleText}
              onChange={e => setNewRuleText(e.target.value)}
              placeholder="Rule text to append into protocol (markdown supported)"
              style={{ width: "100%", minHeight: 90, padding: "10px 11px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.elevated, color: C.text, fontSize: 12.5, lineHeight: 1.5, outline: "none", resize: "vertical", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={addCustomRule}
                disabled={!newRuleLabel.trim() || !newRuleText.trim()}
                style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${(!newRuleLabel.trim() || !newRuleText.trim()) ? C.border : C.blue + "55"}`, background: (!newRuleLabel.trim() || !newRuleText.trim()) ? C.elevated : C.blueGlow, color: (!newRuleLabel.trim() || !newRuleText.trim()) ? C.textMuted : C.blue, fontSize: 12, fontWeight: 600, cursor: (!newRuleLabel.trim() || !newRuleText.trim()) ? "not-allowed" : "pointer" }}
              >
                + Save custom rule
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Section: Knowledge Base ────────────────────────────────────────────────────
function KnowledgeSection({ value, onChange, structuredFields, onStructuredFieldChange }) {
  const [saved, setSaved] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const fields = [
    { id: "voice",   label: "Brand Voice & Tone",     placeholder: "e.g. Professional but warm. Speak directly, avoid jargon. Empower the reader." },
    { id: "audience",label: "Target Audience",        placeholder: "e.g. Small business owners aged 30–55 who want to automate their marketing..." },
    { id: "value",   label: "Value Proposition",      placeholder: "e.g. The only platform that lets you run an entire marketing team with AI..." },
    { id: "offer",   label: "Core Product / Offer",   placeholder: "e.g. Monthly subscription at $97/mo. Includes X, Y, Z features..." },
    { id: "comp",    label: "Key Competitors",        placeholder: "e.g. Jasper, HubSpot, Notion — we differ by..." },
    { id: "links",   label: "Important Links",        placeholder: "Website: https://...\nCMS: https://...\nAnalytics: https://..." },
  ];

  return (
    <div>
      <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>🧠</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Shared Knowledge Base</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Everything every agent needs to know about your company — injected as context on every task</div>
            </div>
          </div>
          <SaveBtn saved={saved} onClick={save} />
        </div>

        <div style={{ margin: "16px 22px 0", padding: "12px 16px", borderRadius: 10, background: C.blueGlow, border: `1px solid ${C.blue}30`, display: "flex", gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>
            The more detail you add here, the better your agents perform. Think of this as the company wiki — your brand voice, audience, pricing, competitors, and messaging all live here.
          </div>
        </div>

        {/* Structured fields */}
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            {fields.map(f => (
              <div key={f.id}>
                <Label>{f.label}</Label>
                <textarea
                  value={structuredFields[f.id] || ""}
                  onChange={(e) => onStructuredFieldChange(f.id, e.target.value)}
                  placeholder={f.placeholder}
                  onFocus={() => setActiveField(f.id)}
                  onBlur={() => setActiveField(null)}
                  style={{ width: "100%", minHeight: 88, padding: "10px 13px", borderRadius: 8, border: `1px solid ${activeField === f.id ? C.blue : C.border}`, background: C.elevated, color: C.text, fontSize: 12.5, fontFamily: "inherit", lineHeight: 1.6, outline: "none", resize: "vertical", boxSizing: "border-box", transition: "border-color .15s" }}
                />
              </div>
            ))}
          </div>

          {/* Raw editor toggle */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <Label>Full Knowledge Base (raw markdown)</Label>
            <textarea value={value} onChange={e => onChange(e.target.value)}
              style={{ width: "100%", minHeight: 300, padding: "14px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.elevated, color: C.text, fontSize: 12, fontFamily: "'JetBrains Mono','Fira Code',monospace", lineHeight: 1.75, outline: "none", resize: "vertical", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section: Memory ────────────────────────────────────────────────────────────
function MemorySection({ settings, onChange, onSave, saved }) {
  const toggle = (k) => onChange((s) => ({ ...s, [k]: !s[k] }));

  const MEMORY_TYPES = [
    { id: "episodic",   icon: "🗂️", title: "Episodic Memory",   desc: "Agents remember the sequence of tasks and interactions within a session. Resets between sessions unless summarised.", color: C.blue },
    { id: "semantic",   icon: "🧠", title: "Semantic Memory",    desc: "Long-term factual memory — company info, product specs, customer data — drawn from the Knowledge Base.", color: C.purple },
    { id: "procedural", icon: "⚙️", title: "Procedural Memory",  desc: "How agents remember to do things — workflows, approval chains, escalation paths — stored in the Shared Protocol.", color: C.teal },
    { id: "working",    icon: "⚡", title: "Working Memory",     desc: "The active context window for each task. Temporary and task-scoped. Includes the current conversation + injected context.", color: C.amber },
  ];

  const MEMORY_FLOW = [
    { label: "Task starts", icon: "▶️",  desc: "Agent receives task + injects Protocol + Knowledge Base" },
    { label: "Context built", icon: "📥", desc: "Working memory fills with relevant prior summaries" },
    { label: "Work happens",  icon: "⚙️", desc: "Agent reasons, calls tools, produces output" },
    { label: "Summary saved", icon: "💾", desc: "Key outcomes compressed into long-term memory store" },
    { label: "Report filed",  icon: "📤", desc: "Results logged to agent's activity feed for review" },
  ];

  return (
    <div>
      {/* How memory works */}
      <SectionCard title="How Agent Memory Works" subtitle="ClawForge uses four memory layers — here's what each one does" icon="🧠">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {MEMORY_TYPES.map(m => (
            <div key={m.id} style={{ padding: "16px", borderRadius: 10, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: m.color + "15", border: `1px solid ${m.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.title}</div>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Memory flow */}
      <SectionCard title="Memory Flow Per Task" subtitle="What happens in sequence each time an agent processes a task" icon="🔄">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
          {MEMORY_FLOW.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 130 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.elevated, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 10 }}>{step.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, textAlign: "center", marginBottom: 5 }}>{step.label}</div>
                <div style={{ fontSize: 10.5, color: C.textMuted, textAlign: "center", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
              {i < MEMORY_FLOW.length - 1 && <div style={{ width: 28, height: 1, background: C.border, flexShrink: 0, marginBottom: 34 }} />}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Memory settings */}
      <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚙️</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Memory Settings</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Control what gets remembered and shared across agents</div>
            </div>
          </div>
          <SaveBtn saved={saved} onClick={onSave} />
        </div>
        <div style={{ padding: "20px 22px" }}>
          {[
            { key: "perAgent",      label: "Per-Agent Memory",          desc: "Each agent maintains its own memory of past tasks and decisions", color: C.blue },
            { key: "crossAgent",    label: "Cross-Agent Memory Sharing", desc: "Agents can access each other's memory summaries (read-only)", color: C.purple },
            { key: "longTerm",      label: "Long-Term Memory Store",     desc: "Save compressed summaries across sessions to persistent storage", color: C.green },
            { key: "autoSummarize", label: "Auto-Summarize Sessions",    desc: "Automatically compress and store session highlights after each run", color: C.teal },
            { key: "userFacing",    label: "User-Facing Memory Log",     desc: "Show a readable memory log to the Orchestrator in Mission Control", color: C.amber },
          ].map(({ key, label, desc, color }, i, arr) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ flex: 1, marginRight: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{desc}</div>
              </div>
              <div onClick={() => toggle(key)} style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer", background: settings[key] ? color : C.elevated, border: `1px solid ${settings[key] ? color : C.border}`, position: "relative", flexShrink: 0, transition: "all .2s" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 1, left: settings[key] ? 19 : 1, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section: System Summary ────────────────────────────────────────────────────
function SummarySection({ data, progressPct, completedSteps, totalSteps }) {
  const caps = (data.capabilities || []).map(id => CAPABILITIES.find(c => c.id === id)).filter(Boolean);
  const goals = (data.goals || []).map(id => GOALS.find(g => g.id === id)).filter(Boolean);
  const allAgents = [...new Set(caps.flatMap(c => c.agents))];
  const complete = !!(data.companyName && (Array.isArray(data.industry) ? data.industry.length > 0 : !!data.industry) && data.capabilities?.length > 0);

  return (
    <div>
      {/* Status */}
      <div style={{ borderRadius: 14, padding: "22px 24px", marginBottom: 20, background: complete ? C.greenGlow : C.amberGlow, border: `1px solid ${complete ? C.green + "40" : C.amber + "40"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>{complete ? "✅" : "⏳"}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{complete ? "Setup Complete — Your workspace is ready" : "Almost there — a few things still needed"}</div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{complete ? "All agents are configured and ready to work for you" : "Complete the Discovery section to finalise setup"}</div>
          </div>
        </div>
        {!complete && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!data.companyName      && <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: C.elevated, border: `1px solid ${C.amber}40`, color: C.amber }}>⚠ Company name missing</div>}
            {!(Array.isArray(data.industry) ? data.industry.length > 0 : !!data.industry) && <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: C.elevated, border: `1px solid ${C.amber}40`, color: C.amber }}>⚠ Industry not selected</div>}
            {!data.capabilities?.length && <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: C.elevated, border: `1px solid ${C.amber}40`, color: C.amber }}>⚠ No capabilities selected</div>}
          </div>
        )}
      </div>

      <SectionCard title="Onboarding Progress" subtitle="Track completion before launch" icon="📶">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: progressPct === 100 ? C.green : C.blue }}>{progressPct}%</div>
          <div style={{ fontSize: 12, color: C.textSec }}>{completedSteps}/{totalSteps} setup milestones complete</div>
        </div>
        <div style={{ width: "100%", height: 8, borderRadius: 999, background: C.elevated, overflow: "hidden" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: progressPct === 100 ? C.green : C.blue, transition: "width .3s" }} />
        </div>
      </SectionCard>

      {/* Company card */}
      {data.companyName && (
        <SectionCard title={data.companyName} subtitle={data.description || "No description yet"} icon="🏢">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Industry",      value: (Array.isArray(data.industry) ? data.industry.join(", ") : data.industry) || "—" },
              { label: "Goals",         value: goals.length > 0 ? goals.map(g => g.icon).join(" ") + " " + goals.length + " goals" : "None set" },
              { label: "Capabilities",  value: caps.length > 0 ? caps.length + " selected" : "None selected" },
            ].map(r => (
              <div key={r.label} style={{ padding: "12px 14px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: .6, marginBottom: 6 }}>{r.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{r.value}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Active capabilities */}
      {caps.length > 0 && (
        <SectionCard title="Active Capabilities" subtitle="These are the functions your AI team will handle" icon="⚡">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {caps.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 99, background: c.color + "10", border: `1px solid ${c.color}30`, fontSize: 12, color: c.color, fontWeight: 600 }}>
                <span>{c.icon}</span><span>{c.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Agent roster */}
      {allAgents.length > 0 && (
        <SectionCard title="Configured Agent Team" subtitle={`${allAgents.length} agents will be active in your workspace`} icon="🤖">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {allAgents.map(a => {
              const agentColors = {
                "Operations CEO": C.blue, "Marketing CEO": C.purple, "Sales CEO": C.green,
                "Finance CEO": C.amber, "CX CEO": C.teal, "Security Sentinel": C.red,
                "Full-Stack Dev": "#60A5FA", "DevOps Engineer": C.orange, "QA Tester": "#FB923C",
                "Content Writer": C.pink, "SEO Specialist": "#A78BFA", "Community Mgr": "#34D399",
                "Onboarding Specialist": "#818CF8",
              };
              const col = agentColors[a] || C.blue;
              const init = a.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: 10, background: C.elevated, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: col + "20", border: `1px solid ${col}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: col, flexShrink: 0 }}>{init}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a}</div>
                    <div style={{ fontSize: 10, color: C.green, marginTop: 1 }}>● Active</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Launch button */}
      {complete && (
        <div style={{ padding: "28px 30px", borderRadius: 14, background: `linear-gradient(135deg, ${C.blueGlow}, ${C.purpleGlow})`, border: `1px solid ${C.blue}40`, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>🚀 Ready to launch your AI team?</div>
          <div style={{ fontSize: 13, color: C.textSec, marginBottom: 20 }}>Your workspace is configured. Head to the Overview to see your agents in action.</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button onClick={() => { window.location.hash = '/overview'; }} style={{ padding: "11px 28px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Go to Overview →</button>
            <button onClick={() => { window.location.hash = '/army'; }} style={{ padding: "11px 22px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 13, cursor: "pointer" }}>View Agent Army</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function StartHere() {
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  C = getTheme(themeMode);

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

  const persisted = typeof window !== "undefined" ? readPersistedStartHere() : null;

  const [activeTab, setActiveTab] = useState(persisted?.activeTab || "discovery");

  const [discovery, setDiscovery] = useState(persisted?.discovery || {
    companyName: "", founderName: "", industry: [], description: "", goals: [], capabilities: [],
  });
  const [protocol, setProtocol] = useState(persisted?.protocol || DEFAULT_PROTOCOL);
  const [knowledge, setKnowledge] = useState(persisted?.knowledge || DEFAULT_KNOWLEDGE);
  const [knowledgeFields, setKnowledgeFields] = useState(persisted?.knowledgeFields || {
    voice: "", audience: "", value: "", offer: "", comp: "", links: "",
  });
  const [memorySettings, setMemorySettings] = useState(persisted?.memorySettings || DEFAULT_MEMORY_SETTINGS);
  const [savedAll, setSavedAll] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(persisted?.lastSavedAt || null);

  const updateDiscovery = (key, val) => setDiscovery((d) => ({ ...d, [key]: val }));
  const updateKnowledgeField = (key, val) => setKnowledgeFields((prev) => ({ ...prev, [key]: val }));

  const TABS = [
    { id: "discovery", icon: "🏢", label: "Your Business" },
    { id: "protocol", icon: "📜", label: "Shared Protocol" },
    { id: "knowledge", icon: "🧠", label: "Knowledge Base" },
    { id: "memory", icon: "💾", label: "Memory & Learning" },
    { id: "summary", icon: "✅", label: "Summary & Launch" },
  ];

  const setupChecks = {
    company: discovery.companyName?.trim().length > 0,
    industry: (Array.isArray(discovery.industry) ? discovery.industry.length > 0 : !!discovery.industry),
    capabilities: discovery.capabilities?.length > 0,
    goals: discovery.goals?.length > 0,
    protocol: protocol !== DEFAULT_PROTOCOL,
    knowledge: knowledge !== DEFAULT_KNOWLEDGE || Object.values(knowledgeFields).some((v) => (v || "").trim().length > 0),
    memory: Object.keys(DEFAULT_MEMORY_SETTINGS).some((k) => memorySettings[k] !== DEFAULT_MEMORY_SETTINGS[k]),
  };

  const tabCompletion = {
    discovery: setupChecks.company && setupChecks.industry && setupChecks.capabilities && setupChecks.goals,
    protocol: setupChecks.protocol,
    knowledge: setupChecks.knowledge,
    memory: setupChecks.memory,
    summary: setupChecks.company && setupChecks.industry && setupChecks.capabilities,
  };

  const completedSteps = Object.values(tabCompletion).filter(Boolean).length;
  const totalSteps = Object.keys(tabCompletion).length;
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  useEffect(() => {
    const payload = {
      activeTab,
      discovery,
      protocol,
      knowledge,
      knowledgeFields,
      memorySettings,
      lastSavedAt,
    };
    localStorage.setItem(START_HERE_STORAGE_KEY, JSON.stringify(payload));
  }, [activeTab, discovery, protocol, knowledge, knowledgeFields, memorySettings, lastSavedAt]);

  const saveAll = () => {
    const now = new Date().toISOString();
    setLastSavedAt(now);
    setSavedAll(true);
    setTimeout(() => setSavedAll(false), 2200);
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, fontFamily: "'DM Sans','Segoe UI',-apple-system,sans-serif", overflow: "hidden", color: C.text }}>
      <Sidebar />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚀</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>Start Here</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Configure your ClawForge workspace</div>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 11, color: C.textMuted }}>Setup {progressPct}% complete</div>
            <div style={{ width: 140, height: 6, borderRadius: 99, background: C.elevated, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: progressPct === 100 ? C.green : C.blue, width: `${progressPct}%`, transition: "width .4s" }} />
            </div>
            <div style={{ fontSize: 11, color: savedAll ? C.green : C.textMuted }}>
              {savedAll ? "Saved" : lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Not saved yet"}
            </div>
          </div>
          <button onClick={saveAll} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: savedAll ? C.green : C.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {savedAll ? "✓ Saved" : "Save All"}
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Step sidebar */}
          <div style={{ width: 220, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, padding: "20px 12px", overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, paddingLeft: 4 }}>Setup Steps</div>
            {TABS.map(t => (
              <SectionTab
                key={t.id}
                id={t.id}
                icon={t.icon}
                label={t.label}
                active={activeTab === t.id}
                done={!!tabCompletion[t.id]}
                onClick={setActiveTab}
              />
            ))}

            {/* Tip box */}
            <div style={{ marginTop: 20, padding: "14px", borderRadius: 10, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, marginBottom: 6 }}>💡 Tip</div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
                You can always come back and update these settings. Your agents will pick up changes automatically on their next run.
              </div>
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            <div style={{ maxWidth: 860, margin: "0 auto" }}>
              {activeTab === "discovery" && <DiscoverySection data={discovery} onChange={updateDiscovery} />}
              {activeTab === "protocol" && <ProtocolSection value={protocol} onChange={setProtocol} />}
              {activeTab === "knowledge" && (
                <KnowledgeSection
                  value={knowledge}
                  onChange={setKnowledge}
                  structuredFields={knowledgeFields}
                  onStructuredFieldChange={updateKnowledgeField}
                />
              )}
              {activeTab === "memory" && (
                <MemorySection
                  settings={memorySettings}
                  onChange={setMemorySettings}
                  onSave={saveAll}
                  saved={savedAll}
                />
              )}
              {activeTab === "summary" && (
                <SummarySection
                  data={discovery}
                  progressPct={progressPct}
                  completedSteps={completedSteps}
                  totalSteps={totalSteps}
                />
              )}

              {/* Next button */}
              {activeTab !== "summary" && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, paddingBottom: 40 }}>
                  <button onClick={() => {
                    const idx = TABS.findIndex(t => t.id === activeTab);
                    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
                  }} style={{ padding: "11px 28px", borderRadius: 9, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    Next: {TABS[TABS.findIndex(t => t.id === activeTab) + 1]?.label} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
