import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants & Config ───
const BRAND = {
  orange: "#FF6B1A",
  orangeGlow: "#FF8C42",
  orangeDim: "#CC5510",
  chrome: "#C8CCD0",
  chromeDark: "#8A9098",
  dark: "#0D0F12",
  darkCard: "#161A1F",
  darkSurface: "#1C2128",
  darkBorder: "#2A3038",
  green: "#34D399",
  greenDim: "#059669",
  red: "#F87171",
  yellow: "#FBBF24",
  text: "#E8EAED",
  textMuted: "#8A9098",
  textDim: "#5A6270",
};

const QUESTIONS = [
  { id: "company_name", text: "What's your company called?", field: "Company Name", required: true, category: "discovery", priority: 10 },
  { id: "industry", text: "What industry are you in?", field: "Industry", required: true, category: "discovery", priority: 9,
    options: ["Tech / SaaS", "E-Commerce", "Healthcare", "Finance", "Real Estate", "Education", "Marketing Agency", "Legal", "Construction", "Food & Beverage", "Non-Profit", "Other"] },
  { id: "capabilities", text: "What do you need help with?", field: "Capabilities", required: true, category: "discovery", priority: 8,
    options: ["Website", "Business Plan", "Marketing Strategy", "Social Media", "Paid Advertising", "Email Marketing", "E-Commerce", "Sales System", "Customer Support", "Content Creation", "SEO & Growth", "Finance & Reporting"] },
  { id: "goals", text: "What's the #1 thing you want to achieve?", field: "Goals", required: true, category: "discovery", priority: 7,
    options: ["Generate leads", "Sell products/services", "Build brand awareness", "Automate operations", "Scale existing business", "Launch something new"] },
  { id: "agent_deploy", text: "Ready to deploy your first agent?", field: "Agent Deployed", required: true, category: "agent", priority: 6 },
  { id: "founder_name", text: "What's your name and role?", field: "Founder Name", required: false, category: "discovery", priority: 5 },
  { id: "description", text: "Describe your business in a sentence", field: "Description", required: false, category: "discovery", priority: 4 },
  { id: "brand_voice", text: "How should your brand sound?", field: "Brand Voice", required: false, category: "kb", priority: 3 },
  { id: "audience", text: "Who's your ideal customer?", field: "Target Audience", required: false, category: "kb", priority: 3 },
  { id: "competitors", text: "Who are your competitors?", field: "Competitors", required: false, category: "kb", priority: 2 },
  { id: "value_prop", text: "What makes you different?", field: "Value Prop", required: false, category: "kb", priority: 2 },
];

const REQUIRED_IDS = ["company_name", "industry", "capabilities", "goals", "agent_deploy"];

const TRANSCRIPT_CHUNKS = [
  { text: "So I'm starting this company called ", delay: 800 },
  { text: "Apex Digital Solutions", delay: 1600, fills: "company_name", value: "Apex Digital Solutions" },
  { text: "... we're basically a ", delay: 2400 },
  { text: "marketing agency", delay: 3200, fills: "industry", value: "Marketing Agency" },
  { text: " focused on small businesses. ", delay: 4000 },
  { text: "I really need help with ", delay: 5000 },
  { text: "social media and content creation", delay: 6000, fills: "capabilities", value: ["Social Media", "Content Creation"] },
  { text: ". The main goal is to ", delay: 7200 },
  { text: "generate leads", delay: 8000, fills: "goals", value: "Generate leads" },
  { text: " for my clients. ", delay: 9000 },
  { text: "My name is Marcus and I'm the founder.", delay: 10500, fills: "founder_name", value: "Marcus — Founder" },
];

function getCloudPosition(index, total, answered, priority, required, canvasW, canvasH) {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  if (answered) return { x: cx, y: cy, scale: 0, opacity: 0 };
  const ring = required ? 0.28 : 0.42;
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const radiusX = canvasW * ring;
  const radiusY = canvasH * ring;
  const jitter = (priority % 3) * 12;
  return {
    x: cx + Math.cos(angle) * (radiusX + jitter),
    y: cy + Math.sin(angle) * (radiusY + jitter),
    scale: 0.55 + (priority / 10) * 0.55,
    opacity: required ? 1 : 0.6 + (priority / 10) * 0.3,
  };
}

