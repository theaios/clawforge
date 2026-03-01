import {useState, useEffect} from "react";
import { getStoredThemeMode } from "../lib/themeMode";
import { buildMainMenuSections } from "../lib/systemNav";

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


const CATEGORIES = ["All", "Agent Roles", "Boards", "Campaigns", "Workflows", "Guardrails"];

const TEMPLATES = [
  // Agent Roles
  { id: "t1", name: "Operations CEO", cat: "Agent Roles", icon: "🏗️", color: C.blue, popularity: 94, description: "Full-stack operations manager that handles infrastructure, deployments, task delegation, and system health monitoring.", includes: ["System prompt", "12 tool integrations", "Model routing (Sonnet primary)", "6 guardrails"], usedBy: 48, tier: "core" },
  { id: "t2", name: "Marketing CEO", cat: "Agent Roles", icon: "📣", color: C.purple, popularity: 89, description: "Manages ad campaigns across Google, Meta, and LinkedIn. Tracks ROAS, optimizes budgets, and generates content briefs.", includes: ["System prompt", "8 tool integrations", "Model routing (GPT-4o primary)", "5 guardrails"], usedBy: 42, tier: "core" },
  { id: "t3", name: "Sales CEO", cat: "Agent Roles", icon: "💼", color: C.green, popularity: 91, description: "Handles lead qualification, proposal generation, follow-ups, and CRM management. Integrates with email and calendar.", includes: ["System prompt", "7 tool integrations", "Model routing (Sonnet primary)", "4 guardrails"], usedBy: 45, tier: "core" },
  { id: "t4", name: "Finance CEO", cat: "Agent Roles", icon: "💰", color: C.amber, popularity: 78, description: "Manages invoicing, P&L reports, expense tracking, and financial approvals via Stripe and QuickBooks.", includes: ["System prompt", "5 tool integrations", "Model routing (Gemini Pro primary)", "6 guardrails (elevated)"], usedBy: 36, tier: "core" },
  { id: "t5", name: "Security Sentinel", cat: "Agent Roles", icon: "🛡️", color: C.red, popularity: 82, description: "Continuous security monitoring — vulnerability scans, threat detection, WAF management, and audit logging.", includes: ["System prompt", "6 tool integrations", "Model routing (Opus primary)", "8 guardrails (critical)"], usedBy: 38, tier: "core" },
  { id: "t6", name: "CX CEO", cat: "Agent Roles", icon: "🤝", color: C.teal, popularity: 86, description: "Customer support leader handling tickets, onboarding, satisfaction tracking, and escalation management.", includes: ["System prompt", "6 tool integrations", "Model routing (GPT-4o primary)", "5 guardrails"], usedBy: 40, tier: "core" },
  { id: "t7", name: "Content Writer", cat: "Agent Roles", icon: "✍️", color: C.pink, popularity: 88, description: "Creates blog posts, social media content, email sequences, and website copy. SEO-aware with brand voice training.", includes: ["System prompt", "4 tool integrations", "Model routing (Sonnet primary)", "3 guardrails"], usedBy: 44, tier: "core" },
  { id: "t8", name: "DevOps Engineer", cat: "Agent Roles", icon: "⚙️", color: C.orange, popularity: 72, description: "Manages CI/CD pipelines, Terraform infrastructure, Docker containers, and deployment automation.", includes: ["System prompt", "8 tool integrations", "Model routing (Sonnet primary)", "7 guardrails (admin)"], usedBy: 32, tier: "core" },

  // Boards
  { id: "t9", name: "Launch Sprint Board", cat: "Boards", icon: "🚀", color: C.blue, popularity: 90, description: "Pre-configured Kanban board for product launches with columns: Backlog → Ready → In Progress → Review → Done. Includes WIP limits and SLA timers.", includes: ["5 columns with WIP limits", "SLA countdown timers", "Department swimlanes", "Priority badges (P0–P3)"], usedBy: 52, tier: "starter" },
  { id: "t10", name: "Client Onboarding Board", cat: "Boards", icon: "👋", color: C.green, popularity: 76, description: "Track new client setup from signed contract through fully operational agent deployment.", includes: ["7 columns (Signed → Live)", "Checklist templates per stage", "Due date automation", "Client-facing status updates"], usedBy: 28, tier: "starter" },
  { id: "t11", name: "Bug Triage Board", cat: "Boards", icon: "🐛", color: C.red, popularity: 68, description: "Rapid bug categorization and fix tracking with severity-based prioritization and auto-assignment.", includes: ["4 columns (Reported → Verified → Fixed → Released)", "Severity auto-tagging", "Browser/OS labels", "QA Tester auto-assign"], usedBy: 22, tier: "starter" },

  // Campaigns
  { id: "t12", name: "SMB Lead Gen — Google Ads", cat: "Campaigns", icon: "🔍", color: C.blue, popularity: 85, description: "Ready-to-launch Google Ads campaign targeting small businesses searching for AI automation, virtual assistants, and business process automation.", includes: ["10 keyword groups", "3 ad variations per group", "Landing page suggestions", "Budget recommendations"], usedBy: 34, tier: "executive" },
  { id: "t13", name: "Retargeting — Meta Ads", cat: "Campaigns", icon: "📘", color: C.purple, popularity: 79, description: "Facebook/Instagram retargeting funnel for website visitors who didn't convert. Includes lookalike audience setup.", includes: ["Pixel event triggers", "3 audience segments", "A/B creative sets", "7-day attribution window"], usedBy: 30, tier: "executive" },
  { id: "t14", name: "Email Nurture — 5 Part Drip", cat: "Campaigns", icon: "✉️", color: C.teal, popularity: 82, description: "Automated email sequence for new leads: introduction, value proposition, case study, FAQ objection handling, and call-to-action.", includes: ["5 email templates", "Wait-time logic (2-3 day intervals)", "A/B subject lines", "Open/click tracking"], usedBy: 38, tier: "starter" },

  // Workflows
  { id: "t15", name: "New Lead Qualification", cat: "Workflows", icon: "🔄", color: C.green, popularity: 88, description: "Automated workflow: New lead arrives → Sales CEO qualifies → Creates CRM deal → Schedules discovery call → Sends intro email.", includes: ["5-step automation", "Lead scoring rules", "CRM integration", "Email templates"], usedBy: 46, tier: "starter" },
  { id: "t16", name: "Incident Response", cat: "Workflows", icon: "🚨", color: C.red, popularity: 74, description: "Security incident workflow: Threat detected → Sentinel investigates → Blocks threat → Notifies Orchestrator → Logs audit trail.", includes: ["4-step automation", "Severity escalation rules", "Auto-block triggers", "Slack notification"], usedBy: 26, tier: "core" },
  { id: "t17", name: "Content Publishing Pipeline", cat: "Workflows", icon: "📝", color: C.pink, popularity: 80, description: "Content Writer drafts → SEO Specialist optimizes → Marketing CEO reviews → Auto-publish to CMS and schedule social posts.", includes: ["4-step pipeline", "SEO checklist", "Approval gate", "Multi-channel publish"], usedBy: 32, tier: "starter" },

  // Guardrails
  { id: "t18", name: "Financial Safety Pack", cat: "Guardrails", icon: "🔒", color: C.amber, popularity: 92, description: "Pre-configured guardrails for agents handling financial transactions: spending limits, approval thresholds, PII blocking, and audit trails.", includes: ["$50 approval threshold", "Daily spend cap ($100)", "PII output blocking (critical)", "Full action audit trail"], usedBy: 50, tier: "core" },
  { id: "t19", name: "Customer-Facing Safety Pack", cat: "Guardrails", icon: "🛡️", color: C.teal, popularity: 86, description: "Guardrails for agents that interact with customers: prompt injection defense, tone checking, escalation triggers, and response approval.", includes: ["Prompt injection defense (critical)", "Tone & sentiment checking", "Auto-escalation on negative sentiment", "Human-in-the-loop for first 50 messages"], usedBy: 42, tier: "starter" },
];

