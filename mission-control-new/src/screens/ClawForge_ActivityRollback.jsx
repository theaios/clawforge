import { useState } from "react";

const AGENTS = {
  orchestrator: { name: "Orchestrator", color: "#ff4a00", icon: "⚙️" },
  ceo_ops: { name: "CEO · Ops", color: "#0066ff", icon: "📊" },
  ceo_dev: { name: "CEO · Dev", color: "#7c3aed", icon: "💻" },
  ceo_marketing: { name: "CEO · Marketing", color: "#059669", icon: "📣" },
  ceo_finance: { name: "CEO · Finance", color: "#d97706", icon: "💰" },
  ceo_hr: { name: "CEO · HR", color: "#dc2626", icon: "👥" },
};

const ACTION_TYPES = {
  config_change: { label: "Config Change", icon: "⚡", severity: "medium" },
  file_modified: { label: "File Modified", icon: "📄", severity: "low" },
  deployment: { label: "Deployment", icon: "🚀", severity: "high" },
  agent_action: { label: "Agent Action", icon: "🤖", severity: "low" },
  permission_change: { label: "Permission Change", icon: "🔐", severity: "high" },
  data_update: { label: "Data Update", icon: "🗃️", severity: "medium" },
  rollback: { label: "Rollback", icon: "⏪", severity: "info" },
  system_event: { label: "System Event", icon: "🔧", severity: "low" },
};

const SEVERITY_COLORS = { low: "#64748b", medium: "#d97706", high: "#dc2626", info: "#0066ff" };

const generateActions = () => ([
  { id: "act-001", timestamp: "2026-03-01T14:32:18Z", agent: "orchestrator", type: "config_change", summary: "Updated routing rules for CEO · Dev agent", detail: "Changed priority threshold from 0.7 to 0.85 for code review tasks", before: '{ "priority_threshold": 0.7, "auto_assign": true, "max_queue": 15 }', after: '{ "priority_threshold": 0.85, "auto_assign": true, "max_queue": 15 }', canUndo: true, status: "active" },
  { id: "act-002", timestamp: "2026-03-01T14:28:05Z", agent: "ceo_dev", type: "file_modified", summary: "Refactored authentication middleware", detail: "Modified /src/middleware/auth.js — 47 lines changed across 3 functions", before: 'function validateToken(token) {\n  const decoded = jwt.verify(token, SECRET);\n  return decoded;\n}', after: 'function validateToken(token) {\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    if (decoded.exp < Date.now() / 1000) throw new Error("Expired");\n    return decoded;\n  } catch (err) {\n    logger.warn("Token validation failed", { error: err.message });\n    return null;\n  }\n}', canUndo: true, status: "active" },
  { id: "act-003", timestamp: "2026-03-01T14:15:42Z", agent: "ceo_ops", type: "deployment", summary: "Deployed v2.4.1 to staging environment", detail: "Full stack deployment including database migrations (3 tables altered)", before: "v2.4.0 — 12 containers, 2 replicas each", after: "v2.4.1 — 12 containers, 2 replicas each, +1 migration worker", canUndo: true, status: "active" },
  { id: "act-004", timestamp: "2026-03-01T13:58:30Z", agent: "ceo_marketing", type: "data_update", summary: "Updated email campaign template — Spring Promo", detail: "Changed subject line, CTA button color, and hero image across 3 variants", before: '{ "subject": "Spring Sale — 20% Off", "cta_color": "#22c55e", "hero": "spring_v1.png" }', after: '{ "subject": "🔥 Spring Blowout — 30% Off Everything", "cta_color": "#ff4a00", "hero": "spring_v3.png" }', canUndo: true, status: "active" },
  { id: "act-005", timestamp: "2026-03-01T13:45:11Z", agent: "orchestrator", type: "permission_change", summary: "Elevated CEO · Finance to Tier 2 access", detail: "Granted read/write access to /financials/reports and /billing/invoices endpoints", before: '{ "tier": 1, "scope": ["read:/financials/reports"] }', after: '{ "tier": 2, "scope": ["read:/financials/reports", "write:/financials/reports", "read:/billing/invoices", "write:/billing/invoices"] }', canUndo: true, status: "active" },
]);