function QuestionBubble({ q, pos, status, focused, onTap, onConfirm }) {
  const isAnswered = status === "answered";
  const isInferred = status === "inferred";
  const isDismissed = status === "dismissed";
  if (isDismissed) return null;

  const size = focused ? 1.3 : pos.scale;
  const w = focused ? 240 : 140 + pos.scale * 60;
  const h = focused ? 72 : 44 + pos.scale * 16;

  const bgColor = isAnswered ? BRAND.greenDim : isInferred ? `${BRAND.orange}33` : `${BRAND.darkCard}`;
  const borderColor = focused ? BRAND.orange : isAnswered ? BRAND.green : isInferred ? BRAND.orangeGlow : BRAND.darkBorder;

  return (
    <div
      onClick={() => !isAnswered && onTap(q.id)}
      style={{
        position: "absolute",
        left: pos.x - w / 2,
        top: pos.y - h / 2,
        width: w,
        height: h,
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        cursor: isAnswered ? "default" : "pointer",
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isAnswered ? 0.35 : pos.opacity,
        transform: `scale(${size})`,
        zIndex: focused ? 50 : isAnswered ? 1 : 10,
        boxShadow: focused ? `0 0 30px ${BRAND.orange}44, 0 4px 20px rgba(0,0,0,0.5)` : "0 2px 8px rgba(0,0,0,0.3)",
        userSelect: "none",
        backdropFilter: "blur(8px)",
      }}
    >
      {isAnswered && <span style={{ marginRight: 6, color: BRAND.green, fontSize: 14, fontWeight: 700 }}>✓</span>}
      <span style={{
        fontSize: focused ? 14 : 11 + pos.scale * 2,
        fontWeight: focused ? 600 : 500,
        color: isAnswered ? BRAND.green : focused ? BRAND.orange : BRAND.text,
        textAlign: "center",
        lineHeight: 1.3,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "-0.01em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: focused ? "normal" : "nowrap",
      }}>{q.text}</span>
      {isInferred && !focused && (
        <div onClick={(e)=>{e.stopPropagation();onConfirm(q.id)}} style={{position:"absolute",top:-8,right:-8,width:20,height:20,background:BRAND.orange,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",cursor:"pointer",boxShadow:`0 0 8px ${BRAND.orange}66`}}>✓</div>
      )}
    </div>
  );
}

function Waveform({ active }) {
  const bars = 28;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 32 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = active ? 6 + Math.random() * 22 : 4;
        return <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: active ? `linear-gradient(180deg, ${BRAND.orange}, ${BRAND.orangeDim})` : BRAND.darkBorder, transition: active ? "height 0.15s ease" : "height 0.4s ease" }} />;
      })}
    </div>
  );
}

function ProgressStrip({ statuses }) {
  const steps = [
    { id: "company_name", label: "Company" },
    { id: "industry", label: "Industry" },
    { id: "capabilities", label: "Capabilities" },
    { id: "goals", label: "Goals" },
    { id: "agent_deploy", label: "Deploy Agent" },
  ];
  const done = steps.filter(s => statuses[s.id] === "answered").length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "12px 20px", background: BRAND.darkCard, borderRadius: 16, border: `1px solid ${BRAND.darkBorder}` }}>
      {steps.map((s, i) => {
        const complete = statuses[s.id] === "answered";
        const inferred = statuses[s.id] === "inferred";
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 72 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: complete ? BRAND.green : inferred ? `${BRAND.orange}44` : BRAND.darkSurface, border: `2px solid ${complete ? BRAND.green : inferred ? BRAND.orange : BRAND.darkBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: complete ? "#fff" : BRAND.textMuted, transition: "all 0.4s ease" }}>
                {complete ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", color: complete ? BRAND.green : BRAND.textMuted, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 28, height: 2, borderRadius: 1, background: complete ? BRAND.green : BRAND.darkBorder, margin: "0 2px", marginBottom: 18, transition: "background 0.4s ease" }} />}
          </div>
        );
      })}
      <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: BRAND.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{done}/5</div>
    </div>
  );
}

function ReviewDrawer({ answers, onClose }) {
  return (
    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 340, background: BRAND.darkCard, borderLeft: `1px solid ${BRAND.darkBorder}`, padding: 24, overflowY: "auto", zIndex: 100, boxShadow: "-4px 0 30px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: BRAND.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>Review Extracted Data</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: BRAND.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>
      {Object.entries(answers).map(([id, val]) => {
        const q = QUESTIONS.find(qq => qq.id === id);
        if (!q || !val) return null;
        return (
          <div key={id} style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: BRAND.darkSurface, border: `1px solid ${BRAND.darkBorder}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.orangeGlow, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{q.field} {q.required && <span style={{ color: BRAND.orange }}>★</span>}</div>
            <div style={{ fontSize: 13, color: BRAND.text, fontFamily: "'DM Sans', sans-serif" }}>{Array.isArray(val) ? val.join(", ") : val}</div>
          </div>
        );
      })}
    </div>
  );
}

