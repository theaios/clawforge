import {useState, useEffect} from "react";
import { useMissionControl } from "../lib/missionControlContext";
import { formatOpError, formatOpSuccess } from "../lib/openclawDiagnostics";
import { PRIMARY_NAV_ITEMS, SYSTEM_NAV_ITEMS, buildMainMenuSections } from "../lib/systemNav";
import { getStoredThemeMode } from "../lib/themeMode";

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


const STATUS_CARDS = [
  { label: "Security Sentinel", status: "degraded", detail: "Running elevated scans", icon: "🛡️", metric: "98.1% uptime", metricColor: C.amber },
  { label: "Backup System", status: "healthy", detail: "Last backup: 2h ago", icon: "💾", metric: "100% success", metricColor: C.green },
  { label: "OpenClaw Version", status: "update", detail: "v2.1.4 → v2.2.0 available", icon: "⚡", metric: "1 update", metricColor: C.blue },
  { label: "System Uptime", status: "healthy", detail: "No downtime in 14 days", icon: "📡", metric: "99.97%", metricColor: C.green },
];

const THREAT_ALERTS = [
  { id: "SEC-047", severity: "high", title: "Brute-force SSH attempt detected", source: "IP range 185.220.x.x", time: "1h ago", status: "mitigating", detail: "47 failed login attempts in 2 hours. Pattern matches known Tor exit node botnet. WAF rule pending approval.", actions: ["Block IP", "View Logs"] },
  { id: "SEC-046", severity: "medium", title: "Unusual API call pattern", source: "Customer instance #8", time: "3h ago", status: "investigating", detail: "3x normal API volume detected. Likely legitimate (new agent deployment) but flagged for review.", actions: ["View Logs", "Dismiss"] },
  { id: "SEC-045", severity: "low", title: "SSL certificate expiry warning", source: "theclawforge.com", time: "6h ago", status: "scheduled", detail: "Certificate expires in 21 days. Auto-renewal configured via Let's Encrypt. Monitoring.", actions: ["Renew Now", "Dismiss"] },
  { id: "SEC-044", severity: "resolved", title: "Prompt injection attempt blocked", source: "Customer instance #3", time: "12h ago", status: "resolved", detail: "Malicious input attempted to override agent system prompt. OpenClaw injection defense caught and blocked it. No data exposure.", actions: ["View Details"] },
];

const AUDIT_LOG = [
  { time: "10:52 AM", agent: "Finance CEO", action: "Accessed Stripe billing data", resource: "Customer #11 payment record", risk: "low" },
  { time: "10:48 AM", agent: "Security Sentinel", action: "Scanned customer instances", resource: "Instances #1-12", risk: "low" },
  { time: "10:45 AM", agent: "Marketing CEO", action: "Updated Meta Ads budget", resource: "Campaign: AI Agents for SMBs", risk: "medium" },
  { time: "10:42 AM", agent: "Operations CEO", action: "Deployed Docker container", resource: "Mission Control v1.3.2", risk: "medium" },
  { time: "10:38 AM", agent: "Sales CEO", action: "Sent email via Gmail API", resource: "Meridian Consulting proposal", risk: "low" },
  { time: "10:35 AM", agent: "Content Writer", action: "Updated website copy", resource: "Homepage hero section", risk: "low" },
  { time: "10:30 AM", agent: "DevOps Engineer", action: "Modified Terraform config", resource: "AWS VPC security groups", risk: "high" },
  { time: "10:22 AM", agent: "Security Sentinel", action: "Blocked IP range", resource: "185.220.100.0/24", risk: "low" },
  { time: "10:15 AM", agent: "CX CEO", action: "Accessed customer data", resource: "Support ticket #412", risk: "low" },
  { time: "10:08 AM", agent: "QA Tester", action: "Ran test suite", resource: "Backup restore tests (47/47 pass)", risk: "low" },
];

