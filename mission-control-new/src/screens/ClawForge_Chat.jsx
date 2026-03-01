import { useState, useRef, useEffect, useMemo } from "react";
import { PRIMARY_NAV_ITEMS, SYSTEM_NAV_ITEMS } from "../lib/systemNav";
import { cycleThemeMode, getStoredThemeMode, persistThemeMode } from "../lib/themeMode";
import { createOpenClawClient } from "../lib/openclawClient";

// ─── Design tokens ─────────────────────────────────────────────────────────
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
  };
  return {
    bg: "#F4F6FA", surface: "#FFFFFF", elevated: "#F8FAFC",
    border: "#CBD5E1", borderLight: "#E2E8F0",
    text: "#0F172A", textSec: "#334155", textMuted: "#64748B",
    blue: "#2563EB", blueGlow: "rgba(37,99,235,0.10)",
    green: "#16A34A", greenGlow: "rgba(22,163,74,0.10)",
    amber: "#D97706", amberGlow: "rgba(217,119,6,0.10)",
    red: "#DC2626", redGlow: "rgba(220,38,38,0.10)",
    purple: "#7C3AED", purpleGlow: "rgba(124,58,237,0.10)",
    teal: "#0891B2", orange: "#EA580C", pink: "#DB2777",
  };
}

let C = getTheme(true);

// ─── People directory ───────────────────────────────────────────────────────
const ME = { id: "me", name: "Joseph", initials: "JC", color: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, role: "Orchestrator", status: "online" };

const PEOPLE = [
  { id: "ops",  name: "Operations CEO",    initials: "OP", color: C.blue,     role: "Operations",  status: "online"   },
  { id: "mkt",  name: "Marketing CEO",     initials: "MK", color: C.purple,   role: "Marketing",   status: "online"   },
  { id: "sales",name: "Sales CEO",         initials: "SL", color: C.green,    role: "Sales",       status: "online"   },
  { id: "fin",  name: "Finance CEO",       initials: "FN", color: C.amber,    role: "Finance",     status: "online"   },
  { id: "cx",   name: "CX CEO",            initials: "CX", color: C.teal,     role: "CX",          status: "online"   },
  { id: "sec",  name: "Security Sentinel", initials: "SS", color: C.red,      role: "Security",    status: "degraded" },
  { id: "dev",  name: "Full-Stack Dev",    initials: "FS", color: "#60A5FA",  role: "Engineering", status: "online"   },
  { id: "dv",   name: "DevOps Engineer",   initials: "DV", color: C.orange,   role: "DevOps",      status: "online"   },
  { id: "qa",   name: "QA Tester",         initials: "QA", color: "#FB923C",  role: "QA",          status: "online"   },
  { id: "cw",   name: "Content Writer",    initials: "CW", color: C.pink,     role: "Marketing",   status: "away"     },
  { id: "seo",  name: "SEO Specialist",    initials: "SE", color: "#A78BFA",  role: "Marketing",   status: "offline"  },
  { id: "cm",   name: "Community Mgr",     initials: "CM", color: "#34D399",  role: "Community",   status: "online"   },
  { id: "on",   name: "Onboarding Spec",   initials: "ON", color: "#818CF8",  role: "CX",          status: "offline"  },
];

const ALL_PEOPLE = [ME, ...PEOPLE];

function getPerson(id) { return ALL_PEOPLE.find(p => p.id === id) || ME; }

// ─── Seed conversations ─────────────────────────────────────────────────────
let _msgId = 100;
const mkMsg = (authorId, content, time, reactions = [], pinned = false, isSystem = false, delivery = null) => ({
  id: _msgId++, authorId, content, time, reactions, pinned, isSystem, delivery,
});

