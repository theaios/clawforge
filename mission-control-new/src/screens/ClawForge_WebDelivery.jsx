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


const ENVIRONMENTS = [
  { name: "Production", url: "theclawforge.com", status: "live", uptime: "99.97%", version: "v1.3.2", lastDeploy: "10:52 AM today", region: "us-east-1", color: C.green },
  { name: "Staging", url: "staging.theclawforge.com", status: "live", uptime: "99.4%", version: "v1.3.3-rc1", lastDeploy: "9:30 AM today", region: "us-east-1", color: C.blue },
  { name: "Development", url: "dev.theclawforge.com", status: "building", uptime: "—", version: "v1.3.3-dev", lastDeploy: "Building...", region: "us-east-1", color: C.amber },
];

const ENV_STATUS = {
  live: { bg: C.greenGlow, color: C.green, border: "rgba(34,197,94,0.3)", label: "● Live" },
  building: { bg: C.amberGlow, color: C.amber, border: "rgba(245,158,11,0.3)", label: "◌ Building" },
  down: { bg: C.redGlow, color: C.red, border: "rgba(239,68,68,0.3)", label: "● Down" },
};

const MILESTONES = [
  { label: "Domain & Hosting", date: "Feb 10", status: "done", pct: 100 },
  { label: "Homepage & Branding", date: "Feb 14", status: "done", pct: 100 },
  { label: "FAQ & Pricing Pages", date: "Feb 18", status: "done", pct: 100 },
  { label: "Stripe Checkout Integration", date: "Feb 26", status: "in-progress", pct: 72, critical: true },
  { label: "Client Dashboard MVP", date: "Feb 28", status: "in-progress", pct: 45 },
  { label: "Website Go-Live 🚀", date: "Feb 28", status: "upcoming", pct: 0, milestone: true },
  { label: "Email Onboarding Flow", date: "Mar 3", status: "upcoming", pct: 0 },
  { label: "SEO & Analytics Setup", date: "Mar 5", status: "upcoming", pct: 0 },
  { label: "Full Campaign Launch", date: "Mar 7", status: "upcoming", pct: 0, milestone: true },
  { label: "Security Audit & SOC 2 Prep", date: "Mar 14", status: "upcoming", pct: 0 },
];

const MS_COLORS = { done: C.green, "in-progress": C.blue, upcoming: C.textMuted };

const QA_RESULTS = [
  { suite: "Core Checkout Flow", tests: 24, passed: 22, failed: 2, status: "failing", agent: "QA Tester", lastRun: "9:45 AM" },
  { suite: "User Authentication", tests: 18, passed: 18, failed: 0, status: "passing", agent: "QA Tester", lastRun: "9:42 AM" },
  { suite: "API Endpoints", tests: 47, passed: 47, failed: 0, status: "passing", agent: "QA Tester", lastRun: "9:40 AM" },
  { suite: "Responsive Layout", tests: 32, passed: 30, failed: 2, status: "failing", agent: "QA Tester", lastRun: "9:38 AM" },
  { suite: "Performance (Lighthouse)", tests: 6, passed: 5, failed: 1, status: "warning", agent: "Full-Stack Dev", lastRun: "9:30 AM" },
  { suite: "Accessibility (WCAG 2.1)", tests: 14, passed: 12, failed: 2, status: "failing", agent: "Full-Stack Dev", lastRun: "9:25 AM" },
];

const SUITE_STATUS = {
  passing: { bg: C.greenGlow, color: C.green, label: "✓ Passing" },
  failing: { bg: C.redGlow, color: C.red, label: "✕ Failing" },
  warning: { bg: C.amberGlow, color: C.amber, label: "⚠ Warning" },
};

const BROWSER_TESTS = [
  { browser: "Chrome 122", os: "macOS", status: "pass", icon: "🌐" },
  { browser: "Firefox 124", os: "macOS", status: "pass", icon: "🦊" },
  { browser: "Safari 17.3", os: "macOS", status: "fail", icon: "🧭", note: "CSS grid gap rendering issue" },
  { browser: "Edge 122", os: "Windows", status: "pass", icon: "🔷" },
  { browser: "Chrome 122", os: "Android", status: "pass", icon: "📱" },
  { browser: "Safari", os: "iOS 17", status: "pass", icon: "📱" },
];

