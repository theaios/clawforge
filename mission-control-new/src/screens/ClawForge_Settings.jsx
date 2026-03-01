import {useState, useEffect, useMemo} from "react";
import { useMissionControl } from "../lib/missionControlContext";
import { describeConnection, formatOpError, formatOpSuccess } from "../lib/openclawDiagnostics";
import { PRIMARY_NAV_ITEMS, SYSTEM_NAV_ITEMS } from "../lib/systemNav";
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
    scrollTrack: "#E9EBF0", scrollThumb: "#C4C8D4", scrollHover: "#A0A5B5",
  };
}

// Module-level theme reference used by helper components outside main function.
// Default light so text is readable before runtime theme sync.
let C = getTheme(false);


const TABS = [
  { key: "profile", label: "Profile & Business", icon: "👤" },
  { key: "notifications", label: "Notifications", icon: "🔔" },
  { key: "ai", label: "AI & Models", icon: "🧠" },
  { key: "billing", label: "Billing & Plan", icon: "💳" },
  { key: "team", label: "Team Access", icon: "👥" },
  { key: "advanced", label: "Advanced", icon: "⚙️" },
];

function Toggle({ on }) {
  return (
    <div style={{
      width: 36, height: 20, borderRadius: 10, cursor: "pointer",
      background: on ? C.green : C.elevated,
      border: `1px solid ${on ? C.green : C.border}`,
      position: "relative", transition: "all 0.15s ease", flexShrink: 0,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 1,
        left: on ? 17 : 1,
        transition: "left 0.15s ease",
      }} />
    </div>
  );
}

