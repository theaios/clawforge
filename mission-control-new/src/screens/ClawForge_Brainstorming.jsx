import { useEffect, useMemo, useRef, useState } from "react";
import { cycleThemeMode, getStoredThemeMode, persistThemeMode } from "../lib/themeMode";
import { collectSubtreeIds, createInitialMap, CUSTOM_THEME_SLOT_KEY, IDEAS_INBOX, VIEW_STATE_KEY } from "./brainstorming/mapModel";
import { THEME_PRESETS, toThemeMap } from "./brainstorming/themePresets";
import { useMapEditor } from "./brainstorming/useMapEditor";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.8;
const ZOOM_STEP = 0.1;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const ROOT_W = 192;
const ROOT_H = 96;
const BRANCH_W = 216;
const BRANCH_H = 44;
const NODE_W = 220;
const NODE_H = 88;
const NODE_GAP_Y = 26;
const NODE_GAP_X = 274;
const CONNECTOR_CLEARANCE = 12;
const THEME_STORAGE_KEY = "cf-theme";
const DRAG_MODE = { NODE: "node", SUBTREE: "subtree" };

function sideAnchors(fromRect, toRect) {
  const fromCenterX = fromRect.left + fromRect.width / 2;
  const toCenterX = toRect.left + toRect.width / 2;
  const toRight = toCenterX >= fromCenterX;

  return {
    fromX: toRight ? fromRect.left + fromRect.width : fromRect.left,
    fromY: fromRect.top + fromRect.height / 2,
    toX: toRight ? toRect.left : toRect.left + toRect.width,
    toY: toRect.top + toRect.height / 2,
    toRight,
  };
}

function rectOverlap(a, b, pad = 8) {
  return !(a.right + pad <= b.left || b.right + pad <= a.left || a.bottom + pad <= b.top || b.bottom + pad <= a.top);
}

function segmentIntersectsRect(p1, p2, rect, pad = 4) {
  const r = { left: rect.left - pad, right: rect.right + pad, top: rect.top - pad, bottom: rect.bottom + pad };
  if (p1.x === p2.x) {
    const x = p1.x;
    if (x < r.left || x > r.right) return false;
    const y1 = Math.min(p1.y, p2.y);
    const y2 = Math.max(p1.y, p2.y);
    return !(y2 < r.top || y1 > r.bottom);
  }
  if (p1.y === p2.y) {
    const y = p1.y;
    if (y < r.top || y > r.bottom) return false;
    const x1 = Math.min(p1.x, p2.x);
    const x2 = Math.max(p1.x, p2.x);
    return !(x2 < r.left || x1 > r.right);
  }
  return false;
}
const APP_THEME_PRESET = { light: "frost", dark: "midnight", trippy: "neon-synth" };

function appThemePresetId() {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? APP_THEME_PRESET.dark : APP_THEME_PRESET.light;
}

function presetById(id) {
  return THEME_PRESETS.find((x) => x.id === id);
}

function ScrollbarStyle({ C }) {
  return <style>{`*::-webkit-scrollbar{width:6px;height:6px}*::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}`}</style>;
}

function ThemeToggle({ themeMode, setThemeMode }) {
  const isDark = themeMode !== "light";
  const current = themeMode === "trippy" ? { icon: "🪩", label: "Trippy" } : themeMode === "light" ? { icon: "☀️", label: "Light" } : { icon: "🌙", label: "Dark" };
  return (
    <div onClick={() => setThemeMode(cycleThemeMode(themeMode))} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px", borderRadius: 6, cursor: "pointer",
      background: isDark ? "rgba(59,130,246,0.08)" : "rgba(37,99,235,0.06)",
      border: "1px solid transparent", transition: "all 0.2s ease",
    }}>
      <span style={{ fontSize: 13, lineHeight: 1 }}>{current.icon}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: isDark ? "#8B919E" : "#5C6370" }}>{current.label}</span>
      <div style={{
        width: 30, height: 16, borderRadius: 8, position: "relative",
        background: isDark ? "#3B82F6" : "#CBD5E1", transition: "background 0.2s ease", flexShrink: 0,
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 2, left: isDark ? 16 : 2,
          transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  );
}