const BACKLOG = [
  { id: "WEB-089", title: "Fix Stripe webhook retry logic", priority: "P0", status: "in-progress", agent: "Full-Stack Dev", agentColor: "#60A5FA" },
  { id: "WEB-088", title: "Safari CSS grid gap fix", priority: "P1", status: "in-progress", agent: "Full-Stack Dev", agentColor: "#60A5FA" },
  { id: "WEB-087", title: "Mobile checkout responsive breakpoint", priority: "P1", status: "ready", agent: "Full-Stack Dev", agentColor: "#60A5FA" },
  { id: "WEB-086", title: "Add og:image meta tags for social sharing", priority: "P2", status: "ready", agent: "Content Writer", agentColor: C.pink },
  { id: "WEB-085", title: "Implement Lighthouse performance suggestions", priority: "P2", status: "queued", agent: "DevOps Engineer", agentColor: C.orange },
  { id: "WEB-084", title: "WCAG color contrast fixes on pricing page", priority: "P1", status: "queued", agent: "Full-Stack Dev", agentColor: "#60A5FA" },
  { id: "WEB-083", title: "Add structured data (JSON-LD) for SEO", priority: "P3", status: "queued", agent: "SEO Specialist", agentColor: "#A78BFA" },
  { id: "WEB-082", title: "Cookie consent banner implementation", priority: "P2", status: "queued", agent: "Full-Stack Dev", agentColor: "#60A5FA" },
];

const PRIORITY_COLORS = { P0: C.red, P1: C.amber, P2: C.blue, P3: C.textMuted };
const STATUS_LABELS = { "in-progress": { bg: C.blueGlow, color: C.blue, label: "In Progress" }, ready: { bg: C.greenGlow, color: C.green, label: "Ready" }, queued: { bg: "rgba(92,99,112,0.12)", color: C.textSec, label: "Queued" } };

const RELEASES = [
  { version: "v1.3.2", date: "Feb 25", type: "patch", notes: "Docker deploy fix, VPC security group update, homepage hero copy refresh", current: true },
  { version: "v1.3.1", date: "Feb 22", type: "patch", notes: "Backup scheduler hotfix, email template rendering fix" },
  { version: "v1.3.0", date: "Feb 18", type: "minor", notes: "FAQ page launch, pricing page redesign, Stripe test mode integration" },
  { version: "v1.2.0", date: "Feb 10", type: "minor", notes: "Mission Control dashboard MVP, agent orchestrator v1, Slack integration" },
  { version: "v1.1.0", date: "Feb 3", type: "minor", notes: "Domain setup, SSL, basic landing page with waitlist form" },
  { version: "v1.0.0", date: "Jan 28", type: "major", notes: "Initial infrastructure — AWS provisioning, OpenClaw v2.1.4 deployment, base Docker images" },
];

const TYPE_COLORS = { major: C.red, minor: C.blue, patch: C.textMuted };

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


