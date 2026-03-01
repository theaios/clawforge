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


function Overlay({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ModalCard({ width = 520, children }) {
  return (
    <div style={{
      width, maxHeight: "85vh", borderRadius: 14, background: C.surface,
      border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>{children}</div>
  );
}

function ModalHeader({ icon, title, subtitle, onClose }) {
  return (
    <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.textSec, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder, value, mono, ...rest }) {
  return (
    <input readOnly style={{
      width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: C.bg, color: C.text, fontSize: 12, outline: "none",
      fontFamily: mono ? "'JetBrains Mono', 'SF Mono', monospace" : "inherit",
      boxSizing: "border-box",
    }} placeholder={placeholder} defaultValue={value} {...rest} />
  );
}

function Select({ options, value }) {
  return (
    <div style={{
      padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: C.bg, color: C.text, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span>{value || options[0]}</span>
      <span style={{ color: C.textMuted, fontSize: 10 }}>▼</span>
    </div>
  );
}

/* ═══════════════ MODAL 1: NEW AGENT ═══════════════ */
function NewAgentModal({ onClose }) {
  return (
    <Overlay onClose={onClose}>
      <ModalCard width={540}>
        <ModalHeader icon="⬡" title="Create New Agent" subtitle="Configure and deploy a new AI agent" onClose={onClose} />
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <FormField label="Agent Name" required><Input placeholder="e.g., Partnership Scout" value="" /></FormField>
          <FormField label="Role / Title" required><Input placeholder="e.g., Outbound Business Development" value="" /></FormField>
          <FormField label="Reports To" required><Select options={["Operations CEO", "Marketing CEO", "Sales CEO", "Finance CEO", "Orchestrator"]} value="Sales CEO" /></FormField>
          <FormField label="Primary Model"><Select options={["Claude Sonnet (recommended)", "Claude Opus", "Claude Haiku", "GPT-4o", "Gemini Pro"]} value="Claude Sonnet (recommended)" /></FormField>
          <FormField label="System Prompt">
            <textarea readOnly style={{
              width: "100%", height: 80, padding: "8px 12px", borderRadius: 6,
              border: `1px solid ${C.border}`, background: C.bg, color: C.textSec,
              fontSize: 11, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", resize: "vertical",
              outline: "none", boxSizing: "border-box",
            }} placeholder="Define the agent's behavior, constraints, and personality..." />
          </FormField>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6, display: "block" }}>Avatar Color</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[C.blue, C.green, C.purple, C.amber, C.red, C.teal, C.orange, C.pink].map((c, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer",
                  border: i === 0 ? `2px solid #fff` : "2px solid transparent",
                }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: C.textMuted }}>Full setup available in Add Agent</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer" }}>Cancel</button>
            <button style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🚀 Deploy Agent</button>
          </div>
        </div>
      </ModalCard>
    </Overlay>
  );
}

/* ═══════════════ MODAL 2: NEW BOARD ═══════════════ */
function NewBoardModal({ onClose }) {
  const TEMPLATES = [
    { name: "Kanban", icon: "▦", desc: "Column-based task flow" },
    { name: "Sprint", icon: "🏃", desc: "2-week iteration cycles" },
    { name: "Pipeline", icon: "◈", desc: "Stage-based progression" },
    { name: "Blank", icon: "□", desc: "Start from scratch" },
  ];
  return (
    <Overlay onClose={onClose}>
      <ModalCard width={480}>
        <ModalHeader icon="▦" title="Create New Board" subtitle="Organize work for your agent army" onClose={onClose} />
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <FormField label="Board Name" required><Input placeholder="e.g., Website Launch Sprint" value="" /></FormField>
          <FormField label="Template">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {TEMPLATES.map((t, i) => (
                <div key={i} style={{
                  padding: "12px", borderRadius: 8, cursor: "pointer",
                  background: i === 0 ? C.blueGlow : C.bg,
                  border: `1px solid ${i === 0 ? C.blue : C.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{t.name}</span>
                  </div>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{t.desc}</span>
                </div>
              ))}
            </div>
          </FormField>
          <FormField label="Assign to Department"><Select value="Operations" options={["Operations", "Marketing", "Sales", "Finance", "Engineering", "All"]} /></FormField>
          <FormField label="Default Columns">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["Backlog", "Ready", "In Progress", "Review", "Done"].map((c, i) => (
                <span key={i} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, background: C.elevated, color: C.textSec, border: `1px solid ${C.border}` }}>{c}</span>
              ))}
              <button style={{ fontSize: 10, padding: "4px 8px", borderRadius: 5, border: `1px dashed ${C.blue}44`, background: "transparent", color: C.blue, cursor: "pointer" }}>+ Add</button>
            </div>
          </FormField>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Create Board</button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

/* ═══════════════ MODAL 3: NEW CHANNEL ═══════════════ */
function NewChannelModal({ onClose }) {
  const PLATFORMS = [
    { name: "Slack", icon: "💬", connected: true },
    { name: "Discord", icon: "🎮", connected: true },
    { name: "Telegram", icon: "📱", connected: true },
    { name: "Email", icon: "✉️", connected: true },
    { name: "SMS", icon: "📲", connected: false },
  ];
  return (
    <Overlay onClose={onClose}>
      <ModalCard width={460}>
        <ModalHeader icon="◈" title="Create New Channel" subtitle="Connect a communication channel to your agents" onClose={onClose} />
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <FormField label="Channel Name" required><Input placeholder="e.g., #client-atlas-construction" value="" /></FormField>
          <FormField label="Platform" required>
            <div style={{ display: "flex", gap: 6 }}>
              {PLATFORMS.map((p, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 8, cursor: p.connected ? "pointer" : "default",
                  background: i === 0 ? C.blueGlow : C.bg,
                  border: `1px solid ${i === 0 ? C.blue : C.border}`,
                  opacity: p.connected ? 1 : 0.4, textAlign: "center", flex: 1,
                }}>
                  <span style={{ fontSize: 18, display: "block", marginBottom: 2 }}>{p.icon}</span>
                  <span style={{ fontSize: 9, color: C.textSec }}>{p.name}</span>
                </div>
              ))}
            </div>
          </FormField>
          <FormField label="Route to Agents">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["CX CEO", "Sales CEO", "Operations CEO"].map((a, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 500, padding: "4px 10px", borderRadius: 6, background: C.elevated, color: C.textSec, border: `1px solid ${C.border}` }}>{a} ✕</span>
              ))}
              <button style={{ fontSize: 10, padding: "4px 8px", borderRadius: 6, border: `1px dashed ${C.blue}44`, background: "transparent", color: C.blue, cursor: "pointer" }}>+ Add Agent</button>
            </div>
          </FormField>
          <FormField label="Auto-Response">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 18, borderRadius: 9, background: C.green, position: "relative", cursor: "pointer" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, right: 2 }} />
              </div>
              <span style={{ fontSize: 11, color: C.textSec }}>Agents respond automatically within routing rules</span>
            </div>
          </FormField>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: C.teal, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Create Channel</button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

/* ═══════════════ MODAL 4: APPROVE / REJECT ═══════════════ */
function ApproveRejectModal({ onClose }) {
  const [mode, setMode] = useState(null);
  return (
    <Overlay onClose={onClose}>
      <ModalCard width={520}>
        <ModalHeader icon="◉" title="Approval Required" subtitle="APR-046 • Marketing CEO" onClose={onClose} />
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{ padding: "14px 16px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Increase Meta Ads daily budget</div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 8 }}>Campaign "AI Agents for SMBs" — Current: $40/day → Requested: $80/day</div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: C.amberGlow, color: C.amber, border: `1px solid ${C.amber}33` }}>MEDIUM RISK</span>
              <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 9999, background: C.elevated, color: C.textSec, border: `1px solid ${C.border}` }}>$1,200/mo impact</span>
            </div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 8, background: C.purpleGlow, border: `1px solid ${C.purple}22`, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.purple, marginBottom: 4 }}>🧠 Agent Reasoning</div>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: "17px" }}>
              Campaign CTR is 4.2% vs 1.8% industry benchmark. ROAS at 3.8x exceeds 2x target.
              Lookalike audience outperforming interest-based 2:1. Increasing budget from $40→$80/day
              projected to generate 4-6 additional leads/week at current conversion rate.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Current Spend", value: "$40/day", color: C.text },
              { label: "Proposed", value: "$80/day", color: C.amber },
              { label: "Monthly Impact", value: "+$1,200", color: C.red },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {mode === "instructions" && (
            <FormField label="Instructions for Agent">
              <textarea readOnly style={{
                width: "100%", height: 60, padding: "8px 12px", borderRadius: 6,
                border: `1px solid ${C.blue}`, background: C.bg, color: C.text,
                fontSize: 11, resize: "none", outline: "none", boxSizing: "border-box",
              }} placeholder="e.g., Start with $60/day for 3 days, then increase to $80 if ROAS stays above 3x..." />
            </FormField>
          )}
          {mode === "reject" && (
            <FormField label="Rejection Reason">
              <textarea readOnly style={{
                width: "100%", height: 60, padding: "8px 12px", borderRadius: 6,
                border: `1px solid ${C.red}`, background: C.bg, color: C.text,
                fontSize: 11, resize: "none", outline: "none", boxSizing: "border-box",
              }} placeholder="e.g., Budget too aggressive. Try incremental increase to $55/day first..." />
            </FormField>
          )}
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <button style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer" }}>📋 Audit Trail</button>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setMode("reject")} style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${C.red}44`, background: C.redGlow, color: C.red, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✗ Reject</button>
            <button onClick={() => setMode("instructions")} style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${C.amber}44`, background: C.amberGlow, color: C.amber, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Approve w/ Instructions</button>
            <button style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: C.green, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✓ Approve</button>
          </div>
        </div>
      </ModalCard>
    </Overlay>
  );
}

/* ═══════════════ MODAL 5: UPGRADE OPENCLAW ═══════════════ */
function UpgradeModal({ onClose }) {
  return (
    <Overlay onClose={onClose}>
      <ModalCard width={500}>
        <ModalHeader icon="⚡" title="Upgrade OpenClaw" subtitle="New version available" onClose={onClose} />
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ padding: "10px 16px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 2 }}>Current</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.textSec }}>v2.1.4</div>
            </div>
            <span style={{ fontSize: 18, color: C.blue }}>→</span>
            <div style={{ padding: "10px 16px", borderRadius: 8, background: C.blueGlow, border: `1px solid ${C.blue}33`, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.blue, marginBottom: 2 }}>New</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.blue }}>v2.2.0</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>What's New</div>
            {[
              { type: "feature", text: "Multi-model routing with cost optimization" },
              { type: "feature", text: "Enhanced prompt injection defense layer" },
              { type: "feature", text: "Agent-to-agent direct messaging protocol" },
              { type: "fix", text: "Fixed memory leak in long-running orchestrator sessions" },
              { type: "fix", text: "Resolved race condition in concurrent task assignment" },
              { type: "security", text: "Patched CVE-2026-1142: Input sanitization bypass" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                  background: item.type === "feature" ? C.blueGlow : item.type === "fix" ? C.amberGlow : C.redGlow,
                  color: item.type === "feature" ? C.blue : item.type === "fix" ? C.amber : C.red,
                  border: `1px solid ${item.type === "feature" ? C.blue : item.type === "fix" ? C.amber : C.red}33`,
                  textTransform: "uppercase",
                }}>{item.type}</span>
                <span style={{ fontSize: 11, color: C.textSec }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 14px", borderRadius: 8, background: C.amberGlow, border: `1px solid ${C.amber}22`, borderLeft: `3px solid ${C.amber}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, marginBottom: 2 }}>⚠ Upgrade Notice</div>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: "16px" }}>All agents will be paused for ~90 seconds during upgrade. Active tasks will be queued and resumed automatically. Recommended to schedule during low-traffic window.</div>
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: C.textMuted }}>Last upgraded: Jan 28, 2026</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer" }}>Later</button>
            <button style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: `linear-gradient(135deg, ${C.orange}, #c2410c)`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>⚡ Upgrade Now</button>
          </div>
        </div>
      </ModalCard>
    </Overlay>
  );
}

/* ═══════════════ MODAL 6: CONFIRM DANGEROUS ACTION ═══════════════ */
function DangerModal({ onClose }) {
  const [typed, setTyped] = useState("");
  const CONFIRM_PHRASE = "DELETE AGENT";
  return (
    <Overlay onClose={onClose}>
      <ModalCard width={460}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.red}33`, background: C.redGlow, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.red }}>Confirm Dangerous Action</div>
            <div style={{ fontSize: 11, color: C.textSec, marginTop: 1 }}>This action cannot be undone</div>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.red}33`, background: "transparent", color: C.red, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>You are about to permanently delete:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: C.elevated, border: `1px solid ${C.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.pink}, ${C.pink}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>CW</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Content Writer</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>Claude Sonnet • 142 tasks completed • Active since Jan 12</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.red, marginBottom: 8 }}>This will permanently:</div>
            {[
              "Remove the agent and all its configuration",
              "Delete 142 run history entries and logs",
              "Unassign 2 active tasks (will move to Unassigned)",
              "Revoke all tool permissions and API access",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                <span style={{ color: C.red, fontSize: 10 }}>✕</span>
                <span style={{ fontSize: 11, color: C.textSec }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 4, display: "block" }}>
              Type <span style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", color: C.red, fontWeight: 800 }}>{CONFIRM_PHRASE}</span> to confirm
            </label>
            <input
              value={typed} onChange={e => setTyped(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 6,
                border: `1px solid ${typed === CONFIRM_PHRASE ? C.red : C.border}`,
                background: C.bg, color: C.red, fontSize: 12, fontWeight: 700,
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                outline: "none", boxSizing: "border-box",
              }}
              placeholder={CONFIRM_PHRASE}
            />
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button style={{
            padding: "8px 18px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
            background: typed === CONFIRM_PHRASE ? C.red : C.elevated,
            color: typed === CONFIRM_PHRASE ? "#fff" : C.textMuted,
            opacity: typed === CONFIRM_PHRASE ? 1 : 0.5,
          }}>🗑 Delete Agent Permanently</button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

/* ═══════════════ SHOWCASE WRAPPER ═══════════════ */
const MODAL_LIST = [
  { key: "newAgent", label: "⬡ New Agent", icon: "⬡", color: C.blue },
  { key: "newBoard", label: "▦ New Board", icon: "▦", color: C.purple },
  { key: "newChannel", label: "◈ New Channel", icon: "◈", color: C.teal },
  { key: "approve", label: "◉ Approve / Reject", icon: "◉", color: C.amber },
  { key: "upgrade", label: "⚡ Upgrade OpenClaw", icon: "⚡", color: C.orange },
  { key: "danger", label: "⚠️ Dangerous Action", icon: "⚠️", color: C.red },
];

const MODALS = {
  newAgent: NewAgentModal,
  newBoard: NewBoardModal,
  newChannel: NewChannelModal,
  approve: ApproveRejectModal,
  upgrade: UpgradeModal,
  danger: DangerModal,
};

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

export default function KeyModals() {
  const [isDark, setIsDark] = useState(() => getStoredThemeMode() !== "light");
  useEffect(() => { localStorage.setItem("cf-theme", isDark ? "dark" : "light"); }, [isDark]);
  const C = getTheme(isDark);

  const [activeModal, setActiveModal] = useState(null);
  const ModalComponent = activeModal ? MODALS[activeModal] : null;

  return (
    <><ScrollbarStyle C={C} /><div style={{ width: "100%", height: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.orange}, #c2410c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Key Modals</span>
        </div>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>Click any button to preview the modal</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 520 }}>
          {MODAL_LIST.map(m => (
            <button key={m.key} onClick={() => setActiveModal(m.key)} style={{
              padding: "18px 16px", borderRadius: 12, border: `1px solid ${C.border}`,
              background: C.surface, cursor: "pointer", textAlign: "center",
              transition: "all 0.15s ease",
            }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>{m.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{m.label.replace(/^[^ ]+ /, "")}</span>
            </button>
          ))}
        </div>
      </div>
      {ModalComponent && <ModalComponent onClose={() => setActiveModal(null)} />}
    </div>
    </>
  );
}
