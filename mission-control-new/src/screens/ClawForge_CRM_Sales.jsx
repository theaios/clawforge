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


const PIPELINE_STAGES = [
  { key: "prospect", label: "Prospect", color: C.textSec, count: 14, value: "$0" },
  { key: "qualified", label: "Qualified", color: C.blue, count: 8, value: "$5,592" },
  { key: "proposal", label: "Proposal", color: C.purple, count: 3, value: "$1,897" },
  { key: "negotiation", label: "Negotiation", color: C.amber, count: 2, value: "$1,798" },
  { key: "closed_won", label: "Closed Won", color: C.green, count: 3, value: "$1,897" },
  { key: "lost", label: "Lost", color: C.red, count: 2, value: "$998" },
];

const HEALTH_SCORES = {
  hot: { label: "Hot", color: C.green, bg: C.greenGlow, icon: "🔥" },
  warm: { label: "Warm", color: C.amber, bg: C.amberGlow, icon: "☀️" },
  cold: { label: "Cold", color: C.blue, bg: C.blueGlow, icon: "❄️" },
  at_risk: { label: "At Risk", color: C.red, bg: C.redGlow, icon: "⚠️" },
};

const DEALS = {
  prospect: [
    { id: "d1", name: "Riverstone Legal Group", contact: "Sarah Chen", source: "LinkedIn", health: "warm", value: null, package: null, lastTouch: "2 days ago", nextAction: "Send intro email", aiInsight: null },
    { id: "d2", name: "Apex Digital Marketing", contact: "Jason Park", source: "Website", health: "hot", value: null, package: null, lastTouch: "1 day ago", nextAction: "Schedule discovery call", aiInsight: "High intent — visited pricing page 3x" },
    { id: "d3", name: "Summit HR Consulting", contact: "Maria Torres", source: "Referral", health: "warm", value: null, package: null, lastTouch: "3 days ago", nextAction: "Follow up on referral intro", aiInsight: null },
  ],
  qualified: [
    { id: "d4", name: "TechFlow Solutions", contact: "David Kim", source: "Website", health: "hot", value: "$899", package: "Executive", lastTouch: "Today", nextAction: "Send Executive proposal", aiInsight: "Budget confirmed. Decision maker engaged.", sequence: "Discovery → Demo ✓ → Proposal" },
    { id: "d5", name: "BrightPath Education", contact: "Lisa Wang", source: "LinkedIn", health: "warm", value: "$499", package: "Core", lastTouch: "1 day ago", nextAction: "Demo scheduled for Thursday", aiInsight: "Comparing with 2 competitors", sequence: "Discovery ✓ → Demo Thu" },
    { id: "d6", name: "Coastal Realty Group", contact: "Mike Johnson", source: "Facebook", health: "warm", value: "$499", package: "Core", lastTouch: "2 days ago", nextAction: "Send case study", aiInsight: null, sequence: "Discovery ✓ → Nurture" },
  ],
  proposal: [
    { id: "d7", name: "Meridian Consulting", contact: "Amanda Foster", source: "Referral", health: "hot", value: "$899", package: "Executive", lastTouch: "Today", nextAction: "Follow up on proposal — decision by Friday", aiInsight: "92% likely to close based on engagement signals", sequence: "Discovery ✓ → Demo ✓ → Proposal Sent" },
    { id: "d8", name: "NovaTech Industries", contact: "Robert Chen", source: "Google Ads", health: "warm", value: "$499", package: "Core", lastTouch: "3 days ago", nextAction: "Address security questions", aiInsight: "Asked about SOC 2 — send security doc", sequence: "Discovery ✓ → Demo ✓ → Proposal Sent" },
  ],
  negotiation: [
    { id: "d9", name: "GreenLeaf Organics", contact: "Emma Davis", source: "Website", health: "hot", value: "$899", package: "Executive", lastTouch: "Today", nextAction: "Finalize custom workflow scope", aiInsight: "Ready to sign — wants inventory tracking agent", sequence: "Full pipeline complete" },
    { id: "d10", name: "Pinnacle Fitness", contact: "Jake Martinez", source: "LinkedIn", health: "at_risk", value: "$899", package: "Executive", lastTouch: "5 days ago", nextAction: "Re-engage — gone silent", aiInsight: "No response in 5 days. Risk of losing.", sequence: "Full pipeline — stalled" },
  ],
  closed_won: [
    { id: "d11", name: "Atlas Construction", contact: "Tom Bradley", source: "Referral", health: "hot", value: "$899", package: "Executive", lastTouch: "Feb 22", nextAction: "Onboarding session scheduled", closedDate: "Feb 22" },
    { id: "d12", name: "Sunrise Bakery", contact: "Nina Patel", source: "Facebook", health: "hot", value: "$499", package: "Core", lastTouch: "Feb 20", nextAction: "Onboarding complete", closedDate: "Feb 20" },
    { id: "d13", name: "ClearView Analytics", contact: "James Wilson", source: "Website", health: "hot", value: "$499", package: "Core", lastTouch: "Feb 18", nextAction: "7-day check-in due", closedDate: "Feb 18" },
  ],
  lost: [
    { id: "d14", name: "Metro Dental Group", contact: "Dr. Amy Lee", source: "Google Ads", health: "cold", value: "$499", package: "Core", lastTouch: "Feb 15", nextAction: "Add to re-engagement sequence", lostReason: "Budget — wants to wait until Q2" },
    { id: "d15", name: "Harbor Logistics", contact: "Steve Brown", source: "LinkedIn", health: "cold", value: "$499", package: "Core", lastTouch: "Feb 12", nextAction: "None", lostReason: "Chose competitor (AgentOps)" },
  ],
};

