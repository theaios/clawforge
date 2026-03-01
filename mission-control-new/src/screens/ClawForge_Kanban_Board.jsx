import { useState, useRef, useEffect, useCallback } from "react";
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
    dropTarget: "rgba(59,130,246,0.06)", dropBorder: "rgba(59,130,246,0.35)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.15)", cardHover: "0 4px 16px rgba(0,0,0,0.3)",
    dragShadow: "0 12px 40px rgba(0,0,0,0.5)",
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
    dropTarget: "rgba(37,99,235,0.04)", dropBorder: "rgba(37,99,235,0.30)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.06)", cardHover: "0 4px 12px rgba(0,0,0,0.08)",
    dragShadow: "0 12px 40px rgba(0,0,0,0.15)",
  };
}

let C = getTheme(true);

function hexToRgba(hex, alpha = 1) {
  const normalized = (hex || "").replace("#", "");
  if (normalized.length !== 6) return `rgba(148,163,184,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ══════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════ */

const PRIORITY = {
  P0: { label: "P0", bg: "#EF4444", color: "#fff" },
  P1: { label: "P1", bg: "#F97316", color: "#fff" },
  P2: { label: "P2", bg: "#F59E0B", color: "#1a1a1a" },
  P3: { label: "P3", bg: "#3B4048", color: "#8B919E" },
};

const LABEL_PRESETS = [
  { id: "bug", name: "Bug", color: "#EF4444" },
  { id: "feature", name: "Feature", color: "#3B82F6" },
  { id: "design", name: "Design", color: "#8B5CF6" },
  { id: "infra", name: "Infrastructure", color: "#F97316" },
  { id: "ux", name: "UX", color: "#EC4899" },
  { id: "security", name: "Security", color: "#EF4444" },
  { id: "docs", name: "Documentation", color: "#06B6D4" },
  { id: "perf", name: "Performance", color: "#22C55E" },
];

const AGENTS = [
  { name: "Operations CEO", initials: "OP", color: "#3B82F6", model: "Claude" },
  { name: "Marketing CEO", initials: "MK", color: "#8B5CF6", model: "GPT-4o" },
  { name: "Sales CEO", initials: "SL", color: "#22C55E", model: "Claude" },
  { name: "Finance CEO", initials: "FN", color: "#F59E0B", model: "Gemini" },
  { name: "Content Writer", initials: "CW", color: "#EC4899", model: "Claude" },
  { name: "Security Sentinel", initials: "SS", color: "#EF4444", model: "Claude" },
  { name: "CX CEO", initials: "CX", color: "#06B6D4", model: "GPT-4o" },
];

let _nextId = 100;
const uid = () => _nextId++;

const INITIAL_COLUMNS = [
  { id: "backlog", name: "Backlog", wip: null, accent: "#5C6370", collapsed: false },
  { id: "ready", name: "Ready", wip: 4, accent: "#3B82F6", collapsed: false },
  { id: "progress", name: "In Progress", wip: 5, accent: "#8B5CF6", collapsed: false },
  { id: "review", name: "Review", wip: 3, accent: "#F59E0B", collapsed: false },
  { id: "done", name: "Done", wip: null, accent: "#22C55E", collapsed: false },
];

const INITIAL_TASKS = {
  backlog: [
    { id: 1, title: "Design email nurture sequence for trial users", agent: 1, priority: "P2", due: "Mar 8", labels: ["design", "feature"], description: "Create a multi-step email nurture flow for users who sign up for the free trial. Include welcome, quick-win guide, security focus, and book demo CTA emails.", checklist: [{ text: "Map user journey stages", done: true }, { text: "Write email copy for 4 emails", done: false }, { text: "Design email templates", done: false }, { text: "Set up automation triggers", done: false }], subtasks: [{ text: "Welcome email draft", done: true }, { text: "Quick-win guide email", done: false }], attachments: [{ name: "nurture_flow_v2.pdf", size: "245 KB", type: "pdf" }], comments: [{ agent: 1, text: "Initial flow mapped, starting copy.", time: "3h ago" }], blocked: null, approval: false },
    { id: 2, title: "Audit AWS cost allocation tags", agent: 0, priority: "P3", due: "Mar 12", labels: ["infra"], description: "Review and update all AWS resource tags to ensure proper cost allocation across departments.", checklist: [{ text: "Export current tag inventory", done: false }, { text: "Identify untagged resources", done: false }, { text: "Apply missing tags", done: false }], subtasks: [], attachments: [], comments: [], blocked: null, approval: false },
    { id: 3, title: "Build referral program landing page", agent: 4, priority: "P2", due: "Mar 10", labels: ["feature", "design"], description: "Create a landing page for the referral program with unique referral link generation and tracking.", checklist: [{ text: "Wireframe layout", done: true }, { text: "Hero section design", done: true }, { text: "Referral link generator", done: false }, { text: "Leaderboard component", done: false }], subtasks: [{ text: "Design hero section", done: true }, { text: "Build referral tracker", done: false }, { text: "Add social sharing", done: false }], attachments: [{ name: "referral_mockup.fig", size: "1.2 MB", type: "fig" }, { name: "copy_deck.docx", size: "34 KB", type: "doc" }], comments: [], blocked: null, approval: false },
  ],
  ready: [
    { id: 4, title: "Configure Stripe webhook for failed payments", agent: 3, priority: "P1", due: "Mar 3", labels: ["feature", "infra"], description: "Set up Stripe webhook to handle failed payment events, trigger retry logic, and send notification emails.", checklist: [{ text: "Register webhook endpoint", done: true }, { text: "Handle payment_intent.failed", done: true }, { text: "Implement retry logic", done: false }, { text: "Add email notifications", done: false }], subtasks: [], attachments: [], comments: [{ agent: 3, text: "Webhook registered. Need to implement retry.", time: "1d ago" }], blocked: null, approval: true },
    { id: 5, title: "Write security hardening checklist for docs", agent: 5, priority: "P1", due: "Mar 4", labels: ["security", "docs"], description: "Create comprehensive security hardening checklist covering server config, API security, data encryption, and access controls.", checklist: [], subtasks: [{ text: "Server hardening section", done: true }, { text: "API security section", done: false }, { text: "Data encryption section", done: false }], attachments: [], comments: [], blocked: null, approval: false },
  ],
  progress: [
    { id: 6, title: "Build checkout flow — payment integration", agent: 0, priority: "P0", due: "Mar 1", labels: ["feature"], description: "Implement the full payment processing flow including Stripe checkout session creation, webhook handling for payment confirmation, error states, and receipt generation. Must handle both Core ($499) and Executive ($899) package purchases.", checklist: [{ text: "API endpoint connected", done: true }, { text: "Error handling implemented", done: true }, { text: "Unit tests passing", done: false }, { text: "Code review approved", done: false }], subtasks: [{ text: "Create checkout session API", done: true }, { text: "Build payment UI", done: true }, { text: "Implement error states", done: false }, { text: "Add receipt generation", done: false }], attachments: [{ name: "stripe_flow.png", size: "156 KB", type: "img" }, { name: "test_results.log", size: "8 KB", type: "file" }], comments: [{ agent: 0, text: "Stripe test mode working. Moving to live keys after security review sign-off.", time: "1h ago" }, { agent: 5, text: "Security review scheduled for tomorrow. Will need API key rotation.", time: "45m ago" }], blocked: null, approval: false },
    { id: 7, title: "Launch 30-day campaign calendar", agent: 1, priority: "P0", due: "Feb 28", labels: ["feature", "design"], description: "Create and launch the 30-day marketing campaign calendar across all channels.", checklist: [{ text: "Content calendar drafted", done: true }, { text: "Assets created", done: true }, { text: "Schedule posts", done: true }, { text: "Monitor day 1 metrics", done: false }], subtasks: [], attachments: [], comments: [], blocked: null, approval: false },
    { id: 8, title: "Implement automated backup scheduler", agent: 0, priority: "P1", due: "Mar 2", labels: ["infra"], description: "Build automated backup system with configurable schedules, S3 storage, and restore verification.", checklist: [{ text: "Backup script created", done: true }, { text: "S3 integration done", done: false }, { text: "Scheduler configured", done: false }, { text: "Restore test passed", done: false }], subtasks: [], attachments: [], comments: [{ agent: 0, text: "Blocked on S3 bucket permissions. Waiting on Security Sentinel.", time: "2h ago" }], blocked: "Awaiting S3 bucket permissions from Security", approval: false },
  ],
  review: [
    { id: 9, title: "Homepage copy revision — conversion pass", agent: 4, priority: "P1", due: "Feb 27", labels: ["ux", "design"], description: "Revise homepage copy focusing on conversion optimization. A/B test headline variants.", checklist: [{ text: "Headlines rewritten", done: true }, { text: "CTA copy updated", done: true }, { text: "Social proof section", done: true }, { text: "A/B test setup", done: false }], subtasks: [], attachments: [{ name: "ab_variants.pdf", size: "89 KB", type: "pdf" }], comments: [], blocked: null, approval: true },
    { id: 10, title: "CRM pipeline stage configuration", agent: 2, priority: "P2", due: "Feb 28", labels: ["feature"], description: "Configure CRM pipeline stages to match our sales process.", checklist: [{ text: "Define stages", done: true }, { text: "Set automation rules", done: true }, { text: "Test stage transitions", done: false }], subtasks: [], attachments: [], comments: [], blocked: null, approval: false },
  ],
  done: [
    { id: 11, title: "Set up Google Analytics 4 + Tag Manager", agent: 1, priority: "P1", due: "Feb 25", labels: ["infra"], description: "Install and configure GA4 with GTM for event tracking.", checklist: [{ text: "GA4 property created", done: true }, { text: "GTM container deployed", done: true }, { text: "Custom events configured", done: true }, { text: "Goal tracking verified", done: true }], subtasks: [], attachments: [], comments: [], blocked: null, approval: false },
    { id: 12, title: "Deploy Mission Control dashboard", agent: 0, priority: "P0", due: "Feb 24", labels: ["feature", "infra"], description: "Deploy the Mission Control dashboard to production.", checklist: [{ text: "Build passing", done: true }, { text: "Staging tested", done: true }, { text: "Production deployed", done: true }, { text: "Monitoring confirmed", done: true }], subtasks: [], attachments: [], comments: [{ agent: 0, text: "Deployed successfully. All systems green.", time: "2d ago" }], blocked: null, approval: false },
  ],
};

/* ══════════════════════════════════════════════════════════════
   SMALL SHARED COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function PriorityBadge({ priority }) {
  const p = PRIORITY[priority];
  if (!p) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: p.bg, color: p.color, lineHeight: "16px", letterSpacing: 0.5,
    }}>{p.label}</span>
  );
}

function AgentAvatar({ agent, size = 24, C }) {
  const a = AGENTS[agent] || AGENTS[0];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${a.color}, ${a.color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      flexShrink: 0, border: `1.5px solid ${a.color}44`,
    }} title={a.name}>{a.initials}</div>
  );
}

function LabelTag({ label, small }) {
  const l = LABEL_PRESETS.find(p => p.id === label);
  if (!l) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: small ? "1px 5px" : "2px 8px", borderRadius: 9999,
      fontSize: small ? 9 : 10, fontWeight: 600,
      background: `${l.color}18`, color: l.color,
      border: `1px solid ${l.color}30`, whiteSpace: "nowrap",
    }}>
      <span style={{ width: small ? 4 : 5, height: small ? 4 : 5, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
      {l.name}
    </span>
  );
}

function AttachmentIcon({ type }) {
  const icons = { pdf: "📄", doc: "📝", fig: "🎨", img: "🖼", file: "📎" };
  return <span style={{ fontSize: 11 }}>{icons[type] || "📎"}</span>;
}

/* ══════════════════════════════════════════════════════════════
   TASK CARD (with drag support and inline expand)
   ══════════════════════════════════════════════════════════════ */

function TaskCard({ task, C, isDark, onOpen, onDragStart, onDragEnd, expanded, onToggleExpand, onChecklistToggle, onSubtaskToggle }) {
  const [hovered, setHovered] = useState(false);
  const checkDone = task.checklist.filter(c => c.done).length;
  const checkTotal = task.checklist.length;
  const subDone = task.subtasks.filter(s => s.done).length;
  const subTotal = task.subtasks.length;
  const hasExtras = checkTotal > 0 || subTotal > 0 || task.attachments.length > 0 || task.comments.length > 0;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", JSON.stringify({ taskId: task.id }));
        e.target.style.opacity = "0.4";
        onDragStart(task.id);
      }}
      onDragEnd={(e) => {
        e.target.style.opacity = "1";
        onDragEnd();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.elevated : C.surface,
        border: `1px solid ${task.blocked ? "rgba(239,68,68,0.25)" : hovered ? C.borderLight : C.border}`,
        borderRadius: 8, padding: "12px 14px", cursor: "grab",
        transition: "all 0.15s ease",
        boxShadow: hovered ? C.cardHover : C.cardShadow,
        borderLeft: task.blocked ? `3px solid ${C.red}` : `3px solid transparent`,
        position: "relative", userSelect: "none",
      }}
    >
      {/* Top row: labels + priority */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 6 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          {task.labels.slice(0, 3).map(l => <LabelTag key={l} label={l} small />)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 9999,
            background: task.blocked ? "rgba(239,68,68,0.14)" : task.approval ? "rgba(245,158,11,0.14)" : "rgba(59,130,246,0.14)",
            color: task.blocked ? C.red : task.approval ? C.amber : C.blue,
            border: `1px solid ${task.blocked ? "rgba(239,68,68,0.30)" : task.approval ? "rgba(245,158,11,0.30)" : "rgba(59,130,246,0.30)"}`,
          }}>{task.blocked ? "BLOCKED" : task.approval ? "APPROVAL" : "RUN"}</span>
          <PriorityBadge priority={task.priority} />
          {task.approval && (
            <div style={{
              width: 18, height: 18, borderRadius: 4,
              background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: C.amber,
            }} title="Approval Required">⛨</div>
          )}
        </div>
      </div>

      {/* Title */}
      <div
        onClick={(e) => { e.stopPropagation(); onOpen(task); }}
        data-clickable="true"
        style={{
          fontSize: 13, fontWeight: 600, color: C.text, lineHeight: "18px",
          marginBottom: 8, cursor: "pointer", borderRadius: 4, padding: "1px 2px",
        }}
      >{task.title}</div>

      {/* Blocked banner */}
      {task.blocked && (
        <div style={{
          display: "flex", alignItems: "center", gap: 5, marginBottom: 8,
          padding: "4px 8px", borderRadius: 6,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
        }}>
          <span style={{ fontSize: 9, color: C.red }}>⚠</span>
          <span style={{ fontSize: 10, color: C.red, fontWeight: 500, lineHeight: "14px" }}>{task.blocked}</span>
        </div>
      )}

      {/* Inline expanded content */}
      {expanded && (
        <div style={{ marginBottom: 8 }}>
          {/* Checklist inline */}
          {checkTotal > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Checklist</span>
                <span style={{ fontSize: 9, color: C.textSec }}>{checkDone}/{checkTotal}</span>
              </div>
              <div style={{ height: 2, background: C.border, borderRadius: 1, marginBottom: 4 }}>
                <div style={{ height: "100%", width: `${checkTotal ? (checkDone / checkTotal) * 100 : 0}%`, background: C.blue, borderRadius: 1, transition: "width 0.3s ease" }} />
              </div>
              {task.checklist.map((item, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); onChecklistToggle(task.id, i); }} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "3px 0", cursor: "pointer",
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                    border: item.done ? "none" : `1.5px solid ${C.borderLight}`,
                    background: item.done ? C.blue : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, color: "#fff", transition: "all 0.15s ease",
                  }}>{item.done ? "✓" : ""}</div>
                  <span style={{
                    fontSize: 11, color: item.done ? C.textMuted : C.textSec,
                    textDecoration: item.done ? "line-through" : "none",
                  }}>{item.text}</span>
                </div>
              ))}
            </div>
          )}
          {/* Subtasks inline */}
          {subTotal > 0 && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Subtasks</span>
              <span style={{ fontSize: 9, color: C.textSec, marginLeft: 6 }}>{subDone}/{subTotal}</span>
              {task.subtasks.map((sub, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); onSubtaskToggle(task.id, i); }} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "3px 0", cursor: "pointer",
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                    border: sub.done ? "none" : `1.5px solid ${C.borderLight}`,
                    background: sub.done ? C.green : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, color: "#fff", transition: "all 0.15s ease",
                  }}>{sub.done ? "✓" : ""}</div>
                  <span style={{
                    fontSize: 11, color: sub.done ? C.textMuted : C.textSec,
                    textDecoration: sub.done ? "line-through" : "none",
                  }}>{sub.text}</span>
                </div>
              ))}
            </div>
          )}
          {/* Attachments inline */}
          {task.attachments.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
              {task.attachments.map((att, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                  borderRadius: 5, background: C.elevated, border: `1px solid ${C.border}`,
                  fontSize: 10, color: C.textSec,
                }}>
                  <AttachmentIcon type={att.type} />{att.name}<span style={{ color: C.textMuted }}>({att.size})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom row: agent, due date, indicators */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AgentAvatar agent={task.agent} size={20} C={C} />
          <span style={{ fontSize: 10, color: C.textMuted }}>📅 {task.due}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Expand toggle */}
          {hasExtras && (
            <span onClick={(e) => { e.stopPropagation(); onToggleExpand(task.id); }} data-clickable="true" style={{
              fontSize: 10, color: C.textMuted, cursor: "pointer", padding: "2px 4px", borderRadius: 3,
              background: expanded ? C.blueGlow : "transparent",
            }} title={expanded ? "Collapse" : "Expand"}>
              {expanded ? "▾" : "▸"}
            </span>
          )}
          {/* Indicators */}
          {checkTotal > 0 && (
            <span style={{ fontSize: 10, color: checkDone === checkTotal ? C.green : C.textMuted, display: "flex", alignItems: "center", gap: 2 }}>
              ☑ {checkDone}/{checkTotal}
            </span>
          )}
          {subTotal > 0 && (
            <span style={{ fontSize: 10, color: subDone === subTotal ? C.green : C.textMuted, display: "flex", alignItems: "center", gap: 2 }}>
              ⊟ {subDone}/{subTotal}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span style={{ fontSize: 10, color: C.textMuted }}>📎 {task.attachments.length}</span>
          )}
          {task.comments.length > 0 && (
            <span style={{ fontSize: 10, color: C.textMuted }}>💬 {task.comments.length}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   KANBAN COLUMN (with drop target + management)
   ══════════════════════════════════════════════════════════════ */

function KanbanColumn({ column, tasks, C, isDark, onCardOpen, onDragStart, onDragEnd,
  dragTaskId, onDropTask, expandedTasks, onToggleExpand,
  onChecklistToggle, onSubtaskToggle, onAddCard, onDeleteColumn, onEditColumn, onCollapseToggle,
  onColumnDragStart, onColumnDragOver, onColumnDrop, onColumnDragEnd, isColumnDragOver }) {

  const [dragOver, setDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState(-1);
  const [editingName, setEditingName] = useState(false);
  const [colName, setColName] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);
  const nameRef = useRef(null);
  const colRef = useRef(null);

  useEffect(() => { if (editingName && nameRef.current) nameRef.current.focus(); }, [editingName]);

  const count = tasks.length;
  const wipOver = column.wip && count >= column.wip;
  const wipWarn = column.wip && count >= column.wip - 1 && !wipOver;
  const columnTint = hexToRgba(column.accent, isDark ? 0.08 : 0.12);
  const columnHeaderTint = hexToRgba(column.accent, isDark ? 0.1 : 0.16);
  const columnBorderTint = hexToRgba(column.accent, isDark ? 0.24 : 0.3);

  const handleDragOver = (e) => {
    if (dragTaskId == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
    // Calculate drop position
    if (colRef.current) {
      const cards = colRef.current.querySelectorAll("[data-card]");
      let idx = cards.length;
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) { idx = i; break; }
      }
      setDropIndex(idx);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setDropIndex(-1);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.taskId == null) return;
      onDropTask(data.taskId, column.id, dropIndex);
    } catch {}
  };

  if (column.collapsed) {
    return (
      <div
        onClick={() => onCollapseToggle(column.id)}
        data-clickable="true"
        className="kanban-column-surface"
        onDragOver={(e) => onColumnDragOver(e, column.id)}
        onDrop={(e) => onColumnDrop(e, column.id)}
        style={{
          width: 42, flexShrink: 0, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 8, paddingTop: 16,
          background: columnTint, borderRadius: 8,
          border: isColumnDragOver ? `1px solid ${C.blue}` : `1px solid ${columnBorderTint}`,
        }}
      >
        <div style={{ width: 3, height: 16, borderRadius: 2, background: column.accent }} />
        <span style={{
          writingMode: "vertical-lr", fontSize: 11, fontWeight: 700,
          color: C.text, letterSpacing: 1, textTransform: "uppercase",
        }}>{column.name}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: C.textMuted, background: C.elevated,
          borderRadius: 6, padding: "2px 6px",
        }}>{count}</span>
      </div>
    );
  }

  return (
    <div
      className="kanban-column-surface"
      onDragOver={(e) => onColumnDragOver(e, column.id)}
      onDrop={(e) => onColumnDrop(e, column.id)}
      style={{
        flex: 1, minWidth: 270, maxWidth: 340, display: "flex", flexDirection: "column",
        background: columnTint,
        border: isColumnDragOver ? `1px solid ${C.blue}` : `1px solid ${columnBorderTint}`,
        padding: 8,
      }}
    >
      {/* Column header */}
      <div
        draggable
        onDragStart={(e) => onColumnDragStart(e, column.id)}
        onDragEnd={onColumnDragEnd}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 6px 10px", position: "relative", borderRadius: 8,
          background: columnHeaderTint, cursor: "grab",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: column.accent }} />
          {editingName ? (
            <input
              ref={nameRef}
              value={colName}
              onChange={(e) => setColName(e.target.value)}
              onBlur={() => { onEditColumn(column.id, colName); setEditingName(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { onEditColumn(column.id, colName); setEditingName(false); } if (e.key === "Escape") { setColName(column.name); setEditingName(false); } }}
              style={{
                fontSize: 12, fontWeight: 700, color: C.text, background: C.elevated,
                border: `1px solid ${C.blue}`, borderRadius: 4, padding: "2px 6px",
                outline: "none", textTransform: "uppercase", letterSpacing: 1, width: 120,
              }}
            />
          ) : (
            <span
              onDoubleClick={() => setEditingName(true)}
              style={{
                fontSize: 12, fontWeight: 700, color: C.text,
                textTransform: "uppercase", letterSpacing: 1, cursor: "default",
              }}
            >{column.name}</span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 600, color: C.textMuted,
            background: C.elevated, borderRadius: 6, padding: "1px 7px",
          }}>{count}</span>
          {column.wip && (
            <span style={{
              fontSize: 9, fontWeight: 600, padding: "2px 5px", borderRadius: 4,
              background: wipOver ? "rgba(239,68,68,0.12)" : wipWarn ? "rgba(245,158,11,0.12)" : "transparent",
              color: wipOver ? C.red : wipWarn ? C.amber : C.textMuted,
              border: `1px solid ${wipOver ? "rgba(239,68,68,0.2)" : wipWarn ? "rgba(245,158,11,0.2)" : "transparent"}`,
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            }}>WIP {count}/{column.wip}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            onClick={() => onCollapseToggle(column.id)}
            style={{
              width: 22, height: 22, borderRadius: 4, border: "none",
              background: "transparent", color: C.textMuted, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
            }}
            title="Collapse column"
          >▸</button>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: 22, height: 22, borderRadius: 4, border: "none",
                background: showMenu ? C.elevated : "transparent",
                color: C.textMuted, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
              }}
            >⋯</button>
            {showMenu && (
              <div style={{
                position: "absolute", top: 26, right: 0, width: 160, zIndex: 50,
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)", padding: 4, overflow: "hidden",
              }}>
                {[
                  { label: "✏ Rename", action: () => { setEditingName(true); setShowMenu(false); } },
                  { label: "📐 Set WIP Limit", action: () => setShowMenu(false) },
                  { label: column.collapsed ? "◉ Expand" : "◎ Collapse", action: () => { onCollapseToggle(column.id); setShowMenu(false); } },
                  { label: "🗑 Delete Column", action: () => { onDeleteColumn(column.id); setShowMenu(false); }, danger: true },
                ].map((item, i) => (
                  <button key={i} onClick={item.action} style={{
                    display: "block", width: "100%", padding: "8px 12px", border: "none",
                    background: "transparent", color: item.danger ? C.red : C.textSec,
                    fontSize: 12, textAlign: "left", cursor: "pointer", borderRadius: 4,
                  }}
                  onMouseEnter={e => e.target.style.background = C.elevated}
                  onMouseLeave={e => e.target.style.background = "transparent"}
                  >{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Column body (drop target) */}
      <div
        ref={colRef}
        className="kanban-drop-target"
        data-drag-over={dragOver ? "true" : "false"}
        onDragOver={handleDragOver}
        onDragLeave={() => { setDragOver(false); setDropIndex(-1); }}
        onDrop={handleDrop}
        style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 8,
          padding: "6px", minHeight: 120, borderRadius: 8,
          background: dragOver ? C.dropTarget : hexToRgba(column.accent, isDark ? 0.04 : 0.07),
          border: dragOver ? `2px dashed ${C.dropBorder}` : `2px dashed ${hexToRgba(column.accent, isDark ? 0.22 : 0.28)}`,
          transition: "all 0.2s ease",
          overflowY: "auto",
        }}
      >
        {tasks.map((task, i) => (
          <div key={task.id} data-card style={{ position: "relative" }}>
            {dragOver && dropIndex === i && (
              <div style={{ height: 3, background: C.blue, borderRadius: 2, marginBottom: 4, transition: "all 0.15s ease" }} />
            )}
            <TaskCard
              task={task} C={C} isDark={isDark}
              onOpen={onCardOpen}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              expanded={expandedTasks.has(task.id)}
              onToggleExpand={onToggleExpand}
              onChecklistToggle={onChecklistToggle}
              onSubtaskToggle={onSubtaskToggle}
            />
          </div>
        ))}
        {dragOver && dropIndex === tasks.length && (
          <div style={{ height: 3, background: C.blue, borderRadius: 2, marginBottom: 4 }} />
        )}
        <button
          onClick={() => onAddCard(column.id)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px", borderRadius: 8,
            border: `1px dashed ${C.border}`, background: "transparent",
            color: C.textMuted, fontSize: 12, fontWeight: 500, cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => { e.target.style.borderColor = C.blue; e.target.style.color = C.blue; }}
          onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}
        >+ Add card</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TASK DETAIL DRAWER (full featured)
   ══════════════════════════════════════════════════════════════ */

function TaskDrawer({ task, C, isDark, onClose, onUpdate, columns, currentColId, onStartRun, onPauseRun, onRequestApproval, onCompleteRun, onArchive }) {
  const [comment, setComment] = useState("");
  const [newChecklist, setNewChecklist] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [showAttachForm, setShowAttachForm] = useState(false);
  const [attachName, setAttachName] = useState("");
  const [descDraft, setDescDraft] = useState(task?.description || "");

  if (!task) return null;
  const agent = AGENTS[task.agent] || AGENTS[0];
  const checkDone = task.checklist.filter(c => c.done).length;
  const checkTotal = task.checklist.length;
  const subDone = task.subtasks.filter(s => s.done).length;
  const subTotal = task.subtasks.length;

  useEffect(() => {
    setDescDraft(task.description || "");
  }, [task.id, task.description]);

  const toggleChecklist = (idx) => {
    const updated = { ...task, checklist: task.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c) };
    onUpdate(updated);
  };
  const toggleSubtask = (idx) => {
    const updated = { ...task, subtasks: task.subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s) };
    onUpdate(updated);
  };
  const addChecklist = () => {
    if (!newChecklist.trim()) return;
    onUpdate({ ...task, checklist: [...task.checklist, { text: newChecklist.trim(), done: false }] });
    setNewChecklist("");
  };
  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    onUpdate({ ...task, subtasks: [...task.subtasks, { text: newSubtask.trim(), done: false }] });
    setNewSubtask("");
  };
  const removeChecklist = (idx) => onUpdate({ ...task, checklist: task.checklist.filter((_, i) => i !== idx) });
  const removeSubtask = (idx) => onUpdate({ ...task, subtasks: task.subtasks.filter((_, i) => i !== idx) });
  const addComment = () => {
    if (!comment.trim()) return;
    onUpdate({ ...task, comments: [...task.comments, { agent: 0, text: comment.trim(), time: "Just now" }] });
    setComment("");
  };
  const addAttachment = () => {
    if (!attachName.trim()) return;
    onUpdate({ ...task, attachments: [...task.attachments, { name: attachName.trim(), size: "— KB", type: "file" }] });
    setAttachName("");
    setShowAttachForm(false);
  };
  const removeAttachment = (idx) => onUpdate({ ...task, attachments: task.attachments.filter((_, i) => i !== idx) });

  const inputStyle = {
    flex: 1, padding: "6px 10px", borderRadius: 6,
    border: `1px solid ${C.border}`, background: C.bg,
    color: C.text, fontSize: 12, outline: "none",
  };
  const miniBtn = (color) => ({
    padding: "6px 12px", borderRadius: 6, border: "none",
    background: color, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0,
  });

  return (
    <div style={{
      width: "min(760px, 92vw)",
      maxHeight: "88vh",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.55)" : "0 14px 40px rgba(0,0,0,0.16)",
      display: "flex",
      flexDirection: "column",
      zIndex: 320,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <PriorityBadge priority={task.priority} />
          {task.labels.map(l => <LabelTag key={l} label={l} />)}
        </div>
        <button onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
          background: C.elevated, color: C.textSec, cursor: "pointer", fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 6px", lineHeight: "24px" }}>{task.title}</h3>
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 9999,
            background: task.blocked ? "rgba(239,68,68,0.12)" : task.approval ? "rgba(245,158,11,0.12)" : currentColId === "progress" ? "rgba(59,130,246,0.12)" : currentColId === "done" ? "rgba(34,197,94,0.14)" : "rgba(92,99,112,0.2)",
            color: task.blocked ? C.red : task.approval ? C.amber : currentColId === "progress" ? C.blue : currentColId === "done" ? C.green : C.textMuted,
            border: `1px solid ${task.blocked ? "rgba(239,68,68,0.25)" : task.approval ? "rgba(245,158,11,0.25)" : currentColId === "progress" ? "rgba(59,130,246,0.25)" : currentColId === "done" ? "rgba(34,197,94,0.25)" : C.border}`,
          }}>
            {task.blocked ? "Blocked" : task.approval ? "Awaiting Approval" : currentColId === "progress" ? "Running" : currentColId === "done" ? "Completed" : "Queued"}
          </span>
        </div>
        {task.blocked && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5, marginBottom: 12,
            padding: "6px 10px", borderRadius: 6,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
          }}>
            <span style={{ fontSize: 11, color: C.red }}>⚠</span>
            <span style={{ fontSize: 12, color: C.red, fontWeight: 500 }}>{task.blocked}</span>
          </div>
        )}

        {/* Meta grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          <div style={{ background: C.elevated, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>Agent</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AgentAvatar agent={task.agent} size={24} C={C} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{agent.name}</div>
                <div style={{ fontSize: 9, color: C.textMuted }}>{agent.model}</div>
              </div>
            </div>
          </div>
          <div style={{ background: C.elevated, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>Due</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{task.due}</div>
            <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>Column: {columns.find(c => c.id === currentColId)?.name}</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700 }}>Description</div>
            <button
              onClick={() => onUpdate({ ...task, description: descDraft.trim() })}
              style={{ ...miniBtn(C.blue), padding: "4px 10px", fontSize: 10 }}
            >
              Save
            </button>
          </div>
          <textarea
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              fontSize: 12,
              color: C.textSec,
              lineHeight: "19px",
              padding: 10,
              background: C.elevated,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
            placeholder="Add task description..."
          />
        </div>

        {/* Checklist */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700 }}>Checklist</div>
            {checkTotal > 0 && <span style={{ fontSize: 10, color: checkDone === checkTotal ? C.green : C.textSec }}>{checkDone}/{checkTotal}</span>}
          </div>
          {checkTotal > 0 && (
            <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(checkDone / checkTotal) * 100}%`, background: checkDone === checkTotal ? C.green : C.blue, borderRadius: 2, transition: "width 0.3s ease" }} />
            </div>
          )}
          {task.checklist.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", group: true }}>
              <div onClick={() => toggleChecklist(i)} style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                border: item.done ? "none" : `1.5px solid ${C.borderLight}`,
                background: item.done ? C.blue : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: "#fff", transition: "all 0.15s ease",
              }}>{item.done ? "✓" : ""}</div>
              <span style={{ fontSize: 12, color: item.done ? C.textMuted : C.text, textDecoration: item.done ? "line-through" : "none", flex: 1 }}>{item.text}</span>
              <button onClick={() => removeChecklist(i)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 10, padding: 2, opacity: 0.5 }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input value={newChecklist} onChange={e => setNewChecklist(e.target.value)} onKeyDown={e => e.key === "Enter" && addChecklist()} placeholder="Add checklist item..." style={inputStyle} />
            <button onClick={addChecklist} style={miniBtn(C.blue)}>Add</button>
          </div>
        </div>

        {/* Subtasks */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700 }}>Subtasks</div>
            {subTotal > 0 && <span style={{ fontSize: 10, color: subDone === subTotal ? C.green : C.textSec }}>{subDone}/{subTotal}</span>}
          </div>
          {task.subtasks.map((sub, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
              <div onClick={() => toggleSubtask(i)} style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                border: sub.done ? "none" : `1.5px solid ${C.borderLight}`,
                background: sub.done ? C.green : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: "#fff", transition: "all 0.15s ease",
              }}>{sub.done ? "✓" : ""}</div>
              <span style={{ fontSize: 12, color: sub.done ? C.textMuted : C.text, textDecoration: sub.done ? "line-through" : "none", flex: 1 }}>{sub.text}</span>
              <button onClick={() => removeSubtask(i)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 10, padding: 2, opacity: 0.5 }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubtask()} placeholder="Add subtask..." style={inputStyle} />
            <button onClick={addSubtask} style={miniBtn(C.green)}>Add</button>
          </div>
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700 }}>Attachments</div>
            <button onClick={() => setShowAttachForm(!showAttachForm)} style={{
              fontSize: 10, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600,
            }}>+ Attach</button>
          </div>
          {task.attachments.map((att, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
              borderRadius: 6, background: C.elevated, border: `1px solid ${C.border}`, marginBottom: 4,
            }}>
              <AttachmentIcon type={att.type} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{att.name}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>{att.size}</div>
              </div>
              <button onClick={() => removeAttachment(i)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 11 }}>✕</button>
            </div>
          ))}
          {showAttachForm && (
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <input value={attachName} onChange={e => setAttachName(e.target.value)} onKeyDown={e => e.key === "Enter" && addAttachment()} placeholder="filename.ext" style={inputStyle} />
              <button onClick={addAttachment} style={miniBtn(C.teal)}>Add</button>
            </div>
          )}
        </div>

        {/* Comments */}
        <div>
          <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 700 }}>Activity</div>
          {task.comments.map((c, i) => (
            <div key={i} style={{
              padding: 10, background: C.elevated, borderRadius: 8,
              border: `1px solid ${C.border}`, marginBottom: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <AgentAvatar agent={c.agent} size={18} C={C} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{AGENTS[c.agent]?.name}</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: "17px" }}>{c.text}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} placeholder="Add a comment..." style={inputStyle} />
            <button onClick={addComment} style={miniBtn(C.blue)}>Send</button>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{
        padding: "12px 20px", borderTop: `1px solid ${C.border}`,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0,
      }}>
        <button onClick={() => onStartRun(task.id)} style={{
          padding: "8px", borderRadius: 6, border: `1px solid ${C.blue}33`,
          background: `${C.blue}20`, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>Start Run</button>
        <button onClick={() => onPauseRun(task.id)} style={{
          padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`,
          background: C.elevated, color: C.textSec, fontSize: 12, fontWeight: 500, cursor: "pointer",
        }}>Pause</button>
        <button onClick={() => onRequestApproval(task.id)} style={{
          padding: "8px", borderRadius: 6, border: `1px solid ${C.amber}44`,
          background: `${C.amber}1a`, color: C.amber, fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>Request Approval</button>
        <button onClick={() => onCompleteRun(task.id)} style={{
          padding: "8px", borderRadius: 6, border: "none",
          background: C.green, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>Complete</button>
        <button onClick={() => onArchive(task.id)} style={{
          gridColumn: "1 / span 2",
          padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`,
          background: C.elevated, color: C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>Archive Task</button>
      </div>
    </div>
  );
}

function ArchivedTasksModal({ C, isDark, archivedTasks, columns, onClose, onRestore }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.58)" : "rgba(15,23,42,0.34)", zIndex: 260,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(760px, 92vw)", maxHeight: "84vh", overflow: "hidden",
        background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
        boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.55)" : "0 14px 40px rgba(0,0,0,0.16)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Archived Tasks</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{archivedTasks.length} archived</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {archivedTasks.length === 0 ? (
            <div style={{ fontSize: 12, color: C.textMuted }}>No archived tasks yet.</div>
          ) : archivedTasks.map((t) => (
            <div key={t.id} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: C.elevated, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>
                    From: {columns.find((c) => c.id === t.sourceColId)?.name || t.sourceColId || 'Unknown'} · Archived {t.archivedAt ? new Date(t.archivedAt).toLocaleString() : ''}
                  </div>
                </div>
                <button onClick={() => onRestore(t.id, t.sourceColId || 'ready')} style={{ padding: "7px 10px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Restore</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADD CARD MODAL
   ══════════════════════════════════════════════════════════════ */

function AddCardModal({ C, isDark, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("P2");
  const [agent, setAgent] = useState(0);
  const [desc, setDesc] = useState("");
  const [labels, setLabels] = useState([]);

  const toggleLabel = (id) => setLabels(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, maxHeight: "80vh", background: C.surface, borderRadius: 12,
        border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>New Card</span>
          <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} placeholder="What needs to be done?" autoFocus />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box" }} placeholder="Additional context..." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Priority</label>
              <div style={{ display: "flex", gap: 4 }}>
                {Object.entries(PRIORITY).map(([k, v]) => (
                  <button key={k} onClick={() => setPriority(k)} style={{
                    flex: 1, padding: "6px", borderRadius: 4, border: priority === k ? `2px solid ${v.bg}` : `1px solid ${C.border}`,
                    background: priority === k ? `${v.bg}22` : C.elevated, color: v.bg === "#3B4048" ? C.textSec : v.bg,
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}>{k}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Agent</label>
              <select value={agent} onChange={e => setAgent(Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, outline: "none" }}>
                {AGENTS.map((a, i) => <option key={i} value={i}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Labels</label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {LABEL_PRESETS.map(l => (
                <button key={l.id} onClick={() => toggleLabel(l.id)} style={{
                  padding: "4px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 600, cursor: "pointer",
                  background: labels.includes(l.id) ? `${l.color}25` : C.elevated,
                  border: labels.includes(l.id) ? `1.5px solid ${l.color}` : `1px solid ${C.border}`,
                  color: labels.includes(l.id) ? l.color : C.textSec,
                }}>{l.name}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => {
            if (!title.trim()) return;
            onSave({ id: uid(), title: title.trim(), agent, priority, due: "TBD", labels, description: desc, checklist: [], subtasks: [], attachments: [], comments: [], blocked: null, approval: false });
            onClose();
          }} style={{ padding: "9px 18px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: title.trim() ? 1 : 0.4 }}>Create Card</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADD COLUMN MODAL
   ══════════════════════════════════════════════════════════════ */

function AddColumnModal({ C, onClose, onSave }) {
  const [name, setName] = useState("");
  const [accent, setAccent] = useState("#3B82F6");
  const [wip, setWip] = useState("");
  const colors = ["#5C6370", "#3B82F6", "#8B5CF6", "#F59E0B", "#22C55E", "#EF4444", "#EC4899", "#06B6D4", "#F97316"];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, background: C.surface, borderRadius: 12,
        border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>New Column</span>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} placeholder="e.g., QA Testing" autoFocus />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Color</label>
            <div style={{ display: "flex", gap: 6 }}>
              {colors.map(c => (
                <div key={c} onClick={() => setAccent(c)} style={{
                  width: 24, height: 24, borderRadius: 6, background: c, cursor: "pointer",
                  border: accent === c ? "2px solid #fff" : "2px solid transparent",
                  boxShadow: accent === c ? `0 0 0 2px ${c}` : "none",
                }} />
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>WIP Limit (optional)</label>
            <input type="number" value={wip} onChange={e => setWip(e.target.value)} style={{ width: 80, padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, outline: "none" }} placeholder="∞" />
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => {
            if (!name.trim()) return;
            onSave({ id: `col_${uid()}`, name: name.trim(), wip: wip ? parseInt(wip) : null, accent, collapsed: false });
            onClose();
          }} style={{ padding: "9px 18px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: name.trim() ? 1 : 0.4 }}>Create Column</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHARED SHELL COMPONENTS
   ══════════════════════════════════════════════════════════════ */

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

function ThemeToggle({ themeMode, setThemeMode }) {
  const isDark = themeMode !== "light";
  const current = themeMode === "trippy" ? { icon: "🪩", label: "Trippy" } : themeMode === "light" ? { icon: "☀️", label: "Light" } : { icon: "🌙", label: "Dark" };
  return (
    <div onClick={() => setThemeMode(cycleThemeMode(themeMode))} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px", borderRadius: 6, cursor: "pointer",
      background: isDark ? "rgba(59,130,246,0.08)" : "rgba(37,99,235,0.06)",
      border: "1px solid transparent", transition: "all 0.2s ease",
    }}>
      <span style={{ fontSize: 13, lineHeight: 1 }}>{current.icon}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: isDark ? "#8B919E" : "#5C6370" }}>{current.label}</span>
      <div style={{
        width: 30, height: 16, borderRadius: 8, position: "relative",
        background: isDark ? "#3B82F6" : "#CBD5E1", transition: "background 0.2s ease", flexShrink: 0,
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 2, left: isDark ? 16 : 2,
          transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
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
                const m = { 'start-here': '/start-here',  chat: '/chat',   brainstorm: '/brainstorm', brainstorming: '/brainstorm', tasks: '/boards', agentarmy: '/army', configurator: '/configurator?step=1', security: '/security', integrations: '/integrations', costusage: '/costs', settings: '/settings', development: '/development', activitylog: '/activity-log', 'activity log': '/activity-log', approvals: '/approvals', files: '/files' };
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
        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
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

const API_STATUS_TO_COLUMN = {
  inbox: 'backlog',
  todo: 'ready',
  in_progress: 'progress',
  review: 'review',
  done: 'done',
};

function mapApiStatusToColumn(status) {
  return API_STATUS_TO_COLUMN[String(status || '').toLowerCase()] || 'ready';
}

function mapApiPriorityToUi(priority) {
  const p = String(priority || '').toLowerCase();
  if (p === 'urgent' || p === 'critical') return 'P0';
  if (p === 'high') return 'P1';
  if (p === 'low') return 'P3';
  return 'P2';
}

function normalizeApiTask(task, idx = 0) {
  return {
    id: task.id || `api-${idx}-${Date.now()}`,
    title: task.title || 'Untitled task',
    agent: 0,
    priority: mapApiPriorityToUi(task.priority),
    due: task.due_at ? new Date(task.due_at).toLocaleDateString() : '—',
    labels: [],
    description: task.description || '',
    checklist: [],
    subtasks: [],
    attachments: [],
    comments: [],
    blocked: task.is_blocked ? 'Blocked by dependency' : null,
    approval: String(task.status || '').toLowerCase() === 'review',
  };
}

function buildTasksFromApi(items = []) {
  const mapped = { backlog: [], ready: [], progress: [], review: [], done: [] };
  (Array.isArray(items) ? items : []).forEach((task, idx) => {
    const colId = mapApiStatusToColumn(task.status);
    mapped[colId] = mapped[colId] || [];
    mapped[colId].push(normalizeApiTask(task, idx));
  });
  return mapped;
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════════ */

export default function ClawForgeKanban() {
  const { store, client } = useMissionControl();
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const isDark = themeMode !== "light";
  useEffect(() => { persistThemeMode(themeMode); }, [themeMode]);
  const C = getTheme(themeMode);

  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeBoardId, setActiveBoardId] = useState(store.boards.boardId || '');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColId, setSelectedColId] = useState(null);
  const [dragTaskId, setDragTaskId] = useState(null);
  const [dragColumnId, setDragColumnId] = useState(null);
  const [columnDragOverId, setColumnDragOverId] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [addCardCol, setAddCardCol] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [opMessage, setOpMessage] = useState('');
  const [connectionInfo, setConnectionInfo] = useState(() => client.getConnectionState());
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true });
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    let t;
    if (collapsedSections.SYSTEM === undefined || collapsedSections.SYSTEM === true) return;
    t = setTimeout(() => setCollapsedSections((p) => ({ ...p, SYSTEM: true })), 12000);
    return () => t && clearTimeout(t);
  }, [collapsedSections.SYSTEM]);

  useEffect(() => {
    const seededTasks = Object.keys(store.boards.tasks || {}).length ? store.boards.tasks : INITIAL_TASKS;
    setTasks(seededTasks);
    setColumns((store.boards.columns || []).length ? store.boards.columns : INITIAL_COLUMNS);
    setArchivedTasks(Array.isArray(store.boards.archived) ? store.boards.archived : []);
    setFilterPriority(store.boards.filters?.priority || 'all');
    setFilterAgent(store.boards.filters?.agent || 'all');
    setSearchQuery(store.boards.filters?.search || '');

    const loadBoard = async () => {
      if (activeBoardId && activeBoardId !== 'product-launch') {
        const directResp = await client.run('oc.board.get', { boardId: activeBoardId });
        if (directResp?.ok && Array.isArray(directResp.data?.items) && directResp.data.items[0]?.status) {
          setTasks(buildTasksFromApi(directResp.data.items));
          setOpMessage(formatOpSuccess('Board loaded', directResp));
          return;
        }
      }

      const boardsResp = await client.run('oc.board.get', {});
      const boards = boardsResp?.data?.items;
      if (!boardsResp?.ok || !Array.isArray(boards) || boards.length === 0) {
        setOpMessage(formatOpError(boardsResp?.error, 'Failed to load boards'));
        return;
      }

      const selected = boards.find((b) => b.id === activeBoardId || b.slug === activeBoardId) || boards[0];
      setActiveBoardId(selected.id);

      const tasksResp = await client.run('oc.board.get', { boardId: selected.id });
      if (!tasksResp?.ok) {
        setOpMessage(formatOpError(tasksResp?.error, 'Failed to load tasks'));
        return;
      }
      if (Array.isArray(tasksResp.data?.items)) {
        setTasks(buildTasksFromApi(tasksResp.data.items));
        setOpMessage(formatOpSuccess(`Board loaded (${selected.name || selected.slug || selected.id})`, tasksResp));
      } else {
        setOpMessage('Board response did not include task items.');
      }
    };

    loadBoard().catch((e) => setOpMessage(`Failed to load tasks (${e?.message || 'unknown error'})`));
  }, []);

  useEffect(() => {
    client.run('oc.board.replace', { board: { ...store.boards, tasks, columns, archived: archivedTasks } });
  }, [tasks, columns, archivedTasks]);

  useEffect(() => {
    if (!selectedTask) return;
    for (const [colId, list] of Object.entries(tasks)) {
      const latest = (list || []).find((t) => t.id === selectedTask.id);
      if (latest) {
        if (latest !== selectedTask) setSelectedTask(latest);
        if (colId !== selectedColId) setSelectedColId(colId);
        return;
      }
    }
  }, [tasks, selectedTask, selectedColId]);

  useEffect(() => {
    const syncConnection = () => setConnectionInfo(client.getConnectionState());
    window.addEventListener('mc-store-updated', syncConnection);
    syncConnection();
    return () => window.removeEventListener('mc-store-updated', syncConnection);
  }, [client]);

  // Find which column a task is in
  const findTaskColumn = useCallback((taskId) => {
    for (const [colId, colTasks] of Object.entries(tasks)) {
      if (colTasks.find(t => t.id === taskId)) return colId;
    }
    return null;
  }, [tasks]);

  const triggerCelebration = useCallback((taskTitle = 'Task complete') => {
    const burst = Array.from({ length: 28 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 240,
      size: 6 + Math.floor(Math.random() * 8),
      color: [C.green, C.blue, C.purple, C.amber, C.teal][i % 5],
      rotate: Math.floor(Math.random() * 360),
    }));
    setCelebration({ title: taskTitle, burst });
    setTimeout(() => setCelebration(null), 1700);
  }, [C.green, C.blue, C.purple, C.amber, C.teal]);

  // Drag and drop
  const handleColumnDragStart = (e, columnId) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ columnId }));
    setDragColumnId(columnId);
  };

  const handleColumnDragOver = (e, targetColumnId) => {
    if (!dragColumnId) return;
    e.preventDefault();
    setColumnDragOverId(targetColumnId);
  };

  const clearColumnDrag = () => {
    setDragColumnId(null);
    setColumnDragOverId(null);
  };

  const handleColumnDrop = (e, targetColumnId) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const sourceColumnId = data.columnId;
      if (!sourceColumnId || sourceColumnId === targetColumnId) {
        clearColumnDrag();
        return;
      }
      setColumns((prev) => {
        const from = prev.findIndex((c) => c.id === sourceColumnId);
        const to = prev.findIndex((c) => c.id === targetColumnId);
        if (from < 0 || to < 0) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    } catch {}
    clearColumnDrag();
  };

  const applyColumnSemantics = useCallback((task, targetColId) => {
    const base = { ...task };
    if (targetColId === "review") return { ...base, approval: true };
    if (targetColId === "progress") return { ...base, blocked: null, approval: false };
    if (targetColId === "done") return { ...base, blocked: null, approval: false };
    return { ...base, approval: false };
  }, []);

  const handleDropTask = useCallback((taskId, targetColId, dropIndex) => {
    const sourceColId = findTaskColumn(taskId);
    if (!sourceColId) return;
    const movedToDone = sourceColId !== 'done' && targetColId === 'done';

    let rollbackState = null;
    let movedTaskTitle = 'Task complete';
    setTasks(prev => {
      rollbackState = prev;
      const next = { ...prev };
      const task = next[sourceColId].find(t => t.id === taskId);
      if (!task) return prev;
      movedTaskTitle = task.title || movedTaskTitle;
      next[sourceColId] = next[sourceColId].filter(t => t.id !== taskId);
      const targetList = [...(next[targetColId] || [])];
      const normalizedDropIndex = Number.isFinite(dropIndex) ? dropIndex : targetList.length;
      const idx = Math.max(0, Math.min(normalizedDropIndex, targetList.length));
      targetList.splice(idx, 0, applyColumnSemantics(task, targetColId));
      next[targetColId] = targetList;
      return next;
    });

    client.run('oc.board.card.move', {
      boardId: activeBoardId,
      cardId: taskId,
      fromColumnId: sourceColId,
      toColumnId: targetColId,
      toIndex: Math.max(0, Number.isFinite(dropIndex) ? dropIndex : 0),
    }).then((resp) => {
      if (!resp?.ok) {
        if (rollbackState) setTasks(rollbackState);
        setOpMessage(formatOpError(resp?.error, 'Move failed'));
      } else {
        setOpMessage(formatOpSuccess('Card moved', resp));
        if (movedToDone) triggerCelebration(movedTaskTitle);
      }
    }).catch((e) => {
      if (rollbackState) setTasks(rollbackState);
      setOpMessage(`Move failed (${e?.message || 'unknown error'})`);
    });
  }, [findTaskColumn, client, activeBoardId, applyColumnSemantics, triggerCelebration]);

  // Toggle card expand
  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  };

  // Checklist / subtask toggle from card
  const toggleChecklistFromCard = (taskId, idx) => {
    setTasks(prev => {
      const next = { ...prev };
      for (const colId of Object.keys(next)) {
        next[colId] = next[colId].map(t => {
          if (t.id !== taskId) return t;
          return { ...t, checklist: t.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c) };
        });
      }
      return next;
    });
  };

  const toggleSubtaskFromCard = (taskId, idx) => {
    setTasks(prev => {
      const next = { ...prev };
      for (const colId of Object.keys(next)) {
        next[colId] = next[colId].map(t => {
          if (t.id !== taskId) return t;
          return { ...t, subtasks: t.subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s) };
        });
      }
      return next;
    });
  };

  const moveTaskToColumn = useCallback((taskId, targetColId, patch = null) => {
    setTasks(prev => {
      const sourceColId = Object.keys(prev).find((colId) => (prev[colId] || []).some((t) => t.id === taskId));
      if (!sourceColId) return prev;
      const source = [...(prev[sourceColId] || [])];
      const idx = source.findIndex((t) => t.id === taskId);
      if (idx < 0) return prev;
      const [task] = source.splice(idx, 1);
      const updatedTask = patch ? { ...task, ...patch } : task;
      const target = [...(sourceColId === targetColId ? source : (prev[targetColId] || [])), updatedTask];
      const next = { ...prev, [sourceColId]: source, [targetColId]: target };
      return next;
    });
  }, []);

  // Update task from drawer
  const updateTask = (updated) => {
    setTasks(prev => {
      const next = { ...prev };
      for (const colId of Object.keys(next)) {
        next[colId] = next[colId].map(t => t.id === updated.id ? updated : t);
      }
      return next;
    });
    setSelectedTask(updated);
  };

  const startRun = (taskId) => {
    moveTaskToColumn(taskId, "progress", { blocked: null });
  };

  const pauseRun = (taskId) => {
    moveTaskToColumn(taskId, "ready", { approval: false });
  };

  const requestApproval = (taskId) => {
    moveTaskToColumn(taskId, "review", { approval: true });
  };

  const completeRun = (taskId) => {
    const sourceColId = findTaskColumn(taskId);
    const task = sourceColId ? (tasks[sourceColId] || []).find((t) => t.id === taskId) : null;
    moveTaskToColumn(taskId, "done", { approval: false, blocked: null });
    if (sourceColId !== 'done') triggerCelebration(task?.title || 'Task complete');
  };

  const archiveTask = async (taskId) => {
    let archivedTask = null;
    let sourceColId = null;

    for (const [colId, list] of Object.entries(tasks)) {
      const found = (list || []).find((t) => t.id === taskId);
      if (found) {
        archivedTask = found;
        sourceColId = colId;
        break;
      }
    }

    if (!archivedTask || !sourceColId) return;

    setTasks((prev) => ({
      ...prev,
      [sourceColId]: (prev[sourceColId] || []).filter((t) => t.id !== taskId),
    }));

    const payload = { boardId: activeBoardId, taskId, task: archivedTask, sourceColId };
    const resp = await client.run('oc.board.archive.task', payload);
    if (resp.ok) {
      const entry = { ...archivedTask, sourceColId, archivedAt: new Date().toISOString() };
      setArchivedTasks((prev) => [entry, ...prev]);
      setOpMessage(formatOpSuccess('Task archived', resp));
      setSelectedTask(null);
    } else {
      setTasks((prev) => ({ ...prev, [sourceColId]: [archivedTask, ...(prev[sourceColId] || [])] }));
      setOpMessage(formatOpError(resp.error, 'Archive failed'));
    }
  };

  const restoreArchivedTask = async (taskId, targetColId = 'ready') => {
    const archived = archivedTasks.find((t) => t.id === taskId);
    if (!archived) return;
    const resp = await client.run('oc.board.restore.task', { boardId: activeBoardId, taskId, targetColId, task: archived });

    if (!resp.ok) {
      setOpMessage(formatOpError(resp.error, 'Restore failed'));
      return;
    }

    setOpMessage(formatOpSuccess('Task restored', resp));
    const restoredTask = resp.data?.task || archived;
    const clean = { ...restoredTask };
    delete clean.archivedAt;
    delete clean.sourceColId;

    setArchivedTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTasks((prev) => ({ ...prev, [targetColId]: [clean, ...(prev[targetColId] || [])] }));
  };

  // Add card
  const addCard = (colId, task) => {
    setTasks(prev => ({ ...prev, [colId]: [...(prev[colId] || []), task] }));
  };

  // Column management
  const addColumn = (col) => {
    setColumns(prev => [...prev, col]);
    setTasks(prev => ({ ...prev, [col.id]: [] }));
  };
  const deleteColumn = (colId) => {
    setColumns(prev => prev.filter(c => c.id !== colId));
    setTasks(prev => { const next = { ...prev }; delete next[colId]; return next; });
  };
  const editColumn = (colId, name) => {
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, name } : c));
  };
  const toggleCollapseColumn = (colId) => {
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, collapsed: !c.collapsed } : c));
  };

  // Filtering
  const filterTasks = (taskList) => {
    return taskList.filter(t => {
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterAgent !== "all" && t.agent !== parseInt(filterAgent)) return false;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  };

  useEffect(() => {
    client.run('oc.board.view.setFilters', { boardId: activeBoardId, priority: filterPriority, agent: filterAgent, search: searchQuery })
      .then((resp) => {
        if (!resp?.ok) setOpMessage(formatOpError(resp.error, 'Failed to save filters'));
      })
      .catch((e) => setOpMessage(`Failed to save filters (${e?.message || 'unknown error'})`));
  }, [filterPriority, filterAgent, searchQuery, activeBoardId]);

  // Stats
  const allTasks = Object.values(tasks).flat();
  const totalTasks = allTasks.length;
  const doneTasks = (tasks.done || []).length;
  const blockedTasks = allTasks.filter(t => t.blocked).length;

  return (
    <div style={{
      width: "100%", height: "100vh", display: "flex",
      background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      <ScrollbarStyle C={C} />
      <Sidebar
        activePage="boards"
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        C={C}
        collapsedSections={collapsedSections}
        onToggleSection={(section) => setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Top bar */}
        <div style={{
          height: 52, flexShrink: 0, display: "flex", alignItems: "center",
          padding: "0 20px", gap: 12, borderBottom: `1px solid ${C.border}`, background: C.surface,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted }}>
            <span>Tasks</span>
            <span style={{ color: C.textMuted }}>/</span>
            <span style={{ color: C.text, fontWeight: 600 }}>Product Launch</span>
          </div>
          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.bg, width: 220,
          }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>🔍</span>
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              style={{ border: "none", background: "transparent", color: C.text, fontSize: 12, outline: "none", flex: 1 }}
            />
          </div>

          {/* Filter priority */}
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{
            padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.bg, color: C.textSec, fontSize: 11, outline: "none",
          }}>
            <option value="all">All Priority</option>
            {Object.keys(PRIORITY).map(k => <option key={k} value={k}>{k}</option>)}
          </select>

          {/* Filter agent */}
          <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)} style={{
            padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.bg, color: C.textSec, fontSize: 11, outline: "none",
          }}>
            <option value="all">All Agents</option>
            {AGENTS.map((a, i) => <option key={i} value={i}>{a.name}</option>)}
          </select>

          <button onClick={() => setShowAddColumn(true)} style={{
            padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>
            + Add Column
          </button>

          <button onClick={() => setShowArchived(true)} style={{
            padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>
            Archived ({archivedTasks.length})
          </button>

          {/* Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10 }}>
            <span style={{ color: C.green }}>✓ {doneTasks}</span>
            <span style={{ color: C.textMuted }}>/ {totalTasks}</span>
            {blockedTasks > 0 && <span style={{ color: C.red }}>⚠ {blockedTasks} blocked</span>}
          </div>
        </div>

        <div style={{ padding: "8px 20px 0", fontSize: 11, color: connectionInfo.connected ? C.green : C.amber }}>
          Live API: {connectionInfo.connected ? 'connected' : 'disconnected'}{connectionInfo.lastRequestId ? ` · requestId ${connectionInfo.lastRequestId}` : ''}
          {opMessage ? <span style={{ color: C.textMuted }}> · {opMessage}</span> : null}
        </div>

        {/* Board area */}
        <div style={{
          flex: 1, display: "flex", gap: 16, padding: "16px 20px",
          overflowX: "auto", overflowY: "hidden", alignItems: "flex-start",
        }}>
          {columns.map(col => (
            <KanbanColumn
              key={col.id} column={col} C={C} isDark={isDark}
              tasks={filterTasks(tasks[col.id] || [])}
              onCardOpen={(task) => { setSelectedTask(task); setSelectedColId(col.id); }}
              onDragStart={setDragTaskId}
              onDragEnd={() => setDragTaskId(null)}
              dragTaskId={dragTaskId}
              onDropTask={handleDropTask}
              expandedTasks={expandedTasks}
              onToggleExpand={toggleExpand}
              onChecklistToggle={toggleChecklistFromCard}
              onSubtaskToggle={toggleSubtaskFromCard}
              onAddCard={(colId) => setAddCardCol(colId)}
              onDeleteColumn={deleteColumn}
              onEditColumn={editColumn}
              onCollapseToggle={toggleCollapseColumn}
              onColumnDragStart={handleColumnDragStart}
              onColumnDragOver={handleColumnDragOver}
              onColumnDrop={handleColumnDrop}
              onColumnDragEnd={clearColumnDrag}
              isColumnDragOver={columnDragOverId === col.id}
            />
          ))}

        </div>

        {/* Centered Task Editor Modal */}
        {selectedTask && (
          <div
            onClick={() => setSelectedTask(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: isDark ? "rgba(0,0,0,0.58)" : "rgba(15,23,42,0.34)",
              backdropFilter: "blur(3px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <TaskDrawer
                task={selectedTask} C={C} isDark={isDark}
                columns={columns} currentColId={selectedColId}
                onClose={() => setSelectedTask(null)}
                onUpdate={updateTask}
                onStartRun={startRun}
                onPauseRun={pauseRun}
                onRequestApproval={requestApproval}
                onCompleteRun={completeRun}
                onArchive={archiveTask}
              />
            </div>
          </div>
        )}
      </div>

      {celebration && (
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 900,
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '18%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.96), rgba(16,185,129,0.94))',
            color: '#ecfdf5',
            borderRadius: 16,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 800,
            boxShadow: '0 16px 34px rgba(16,185,129,0.38)',
            border: '1px solid rgba(255,255,255,0.18)',
            animation: 'mcPopIn 220ms ease-out',
          }}>
            🎉 Task Complete — {celebration.title}
          </div>

          {celebration.burst.map((p) => (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.left}%`,
                top: '-5%',
                width: p.size,
                height: p.size * 1.4,
                borderRadius: 4,
                background: p.color,
                transform: `rotate(${p.rotate}deg)`,
                animation: `mcConfettiDrop 1200ms ease-out ${p.delay}ms forwards`,
                boxShadow: `0 0 10px ${p.color}99`,
              }}
            />
          ))}

          <style>{`@keyframes mcConfettiDrop { 0% { transform: translateY(-8vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(98vh) rotate(680deg); opacity: 0; } } @keyframes mcPopIn { 0% { transform: translateX(-50%) scale(.88); opacity: 0; } 100% { transform: translateX(-50%) scale(1); opacity: 1; } }`}</style>
        </div>
      )}

      {/* Modals */}
      {addCardCol && (
        <AddCardModal
          C={C} isDark={isDark}
          onClose={() => setAddCardCol(null)}
          onSave={(task) => addCard(addCardCol, task)}
        />
      )}
      {showAddColumn && (
        <AddColumnModal
          C={C}
          onClose={() => setShowAddColumn(false)}
          onSave={(col) => { addColumn(col); setShowAddColumn(false); }}
        />
      )}
      {showArchived && (
        <ArchivedTasksModal
          C={C}
          isDark={isDark}
          archivedTasks={archivedTasks}
          columns={columns}
          onClose={() => setShowArchived(false)}
          onRestore={restoreArchivedTask}
        />
      )}
    </div>
  );
}
