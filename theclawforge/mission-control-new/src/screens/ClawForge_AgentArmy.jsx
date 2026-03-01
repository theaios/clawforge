import { useEffect, useState } from "react";
import { useMissionControl } from "../lib/missionControlContext";
import { formatOpError, formatOpSuccess } from "../lib/openclawDiagnostics";
import { cycleThemeMode, getStoredThemeMode, persistThemeMode } from "../lib/themeMode";

function getTheme(mode) {
  if (mode === "trippy") return {
    bg: "#140825", surface: "#24113F", elevated: "#321759",
    border: "#6B36A8", borderLight: "#8E4CD4",
    text: "#F8F3FF", textSec: "#DCC9FF", textMuted: "#BFA2EF",
    blue: "#00E5FF", blueGlow: "rgba(0,229,255,0.20)",
    green: "#39FF88", greenGlow: "rgba(57,255,136,0.18)",
    amber: "#FFD166", amberGlow: "rgba(255,209,102,0.18)",
    red: "#FF5FA2", redGlow: "rgba(255,95,162,0.18)",
    purple: "#B26BFF", purpleGlow: "rgba(178,107,255,0.18)",
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
    bg: "#F4F6FA", surface: "#FFFFFF", elevated: "#F8FAFC",
    border: "#D2D9E3", borderLight: "#E5EAF2",
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
// Use light palette defaults so static seed colors don't look black in light mode.
let C = getTheme(false);


const STATUS_MAP = {
  online: { color: "#16A34A", label: "Online", bg: "rgba(22,163,74,0.12)" },
  degraded: { color: "#D97706", label: "Degraded", bg: "rgba(217,119,6,0.12)" },
  offline: { color: "#DC2626", label: "Offline", bg: "rgba(220,38,38,0.12)" },
};

const MODEL_ICONS = {
  Claude: { color: "#D4A574" }, "GPT-4o": { color: "#74AA9C" },
  Gemini: { color: "#4285F4" }, Mistral: { color: "#FF7000" },
};

const ORCHESTRATOR = {
  id: "orch", name: "Joseph", role: "Orchestrator", initials: "JC",
  color: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
  status: "online", model: null, queue: 0, permissions: ["Full Access"], isHuman: true,
};

const CEO_AGENTS = [
  {
    id: "ops", name: "Operations CEO", initials: "OP", color: C.blue, model: "Claude",
    status: "online", queue: 4, uptime: "99.8%", tasksCompleted: 142, costToday: "$2.14",
    permissions: ["AWS Management", "Docker", "CI/CD", "Database"],
    description: "Manages infrastructure, deployments, and technical operations across all customer instances.",
    children: [
      { id: "dev", name: "Full-Stack Dev", initials: "FS", color: "#60A5FA", model: "Claude", status: "online", queue: 6, uptime: "99.7%", tasksCompleted: 89, costToday: "$1.87", permissions: ["GitHub", "AWS EC2", "Docker"], description: "Builds and maintains product codebase, APIs, and frontend." },
      { id: "devops", name: "DevOps Engineer", initials: "DV", color: C.orange, model: "Claude", status: "online", queue: 5, uptime: "99.9%", tasksCompleted: 67, costToday: "$0.92", permissions: ["Terraform", "AWS", "Docker", "CI/CD"], description: "Infrastructure as code, CI/CD pipelines, monitoring." },
      { id: "qa", name: "QA Tester", initials: "QA", color: "#FB923C", model: "Claude", status: "online", queue: 3, uptime: "99.8%", tasksCompleted: 54, costToday: "$0.68", permissions: ["Test Suites", "Staging Env"], description: "End-to-end testing, regression, performance validation." },
    ],
  },
  {
    id: "mkt", name: "Marketing CEO", initials: "MK", color: C.purple, model: "GPT-4o",
    status: "online", queue: 7, uptime: "99.6%", tasksCompleted: 118, costToday: "$3.41",
    permissions: ["Meta Ads", "Google Ads", "Analytics", "Email"],
    description: "Leads all marketing campaigns, content strategy, and growth initiatives for launch.",
    children: [
      { id: "content", name: "Content Writer", initials: "CW", color: C.pink, model: "Claude", status: "online", queue: 3, uptime: "99.7%", tasksCompleted: 76, costToday: "$1.23", permissions: ["CMS", "Google Docs", "Canva API"], description: "Website copy, blog posts, email sequences, ad creative." },
      { id: "seo", name: "SEO Specialist", initials: "SE", color: "#818CF8", model: "GPT-4o", status: "offline", queue: 0, uptime: "—", tasksCompleted: 31, costToday: "$0.00", permissions: ["GA4", "Search Console", "Ahrefs"], description: "SEO strategy, keyword research, technical optimization." },
      { id: "community", name: "Community Mgr", initials: "CM", color: "#34D399", model: "Claude", status: "online", queue: 1, uptime: "99.4%", tasksCompleted: 43, costToday: "$0.54", permissions: ["Discord", "Telegram", "Slack"], description: "Community engagement, weekly Zoom calls, member onboarding." },
    ],
  },
  {
    id: "sales", name: "Sales CEO", initials: "SL", color: C.green, model: "Claude",
    status: "online", queue: 2, uptime: "99.9%", tasksCompleted: 96, costToday: "$1.67",
    permissions: ["CRM", "Gmail", "LinkedIn", "Calendar"],
    description: "Manages sales pipeline, outreach, partnerships, and deal closing.",
    children: [],
  },
  {
    id: "fin", name: "Finance CEO", initials: "FN", color: C.amber, model: "Gemini",
    status: "online", queue: 1, uptime: "100%", tasksCompleted: 58, costToday: "$0.89",
    permissions: ["Stripe", "QuickBooks", "Banking API"],
    description: "Financial reporting, billing, invoicing, budgeting, and cash flow management.",
    children: [],
  },
  {
    id: "cx", name: "CX CEO", initials: "CX", color: C.teal, model: "GPT-4o",
    status: "online", queue: 2, uptime: "99.5%", tasksCompleted: 82, costToday: "$1.12",
    permissions: ["Support Tickets", "Knowledge Base", "Email"],
    description: "Customer success, onboarding coordination, support ticket management.",
    children: [
      { id: "onboard", name: "Onboarding Spec", initials: "OB", color: "#A78BFA", model: "GPT-4o", status: "online", queue: 0, uptime: "100%", tasksCompleted: 24, costToday: "$0.31", permissions: ["Zoom", "Calendar", "Docs"], description: "Live setup sessions, agent personalization, post-session follow-up." },
    ],
  },
  {
    id: "sec", name: "Security Sentinel", initials: "SS", color: C.red, model: "Claude",
    status: "degraded", queue: 0, uptime: "98.1%", tasksCompleted: 37, costToday: "$0.76",
    permissions: ["AWS WAF", "CloudWatch", "Vuln Scanner"],
    description: "Security reviews, threat detection, vulnerability management, incident response.",
    children: [],
    alert: "Running elevated scans — performance temporarily reduced",
  },
];

function Avatar({ initials, color, size = 40, status, isHuman }) {
  const isGrad = typeof color === "string" && color.includes("gradient");
  const st = STATUS_MAP[status];
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: isHuman ? 10 : "50%",
        background: isGrad ? color : `linear-gradient(135deg, ${color}, ${color}88)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.35, fontWeight: 700, color: "#fff",
        border: `2px solid ${isGrad ? C.blue : color}44`,
        boxShadow: `0 0 12px ${isGrad ? C.blue : color}22`,
      }}>{initials}</div>
      {status && st && (
        <div style={{
          position: "absolute", bottom: -1, right: -1,
          width: size * 0.28, height: size * 0.28, borderRadius: "50%",
          background: st.color, border: `2px solid ${C.surface}`,
        }} />
      )}
    </div>
  );
}

function ModelBadge({ model }) {
  if (!model) return null;
  const m = MODEL_ICONS[model];
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
      background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30`,
    }}>{model}</span>
  );
}