function DeployFlow({ onDeploy }) {
  const [agentName, setAgentName] = useState("Content Strategist");
  const [deploying, setDeploying] = useState(false);
  const handleDeploy = () => { setDeploying(true); setTimeout(() => onDeploy(agentName), 1800); };

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ width: 420, background: BRAND.darkCard, borderRadius: 20, border: `1px solid ${BRAND.darkBorder}`, padding: 32, boxShadow: `0 0 60px ${BRAND.orange}22, 0 20px 60px rgba(0,0,0,0.6)` }}>
        {!deploying ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px", background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🤖</div>
              <h3 style={{ margin: 0, color: BRAND.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>Deploy Your First Agent</h3>
              <p style={{ margin: "8px 0 0", color: BRAND.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>We've pre-configured an agent based on your needs. Review and deploy.</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: BRAND.orangeGlow, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif" }}>Agent Name</label>
              <input value={agentName} onChange={(e)=>setAgentName(e.target.value)} style={{ width: "100%", marginTop: 6, padding: "10px 14px", borderRadius: 10, background: BRAND.darkSurface, border: `1px solid ${BRAND.darkBorder}`, color: BRAND.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={handleDeploy} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDim})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em", boxShadow: `0 0 20px ${BRAND.orange}44` }}>Deploy Agent →</button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px", border: `3px solid ${BRAND.darkBorder}`, borderTopColor: BRAND.orange, animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ color: BRAND.text, fontSize: 16, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>Deploying {agentName}...</div>
          </div>
        )}
      </div>
    </div>
  );
}

function NextSteps({ onDone }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: BRAND.dark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 40 }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 16, background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, boxShadow: `0 0 40px ${BRAND.green}33` }}>✓</div>
      <h2 style={{ margin: "0 0 6px", color: BRAND.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>You're Operational</h2>
      <button onClick={onDone} style={{ marginTop: 28, padding: "12px 40px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDim})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: `0 0 20px ${BRAND.orange}44` }}>Go to Mission Control →</button>
    </div>
  );
}

export default function QuestionCloudOnboarding() {
  const [phase, setPhase] = useState("idle");
  const [statuses, setStatuses] = useState({});
  const [answers, setAnswers] = useState({});
  const [focusedId, setFocusedId] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [waveformKey, setWaveformKey] = useState(0);
  const [cloudDrift, setCloudDrift] = useState(0);
  const timerRef = useRef(null);

  const canvasW = 720;
  const canvasH = 440;

  useEffect(() => {
    if (phase === "recording") {
      const iv = setInterval(() => setWaveformKey(k => k + 1), 150);
      return () => clearInterval(iv);
    }
  }, [phase]);

  useEffect(() => {
    const iv = setInterval(() => setCloudDrift(d => d + 0.003), 50);
    return () => clearInterval(iv);
  }, []);

  const startRecording = useCallback(() => {
    setPhase("recording");
    setTranscript("");
    setStatuses({});
    setAnswers({});
    const processChunk = (idx) => {
      if (idx >= TRANSCRIPT_CHUNKS.length) return;
      const chunk = TRANSCRIPT_CHUNKS[idx];
      timerRef.current = setTimeout(() => {
        setTranscript(prev => prev + chunk.text);
        if (chunk.fills) {
          setAnswers(prev => ({ ...prev, [chunk.fills]: chunk.value }));
          setStatuses(prev => ({ ...prev, [chunk.fills]: "inferred" }));
        }
        processChunk(idx + 1);
      }, idx === 0 ? chunk.delay : chunk.delay - TRANSCRIPT_CHUNKS[idx - 1].delay);
    };
    processChunk(0);
  }, []);

  const stopRecording = () => { if (timerRef.current) clearTimeout(timerRef.current); setPhase("review"); };
  const confirmInferred = (id) => setStatuses(prev => ({ ...prev, [id]: "answered" }));
  const confirmAll = () => setStatuses(prev => { const next = { ...prev }; Object.keys(next).forEach(k => { if (next[k] === "inferred") next[k] = "answered"; }); return next; });

  const allRequiredDone = REQUIRED_IDS.every(id => statuses[id] === "answered");

  const handleDeploy = (agentName) => {
    setAnswers(prev => ({ ...prev, agent_deploy: agentName }));
    setStatuses(prev => ({ ...prev, agent_deploy: "answered" }));
    setTimeout(() => setPhase("complete"), 400);
  };

  const activeQuestions = QUESTIONS.filter(q => statuses[q.id] !== "dismissed");
  const positions = {};
  activeQuestions.forEach((q, i) => {
    const drift = Math.sin(cloudDrift + i * 0.7) * 8;
    const driftY = Math.cos(cloudDrift + i * 0.5) * 6;
    const base = getCloudPosition(i, activeQuestions.length, statuses[q.id] === "answered", q.priority, q.required, canvasW, canvasH);
    positions[q.id] = { ...base, x: base.x + drift, y: base.y + driftY };
  });

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: BRAND.dark, fontFamily: "'DM Sans', sans-serif", color: BRAND.text, position: "relative", overflow: "hidden" }}>
      <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BRAND.darkBorder}`, background: `${BRAND.darkCard}cc`, backdropFilter: "blur(12px)", position: "relative", zIndex: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>🦞</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}><span style={{ color: BRAND.orange }}>Claw</span><span style={{ color: BRAND.chrome }}>Forge</span></span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px", position: "relative" }}>
        <div style={{ width: "100%", maxWidth: 520, marginBottom: 20 }}><ProgressStrip statuses={statuses} /></div>

        <div style={{ width: canvasW, height: canvasH, position: "relative", background: `radial-gradient(ellipse at center, ${BRAND.darkSurface} 0%, ${BRAND.dark} 70%)`, borderRadius: 24, border: `1px solid ${BRAND.darkBorder}`, overflow: "hidden", marginBottom: 20 }}>
          {phase === "idle" && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 5 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px", background: `linear-gradient(135deg, ${BRAND.orange}22, ${BRAND.orangeDim}11)`, border: `2px dashed ${BRAND.orange}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎙️</div>
              <div style={{ color: BRAND.textMuted, fontSize: 14, fontWeight: 500 }}>Hit Record and tell us about your business</div>
            </div>
          )}

          {phase !== "idle" && activeQuestions.map(q => (
            <QuestionBubble key={q.id} q={q} pos={positions[q.id]} status={statuses[q.id] || "active"} focused={focusedId === q.id} onTap={setFocusedId} onConfirm={confirmInferred} />
          ))}

          {showReview && <ReviewDrawer answers={answers} onClose={() => setShowReview(false)} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 24px", borderRadius: 20, background: BRAND.darkCard, border: `1px solid ${BRAND.darkBorder}`, minWidth: 500 }}>
          {phase === "idle" ? (
            <button onClick={startRecording} style={{ padding: "10px 28px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDim})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>●</span> Start Recording</button>
          ) : phase === "recording" ? (
            <>
              <button onClick={stopRecording} style={{ padding: "10px 20px", borderRadius: 14, border: "none", background: BRAND.red, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>■ Stop</button>
              <Waveform active={true} key={waveformKey} />
            </>
          ) : (
            <>
              <button onClick={startRecording} style={{ padding: "10px 20px", borderRadius: 14, border: `1px solid ${BRAND.darkBorder}`, background: BRAND.darkSurface, color: BRAND.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🎙️ Re-record</button>
              <button onClick={confirmAll} style={{ padding: "10px 20px", borderRadius: 14, border: `1px solid ${BRAND.orange}44`, background: `${BRAND.orange}18`, color: BRAND.orange, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✓ Confirm All Inferred</button>
              <button onClick={() => setShowReview(!showReview)} style={{ padding: "10px 20px", borderRadius: 14, border: `1px solid ${BRAND.darkBorder}`, background: BRAND.darkSurface, color: BRAND.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>📋 Review Data</button>
            </>
          )}
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setPhase("deploy")} disabled={!allRequiredDone} style={{ padding: "10px 24px", borderRadius: 14, border: "none", background: allRequiredDone ? `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenDim})` : BRAND.darkSurface, color: allRequiredDone ? "#fff" : BRAND.textDim, fontSize: 14, fontWeight: 700, cursor: allRequiredDone ? "pointer" : "not-allowed" }}>Save & Deploy →</button>
          </div>
        </div>
      </div>

      {phase === "deploy" && <DeployFlow onDeploy={handleDeploy} />}
      {phase === "complete" && <NextSteps onDone={() => setPhase("idle")} />}
    </div>
  );
}