function DealCard({ deal, stageColor, onClick }) {
  const h = HEALTH_SCORES[deal.health];
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(deal)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.elevated : C.surface,
        border: `1px solid ${hovered ? C.borderLight : C.border}`,
        borderRadius: 8, padding: "12px", cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.15)",
        borderLeft: `3px solid ${stageColor}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{deal.name}</span>
        <span style={{
          fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999,
          background: h.bg, color: h.color, border: `1px solid ${h.color}33`,
        }}>{h.icon} {h.label}</span>
      </div>
      <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6 }}>{deal.contact}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {deal.package && (
          <span style={{
            fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
            background: deal.package === "Executive" ? C.purpleGlow : C.blueGlow,
            color: deal.package === "Executive" ? C.purple : C.blue,
            border: `1px solid ${deal.package === "Executive" ? "rgba(139,92,246,0.3)" : "rgba(59,130,246,0.3)"}`,
          }}>{deal.package} {deal.value}</span>
        )}
        <span style={{ fontSize: 10, color: C.textMuted }}>{deal.source}</span>
      </div>
      {deal.aiInsight && (
        <div style={{
          padding: "5px 8px", borderRadius: 5, marginBottom: 6,
          background: C.purpleGlow, border: `1px solid rgba(139,92,246,0.15)`,
          display: "flex", alignItems: "flex-start", gap: 5,
        }}>
          <span style={{ fontSize: 9, marginTop: 1 }}>🧠</span>
          <span style={{ fontSize: 10, color: C.purple, fontWeight: 500, lineHeight: "14px" }}>{deal.aiInsight}</span>
        </div>
      )}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 6, borderTop: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 10, color: C.textMuted }}>{deal.lastTouch}</span>
        <span style={{ fontSize: 10, color: C.blue, fontWeight: 500 }}>{deal.nextAction}</span>
      </div>
    </div>
  );
}

function DealDrawer({ deal, onClose }) {
  if (!deal) return null;
  const h = HEALTH_SCORES[deal.health];
  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: 380,
      background: C.surface, borderLeft: `1px solid ${C.border}`,
      boxShadow: "-8px 0 32px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", zIndex: 100,
    }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: h.bg, color: h.color, border: `1px solid ${h.color}33` }}>{h.icon} {h.label}</span>
          {deal.package && <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: deal.package === "Executive" ? C.purpleGlow : C.blueGlow, color: deal.package === "Executive" ? C.purple : C.blue }}>{deal.package}</span>}
        </div>
        <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 4px", color: C.text }}>{deal.name}</h3>
        <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>{deal.contact} • {deal.source}</div>

        {deal.value && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>Deal Value</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{deal.value}</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>Package</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: deal.package === "Executive" ? C.purple : C.blue }}>{deal.package} Build</div>
            </div>
          </div>
        )}

        {deal.aiInsight && (
          <div style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 16, background: C.purpleGlow, border: `1px solid rgba(139,92,246,0.2)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 11 }}>🧠</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, letterSpacing: 0.5, textTransform: "uppercase" }}>AI Insight</span>
            </div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: "18px" }}>{deal.aiInsight}</div>
          </div>
        )}

        {deal.sequence && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>Pipeline Progress</div>
            <div style={{ padding: "8px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}`, fontSize: 11, color: C.textSec }}>{deal.sequence}</div>
          </div>
        )}

        {/* Timeline */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>Activity Timeline</div>
          {[
            { action: "Proposal sent via email", time: "Today 10:30 AM", agent: "Sales CEO", type: "email" },
            { action: "Demo call completed (45 min)", time: "Feb 23 2:00 PM", agent: "Sales CEO", type: "call" },
            { action: "Discovery call — qualified budget & timeline", time: "Feb 21 11:00 AM", agent: "Sales CEO", type: "call" },
            { action: "First website visit (pricing page)", time: "Feb 19 3:22 PM", agent: "System", type: "web" },
          ].map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? C.blue : C.border, marginTop: 4 }} />
                {i < 3 && <div style={{ width: 1, flex: 1, background: C.border, marginTop: 2 }} />}
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{ev.action}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>{ev.time} • {ev.agent}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, fontWeight: 600 }}>Linked Tasks</div>
          {[
            { task: "Follow up on proposal", status: "In Progress", due: "Feb 27" },
            { task: "Prepare custom workflow scope", status: "Queued", due: "Mar 1" },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 6, background: C.elevated, border: `1px solid ${C.border}`, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C.text }}>{t.task}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 9, color: t.status === "In Progress" ? C.blue : C.textMuted }}>{t.status}</span>
                <span style={{ fontSize: 9, color: C.textMuted }}>{t.due}</span>
              </div>
            </div>
          ))}
        </div>

        {deal.lostReason && (
          <div style={{ padding: "10px 12px", borderRadius: 8, background: C.redGlow, border: `1px solid rgba(239,68,68,0.2)`, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.red, marginBottom: 2 }}>Lost Reason</div>
            <div style={{ fontSize: 12, color: C.text }}>{deal.lostReason}</div>
          </div>
        )}
      </div>
      <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <button style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Log Activity</button>
        <button style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Send Email</button>
        <button style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: C.green, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Move Stage →</button>
      </div>
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