function SettingRow({ label, desc, children }) {
  const isLight = C.bg !== "#0A0C10";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${isLight ? "#CBD5E1" : C.border}` }}>
      <div style={{ flex: 1, marginRight: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isLight ? "#0F172A" : C.text }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: isLight ? "#64748B" : C.textSec, marginTop: 2, lineHeight: "17px", fontWeight: 400 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function SectionHeader({ title }) {
  const isLight = C.bg !== "#0A0C10";
  return <div style={{ fontSize: 11, fontWeight: 700, color: isLight ? "#475569" : C.textSec, textTransform: "uppercase", letterSpacing: 1, padding: "20px 0 8px", borderBottom: `1px solid ${C.border}` }}>{title}</div>;
}

function ProfileTab() {
  return (
    <div>
      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "#fff",
        }}>JC</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Joseph Carter</div>
          <div style={{ fontSize: 12, color: C.textSec }}>Orchestrator • The Claw Forge LLC</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>team@theclawforge.com</div>
        </div>
        <button style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Edit Profile</button>
      </div>

      <SectionHeader title="Business Information" />
      <SettingRow label="Business Name" desc="Displayed on invoices and client communications">
        <span style={{ fontSize: 12, color: C.text, fontWeight: 400 }}>The Claw Forge LLC</span>
      </SettingRow>
      <SettingRow label="Website" desc="Primary business domain">
        <span style={{ fontSize: 12, color: C.blue, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>theclawforge.com</span>
      </SettingRow>
      <SettingRow label="Location" desc="Used for timezone and regional settings">
        <span style={{ fontSize: 12, color: C.textSec }}>Waldorf, Maryland, US</span>
      </SettingRow>
      <SettingRow label="Timezone">
        <span style={{ fontSize: 12, color: C.textSec }}>Eastern Time (ET)</span>
      </SettingRow>

      <SectionHeader title="Branding" />
      <SettingRow label="Brand Colors" desc="Applied across Mission Control and client-facing pages">
        <div style={{ display: "flex", gap: 6 }}>
          {[C.orange, "#1A1E26", C.text, C.blue].map((c, i) => (
            <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: `1px solid ${C.border}` }} />
          ))}
        </div>
      </SettingRow>
      <SettingRow label="Logo" desc="Used in sidebar, emails, and client dashboards">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.orange}, #c2410c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>⚡</div>
          <button style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 10, cursor: "pointer" }}>Upload</button>
        </div>
      </SettingRow>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div>
      <SectionHeader title="Delivery Channels" />
      <SettingRow label="Email Notifications" desc="Daily digest and critical alerts to team@theclawforge.com"><Toggle on={true} /></SettingRow>
      <SettingRow label="Slack Notifications" desc="Real-time alerts to #mission-control channel"><Toggle on={true} /></SettingRow>
      <SettingRow label="Discord Notifications" desc="Community and support alerts"><Toggle on={false} /></SettingRow>
      <SettingRow label="SMS Alerts" desc="Critical incidents only — requires phone number"><Toggle on={false} /></SettingRow>

      <SectionHeader title="Critical Alerts" />
      <SettingRow label="Security Threats" desc="Prompt injection, brute-force, vulnerability detections">
        <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: C.redGlow, color: C.red, border: `1px solid ${C.red}33` }}>🔒 Always On</span>
      </SettingRow>

      <SectionHeader title="Operational Alerts" />
      <SettingRow label="Approval Requests" desc="Agent actions waiting for your decision"><Toggle on={true} /></SettingRow>
      <SettingRow label="Build Failures" desc="CI/CD pipeline and deployment errors"><Toggle on={true} /></SettingRow>
      <SettingRow label="Budget Alerts" desc="Agent spend exceeding thresholds"><Toggle on={true} /></SettingRow>
      <SettingRow label="New Leads" desc="Deals entering the CRM pipeline"><Toggle on={true} /></SettingRow>
      <SettingRow label="Task Completion" desc="Agents finishing assigned tasks"><Toggle on={false} /></SettingRow>

      <SectionHeader title="Digest & Summary" />
      <SettingRow label="Weekly Summary Report" desc="Comprehensive weekly digest every Monday at 9 AM"><Toggle on={true} /></SettingRow>
    </div>
  );
}

function AITab() {
  const MODELS = [
    { name: "Claude Opus", provider: "Anthropic", color: "#D4A574", role: "Complex reasoning, security", cost: "$0.075/1K", quality: 98 },
    { name: "Claude Sonnet", provider: "Anthropic", color: "#C19A6B", role: "Primary workhorse", cost: "$0.015/1K", quality: 93 },
    { name: "Claude Haiku", provider: "Anthropic", color: "#A0845C", role: "Quick classification", cost: "$0.001/1K", quality: 84 },
    { name: "GPT-4o", provider: "OpenAI", color: "#74AA9C", role: "Content, customer tasks", cost: "$0.025/1K", quality: 91 },
    { name: "Gemini Pro", provider: "Google", color: "#4285F4", role: "Data extraction", cost: "$0.007/1K", quality: 87 },
  ];
  return (
    <div>
      <SectionHeader title="Model Configuration" />
      <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", marginTop: 12, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 70px 60px", padding: "8px 14px", background: C.elevated, borderBottom: `1px solid ${C.border}` }}>
          {["Model", "Provider", "Default Role", "Cost", "Quality"].map(h => (
            <span key={h} style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
          ))}
        </div>
        {MODELS.map((m, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 70px 60px", padding: "10px 14px", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{m.name}</span>
            </div>
            <span style={{ fontSize: 10, color: C.textMuted }}>{m.provider}</span>
            <span style={{ fontSize: 10, color: C.textSec }}>{m.role}</span>
            <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{m.cost}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: C.elevated }}>
                <div style={{ width: `${m.quality}%`, height: "100%", borderRadius: 2, background: m.color }} />
              </div>
              <span style={{ fontSize: 8, color: C.textMuted }}>{m.quality}%</span>
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Global AI Settings" />
      <SettingRow label="Cost Optimization Routing" desc="Automatically route simple tasks to cheaper models"><Toggle on={true} /></SettingRow>
      <SettingRow label="Fallback Model" desc="Used when primary model fails or times out">
        <span style={{ fontSize: 11, color: C.textSec, padding: "4px 10px", borderRadius: 5, background: C.elevated, border: `1px solid ${C.border}` }}>Claude Sonnet</span>
      </SettingRow>
      <SettingRow label="Max Retry Attempts" desc="Number of retries before failing a task">
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>3</span>
      </SettingRow>
      <SettingRow label="Global Temperature" desc="Creativity level (0 = deterministic, 1 = creative)">
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>0.7</span>
      </SettingRow>
    </div>
  );
}

function BillingTab() {
  return (
    <div>
      {/* Current plan */}
      <div style={{ padding: "16px 18px", borderRadius: 10, background: `linear-gradient(135deg, ${C.purple}15, ${C.blue}15)`, border: `1px solid ${C.purple}33`, marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: C.purpleGlow, color: C.purple, border: `1px solid ${C.purple}33` }}>CURRENT PLAN</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 6 }}>Executive Build</div>
            <div style={{ fontSize: 12, color: C.textSec }}>$899 one-time setup + $99/mo management</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>$99<span style={{ fontSize: 12, fontWeight: 400, color: C.textMuted }}>/mo</span></div>
            <div style={{ fontSize: 10, color: C.textMuted }}>Next billing: Mar 1, 2026</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 10, cursor: "pointer" }}>View Invoice History</button>
          <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 10, cursor: "pointer" }}>Update Payment Method</button>
        </div>
      </div>

      <SectionHeader title="AI Budget" />
      <SettingRow label="Monthly AI Budget" desc="Maximum spend across all AI model APIs">
        <span style={{ fontSize: 14, fontWeight: 800, color: C.amber, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>$30.00</span>
      </SettingRow>
      <SettingRow label="Alert at" desc="Notify when spend reaches this percentage">
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>80%</span>
      </SettingRow>
      <SettingRow label="Hard Limit" desc="Pause all agents when budget is fully consumed"><Toggle on={false} /></SettingRow>

      <SectionHeader title="Usage This Month" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, paddingTop: 12 }}>
        {[
          { label: "AI Spend", value: "$14.64", sub: "of $30 budget", color: C.amber },
          { label: "Agent Runs", value: "1,318", sub: "API calls", color: C.text },
          { label: "Storage", value: "2.4 GB", sub: "of 10 GB", color: C.text },
        ].map((m, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamTab() {
  const members = [
    { name: "Joseph Carter", email: "joseph@theclawforge.com", role: "Owner", initials: "JC", color: C.blue, active: true },
    { name: "Invite pending...", email: "—", role: "Admin (invited)", initials: "?", color: C.textMuted, active: false },
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Team Members</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Manage who has access to Mission Control</div>
        </div>
        <button style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Invite Member</button>
      </div>
      {members.map((m, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>{m.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{m.email}</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 5,
            background: m.role === "Owner" ? C.purpleGlow : C.elevated,
            color: m.role === "Owner" ? C.purple : C.textMuted,
            border: `1px solid ${m.role === "Owner" ? `${C.purple}33` : C.border}`,
          }}>{m.role}</span>
          {m.active && <button style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 10, cursor: "pointer" }}>Edit</button>}
        </div>
      ))}

      <SectionHeader title="API Keys" />
      <SettingRow label="OpenClaw API Key" desc="Used for external integrations and webhooks">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>oc_live_••••••••7f3a</span>
          <button style={{ padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 9, cursor: "pointer" }}>Show</button>
          <button style={{ padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 9, cursor: "pointer" }}>Rotate</button>
        </div>
      </SettingRow>
    </div>
  );
}

function AdvancedTab() {
  return (
    <div>
      <SectionHeader title="Infrastructure" />
      <SettingRow label="AWS Region" desc="Primary compute region for agent instances">
        <span style={{ fontSize: 11, color: C.textSec, padding: "4px 10px", borderRadius: 5, background: C.elevated, border: `1px solid ${C.border}` }}>us-east-1 (N. Virginia)</span>
      </SettingRow>
      <SettingRow label="OpenClaw Version" desc="Framework version running on your instance">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>v2.1.4</span>
          <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: C.blueGlow, color: C.blue }}>v2.2.0 available</span>
        </div>
      </SettingRow>
      <SettingRow label="Automatic Backups" desc="Database and configuration snapshots"><Toggle on={true} /></SettingRow>
      <SettingRow label="Backup Frequency" desc="How often backups are created">
        <span style={{ fontSize: 11, color: C.textSec, padding: "4px 10px", borderRadius: 5, background: C.elevated, border: `1px solid ${C.border}` }}>Every 6 hours</span>
      </SettingRow>

      <SectionHeader title="Data & Privacy" />
      <SettingRow label="Audit Log Retention" desc="How long agent activity logs are kept">
        <span style={{ fontSize: 11, color: C.textSec, padding: "4px 10px", borderRadius: 5, background: C.elevated, border: `1px solid ${C.border}` }}>90 days</span>
      </SettingRow>
      <SettingRow label="PII Masking" desc="Automatically mask sensitive data in logs"><Toggle on={true} /></SettingRow>
      <SettingRow label="Data Export" desc="Download all your data and configuration">
        <button style={{ padding: "5px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 10, cursor: "pointer" }}>📦 Export All Data</button>
      </SettingRow>

      <SectionHeader title="Danger Zone" />
      <div style={{ padding: "14px 16px", borderRadius: 10, background: C.redGlow, border: `1px solid ${C.red}22`, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.red }}>Delete All Agents</div>
            <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>Permanently remove all agents, their configurations, and run history</div>
          </div>
          <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.red}44`, background: "transparent", color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Delete All</button>
        </div>
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 10, background: C.redGlow, border: `1px solid ${C.red}22`, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.red }}>Close Account</div>
            <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>Permanently delete your Mission Control instance and all associated data</div>
          </div>
          <button style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.red}44`, background: "transparent", color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Close Account</button>
        </div>
      </div>
    </div>
  );
}

const TAB_COMPONENTS = { profile: ProfileTab, notifications: NotificationsTab, ai: AITab, billing: BillingTab, team: TeamTab, advanced: AdvancedTab };

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
      <span style={{ fontSize: 10, fontWeight: 400, color: isDark ? "#8B919E" : "#5C6370" }}>
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

function Sidebar({ activePage, themeMode, setThemeMode, C }) {
  const isDark = themeMode !== "light";
  const NAV = [
    { section: "MAIN", items: PRIMARY_NAV_ITEMS },
    { section: "SYSTEM", items: SYSTEM_NAV_ITEMS },
  ];
  return (
    <div style={{ width: 220, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.orange}, #c2410c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>ClawForge</div>
          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 400, letterSpacing: 1, textTransform: "uppercase" }}>Mission Control</div>
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


export default function Settings() {
  const { store, client } = useMissionControl();
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const isDark = themeMode !== "light";
  useEffect(() => { persistThemeMode(themeMode); }, [themeMode]);
  useEffect(() => {
    const syncTheme = () => setThemeMode(getStoredThemeMode());
    window.addEventListener("storage", syncTheme);
    window.addEventListener("focus", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);
  C = getTheme(themeMode);

  const [tab, setTab] = useState(store.system.settings.tabKey || "profile");
  const [opMessage, setOpMessage] = useState('');
  const connection = useMemo(() => describeConnection(store), [store]);
  const runtimeChecks = useMemo(() => {
    const cfg = client?.config || {};
    const hasAuth = Boolean(cfg.authMode === 'bearer' ? cfg.hasBearerToken : cfg.authMode === 'x-api-key' ? cfg.hasApiKey : cfg.authMode === 'x-agent-token' ? cfg.hasAgentToken : (cfg.hasBearerToken || cfg.hasApiKey || cfg.hasAgentToken));
    return [
      { label: 'Live API Enabled', pass: Boolean(cfg.liveEnabled), detail: cfg.liveEnabled ? 'VITE_OPENCLAW_LIVE_ENABLED=true' : 'Live API disabled in env' },
      { label: 'Base URL', pass: Boolean(cfg.baseUrl), detail: cfg.baseUrl || 'VITE_OPENCLAW_BASE_URL is missing' },
      { label: 'Auth Mode', pass: Boolean(cfg.authMode), detail: cfg.authMode || 'unset' },
      { label: 'Credentials', pass: hasAuth, detail: hasAuth ? 'Token/key detected at runtime' : 'No runtime credentials found for selected auth mode' },
    ];
  }, [client]);
  const TabContent = TAB_COMPONENTS[tab];

  useEffect(() => {
    let cancelled = false;
    const syncTab = async () => {
      const resp = await client.run('oc.settings.tab.set', { tabKey: tab });
      if (cancelled) return;
      setOpMessage(resp.ok ? formatOpSuccess(`Tab synced: ${tab}`, resp) : formatOpError(resp.error));
    };
    syncTab();
    return () => { cancelled = true; };
  }, [tab]);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="settings" themeMode={themeMode} setThemeMode={setThemeMode} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>System</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Settings</span>
          <div style={{ flex: 1 }} />
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Settings nav */}
          <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: "12px", overflowY: "auto" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, padding: "8px 10px 6px" }}>Settings</div>
            {TABS.map(t => (
              <div key={t.key} onClick={() => setTab(t.key)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6,
                cursor: "pointer", marginBottom: 2,
                background: tab === t.key ? C.blueGlow : "transparent",
                borderLeft: tab === t.key ? `2px solid ${C.blue}` : "2px solid transparent",
              }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                <span style={{ fontSize: 12, fontWeight: tab === t.key ? 600 : 500, color: tab === t.key ? (isDark ? "#fff" : C.blue) : C.textSec }}>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 32px 32px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>
              {TABS.find(t => t.key === tab)?.label}
            </h2>
            <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>
              {tab === "profile" && "Manage your business identity and branding"}
              {tab === "notifications" && "Control how and when you receive alerts"}
              {tab === "ai" && "Configure AI models, routing, and global behavior"}
              {tab === "billing" && "Manage your plan, budget, and payment details"}
              {tab === "team" && "Control who has access to your Mission Control"}
              {tab === "advanced" && "Infrastructure, data, and account management"}
            </p>
            {opMessage && <p style={{ fontSize: 11, color: C.blue, margin: "0 0 12px" }}>{opMessage}</p>}

            <div style={{
              borderRadius: 10,
              border: `1px solid ${connection.connected ? `${C.green}66` : `${C.amber}66`}`,
              background: connection.connected ? C.greenGlow : C.amberGlow,
              padding: "10px 12px",
              marginBottom: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: connection.connected ? C.green : C.amber }}>
                    Live API {connection.connected ? 'Connected' : 'Disconnected'}
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>
                    {connection.requestId ? `Last requestId: ${connection.requestId}` : 'No request has completed yet'}
                    {connection.lastError?.debugCode ? ` · ${connection.lastError.debugCode}` : ''}
                    {connection.lastError?.status ? ` · HTTP ${connection.lastError.status}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: C.textMuted }}>
                  Runtime checks below are non-blocking and update from current session config.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginTop: 10 }}>
                {runtimeChecks.map((check) => (
                  <div key={check.label} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 9px", background: C.surface }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: check.pass ? C.green : C.red }}>{check.pass ? '✓' : '⚠'} {check.label}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, lineHeight: '14px' }}>{check.detail}</div>
                  </div>
                ))}
              </div>
            </div>
            <TabContent />
          </div>
        </div>
      </div>
    </div>
  );
}