function OrgNode({ agent, isSelected, onClick, isCEO }) {
  const st = STATUS_MAP[agent.status];
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(agent)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isSelected ? C.elevated : hovered ? `${C.elevated}cc` : C.surface,
        border: `1px solid ${isSelected ? C.blue : agent.alert ? `${C.amber}44` : hovered ? C.borderLight : C.border}`,
        borderRadius: 12, padding: isCEO ? "14px 16px" : "10px 14px",
        cursor: "pointer", transition: "all 0.15s ease",
        boxShadow: isSelected
          ? `0 0 20px ${C.blue}15`
          : hovered
            ? (C.bg === "#0A0C10" ? "0 4px 16px rgba(0,0,0,0.3)" : "0 6px 16px rgba(148,163,184,0.28)")
            : (C.bg === "#0A0C10" ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(148,163,184,0.18)"),
        width: isCEO ? 200 : 170, position: "relative",
      }}
    >
      {agent.alert && (
        <div style={{
          position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
          background: C.amber, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, color: "#1a1a1a", fontWeight: 800, border: `2px solid ${C.surface}`,
        }}>!</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Avatar initials={agent.initials} color={agent.color} size={isCEO ? 36 : 30} status={agent.status} isHuman={agent.isHuman} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: isCEO ? 12 : 11, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.name || agent.role}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            {agent.model ? <ModelBadge model={agent.model} /> : <span style={{ fontSize: 10, color: C.purple, fontWeight: 600 }}>Human</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 6, color: st?.color || C.green }}>●</span>
          <span style={{ fontSize: 10, color: st?.color || C.green, fontWeight: 500 }}>{st?.label || "Online"}</span>
        </div>
        {agent.queue > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 9999,
            background: C.blueGlow, color: C.blue, border: `1px solid rgba(59,130,246,0.2)`,
          }}>{agent.queue} queued</span>
        )}
      </div>
    </div>
  );
}