const formatTime = (ts) => new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
const formatDate = (ts) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeAgo = (ts) => { const now = new Date("2026-03-01T15:00:00Z"); const mins = Math.round((now - new Date(ts)) / 60000); if (mins < 60) return `${mins}m ago`; const hrs = Math.round(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.round(hrs / 24)}d ago`; };

function DiffViewer({ before, after }) {
  if (!before && !after) return null;
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 12.5, fontFamily: "'IBM Plex Mono', 'Fira Code', monospace" }}>
      {before && <div style={{ flex: 1, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}><div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Before</div><pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#7f1d1d", lineHeight: 1.5 }}>{before}</pre></div>}
      {after && <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}><div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>After</div><pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#14532d", lineHeight: 1.5 }}>{after}</pre></div>}
    </div>
  );
}

function ActionRow({ action, isExpanded, onToggle, onRollback, isSelected, onSelect, rollbackState }) {
  const agent = AGENTS[action.agent];
  const actionType = ACTION_TYPES[action.type];
  const sevColor = SEVERITY_COLORS[actionType.severity];
  const isRolledBack = action.status === "rolled_back" || rollbackState === "done";
  const isRollingBack = rollbackState === "rolling";

  return (
    <div style={{ background: isRolledBack ? "#f8fafc" : "#ffffff", borderRadius: 12, border: isExpanded ? "1.5px solid #ff4a00" : "1px solid #e5e7eb", marginBottom: 8, transition: "all 0.25s", boxShadow: isExpanded ? "0 4px 24px rgba(255,74,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)", opacity: isRolledBack ? 0.55 : 1, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: isRolledBack ? "#94a3b8" : sevColor }} />
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px 14px 20px", cursor: "pointer" }}>
        <div onClick={(e) => { e.stopPropagation(); onSelect(); }} style={{ width: 20, height: 20, borderRadius: 5, border: isSelected ? "2px solid #ff4a00" : "2px solid #cbd5e1", background: isSelected ? "#ff4a00" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isSelected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</div>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${agent.color}12`, border: `1px solid ${agent.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{agent.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}><span style={{ fontSize: 14, fontWeight: 600, color: isRolledBack ? "#94a3b8" : "#0f172a", textDecoration: isRolledBack ? "line-through" : "none", lineHeight: 1.3 }}>{action.summary}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: agent.color, background: `${agent.color}10`, padding: "1px 7px", borderRadius: 4 }}>{agent.name}</span>
            <span style={{ fontSize: 11, color: sevColor, background: `${sevColor}12`, padding: "1px 7px", borderRadius: 4, fontWeight: 500 }}>{actionType.icon} {actionType.label}</span>
            {isRolledBack && <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "1px 7px", borderRadius: 4, fontWeight: 600 }}>⏪ Rolled Back</span>}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{formatTime(action.timestamp)}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{timeAgo(action.timestamp)}</div></div>
      </div>

      {isExpanded && (
        <div style={{ padding: "0 18px 16px 20px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 4 }}>{action.detail}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'IBM Plex Mono', monospace" }}>ID: {action.id} · {formatDate(action.timestamp)} at {formatTime(action.timestamp)}</div>
            <DiffViewer before={action.before} after={action.after} />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {action.canUndo && !isRolledBack && <button onClick={(e) => { e.stopPropagation(); onRollback(action.id); }} disabled={isRollingBack} style={{ padding: "8px 16px", background: isRollingBack ? "#fef2f2" : "linear-gradient(135deg, #ff4a00, #dc2626)", color: isRollingBack ? "#dc2626" : "#fff", border: isRollingBack ? "1px solid #fecaca" : "none", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: isRollingBack ? "wait" : "pointer" }}>{isRollingBack ? "Rolling Back…" : "⏪ Rollback This Action"}</button>}
              <button style={{ padding: "8px 16px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12.5, fontWeight: 500 }}>📋 Copy Details</button>
              <button style={{ padding: "8px 16px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12.5, fontWeight: 500 }}>🔗 View Full Context</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 20px", flex: 1, minWidth: 140, position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent || "#ff4a00" }} /><div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{label}</div><div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{value}</div>{sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{sub}</div>}</div>;
}

export default function ClawForgeActivityRollback() {
  const [actions] = useState(generateActions);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [rollbackStates, setRollbackStates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgent, setFilterAgent] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(null);

  const handleRollback = (id) => setShowConfirmModal(id);
  const confirmRollback = (id) => { setRollbackStates((prev) => ({ ...prev, [id]: "rolling" })); setShowConfirmModal(null); setTimeout(() => setRollbackStates((prev) => ({ ...prev, [id]: "done" })), 1800); };
  const handleBatchRollback = () => setShowConfirmModal("batch");
  const confirmBatchRollback = () => { const ids = [...selectedIds]; setShowConfirmModal(null); ids.forEach((id, i) => { setTimeout(() => setRollbackStates((prev) => ({ ...prev, [id]: "rolling" })), i * 300); setTimeout(() => setRollbackStates((prev) => ({ ...prev, [id]: "done" })), i * 300 + 1800); }); setSelectedIds(new Set()); };
  const toggleSelect = (id) => setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const filteredActions = actions.filter((a) => {
    if (searchQuery && !a.summary.toLowerCase().includes(searchQuery.toLowerCase()) && !a.detail.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterAgent !== "all" && a.agent !== filterAgent) return false;
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterSeverity !== "all" && ACTION_TYPES[a.type].severity !== filterSeverity) return false;
    return true;
  });

  const rolledBackCount = Object.values(rollbackStates).filter((s) => s === "done").length;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8f9fb 0%, #f0f1f5 100%)", fontFamily: "'DM Sans', 'Outfit', -apple-system, sans-serif", color: "#0f172a" }}>
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #ff4a00, #ff6b1a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🦞</div><div><div style={{ fontSize: 18, letterSpacing: 2, color: "#0f172a", lineHeight: 1 }}>CLAWFORGE</div><div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase" }}>Mission Control</div></div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, color: "#16a34a", fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />All Systems Operational</div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px 60px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 4 }}>Activity Log <span style={{ color: "#ff4a00" }}>&amp; Rollback</span></h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>Every action logged. Anything can be undone. Full control, always.</p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Total Actions" value={actions.length} sub="Today" accent="#ff4a00" />
          <StatCard label="Rollbacks" value={rolledBackCount} sub="Reversed" accent="#dc2626" />
          <StatCard label="Active Agents" value="6" sub="All online" accent="#059669" />
          <StatCard label="Undoable" value={actions.filter((a) => a.canUndo).length} sub={`of ${actions.length} total`} accent="#0066ff" />
        </div>

        <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <input type="text" placeholder="Search actions…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: "1 1 220px", minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12.5, color: "#334155", background: "#f8fafc" }} />
          <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}><option value="all">All Agents</option>{Object.entries(AGENTS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.name}</option>)}</select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}><option value="all">All Types</option>{Object.entries(ACTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}><option value="all">All Severity</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
        </div>

        {filteredActions.map((action) => (
          <ActionRow
            key={action.id}
            action={action}
            isExpanded={expandedId === action.id}
            onToggle={() => setExpandedId(expandedId === action.id ? null : action.id)}
            onRollback={handleRollback}
            isSelected={selectedIds.has(action.id)}
            onSelect={() => toggleSelect(action.id)}
            rollbackState={rollbackStates[action.id]}
          />
        ))}
      </div>

      {showConfirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowConfirmModal(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#ffffff", borderRadius: 16, padding: "28px 32px", maxWidth: 440, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Confirm Rollback</h3>
            <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>This will revert the selected action(s). A rollback entry will be logged.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowConfirmModal(null)} style={{ padding: "10px 20px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#475569" }}>Cancel</button>
              <button onClick={() => (showConfirmModal === "batch" ? confirmBatchRollback() : confirmRollback(showConfirmModal))} style={{ padding: "10px 20px", background: "linear-gradient(135deg, #ff4a00, #dc2626)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Confirm Rollback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
