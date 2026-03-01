import { useState, useRef, useEffect, useCallback } from "react";
import { readStore, writeStore } from "../lib/missionControlStore";
import { ensureKnowledgeMapping, syncKnowledgeToStoreAndStartHere } from "../lib/startHereKnowledgeSync";

// ─── Light theme tokens (ClawForge-flavored) ──────────────────────────────────
const L = {
  bg: "#F7F8FA",
  surface: "#FFFFFF",
  sidebar: "#F0F1F5",
  sidebarHover: "#E5E7EF",
  sidebarActive: "#DDE0EC",
  elevated: "#F4F5F9",
  border: "#E1E3EA",
  borderLight: "#ECEEF4",
  text: "#1C1D24",
  textSec: "#6B7180",
  textMuted: "#A0A7B4",
  blue: "#3B82F6",
  blueLight: "#EFF6FF",
  blueGlow: "rgba(59,130,246,0.10)",
  green: "#22C55E",
  greenLight: "#F0FDF4",
  amber: "#F59E0B",
  amberLight: "#FFFBEB",
  red: "#EF4444",
  redLight: "#FEF2F2",
  purple: "#8B5CF6",
  purpleLight: "#F5F3FF",
  orange: "#F97316",
  teal: "#06B6D4",
  pink: "#EC4899",
};