function AgentDetailPanel({ agent, onClose, onDelete, onConfigure, onMessage, onToggleStatus }) {
  if (!agent) return null;
  const st = STATUS_MAP[agent.status];
  return (
    <div style={{
      width: "min(780px, 92vw)",
      maxHeight: "88vh",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      boxShadow: C.bg === "#0A0C10" ? "0 24px 64px rgba(0,0,0,0.55)" : "0 18px 40px rgba(148,163,184,0.28)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Agent Details</span>
        <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <Avatar initials={agent.initials} color={agent.color} size={48} status={agent.status} isHuman={agent.isHuman} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{agent.name || agent.role}</div>
            {agent.role && <div style={{ fontSize: 11, color: C.textMuted }}>{agent.role}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: st?.bg, color: st?.color, border: `1px solid ${st?.color}33` }}>{st?.label}</span>
              {agent.model && <ModelBadge model={agent.model} />}
            </div>
          </div>
        </div>
        {agent.alert && (
          <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 16, background: C.amberGlow, border: `1px solid rgba(245,158,11,0.25)`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12 }}>⚠️</span>
            <span style={{ fontSize: 11, color: C.amber, fontWeight: 500 }}>{agent.alert}</span>
          </div>
        )}
        {agent.description && (
          <div style={{ fontSize: 12, color: C.textSec, lineHeight: "18px", marginBottom: 16, padding: "10px 12px", background: C.elevated, borderRadius: 8, border: `1px solid ${C.border}` }}>{agent.description}</div>
        )}
        {!agent.isHuman && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Uptime", value: agent.uptime, color: agent.uptime === "100%" ? C.green : C.text },
              { label: "Queue", value: `${agent.queue} tasks`, color: agent.queue > 5 ? C.amber : C.text },
              { label: "Completed", value: agent.tasksCompleted, color: C.text },
              { label: "Cost Today", value: agent.costToday, color: C.text },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
        {agent.permissions && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>Permissions & Tools</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {agent.permissions.map((p, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 500, padding: "3px 9px", borderRadius: 5, background: C.elevated, color: C.textSec, border: `1px solid ${C.border}` }}>{p}</span>
              ))}
            </div>
          </div>
        )}
        {!agent.isHuman && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>Recent Activity</div>
            {[
              { action: "Completed task: Update deployment script", time: "8 min ago" },
              { action: "Started: Review pull request #47", time: "22 min ago" },
              { action: "Sent message in #ops-general", time: "35 min ago" },
            ].map((act, i) => (
              <div key={i} style={{ padding: "7px 10px", borderRadius: 6, background: i % 2 === 0 ? C.elevated : (C.bg === "#0A0C10" ? "transparent" : "#FDFEFF"), marginBottom: 2 }}>
                <div style={{ fontSize: 11, color: C.text }}>{act.action}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>{act.time}</div>
              </div>
            ))}
          </div>
        )}
        {agent.children && agent.children.length > 0 && (
          <div>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>Direct Reports ({agent.children.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {agent.children.map(child => (
                <div key={child.id} style={{ padding: "8px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={child.initials} color={child.color} size={26} status={child.status} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{child.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                      <ModelBadge model={child.model} />
                      <span style={{ fontSize: 9, color: STATUS_MAP[child.status].color }}>{STATUS_MAP[child.status].label}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{child.queue}q</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {!agent.isHuman && (
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
          <button onClick={() => onConfigure?.(agent)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Configure</button>
          <button onClick={() => onMessage?.(agent)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Message</button>
          {agent.status === "online" ? (
            <button onClick={() => onToggleStatus?.(agent)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: C.red, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Pause</button>
          ) : (
            <button onClick={() => onToggleStatus?.(agent)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: C.green, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Activate</button>
          )}
          <button onClick={() => onDelete?.(agent)} style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.red}55`, background: `${C.red}14`, color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Delete</button>
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

function ThemeToggle({ themeMode, setThemeMode, C }) {
  const isDark = themeMode !== "light";
  const current = themeMode === "trippy" ? { icon: "🪩", label: "Trippy" } : themeMode === "light" ? { icon: "☀️", label: "Light" } : { icon: "🌙", label: "Dark" };
  return (
    <div
      onClick={() => setThemeMode(cycleThemeMode(themeMode))}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px", borderRadius: 6, cursor: "pointer",
        background: isDark ? "rgba(59,130,246,0.08)" : "rgba(37,99,235,0.06)",
        border: "1px solid transparent",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{current.icon}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: isDark ? "#8B919E" : "#5C6370" }}>
        {current.label}
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

function Sidebar({ activePage, themeMode, setThemeMode, C, collapsedSections, onToggleSection }) {
  const isDark = themeMode !== "light";
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
        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} C={C} />
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

const THEME_STORAGE_KEY = "cf-theme";
const VIEWMODE_STORAGE_KEY = "clawforge-agentarmy-viewmode";
const DELETED_AGENTS_STORAGE_KEY = "clawforge-agentarmy-deleted-ids";

function getInitialThemeMode() {
  if (typeof window === "undefined") return false;
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light") return false;
  if (saved === "dark") return true;
  return false;
}

function getInitialViewMode() {
  if (typeof window === "undefined") return "grid";
  const saved = window.localStorage.getItem(VIEWMODE_STORAGE_KEY);
  if (saved === "org" || saved === "grid") return saved;
  return "grid";
}

function getInitialDeletedAgentIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DELETED_AGENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AgentArmy() {
  const { store, client } = useMissionControl();
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const isDark = themeMode !== "light";
  const C = getTheme(themeMode);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [deletedAgentIds, setDeletedAgentIds] = useState(getInitialDeletedAgentIds);
  const [agentStatusOverrides, setAgentStatusOverrides] = useState({});
  const [opMessage, setOpMessage] = useState('');
  const [connectionInfo, setConnectionInfo] = useState(() => client.getConnectionState());
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true });
  const [viewMode, setViewMode] = useState(() => store.agents.viewMode || getInitialViewMode());

  useEffect(() => {
    if (typeof window === "undefined") return;
    persistThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    const syncTheme = () => setThemeMode(getStoredThemeMode());
    window.addEventListener("storage", syncTheme);
    window.addEventListener("focus", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VIEWMODE_STORAGE_KEY, viewMode);
    client.run('oc.agentArmy.viewMode.set', { viewMode });
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DELETED_AGENTS_STORAGE_KEY, JSON.stringify(deletedAgentIds));
  }, [deletedAgentIds]);

  useEffect(() => {
    const syncConnection = () => setConnectionInfo(client.getConnectionState());
    window.addEventListener('mc-store-updated', syncConnection);
    syncConnection();
    return () => window.removeEventListener('mc-store-updated', syncConnection);
  }, [client]);

  useEffect(() => {
    let t;
    if (collapsedSections.SYSTEM === undefined || collapsedSections.SYSTEM === true) return;
    t = setTimeout(() => setCollapsedSections((p) => ({ ...p, SYSTEM: true })), 12000);
    return () => t && clearTimeout(t);
  }, [collapsedSections.SYSTEM]);
  const knownAgentIds = new Set(CEO_AGENTS.flatMap((ceo) => [ceo.id, ...((ceo.children || []).map((child) => child.id))]));
  const injectedAgents = (store.agents?.roster || [])
    .filter((agent) => agent?.id && !knownAgentIds.has(agent.id) && !deletedAgentIds.includes(agent.id))
    .map((agent) => ({ ...agent, children: [] }));

  const visibleCeoAgents = [
    ...CEO_AGENTS
      .filter((ceo) => !deletedAgentIds.includes(ceo.id))
      .map((ceo) => ({
        ...ceo,
        status: agentStatusOverrides[ceo.id] || ceo.status,
        children: (ceo.children || [])
          .filter((child) => !deletedAgentIds.includes(child.id))
          .map((child) => ({ ...child, status: agentStatusOverrides[child.id] || child.status })),
      })),
    ...injectedAgents.map((agent) => ({ ...agent, status: agentStatusOverrides[agent.id] || agent.status || 'online' })),
  ];
  const allVisibleAgents = visibleCeoAgents.flatMap((ceo) => [ceo, ...(ceo.children || [])]);
  const totalAgents = allVisibleAgents.length;
  const onlineCount = allVisibleAgents.filter((agent) => agent.status === "online").length;

  const handleAddAgent = () => {
    window.location.hash = '/configurator?step=1';
  };

  const handleDeleteAgent = (agent) => {
    if (!agent?.id) return;
    setDeletedAgentIds((prev) => (prev.includes(agent.id) ? prev : [...prev, agent.id]));
    setOpMessage(`${agent.name} deleted from org chart view.`);
    setSelectedAgent(null);
  };

  const handleConfigureAgent = (agent) => {
    if (!agent?.id) return;
    window.location.hash = `/configurator?step=1&agentId=${encodeURIComponent(agent.id)}`;
  };

  const handleToggleAgentStatus = async (agent) => {
    if (!agent?.id) return;
    const nextState = agent.status === 'online' ? 'paused' : 'active';
    const resp = await client.run('oc.agent.state.set', { agentId: agent.id, state: nextState });
    if (resp.ok) {
      const nextStatus = nextState === 'active' ? 'online' : 'offline';
      setAgentStatusOverrides((prev) => ({ ...prev, [agent.id]: nextStatus }));
      setSelectedAgent((prev) => (prev?.id === agent.id ? { ...prev, status: nextStatus } : prev));
      setOpMessage(`${agent.name} is now ${nextStatus}.`);
      return;
    }
    setOpMessage(formatOpError(resp.error));
  };

  const handleMessageAgent = async (agent) => {
    if (!agent?.id) return;
    const message = window.prompt(`Message ${agent.name}:`);
    if (!message || !message.trim()) return;
    const resp = await client.run('oc.agent.message.send', { agentId: agent.id, message: message.trim() });
    if (resp.ok) {
      setOpMessage(formatOpSuccess(`Message sent to ${agent.name}`, resp));
      return;
    }
    setOpMessage(formatOpError(resp.error));
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="agentarmy" themeMode={themeMode} setThemeMode={setThemeMode} C={C} collapsedSections={collapsedSections} onToggleSection={(section) => setCollapsedSections((p) => ({ ...p, [section]: !p[section] }))} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Agents</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Org Chart</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search agents...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> {onlineCount} online</span>
        </div>
        <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Org Chart</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>{totalAgents} agents deployed • {onlineCount} online • Orchestrator-controlled hierarchy</p>
              <p style={{ fontSize: 11, color: connectionInfo.connected ? C.green : C.amber, margin: '6px 0 0' }}>
                Live API: {connectionInfo.connected ? 'connected' : 'disconnected'}{connectionInfo.lastRequestId ? ` · requestId ${connectionInfo.lastRequestId}` : ''}
              </p>
              {opMessage && <p style={{ fontSize: 11, color: C.blue, margin: '6px 0 0' }}>{opMessage}</p>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
                {["org", "grid"].map(v => (
                  <button key={v} onClick={() => setViewMode(v)} style={{ padding: "6px 14px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, background: viewMode === v ? C.blueGlow : "transparent", color: viewMode === v ? C.blue : C.textMuted }}>{v === "org" ? "Org Chart" : "Grid"}</button>
                ))}
              </div>
              <button onClick={handleAddAgent} style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Agent</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total Agents", value: totalAgents, color: C.text },
              { label: "Online", value: onlineCount, color: C.green },
              { label: "Degraded", value: "1", color: C.amber },
              { label: "Offline", value: "1", color: C.red },
              { label: "Cost Today", value: "$14.64", color: C.text },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px 14px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "flex" }}>
          <div style={{ flex: 1, padding: "10px 24px 40px", overflowY: "auto" }}>
            {viewMode === "org" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, minWidth: "max-content", padding: "0 40px" }}>
                <div style={{ marginBottom: 8 }}>
                  <OrgNode agent={ORCHESTRATOR} isSelected={selectedAgent?.id === "orch"} onClick={setSelectedAgent} isCEO={true} />
                </div>
                <div style={{ width: 1.5, height: 28, background: C.border, opacity: 0.5 }} />
                <div style={{ height: 1.5, background: C.border, opacity: 0.5, width: `${(Math.max(visibleCeoAgents.length - 1, 0)) * 220}px`, maxWidth: "100%" }} />
                <div style={{ display: "flex", gap: 20, justifyContent: "center", position: "relative" }}>
                  {visibleCeoAgents.map(ceo => (
                    <div key={ceo.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 1.5, height: 20, background: C.border, opacity: 0.5 }} />
                      <OrgNode agent={ceo} isSelected={selectedAgent?.id === ceo.id} onClick={setSelectedAgent} isCEO={true} />
                      {ceo.children && ceo.children.length > 0 && (
                        <>
                          <div style={{ width: 1.5, height: 20, background: C.border, opacity: 0.3 }} />
                          {ceo.children.length > 1 && <div style={{ height: 1.5, background: C.border, opacity: 0.3, width: `${(ceo.children.length - 1) * 186}px` }} />}
                          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                            {ceo.children.map(child => (
                              <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ width: 1.5, height: 16, background: C.border, opacity: 0.3 }} />
                                <OrgNode agent={child} isSelected={selectedAgent?.id === child.id} onClick={setSelectedAgent} isCEO={false} />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, alignItems: "start" }}>
                {allVisibleAgents.map(ag => (
                  <div key={ag.id} onClick={() => setSelectedAgent(ag)} style={{
                    background: selectedAgent?.id === ag.id ? C.elevated : C.surface,
                    border: `1px solid ${selectedAgent?.id === ag.id ? C.blue : C.border}`,
                    borderRadius: 10, padding: "10px", cursor: "pointer",
                    minHeight: 96,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <Avatar initials={ag.initials} color={ag.color} size={34} status={ag.status} />
                      <div><div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{ag.name}</div><div style={{ display: "flex", alignItems: "center", gap: 4 }}><ModelBadge model={ag.model} /><span style={{ fontSize: 6, color: STATUS_MAP[ag.status].color }}>●</span></div></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted }}>
                      <span>{ag.queue} queued</span><span>{ag.tasksCompleted} done</span><span>{ag.costToday}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedAgent && (
            <div
              onClick={() => setSelectedAgent(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 300,
                background: C.bg === "#0A0C10" ? "rgba(0,0,0,0.58)" : "rgba(148,163,184,0.28)",
                backdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 18,
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <AgentDetailPanel
                  agent={selectedAgent}
                  onClose={() => setSelectedAgent(null)}
                  onDelete={handleDeleteAgent}
                  onConfigure={handleConfigureAgent}
                  onMessage={handleMessageAgent}
                  onToggleStatus={handleToggleAgentStatus}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