export default function WebDelivery() {
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [backlogFilter, setBacklogFilter] = useState("all");
  const totalTests = QA_RESULTS.reduce((s, r) => s + r.tests, 0);
  const totalPassed = QA_RESULTS.reduce((s, r) => s + r.passed, 0);
  const passPct = Math.round((totalPassed / totalTests) * 100);

  const filteredBacklog = backlogFilter === "all" ? BACKLOG : BACKLOG.filter(b => b.status === backlogFilter);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <ScrollbarStyle C={C} />
      <Sidebar activePage="webdelivery" isDark={isDark} setIsDark={setIsDark} C={C} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>System</span><span style={{ color: C.textMuted }}>/</span><span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Web & Delivery</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, width: 280 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>⌘</span><span style={{ fontSize: 12, color: C.textMuted }}>Search issues...</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 6 }}>●</span> Production live</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>Web & Delivery Tracker</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>theclawforge.com • Managed by Full-Stack Dev & DevOps Engineer</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled title="Prototype control — not wired yet" style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, fontSize: 11, cursor: "pointer" }}>🔄 Run All Tests</button>
              <button disabled title="Prototype control — not wired yet" style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🚀 Deploy to Production</button>
            </div>
          </div>

          {/* Environment status cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
            {ENVIRONMENTS.map((env, i) => {
              const st = ENV_STATUS[env.status];
              return (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${env.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{env.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.blue, marginBottom: 6, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{env.url}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {[
                      { l: "Version", v: env.version },
                      { l: "Uptime", v: env.uptime },
                      { l: "Last Deploy", v: env.lastDeploy },
                      { l: "Region", v: env.region },
                    ].map((d, di) => (
                      <div key={di} style={{ padding: "4px 0" }}>
                        <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6 }}>{d.l}</div>
                        <div style={{ fontSize: 10, color: C.textSec, fontWeight: 500 }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Milestone tracker */}
          <div style={{ padding: "16px 18px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Milestone Tracker</span>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ l: "Done", c: C.green }, { l: "In Progress", c: C.blue }, { l: "Upcoming", c: C.textMuted }].map((lg, i) => (
                  <span key={i} style={{ fontSize: 9, color: lg.c, display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: lg.c }} /> {lg.l}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {MILESTONES.map((ms, i) => {
                const col = MS_COLORS[ms.status];
                const isLast = i === MILESTONES.length - 1;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: ms.milestone ? 56 : 40, flexShrink: 0 }}>
                      {ms.milestone ? (
                        <div style={{
                          width: 18, height: 18, transform: "rotate(45deg)", borderRadius: 3,
                          background: ms.status === "done" ? col : "transparent",
                          border: `2px solid ${col}`, marginBottom: 4,
                        }} />
                      ) : (
                        <div style={{
                          width: 14, height: 14, borderRadius: "50%",
                          background: ms.status === "done" ? col : ms.status === "in-progress" ? C.blueGlow : C.elevated,
                          border: `2px solid ${col}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginBottom: 4,
                        }}>
                          {ms.status === "done" && <span style={{ fontSize: 7, color: "#fff" }}>✓</span>}
                          {ms.status === "in-progress" && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.blue }} />}
                        </div>
                      )}
                      <span style={{ fontSize: 7, color: col, fontWeight: 600, textAlign: "center", lineHeight: "9px", maxWidth: 56 }}>{ms.label}</span>
                      <span style={{ fontSize: 7, color: C.textMuted, marginTop: 1 }}>{ms.date}</span>
                      {ms.critical && <span style={{ fontSize: 7, color: C.red, fontWeight: 700, marginTop: 1 }}>🔥 Critical</span>}
                    </div>
                    {!isLast && (
                      <div style={{
                        flex: 1, height: 2, marginBottom: 28, minWidth: 8,
                        background: ms.status === "done" ? col : `${C.border}`,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-column layout: QA + Browser + Backlog */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
            {/* QA Results */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>QA Test Results</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: passPct === 100 ? C.green : C.amber }}>{passPct}% pass</span>
              </div>
              {QA_RESULTS.map((suite, i) => {
                const st = SUITE_STATUS[suite.status];
                return (
                  <div key={i} style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{suite.suite}</span>
                      <span style={{ fontSize: 8, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.elevated }}>
                        <div style={{ width: `${(suite.passed / suite.tests) * 100}%`, height: "100%", borderRadius: 2, background: suite.failed > 0 ? C.amber : C.green }} />
                      </div>
                      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{suite.passed}/{suite.tests}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Browser Testing */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Browser Compatibility</span>
              </div>
              {BROWSER_TESTS.map((bt, i) => (
                <div key={i} style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{bt.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{bt.browser}</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>{bt.os}</div>
                    {bt.note && <div style={{ fontSize: 9, color: C.red, marginTop: 1 }}>↳ {bt.note}</div>}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999,
                    background: bt.status === "pass" ? C.greenGlow : C.redGlow,
                    color: bt.status === "pass" ? C.green : C.red,
                  }}>{bt.status === "pass" ? "✓ Pass" : "✕ Fail"}</span>
                </div>
              ))}
            </div>

            {/* Backlog */}
            <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Web Backlog</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {["all", "in-progress", "ready", "queued"].map(f => (
                    <button key={f} onClick={() => setBacklogFilter(f)} style={{
                      padding: "2px 6px", borderRadius: 3, fontSize: 8, cursor: "pointer", border: "none",
                      background: backlogFilter === f ? C.blueGlow : "transparent",
                      color: backlogFilter === f ? C.blue : C.textMuted,
                      fontWeight: 500, textTransform: "capitalize",
                    }}>{f === "all" ? "All" : f.replace("-", " ")}</button>
                  ))}
                </div>
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {filteredBacklog.map((item, i) => {
                  const st = STATUS_LABELS[item.status];
                  return (
                    <div key={i} style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${PRIORITY_COLORS[item.priority]}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>
                        <span style={{ fontSize: 8, color: C.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{item.id}</span>
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 7, fontWeight: 600, padding: "1px 4px", borderRadius: 3, background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: C.text, marginBottom: 2 }}>{item.title}</div>
                      <span style={{ fontSize: 9, color: item.agentColor }}>{item.agent}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Release notes */}
          <div style={{ borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Release History</span>
            </div>
            <div style={{ display: "flex" }}>
              {RELEASES.map((rel, i) => (
                <div key={i} style={{
                  flex: 1, padding: "12px 14px", borderRight: i < RELEASES.length - 1 ? `1px solid ${C.border}` : "none",
                  background: rel.current ? C.blueGlow : "transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: rel.current ? C.blue : C.text }}>{rel.version}</span>
                    <span style={{ fontSize: 7, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: `${TYPE_COLORS[rel.type]}22`, color: TYPE_COLORS[rel.type], textTransform: "uppercase" }}>{rel.type}</span>
                    {rel.current && <span style={{ fontSize: 7, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: C.greenGlow, color: C.green }}>CURRENT</span>}
                  </div>
                  <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 4 }}>{rel.date}</div>
                  <div style={{ fontSize: 9, color: C.textSec, lineHeight: "14px" }}>{rel.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