const CALLOUT = {
  blue:   { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", icon: "💡" },
  green:  { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", icon: "✅" },
  amber:  { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", icon: "⚠️" },
  red:    { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", icon: "🚨" },
  purple: { bg: "#F5F3FF", border: "#DDD6FE", text: "#5B21B6", icon: "✨" },
  gray:   { bg: "#F9FAFB", border: "#E5E7EB", text: "#374151", icon: "📌" },
};

// ─── Block type registry ──────────────────────────────────────────────────────
const BTYPES = [
  { type: "paragraph", icon: "¶",   label: "Text",          desc: "Plain paragraph text",            group: "Basic" },
  { type: "h1",        icon: "H1",  label: "Heading 1",     desc: "Big section heading",             group: "Basic" },
  { type: "h2",        icon: "H2",  label: "Heading 2",     desc: "Medium section heading",          group: "Basic" },
  { type: "h3",        icon: "H3",  label: "Heading 3",     desc: "Small section heading",           group: "Basic" },
  { type: "bullet",    icon: "•",   label: "Bulleted List", desc: "Simple bulleted list item",       group: "List"  },
  { type: "numbered",  icon: "1.",  label: "Numbered List", desc: "Ordered list with numbers",       group: "List"  },
  { type: "todo",      icon: "☐",   label: "To-do",         desc: "Trackable checkbox item",         group: "List"  },
  { type: "quote",     icon: "❝",   label: "Quote",         desc: "Highlighted quotation",           group: "Media" },
  { type: "callout",   icon: "💡",  label: "Callout",       desc: "Highlighted callout box",         group: "Media" },
  { type: "code",      icon: "</>", label: "Code Block",    desc: "Monospaced code with syntax",     group: "Media" },
  { type: "divider",   icon: "—",   label: "Divider",       desc: "Visual horizontal rule",          group: "Media" },
];

// ─── Utility ──────────────────────────────────────────────────────────────────
let _uid = 1000;
const uid = () => `id_${_uid++}`;

function renderMd(text = "") {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/`(.+?)`/g, `<code style="background:#F0F1F5;padding:2px 5px;border-radius:3px;font-size:0.87em;font-family:monospace;color:#C2185B">$1</code>`)
    .replace(/\n/g, "<br/>");
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  const map = { pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊", ppt: "📑", pptx: "📑", png: "🖼️", jpg: "🖼️", jpeg: "🖼️", gif: "🖼️", zip: "📦", rar: "📦", fig: "🎨", sketch: "🎨", mp4: "🎬", mp3: "🎵", csv: "📊" };
  return map[ext] || "📎";
}

function wrapSel(textarea, before, after = before) {
  const s = textarea.selectionStart, e = textarea.selectionEnd;
  const val = textarea.value;
  const sel = val.slice(s, e);
  return val.slice(0, s) + before + sel + after + val.slice(e);
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const mkBlock = (type, content, extra = {}) => ({ id: uid(), type, content, checked: false, calloutColor: "blue", ...extra });

const SEED_PAGES = [
  {
    id: "pg-home", title: "Welcome to ClawForge Docs", emoji: "⚡", cover: L.blueGlow, parentId: null,
    createdAt: "Feb 20, 2026", updatedAt: "Today, 10:52 AM", tags: ["workspace", "home"],
    blocks: [
      mkBlock("h1", "ClawForge Knowledge Base"),
      mkBlock("callout", "Your shared workspace for writing, planning, and organizing everything. Press **/** on any empty line to insert blocks.", { calloutColor: "blue" }),
      mkBlock("h2", "Getting Started"),
      mkBlock("bullet", "Click any page in the sidebar to open and edit it"),
      mkBlock("bullet", "Press **Enter** to create a new block, **/** to change its type"),
      mkBlock("bullet", "Use **Files** in the sidebar to upload and browse documents"),
      mkBlock("bullet", "Hover any block to reveal the drag handle and block type"),
      mkBlock("divider", ""),
      mkBlock("h2", "Workspace Pages"),
      mkBlock("paragraph", "Use the sidebar to navigate between pages. Nest pages by creating sub-pages inside any existing page."),
      mkBlock("todo", "Set up your first page", { checked: true }),
      mkBlock("todo", "Upload brand assets to Files", { checked: true }),
      mkBlock("todo", "Invite team members", { checked: false }),
      mkBlock("todo", "Create Q2 planning document", { checked: false }),
    ],
  },
  {
    id: "pg-launch", title: "Launch Plan", emoji: "🚀", cover: null, parentId: null,
    createdAt: "Feb 22, 2026", updatedAt: "Today, 9:14 AM", tags: ["launch", "planning"],
    blocks: [
      mkBlock("h1", "ClawForge Launch Plan — Q1 2026"),
      mkBlock("paragraph", "**Owner:** Joseph Caldwell · **Target:** March 15, 2026 · **Status:** 🟡 On track"),
      mkBlock("divider", ""),
      mkBlock("h2", "Phase 1 — Pre-Launch (Feb 24 – Mar 7)"),
      mkBlock("todo", "Finalize onboarding flow and help docs", { checked: true }),
      mkBlock("todo", "Publish 3 launch blog posts", { checked: false }),
      mkBlock("todo", "Complete Stripe billing integration", { checked: true }),
      mkBlock("todo", "Load test: 500 concurrent users", { checked: false }),
      mkBlock("todo", "Press outreach to 12 publications", { checked: false }),
      mkBlock("h2", "Phase 2 — Launch Week (Mar 8–15)"),
      mkBlock("bullet", "ProductHunt launch — coordinate with community manager"),
      mkBlock("bullet", "Email blast to 4,200 waitlist subscribers"),
      mkBlock("bullet", "Live demo stream — YouTube + LinkedIn"),
      mkBlock("bullet", "Paid ads go live: Meta $80/day + Google $120/day"),
      mkBlock("h2", "Success Metrics"),
      mkBlock("paragraph", "| Metric | Target | Current |"),
      mkBlock("callout", "Day-1 signups: **150** · Week-1 MRR: **$2,400** · PR hits: **6 publications**", { calloutColor: "green" }),
    ],
  },
  {
    id: "pg-meetings", title: "Meeting Notes", emoji: "📋", cover: null, parentId: null,
    createdAt: "Feb 18, 2026", updatedAt: "Yesterday", tags: ["meetings"],
    blocks: [
      mkBlock("h1", "Meeting Notes"),
      mkBlock("paragraph", "Ongoing log of all key meetings, decisions, and action items."),
      mkBlock("divider", ""),
      mkBlock("h2", "📅 Feb 27 — Morning Standup"),
      mkBlock("bullet", "**OPs CEO:** v1.3.2 deployed, all health checks green. VPC resize queued."),
      mkBlock("bullet", "**Marketing CEO:** Meta CPL down 22%, requesting budget increase to $80/day — *approved*"),
      mkBlock("bullet", "**Sales CEO:** Meridian Consulting proposal sent, $1,397/mo target"),
      mkBlock("bullet", "**Security:** WAF blocked 185.220.100.0/24, elevated scanning in progress"),
      mkBlock("h3", "Action Items"),
      mkBlock("todo", "Joseph: sign off Terraform VPC resize plan", { checked: false }),
      mkBlock("todo", "DevOps: run load test this Thursday", { checked: false }),
      mkBlock("todo", "Marketing: launch updated Meta audience segment", { checked: true }),
      mkBlock("divider", ""),
      mkBlock("h2", "📅 Feb 26 — Investor Call"),
      mkBlock("paragraph", "Call with **Meridian Capital** re: seed round. Duration: 47 min. Outcome: *Positive — follow-up scheduled March 6.*"),
      mkBlock("quote", "We've been looking for an AI orchestration platform that actually works end-to-end. ClawForge is the closest thing we've seen. — Meridian Capital"),
      mkBlock("bullet", "Deck well received, especially agent hierarchy demo"),
      mkBlock("bullet", "Questions around security posture — SS report shared"),
      mkBlock("bullet", "Next steps: due diligence package by March 4"),
    ],
  },
  {
    id: "pg-techref", title: "Technical Reference", emoji: "🔧", cover: null, parentId: null,
    createdAt: "Feb 15, 2026", updatedAt: "Feb 25, 2026", tags: ["engineering", "docs"],
    blocks: [
      mkBlock("h1", "Technical Reference"),
      mkBlock("paragraph", "Architecture, API docs, deployment guides, and engineering standards."),
      mkBlock("divider", ""),
      mkBlock("h2", "Tech Stack"),
      mkBlock("bullet", "**Frontend:** Next.js 14, React 18, Tailwind CSS"),
      mkBlock("bullet", "**Backend:** FastAPI (Python 3.11), PostgreSQL 15, Redis 7"),
      mkBlock("bullet", "**Workers:** Celery + Redis, Docker Compose"),
      mkBlock("bullet", "**Infra:** AWS ECS, ALB, RDS, S3, CloudWatch"),
      mkBlock("h2", "Environment Variables"),
      mkBlock("code", "DATABASE_URL=postgresql://user:pass@host:5432/clawforge\nREDIS_URL=redis://localhost:6379\nANTHROPIC_API_KEY=sk-ant-...\nOPENAI_API_KEY=sk-...\nSTRIPE_SECRET_KEY=sk_live_..."),
      mkBlock("h2", "Docker Compose"),
      mkBlock("code", "services:\n  api:\n    build: ./backend\n    ports: [\"8000:8000\"]\n  worker:\n    build: ./backend\n    command: celery -A app.worker worker\n  postgres:\n    image: postgres:15\n  redis:\n    image: redis:7-alpine"),
      mkBlock("callout", "Never commit `.env` files. Use AWS Secrets Manager in production.", { calloutColor: "amber" }),
    ],
  },
  {
    id: "pg-ideas", title: "Ideas & Brainstorming", emoji: "💡", cover: null, parentId: null,
    createdAt: "Feb 10, 2026", updatedAt: "Feb 24, 2026", tags: ["ideas"],
    blocks: [
      mkBlock("h1", "Ideas & Brainstorming"),
      mkBlock("paragraph", "Raw ideas, experiments, and things worth exploring. Nothing is too early to write down."),
      mkBlock("divider", ""),
      mkBlock("h2", "Product Ideas"),
      mkBlock("bullet", "**Agent Marketplace** — let customers share and fork agent configs"),
      mkBlock("bullet", "**Workflow Templates** — pre-built multi-agent workflows by industry"),
      mkBlock("bullet", "**Agent Memory** — persistent long-term memory per agent with vector DB"),
      mkBlock("bullet", "**Mobile App** — monitor agents + approve tasks on the go"),
      mkBlock("h2", "Marketing Experiments"),
      mkBlock("bullet", "Cold outreach to Notion power users — frame as *AI-native workspace*"),
      mkBlock("bullet", "Partner with AI newsletter (TLDR, Ben's Bites) for launch week"),
      mkBlock("bullet", "YouTube series: *Building with agents in public*"),
      mkBlock("h2", "Revenue Ideas"),
      mkBlock("todo", "Explore white-label tier — agencies reselling ClawForge", { checked: false }),
      mkBlock("todo", "Per-agent pricing model vs seat-based — model the math", { checked: false }),
      mkBlock("todo", "Annual plan discount (20% off) to improve cash flow", { checked: true }),
    ],
  },
];

const SEED_FILES = [
  { id: "f1", name: "ClawForge-Deck-v4.pptx",    size: 3840000, folderId: null, uploadedAt: "Today, 10:30 AM",   uploadedBy: "Joseph" },
  { id: "f2", name: "Q1-Metrics-Final.xlsx",       size: 912000,  folderId: null, uploadedAt: "Yesterday, 4:15 PM", uploadedBy: "Finance CEO" },
  { id: "f3", name: "Brand-Assets-v3.zip",         size: 14500000,folderId: "fd1", uploadedAt: "Feb 25, 2026",   uploadedBy: "Marketing CEO" },
  { id: "f4", name: "logo-primary.png",            size: 142000,  folderId: "fd1", uploadedAt: "Feb 25, 2026",   uploadedBy: "Marketing CEO" },
  { id: "f5", name: "wireframes-v6.fig",            size: 8200000, folderId: "fd2", uploadedAt: "Feb 24, 2026",   uploadedBy: "Joseph" },
  { id: "f6", name: "API-spec-openapi.yaml",        size: 67000,   folderId: "fd2", uploadedAt: "Feb 22, 2026",   uploadedBy: "Full-Stack Dev" },
  { id: "f7", name: "Meridian-NDA-signed.pdf",      size: 245000,  folderId: "fd3", uploadedAt: "Feb 21, 2026",   uploadedBy: "Joseph" },
  { id: "f8", name: "clawforge-security-report.pdf",size: 1200000, folderId: "fd3", uploadedAt: "Feb 20, 2026",   uploadedBy: "Security Sentinel" },
];

const SEED_FOLDERS = [
  { id: "fd1", name: "Marketing Assets", parentId: null },
  { id: "fd2", name: "Engineering",      parentId: null },
  { id: "fd3", name: "Legal & Finance",  parentId: null },
];

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ModalCard({ width = 480, children }) {
  return (
    <div style={{
      width, maxHeight: "88vh", background: L.surface, borderRadius: 14,
      border: `1px solid ${L.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>{children}</div>
  );
}

function MHead({ icon, title, subtitle, onClose }) {
  return (
    <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${L.border}`, display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: L.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: L.textMuted, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${L.border}`, background: L.elevated, color: L.textSec, cursor: "pointer", fontSize: 13 }}>✕</button>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, autoFocus }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: L.textSec, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${L.border}`, background: L.bg, color: L.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        onFocus={e => e.target.style.borderColor = L.blue}
        onBlur={e => e.target.style.borderColor = L.border}
      />
    </div>
  );
}

function Btn({ children, onClick, variant = "default", disabled, style: extraStyle }) {
  const styles = {
    default: { background: L.elevated, border: `1px solid ${L.border}`, color: L.textSec },
    primary: { background: L.blue, border: "none", color: "#fff" },
    danger:  { background: L.redLight, border: `1px solid ${L.red}30`, color: L.red },
    ghost:   { background: "transparent", border: "none", color: L.textSec },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 16px", borderRadius: 7, cursor: disabled ? "default" : "pointer",
      fontSize: 12, fontWeight: 600, opacity: disabled ? 0.5 : 1,
      display: "flex", alignItems: "center", gap: 5,
      ...s, ...extraStyle,
    }}>{children}</button>
  );
}

// ─── Slash Command Menu ───────────────────────────────────────────────────────
function SlashMenu({ query, onSelect, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const filtered = BTYPES.filter(bt => bt.label.toLowerCase().includes(query.toLowerCase()) || bt.desc.toLowerCase().includes(query.toLowerCase()));
  const grouped = ["Basic", "List", "Media"].map(g => ({ group: g, items: filtered.filter(i => i.group === g) })).filter(g => g.items.length > 0);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter")     { e.preventDefault(); if (filtered[activeIdx]) onSelect(filtered[activeIdx].type); }
      if (e.key === "Escape")    { onClose(); }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [activeIdx, filtered, onSelect, onClose]);

  if (filtered.length === 0) return (
    <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 200, background: L.surface, border: `1px solid ${L.border}`, borderRadius: 10, padding: "12px 14px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: 12, color: L.textMuted }}>
      No results for "/{query}"
    </div>
  );

  let globalIdx = 0;
  return (
    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200, background: L.surface, border: `1px solid ${L.border}`, borderRadius: 12, width: 260, boxShadow: "0 12px 40px rgba(0,0,0,0.14)", overflow: "hidden" }}>
      <div style={{ padding: "10px 12px 6px", fontSize: 10, fontWeight: 700, color: L.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Block Types</div>
      {grouped.map(({ group, items }) => (
        <div key={group}>
          <div style={{ padding: "6px 12px 3px", fontSize: 9, fontWeight: 700, color: L.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{group}</div>
          {items.map(bt => {
            const idx = globalIdx++;
            const isActive = idx === activeIdx;
            return (
              <div key={bt.type} onMouseDown={() => onSelect(bt.type)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 12px",
                cursor: "pointer", background: isActive ? L.blueGlow : "transparent",
                transition: "background 0.1s",
              }}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, background: L.elevated, border: `1px solid ${L.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: L.textSec, flexShrink: 0, fontFamily: "monospace" }}>{bt.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? L.blue : L.text }}>{bt.label}</div>
                  <div style={{ fontSize: 10, color: L.textMuted }}>{bt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ padding: "8px 12px", borderTop: `1px solid ${L.border}`, fontSize: 10, color: L.textMuted }}>↑↓ navigate · Enter select · Esc close</div>
    </div>
  );
}

// ─── Formatting toolbar ───────────────────────────────────────────────────────
function FormatBar({ activeBlockId, blocks, onChangeContent }) {
  const tools = [
    { label: "B",  title: "Bold",          wrap: ["**", "**"],  style: { fontWeight: 800 } },
    { label: "I",  title: "Italic",         wrap: ["*", "*"],    style: { fontStyle: "italic" } },
    { label: "S",  title: "Strikethrough",  wrap: ["~~", "~~"],  style: { textDecoration: "line-through" } },
    { label: "`",  title: "Inline Code",    wrap: ["`", "`"],    style: { fontFamily: "monospace" } },
  ];

  const applyWrap = (before, after) => {
    const textarea = document.querySelector(`textarea[data-blockid="${activeBlockId}"]`);
    if (!textarea) return;
    const newVal = wrapSel(textarea, before, after);
    onChangeContent(activeBlockId, newVal);
    setTimeout(() => { textarea.focus(); textarea.selectionEnd = textarea.selectionStart + before.length; }, 10);
  };

  return (
    <div style={{
      height: 40, background: L.surface, borderBottom: `1px solid ${L.border}`,
      display: "flex", alignItems: "center", padding: "0 20px", gap: 2, flexShrink: 0,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: L.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginRight: 10 }}>Format</div>
      {tools.map(t => (
        <button key={t.label} title={t.title} onMouseDown={e => { e.preventDefault(); applyWrap(t.wrap[0], t.wrap[1]); }} style={{
          width: 28, height: 28, borderRadius: 5, border: "none", background: "transparent",
          color: L.textSec, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center",
          justifyContent: "center", ...t.style,
        }}
          onMouseEnter={e => e.currentTarget.style.background = L.elevated}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >{t.label}</button>
      ))}
      <div style={{ width: 1, height: 18, background: L.border, margin: "0 8px" }} />

      {/* Block type quick switch */}
      {["H1", "H2", "H3"].map((h, i) => {
        const type = ["h1","h2","h3"][i];
        const active = blocks.find(b => b.id === activeBlockId)?.type === type;
        return (
          <button key={h} title={`Heading ${i+1}`} style={{
            width: 28, height: 28, borderRadius: 5, border: "none",
            background: active ? L.blueGlow : "transparent",
            color: active ? L.blue : L.textSec, cursor: "pointer", fontSize: 10, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
            onMouseEnter={e => e.currentTarget.style.background = L.elevated}
            onMouseLeave={e => e.currentTarget.style.background = active ? L.blueGlow : "transparent"}
          >{h}</button>
        );
      })}

      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 10, color: L.textMuted }}>
        {activeBlockId ? "Block selected · **text** = bold · *text* = italic · `text` = code" : "Click a block to edit"}
      </div>
    </div>
  );
}

// ─── Single block component ───────────────────────────────────────────────────
function Block({ block, index, isFocused, onFocus, onContent, onTypeChange, onNewBlock, onDelete, onCheckToggle }) {
  const taRef = useRef(null);
  const [showSlash, setShowSlash] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [hover, setHover] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = taRef.current.scrollHeight + "px";
    }
  }, [block.content, isFocused]);

  // Focus on becoming active
  useEffect(() => {
    if (isFocused && taRef.current) taRef.current.focus();
  }, [isFocused]);

  const handleKeyDown = (e) => {
    if (showSlash) return; // let SlashMenu handle arrow/enter
    if (e.key === "Enter" && !e.shiftKey && block.type !== "code") {
      e.preventDefault();
      onNewBlock(block.id);
    }
    if (e.key === "Backspace" && block.content === "") {
      e.preventDefault();
      onDelete(block.id);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.startsWith("/")) {
      setShowSlash(true);
      setSlashQuery(val.slice(1));
    } else {
      setShowSlash(false);
      setSlashQuery("");
    }
    onContent(block.id, val);
  };

  const handleSlashSelect = (type) => {
    onTypeChange(block.id, type);
    onContent(block.id, "");
    setShowSlash(false);
    setSlashQuery("");
    setTimeout(() => taRef.current?.focus(), 20);
  };

  // ── Block type styles ──
  const getBlockStyle = () => {
    const base = { fontSize: 14, lineHeight: 1.65, color: L.text, padding: "1px 0", fontFamily: "'DM Sans','Segoe UI',sans-serif" };
    if (block.type === "h1") return { ...base, fontSize: 28, fontWeight: 800, lineHeight: 1.25, letterSpacing: -0.5, color: L.text, padding: "6px 0 2px" };
    if (block.type === "h2") return { ...base, fontSize: 21, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.3, color: L.text, padding: "4px 0 2px" };
    if (block.type === "h3") return { ...base, fontSize: 16, fontWeight: 700, lineHeight: 1.4, color: L.text, padding: "2px 0" };
    if (block.type === "code") return { ...base, fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12.5, lineHeight: 1.7 };
    if (block.type === "quote") return { ...base, fontStyle: "italic", color: L.textSec };
    return base;
  };

  const sharedTextStyle = { width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", padding: 0, margin: 0, fontFamily: "inherit", boxSizing: "border-box", overflow: "hidden", ...getBlockStyle() };

  // ── Divider ──
  if (block.type === "divider") return (
    <div style={{ padding: "12px 0", cursor: "pointer" }} onClick={() => onFocus(block.id)}>
      <div style={{ height: 1, background: L.border }} />
    </div>
  );

  // ── Callout ──
  if (block.type === "callout") {
    const cc = CALLOUT[block.calloutColor] || CALLOUT.blue;
    return (
      <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: cc.bg, border: `1px solid ${cc.border}`, margin: "4px 0", position: "relative" }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      >
        <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{cc.icon}</span>
        <div style={{ flex: 1, position: "relative" }}>
          {isFocused
            ? <textarea ref={taRef} data-blockid={block.id} value={block.content} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)}
                style={{ ...sharedTextStyle, color: cc.text, fontStyle: "normal" }} placeholder="Callout text..." />
            : <div onClick={() => onFocus(block.id)} style={{ ...getBlockStyle(), color: cc.text, minHeight: 20 }} dangerouslySetInnerHTML={{ __html: renderMd(block.content) || `<span style="color:${cc.border}">Empty callout…</span>` }} />
          }
          {showSlash && <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
        </div>
      </div>
    );
  }

  // ── Code block ──
  if (block.type === "code") {
    return (
      <div style={{ borderRadius: 10, background: "#1E2028", border: `1px solid #2D3040`, margin: "6px 0", overflow: "hidden", position: "relative" }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      >
        <div style={{ padding: "8px 14px", background: "#252830", borderBottom: "1px solid #2D3040", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
          <span style={{ marginLeft: 8, fontSize: 10, color: "#666", fontFamily: "monospace" }}>code</span>
        </div>
        <div style={{ padding: "14px 16px", position: "relative" }}>
          {isFocused
            ? <textarea ref={taRef} data-blockid={block.id} value={block.content} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)}
                style={{ ...sharedTextStyle, color: "#E8EAED", fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12.5, lineHeight: 1.7 }} placeholder="// Code here…" />
            : <pre onClick={() => onFocus(block.id)} style={{ margin: 0, fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12.5, color: "#E8EAED", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", cursor: "text", minHeight: 20 }}>{block.content || <span style={{ color: "#666" }}>// Code here…</span>}</pre>
          }
        </div>
      </div>
    );
  }

  // ── Quote ──
  if (block.type === "quote") return (
    <div style={{ display: "flex", gap: 0, margin: "4px 0", position: "relative" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >
      <div style={{ width: 3, borderRadius: 99, background: L.border, flexShrink: 0, marginRight: 14 }} />
      <div style={{ flex: 1, position: "relative" }}>
        {isFocused
          ? <textarea ref={taRef} data-blockid={block.id} value={block.content} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)}
              style={{ ...sharedTextStyle, fontStyle: "italic", color: L.textSec }} placeholder="Quote text…" />
          : <div onClick={() => onFocus(block.id)} style={{ ...getBlockStyle(), minHeight: 20 }} dangerouslySetInnerHTML={{ __html: renderMd(block.content) || `<span style="color:${L.textMuted}">Quote text…</span>` }} />
        }
        {showSlash && <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
      </div>
    </div>
  );

  // ── To-do ──
  if (block.type === "todo") return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "2px 0", position: "relative" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >
      <div onClick={() => onCheckToggle(block.id)} style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 4, cursor: "pointer",
        background: block.checked ? L.blue : "transparent",
        border: `1.5px solid ${block.checked ? L.blue : L.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff",
        transition: "all 0.15s",
      }}>{block.checked ? "✓" : ""}</div>
      <div style={{ flex: 1, position: "relative" }}>
        {isFocused
          ? <textarea ref={taRef} data-blockid={block.id} value={block.content} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)}
              style={{ ...sharedTextStyle, textDecoration: block.checked ? "line-through" : "none", color: block.checked ? L.textMuted : L.text }} placeholder="Task…" />
          : <div onClick={() => onFocus(block.id)} style={{ ...getBlockStyle(), textDecoration: block.checked ? "line-through" : "none", color: block.checked ? L.textMuted : L.text, minHeight: 20 }} dangerouslySetInnerHTML={{ __html: renderMd(block.content) || `<span style="color:${L.textMuted}">Task…</span>` }} />
        }
        {showSlash && <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
      </div>
    </div>
  );

  // ── Bullet ──
  if (block.type === "bullet") return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "1px 0", position: "relative" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: L.textMuted, flexShrink: 0, marginTop: 10 }} />
      <div style={{ flex: 1, position: "relative" }}>
        {isFocused
          ? <textarea ref={taRef} data-blockid={block.id} value={block.content} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} style={sharedTextStyle} placeholder="List item…" />
          : <div onClick={() => onFocus(block.id)} style={{ ...getBlockStyle(), minHeight: 20 }} dangerouslySetInnerHTML={{ __html: renderMd(block.content) || `<span style="color:${L.textMuted}">List item…</span>` }} />
        }
        {showSlash && <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
      </div>
    </div>
  );

  // ── Numbered ──
  if (block.type === "numbered") return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "1px 0", position: "relative" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >
      <div style={{ fontSize: 13, color: L.textMuted, flexShrink: 0, marginTop: 2, minWidth: 20, fontWeight: 500 }}>{index + 1}.</div>
      <div style={{ flex: 1, position: "relative" }}>
        {isFocused
          ? <textarea ref={taRef} data-blockid={block.id} value={block.content} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} style={sharedTextStyle} placeholder="List item…" />
          : <div onClick={() => onFocus(block.id)} style={{ ...getBlockStyle(), minHeight: 20 }} dangerouslySetInnerHTML={{ __html: renderMd(block.content) || `<span style="color:${L.textMuted}">List item…</span>` }} />
        }
        {showSlash && <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
      </div>
    </div>
  );

  // ── Paragraph / Headings (default) ──
  const ph = { paragraph: "Type something, or press / for commands…", h1: "Heading 1", h2: "Heading 2", h3: "Heading 3" }[block.type] || "";

  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >
      {/* Drag handle */}
      {hover && (
        <div style={{ position: "absolute", left: -28, top: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{ fontSize: 11, color: L.textMuted, cursor: "grab", padding: "2px", lineHeight: 1 }}>⋮⋮</div>
        </div>
      )}
      {isFocused
        ? <textarea ref={taRef} data-blockid={block.id} value={block.content} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} style={{ ...sharedTextStyle }} placeholder={ph} />
        : <div onClick={() => onFocus(block.id)} style={{ ...getBlockStyle(), minHeight: 20, cursor: "text" }}
            dangerouslySetInnerHTML={{ __html: block.content ? renderMd(block.content) : `<span style="color:${L.textMuted}">${ph}</span>` }}
          />
      }
      {showSlash && <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
    </div>
  );
}

// ─── Page Editor ──────────────────────────────────────────────────────────────
function PageEditor({ page, onUpdatePage, onOpenEmojiPicker }) {
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const titleRef = useRef(null);

  const onContent  = (id, val)  => onUpdatePage(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, content: val } : b) }));
  const onTypeChange = (id, t)  => onUpdatePage(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, type: t } : b) }));
  const onCheckToggle = (id)    => onUpdatePage(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, checked: !b.checked } : b) }));

  const onNewBlock = (afterId) => {
    const newBlock = mkBlock("paragraph", "");
    onUpdatePage(p => {
      const idx = p.blocks.findIndex(b => b.id === afterId);
      const newBlocks = [...p.blocks];
      newBlocks.splice(idx + 1, 0, newBlock);
      return { ...p, blocks: newBlocks };
    });
    setTimeout(() => setFocusedBlockId(newBlock.id), 20);
  };

  const onDelete = (id) => {
    onUpdatePage(p => {
      const idx = p.blocks.findIndex(b => b.id === id);
      const prev = p.blocks[idx - 1];
      const newBlocks = p.blocks.filter(b => b.id !== id);
      if (prev) setTimeout(() => setFocusedBlockId(prev.id), 10);
      return { ...p, blocks: newBlocks };
    });
  };

  const addBlock = () => {
    const nb = mkBlock("paragraph", "");
    onUpdatePage(p => ({ ...p, blocks: [...p.blocks, nb] }));
    setTimeout(() => setFocusedBlockId(nb.id), 20);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Formatting toolbar */}
      <FormatBar activeBlockId={focusedBlockId} blocks={page.blocks} onChangeContent={onContent} />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto" }} onClick={() => { if (!focusedBlockId) addBlock(); }}>
        <div style={{ maxWidth: 740, margin: "0 auto", padding: "40px 60px 120px" }}>

          {/* Page cover */}
          {page.cover && (
            <div style={{ height: 160, borderRadius: 12, background: `linear-gradient(135deg, ${L.blueGlow}, ${L.purpleLight})`, border: `1px solid ${L.border}`, marginBottom: 20, display: "flex", alignItems: "flex-end", padding: "0 0 16px 20px" }}>
              <div style={{ fontSize: 9, color: L.textMuted, fontWeight: 500 }}>COVER · Click to change</div>
            </div>
          )}

          {/* Emoji + Title */}
          <div style={{ marginBottom: 6 }}>
            <div onClick={() => onOpenEmojiPicker(page.id)} style={{ fontSize: 56, cursor: "pointer", display: "inline-block", lineHeight: 1, marginBottom: 12, transition: "transform 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >{page.emoji}</div>
          </div>
          <textarea ref={titleRef} value={page.title}
            onChange={e => onUpdatePage(p => ({ ...p, title: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (page.blocks.length > 0) setFocusedBlockId(page.blocks[0].id); else addBlock(); } }}
            placeholder="Untitled"
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none",
              fontSize: 38, fontWeight: 800, color: L.text, letterSpacing: -0.8, lineHeight: 1.2,
              fontFamily: "inherit", resize: "none", padding: 0, marginBottom: 16, boxSizing: "border-box",
            }}
          />

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${L.borderLight}` }}>
            <span style={{ fontSize: 11, color: L.textMuted }}>Created {page.createdAt}</span>
            <span style={{ fontSize: 11, color: L.textMuted }}>·</span>
            <span style={{ fontSize: 11, color: L.textMuted }}>Updated {page.updatedAt}</span>
            {page.tags.map(t => (
              <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: L.elevated, border: `1px solid ${L.border}`, color: L.textSec, fontWeight: 500 }}>{t}</span>
            ))}
          </div>

          {/* Blocks */}
          <div style={{ paddingLeft: 30 }}>
            {page.blocks.map((block, i) => (
              <div key={block.id} style={{ marginBottom: block.type === "divider" ? 0 : 2 }}>
                <Block
                  block={block} index={i}
                  isFocused={focusedBlockId === block.id}
                  onFocus={setFocusedBlockId}
                  onContent={onContent}
                  onTypeChange={onTypeChange}
                  onNewBlock={onNewBlock}
                  onDelete={onDelete}
                  onCheckToggle={onCheckToggle}
                />
              </div>
            ))}
          </div>

          {/* Add block hint */}
          <div onClick={addBlock} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 8px 30px", marginTop: 8, cursor: "pointer", opacity: 0 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <div style={{ width: 18, height: 18, borderRadius: 4, background: L.elevated, border: `1px solid ${L.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: L.textMuted }}>+</div>
            <span style={{ fontSize: 12, color: L.textMuted }}>Add a block</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── File Manager ─────────────────────────────────────────────────────────────
function FileManager({ files, folders, onUpload, onPreviewFile, currentFolder, onSetCurrentFolder }) {
  const [view, setView] = useState("grid");
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  const setCurrentFolder = onSetCurrentFolder;
  const currentFolders = folders.filter(f => f.parentId === currentFolder);
  const currentFiles   = files.filter(f => f.folderId === currentFolder);

  // Build full breadcrumb by walking up the folder tree
  const buildBreadcrumb = (folderId) => {
    const crumbs = [{ id: null, name: "Files" }];
    const walk = (id) => {
      if (!id) return;
      const f = folders.find(x => x.id === id);
      if (!f) return;
      walk(f.parentId);
      crumbs.push({ id: f.id, name: f.name });
    };
    walk(folderId);
    return crumbs;
  };
  const breadcrumb = buildBreadcrumb(currentFolder);

  const handleFileDrop = (e) => {
    e.preventDefault(); setDraggingOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => onUpload(file, currentFolder));
  };

  const handleFileInput = (e) => {
    Array.from(e.target.files).forEach(file => onUpload(file, currentFolder));
    e.target.value = "";
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ height: 56, background: L.surface, borderBottom: `1px solid ${L.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          {breadcrumb.map((b, i) => (
            <span key={b.id || "root"} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ color: L.textMuted, fontSize: 13 }}>›</span>}
              <span onClick={() => setCurrentFolder(b.id)} style={{ fontSize: 13, fontWeight: i === breadcrumb.length - 1 ? 700 : 500, color: i === breadcrumb.length - 1 ? L.text : L.blue, cursor: "pointer" }}>{b.name}</span>
            </span>
          ))}
        </div>
        {/* View toggle */}
        <div style={{ display: "flex", background: L.elevated, border: `1px solid ${L.border}`, borderRadius: 7, overflow: "hidden" }}>
          {[["grid","▦"],["list","☰"]].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)} style={{ width: 30, height: 28, border: "none", background: view === v ? L.surface : "transparent", color: view === v ? L.text : L.textMuted, cursor: "pointer", fontSize: 13 }}>{icon}</button>
          ))}
        </div>
        <button onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: "none", background: L.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          ↑ Upload
        </button>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileInput} style={{ display: "none" }} />
      </div>

      {/* Drop zone + content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}
        onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={handleFileDrop}
      >
        {/* Drag overlay */}
        {draggingOver && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, background: `${L.blueGlow}`, border: `2px dashed ${L.blue}`, borderRadius: 12, margin: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, pointerEvents: "none" }}>
            <div style={{ fontSize: 40 }}>📁</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: L.blue }}>Drop files to upload</div>
          </div>
        )}

        {/* Folders */}
        {currentFolders.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: L.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Folders</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {currentFolders.map(folder => (
                <div key={folder.id} onDoubleClick={() => setCurrentFolder(folder.id)}
                  style={{ width: 150, padding: "14px 12px", borderRadius: 10, background: L.surface, border: `1px solid ${L.border}`, cursor: "pointer", transition: "all 0.15s", textAlign: "center" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = L.blue; e.currentTarget.style.background = L.blueLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.background = L.surface; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: L.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{folder.name}</div>
                  <div style={{ fontSize: 10, color: L.textMuted, marginTop: 2 }}>{files.filter(f => f.folderId === folder.id).length} files</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {currentFiles.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: L.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Files</div>
            {view === "grid" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {currentFiles.map(file => (
                  <div key={file.id} onClick={() => onPreviewFile(file)}
                    style={{ width: 148, padding: "16px 12px 12px", borderRadius: 10, background: L.surface, border: `1px solid ${L.border}`, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = L.blue + "60"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = L.border; }}
                  >
                    <div style={{ fontSize: 32, textAlign: "center", marginBottom: 10 }}>{fileIcon(file.name)}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: L.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{file.name}</div>
                    <div style={{ fontSize: 10, color: L.textMuted, textAlign: "center", marginTop: 3 }}>{fmtSize(file.size)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: L.surface, borderRadius: 10, border: `1px solid ${L.border}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", padding: "8px 16px", background: L.elevated, borderBottom: `1px solid ${L.border}` }}>
                  {["Name", "Size", "Uploaded by", "Date"].map(h => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, color: L.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
                  ))}
                </div>
                {currentFiles.map((file, i) => (
                  <div key={file.id} onClick={() => onPreviewFile(file)} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", padding: "10px 16px", borderBottom: i < currentFiles.length - 1 ? `1px solid ${L.borderLight}` : "none", cursor: "pointer", alignItems: "center", gap: 16 }}
                    onMouseEnter={e => e.currentTarget.style.background = L.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{fileIcon(file.name)}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: L.text }}>{file.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: L.textSec, textAlign: "right" }}>{fmtSize(file.size)}</span>
                    <span style={{ fontSize: 12, color: L.textSec, textAlign: "right" }}>{file.uploadedBy}</span>
                    <span style={{ fontSize: 11, color: L.textMuted, textAlign: "right" }}>{file.uploadedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {currentFolders.length === 0 && currentFiles.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 14, opacity: 0.6 }}>
            <div style={{ fontSize: 52 }}>📂</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: L.textSec }}>No files here yet</div>
            <div style={{ fontSize: 13, color: L.textMuted }}>Drag and drop files, or click Upload above</div>
          </div>
        )}

        {/* Upload hint */}
        <div style={{ marginTop: 32, padding: "20px", borderRadius: 12, border: `2px dashed ${L.border}`, textAlign: "center", cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={e => { e.currentTarget.style.borderColor = L.blue; e.currentTarget.style.background = L.blueLight; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.background = "transparent"; }}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>⬆️</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: L.textSec }}>Drop files here or click to upload</div>
          <div style={{ fontSize: 11, color: L.textMuted, marginTop: 3 }}>Any file type · No size limit</div>
        </div>
      </div>
    </div>
  );
}

// ─── In-page main menu + docs sidebar ────────────────────────────────────────
function MainMenuSidebar({ activePage, collapsedSections, onToggleSection }) {
  const nav = [
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

  const routeMap = {
    chat: "/chat", brainstorm: "/brainstorm", brainstorming: "/brainstorm", boards: "/boards", tasks: "/boards",
    agentarmy: "/army", configurator: "/configurator?step=1", approvals: "/approvals", files: "/files",
    security: "/security", integrations: "/integrations", costusage: "/costs", settings: "/settings", development: "/development",
  };

  return (
    <div style={{ width: 220, flexShrink: 0, background: L.surface, borderRight: `1px solid ${L.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${L.border}` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${L.orange}, #c2410c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: L.text, letterSpacing: -0.3 }}>ClawForge</div>
          <div style={{ fontSize: 9, color: L.textMuted, letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>Mission Control</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {nav.map((section) => {
          const collapsed = !!collapsedSections[section.section];
          return (
            <div key={section.section} style={{ marginBottom: 4 }}>
              <button
                onClick={() => onToggleSection(section.section)}
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
                  color: L.textMuted,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  padding: "12px 10px 6px",
                }}
              >
                <span>{section.section}</span>
                <span style={{ minWidth: 18, height: 18, borderRadius: 5, display: "inline-flex", alignItems: "center", justifyContent: "center", border: `1px solid ${L.border}`, background: L.elevated, fontSize: 13, fontWeight: 800, lineHeight: 1, color: L.textSec }}>{collapsed ? "+" : "−"}</span>
              </button>
              {!collapsed && section.items.map((item) => {
                const active = item.key === activePage;
                const href = `#${routeMap[item.key] || "/boards"}`;
                return (
                  <a
                    key={item.label}
                    href={href}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "7px 10px", borderRadius: 6, textDecoration: "none",
                      color: active ? L.blue : L.textSec, marginBottom: 1,
                      background: active ? L.blueGlow : "transparent",
                      borderLeft: active ? `2px solid ${L.blue}` : "2px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: 14, color: active ? L.blue : L.textMuted, width: 20, textAlign: "center" }}>{item.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, flex: 1 }}>{item.label}</span>
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

function DocsSidebar({ pages, files, folders, selectedId, currentFolder, onSelect, onSelectFolder, onNewPage, onDeletePage, onNewFolder, onPreviewFile, search, onSearch }) {
  const [pageExpanded,   setPageExpanded]   = useState({ "pg-home": true });
  const [folderExpanded, setFolderExpanded] = useState({ null: true });   // keyed by folder id; null = root
  const [filesExpanded,  setFilesExpanded]  = useState(true);
  const [hoveredPageId,  setHoveredPageId]  = useState(null);
  const [hoveredFoldId,  setHoveredFoldId]  = useState(null);
  const [hoveredFileId,  setHoveredFileId]  = useState(null);
  const [newFolderName,  setNewFolderName]  = useState("");
  const [addingFolder,   setAddingFolder]   = useState(null); // parentId we're adding under (null = root)
  const addFolderRef = useRef(null);

  const isFilesSection = selectedId === "files";

  // ── Page tree ──
  const togglePage = (id) => setPageExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const renderPage = (page, depth = 0) => {
    const isActive  = selectedId === page.id;
    const children  = pages.filter(p => p.parentId === page.id);
    const isOpen    = pageExpanded[page.id];
    const isHovered = hoveredPageId === page.id;
    const matchesSearch = !search || page.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch && !children.some(c => c.title.toLowerCase().includes(search.toLowerCase()))) return null;
    return (
      <div key={page.id}>
        <div onMouseEnter={() => setHoveredPageId(page.id)} onMouseLeave={() => setHoveredPageId(null)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: `5px 8px 5px ${8 + depth * 14}px`, borderRadius: 7, cursor: "pointer", marginBottom: 1, background: isActive ? L.sidebarActive : isHovered ? L.sidebarHover : "transparent", transition: "background 0.1s" }}>
          <div onClick={() => children.length > 0 && togglePage(page.id)}
            style={{ width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: L.textMuted, flexShrink: 0, opacity: children.length > 0 ? 1 : 0, cursor: children.length > 0 ? "pointer" : "default" }}>
            {isOpen ? "▾" : "▸"}
          </div>
          <span style={{ fontSize: 14, flexShrink: 0 }}>{page.emoji}</span>
          <span onClick={() => onSelect(page.id)} style={{ flex: 1, fontSize: 12.5, fontWeight: isActive ? 600 : 400, color: isActive ? L.text : L.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {page.title || "Untitled"}
          </span>
          {isHovered && (
            <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
              <button onClick={e => { e.stopPropagation(); onNewPage(page.id); }}
                style={{ width: 18, height: 18, border: "none", background: "none", color: L.textMuted, cursor: "pointer", borderRadius: 3, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = L.elevated} onMouseLeave={e => e.currentTarget.style.background = "none"}>+</button>
              <button onClick={e => { e.stopPropagation(); onDeletePage(page.id); }}
                style={{ width: 18, height: 18, border: "none", background: "none", color: L.textMuted, cursor: "pointer", borderRadius: 3, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = L.elevated} onMouseLeave={e => e.currentTarget.style.background = "none"}>🗑</button>
            </div>
          )}
        </div>
        {isOpen && children.map(child => renderPage(child, depth + 1))}
      </div>
    );
  };

  // ── Folder tree ──
  const toggleFolder = (id) => setFolderExpanded(prev => ({ ...prev, [String(id)]: !prev[String(id)] }));
  const isFolderOpen = (id) => folderExpanded[String(id)] !== false; // default open

  const commitNewFolder = (parentId) => {
    if (newFolderName.trim()) onNewFolder(newFolderName.trim(), parentId);
    setNewFolderName(""); setAddingFolder(undefined);
  };

  const renderFolder = (folder, depth = 0) => {
    const subFolders   = folders.filter(f => f.parentId === folder.id);
    const folderFiles  = files.filter(f => f.folderId === folder.id);
    const isOpen       = isFolderOpen(folder.id);
    const isFolderActive = isFilesSection && currentFolder === folder.id;
    const isHovered    = hoveredFoldId === folder.id;
    const hasChildren  = subFolders.length > 0 || folderFiles.length > 0;
    const indent       = 8 + depth * 14;

    return (
      <div key={folder.id}>
        {/* Folder row */}
        <div onMouseEnter={() => setHoveredFoldId(folder.id)} onMouseLeave={() => setHoveredFoldId(null)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: `5px 8px 5px ${indent}px`, borderRadius: 7, cursor: "pointer", marginBottom: 1, background: isFolderActive ? L.sidebarActive : isHovered ? L.sidebarHover : "transparent", transition: "background 0.1s" }}>
          {/* Chevron */}
          <div onClick={e => { e.stopPropagation(); toggleFolder(folder.id); }}
            style={{ width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: L.textMuted, flexShrink: 0, opacity: hasChildren ? 1 : 0.3, transition: "transform 0.15s" }}>
            {isOpen ? "▾" : "▸"}
          </div>
          {/* Folder icon — open vs closed */}
          <span style={{ fontSize: 14, flexShrink: 0 }}>{isOpen && hasChildren ? "📂" : "📁"}</span>
          {/* Name */}
          <span onClick={() => onSelectFolder(folder.id)} style={{ flex: 1, fontSize: 12.5, fontWeight: isFolderActive ? 600 : 400, color: isFolderActive ? L.text : L.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {folder.name}
          </span>
          {/* File count badge */}
          {folderFiles.length > 0 && !isHovered && (
            <span style={{ fontSize: 9, color: L.textMuted, flexShrink: 0 }}>{folderFiles.length}</span>
          )}
          {/* Hover actions */}
          {isHovered && (
            <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
              <button title="New sub-folder" onClick={e => { e.stopPropagation(); setAddingFolder(folder.id); setFolderExpanded(p => ({ ...p, [String(folder.id)]: true })); setTimeout(() => addFolderRef.current?.focus(), 30); }}
                style={{ width: 18, height: 18, border: "none", background: "none", color: L.textMuted, cursor: "pointer", borderRadius: 3, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = L.elevated} onMouseLeave={e => e.currentTarget.style.background = "none"}>+</button>
            </div>
          )}
        </div>

        {/* Children */}
        {isOpen && (
          <div>
            {subFolders.map(sf => renderFolder(sf, depth + 1))}
            {/* New sub-folder input */}
            {addingFolder === folder.id && (
              <div style={{ padding: `4px 8px 4px ${indent + 14 + 5 + 14 + 5}px` }}>
                <input ref={addFolderRef} value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") commitNewFolder(folder.id); if (e.key === "Escape") { setAddingFolder(undefined); setNewFolderName(""); } }}
                  onBlur={() => { commitNewFolder(folder.id); }}
                  placeholder="Folder name…"
                  style={{ width: "100%", padding: "4px 8px", borderRadius: 5, border: `1px solid ${L.blue}`, background: L.surface, color: L.text, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>
            )}
            {folderFiles.map(file => renderFileRow(file, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderFileRow = (file, depth = 0) => {
    const indent  = 8 + depth * 14;
    const isHov   = hoveredFileId === file.id;
    return (
      <div key={file.id} onMouseEnter={() => setHoveredFileId(file.id)} onMouseLeave={() => setHoveredFileId(null)}
        onClick={() => onPreviewFile(file)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: `4px 8px 4px ${indent + 19}px`, borderRadius: 6, cursor: "pointer", marginBottom: 1, background: isHov ? L.sidebarHover : "transparent", transition: "background 0.1s" }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>{fileIcon(file.name)}</span>
        <span style={{ flex: 1, fontSize: 11.5, color: L.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
        <span style={{ fontSize: 9, color: L.textMuted, flexShrink: 0 }}>{fmtSize(file.size)}</span>
      </div>
    );
  };

  const rootFolders = folders.filter(f => !f.parentId);
  const rootFiles   = files.filter(f => !f.folderId);
  const rootPages   = pages.filter(p => !p.parentId);

  return (
    <div style={{ width: 256, flexShrink: 0, background: L.sidebar, borderRight: `1px solid ${L.border}`, display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Logo */}
      <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${L.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${L.orange}, #c2410c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: L.text, letterSpacing: -0.3 }}>ClawForge</div>
            <div style={{ fontSize: 9, color: L.textMuted, letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>Docs</div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: L.textMuted }}>⌕</span>
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search pages…"
            style={{ width: "100%", padding: "7px 10px 7px 28px", borderRadius: 7, border: `1px solid ${L.border}`, background: L.surface, color: L.text, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Scrollable tree area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0" }}>

        {/* ── FILES SECTION ── */}
        <div style={{ marginBottom: 4 }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 4px 4px", marginBottom: 1 }}>
            <div onClick={() => { setFilesExpanded(v => !v); onSelect("files"); onSelectFolder(null); }}
              style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flex: 1 }}>
              <span style={{ fontSize: 9, color: L.textMuted, transition: "transform 0.15s", display: "inline-block", transform: filesExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}>▾</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: isFilesSection && currentFolder === null ? L.blue : L.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Files</span>
              {isFilesSection && currentFolder === null && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: L.blueGlow, color: L.blue }}>open</span>}
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              <button title="New folder" onClick={e => { e.stopPropagation(); setAddingFolder("__root__"); setFilesExpanded(true); setTimeout(() => addFolderRef.current?.focus(), 30); }}
                style={{ width: 18, height: 18, border: "none", background: "none", color: L.textMuted, cursor: "pointer", borderRadius: 3, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = L.elevated} onMouseLeave={e => e.currentTarget.style.background = "none"}>+</button>
            </div>
          </div>

          {filesExpanded && (
            <div>
              {/* Root folders */}
              {rootFolders.map(f => renderFolder(f, 0))}

              {/* New root folder input */}
              {addingFolder === "__root__" && (
                <div style={{ padding: "4px 8px 4px 28px" }}>
                  <input ref={addFolderRef} value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") commitNewFolder(null); if (e.key === "Escape") { setAddingFolder(undefined); setNewFolderName(""); } }}
                    onBlur={() => commitNewFolder(null)}
                    placeholder="New folder name…"
                    style={{ width: "100%", padding: "4px 8px", borderRadius: 5, border: `1px solid ${L.blue}`, background: L.surface, color: L.text, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
              )}

              {/* Root-level files (no folder) */}
              {rootFiles.length > 0 && (
                <div>
                  {rootFiles.map(file => renderFileRow(file, 0))}
                </div>
              )}

              {/* Empty hint */}
              {rootFolders.length === 0 && rootFiles.length === 0 && addingFolder !== "__root__" && (
                <div style={{ padding: "6px 8px 6px 28px", fontSize: 11, color: L.textMuted, fontStyle: "italic" }}>No files yet — click + to add a folder</div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: L.border, margin: "8px 4px 10px" }} />

        {/* ── PAGES SECTION ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 6px 4px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: L.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>Pages</span>
          <button onClick={() => onNewPage(null)} style={{ width: 18, height: 18, border: "none", background: "none", color: L.textMuted, cursor: "pointer", borderRadius: 3, fontSize: 13 }}>+</button>
        </div>
        <div style={{ paddingBottom: 12 }}>
          {rootPages.map(p => renderPage(p))}
          {rootPages.length === 0 && (
            <div style={{ padding: "6px 8px", fontSize: 11.5, color: L.textMuted }}>No pages yet — click + to create one</div>
          )}
        </div>
      </div>

      {/* Bottom user bar */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${L.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${L.blue}, ${L.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>JC</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: L.text }}>Joseph</div>
          <div style={{ fontSize: 10, color: L.textMuted }}>Orchestrator</div>
        </div>
        <button style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${L.border}`, background: L.surface, cursor: "pointer", fontSize: 13 }}>⚙️</button>
      </div>
    </div>
  );
}

// ─── Modal: New Page ──────────────────────────────────────────────────────────
const EMOJIS_QUICK = ["📋","🚀","💡","🔧","📊","📣","🎯","🛡️","💰","📝","🏠","🌐","✨","🤝","⚙️","🎨","📅","📌","🔍","🎉","⚡","📈","🔒","💬"];

function NewPageModal({ parentId, pages, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📋");
  const parent = parentId ? pages.find(p => p.id === parentId) : null;

  return (
    <Overlay onClose={onClose}>
      <ModalCard width={420}>
        <MHead icon="📄" title="New Page" subtitle={parent ? `Inside: ${parent.emoji} ${parent.title}` : "Root page"} onClose={onClose} />
        <div style={{ padding: "20px 22px" }}>
          {/* Emoji picker */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: L.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Icon</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {EMOJIS_QUICK.map(e => (
                <button key={e} onClick={() => setEmoji(e)} style={{
                  width: 34, height: 34, borderRadius: 7, fontSize: 18, border: `1.5px solid ${emoji === e ? L.blue : L.border}`,
                  background: emoji === e ? L.blueLight : L.elevated, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{e}</button>
              ))}
            </div>
          </div>
          <FieldInput label="Page Title" value={title} onChange={setTitle} placeholder="Untitled" autoFocus />
        </div>
        <div style={{ padding: "12px 22px", borderTop: `1px solid ${L.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => title.trim() && onCreate(title.trim(), emoji, parentId)} disabled={!title.trim()}>
            Create Page
          </Btn>
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ─── Modal: Emoji Picker ──────────────────────────────────────────────────────
function EmojiPickerModal({ currentEmoji, onClose, onSelect }) {
  const ALL = ["⚡","📋","🚀","💡","🔧","📊","📣","🎯","🛡️","💰","📝","🏠","🌐","✨","🤝","⚙️","🎨","📅","📌","🎉","📈","🔒","💬","🗓️","📂","🖼️","🎵","🎬","🔑","🌟","💼","🏆","🧠","🔗","📡","🛠️","🎮","🌍","💎","🔥"];
  return (
    <Overlay onClose={onClose}>
      <ModalCard width={340}>
        <MHead icon={currentEmoji} title="Page Icon" subtitle="Choose an emoji for this page" onClose={onClose} />
        <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 280, overflowY: "auto" }}>
          {ALL.map(e => (
            <button key={e} onClick={() => onSelect(e)} style={{
              width: 38, height: 38, borderRadius: 8, fontSize: 20, border: `1.5px solid ${e === currentEmoji ? L.blue : L.border}`,
              background: e === currentEmoji ? L.blueLight : L.elevated, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.1s",
            }}
              onMouseEnter={ev => ev.currentTarget.style.borderColor = L.blue}
              onMouseLeave={ev => ev.currentTarget.style.borderColor = e === currentEmoji ? L.blue : L.border}
            >{e}</button>
          ))}
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ─── Modal: File Preview ──────────────────────────────────────────────────────
function FilePreviewModal({ file, onClose, onDelete }) {
  return (
    <Overlay onClose={onClose}>
      <ModalCard width={460}>
        <MHead icon={fileIcon(file.name)} title={file.name} subtitle={fmtSize(file.size)} onClose={onClose} />
        <div style={{ padding: "20px 22px" }}>
          {/* Preview placeholder */}
          <div style={{ height: 200, borderRadius: 10, background: L.elevated, border: `1px solid ${L.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 52 }}>{fileIcon(file.name)}</div>
            <div style={{ fontSize: 12, color: L.textMuted }}>Preview not available</div>
          </div>
          {/* Metadata */}
          <div style={{ background: L.elevated, borderRadius: 10, border: `1px solid ${L.border}`, overflow: "hidden" }}>
            {[
              { k: "File name",    v: file.name },
              { k: "Size",         v: fmtSize(file.size) },
              { k: "Uploaded by",  v: file.uploadedBy },
              { k: "Upload date",  v: file.uploadedAt },
            ].map(({ k, v }, i, arr) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${L.border}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: L.textSec }}>{k}</span>
                <span style={{ fontSize: 12, color: L.text, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "12px 22px", borderTop: `1px solid ${L.border}`, display: "flex", justifyContent: "space-between", gap: 10 }}>
          <Btn variant="danger" onClick={() => onDelete(file.id)}>🗑 Delete</Btn>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={onClose}>Close</Btn>
            <Btn variant="primary">⬇ Download</Btn>
          </div>
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ─── Modal: Page Settings ─────────────────────────────────────────────────────
function PageSettingsModal({ page, onClose, onUpdate, onDelete }) {
  const [tags, setTags] = useState(page.tags.join(", "));

  return (
    <Overlay onClose={onClose}>
      <ModalCard width={420}>
        <MHead icon={page.emoji} title="Page Settings" subtitle={page.title} onClose={onClose} />
        <div style={{ padding: "20px 22px" }}>
          <FieldInput label="Tags (comma-separated)" value={tags} onChange={setTags} placeholder="planning, launch, docs…" />
          <div style={{ height: 1, background: L.border, margin: "16px 0" }} />
          {[
            { label: "Created", value: page.createdAt },
            { label: "Last updated", value: page.updatedAt },
            { label: "Blocks", value: `${page.blocks.length} blocks` },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: L.textSec }}>{r.label}</span>
              <span style={{ fontSize: 12, color: L.textMuted }}>{r.value}</span>
            </div>
          ))}
          <div style={{ height: 1, background: L.border, margin: "16px 0" }} />
          <button onClick={onDelete} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${L.red}30`, background: L.redLight, color: L.red, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            🗑 Delete this page
          </button>
        </div>
        <div style={{ padding: "12px 22px", borderTop: `1px solid ${L.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => onUpdate({ tags: tags.split(",").map(t => t.trim()).filter(Boolean) })}>Save</Btn>
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function ClawForgeDocs() {
  const [boot] = useState(() => {
    const store = readStore();
    const storedPages = Array.isArray(store?.docs?.pages) && store.docs.pages.length ? store.docs.pages : SEED_PAGES;
    const synced = ensureKnowledgeMapping(storedPages);
    const docs = store.docs || {};
    const payload = {
      pages: synced.pages,
      files: Array.isArray(docs.files) && docs.files.length ? docs.files : SEED_FILES,
      folders: Array.isArray(docs.folders) && docs.folders.length ? docs.folders : SEED_FOLDERS,
      selectedId: docs.selectedId || 'files',
      currentFolder: docs.currentFolder ?? null,
      knowledgeBasePageId: synced.pageId,
      missingKnowledgeLink: !!synced.missingLink,
    };
    store.docs = {
      ...docs,
      pages: payload.pages,
      files: payload.files,
      folders: payload.folders,
      selectedId: payload.selectedId,
      currentFolder: payload.currentFolder,
      knowledgeBasePageId: payload.knowledgeBasePageId,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return payload;
  });

  const [pages,         setPages]         = useState(boot.pages);
  const [files,         setFiles]         = useState(boot.files);
  const [folders,       setFolders]       = useState(boot.folders);
  const [selectedId,    setSelectedId]    = useState(boot.selectedId);
  const [currentFolder, setCurrentFolder] = useState(boot.currentFolder);   // lifted from FileManager
  const [search,        setSearch]        = useState("");
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true });
  const [missingKnowledgeLink] = useState(boot.missingKnowledgeLink);

  // Modals
  const [modal,     setModal]     = useState(null);
  const [modalData, setModalData] = useState(null);

  const selectedPage = pages.find(p => p.id === selectedId);
  const isFiles = selectedId === "files";

  useEffect(() => {
    let t;
    if (collapsedSections.SYSTEM === undefined || collapsedSections.SYSTEM === true) return;
    t = setTimeout(() => setCollapsedSections((p) => ({ ...p, SYSTEM: true })), 12000);
    return () => t && clearTimeout(t);
  }, [collapsedSections.SYSTEM]);

  useEffect(() => {
    const store = readStore();
    const docs = store.docs || {};
    store.docs = {
      ...docs,
      pages,
      files,
      folders,
      selectedId,
      currentFolder,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
  }, [pages, files, folders, selectedId, currentFolder]);

  useEffect(() => {
    const store = readStore();
    const linkedPageId = store?.docs?.knowledgeBasePageId;
    if (!linkedPageId) return;
    const linkedPage = pages.find((p) => p.id === linkedPageId);
    if (!linkedPage) return;
    syncKnowledgeToStoreAndStartHere(pages, linkedPageId);
  }, [pages]);

  // Navigate into a folder from sidebar — also switches main view to Files
  const handleSelectFolder = (folderId) => {
    setSelectedId("files");
    setCurrentFolder(folderId);
  };

  // ── Page ops ──
  const handleNewPage = (parentId = null) => { setModalData({ parentId }); setModal("newPage"); };
  const handleCreatePage = (title, emoji, parentId) => {
    const np = { id: uid(), title, emoji, cover: null, parentId: parentId || null, createdAt: "Today", updatedAt: "Just now", tags: [], blocks: [mkBlock("paragraph", "")] };
    setPages(prev => [...prev, np]);
    setSelectedId(np.id);
    setModal(null);
  };
  const handleUpdatePage = useCallback((updater) => {
    setPages(prev => prev.map(p => p.id === selectedId ? (typeof updater === "function" ? updater(p) : { ...p, ...updater }) : p));
  }, [selectedId]);
  const handleDeletePage = (id) => {
    setPages(prev => {
      const next = prev.filter(p => p.id !== id && p.parentId !== id);
      const store = readStore();
      if (store?.docs?.knowledgeBasePageId === id) {
        const recreated = ensureKnowledgeMapping(next);
        store.docs = { ...(store.docs || {}), pages: recreated.pages, knowledgeBasePageId: recreated.pageId, updatedAt: new Date().toISOString() };
        writeStore(store);
        return recreated.pages;
      }
      return next;
    });
    if (selectedId === id) setSelectedId("pg-home");
    setModal(null);
  };
  const handleOpenEmojiPicker = (pageId) => { setModalData({ pageId }); setModal("emojiPicker"); };
  const handleSelectEmoji = (emoji) => {
    setPages(prev => prev.map(p => p.id === modalData.pageId ? { ...p, emoji } : p));
    setModal(null);
  };
  const handleOpenPageSettings = () => { if (selectedPage) { setModalData({ page: selectedPage }); setModal("pageSettings"); } };
  const handleSavePageSettings = (updates) => {
    setPages(prev => prev.map(p => p.id === selectedPage.id ? { ...p, ...updates } : p));
    setModal(null);
  };

  // ── File ops ──
  const handleNewFolder = (name, parentId) => {
    const nf = { id: uid(), name, parentId: parentId || null };
    setFolders(prev => [...prev, nf]);
    // Auto-navigate into parent so user can see the new folder
    if (parentId) setCurrentFolder(parentId);
    setSelectedId("files");
  };
  const handleUpload = (file, folderId) => {
    const nf = { id: uid(), name: file.name, size: file.size, folderId: folderId ?? currentFolder ?? null, uploadedAt: "Just now", uploadedBy: "Joseph" };
    setFiles(prev => [...prev, nf]);
  };
  const handlePreviewFile = (file) => { setModalData({ file }); setModal("filePreview"); };
  const handleDeleteFile  = (id)   => { setFiles(prev => prev.filter(f => f.id !== id)); setModal(null); };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: L.bg, fontFamily: "'DM Sans','Segoe UI',-apple-system,sans-serif", overflow: "hidden", color: L.text }}>

      {/* ── Modals ── */}
      {modal === "newPage" && (
        <NewPageModal parentId={modalData?.parentId} pages={pages} onClose={() => setModal(null)} onCreate={handleCreatePage} />
      )}
      {modal === "emojiPicker" && (
        <EmojiPickerModal currentEmoji={pages.find(p => p.id === modalData?.pageId)?.emoji || "📋"} onClose={() => setModal(null)} onSelect={handleSelectEmoji} />
      )}
      {modal === "filePreview" && modalData?.file && (
        <FilePreviewModal file={modalData.file} onClose={() => setModal(null)} onDelete={handleDeleteFile} />
      )}
      {modal === "pageSettings" && modalData?.page && (
        <PageSettingsModal page={modalData.page} onClose={() => setModal(null)} onUpdate={handleSavePageSettings} onDelete={() => handleDeletePage(modalData.page.id)} />
      )}

      {/* ─── In-page nav + docs sidebar ─── */}
      <MainMenuSidebar
        activePage="files"
        collapsedSections={collapsedSections}
        onToggleSection={(section) => setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))}
      />
      <DocsSidebar
        pages={pages}
        files={files}
        folders={folders}
        selectedId={selectedId}
        currentFolder={currentFolder}
        onSelect={setSelectedId}
        onSelectFolder={handleSelectFolder}
        onNewPage={handleNewPage}
        onDeletePage={handleDeletePage}
        onNewFolder={handleNewFolder}
        onPreviewFile={handlePreviewFile}
        search={search}
        onSearch={setSearch}
      />

      {/* ─── Main area ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {missingKnowledgeLink && (
          <div style={{ margin: "12px 20px 0", padding: "10px 12px", borderRadius: 8, border: `1px solid ${L.amber}40`, background: L.amberLight, color: "#92400E", fontSize: 12 }}>
            ⚠️ The Start Here knowledge link pointed to a missing page. A fallback linked page was auto-created to preserve sync.
          </div>
        )}
        {isFiles ? (
          <FileManager
            files={files}
            folders={folders}
            onUpload={handleUpload}
            onPreviewFile={handlePreviewFile}
            currentFolder={currentFolder}
            onSetCurrentFolder={handleSelectFolder}
          />
        ) : selectedPage ? (
          <>
            {/* Top bar */}
            <div style={{ height: 44, background: L.surface, borderBottom: `1px solid ${L.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 8, flexShrink: 0 }}>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, fontSize: 12, color: L.textSec }}>
                <span style={{ fontSize: 14 }}>{selectedPage.emoji}</span>
                {selectedPage.parentId && (
                  <>
                    <span style={{ color: L.textMuted, cursor: "pointer" }} onClick={() => setSelectedId(selectedPage.parentId)}>
                      {pages.find(p => p.id === selectedPage.parentId)?.title}
                    </span>
                    <span style={{ color: L.textMuted }}>›</span>
                  </>
                )}
                <span style={{ fontWeight: 600, color: L.text }}>{selectedPage.title || "Untitled"}</span>
              </div>
              {/* Page actions */}
              <button onClick={handleOpenPageSettings} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${L.border}`, background: "transparent", color: L.textSec, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>⚙️ Settings</button>
              <button onClick={() => handleNewPage(selectedPage.id)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${L.border}`, background: "transparent", color: L.textSec, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>+ Sub-page</button>
              <button style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: L.blueGlow, color: L.blue, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Share</button>
            </div>
            <PageEditor page={selectedPage} onUpdatePage={handleUpdatePage} onOpenEmojiPicker={handleOpenEmojiPicker} />
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, opacity: 0.5 }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: L.textSec }}>Select a page to get started</div>
          </div>
        )}
      </div>
    </div>
  );
}