function Sidebar({ activePage, themeMode, setThemeMode, C, collapsedSections, onToggleSection }) {
  const isDark = themeMode !== "light";
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
    ]},
    { section: "SYSTEM", items: [
      { icon: "⛨", label: "Security", key: "security" },
      { icon: "⊞", label: "Integrations", key: "integrations" },
      { icon: "📊", label: "Cost & Usage", key: "costusage" },
      { icon: "⚙️", label: "Settings", key: "settings" },
      { icon: "🛠", label: "Under Development", key: "development" },
      { icon: "🧾", label: "Activity Log", key: "activitylog" },
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
        {NAV.map((s, si) => {
          const collapsed = !!collapsedSections[s.section];
          return (
            <div key={si} style={{ marginBottom: 4 }}>
              <button
                onClick={() => onToggleSection(s.section)}
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
                  color: C.textMuted,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  padding: "12px 10px 6px",
                }}
              >
                <span>{s.section}</span>
                <span style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: 5,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${C.border}`,
                  background: C.elevated,
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: C.textSec,
                }}>{collapsed ? "+" : "−"}</span>
              </button>
              {!collapsed && s.items.map((item, ii) => {
                const active = item.key === activePage;
                const m = { 'start-here': '/start-here',  chat: '/chat', brainstorm: '/brainstorm', brainstorming: '/brainstorm', tasks: '/boards', agentarmy: '/army', configurator: '/configurator?step=1', security: '/security', integrations: '/integrations', costusage: '/costs', settings: '/settings', development: '/development', activitylog: '/activity-log', 'activity log': '/activity-log', approvals: '/approvals', files: '/files' };
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
          );
        })}
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

function ThemePanel({ C, activeThemeId, setThemeById, close, saveCustom, loadCustom }) {
  return (
    <div style={{ position: "absolute", right: 78, top: 120, width: 360, borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 12px 32px rgba(10,20,40,0.14)", padding: 18, zIndex: 50 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Themes</div>
        <button onClick={close} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: C.textMuted }}>✕</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {THEME_PRESETS.map((theme) => {
          const selected = theme.id === activeThemeId;
          return (
            <button key={theme.id} onClick={() => setThemeById(theme.id)} style={{ textAlign: "left", borderRadius: 14, border: `1.5px solid ${selected ? C.accent : C.border}`, background: C.elevated, padding: 10, cursor: "pointer", transition: "all 180ms" }}>
              <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, height: 74, display: "flex", alignItems: "center", justifyContent: "center", background: theme.canvasBg }}>
                <div style={{ width: 76, height: 2, background: theme.connector }} />
              </div>
              <div style={{ marginTop: 8, color: C.text, fontSize: 12, fontWeight: 600 }}>{theme.name}</div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <button onClick={saveCustom} style={{ border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, padding: "8px 10px", background: C.elevated, cursor: "pointer" }}>Save custom slot</button>
        <button onClick={loadCustom} style={{ border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, padding: "8px 10px", background: C.elevated, cursor: "pointer" }}>Load custom slot</button>
      </div>
    </div>
  );
}

const LAYOUTS = [{ id: "mind", label: "Mind map" }, { id: "org", label: "Org chart" }, { id: "list", label: "List" }, { id: "stack", label: "Stack" }];

function LayoutPanel({ C, selected, setSelected, close }) {
  return (
    <div style={{ position: "absolute", right: 78, top: 120, width: 240, borderRadius: 14, background: C.surface, boxShadow: "0 18px 36px rgba(15,23,42,0.16)", border: `1px solid ${C.border}`, padding: 10, zIndex: 50 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, padding: "4px 6px" }}><div style={{ fontSize: 14, fontWeight: 700 }}>Layout</div><button onClick={close} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.textMuted, fontSize: 14 }}>✕</button></div>
      {LAYOUTS.map((l) => {
        const active = selected === l.id;
        return <button key={l.id} onClick={() => setSelected(l.id)} style={{ width: "100%", textAlign: "left", border: "none", background: active ? `${C.accent}14` : "transparent", borderRadius: 10, padding: "10px 10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text, fontSize: 13 }}><span>{l.label}</span><span style={{ opacity: active ? 1 : 0 }}>✓</span></button>;
      })}
    </div>
  );
}

function cardStatus(status, C) {
  if (status === "active") return { bg: `${C.green}1f`, color: C.green, label: "Active" };
  if (status === "exploring") return { bg: `${C.amber}22`, color: C.amber, label: "Exploring" };
  return { bg: `${C.textMuted}22`, color: C.textSec, label: "Idea" };
}

function Keycap({ C, text }) {
  return <span style={{ minWidth: 28, height: 18, borderRadius: 6, border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 6px", fontSize: 10, fontWeight: 700, color: C.textSec, background: C.surface }}>{text}</span>;
}

export default function Brainstorming() {
  const [themeMode, setThemeMode] = useState(getStoredThemeMode);
  const isDark = themeMode !== "light";
  const [activeThemeId, setActiveThemeId] = useState(() => appThemePresetId());
  const [theme, setTheme] = useState(() => presetById(appThemePresetId()) || THEME_PRESETS[0]);
  const C = useMemo(() => toThemeMap(theme), [theme]);
  const initialMap = useMemo(() => createInitialMap({ product: C.blue, marketing: C.purple, sales: C.green, community: C.teal, tech: C.red }), [C.blue, C.green, C.purple, C.red, C.teal]);

  const { map, selectedNode, selectedIds, undoStack, redoStack, selectNode, addChild, addSibling, addRootTopic, deleteNode, toggleAutoAlign, setManualPosition, setManualPositionsBatch, setLayoutMode, copySubtree, pasteSubtree, undo, redo } = useMapEditor(initialMap);

  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [contextTab, setContextTab] = useState("convert");
  const [showThemes, setShowThemes] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({ SYSTEM: true });
  const [dragNodeId, setDragNodeId] = useState(null);
  const [dragMode, setDragMode] = useState(DRAG_MODE.NODE);
  const panStartRef = useRef({ x: 0, y: 0, originX: 0, originY: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0, nodeId: null, positions: [] });

  useEffect(() => { persistThemeMode(themeMode); }, [themeMode]);

  useEffect(() => {
    let t;
    if (collapsedSections.SYSTEM === undefined || collapsedSections.SYSTEM === true) return;
    t = setTimeout(() => setCollapsedSections((p) => ({ ...p, SYSTEM: true })), 12000);
    return () => t && clearTimeout(t);
  }, [collapsedSections.SYSTEM]);

  const centerX = 780; const centerY = 420;

  useEffect(() => {
    const raw = sessionStorage.getItem(VIEW_STATE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.zoom) setZoom(parsed.zoom);
      if (parsed.pan) setPan(parsed.pan);
    } catch {}
  }, []);

  useEffect(() => {
    zoomRef.current = zoom;
    panRef.current = pan;
    sessionStorage.setItem(VIEW_STATE_KEY, JSON.stringify({ zoom, pan }));
  }, [zoom, pan]);

  useEffect(() => {
    const next = presetById(appThemePresetId());
    if (next) {
      setActiveThemeId(appThemePresetId());
      setTheme(next);
    }
  }, [themeMode]);

  useEffect(() => {
    const syncTheme = () => {
      const appThemeId = appThemePresetId();
      if (appThemeId === activeThemeId) return;
      const next = presetById(appThemeId);
      if (!next) return;
      setActiveThemeId(appThemeId);
      setTheme(next);
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("focus", syncTheme);
    syncTheme();

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("focus", syncTheme);
    };
  }, [activeThemeId]);

  useEffect(() => {
    const onKey = (e) => {
      if (!selectedNode) return;
      if (e.key === "Tab") { e.preventDefault(); addChild(selectedNode.id); }
      if (e.key === "Enter") { e.preventDefault(); addSibling(selectedNode.id); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") { e.preventDefault(); copySubtree(selectedNode.id); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") { e.preventDefault(); pasteSubtree(selectedNode.id); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
      if ((e.key === "Delete" || e.key === "Backspace") && !["INPUT", "TEXTAREA"].includes((e.target?.tagName || "").toUpperCase())) {
        e.preventDefault();
        deleteNode(selectedNode.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode, addChild, addSibling, copySubtree, pasteSubtree, undo, redo, deleteNode]);

  const layoutScopeId = selectedNode?.type === "branch" || selectedNode?.type === "root"
    ? selectedNode.id
    : (selectedNode?.parentId || "root");

  const selectedLayout = useMemo(() => {
    const scope = map.nodesById[layoutScopeId] || map.nodesById.root;
    if (!scope) return "mind";
    if (scope.type === "root") {
      const firstBranch = (scope.childrenIds || []).map((id) => map.nodesById[id]).find(Boolean);
      return firstBranch?.layoutMode || "mind";
    }
    return scope.layoutMode || "mind";
  }, [layoutScopeId, map]);

  const setLayoutForScope = (mode) => {
    setLayoutMode(layoutScopeId, mode);
  };

  const branchLayouts = useMemo(() => {
    const roots = (map.rootOrder || ["root"]).map((id) => map.nodesById[id]).filter(Boolean);
    const rootLayouts = roots.map((root, rootIndex) => {
      const fallbackRootX = roots.length > 1 ? (rootIndex - (roots.length - 1) / 2) * 780 : 0;
      const fallbackRootY = rootIndex % 2 === 0 ? 0 : 120;
      const rootX = centerX + (root.manualPosition?.x ?? fallbackRootX);
      const rootY = centerY + (root.manualPosition?.y ?? fallbackRootY);

      const defaults = [
        { x: -430, y: -220 },
        { x: 430, y: -220 },
        { x: -500, y: 90 },
        { x: 500, y: 90 },
        { x: 0, y: 280 },
      ];

      const branchLayoutsForRoot = (root.childrenIds || []).map((branchId, i) => {
        const branch = map.nodesById[branchId];
        if (!branch) return null;
        const mode = branch.layoutMode || "mind";
        const fallback = defaults[i] || { x: i % 2 ? 460 : -460, y: -200 + i * 120 };
        const baseX = rootX + (branch.manualPosition?.x ?? fallback.x);
        const baseY = rootY + (branch.manualPosition?.y ?? fallback.y);
        const left = baseX < rootX;

        const positioned = [];
        const connectors = [];

        const placeChildren = (parent, depth = 1) => {
          const children = (parent.childrenIds || []).map((id) => map.nodesById[id]).filter(Boolean);
          if (!children.length) return;
          const spread = (children.length - 1) * ((mode === "list" || mode === "stack" ? 110 : NODE_H + NODE_GAP_Y) / 2);

          children.forEach((child, idx) => {
            let x;
            let y;

            if (!child.autoAlign && child.manualPosition) {
              x = centerX + child.manualPosition.x;
              y = centerY + child.manualPosition.y;
            } else if (mode === "org") {
              x = baseX + idx * 250 - Math.max(0, children.length - 1) * 125;
              y = baseY + 130 + (depth - 1) * 130;
            } else if (mode === "list") {
              x = (parent.id === branch.id ? baseX : (parent.x || baseX)) + (left ? -30 : 30);
              y = (parent.id === branch.id ? baseY : (parent.y || baseY)) + 72 + idx * 110;
            } else if (mode === "stack") {
              const anchorX = parent.id === branch.id ? baseX : (parent.x || baseX);
              const anchorY = parent.id === branch.id ? baseY : (parent.y || baseY);
              x = anchorX - NODE_W / 2 + 8 * idx;
              y = anchorY + 72 + idx * 24;
            } else {
              const anchorX = parent.id === branch.id ? baseX : (parent.x || baseX);
              const anchorY = parent.id === branch.id ? baseY : (parent.y || baseY);
              x = anchorX + (left ? -NODE_GAP_X : NODE_GAP_X);
              y = anchorY - spread + idx * (NODE_H + NODE_GAP_Y);
            }

            const placed = { ...child, x, y };
            positioned.push(placed);

            const fromX = parent.type === "branch"
              ? (left ? baseX - BRANCH_W / 2 : baseX + BRANCH_W / 2)
              : ((parent.x || 0) + (left ? 0 : NODE_W));
            const fromY = parent.type === "branch" ? baseY : (parent.y || 0) + NODE_H / 2;
            const toX = left ? x + NODE_W : x;
            const toY = y + NODE_H / 2;

            connectors.push({ id: `${parent.id}->${child.id}`, fromId: parent.id, toId: child.id, fromX, fromY, toX, toY, color: branch.color, left });
            placeChildren(placed, depth + 1);
          });
        };

        placeChildren({ ...branch, x: baseX, y: baseY, type: "branch" }, 1);
        return { root, rootX, rootY, branch, mode, baseX, baseY, left, nodes: positioned, connectors };
      }).filter(Boolean);

      return { root, rootX, rootY, branches: branchLayoutsForRoot };
    });

    const allBoxes = [];
    rootLayouts.forEach(({ root, rootX, rootY, branches }) => {
      allBoxes.push({ id: root.id, type: "root", x: rootX - ROOT_W / 2, y: rootY - ROOT_H / 2, w: ROOT_W, h: ROOT_H });
      branches.forEach(({ branch, baseX, baseY, nodes }) => {
        allBoxes.push({ id: branch.id, type: "branch", x: baseX - BRANCH_W / 2, y: baseY - BRANCH_H / 2, w: BRANCH_W, h: BRANCH_H });
        nodes.forEach((n) => allBoxes.push({ id: n.id, type: "idea", x: n.x, y: n.y, w: NODE_W, h: NODE_H }));
      });
    });

    rootLayouts.forEach(({ branches }) => {
      branches.forEach((layout) => {
        const byX = [...layout.nodes].sort((a, b) => (a.x - b.x) || (a.y - b.y));
        for (let i = 0; i < byX.length; i += 1) {
          for (let j = 0; j < i; j += 1) {
            const a = byX[j];
            const b = byX[i];
            if (Math.abs(a.x - b.x) > NODE_W * 0.85) continue;
            const ar = { left: a.x, top: a.y, right: a.x + NODE_W, bottom: a.y + NODE_H };
            const br = { left: b.x, top: b.y, right: b.x + NODE_W, bottom: b.y + NODE_H };
            if (rectOverlap(ar, br, 10)) {
              const shift = ar.bottom - br.top + NODE_GAP_Y;
              b.y += shift;
            }
          }
        }

        const positionedById = new Map(layout.nodes.map((n) => [n.id, n]));
        positionedById.set(layout.branch.id, { id: layout.branch.id, x: layout.baseX - BRANCH_W / 2, y: layout.baseY - BRANCH_H / 2, width: BRANCH_W, height: BRANCH_H, type: "branch" });

        const nodeRectFor = (nodeId) => {
          if (nodeId === layout.branch.id) {
            return { left: layout.baseX - BRANCH_W / 2, top: layout.baseY - BRANCH_H / 2, width: BRANCH_W, height: BRANCH_H };
          }
          const node = positionedById.get(nodeId);
          if (!node) return null;
          return { left: node.x, top: node.y, width: NODE_W, height: NODE_H };
        };

        layout.connectors = layout.connectors.map((c) => {
          const fromRect = nodeRectFor(c.fromId);
          const toRect = nodeRectFor(c.toId);
          if (!fromRect || !toRect) return c;

          const { fromX, fromY, toX, toY, toRight } = sideAnchors(fromRect, toRect);
          let laneX = toRight ? Math.max(fromX, toX) + 34 : Math.min(fromX, toX) - 34;
          const rects = allBoxes.filter((b) => ![c.fromId, c.toId].includes(b.id)).map((b) => ({ left: b.x, top: b.y, right: b.x + b.w, bottom: b.y + b.h }));

          let guard = 0;
          while (guard < 20) {
            const p1 = { x: fromX, y: fromY };
            const p2 = { x: laneX, y: fromY };
            const p3 = { x: laneX, y: toY };
            const p4 = { x: toX, y: toY };
            const hit = rects.some((r) => segmentIntersectsRect(p1, p2, r, CONNECTOR_CLEARANCE) || segmentIntersectsRect(p2, p3, r, CONNECTOR_CLEARANCE) || segmentIntersectsRect(p3, p4, r, CONNECTOR_CLEARANCE));
            if (!hit) break;
            laneX += toRight ? 26 : -26;
            guard += 1;
          }

          return { ...c, fromX, fromY, toX, toY, laneX, left: !toRight };
        });
      });
    });

    return rootLayouts;
  }, [map]);

  const nodePos = {};
  branchLayouts.forEach(({ root, rootX, rootY, branches }) => {
    nodePos[root.id] = { x: rootX, y: rootY };
    branches.forEach(({ branch, baseX, baseY, nodes }) => {
      nodePos[branch.id] = { x: baseX, y: baseY };
      nodes.forEach((n) => { nodePos[n.id] = { x: n.x, y: n.y }; });
    });
  });

  const clampZoom = (value) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

  const zoomAt = (nextZoom, clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clampedZoom = clampZoom(nextZoom);
    const currentZoom = zoomRef.current;
    const currentPan = panRef.current;
    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;
    const worldX = (cursorX - currentPan.x) / currentZoom;
    const worldY = (cursorY - currentPan.y) / currentZoom;

    setZoom(clampedZoom);
    setPan({
      x: cursorX - worldX * clampedZoom,
      y: cursorY - worldY * clampedZoom,
    });
  };

  const zoomBy = (delta) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(zoomRef.current + delta, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const onWheelZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const delta = -e.deltaY * WHEEL_ZOOM_SENSITIVITY;
    if (delta === 0) return;
    zoomAt(zoomRef.current + delta, e.clientX, e.clientY);
  };

  const recenter = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPan({ x: rect.width / 2 - centerX * zoom, y: rect.height / 2 - centerY * zoom });
  };
  const fitToView = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(0.88, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const startPanning = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button,[data-node-interactive='true']")) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY, originX: pan.x, originY: pan.y };
  };

  const onMove = (e) => {
    if (dragNodeId) {
      const dx = (e.clientX - dragStartRef.current.x) / zoom;
      const dy = (e.clientY - dragStartRef.current.y) / zoom;
      if (dragMode === DRAG_MODE.SUBTREE && dragStartRef.current.positions.length > 1) {
        setManualPositionsBatch(
          dragStartRef.current.positions.map((p) => ({
            id: p.id,
            x: p.x + dx - centerX,
            y: p.y + dy - centerY,
          })),
        );
      } else {
        setManualPosition(dragNodeId, dragStartRef.current.nodeX + dx - centerX, dragStartRef.current.nodeY + dy - centerY);
      }
      return;
    }
    if (!isPanning) return;
    setPan({ x: panStartRef.current.originX + (e.clientX - panStartRef.current.x), y: panStartRef.current.originY + (e.clientY - panStartRef.current.y) });
  };

  const setThemeById = (id) => {
    const t = THEME_PRESETS.find((x) => x.id === id);
    if (!t) return;
    setTheme(t);
    setActiveThemeId(id);
  };

  const requestDelete = (id) => {
    const target = map.nodesById[id];
    if (!target) return;
    if (target.type === "root" && (map.rootOrder || []).length <= 1) {
      window.alert("At least one top-level topic is required.");
      return;
    }
    const size = collectSubtreeIds(map, id).length;
    const confirmed = window.confirm(`Delete \"${target.label}\" and ${size - 1} descendant${size - 1 === 1 ? "" : "s"}?`);
    if (!confirmed) return;
    deleteNode(id);
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "DM Sans, Segoe UI, sans-serif" }}>
      <ScrollbarStyle C={C} />
      <Sidebar
        activePage="brainstorm"
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        C={C}
        collapsedSections={collapsedSections}
        onToggleSection={(section) => setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 52, borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", color: C.textMuted, fontSize: 12 }}>
          <span>Command / Brainstorming</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: C.textMuted, marginRight: 4 }}>Layout</span>
            {LAYOUTS.map((layout) => {
              const active = selectedLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => setLayoutForScope(layout.id)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${active ? C.accent : C.border}`,
                    background: active ? `${C.accent}14` : C.elevated,
                    color: active ? C.accent : C.textSec,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                  }}
                  title={`Set ${layout.label} layout`}
                >
                  {layout.label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div ref={canvasRef} onMouseDown={startPanning} onMouseMove={onMove} onMouseUp={() => { setIsPanning(false); setDragNodeId(null); }} onMouseLeave={() => { setIsPanning(false); setDragNodeId(null); }} onWheel={onWheelZoom} style={{ position: "relative", flex: 1, overflow: "hidden", background: `radial-gradient(circle at 50% 42%, ${C.elevated}, ${C.bg} 72%)`, cursor: isPanning ? "grabbing" : "grab" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `radial-gradient(${C.textMuted} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
            <div style={{ position: "absolute", inset: 0, transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "top left", transition: "transform 180ms" }}>
              <svg style={{ position: "absolute", inset: 0, width: "3200px", height: "2000px", pointerEvents: "none" }}>
                {branchLayouts.map(({ root, rootX, rootY, branches }) => branches.map(({ branch, baseX, baseY, connectors }) => {
                  const rootRect = { left: rootX - ROOT_W / 2, top: rootY - ROOT_H / 2, width: ROOT_W, height: ROOT_H };
                  const branchRect = { left: baseX - BRANCH_W / 2, top: baseY - BRANCH_H / 2, width: BRANCH_W, height: BRANCH_H };
                  const { fromX: centerFromX, fromY: centerFromY, toX: centerToX, toY: centerToY } = sideAnchors(rootRect, branchRect);
                  return (
                    <g key={`${root.id}-${branch.id}`}>
                      <path d={`M ${centerFromX} ${centerFromY} C ${(centerFromX + centerToX) / 2} ${centerFromY}, ${(centerFromX + centerToX) / 2} ${centerToY}, ${centerToX} ${centerToY}`} fill="none" stroke={branch.color} strokeWidth="2.6" opacity="0.52" />
                      {connectors.map((c) => {
                        const laneX = c.laneX ?? (c.toX >= c.fromX ? Math.max(c.fromX, c.toX) + 32 : Math.min(c.fromX, c.toX) - 32);
                        return <path key={`p-${c.id}`} d={`M ${c.fromX} ${c.fromY} L ${laneX} ${c.fromY} L ${laneX} ${c.toY} L ${c.toX} ${c.toY}`} fill="none" stroke={branch.color} strokeWidth="1.8" opacity="0.4" />;
                      })}
                    </g>
                  );
                }))}
              </svg>

              {branchLayouts.map(({ root, rootX, rootY, branches }) => (
                <div key={root.id}>
                  <div data-node-interactive="true" onClick={(e) => selectNode(root.id, e.shiftKey)} onMouseDown={(e) => {
                    e.stopPropagation();
                    const subtreeIds = dragMode === DRAG_MODE.SUBTREE ? collectSubtreeIds(map, root.id) : [root.id];
                    const positions = subtreeIds.map((id) => ({ id, x: nodePos[id]?.x ?? rootX, y: nodePos[id]?.y ?? rootY }));
                    setDragNodeId(root.id);
                    dragStartRef.current = { x: e.clientX, y: e.clientY, nodeX: rootX, nodeY: rootY, nodeId: root.id, positions };
                  }} style={{ position: "absolute", left: rootX - ROOT_W / 2, top: rootY - ROOT_H / 2, width: ROOT_W, height: ROOT_H, borderRadius: 18, border: `1px solid ${selectedIds.includes(root.id) ? C.accent : C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, boxShadow: "0 10px 26px rgba(10,20,40,0.08)", cursor: "move", gap: 8 }}><span>{root.icon || "⚡"}</span><span>{root.label}</span></div>

                  {branches.map(({ branch, baseX, baseY, nodes }) => (
                    <div key={branch.id}>
                      <div data-node-interactive="true" onClick={(e) => selectNode(branch.id, e.shiftKey)} onMouseDown={(e) => {
                        e.stopPropagation();
                        const subtreeIds = dragMode === DRAG_MODE.SUBTREE ? collectSubtreeIds(map, branch.id) : [branch.id];
                        const positions = subtreeIds.map((id) => ({ id, x: nodePos[id]?.x ?? baseX, y: nodePos[id]?.y ?? baseY }));
                        setDragNodeId(branch.id);
                        dragStartRef.current = { x: e.clientX, y: e.clientY, nodeX: baseX, nodeY: baseY, nodeId: branch.id, positions };
                      }} style={{ position: "absolute", left: baseX - BRANCH_W / 2, top: baseY - BRANCH_H / 2, width: BRANCH_W, height: BRANCH_H, borderRadius: 13, border: `1px solid ${selectedIds.includes(branch.id) ? C.accent : `${branch.color}55`}`, background: C.surface, padding: "10px 12px", boxShadow: "0 6px 16px rgba(10,20,40,0.08)", transition: "all 180ms", display: "flex", alignItems: "center", gap: 8, cursor: "move" }}><span>{branch.icon}</span> <span style={{ color: branch.color, fontWeight: 700, fontSize: 14 }}>{branch.label}</span></div>
                      {nodes.map((node) => {
                        const selected = selectedIds.includes(node.id);
                        const st = cardStatus(node.status, C);
                        return <div key={node.id} data-node-interactive="true" onClick={(e) => selectNode(node.id, e.shiftKey)} onMouseDown={(e) => {
                          e.stopPropagation();
                          const subtreeIds = dragMode === DRAG_MODE.SUBTREE ? collectSubtreeIds(map, node.id) : [node.id];
                          const positions = subtreeIds.map((id) => ({ id, x: nodePos[id]?.x ?? node.x, y: nodePos[id]?.y ?? node.y }));
                          setDragNodeId(node.id);
                          dragStartRef.current = { x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y, nodeId: node.id, positions };
                        }} style={{ position: "absolute", left: node.x, top: node.y, width: NODE_W, minHeight: NODE_H, borderRadius: 14, background: C.surface, border: `1px solid ${selected ? C.accent : C.border}`, boxShadow: selected ? "0 12px 22px rgba(37,99,235,0.16)" : "0 8px 18px rgba(10,20,40,0.08)", padding: 10, transition: "all 180ms", cursor: "move" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: st.bg, color: st.color }}>{st.label}</span><span style={{ fontSize: 10, color: branch.color }}>{node.tag}</span></div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{node.label}</div>
                          <div style={{ marginTop: 7, fontSize: 10, color: C.textMuted }}>▲ {node.votes}</div>
                        </div>;
                      })}
                    </div>
                  ))}
                </div>
              ))}

              {selectedNode && nodePos[selectedNode.id] && (
                <div style={{ position: "absolute", left: nodePos[selectedNode.id].x + (selectedNode.type === "idea" ? NODE_W / 2 : 0), top: nodePos[selectedNode.id].y - 16, transform: "translate(-50%,-100%)", display: "flex", alignItems: "center", gap: 4, padding: "7px 8px", borderRadius: 999, background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 8px 20px rgba(15,23,42,0.14)", transition: "all 170ms", zIndex: 60 }}>
                  {["✓", "⟍", "💬", "📝", "🖼", "📎", "😊", "🔗"].map((ico, i) => <button key={i} disabled title="Coming soon — disabled" style={{ border: "none", background: "transparent", fontSize: 13, cursor: "not-allowed", color: C.textMuted, width: 24, height: 24, opacity: 0.5 }}>{ico}</button>)}
                  {selectedNode.type !== "root" && <button onClick={() => toggleAutoAlign(selectedNode.id)} style={{ border: `1px solid ${selectedNode.autoAlign ? C.accent : C.border}`, background: selectedNode.autoAlign ? `${C.accent}14` : C.elevated, borderRadius: 999, height: 24, padding: "0 8px", cursor: "pointer", color: selectedNode.autoAlign ? C.accent : C.textSec, fontSize: 11, fontWeight: 600 }}>Auto-align {selectedNode.autoAlign ? "On" : "Off"}</button>}
                  <button onClick={() => setDragMode((m) => (m === DRAG_MODE.NODE ? DRAG_MODE.SUBTREE : DRAG_MODE.NODE))} style={{ border: `1px solid ${dragMode === DRAG_MODE.SUBTREE ? C.accent : C.border}`, background: dragMode === DRAG_MODE.SUBTREE ? `${C.accent}14` : C.elevated, borderRadius: 999, height: 24, padding: "0 8px", cursor: "pointer", color: dragMode === DRAG_MODE.SUBTREE ? C.accent : C.textSec, fontSize: 11, fontWeight: 600 }}>Drag: {dragMode === DRAG_MODE.NODE ? "Node" : "Subtree"}</button>
                  <button onClick={() => requestDelete(selectedNode.id)} style={{ border: `1px solid ${C.red}`, background: `${C.red}14`, borderRadius: 999, height: 24, padding: "0 10px", cursor: "pointer", color: C.red, fontSize: 11, fontWeight: 700 }}>Delete</button>
                </div>
              )}

              {selectedNode && nodePos[selectedNode.id] && (
                <div style={{ position: "absolute", left: nodePos[selectedNode.id].x - 132, top: nodePos[selectedNode.id].y + 30, display: "flex", flexDirection: "column", gap: 8, zIndex: 59 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.textMuted }}><Keycap C={C} text="Tab" /> <span>create child</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.textMuted }}><Keycap C={C} text="Enter" /> <span>create sibling</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.textMuted }}><Keycap C={C} text="Del" /> <span>delete subtree</span></div>
                </div>
              )}
            </div>

            <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", alignItems: "center", gap: 5, padding: 5, borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ width: 52, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{Math.round(zoom * 100)}%</div>
              {[{ t: "−", on: () => zoomBy(-ZOOM_STEP) }, { t: "+", on: () => zoomBy(ZOOM_STEP) }, { t: "⤢", on: fitToView }, { t: "⌖", on: recenter }].map((b) => <button key={b.t} onClick={b.on} style={{ width: 28, height: 28, border: "none", borderRadius: 8, background: C.elevated, color: C.text, cursor: "pointer" }}>{b.t}</button>)}
            </div>

            <div style={{ position: "absolute", right: 14, top: 96, display: "flex", flexDirection: "column", justifyContent: "space-between", height: 226 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 6, borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface, boxShadow: "0 8px 20px rgba(15,23,42,0.08)" }}>
                <button disabled={!selectedNode} onClick={() => selectedNode && addChild(selectedNode.id)} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.border}`, background: C.elevated, cursor: selectedNode ? "pointer" : "not-allowed", opacity: selectedNode ? 1 : 0.5 }} title={selectedNode ? "Add child / branch" : "Select a node to add a child"}>＋</button>
                <button onClick={addRootTopic} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.border}`, background: C.elevated, cursor: "pointer" }} title="Add new top-level topic">🧠</button>
                <button onClick={() => { setShowLayout((s) => !s); setShowThemes(false); }} style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${showLayout ? C.accent : C.border}`, background: showLayout ? `${C.accent}14` : C.elevated, cursor: "pointer" }}>☰</button>
                <button onClick={() => { setShowThemes((s) => !s); setShowLayout(false); }} style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${showThemes ? C.accent : C.border}`, background: showThemes ? `${C.accent}14` : C.elevated, cursor: "pointer" }}>🎨</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 6, borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface, boxShadow: "0 8px 20px rgba(15,23,42,0.08)" }}>
                <button disabled={!redoStack.length} onClick={redo} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.border}`, background: C.elevated, cursor: redoStack.length ? "pointer" : "not-allowed", opacity: redoStack.length ? 1 : 0.5 }} title={`Redo (${redoStack.length})`}>↷</button>
                <button disabled={!undoStack.length} onClick={undo} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.border}`, background: C.elevated, cursor: undoStack.length ? "pointer" : "not-allowed", opacity: undoStack.length ? 1 : 0.5 }} title={`Undo (${undoStack.length})`}>↶</button>
              </div>
            </div>

            {showThemes && <ThemePanel C={C} activeThemeId={activeThemeId} setThemeById={setThemeById} close={() => setShowThemes(false)} saveCustom={() => localStorage.setItem(CUSTOM_THEME_SLOT_KEY, JSON.stringify(theme))} loadCustom={() => { const raw = localStorage.getItem(CUSTOM_THEME_SLOT_KEY); if (!raw) return; try { const custom = JSON.parse(raw); setTheme(custom); setActiveThemeId("custom-slot"); } catch {} }} />}
            {showLayout && <LayoutPanel C={C} selected={selectedLayout} setSelected={setLayoutForScope} close={() => setShowLayout(false)} />}
          </div>

          <div style={{ width: 300, borderLeft: `1px solid ${C.border}`, background: C.surface, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>{["convert", "inbox"].map((tab) => <button key={tab} onClick={() => setContextTab(tab)} style={{ flex: 1, border: "none", background: "transparent", padding: 10, color: contextTab === tab ? C.accent : C.textMuted, borderBottom: contextTab === tab ? `2px solid ${C.accent}` : "2px solid transparent" }}>{tab}</button>)}</div>
            <div style={{ padding: 12, overflowY: "auto" }}>
              {contextTab === "convert" && !selectedNode && <div style={{ color: C.textMuted, fontSize: 12 }}>Select a node to edit.</div>}
              {contextTab === "convert" && selectedNode && <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, background: C.elevated }}><div style={{ fontWeight: 700, marginBottom: 8 }}>{selectedNode.label}</div><textarea rows={4} placeholder="Notes" style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, padding: 8 }} /></div>}
              {contextTab === "inbox" && IDEAS_INBOX.map((idea) => <div key={idea.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 10, marginBottom: 8 }}><div style={{ fontSize: 12 }}>{idea.text}</div><div style={{ fontSize: 10, color: C.textMuted }}>{idea.from} · {idea.time}</div></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