const INIT_CONVERSATIONS = [
  {
    id: "dm-ops", type: "dm", withId: "ops", unread: 2,
    messages: [
      mkMsg("ops",  "Morning — v1.3.2 is deployed to production. All health checks green.", "9:14 AM", [{ emoji: "✅", by: ["me"] }], true),
      mkMsg("me",   "Excellent. Any latency spikes during the rollout?", "9:16 AM"),
      mkMsg("ops",  "Brief 40ms uptick on /api/instances at 09:12, self-resolved. Staying on monitoring for the next hour.", "9:17 AM"),
      mkMsg("me",   "Good. Keep me posted if anything changes.", "9:18 AM"),
      mkMsg("ops",  "Will do. Also flagging — DevOps needs your sign-off on the staging VPC resize before EOD.", "10:44 AM", []),
      mkMsg("ops",  "Terraform plan is ready for your review.", "10:44 AM"),
    ],
  },
  {
    id: "dm-sec", type: "dm", withId: "sec", unread: 1,
    messages: [
      mkMsg("sec",  "⚠️ ALERT — Elevated scan active. Detected 14 probe attempts on port 443 from 185.220.100.0/24.", "10:08 AM", [], true),
      mkMsg("sec",  "WAF rule applied. IP range blocked. Continuing to monitor.", "10:09 AM"),
      mkMsg("me",   "Good catch. What's the confidence level on the threat classification?", "10:22 AM"),
      mkMsg("sec",  "High confidence — automated scanning pattern matches known Shodan fingerprints. No payload delivered.", "10:23 AM"),
      mkMsg("me",   "Noted. Add it to the weekly incident digest.", "10:24 AM"),
      mkMsg("sec",  "Escalation: one internal agent made an unusual API call pattern at 10:51. Investigating now.", "10:52 AM"),
    ],
  },
  {
    id: "dm-sales", type: "dm", withId: "sales", unread: 0,
    messages: [
      mkMsg("sales", "Sent the Executive Build proposal to Meridian Consulting. Following up Thursday.", "9:38 AM"),
      mkMsg("me",    "What's the deal size?", "9:45 AM"),
      mkMsg("sales", "$1,397/month — 12-month contract. Good fit for our ICP.", "9:46 AM"),
      mkMsg("me",    "Nice. What's their timeline?", "9:47 AM"),
      mkMsg("sales", "Looking to start Q2. Demo call tomorrow at 2pm.", "9:48 AM"),
      mkMsg("me",    "Put it on my calendar.", "9:49 AM"),
    ],
  },
  {
    id: "dm-mkt", type: "dm", withId: "mkt", unread: 0,
    messages: [
      mkMsg("mkt",  "Requesting approval: increase Meta Ads daily budget from $50 to $80. CPL is down 22% this week.", "10:45 AM"),
      mkMsg("me",   "Show me the breakdown first.", "10:46 AM"),
      mkMsg("mkt",  "CPL $12.40 → $9.66. CTR up to 3.8%. Leads quality score 8.2/10. ROAS 4.1x.", "10:47 AM", [{ emoji: "📈", by: ["me"] }]),
      mkMsg("me",   "Approved. Cap it at $80 for now, revisit Friday.", "10:48 AM"),
      mkMsg("mkt",  "Perfect. Launching the updated audience segment now.", "10:49 AM"),
    ],
  },
  {
    id: "grp-command", type: "group", name: "Command Center", emoji: "🎯",
    memberIds: ["me", "ops", "sec", "fin", "dv"],
    description: "Executive command channel — ops, security, infrastructure & finance leads.",
    unread: 5, pinned: ["msg-pin-1"],
    messages: [
      mkMsg("ops",  "Daily standup: All systems nominal. 3 deployments queued for today.", "8:00 AM", [], true),
      mkMsg("sec",  "Security posture: GREEN. WAF active, last scan 07:45, 0 critical findings.", "8:01 AM"),
      mkMsg("fin",  "Daily cash position: $47,200. 3 invoices pending ($2,841 total). Stripe MRR: $14,280.", "8:02 AM"),
      mkMsg("me",   "Good morning all. Priorities today: v1.3.2 release, Meta budget review, Meridian proposal.", "8:15 AM"),
      mkMsg("dv",   "Staging VPC resize plan is ready. Needs Orchestrator sign-off before I can apply.", "9:30 AM"),
      mkMsg("ops",  "v1.3.2 deployed successfully at 09:12. All health checks green.", "9:20 AM", [{ emoji: "🚀", by: ["me", "dv"] }, { emoji: "✅", by: ["me"] }]),
      mkMsg("sec",  "⚠️ WAF triggered — blocked 185.220.100.0/24. High confidence automated scan. No impact.", "10:10 AM"),
      mkMsg("me",   "Good catch SS. DV, please review the VPC plan and I'll sign off after the 11am sync.", "10:25 AM"),
      mkMsg("dv",   "Roger. Plan is in the shared doc, flagged for review.", "10:26 AM"),
      mkMsg("fin",  "Two new Stripe subscriptions today — $397 and $197. MRR updated.", "10:40 AM", [{ emoji: "💰", by: ["me", "ops"] }]),
    ],
  },
  {
    id: "grp-marketing", type: "group", name: "Marketing Squad", emoji: "📣",
    memberIds: ["me", "mkt", "cw", "seo", "cm"],
    description: "All marketing channels — campaigns, content, SEO, community.",
    unread: 3,
    messages: [
      mkMsg("mkt",  "Week 7 campaign is live. Meta + Google running in parallel.", "Monday 9:00 AM"),
      mkMsg("cw",   "Homepage hero copy updated — staging link in notion.", "Monday 10:30 AM"),
      mkMsg("seo",  "Keyword rankings update: +3 positions on 'AI agent platform', now #7.", "Monday 2:00 PM"),
      mkMsg("cm",   "Discord community hit 200 members! Engagement up 40% vs last week.", "Yesterday 11:00 AM", [{ emoji: "🎉", by: ["me", "mkt", "cw"] }]),
      mkMsg("mkt",  "CPL down 22% this week on Meta. Requesting budget increase to $80/day.", "10:30 AM"),
      mkMsg("me",   "Approved — cap at $80, revisit Friday.", "10:48 AM"),
      mkMsg("cw",   "Starting the launch email sequence today. Targeting Tuesday send.", "10:50 AM"),
      mkMsg("cm",   "Community weekly Zoom is set for 2pm today. Posted announcement in Discord.", "10:55 AM"),
    ],
  },
  {
    id: "grp-engineering", type: "group", name: "Engineering", emoji: "⚙️",
    memberIds: ["me", "ops", "dev", "dv", "qa"],
    description: "Dev, DevOps, and QA coordination channel.",
    unread: 0,
    messages: [
      mkMsg("dv",   "Build #347 failed — TypeScript error in scheduler.ts line 84.", "10:30 AM", [], false, false),
      mkMsg("dev",  "On it. Null check missing on task.assignedAgent. Fix pushed.", "10:33 AM"),
      mkMsg("qa",   "Running regression suite on the fix now.", "10:35 AM"),
      mkMsg("dv",   "Build #348 passing. Good to merge.", "10:38 AM", [{ emoji: "✅", by: ["me", "ops", "dev"] }]),
      mkMsg("ops",  "Merged and deployed to staging.", "10:40 AM"),
      mkMsg("qa",   "E2E suite: 142/142 passing. No regressions. Staging approved.", "10:45 AM"),
      mkMsg("ops",  "Promoting to production now.", "10:50 AM"),
    ],
  },
  {
    id: "grp-launch", type: "group", name: "Launch Prep 🚀", emoji: "🚀",
    memberIds: ["me", "mkt", "sales", "cw", "ops", "dev"],
    description: "Cross-functional launch coordination. T-14 days.",
    unread: 1,
    messages: [
      mkMsg("me",   "Launch checklist updated — 18 items remaining, 6 blocked.", "Yesterday 4:00 PM"),
      mkMsg("sales","Meridian Consulting confirmed as launch-day case study. Getting quote tomorrow.", "Yesterday 4:30 PM"),
      mkMsg("cw",   "Blog post draft is done. Needs your final review before we schedule.", "Yesterday 5:00 PM"),
      mkMsg("ops",  "Infra load test scheduled for Thursday. Target: 500 concurrent users.", "Yesterday 5:15 PM"),
      mkMsg("mkt",  "PR outreach list finalized — 12 publications, 3 podcasts.", "Today 9:00 AM"),
      mkMsg("dev",  "Signup flow A/B test is live on staging. Variant B converting 18% better.", "Today 10:00 AM", [{ emoji: "📈", by: ["me", "mkt"] }]),
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const STATUS_COLOR = { online: C.green, away: C.amber, degraded: C.amber, offline: C.textMuted };
const STATUS_LABEL = { online: "Online", away: "Away", degraded: "Degraded", offline: "Offline" };

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getConversationAgentTargets(conv) {
  if (!conv) return [];
  if (conv.type === "dm") return conv.withId ? [conv.withId] : [];
  return (conv.memberIds || []).filter((id) => id !== "me");
}

function Avatar({ person, size = 34, showStatus = false }) {
  if (!person) return null;
  const isGrad = person.color?.includes("gradient");
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: isGrad ? person.color : `linear-gradient(135deg, ${person.color}, ${person.color}bb)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.32, fontWeight: 700, color: "#fff",
        border: `2px solid ${isGrad ? C.blue : person.color}33`,
        boxShadow: `0 0 10px ${isGrad ? C.blue : person.color}18`,
        flexShrink: 0,
      }}>{person.initials}</div>
      {showStatus && person.status && (
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: Math.max(8, size * 0.26), height: Math.max(8, size * 0.26),
          borderRadius: "50%", background: STATUS_COLOR[person.status],
          border: `2px solid ${C.surface}`,
        }} />
      )}
    </div>
  );
}

function GroupAvatar({ memberIds, size = 34, emoji }) {
  const members = memberIds.slice(0, 3).map(id => getPerson(id));
  if (emoji) return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: C.elevated,
      border: `1px solid ${C.border}`, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.45, flexShrink: 0,
    }}>{emoji}</div>
  );
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      {members.slice(0, 2).map((m, i) => (
        <div key={i} style={{
          position: "absolute",
          top: i === 0 ? 0 : "auto", bottom: i === 1 ? 0 : "auto",
          left: i === 0 ? 0 : "auto", right: i === 1 ? 0 : "auto",
          width: size * 0.65, height: size * 0.65, borderRadius: "50%",
          background: `linear-gradient(135deg, ${m.color}, ${m.color}bb)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.2, fontWeight: 700, color: "#fff",
          border: `2px solid ${C.surface}`,
        }}>{m.initials}</div>
      ))}
    </div>
  );
}

