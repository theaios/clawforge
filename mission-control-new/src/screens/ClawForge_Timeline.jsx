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


const AGENTS = [
  { name: "Operations CEO", initials: "OP", color: C.blue },
  { name: "Marketing CEO", initials: "MK", color: C.purple },
  { name: "Sales CEO", initials: "SL", color: C.green },
  { name: "Finance CEO", initials: "FN", color: C.amber },
  { name: "Content Writer", initials: "CW", color: C.pink },
  { name: "Security Sentinel", initials: "SS", color: C.red },
  { name: "CX CEO", initials: "CX", color: C.teal },
  { name: "DevOps Engineer", initials: "DV", color: C.orange },
  { name: "Full-Stack Dev", initials: "FS", color: "#60A5FA" },
  { name: "QA Tester", initials: "QA", color: "#FB923C" },
];

const DAYS = ["Feb 17","Feb 18","Feb 19","Feb 20","Feb 21","Feb 22","Feb 23","Feb 24","Feb 25","Feb 26","Feb 27","Feb 28","Mar 1","Mar 2","Mar 3","Mar 4","Mar 5","Mar 6","Mar 7","Mar 8","Mar 9","Mar 10","Mar 11","Mar 12","Mar 13","Mar 14"];
const TODAY_INDEX = 8; // Feb 25

const MILESTONES = [
  { day: 8, label: "Today", color: C.blue },
  { day: 14, label: "Website Live", color: C.green },
  { day: 20, label: "Campaign Launch", color: C.purple },
];

const TASK_GROUPS = [
  {
    id: "infra", label: "Infrastructure", agent: 0, expanded: true,
    tasks: [
      { id: "t1", label: "AWS instance provisioning automation", start: 0, end: 5, progress: 100, priority: "P0", agent: 7, status: "done", deps: [] },
      { id: "t2", label: "OpenClaw framework deployment", start: 3, end: 7, progress: 100, priority: "P0", agent: 0, status: "done", deps: ["t1"] },
      { id: "t3", label: "Mission Control dashboard deploy", start: 5, end: 8, progress: 95, priority: "P0", agent: 8, status: "progress", deps: ["t2"] },
      { id: "t4", label: "Backup scheduler implementation", start: 7, end: 11, progress: 40, priority: "P1", agent: 7, status: "blocked", deps: ["t2"], blocked: "S3 permissions" },
      { id: "t5", label: "Docker containerization", start: 9, end: 13, progress: 10, priority: "P1", agent: 7, status: "progress", deps: ["t3"] },
      { id: "t6", label: "CI/CD pipeline setup", start: 12, end: 16, progress: 0, priority: "P1", agent: 7, status: "queued", deps: ["t5"] },
    ],
  },
  {
    id: "web", label: "Website & Checkout", agent: 8, expanded: true,
    tasks: [
      { id: "t7", label: "Homepage redesign", start: 2, end: 8, progress: 85, priority: "P0", agent: 4, status: "progress", deps: [] },
      { id: "t8", label: "Pricing page build", start: 6, end: 10, progress: 50, priority: "P0", agent: 8, status: "progress", deps: ["t7"] },
      { id: "t9", label: "Stripe checkout integration", start: 8, end: 13, progress: 30, priority: "P0", agent: 8, status: "progress", deps: ["t8"], critical: true },
      { id: "t10", label: "FAQ section", start: 9, end: 11, progress: 0, priority: "P2", agent: 4, status: "queued", deps: ["t7"] },
      { id: "t11", label: "QA & cross-browser testing", start: 12, end: 14, progress: 0, priority: "P1", agent: 9, status: "queued", deps: ["t8", "t9"] },
    ],
  },
  {
    id: "mkt", label: "Marketing & Launch", agent: 1, expanded: true,
    tasks: [
      { id: "t12", label: "Brand asset creation", start: 0, end: 6, progress: 100, priority: "P1", agent: 4, status: "done", deps: [] },
      { id: "t13", label: "30-day campaign calendar", start: 4, end: 9, progress: 70, priority: "P0", agent: 1, status: "progress", deps: ["t12"] },
      { id: "t14", label: "Google Ads setup", start: 8, end: 12, progress: 20, priority: "P1", agent: 1, status: "progress", deps: ["t13"] },
      { id: "t15", label: "Meta Ads campaigns", start: 8, end: 13, progress: 15, priority: "P1", agent: 1, status: "progress", deps: ["t13"] },
      { id: "t16", label: "Email drip sequence", start: 6, end: 11, progress: 60, priority: "P1", agent: 4, status: "progress", deps: ["t12"], approval: true },
      { id: "t17", label: "Blog content (8 posts)", start: 5, end: 18, progress: 25, priority: "P2", agent: 4, status: "progress", deps: [] },
      { id: "t18", label: "Social media scheduling", start: 10, end: 20, progress: 0, priority: "P2", agent: 1, status: "queued", deps: ["t13"] },
    ],
  },
  {
    id: "sales", label: "Sales & Partnerships", agent: 2, expanded: true,
    tasks: [
      { id: "t19", label: "CRM pipeline setup", start: 3, end: 8, progress: 80, priority: "P1", agent: 2, status: "review", deps: [] },
      { id: "t20", label: "Outreach list building", start: 6, end: 12, progress: 45, priority: "P1", agent: 2, status: "progress", deps: ["t19"] },
      { id: "t21", label: "Partnership outreach", start: 11, end: 20, progress: 0, priority: "P2", agent: 2, status: "queued", deps: ["t20"] },
      { id: "t22", label: "Referral program design", start: 14, end: 19, progress: 0, priority: "P2", agent: 2, status: "queued", deps: [] },
    ],
  },
  {
    id: "sec", label: "Security & Compliance", agent: 5, expanded: false,
    tasks: [
      { id: "t23", label: "Security hardening checklist", start: 4, end: 9, progress: 60, priority: "P1", agent: 5, status: "progress", deps: [] },
      { id: "t24", label: "Penetration testing", start: 10, end: 14, progress: 0, priority: "P1", agent: 5, status: "queued", deps: ["t23", "t9"] },
      { id: "t25", label: "Compliance documentation", start: 14, end: 20, progress: 0, priority: "P2", agent: 5, status: "queued", deps: ["t24"] },
    ],
  },
];