const PERMISSIONS = [
  { agent: "Operations CEO", perms: ["AWS", "Docker", "CI/CD", "Database"], level: "Admin", lastReview: "Feb 20" },
  { agent: "Marketing CEO", perms: ["Meta Ads", "Google Ads", "Analytics", "Email"], level: "Standard", lastReview: "Feb 18" },
  { agent: "Sales CEO", perms: ["CRM", "Gmail", "LinkedIn", "Calendar"], level: "Standard", lastReview: "Feb 18" },
  { agent: "Finance CEO", perms: ["Stripe", "QuickBooks", "Banking"], level: "Elevated", lastReview: "Feb 22" },
  { agent: "Security Sentinel", perms: ["WAF", "CloudWatch", "Vuln Scanner"], level: "Admin", lastReview: "Feb 25" },
  { agent: "Content Writer", perms: ["CMS", "Google Docs", "Canva"], level: "Standard", lastReview: "Feb 15" },
  { agent: "DevOps Engineer", perms: ["Terraform", "AWS", "Docker", "CI/CD"], level: "Admin", lastReview: "Feb 24" },
  { agent: "CX CEO", perms: ["Support Tickets", "KB", "Email"], level: "Standard", lastReview: "Feb 19" },
];

const SEVERITY_STYLES = {
  high: { bg: C.redGlow, color: C.red, border: "rgba(239,68,68,0.3)", label: "HIGH" },
  medium: { bg: C.amberGlow, color: C.amber, border: "rgba(245,158,11,0.3)", label: "MEDIUM" },
  low: { bg: C.blueGlow, color: C.blue, border: "rgba(59,130,246,0.3)", label: "LOW" },
  resolved: { bg: C.greenGlow, color: C.green, border: "rgba(34,197,94,0.3)", label: "RESOLVED" },
};

const RISK_COLORS = { low: C.green, medium: C.amber, high: C.red };
const LEVEL_COLORS = { Admin: C.red, Elevated: C.amber, Standard: C.textSec };

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
  const NAV = buildMainMenuSections({ mainItems: PRIMARY_NAV_ITEMS, systemItems: SYSTEM_NAV_ITEMS });
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
              const href = `#${item.path || '/boards'}`;
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


