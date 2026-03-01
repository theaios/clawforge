import {useState, useEffect} from "react";
import { useMissionControl } from "../lib/missionControlContext";
import { formatOpError, formatOpSuccess } from "../lib/openclawDiagnostics";
import orchestratorMd from "../data/base-package/orchestrator.md?raw";
import ceoMd from "../data/base-package/agent-ceo.md?raw";
import cooMd from "../data/base-package/agent-coo.md?raw";
import ctoMd from "../data/base-package/agent-cto.md?raw";

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
    bg: "#F4F5F8", surface: "#FFFFFF", elevated: "#EEF1F6",
    border: "#C9D0DB", borderLight: "#DCE2EC",
    text: "#111827", textSec: "#374151", textMuted: "#4B5563",
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


const STEPS = [
  { key: "identity", label: "Identity", icon: "👤" },
  { key: "scope", label: "Scope", icon: "📋" },
  { key: "tools", label: "Tools", icon: "🔧" },
  { key: "model", label: "Model Routing", icon: "🧠" },
  { key: "guardrails", label: "Guardrails", icon: "🛡️" },
  { key: "limits", label: "Limits", icon: "⚡" },
];

const AVAILABLE_TOOLS = [
  { id: "stripe", name: "Stripe API", desc: "Payment processing, refunds, subscriptions", category: "Finance", risk: "high" },
  { id: "gmail", name: "Gmail API", desc: "Send/read emails on behalf of the business", category: "Communication", risk: "medium" },
  { id: "slack", name: "Slack API", desc: "Post messages, manage channels", category: "Communication", risk: "low" },
  { id: "discord", name: "Discord API", desc: "Community management, notifications", category: "Communication", risk: "low" },
  { id: "telegram", name: "Telegram Bot", desc: "Customer messaging, alerts", category: "Communication", risk: "low" },
  { id: "aws", name: "AWS SDK", desc: "EC2, S3, CloudWatch, IAM management", category: "Infrastructure", risk: "high" },
  { id: "docker", name: "Docker API", desc: "Container management, deployments", category: "Infrastructure", risk: "high" },
  { id: "github", name: "GitHub API", desc: "Code repos, PRs, issues, CI/CD", category: "Development", risk: "medium" },
  { id: "ga4", name: "Google Analytics 4", desc: "Traffic, conversion, audience data", category: "Analytics", risk: "low" },
  { id: "meta", name: "Meta Ads API", desc: "Ad campaigns, budgets, targeting", category: "Marketing", risk: "medium" },
  { id: "google_ads", name: "Google Ads API", desc: "Search/display campaigns", category: "Marketing", risk: "medium" },
  { id: "hubspot", name: "HubSpot CRM", desc: "Contacts, deals, pipeline management", category: "Sales", risk: "low" },
  { id: "gdocs", name: "Google Docs", desc: "Create, edit, share documents", category: "Productivity", risk: "low" },
  { id: "calendar", name: "Google Calendar", desc: "Schedule meetings, availability", category: "Productivity", risk: "low" },
  { id: "waf", name: "AWS WAF", desc: "Firewall rules, IP blocking", category: "Security", risk: "high" },
  { id: "cloudwatch", name: "CloudWatch", desc: "Monitoring, alerts, logs", category: "Infrastructure", risk: "low" },
];

const MODEL_ROUTES = [
  { taskType: "Complex reasoning", model: "Claude Opus", costPer1k: "$0.075", latency: "~8s", quality: 98 },
  { taskType: "General tasks", model: "Claude Sonnet", costPer1k: "$0.015", latency: "~3s", quality: 92 },
  { taskType: "Quick classification", model: "Claude Haiku", costPer1k: "$0.001", latency: "~0.8s", quality: 84 },
  { taskType: "Content generation", model: "GPT-4o", costPer1k: "$0.025", latency: "~4s", quality: 90 },
  { taskType: "Data extraction", model: "Gemini Pro", costPer1k: "$0.007", latency: "~2s", quality: 87 },
  { taskType: "Code generation", model: "Claude Sonnet", costPer1k: "$0.015", latency: "~3s", quality: 94 },
];