function ThemeToggle({ themeMode, setThemeMode }) {
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
      }}
      title="Cycle theme"
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{current.icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: C.textSec }}>{current.label}</span>
    </div>
  );
}

function AppSidebar({ themeMode, setThemeMode, collapsedSections, onToggleSection }) {
  const isDark = themeMode !== "light";
  const currentRoute = (window.location.hash.replace('#', '').split('?')[0] || '/chat');
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
    ] },
    { section: "SYSTEM", items: SYSTEM_NAV_ITEMS },
  ];

  const routeMap = {
    'start-here': '/start-here',
    chat: '/chat',
    boards: '/boards',
    tasks: '/boards',
    approvals: '/approvals',
    brainstorm: '/brainstorm',
    brainstorming: '/brainstorm',
    agentarmy: '/army',
    configurator: '/configurator?step=1',
    files: '/files',
    security: '/security',
    integrations: '/integrations',
    costusage: '/costs',
    settings: '/settings',
    development: '/development',
  };

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
        {NAV.map((s) => {
          const collapsed = !!collapsedSections[s.section];
          return (
            <div key={s.section} style={{ marginBottom: 4 }}>
              <button onClick={() => onToggleSection(s.section)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontSize: 9, fontWeight: 700, color: C.textMuted, letterSpacing: 1.2, textTransform: "uppercase", padding: "12px 10px 6px" }}>
                <span>{s.section}</span>
                <span style={{ minWidth: 16, height: 16, borderRadius: 4, border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.textSec }}>{collapsed ? "+" : "−"}</span>
              </button>
              {!collapsed && s.items.map((item) => {
                const targetPath = routeMap[item.key] || item.path || "/boards";
                const routeOnly = targetPath.split('?')[0];
                const active = currentRoute === routeOnly;
                const href = `#${targetPath}`;
                return (
                  <a key={item.key} href={href} onClick={(e) => { e.preventDefault(); window.location.hash = targetPath; }} style={{
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6,
                    cursor: "pointer", background: active ? C.blueGlow : "transparent",
                    borderLeft: active ? `2px solid ${C.blue}` : "2px solid transparent", marginBottom: 1,
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
    </div>
  );
}

// ─── Overlay shell ──────────────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ModalCard({ width = 500, children }) {
  return (
    <div style={{
      width, maxHeight: "85vh", borderRadius: 14, background: C.surface,
      border: `1px solid ${C.borderLight}`, boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>{children}</div>
  );
}

function ModalHeader({ icon, title, subtitle, onClose, color }) {
  return (
    <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, fontSize: 18,
          background: color ? `${color}18` : C.elevated,
          border: `1px solid ${color ? color + "30" : C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{
        width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`,
        background: C.elevated, color: C.textSec, cursor: "pointer",
        fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
      }}>✕</button>
    </div>
  );
}

function Input({ value, onChange, placeholder, autoFocus }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      autoFocus={autoFocus}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 8,
        border: `1px solid ${C.border}`, background: C.bg, color: C.text,
        fontSize: 13, outline: "none", boxSizing: "border-box",
        fontFamily: "inherit",
      }}
      onFocus={e => { e.target.style.borderColor = C.blue; }}
      onBlur={e => { e.target.style.borderColor = C.border; }}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 8,
        border: `1px solid ${C.border}`, background: C.bg, color: C.text,
        fontSize: 13, outline: "none", boxSizing: "border-box",
        fontFamily: "inherit", resize: "none", lineHeight: 1.5,
      }}
    />
  );
}

// ─── Person selector chip ────────────────────────────────────────────────────
function PersonChip({ person, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, padding: "3px 8px 3px 4px",
      borderRadius: 99, background: C.elevated, border: `1px solid ${C.border}`,
    }}>
      <Avatar person={person} size={20} />
      <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{person.name}</span>
      <button onClick={() => onRemove(person.id)} style={{
        background: "none", border: "none", color: C.textMuted, cursor: "pointer",
        fontSize: 11, padding: 0, lineHeight: 1, marginLeft: 2,
      }}>✕</button>
    </div>
  );
}