const STATUS_COLORS = {
  done: C.green, progress: C.blue, blocked: C.red,
  review: C.purple, queued: C.textMuted, approval: C.amber,
};

const PRIORITY_COLORS = {
  P0: { bg: C.red, color: "#fff" },
  P1: { bg: C.orange, color: "#fff" },
  P2: { bg: C.amber, color: "#1a1a1a" },
};

function Avatar({ agent, size = 20 }) {
  const a = AGENTS[agent];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${a.color}, ${a.color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }} title={a.name}>{a.initials}</div>
  );
}

function GanttBar({ task, dayWidth }) {
  const left = task.start * dayWidth;
  const width = (task.end - task.start) * dayWidth;
  const baseColor = STATUS_COLORS[task.status] || C.blue;
  const isCritical = task.critical;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "absolute", left, top: 4, height: 26, width, cursor: "pointer" }}
    >
      {/* Background track */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 5,
        background: `${baseColor}18`,
        border: `1px solid ${isCritical ? `${C.red}55` : `${baseColor}33`}`,
        boxShadow: hovered ? `0 0 12px ${baseColor}25` : "none",
        transition: "box-shadow 0.15s",
      }} />
      {/* Progress fill */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: `${task.progress}%`, borderRadius: 5,
        background: task.status === "done" ? `${C.green}55` : `${baseColor}35`,
      }} />
      {/* Label */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        padding: "0 8px", gap: 5, overflow: "hidden",
      }}>
        {task.blocked && <span style={{ fontSize: 8, flexShrink: 0 }}>⚠️</span>}
        {task.approval && <span style={{ fontSize: 8, flexShrink: 0 }}>⛨</span>}
        <span style={{
          fontSize: 10, fontWeight: 600, color: C.text,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{width > 80 ? task.label : ""}</span>
        {width > 50 && <span style={{ fontSize: 9, color: C.textMuted, flexShrink: 0, marginLeft: "auto" }}>{task.progress}%</span>}
      </div>
      {/* Dependency arrows (simplified — draw small triangles at start) */}
      {task.deps.length > 0 && (
        <div style={{
          position: "absolute", left: -6, top: "50%", transform: "translateY(-50%)",
          width: 0, height: 0,
          borderTop: "4px solid transparent", borderBottom: "4px solid transparent",
          borderLeft: `5px solid ${C.border}`,
        }} />
      )}
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
          marginBottom: 6, padding: "8px 12px", borderRadius: 8,
          background: C.surface, border: `1px solid ${C.border}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          whiteSpace: "nowrap", zIndex: 50, minWidth: 200,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{task.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Avatar agent={task.agent} size={16} />
            <span style={{ fontSize: 10, color: C.textSec }}>{AGENTS[task.agent].name}</span>
            <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: PRIORITY_COLORS[task.priority].bg, color: PRIORITY_COLORS[task.priority].color }}>{task.priority}</span>
          </div>
          <div style={{ fontSize: 10, color: C.textMuted }}>{DAYS[task.start]} → {DAYS[task.end]} • {task.progress}% complete</div>
          {task.blocked && <div style={{ fontSize: 10, color: C.red, marginTop: 2 }}>⚠ Blocked: {task.blocked}</div>}
          {task.critical && <div style={{ fontSize: 10, color: C.red, marginTop: 2 }}>🔥 Critical path</div>}
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


export default function Timeline() {
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [groups, setGroups] = useState(TASK_GROUPS);
  const [selectedTask, setSelectedTask] = useState(null);
  const dayWidth = 52;

  const toggleGroup = (id) => {
    setGroups(groups.map(g => g.id === id ? { ...g, expanded: !g.expanded } : g));
  };

  const allTasks = groups.flatMap(g => g.tasks);
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === "done").length;
  const blockedTasks = allTasks.filter(t => t.status === "blocked").length;

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="timeline" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Command</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Timeline</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Type a command...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> 12 agents online</span>
        </div>

        {/* Page header */}
        <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Timeline — Product Launch</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>{totalTasks} tasks • {doneTasks} complete • {blockedTasks} blocked • Feb 17 – Mar 14, 2026</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, cursor: "pointer" }}>🔥 Critical Path</button>
              <button style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, cursor: "pointer" }}>⛓ Dependencies</button>
              <button style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add Task</button>
            </div>
          </div>
          {/* Summary */}
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            {[
              { label: "Overall Progress", value: `${Math.round(allTasks.reduce((s,t) => s+t.progress, 0) / totalTasks)}%`, color: C.blue },
              { label: "On Track", value: `${totalTasks - blockedTasks - allTasks.filter(t=>t.status==="queued").length}`, color: C.green },
              { label: "Blocked", value: blockedTasks, color: C.red },
              { label: "Days to Launch", value: "17", color: C.amber },
            ].map((s,i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 6, background: C.surface, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gantt area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Task list (left pane) */}
          <div style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${C.border}`, overflowY: "auto", background: C.surface }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>Tasks</span>
            </div>
            {groups.map(group => (
              <div key={group.id}>
                <div onClick={() => toggleGroup(group.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                  cursor: "pointer", background: C.elevated, borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 10, color: C.textMuted, transform: group.expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>▶</span>
                  <Avatar agent={group.agent} size={18} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.text, flex: 1 }}>{group.label}</span>
                  <span style={{ fontSize: 9, color: C.textMuted }}>{group.tasks.length}</span>
                </div>
                {group.expanded && group.tasks.map(task => (
                  <div key={task.id} onClick={() => setSelectedTask(task)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 36px",
                    borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                    background: selectedTask?.id === task.id ? C.blueGlow : "transparent",
                    height: 34, boxSizing: "border-box",
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: PRIORITY_COLORS[task.priority].bg, color: PRIORITY_COLORS[task.priority].color, flexShrink: 0 }}>{task.priority}</span>
                    <span style={{
                      fontSize: 11, color: task.status === "done" ? C.textMuted : C.text,
                      fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      textDecoration: task.status === "done" ? "line-through" : "none",
                    }}>{task.label}</span>
                    {task.blocked && <span style={{ fontSize: 8 }}>⚠️</span>}
                    {task.approval && <span style={{ fontSize: 8 }}>⛨</span>}
                    <Avatar agent={task.agent} size={16} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Gantt chart (right pane) */}
          <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", position: "relative" }}>
            {/* Day headers */}
            <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10, background: C.surface, borderBottom: `1px solid ${C.border}` }}>
              {DAYS.map((day, i) => {
                const isToday = i === TODAY_INDEX;
                const isWeekend = [5,6,12,13,19,20].includes(i);
                return (
                  <div key={i} style={{
                    width: dayWidth, flexShrink: 0, padding: "8px 0", textAlign: "center",
                    borderRight: `1px solid ${C.border}`,
                    background: isToday ? C.blueGlow : isWeekend ? `${C.elevated}88` : "transparent",
                  }}>
                    <div style={{ fontSize: 9, color: isToday ? C.blue : C.textMuted, fontWeight: isToday ? 700 : 500 }}>{day.split(" ")[0]}</div>
                    <div style={{ fontSize: 11, color: isToday ? C.blue : C.text, fontWeight: isToday ? 800 : 600 }}>{day.split(" ")[1]}</div>
                  </div>
                );
              })}
            </div>

            {/* Grid + bars */}
            <div style={{ position: "relative" }}>
              {/* Today line */}
              <div style={{
                position: "absolute", left: TODAY_INDEX * dayWidth + dayWidth / 2, top: 0, bottom: 0,
                width: 2, background: C.blue, opacity: 0.4, zIndex: 5,
              }} />

              {/* Milestone markers */}
              {MILESTONES.map((m, i) => (
                <div key={i} style={{
                  position: "absolute", left: m.day * dayWidth + dayWidth / 2 - 8, top: -2, zIndex: 6,
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  <div style={{
                    width: 16, height: 16, transform: "rotate(45deg)",
                    background: m.color, borderRadius: 2,
                    boxShadow: `0 0 8px ${m.color}44`,
                  }} />
                  <span style={{ fontSize: 8, color: m.color, fontWeight: 700, marginTop: 4, whiteSpace: "nowrap" }}>{m.label}</span>
                </div>
              ))}

              {/* Task rows */}
              {groups.map(group => (
                <div key={group.id}>
                  {/* Group header row */}
                  <div style={{ height: 33, borderBottom: `1px solid ${C.border}`, background: C.elevated, position: "relative" }}>
                    {/* Vertical grid lines */}
                    {DAYS.map((_, i) => (
                      <div key={i} style={{ position: "absolute", left: i * dayWidth + dayWidth, top: 0, bottom: 0, width: 1, background: C.border, opacity: 0.3 }} />
                    ))}
                  </div>
                  {/* Task bar rows */}
                  {group.expanded && group.tasks.map(task => (
                    <div key={task.id} style={{ height: 34, borderBottom: `1px solid ${C.border}`, position: "relative" }}>
                      {/* Vertical grid lines */}
                      {DAYS.map((_, i) => {
                        const isWeekend = [5,6,12,13,19,20].includes(i);
                        return <div key={i} style={{ position: "absolute", left: i * dayWidth + dayWidth, top: 0, bottom: 0, width: 1, background: C.border, opacity: isWeekend ? 0.15 : 0.3 }} />;
                      })}
                      <GanttBar task={task} dayWidth={dayWidth} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected task detail bar */}
        {selectedTask && (
          <div style={{
            padding: "10px 24px", borderTop: `1px solid ${C.border}`, background: C.surface,
            display: "flex", alignItems: "center", gap: 16, flexShrink: 0,
          }}>
            <Avatar agent={selectedTask.agent} size={28} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{selectedTask.label}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>{AGENTS[selectedTask.agent].name} • {DAYS[selectedTask.start]} → {DAYS[selectedTask.end]} • {selectedTask.progress}% complete</div>
            </div>
            {selectedTask.blocked && (
              <div style={{ padding: "4px 10px", borderRadius: 6, background: C.redGlow, border: `1px solid rgba(239,68,68,0.2)`, fontSize: 11, color: C.red, fontWeight: 500 }}>⚠ {selectedTask.blocked}</div>
            )}
            <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: PRIORITY_COLORS[selectedTask.priority].bg, color: PRIORITY_COLORS[selectedTask.priority].color }}>{selectedTask.priority}</span>
            <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>Edit</button>
            <button onClick={() => setSelectedTask(null)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textMuted, fontSize: 11, cursor: "pointer" }}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