const TASK_TYPE_OPTIONS = [
  "Complex reasoning",
  "General tasks",
  "Quick classification",
  "Content generation",
  "Data extraction",
  "Code generation",
  "Customer support",
  "Approvals",
  "Research",
];

const MODEL_OPTIONS = {
  "Claude Opus": { costPer1k: "$0.075", latency: "~8s", quality: 98 },
  "Claude Sonnet": { costPer1k: "$0.015", latency: "~3s", quality: 92 },
  "Claude Haiku": { costPer1k: "$0.001", latency: "~0.8s", quality: 84 },
  "GPT-4o": { costPer1k: "$0.025", latency: "~4s", quality: 90 },
  "Gemini Pro": { costPer1k: "$0.007", latency: "~2s", quality: 87 },
  "Mistral Large": { costPer1k: "$0.012", latency: "~2.5s", quality: 88 },
};

const ROLE_TEMPLATES = {
  custom: {
    key: "custom",
    name: "Custom",
    identity: {
      name: "Partnership Scout",
      roleTitle: "Partnerships & Affiliate Manager",
      reportsTo: "Sales CEO",
      avatarColor: "#06B6D4",
      systemPrompt: "You are the Partnership Scout for ClawForge.",
    },
  },
  orchestrator: {
    key: "orchestrator",
    name: "Orchestrator",
    identity: {
      name: "Orchestrator",
      roleTitle: "Autonomous Company Orchestrator",
      reportsTo: "Orchestrator (Direct)",
      avatarColor: "#EA580C",
      systemPrompt: orchestratorMd,
    },
  },
  ceo: {
    key: "ceo",
    name: "Agent CEO",
    identity: {
      name: "Agent CEO",
      roleTitle: "CEO / Visionary & Sales Lead",
      reportsTo: "Orchestrator (Direct)",
      avatarColor: "#7C3AED",
      systemPrompt: ceoMd,
    },
  },
  coo: {
    key: "coo",
    name: "Agent COO",
    identity: {
      name: "Agent COO",
      roleTitle: "COO / Operations & Client Success",
      reportsTo: "Orchestrator (Direct)",
      avatarColor: "#16A34A",
      systemPrompt: cooMd,
    },
  },
  cto: {
    key: "cto",
    name: "Agent CTO",
    roleTitle: "CTO / Builder & Systems Architect",
    identity: {
      name: "Agent CTO",
      roleTitle: "CTO / Builder & Systems Architect",
      reportsTo: "Orchestrator (Direct)",
      avatarColor: "#2563EB",
      systemPrompt: ctoMd,
    },
  },
};