// ─── Member row for picker ───────────────────────────────────────────────────
function PersonRow({ person, selected, onToggle, disabled }) {
  return (
    <div onClick={() => !disabled && onToggle(person.id)} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "9px 16px",
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
      background: selected ? C.blueGlow : "transparent",
      borderLeft: `2px solid ${selected ? C.blue : "transparent"}`,
      transition: "all 0.12s",
    }}>
      <Avatar person={person} size={32} showStatus />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{person.name}</div>
        <div style={{ fontSize: 11, color: C.textMuted }}>{person.role}</div>
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
        background: selected ? C.blue : "transparent",
        border: `1.5px solid ${selected ? C.blue : C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: "#fff",
      }}>{selected ? "✓" : ""}</div>
    </div>
  );
}

// ─── Modal: New Direct Message ──────────────────────────────────────────────
function NewDMModal({ onClose, onStart, existingDMIds }) {
  const [search, setSearch] = useState("");
  const filtered = PEOPLE.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Overlay onClose={onClose}>
      <ModalCard width={440}>
        <ModalHeader icon="💬" title="New Direct Message" subtitle="Start a private conversation" onClose={onClose} color={C.blue} />
        <div style={{ padding: "14px 16px 10px" }}>
          <Input value={search} onChange={setSearch} placeholder="Search people..." autoFocus />
        </div>
        <div style={{ flex: 1, overflowY: "auto", maxHeight: 380 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No people found</div>
          ) : filtered.map(p => {
            const exists = existingDMIds.includes(p.id);
            return (
              <div key={p.id} onClick={() => onStart(p)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                cursor: "pointer", borderBottom: `1px solid ${C.border}`,
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.elevated}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Avatar person={p} size={36} showStatus />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{p.role} · <span style={{ color: STATUS_COLOR[p.status] }}>{STATUS_LABEL[p.status]}</span></div>
                </div>
                {exists && <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>Open</span>}
                <span style={{ fontSize: 18, color: C.textMuted }}>›</span>
              </div>
            );
          })}
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ─── Modal: Create Group ────────────────────────────────────────────────────
function CreateGroupModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(["me"]);
  const EMOJIS = ["💬", "🎯", "📣", "⚙️", "🚀", "🛡️", "💰", "📊", "🔧", "✨", "🌐", "🤝"];

  const toggle = (id) => {
    if (id === "me") return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = PEOPLE.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = name.trim().length >= 2 && selectedIds.length >= 2;

  return (
    <Overlay onClose={onClose}>
      <ModalCard width={520}>
        <ModalHeader icon="👥" title="Create Group" subtitle="Build a shared conversation space" onClose={onClose} color={C.purple} />
        <div style={{ overflowY: "auto", flex: 1 }}>
          <div style={{ padding: "20px 24px" }}>
            {/* Emoji picker */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>GROUP ICON</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)} style={{
                    width: 36, height: 36, borderRadius: 8, fontSize: 18,
                    border: `1.5px solid ${emoji === e ? C.purple : C.border}`,
                    background: emoji === e ? C.purpleGlow : C.elevated,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{e}</button>
                ))}
              </div>
            </div>

            {/* Group name */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>GROUP NAME <span style={{ color: C.red }}>*</span></div>
              <Input value={name} onChange={setName} placeholder="e.g. Launch Team, Q2 Planning..." autoFocus />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>DESCRIPTION</div>
              <Textarea value={desc} onChange={setDesc} placeholder="What is this group for?" rows={2} />
            </div>

            <div style={{ height: 1, background: C.border, marginBottom: 16 }} />

            {/* Member picker */}
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>
              ADD MEMBERS <span style={{ color: C.textMuted, fontWeight: 400 }}>({selectedIds.length} selected)</span>
            </div>

            {/* Selected chips */}
            {selectedIds.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {selectedIds.map(id => {
                  const p = getPerson(id);
                  return <PersonChip key={id} person={p} onRemove={id === "me" ? () => {} : toggle} />;
                })}
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              <Input value={search} onChange={setSearch} placeholder="Search to add members..." />
            </div>
          </div>

          {/* People list */}
          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {filtered.map(p => (
              <PersonRow key={p.id} person={p} selected={selectedIds.includes(p.id)} onToggle={toggle} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{
            padding: "8px 18px", borderRadius: 7, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => canCreate && onCreate({ name: name.trim(), desc, emoji, memberIds: selectedIds })} style={{
            padding: "8px 20px", borderRadius: 7, border: "none",
            background: canCreate ? C.purple : C.elevated,
            color: canCreate ? "#fff" : C.textMuted,
            fontSize: 12, fontWeight: 700, cursor: canCreate ? "pointer" : "default",
          }}>Create Group</button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ─── Modal: Add Members to Group ────────────────────────────────────────────
function AddMembersModal({ group, onClose, onAdd }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const notInGroup = PEOPLE.filter(p => !group.memberIds.includes(p.id));
  const filtered = notInGroup.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <Overlay onClose={onClose}>
      <ModalCard width={480}>
        <ModalHeader icon="➕" title="Add Members" subtitle={`Adding to ${group.name}`} onClose={onClose} color={C.green} />
        <div style={{ padding: "14px 16px 10px" }}>
          {selectedIds.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {selectedIds.map(id => {
                const p = getPerson(id);
                return <PersonChip key={id} person={p} onRemove={toggle} />;
              })}
            </div>
          )}
          <Input value={search} onChange={setSearch} placeholder="Search people to add..." autoFocus />
        </div>

        <div style={{ flex: 1, overflowY: "auto", maxHeight: 340, borderTop: `1px solid ${C.border}` }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: C.textMuted }}>
                {notInGroup.length === 0 ? "Everyone is already in this group." : "No people match your search."}
              </div>
            </div>
          ) : filtered.map(p => (
            <PersonRow key={p.id} person={p} selected={selectedIds.includes(p.id)} onToggle={toggle} />
          ))}
        </div>

        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>
            {selectedIds.length === 0 ? "Select members to add" : `${selectedIds.length} selected`}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              padding: "8px 18px", borderRadius: 7, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={() => selectedIds.length > 0 && onAdd(selectedIds)} style={{
              padding: "8px 20px", borderRadius: 7, border: "none",
              background: selectedIds.length > 0 ? C.green : C.elevated,
              color: selectedIds.length > 0 ? "#fff" : C.textMuted,
              fontSize: 12, fontWeight: 700, cursor: selectedIds.length > 0 ? "pointer" : "default",
            }}>Add to Group</button>
          </div>
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ─── Modal: Group Settings ──────────────────────────────────────────────────
function GroupSettingsModal({ group, onClose, onSave, onLeave }) {
  const [name, setName] = useState(group.name);
  const [desc, setDesc] = useState(group.description || "");
  const [emoji, setEmoji] = useState(group.emoji || "💬");
  const EMOJIS = ["💬", "🎯", "📣", "⚙️", "🚀", "🛡️", "💰", "📊", "🔧", "✨", "🌐", "🤝"];

  return (
    <Overlay onClose={onClose}>
      <ModalCard width={460}>
        <ModalHeader icon="⚙️" title="Group Settings" subtitle={group.name} onClose={onClose} />
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>GROUP ICON</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 18,
                  border: `1.5px solid ${emoji === e ? C.blue : C.border}`,
                  background: emoji === e ? C.blueGlow : C.elevated,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>GROUP NAME</div>
            <Input value={name} onChange={setName} placeholder="Group name..." />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>DESCRIPTION</div>
            <Textarea value={desc} onChange={setDesc} placeholder="What's this group about?" rows={2} />
          </div>
          <div style={{ height: 1, background: C.border, marginBottom: 16 }} />
          <button onClick={onLeave} style={{
            width: "100%", padding: "9px", borderRadius: 7,
            border: `1px solid ${C.red}30`, background: C.redGlow,
            color: C.red, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Leave Group</button>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{
            padding: "8px 18px", borderRadius: 7, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => onSave({ name, desc, emoji })} style={{
            padding: "8px 20px", borderRadius: 7, border: "none",
            background: C.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>Save Changes</button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ─── Message bubble ─────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== "string") return `rgba(59,130,246,${alpha})`;
  const clean = hex.replace("#", "");
  if (![3, 6].includes(clean.length)) return `rgba(59,130,246,${alpha})`;
  const full = clean.length === 3 ? clean.split("").map(ch => ch + ch).join("") : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function MessageBubble({ msg, prevMsg, onReact, onPin, onRetry }) {
  const [hover, setHover] = useState(false);
  const author = getPerson(msg.authorId);
  const isMe = msg.authorId === "me";
  const showAvatar = !prevMsg || prevMsg.authorId !== msg.authorId;
  const isDark = C.bg === "#0A0C10";
  const accent = !isMe && author?.color && !author.color.includes("gradient") ? author.color : C.blue;

  const bubbleBg = isMe
    ? (isDark
      ? `linear-gradient(135deg, ${hexToRgba("#3B82F6", 0.26)}, ${hexToRgba("#8B5CF6", 0.24)})`
      : `linear-gradient(135deg, ${hexToRgba("#2563EB", 0.16)}, ${hexToRgba("#7C3AED", 0.13)})`)
    : `linear-gradient(135deg, ${hexToRgba(accent, isDark ? 0.16 : 0.12)}, ${hexToRgba(accent, isDark ? 0.1 : 0.07)})`;

  if (msg.isSystem) return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 20px" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Avatar person={author} size={16} />
        <span style={{ fontSize: 11, color: C.textMuted }}>{author.name} — {msg.content}</span>
        <span style={{ fontSize: 10, color: C.textMuted }}>{msg.time}</span>
      </div>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        padding: `${showAvatar ? 10 : 2}px 20px`,
        position: "relative",
        transition: "background 0.1s",
        background: hover ? C.elevated + "80" : "transparent",
      }}
    >
      <div style={{
        maxWidth: "78%",
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        flexDirection: isMe ? "row-reverse" : "row",
      }}>
        <div style={{ width: 36, flexShrink: 0, paddingTop: showAvatar ? 2 : 0, display: "flex", justifyContent: "center" }}>
          {showAvatar ? <Avatar person={author} size={34} /> : null}
        </div>

        <div style={{ minWidth: 0 }}>
          {showAvatar && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3, justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: isMe ? C.blue : C.text }}>{author.name}</span>
              <span style={{ fontSize: 10, color: C.textMuted }}>{msg.time}</span>
              {msg.pinned && <span style={{ fontSize: 9, color: C.amber, fontWeight: 600, padding: "1px 6px", background: C.amberGlow, borderRadius: 4, border: `1px solid ${C.amber}30` }}>📌 PINNED</span>}
            </div>
          )}

          <div style={{
            fontSize: 13.5,
            color: C.text,
            lineHeight: 1.55,
            wordBreak: "break-word",
            padding: "9px 12px",
            borderRadius: isMe ? "16px 6px 16px 16px" : "6px 16px 16px 16px",
            background: bubbleBg,
            border: `1px solid ${isMe ? hexToRgba(C.blue, isDark ? 0.42 : 0.32) : hexToRgba(accent, isDark ? 0.38 : 0.28)}`,
            boxShadow: `0 6px 14px ${isMe ? hexToRgba(C.blue, isDark ? 0.18 : 0.12) : hexToRgba(accent, isDark ? 0.16 : 0.1)}`,
          }}>{msg.content}</div>

          {msg.delivery && (
            <div style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: isMe ? "flex-end" : "flex-start",
              fontSize: 10,
              color: msg.delivery.status === "error" ? C.red : C.textMuted,
            }}>
              <span>
                {msg.delivery.status === "sending" && "Sending…"}
                {msg.delivery.status === "processing" && "Agent processing…"}
                {msg.delivery.status === "replied" && "Replied"}
                {msg.delivery.status === "error" && "Send failed"}
                {msg.delivery.requestId ? ` · ${msg.delivery.requestId}` : ""}
              </span>
              {msg.delivery.status === "error" && onRetry && (
                <button
                  onClick={() => onRetry(msg)}
                  style={{
                    border: `1px solid ${C.red}66`,
                    background: C.redGlow,
                    color: C.red,
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {msg.reactions.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              {msg.reactions.map((r, i) => (
                <button key={i} onClick={() => onReact(msg.id, r.emoji)} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "2px 8px", borderRadius: 99,
                  background: r.by.includes("me") ? C.blueGlow : C.elevated,
                  border: `1px solid ${r.by.includes("me") ? C.blue + "50" : C.border}`,
                  cursor: "pointer", fontSize: 12,
                }}>
                  <span>{r.emoji}</span>
                  <span style={{ fontSize: 11, color: r.by.includes("me") ? C.blue : C.textSec, fontWeight: 600 }}>{r.by.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {hover && (
        <div style={{
          position: "absolute", top: -14,
          right: isMe ? 20 : "auto", left: isMe ? "auto" : 64,
          display: "flex", gap: 4, background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "4px 6px", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}>
          {["👍", "✅", "🚀", "🖕", "📌"].map(e => (
            <button key={e} onClick={() => e === "📌" ? onPin(msg.id) : onReact(msg.id, e)} title={e === "📌" ? "Pin message" : `React with ${e}`} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, padding: "2px 4px", borderRadius: 4,
              transition: "background 0.1s",
            }}
              onMouseEnter={ev => ev.currentTarget.style.background = C.elevated}
              onMouseLeave={ev => ev.currentTarget.style.background = "none"}
            >{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Right panel: DM profile ─────────────────────────────────────────────────
function DMPanel({ person, onClose }) {
  return (
    <div style={{ width: 260, flexShrink: 0, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: 0.8 }}>Profile</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Avatar person={person} size={64} showStatus />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{person.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{person.role}</div>
            <div style={{ fontSize: 11, color: STATUS_COLOR[person.status], marginTop: 4, fontWeight: 600 }}>● {STATUS_LABEL[person.status]}</div>
          </div>
        </div>
        <div style={{ background: C.elevated, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {[
            { label: "Role", value: person.role },
            { label: "Status", value: STATUS_LABEL[person.status] },
          ].map(({ label, value }, i) => (
            <div key={i} style={{ padding: "10px 14px", borderBottom: i < 1 ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 11, color: C.textSec }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Right panel: Group detail ───────────────────────────────────────────────
function GroupPanel({ group, onClose, onAddMembers, onSettings }) {
  const [tab, setTab] = useState("members");
  const members = group.memberIds.map(id => getPerson(id));
  const pinnedMsgs = group.messages.filter(m => m.pinned);

  return (
    <div style={{ width: 260, flexShrink: 0, background: C.surface, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: 0.8 }}>Group Info</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14 }}>✕</button>
      </div>

      {/* Group identity */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 36 }}>{group.emoji}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{group.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3, lineHeight: 1.4 }}>{group.description}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onAddMembers} style={{
            flex: 1, padding: "7px", borderRadius: 7, border: `1px solid ${C.border}`,
            background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}>➕ Add</button>
          <button onClick={onSettings} style={{
            flex: 1, padding: "7px", borderRadius: 7, border: `1px solid ${C.border}`,
            background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}>⚙️ Settings</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {[{ key: "members", label: `Members (${members.length})` }, { key: "pinned", label: `Pinned (${pinnedMsgs.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "10px", background: "none", border: "none",
            borderBottom: `2px solid ${tab === t.key ? C.blue : "transparent"}`,
            color: tab === t.key ? C.text : C.textMuted,
            fontSize: 11, fontWeight: tab === t.key ? 700 : 400, cursor: "pointer",
            transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "members" && (
          <div>
            {members.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: `1px solid ${C.border}` }}>
                <Avatar person={m} size={30} showStatus />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{m.role}</div>
                </div>
                {m.id === "me" && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: C.blueGlow, color: C.blue, fontWeight: 600 }}>You</span>}
              </div>
            ))}
          </div>
        )}
        {tab === "pinned" && (
          <div style={{ padding: 12 }}>
            {pinnedMsgs.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center", padding: 20 }}>No pinned messages</div>
            ) : pinnedMsgs.map(m => {
              const author = getPerson(m.authorId);
              return (
                <div key={m.id} style={{ background: C.elevated, borderRadius: 8, padding: "10px 12px", marginBottom: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Avatar person={author} size={16} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.textSec }}>{author.name}</span>
                    <span style={{ fontSize: 10, color: C.textMuted }}>{m.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{m.content.slice(0, 120)}{m.content.length > 120 ? "…" : ""}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Conversation list item ──────────────────────────────────────────────────
function ConvItem({ conv, active, onClick, isFavorite, onToggleFavorite, runtimeState }) {
  const lastMsg = conv.messages[conv.messages.length - 1];
  const lastAuthor = lastMsg ? getPerson(lastMsg.authorId) : null;
  const preview = lastMsg ? (lastMsg.authorId === "me" ? "You: " : "") + lastMsg.content : "No messages yet";

  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
      borderRadius: 8, cursor: "pointer", marginBottom: 2,
      background: active ? C.blueGlow : "transparent",
      border: `1px solid ${active ? C.blue + "30" : "transparent"}`,
      transition: "all 0.1s",
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.elevated; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {conv.type === "dm"
        ? <Avatar person={getPerson(conv.withId)} size={36} showStatus />
        : <GroupAvatar memberIds={conv.memberIds} size={36} emoji={conv.emoji} />
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: conv.unread > 0 ? 700 : 500, color: conv.unread > 0 ? C.text : C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
            {conv.type === "dm" ? getPerson(conv.withId).name : conv.name}
          </span>
          <span style={{ fontSize: 10, color: C.textMuted, flexShrink: 0 }}>{lastMsg?.time?.split(" ")[0] === "Today" ? lastMsg.time : lastMsg?.time?.split(" ").slice(-2).join(" ")}</span>
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{preview.slice(0, 48)}{preview.length > 48 ? "…" : ""}</div>
        {runtimeState?.status && (
          <div style={{ fontSize: 10, color: runtimeState.status === "error" ? C.red : C.blue, marginTop: 2 }}>
            {runtimeState.status}{runtimeState.requestId ? ` · ${runtimeState.requestId}` : ""}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(conv.id); }}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        style={{
          width: 22, height: 22, borderRadius: 6,
          border: `1px solid ${isFavorite ? C.amber + "55" : C.border}`,
          background: isFavorite ? C.amberGlow : C.elevated,
          color: isFavorite ? C.amber : C.textMuted,
          cursor: "pointer", fontSize: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isFavorite ? "★" : "☆"}
      </button>
      {conv.unread > 0 && (
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.blue, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{conv.unread}</div>
      )}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function CommsCenter() {
  const [conversations, setConversations] = useState(INIT_CONVERSATIONS);
  const [activeId, setActiveId] = useState("grp-command");
  const [inputValue, setInputValue] = useState("");
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [search, setSearch] = useState("");
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const raw = localStorage.getItem("cf-chat-favorites");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true });

  // Modals
  const [modal, setModal] = useState(null); // "newDM" | "createGroup" | "addMembers" | "groupSettings"

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const openclawClient = useMemo(() => createOpenClawClient(), []);
  const [conversationRuntime, setConversationRuntime] = useState({});

  const isDark = themeMode !== "light";
  C = getTheme(themeMode);
  const activeConv = conversations.find(c => c.id === activeId);

  useEffect(() => {
    persistThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("cf-chat-favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (convId) => {
    setFavoriteIds(prev => prev.includes(convId) ? prev.filter(id => id !== convId) : [convId, ...prev]);
  };

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
    let t;
    if (collapsedSections.SYSTEM === undefined || collapsedSections.SYSTEM === true) return;
    t = setTimeout(() => setCollapsedSections((p) => ({ ...p, SYSTEM: true })), 12000);
    return () => t && clearTimeout(t);
  }, [collapsedSections.SYSTEM]);

  // Scroll to bottom when switching conv or new message
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [activeId, activeConv?.messages.length]);

  // Mark as read when switching
  const selectConv = (id) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setActiveId(id);
    setInputValue("");
  };

  const sendMessage = async (retryMsg = null) => {
    const text = (retryMsg?.content ?? inputValue).trim();
    if (!text || !activeConv) return;

    const sendAt = nowLabel();
    const localMessageId = retryMsg?.id ?? _msgId++;
    const targets = getConversationAgentTargets(activeConv);

    if (!retryMsg) {
      const newMsg = {
        id: localMessageId,
        authorId: "me",
        content: text,
        time: sendAt,
        reactions: [],
        pinned: false,
        isSystem: false,
        delivery: { status: "sending", requestId: null, error: null },
      };
      setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c)));
      setInputValue("");
    } else {
      setConversations((prev) => prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => m.id === retryMsg.id
            ? { ...m, delivery: { status: "sending", requestId: null, error: null } }
            : m),
        };
      }));
    }

    setConversationRuntime((prev) => ({ ...prev, [activeId]: { status: "sending", requestId: null, error: null } }));
    textareaRef.current?.focus();

    if (targets.length === 0) {
      setConversations((prev) => prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => m.id === localMessageId
            ? { ...m, delivery: { status: "error", requestId: null, error: "No agent targets in this conversation." } }
            : m),
        };
      }));
      setConversationRuntime((prev) => ({ ...prev, [activeId]: { status: "error", requestId: null, error: "No agent targets in this conversation." } }));
      return;
    }

    const targetAgentId = targets[0];
    let response;
    try {
      response = await openclawClient.run("oc.agent.message.send", {
        agentId: targetAgentId,
        message: text,
        allowLocalFallback: true,
      });
    } catch (e) {
      response = {
        ok: false,
        error: {
          requestId: null,
          userMessage: e?.message || "Failed to send message",
          debugCode: "CHAT_SEND_THROW",
        },
      };
    }

    if (!response.ok) {
      const requestId = response?.error?.requestId || null;
      const errorText = `${response?.error?.userMessage || "Failed to send message"}${response?.error?.debugCode ? ` · ${response.error.debugCode}` : ""}`;
      setConversations((prev) => prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => m.id === localMessageId
            ? { ...m, delivery: { status: "error", requestId, error: errorText } }
            : m),
        };
      }));
      setConversationRuntime((prev) => ({ ...prev, [activeId]: { status: "error", requestId, error: errorText } }));
      return;
    }

    const requestId = response?.data?.requestId || response?.meta?.requestId || null;
    setConversations((prev) => prev.map((c) => {
      if (c.id !== activeId) return c;
      return {
        ...c,
        messages: c.messages.map((m) => m.id === localMessageId
          ? { ...m, delivery: { status: "processing", requestId, error: null } }
          : m),
      };
    }));
    setConversationRuntime((prev) => ({ ...prev, [activeId]: { status: "processing", requestId, error: null } }));

    setTimeout(() => {
      const reply = mkMsg(targetAgentId, `Got it — processing your request. (requestId: ${requestId || "n/a"})`, nowLabel());
      setConversations((prev) => prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => m.id === localMessageId
            ? { ...m, delivery: { status: "replied", requestId, error: null } }
            : m).concat(reply),
        };
      }));
      setConversationRuntime((prev) => ({ ...prev, [activeId]: { status: "replied", requestId, error: null } }));
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleReact = (msgId, emoji) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      return {
        ...c, messages: c.messages.map(m => {
          if (m.id !== msgId) return m;
          const existing = m.reactions.find(r => r.emoji === emoji);
          if (existing) {
            const newBy = existing.by.includes("me") ? existing.by.filter(x => x !== "me") : [...existing.by, "me"];
            const newReactions = newBy.length === 0
              ? m.reactions.filter(r => r.emoji !== emoji)
              : m.reactions.map(r => r.emoji === emoji ? { ...r, by: newBy } : r);
            return { ...m, reactions: newReactions };
          }
          return { ...m, reactions: [...m.reactions, { emoji, by: ["me"] }] };
        })
      };
    }));
  };

  const handlePin = (msgId) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      return { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, pinned: !m.pinned } : m) };
    }));
  };

  const handleRetryMessage = async (msg) => {
    await sendMessage(msg);
  };

  const handleStartDM = (person) => {
    const existing = conversations.find(c => c.type === "dm" && c.withId === person.id);
    if (existing) { selectConv(existing.id); }
    else {
      const newConv = { id: `dm-${person.id}-${Date.now()}`, type: "dm", withId: person.id, unread: 0, messages: [] };
      setConversations(prev => [newConv, ...prev]);
      setActiveId(newConv.id);
    }
    setModal(null);
  };

  const handleCreateGroup = ({ name, desc, emoji, memberIds }) => {
    const newConv = {
      id: `grp-${Date.now()}`, type: "group", name, description: desc, emoji,
      memberIds, unread: 0, messages: [
        mkMsg("me", `Created group "${name}"`, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), [], false, true)
      ],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
    setModal(null);
  };

  const handleAddMembers = (newIds) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      const addMsg = mkMsg("me", `Added ${newIds.map(id => getPerson(id).name).join(", ")} to the group`, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), [], false, true);
      return { ...c, memberIds: [...c.memberIds, ...newIds], messages: [...c.messages, addMsg] };
    }));
    setModal(null);
  };

  const handleSaveGroupSettings = ({ name, desc, emoji }) => {
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, name, description: desc, emoji } : c));
    setModal(null);
  };

  useEffect(() => {
    setFavoriteIds(prev => prev.filter(id => conversations.some(c => c.id === id)));
  }, [conversations]);

  const dmConvs = conversations.filter(c => c.type === "dm");
  const groupConvs = conversations.filter(c => c.type === "group");

  const favoriteSet = new Set(favoriteIds);
  const searchTerm = search.toLowerCase();

  const favoriteConvs = conversations.filter(c => {
    if (!favoriteSet.has(c.id)) return false;
    if (c.type === "dm") return getPerson(c.withId).name.toLowerCase().includes(searchTerm);
    return c.name.toLowerCase().includes(searchTerm);
  });

  const filteredDMs = dmConvs.filter(c => {
    if (favoriteSet.has(c.id)) return false;
    const p = getPerson(c.withId);
    return p.name.toLowerCase().includes(searchTerm);
  });
  const filteredGroups = groupConvs.filter(c => {
    if (favoriteSet.has(c.id)) return false;
    return c.name.toLowerCase().includes(searchTerm);
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
  const runtimeState = conversationRuntime[activeId] || null;

  // Header info
  const headerTitle = activeConv?.type === "dm"
    ? getPerson(activeConv.withId).name
    : activeConv?.name || "";
  const headerSub = activeConv?.type === "dm"
    ? `${STATUS_LABEL[getPerson(activeConv.withId).status]} · ${getPerson(activeConv.withId).role}`
    : `${activeConv?.memberIds.length} members · ${activeConv?.description?.slice(0, 60) || ""}`;
  const headerRuntime = runtimeState?.status
    ? `${runtimeState.status}${runtimeState.requestId ? ` · ${runtimeState.requestId}` : ""}`
    : "";

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>

      {/* ── Modals ── */}
      {modal === "newDM" && (
        <NewDMModal
          onClose={() => setModal(null)}
          onStart={handleStartDM}
          existingDMIds={dmConvs.map(c => c.withId)}
        />
      )}
      {modal === "createGroup" && (
        <CreateGroupModal onClose={() => setModal(null)} onCreate={handleCreateGroup} />
      )}
      {modal === "addMembers" && activeConv?.type === "group" && (
        <AddMembersModal group={activeConv} onClose={() => setModal(null)} onAdd={handleAddMembers} />
      )}
      {modal === "groupSettings" && activeConv?.type === "group" && (
        <GroupSettingsModal
          group={activeConv}
          onClose={() => setModal(null)}
          onSave={handleSaveGroupSettings}
          onLeave={() => { setConversations(prev => prev.filter(c => c.id !== activeId)); setActiveId(conversations.find(c => c.id !== activeId)?.id); setModal(null); }}
        />
      )}

      <AppSidebar
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        collapsedSections={collapsedSections}
        onToggleSection={(section) => setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))}
      />

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div style={{ width: 268, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>

        {/* Conversations header */}
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.blueGlow, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>💬</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>Chat</div>
              <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>Conversations</div>
            </div>
            {totalUnread > 0 && (
              <div style={{ marginLeft: "auto", minWidth: 20, height: 20, borderRadius: 99, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", padding: "0 5px" }}>{totalUnread}</div>
            )}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.textMuted }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..."
              style={{ width: "100%", padding: "7px 10px 7px 28px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>

          {/* Favorites section */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 6px", marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Favorites</span>
            <span style={{ fontSize: 10, color: C.textMuted }}>{favoriteConvs.length}</span>
          </div>
          {favoriteConvs.map(c => (
            <ConvItem
              key={c.id}
              conv={c}
              active={activeId === c.id}
              onClick={() => selectConv(c.id)}
              isFavorite={favoriteSet.has(c.id)}
              onToggleFavorite={toggleFavorite}
              runtimeState={conversationRuntime[c.id]}
            />
          ))}
          {favoriteConvs.length === 0 && (
            <div style={{ fontSize: 11, color: C.textMuted, padding: "6px 8px" }}>{search ? "No favorites match" : "No favorites yet"}</div>
          )}

          {/* Direct Messages section */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 6px", marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Direct Messages</span>
            <button onClick={() => setModal("newDM")} title="New direct message" style={{
              width: 22, height: 22, borderRadius: 5, background: C.elevated,
              border: `1px solid ${C.border}`, color: C.textSec, cursor: "pointer",
              fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            }}>+</button>
          </div>
          {filteredDMs.map(c => (
            <ConvItem
              key={c.id}
              conv={c}
              active={activeId === c.id}
              onClick={() => selectConv(c.id)}
              isFavorite={favoriteSet.has(c.id)}
              onToggleFavorite={toggleFavorite}
              runtimeState={conversationRuntime[c.id]}
            />
          ))}
          {filteredDMs.length === 0 && search && (
            <div style={{ fontSize: 11, color: C.textMuted, padding: "6px 8px" }}>No DMs match</div>
          )}

          {/* Groups section */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 6px 6px", marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Groups</span>
            <button onClick={() => setModal("createGroup")} title="Create group" style={{
              width: 22, height: 22, borderRadius: 5, background: C.elevated,
              border: `1px solid ${C.border}`, color: C.textSec, cursor: "pointer",
              fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            }}>+</button>
          </div>
          {filteredGroups.map(c => (
            <ConvItem
              key={c.id}
              conv={c}
              active={activeId === c.id}
              onClick={() => selectConv(c.id)}
              isFavorite={favoriteSet.has(c.id)}
              onToggleFavorite={toggleFavorite}
              runtimeState={conversationRuntime[c.id]}
            />
          ))}
          {filteredGroups.length === 0 && search && (
            <div style={{ fontSize: 11, color: C.textMuted, padding: "6px 8px" }}>No groups match</div>
          )}
        </div>

        {/* Me footer */}
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar person={ME} size={30} showStatus />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Joseph</div>
            <div style={{ fontSize: 10, color: C.green }}>● Online</div>
          </div>
          <button title="New direct message" onClick={() => setModal("newDM")} style={{
            width: 28, height: 28, borderRadius: 6, background: C.elevated,
            border: `1px solid ${C.border}`, color: C.textSec, cursor: "pointer",
            fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
          }}>✏️</button>
        </div>
      </div>

      {/* ══════════════ CHAT AREA ══════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Chat header */}
        <div style={{ height: 56, flexShrink: 0, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 14 }}>
          {activeConv?.type === "dm" ? (
            <Avatar person={getPerson(activeConv.withId)} size={34} showStatus />
          ) : (
            <div style={{ fontSize: 24, lineHeight: 1 }}>{activeConv?.emoji}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>{headerTitle}</div>
            <div style={{ fontSize: 11, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{headerSub}</div>
            {headerRuntime && <div style={{ fontSize: 10, color: runtimeState?.status === "error" ? C.red : C.blue, marginTop: 2 }}>{headerRuntime}</div>}
          </div>

          {/* Header actions */}
          <div style={{ display: "flex", gap: 6 }}>
            {activeConv?.type === "group" && (
              <>
                <button onClick={() => setModal("addMembers")} style={{
                  padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                  background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>➕ Add Members</button>
                <button onClick={() => setModal("groupSettings")} style={{
                  width: 32, height: 32, borderRadius: 6, border: `1px solid ${C.border}`,
                  background: C.elevated, color: C.textSec, cursor: "pointer",
                  fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                }}>⚙️</button>
              </>
            )}
            <button onClick={() => setShowRightPanel(v => !v)} style={{
              width: 32, height: 32, borderRadius: 6,
              border: `1px solid ${showRightPanel ? C.blue + "40" : C.border}`,
              background: showRightPanel ? C.blueGlow : C.elevated,
              color: showRightPanel ? C.blue : C.textSec,
              cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            }}>☰</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
          {activeConv?.messages.map((msg, i) => (
            <MessageBubble
              key={msg.id} msg={msg}
              prevMsg={i > 0 ? activeConv.messages[i - 1] : null}
              onReact={handleReact} onPin={handlePin} onRetry={handleRetryMessage}
            />
          ))}
          {runtimeState?.status === "processing" && (
            <div style={{ padding: "0 20px 8px", fontSize: 12, color: C.textMuted }}>
              <span style={{ color: C.blue }}>●</span> Agent is typing…
            </div>
          )}
          {(!activeConv || activeConv.messages.length === 0) && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, opacity: 0.5 }}>
              <div style={{ fontSize: 40 }}>{activeConv?.type === "group" ? (activeConv?.emoji || "💬") : "💬"}</div>
              <div style={{ fontSize: 14, color: C.textSec, fontWeight: 600 }}>
                {activeConv?.type === "dm" ? `Start a conversation with ${getPerson(activeConv?.withId)?.name}` : `Welcome to ${activeConv?.name}`}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{
            background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12,
            overflow: "hidden", transition: "border-color 0.15s",
          }}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeConv?.type === "dm" ? getPerson(activeConv?.withId)?.name : activeConv?.name || ""}… (Enter to send, Shift+Enter for new line)`}
              rows={1}
              style={{
                width: "100%", padding: "12px 14px 8px",
                background: "transparent", border: "none", outline: "none",
                color: C.text, fontSize: 13.5, lineHeight: 1.5, resize: "none",
                fontFamily: "inherit", boxSizing: "border-box", maxHeight: 120, overflowY: "auto",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "6px 10px", gap: 4 }}>
              {/* Format / attachment buttons */}
              {["📎", "🖼️", "@"].map((icon, i) => (
                <button key={i} style={{
                  background: "none", border: "none", color: C.textMuted, cursor: "pointer",
                  fontSize: i < 2 ? 16 : 13, padding: "4px 6px", borderRadius: 5, fontWeight: i === 2 ? 700 : 400,
                }}
                  onMouseEnter={e => e.currentTarget.style.color = C.textSec}
                  onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
                >{icon}</button>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: C.textMuted, marginRight: 8 }}>
                {inputValue.length > 0 ? `${inputValue.length} chars` : "Enter to send"}
              </span>
              <button onClick={sendMessage} disabled={!inputValue.trim()} style={{
                padding: "6px 16px", borderRadius: 7, border: "none",
                background: inputValue.trim() ? C.blue : C.border,
                color: inputValue.trim() ? "#fff" : C.textMuted,
                fontSize: 12, fontWeight: 700, cursor: inputValue.trim() ? "pointer" : "default",
                transition: "all 0.15s",
              }}>Send ↑</button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      {showRightPanel && activeConv && (
        activeConv.type === "dm"
          ? <DMPanel person={getPerson(activeConv.withId)} onClose={() => setShowRightPanel(false)} />
          : <GroupPanel
              group={activeConv}
              onClose={() => setShowRightPanel(false)}
              onAddMembers={() => setModal("addMembers")}
              onSettings={() => setModal("groupSettings")}
            />
      )}
    </div>
  );
}