export default function SecuritySystem() {
  const { store, client } = useMissionControl();
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [expandedAlert, setExpandedAlert] = useState("SEC-047");
  const [opMessage, setOpMessage] = useState("");

  const toggleIncidentMode = async () => {
    const resp = await client.run('oc.system.degraded.set', { degraded: !store.ui.degraded });
    setOpMessage(resp.ok
      ? formatOpSuccess(`Incident mode ${!store.ui.degraded ? 'enabled' : 'disabled'}`, resp)
      : formatOpError(resp.error));
  };

  const handleSecurityAction = (action, target) => {
    if (action === 'report') setOpMessage('Security report generated with latest threat and audit summary.');
    if (action === 'upgrade') setOpMessage('Upgrade staged: OpenClaw v2.2.0 rollout queued for maintenance window.');
    if (action === 'permissions') setOpMessage('Permissions review opened. 8 agents evaluated; 2 high-privilege roles flagged for review.');
    if (action === 'alert') setOpMessage(`${action.toUpperCase()} executed for ${target}.`);
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="security" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>System</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Security</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search security events...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: store.ui.degraded ? C.red : C.amber, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> {store.ui.degraded ? 'OpenClaw degraded mode' : 'Security Sentinel — degraded'}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Security & System Health</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Managed by Security Sentinel • Real-time monitoring</p>
              {opMessage && <p style={{ fontSize: 11, color: C.blue, margin: '6px 0 0' }}>{opMessage}</p>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={toggleIncidentMode} style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.red}44`, background: C.redGlow, color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🚨 Incident Response</button>
              <button onClick={() => handleSecurityAction('report')} style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>📊 Security Report</button>
            </div>
          </div>

          {/* Status cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {STATUS_CARDS.map((card, i) => {
              const statusColor = card.status === "healthy" ? C.green : card.status === "degraded" ? C.amber : C.blue;
              const statusBg = card.status === "healthy" ? C.greenGlow : card.status === "degraded" ? C.amberGlow : C.blueGlow;
              return (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{card.icon}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 9999,
                      background: statusBg, color: statusColor, border: `1px solid ${statusColor}33`,
                      textTransform: "uppercase",
                    }}>{card.status}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{card.label}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6 }}>{card.detail}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: card.metricColor }}>{card.metric}</div>
                  {card.status === "update" && (
                    <button onClick={() => handleSecurityAction('upgrade')} style={{ marginTop: 6, padding: "4px 10px", borderRadius: 5, border: "none", background: C.blue, color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Upgrade OpenClaw</button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* Col 1: Threat alerts */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Threat Alerts</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 9999, background: C.redGlow, color: C.red }}>{THREAT_ALERTS.filter(a => a.severity !== "resolved").length} active</span>
              </div>
              <div style={{ maxHeight: 460, overflowY: "auto" }}>
                {THREAT_ALERTS.map(alert => {
                  const sev = SEVERITY_STYLES[alert.severity];
                  const isExp = expandedAlert === alert.id;
                  return (
                    <div key={alert.id} style={{ borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${sev.color}` }}>
                      <div onClick={() => setExpandedAlert(isExp ? null : alert.id)} style={{ padding: "10px 14px", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>{sev.label}</span>
                          <span style={{ fontSize: 9, color: C.textMuted }}>{alert.time}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{alert.title}</div>
                        <div style={{ fontSize: 10, color: C.textMuted }}>{alert.source}</div>
                      </div>
                      {isExp && (
                        <div style={{ padding: "0 14px 12px" }}>
                          <div style={{ fontSize: 11, color: C.textSec, lineHeight: "16px", marginBottom: 8, padding: "8px 10px", background: C.elevated, borderRadius: 6 }}>{alert.detail}</div>
                          <div style={{ display: "flex", gap: 4 }}>
                            {alert.actions.map((a, ai) => (
                              <button key={ai} onClick={() => handleSecurityAction('alert', `${alert.id} · ${a}`)} style={{
                                padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer",
                                border: ai === 0 ? "none" : `1px solid ${C.border}`,
                                background: ai === 0 ? C.blue : "transparent",
                                color: ai === 0 ? "#fff" : C.textSec,
                              }}>{a}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Col 2: Audit log */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Audit Log</span>
                <span style={{ fontSize: 9, color: C.textMuted }}>Live • Today</span>
              </div>
              <div style={{ maxHeight: 460, overflowY: "auto" }}>
                {AUDIT_LOG.map((entry, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 14px", borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : `${C.elevated}44` }}>
                    <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", minWidth: 56, flexShrink: 0 }}>{entry.time}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: C.text, fontWeight: 500, marginBottom: 1 }}>{entry.action}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 9, color: C.textSec }}>{entry.agent}</span>
                        <span style={{ fontSize: 9, color: C.textMuted }}>→ {entry.resource}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 5, color: RISK_COLORS[entry.risk], alignSelf: "center", flexShrink: 0,
                    }}>⬤</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Permissions matrix */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Permissions</span>
                <button onClick={() => handleSecurityAction('permissions')} style={{ padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 9, cursor: "pointer" }}>Review All</button>
              </div>
              <div style={{ maxHeight: 460, overflowY: "auto" }}>
                {PERMISSIONS.map((perm, i) => (
                  <div key={i} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{perm.agent}</span>
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                        background: `${LEVEL_COLORS[perm.level]}15`,
                        color: LEVEL_COLORS[perm.level],
                        border: `1px solid ${LEVEL_COLORS[perm.level]}30`,
                      }}>{perm.level}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 4 }}>
                      {perm.perms.map((p, pi) => (
                        <span key={pi} style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: C.elevated, color: C.textMuted, border: `1px solid ${C.border}` }}>{p}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>Last review: {perm.lastReview}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