const GUARDRAIL_PRESETS = [
  { id: "no_pii", label: "Block PII in outputs", desc: "Prevent agent from including personal data in external comms", enabled: true, severity: "critical" },
  { id: "spend_limit", label: "Spending approval gate", desc: "Require human approval for any action costing >$50", enabled: true, severity: "high" },
  { id: "no_delete", label: "No destructive actions", desc: "Prevent deletion of data, files, or configurations", enabled: true, severity: "critical" },
  { id: "rate_limit", label: "API rate limiting", desc: "Max 100 API calls per minute to external services", enabled: true, severity: "medium" },
  { id: "injection", label: "Prompt injection defense", desc: "Scan all inputs for injection attempts before processing", enabled: true, severity: "critical" },
  { id: "audit", label: "Full action audit trail", desc: "Log every action with timestamp, input, output, and cost", enabled: true, severity: "high" },
  { id: "human_loop", label: "Human-in-the-loop for external comms", desc: "Require approval before sending emails, DMs, or public posts", enabled: false, severity: "medium" },
  { id: "sandbox", label: "Sandbox mode available", desc: "Can be toggled to test agent behavior without live effects", enabled: false, severity: "low" },
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

function Sidebar({ activePage, isDark, setIsDark, C, collapsedSections, onToggleSection }) {
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
        {NAV.map((s, si) => {
          const collapsed = !!collapsedSections[s.section];
          return (
            <div key={si} style={{ marginBottom: 4 }}>
              <button
                onClick={() => onToggleSection(s.section)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.textMuted,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  padding: "12px 10px 6px",
                }}
              >
                <span>{s.section}</span>
                <span style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: 5,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${C.border}`,
                  background: C.elevated,
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: C.textSec,
                }}>{collapsed ? "+" : "−"}</span>
              </button>
              {!collapsed && s.items.map((item, ii) => {
                const active = item.key === activePage;
                const m = { 'start-here': '/start-here',  chat: '/chat', brainstorm: '/brainstorm', brainstorming: '/brainstorm', tasks: '/boards', agentarmy: '/army', configurator: '/configurator?step=1', security: '/security', integrations: '/integrations', costusage: '/costs', settings: '/settings', development: '/development', approvals: '/approvals', files: '/files' };
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
          );
        })}
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


function StepIdentity({ identity, onChange, selectedTemplate, onTemplateChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>Role Template</label>
        <select value={selectedTemplate} onChange={(e) => onTemplateChange(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none" }}>
          <option value="custom">Custom</option>
          <option value="orchestrator">Orchestrator</option>
          <option value="ceo">Agent CEO</option>
          <option value="coo">Agent COO</option>
          <option value="cto">Agent CTO</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>Agent Name</label>
          <input value={identity.name || ''} onChange={(e) => onChange({ name: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>Role Title</label>
          <input value={identity.roleTitle || ''} onChange={(e) => onChange({ roleTitle: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>System Prompt / Persona</label>
        <textarea value={identity.systemPrompt || ''} onChange={(e) => onChange({ systemPrompt: e.target.value })} rows={8} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, outline: "none", resize: "vertical", lineHeight: "18px", fontFamily: "'JetBrains Mono', 'SF Mono', monospace", boxSizing: "border-box" }} />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>Reports To</label>
          <select value={identity.reportsTo || 'Sales CEO'} onChange={(e) => onChange({ reportsTo: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none" }}>
            <option>Sales CEO</option>
            <option>Marketing CEO</option>
            <option>Operations CEO</option>
            <option>Orchestrator (Direct)</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>Avatar Color</label>
          <div style={{ display: "flex", gap: 8, padding: "8px 0" }}>
            {[C.blue, C.purple, C.green, C.amber, C.red, C.teal, C.orange, C.pink].map((color, i) => (
              <div key={i} onClick={() => onChange({ avatarColor: color })} style={{
                width: 28, height: 28, borderRadius: "50%", background: color, cursor: "pointer",
                border: identity.avatarColor === color ? `2px solid #fff` : `2px solid transparent`,
                boxShadow: identity.avatarColor === color ? `0 0 8px ${color}66` : "none",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_SCOPE_OPTIONS = [
  { label: "Read CRM data", desc: "Access contacts, deals, and pipeline", enabled: true },
  { label: "Write CRM data", desc: "Create/update contacts and deals", enabled: true },
  { label: "Send outbound emails", desc: "Draft and send partnership emails", enabled: true },
  { label: "Access financial data", desc: "View billing and revenue data", enabled: false },
  { label: "Modify infrastructure", desc: "Change server or deploy configs", enabled: false },
  { label: "Post on social media", desc: "Publish to company social accounts", enabled: false },
  { label: "Schedule meetings", desc: "Book via Google Calendar", enabled: true },
  { label: "Access customer data", desc: "View customer records and history", enabled: false },
];

function StepScope({ scopes, onToggleScope }) {

  return (
    <div>
      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 16, lineHeight: "18px" }}>Define what this agent can and cannot do. Scopes control data access and action permissions.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {scopes.map((s, i) => (
          <div
            key={i}
            onClick={() => onToggleScope(i)}
            style={{
              padding: "12px 14px", borderRadius: 8,
              background: s.enabled ? C.blueGlow : C.elevated,
              border: `1px solid ${s.enabled ? "rgba(59,130,246,0.3)" : C.border}`,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: s.enabled ? C.text : C.textSec }}>{s.label}</span>
              <div style={{
                width: 36, height: 20, borderRadius: 10, padding: 2,
                background: s.enabled ? C.blue : C.border, transition: "background 0.2s",
                display: "flex", alignItems: "center",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transform: s.enabled ? "translateX(16px)" : "translateX(0)", transition: "transform 0.2s",
                }} />
              </div>
            </div>
            <span style={{ fontSize: 10, color: C.textMuted }}>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepTools({ selected, onChangeSelected }) {
  const categories = [...new Set(AVAILABLE_TOOLS.map(t => t.category))];
  const riskColors = { low: C.green, medium: C.amber, high: C.red };

  return (
    <div>
      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 12, lineHeight: "18px" }}>Select which integrations and APIs this agent can access. High-risk tools require additional approval gates.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: C.textMuted, alignSelf: "center", marginRight: 4 }}>Selected:</span>
        {selected.map(id => {
          const tool = AVAILABLE_TOOLS.find(t => t.id === id);
          return (
            <span key={id} style={{ fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 5, background: C.blueGlow, color: C.blue, border: `1px solid rgba(59,130,246,0.3)`, display: "flex", alignItems: "center", gap: 4 }}>
              {tool.name}
              <span style={{ cursor: "pointer", fontSize: 8 }} onClick={() => onChangeSelected(selected.filter(s => s !== id))}>✕</span>
            </span>
          );
        })}
      </div>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{cat}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {AVAILABLE_TOOLS.filter(t => t.category === cat).map(tool => {
              const isSel = selected.includes(tool.id);
              return (
                <div key={tool.id} onClick={() => isSel ? onChangeSelected(selected.filter(s => s !== tool.id)) : onChangeSelected([...selected, tool.id])} style={{
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  background: isSel ? C.blueGlow : C.elevated,
                  border: `1px solid ${isSel ? "rgba(59,130,246,0.3)" : C.border}`,
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isSel ? C.text : C.textSec }}>{tool.name}</span>
                    <span style={{ fontSize: 8, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: `${riskColors[tool.risk]}18`, color: riskColors[tool.risk] }}>{tool.risk.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{tool.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepModelRouting({ routes, onChangeRoutes }) {
  const deleteRoute = (index) => {
    onChangeRoutes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRouteTaskType = (index, taskType) => {
    onChangeRoutes((prev) => prev.map((route, i) => (i === index ? { ...route, taskType } : route)));
  };

  const updateRouteModel = (index, model) => {
    const stats = MODEL_OPTIONS[model] || { costPer1k: "$0.010", latency: "~1.5s", quality: 85 };
    onChangeRoutes((prev) => prev.map((route, i) => (i === index ? { ...route, model, ...stats } : route)));
  };

  const addRoute = () => {
    const model = "Claude Sonnet";
    onChangeRoutes((prev) => ([
      ...prev,
      {
        taskType: "General tasks",
        model,
        ...MODEL_OPTIONS[model],
      },
    ]));
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 16, lineHeight: "18px" }}>Route different task types to optimal models based on cost, latency, and quality requirements. Select ticket type and assign the model you want for that work.</p>
      <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.2fr 0.8fr 0.7fr 1fr auto", background: C.elevated, padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
          {["Task Type", "Model", "Cost/1K tok", "Latency", "Quality", ""].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
          ))}
        </div>
        {routes.map((route, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.2fr 0.8fr 0.7fr 1fr auto", padding: "10px 14px", borderBottom: i < routes.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "transparent" : `${C.elevated}44`, alignItems: "center", gap: 8 }}>
            <select value={route.taskType} onChange={(e) => updateRouteTaskType(i, e.target.value)} style={{ fontSize: 12, color: C.text, fontWeight: 500, border: `1px solid ${C.border}`, background: C.bg, borderRadius: 6, padding: "6px 8px", outline: "none" }}>
              {TASK_TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={route.model} onChange={(e) => updateRouteModel(i, e.target.value)} style={{ fontSize: 11, color: C.textSec, border: `1px solid ${C.border}`, background: C.bg, borderRadius: 6, padding: "6px 8px", outline: "none" }}>
              {Object.keys(MODEL_OPTIONS).map((model) => <option key={model} value={model}>{model}</option>)}
            </select>
            <span style={{ fontSize: 11, color: C.textSec, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{route.costPer1k}</span>
            <span style={{ fontSize: 11, color: C.textSec }}>{route.latency}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${route.quality}%`, background: route.quality >= 95 ? C.green : route.quality >= 90 ? C.blue : C.amber, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", minWidth: 24 }}>{route.quality}%</span>
            </div>
            <button
              onClick={() => deleteRoute(i)}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: `1px solid ${C.red}33`,
                background: `${C.red}12`,
                color: C.red,
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <button onClick={addRoute} style={{ marginTop: 12, padding: "7px 14px", borderRadius: 6, border: `1px dashed ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer", width: "100%" }}>+ Add routing rule</button>
    </div>
  );
}

function StepGuardrails() {
  const [guardrails, setGuardrails] = useState(GUARDRAIL_PRESETS);
  const severityColors = { critical: C.red, high: C.amber, medium: C.blue, low: C.textMuted };

  const toggleGuardrail = (index) => {
    setGuardrails((prev) => prev.map((g, i) => {
      if (i !== index) return g;
      if (g.severity === 'critical') return g;
      return { ...g, enabled: !g.enabled };
    }));
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 16, lineHeight: "18px" }}>Safety guardrails prevent agents from taking harmful actions. Critical guardrails cannot be disabled.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {guardrails.map((g, i) => (
          <div key={g.id} style={{
            padding: "12px 14px", borderRadius: 8,
            background: g.enabled ? C.elevated : C.surface,
            border: `1px solid ${g.enabled ? C.border : `${C.border}88`}`,
            opacity: g.severity === "critical" ? 1 : undefined,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: g.enabled ? C.text : C.textMuted }}>{g.label}</span>
                <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: `${severityColors[g.severity]}18`, color: severityColors[g.severity], textTransform: "uppercase" }}>{g.severity}</span>
              </div>
              <div
                onClick={() => toggleGuardrail(i)}
                style={{
                  width: 36, height: 20, borderRadius: 10, padding: 2, cursor: g.severity === "critical" ? "not-allowed" : "pointer",
                  background: g.enabled ? C.green : C.border, transition: "background 0.2s",
                  display: "flex", alignItems: "center", opacity: g.severity === "critical" ? 0.7 : 1,
                }}
              >
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", transform: g.enabled ? "translateX(16px)" : "translateX(0)", transition: "transform 0.2s" }} />
              </div>
            </div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{g.desc}</div>
            {g.severity === "critical" && g.enabled && (
              <div style={{ fontSize: 9, color: C.red, fontWeight: 500, marginTop: 4 }}>🔒 Cannot be disabled — enforced by system policy</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepLimits({ onRunTest, onSimulateTask }) {
  const limits = [
    { label: "Max daily spend", value: "$25.00", unit: "USD", desc: "Agent will pause when daily cost reaches this limit" },
    { label: "Max tokens per request", value: "8,192", unit: "tokens", desc: "Maximum output length for any single completion" },
    { label: "Max API calls per hour", value: "500", unit: "calls", desc: "Rate limit for external API integrations" },
    { label: "Max concurrent tasks", value: "3", unit: "tasks", desc: "Number of tasks agent can work simultaneously" },
    { label: "Approval threshold", value: "$50.00", unit: "USD", desc: "Actions above this cost require human approval" },
    { label: "Session timeout", value: "30", unit: "minutes", desc: "Max time for a single task execution" },
  ];

  return (
    <div>
      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 16, lineHeight: "18px" }}>Set operational limits to control cost, performance, and resource usage. These limits protect against runaway behavior.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {limits.map((lim, i) => (
          <div key={i} style={{ padding: "14px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 4 }}>{lim.label}</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8 }}>{lim.desc}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input defaultValue={lim.value} style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }} />
              <span style={{ fontSize: 10, color: C.textMuted, flexShrink: 0 }}>{lim.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Test console preview */}
      <div style={{ marginTop: 20, padding: "14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12 }}>🧪</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Test Console</span>
          <span style={{ fontSize: 10, color: C.textMuted }}>— Validate agent before deploying</span>
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, marginBottom: 8, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 11, color: C.textMuted, lineHeight: "18px" }}>
          <div style={{ color: C.green }}>$ test-agent partnership-scout</div>
          <div>Loading agent config...</div>
          <div style={{ color: C.blue }}>✓ Identity: Partnership Scout (Partnerships & Affiliate Manager)</div>
          <div style={{ color: C.blue }}>✓ Scope: 4 permissions granted</div>
          <div style={{ color: C.blue }}>✓ Tools: 5 integrations connected</div>
          <div style={{ color: C.blue }}>✓ Model routing: 6 rules configured</div>
          <div style={{ color: C.blue }}>✓ Guardrails: 6 active (3 critical)</div>
          <div style={{ color: C.blue }}>✓ Limits: All within safe bounds</div>
          <div style={{ color: C.green, marginTop: 4 }}>Agent ready for deployment ✓</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onRunTest} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, cursor: "pointer" }}>Run Test Prompt</button>
          <button onClick={onSimulateTask} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, cursor: "pointer" }}>Simulate Task</button>
        </div>
      </div>
    </div>
  );
}

export default function AgentConfigurator() {
  const { store, client } = useMissionControl();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("cf-theme") === "dark");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  C = getTheme(isDark);

  const [currentStep, setCurrentStep] = useState(() => {
    const hash = window.location.hash || '';
    const match = hash.match(/step=(\d+)/);
    if (match) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) return Math.max(0, Math.min(STEPS.length - 1, parsed - 1));
    }
    return store.configurator.drafts[store.configurator.activeDraftId]?.stepIndex || 0;
  });
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true });
  const [opMessage, setOpMessage] = useState('');
  const activeDraft = store.configurator.drafts[store.configurator.activeDraftId] || {};
  const [selectedTemplate, setSelectedTemplate] = useState(activeDraft.templateKey || 'custom');
  const [identityDraft, setIdentityDraft] = useState(() => ({
    name: activeDraft.identity?.name || 'Partnership Scout',
    roleTitle: activeDraft.identity?.roleTitle || 'Partnerships & Affiliate Manager',
    systemPrompt: activeDraft.identity?.systemPrompt || 'You are the Partnership Scout for ClawForge.',
    reportsTo: activeDraft.identity?.reportsTo || 'Sales CEO',
    avatarColor: activeDraft.identity?.avatarColor || C.teal,
  }));
  const [scopeDraft, setScopeDraft] = useState(() => {
    const saved = activeDraft.scopeDraft;
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_SCOPE_OPTIONS;
  });
  const [toolsDraft, setToolsDraft] = useState(() => (
    Array.isArray(activeDraft.tools) && activeDraft.tools.length
      ? activeDraft.tools
      : ['gmail', 'hubspot', 'calendar', 'gdocs', 'slack']
  ));
  const [modelRoutesDraft, setModelRoutesDraft] = useState(() => (
    Array.isArray(activeDraft.modelRouting) && activeDraft.modelRouting.length
      ? activeDraft.modelRouting
      : MODEL_ROUTES
  ));
  useEffect(() => {
    let t;
    if (collapsedSections.SYSTEM === undefined || collapsedSections.SYSTEM === true) return;
    t = setTimeout(() => setCollapsedSections((p) => ({ ...p, SYSTEM: true })), 12000);
    return () => t && clearTimeout(t);
  }, [collapsedSections.SYSTEM]);

  useEffect(() => {
    if (!selectedTemplate || selectedTemplate === 'custom') return;
    const template = ROLE_TEMPLATES[selectedTemplate];
    if (!template?.identity) return;
    setIdentityDraft((prev) => ({ ...prev, ...template.identity }));
  }, [selectedTemplate]);

  useEffect(() => {
    const nextStep = currentStep + 1;
    const hash = window.location.hash || '#/configurator';
    const [pathPart, queryString = ''] = hash.replace('#', '').split('?');
    const path = pathPart || '/configurator';
    const params = new URLSearchParams(queryString);
    if (path !== '/configurator') return;
    if (Number(params.get('step')) === nextStep) return;
    params.set('step', String(nextStep));
    window.history.replaceState(null, '', `#${path}?${params.toString()}`);
  }, [currentStep]);

  const persistDraft = async (extra = {}) => {
    const draftId = store.configurator.activeDraftId;
    return client.run('oc.agentConfig.draft.save', {
      draftId,
      stepIndex: currentStep,
      templateKey: selectedTemplate,
      identity: identityDraft,
      scopeDraft,
      scope: scopeDraft.filter((s) => s.enabled).map((s) => s.label),
      tools: toolsDraft,
      modelRouting: modelRoutesDraft,
      allowLocalFallback: true,
      ...extra,
    });
  };

  const saveDraft = async () => {
    const resp = await persistDraft();
    setOpMessage(resp.ok ? formatOpSuccess('Draft saved', resp) : formatOpError(resp.error));
  };

  const runTest = async () => {
    const resp = await client.run('oc.agentConfig.test.prompt', {
      draftId: store.configurator.activeDraftId,
      prompt: 'Ping test',
      allowLocalFallback: true,
    });
    setOpMessage(resp.ok
      ? formatOpSuccess(`Test OK (${resp.data.telemetry?.model || 'unknown'})`, resp)
      : formatOpError(resp.error));
  };

  const simulateTask = async () => {
    const resp = await client.run('oc.agentConfig.test.prompt', {
      draftId: store.configurator.activeDraftId,
      prompt: 'Simulate task: Draft partnership outreach for a new SaaS integration lead',
      allowLocalFallback: true,
    });
    setOpMessage(resp.ok ? formatOpSuccess('Simulation OK', resp) : formatOpError(resp.error));
  };

  const deployDraft = async () => {
    const saved = await persistDraft();
    if (!saved.ok) {
      setOpMessage(formatOpError(saved.error));
      return;
    }

    const resp = await client.run('oc.agent.deploy.fromDraft', {
      draftId: store.configurator.activeDraftId,
      allowLocalFallback: true,
    });
    setOpMessage(resp.ok
      ? formatOpSuccess(`Deployed ${resp.data.agent?.name || 'agent'}`, resp)
      : formatOpError(resp.error));
    if (resp.ok) window.location.hash = '/army';
  };

  const stepPanels = [
    <StepIdentity key="step-identity" identity={identityDraft} selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} onChange={(patch) => setIdentityDraft((prev) => ({ ...prev, ...patch }))} />,
    <StepScope key="step-scope" scopes={scopeDraft} onToggleScope={(index) => setScopeDraft((prev) => prev.map((scope, i) => (i === index ? { ...scope, enabled: !scope.enabled } : scope)))} />,
    <StepTools key="step-tools" selected={toolsDraft} onChangeSelected={setToolsDraft} />,
    <StepModelRouting key="step-routing" routes={modelRoutesDraft} onChangeRoutes={setModelRoutesDraft} />,
    <StepGuardrails key="step-guardrails" />,
    <StepLimits key="step-limits" onRunTest={runTest} onSimulateTask={simulateTask} />,
  ];

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar
        activePage="configurator"
        isDark={isDark}
        setIsDark={setIsDark}
        C={C}
        collapsedSections={collapsedSections}
        onToggleSection={(section) => setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Agents</span><span style={{ color: C.textMuted }}>/</span>
          <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Add Agent</span><span style={{ color: C.textMuted }}>/</span>
          <span style={{ fontSize: 12, color: C.blue, fontWeight: 600 }}>New Agent</span>
          <div style={{ flex: 1 }} />
          <button onClick={saveDraft} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>Save Draft</button>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Step sidebar */}
          <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: "20px 16px", background: C.surface }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 16 }}>Configuration Steps</div>
            {STEPS.map((step, i) => {
              const isActive = currentStep === i;
              const isDone = i < currentStep;
              return (
                <div key={step.key} onClick={() => setCurrentStep(i)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                  cursor: "pointer", marginBottom: 4,
                  background: isActive ? C.blueGlow : "transparent",
                  borderLeft: isActive ? `2px solid ${C.blue}` : "2px solid transparent",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: isDone ? C.green : isActive ? C.blue : C.elevated,
                    border: `1.5px solid ${isDone ? C.green : isActive ? C.blue : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isDone ? 11 : 13, color: "#fff", fontWeight: 700,
                  }}>{isDone ? "✓" : step.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? C.text : isDone ? C.textSec : C.textMuted }}>{step.label}</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>{isDone ? "Complete" : isActive ? "In progress" : `Step ${i + 1}`}</div>
                  </div>
                </div>
              );
            })}

            {/* Progress */}
            <div style={{ marginTop: 20, padding: "12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>Progress</span>
                <span style={{ fontSize: 10, color: C.blue, fontWeight: 600 }}>{Math.round(((currentStep) / STEPS.length) * 100)}%</span>
              </div>
              <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(currentStep / STEPS.length) * 100}%`, background: C.blue, borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>
          </div>

          {/* Step content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 40px" }}>
            <div style={{ maxWidth: 760 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{STEPS[currentStep].icon}</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
                  Step {currentStep + 1}: {STEPS[currentStep].label}
                </h2>
              </div>
              <div style={{ height: 1, background: C.border, marginBottom: 20 }} />
              {opMessage && <div style={{ marginBottom: 12, fontSize: 11, color: C.blue }}>{opMessage}</div>}
              {stepPanels.map((panel, idx) => (
                <div key={idx} style={{ display: currentStep === idx ? 'block' : 'none' }}>
                  {panel}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div style={{ padding: "12px 24px", borderTop: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} style={{
            padding: "8px 20px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: "transparent", color: currentStep === 0 ? C.textMuted : C.textSec,
            fontSize: 12, fontWeight: 500, cursor: currentStep === 0 ? "default" : "pointer",
            opacity: currentStep === 0 ? 0.5 : 1,
          }}>← Previous</button>
          <div style={{ display: "flex", gap: 4 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === currentStep ? 20 : 6, height: 6, borderRadius: 3,
                background: i < currentStep ? C.green : i === currentStep ? C.blue : C.border,
                transition: "all 0.3s",
              }} />
            ))}
          </div>
          {currentStep < STEPS.length - 1 ? (
            <button onClick={() => setCurrentStep(currentStep + 1)} style={{
              padding: "8px 20px", borderRadius: 6, border: "none",
              background: C.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>Next Step →</button>
          ) : (
            <button onClick={deployDraft} style={{
              padding: "8px 20px", borderRadius: 6, border: "none",
              background: C.green, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>🚀 Deploy Agent</button>
          )}
        </div>
      </div>
    </div>
  );
}