const TIER_STYLES = {
  core: { bg: C.blueGlow, color: C.blue, border: `${C.blue}33`, label: "Core Setup" },
  executive: { bg: C.purpleGlow, color: C.purple, border: `${C.purple}33`, label: "Executive Build" },
  starter: { bg: C.greenGlow, color: C.green, border: `${C.green}33`, label: "All Plans" },
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
  const NAV = buildMainMenuSections();
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


function PreviewDrawer({ template, onClose }) {
  if (!template) return null;
  const tier = TIER_STYLES[template.tier];
  return (
    <div style={{ width: 380, flexShrink: 0, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${template.color}22, ${template.color}44)`,
            border: `1px solid ${template.color}33`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>{template.icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{template.name}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{template.cat}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {/* Tags */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>{tier.label}</span>
          <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: C.elevated, color: C.textSec, border: `1px solid ${C.border}` }}>Used by {template.usedBy} clients</span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 12, color: C.textSec, lineHeight: "19px", marginBottom: 18 }}>{template.description}</div>

        {/* Popularity */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>Popularity</span>
            <span style={{ fontSize: 10, color: template.popularity >= 85 ? C.green : C.amber, fontWeight: 700 }}>{template.popularity}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: C.elevated }}>
            <div style={{ width: `${template.popularity}%`, height: "100%", borderRadius: 3, background: template.popularity >= 85 ? C.green : C.amber }} />
          </div>
        </div>

        {/* Includes */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>What's Included</div>
          {template.includes.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < template.includes.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 10, color: C.green }}>✓</span>
              <span style={{ fontSize: 11, color: C.textSec }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Preview mock */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Preview</div>
          <div style={{
            height: 120, borderRadius: 10, border: `1px solid ${C.border}`,
            background: `linear-gradient(135deg, ${C.bg}, ${template.color}08)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ position: "absolute", left: `${(i * 14) + 2}%`, top: "10%", width: 40, height: `${50 + Math.random() * 40}%`, background: template.color, borderRadius: 4 }} />
              ))}
            </div>
            <div style={{ textAlign: "center", zIndex: 1 }}>
              <span style={{ fontSize: 32 }}>{template.icon}</span>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Click "Use Template" to customize</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <button disabled title="Prototype control — not wired yet" style={{ flex: 1, padding: "10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>👁 Full Preview</button>
        <button disabled title="Prototype control — not wired yet" style={{
          flex: 2, padding: "10px", borderRadius: 6, border: "none",
          background: `linear-gradient(135deg, ${template.color}, ${template.color}CC)`,
          color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 4px 16px ${template.color}33`,
        }}>🚀 Use Template</button>
      </div>
    </div>
  );
}

export default function TemplatesLibrary() {
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState(null);
  const [sort, setSort] = useState("popular");

  let filtered = cat === "All" ? TEMPLATES : TEMPLATES.filter(t => t.cat === cat);
  if (sort === "popular") filtered = [...filtered].sort((a, b) => b.popularity - a.popularity);
  else if (sort === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "used") filtered = [...filtered].sort((a, b) => b.usedBy - a.usedBy);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="templates" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>System</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Templates</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search templates...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.textSec }}>{TEMPLATES.length} templates</span>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Templates Library</h2>
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Pre-built configurations to deploy agents, boards, and workflows in minutes</p>
              </div>
              <button disabled title="Prototype control — not wired yet" style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>+ Submit Template</button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCat(c)} style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${cat === c ? C.blue : C.border}`,
                    background: cat === c ? C.blueGlow : "transparent",
                    color: cat === c ? C.blue : C.textMuted,
                  }}>{c}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[{ k: "popular", l: "Popular" }, { k: "used", l: "Most Used" }, { k: "name", l: "A–Z" }].map(s => (
                  <button key={s.k} onClick={() => setSort(s.k)} style={{
                    padding: "4px 8px", borderRadius: 4, fontSize: 9, cursor: "pointer", border: "none",
                    background: sort === s.k ? C.elevated : "transparent",
                    color: sort === s.k ? C.text : C.textMuted, fontWeight: 500,
                  }}>{s.l}</button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {filtered.map(t => {
                const tier = TIER_STYLES[t.tier];
                const isSel = selected?.id === t.id;
                return (
                  <div key={t.id} onClick={() => setSelected(t)} style={{
                    padding: "16px", borderRadius: 10, cursor: "pointer",
                    background: isSel ? C.blueGlow : C.surface,
                    border: `1px solid ${isSel ? C.blue : C.border}`,
                    transition: "all 0.15s ease",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: `linear-gradient(135deg, ${t.color}22, ${t.color}44)`,
                        border: `1px solid ${t.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      }}>{t.icon}</div>
                      <span style={{ fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>{tier.label}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: C.textSec, lineHeight: "15px", marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.description}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.elevated }}>
                          <div style={{ width: `${t.popularity}%`, height: "100%", borderRadius: 2, background: t.popularity >= 85 ? C.green : C.amber }} />
                        </div>
                        <span style={{ fontSize: 9, color: C.textMuted }}>{t.popularity}%</span>
                      </div>
                      <span style={{ fontSize: 9, color: C.textMuted }}>{t.usedBy} users</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview drawer */}
          {selected && <PreviewDrawer template={selected} onClose={() => setSelected(null)} />}
        </div>
      </div>
    </div>
  );
}