export default function CRMSales() {
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [viewMode, setViewMode] = useState("pipeline");

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="crm" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>Business</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>CRM & Sales</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search deals or contacts...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> Sales CEO online</span>
        </div>

        <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>CRM & Sales Pipeline</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Managed by Sales CEO • 32 contacts • $10,185 total pipeline</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
                {["pipeline", "table"].map(v => (
                  <button key={v} onClick={() => setViewMode(v)} style={{ padding: "6px 14px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, background: viewMode === v ? C.blueGlow : "transparent", color: viewMode === v ? C.blue : C.textMuted, textTransform: "capitalize" }}>{v}</button>
                ))}
              </div>
              <button style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Deal</button>
            </div>
          </div>
          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Pipeline Value", value: "$10,185", color: C.text },
              { label: "Closed (Feb)", value: "$1,897", color: C.green },
              { label: "Win Rate", value: "60%", color: C.green },
              { label: "Avg Deal Size", value: "$632", color: C.text },
              { label: "Leads This Week", value: "6", color: C.blue },
              { label: "March Forecast", value: "$3,200–$4,500", color: C.amber },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline board */}
        <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", padding: "0 24px 24px" }}>
          <div style={{ display: "flex", gap: 12, minWidth: "max-content" }}>
            {PIPELINE_STAGES.map(stage => {
              const deals = DEALS[stage.key] || [];
              return (
                <div key={stage.key} style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                  {/* Column header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 3, height: 14, borderRadius: 2, background: stage.color }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.8 }}>{stage.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, background: C.elevated, borderRadius: 6, padding: "1px 6px" }}>{stage.count}</span>
                    </div>
                    {stage.value !== "$0" && <span style={{ fontSize: 10, fontWeight: 600, color: stage.color, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{stage.value}</span>}
                  </div>
                  {/* Deal cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {deals.map(deal => (
                      <DealCard key={deal.id} deal={deal} stageColor={stage.color} onClick={setSelectedDeal} />
                    ))}
                    {deals.length < stage.count && (
                      <div style={{ padding: "8px", borderRadius: 6, border: `1px dashed ${C.border}`, textAlign: "center", fontSize: 10, color: C.textMuted }}>
                        +{stage.count - deals.length} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deal drawer */}
        {selectedDeal && (
          <>
            <div onClick={() => setSelectedDeal(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }} />
            <DealDrawer deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
          </>
        )}
      </div>
    </div>
  );
}
