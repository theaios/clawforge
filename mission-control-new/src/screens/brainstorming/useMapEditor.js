import { useEffect, useMemo, useRef, useState } from "react";
import { collectSubtreeIds, deepClone, newBranchNode, newIdeaNode, newRootNode, nodeBranchRoot } from "./mapModel";

const BRANCH_COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#14B8A6", "#F97316", "#EF4444", "#0EA5E9", "#EAB308"];
const MAP_STORAGE_KEY = "cf-brainstorming-map-v2";
const HISTORY_LIMIT = 100;

function safeLoadMap(initialMap) {
  if (typeof window === "undefined") return deepClone(initialMap);
  const raw = window.localStorage.getItem(MAP_STORAGE_KEY);
  if (!raw) return deepClone(initialMap);

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return deepClone(initialMap);
    if (!parsed.nodesById || typeof parsed.nodesById !== "object") return deepClone(initialMap);
    if (!parsed.rootOrder || !Array.isArray(parsed.rootOrder) || !parsed.rootOrder.length) return deepClone(initialMap);
    return parsed;
  } catch {
    return deepClone(initialMap);
  }
}

export function useMapEditor(initialMap) {
  const [map, setMap] = useState(() => safeLoadMap(initialMap));
  const [selectedIds, setSelectedIds] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [changeVersion, setChangeVersion] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const mapRef = useRef(map);
  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(map));
      setLastSavedAt(Date.now());
    } catch {
      // Ignore quota/storage errors; editor remains usable in-memory.
    }
  }, [map, changeVersion]);

  const selectedPrimaryId = selectedIds[0] || null;

  const commit = (producer) => {
    setMap((prev) => {
      const draft = deepClone(prev);
      producer(draft);
      setUndoStack((s) => [...s.slice(-(HISTORY_LIMIT - 1)), prev]);
      setRedoStack([]);
      return draft;
    });
    setChangeVersion((v) => v + 1);
  };

  const undo = () => {
    setUndoStack((stack) => {
      if (!stack.length) return stack;
      const previous = stack[stack.length - 1];
      setRedoStack((r) => [...r, mapRef.current]);
      setMap(previous);
      setChangeVersion((v) => v + 1);
      return stack.slice(0, -1);
    });
  };

  const redo = () => {
    setRedoStack((stack) => {
      if (!stack.length) return stack;
      const next = stack[stack.length - 1];
      setUndoStack((u) => [...u.slice(-(HISTORY_LIMIT - 1)), mapRef.current]);
      setMap(next);
      setChangeVersion((v) => v + 1);
      return stack.slice(0, -1);
    });
  };

  const selectNode = (id, additive = false) => {
    if (!id) return;
    setSelectedIds((prev) => {
      if (!additive) return [id];
      return prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
    });
  };

  const addChild = (sourceId) => {
    const src = map.nodesById[sourceId];
    if (!src) return;
    commit((draft) => {
      if (src.type === "root") {
        const newId = `branch-n${draft.nextId++}`;
        const color = BRANCH_COLORS[draft.nextId % BRANCH_COLORS.length];
        draft.nodesById[newId] = newBranchNode(newId, sourceId, color, "New branch");
        draft.nodesById[sourceId].childrenIds = [...(draft.nodesById[sourceId].childrenIds || []), newId];
        draft.branchOrder = [...(draft.branchOrder || []), newId];
        setSelectedIds([newId]);
        return;
      }

      const parentId = sourceId;
      const branchRoot = nodeBranchRoot(draft, parentId);
      const newId = `node-n${draft.nextId++}`;
      draft.nodesById[newId] = newIdeaNode(newId, parentId, branchRoot?.id || src.branchId || "branch-product");
      draft.nodesById[parentId].childrenIds = [...(draft.nodesById[parentId].childrenIds || []), newId];
      setSelectedIds([newId]);
    });
  };

  const addSibling = (sourceId) => {
    const src = map.nodesById[sourceId];
    if (!src || !src.parentId) return;

    commit((draft) => {
      const parent = draft.nodesById[src.parentId];
      if (!parent) return;

      const list = [...(parent.childrenIds || [])];
      const idx = Math.max(0, list.indexOf(sourceId));

      if (src.type === "branch") {
        const newId = `branch-n${draft.nextId++}`;
        const color = BRANCH_COLORS[draft.nextId % BRANCH_COLORS.length];
        draft.nodesById[newId] = newBranchNode(newId, src.parentId, color, "New branch");
        draft.branchOrder = [...(draft.branchOrder || []), newId];
        list.splice(idx + 1, 0, newId);
        parent.childrenIds = list;
        setSelectedIds([newId]);
        return;
      }

      const newId = `node-n${draft.nextId++}`;
      const branchRoot = nodeBranchRoot(draft, sourceId);
      draft.nodesById[newId] = newIdeaNode(newId, src.parentId, branchRoot?.id || src.branchId || "branch-product");
      list.splice(idx + 1, 0, newId);
      parent.childrenIds = list;
      setSelectedIds([newId]);
    });
  };

  const toggleAutoAlign = (id) => {
    commit((draft) => {
      const node = draft.nodesById[id];
      if (!node) return;
      node.autoAlign = !node.autoAlign;
      if (node.autoAlign) node.manualPosition = null;
    });
  };

  const setManualPosition = (id, x, y) => {
    commit((draft) => {
      const node = draft.nodesById[id];
      if (!node) return;
      node.autoAlign = false;
      node.detached = true;
      node.manualPosition = { x, y };
    });
  };

  const setManualPositionsBatch = (entries) => {
    if (!entries || !entries.length) return;
    commit((draft) => {
      entries.forEach(({ id, x, y }) => {
        const node = draft.nodesById[id];
        if (!node) return;
        node.autoAlign = false;
        node.detached = true;
        node.manualPosition = { x, y };
      });
    });
  };

  const setLayoutMode = (scopeId, mode) => {
    commit((draft) => {
      const scope = draft.nodesById[scopeId] || draft.nodesById.root;
      const apply = (id) => {
        const n = draft.nodesById[id];
        if (!n) return;
        n.layoutMode = mode;
        (n.childrenIds || []).forEach(apply);
      };
      if (scope.type === "root") {
        (scope.childrenIds || []).forEach((branchId) => apply(branchId));
      } else {
        apply(scope.id);
      }
    });
  };

  const copySubtree = (id) => {
    const rootId = id || selectedPrimaryId;
    if (!rootId) return;
    const ids = collectSubtreeIds(map, rootId);
    const payload = ids.reduce((acc, nodeId) => {
      acc[nodeId] = deepClone(map.nodesById[nodeId]);
      return acc;
    }, {});
    setClipboard({ rootId, payload });
  };

  const pasteSubtree = (targetId) => {
    if (!clipboard) return;
    const toId = targetId || selectedPrimaryId;
    if (!toId) return;

    commit((draft) => {
      const idMap = {};
      Object.keys(clipboard.payload).forEach((oldId) => {
        idMap[oldId] = `node-n${draft.nextId++}`;
      });

      Object.entries(clipboard.payload).forEach(([oldId, node]) => {
        const copy = deepClone(node);
        copy.id = idMap[oldId];
        copy.parentId = oldId === clipboard.rootId ? toId : idMap[node.parentId];
        copy.childrenIds = (node.childrenIds || []).map((cid) => idMap[cid]);
        copy.label = `${copy.label} (copy)`;
        draft.nodesById[copy.id] = copy;
      });

      draft.nodesById[toId].childrenIds = [...(draft.nodesById[toId].childrenIds || []), idMap[clipboard.rootId]];
      setSelectedIds([idMap[clipboard.rootId]]);
    });
  };

  const addRootTopic = () => {
    commit((draft) => {
      const rootCount = (draft.rootOrder || ["root"]).length;
      const newId = `root-n${draft.nextId++}`;
      const fallbackX = (rootCount % 2 === 0 ? 1 : -1) * (420 + Math.floor(rootCount / 2) * 260);
      const fallbackY = rootCount % 2 === 0 ? -70 : 120;
      draft.nodesById[newId] = newRootNode(newId, `New topic ${rootCount + 1}`, "Ideas", "🧠", { x: fallbackX, y: fallbackY });
      draft.rootOrder = [...(draft.rootOrder || ["root"]), newId];
      setSelectedIds([newId]);
    });
  };

  const deleteNode = (nodeId) => {
    const targetId = nodeId || selectedPrimaryId;
    if (!targetId || !map.nodesById[targetId]) return;

    commit((draft) => {
      const target = draft.nodesById[targetId];
      if (!target) return;

      if (target.type === "root" && (draft.rootOrder || []).length <= 1) return;

      const removeIds = collectSubtreeIds(draft, targetId);
      const removeSet = new Set(removeIds);

      if (target.parentId && draft.nodesById[target.parentId]) {
        draft.nodesById[target.parentId].childrenIds = (draft.nodesById[target.parentId].childrenIds || []).filter((id) => id !== targetId);
      }

      draft.branchOrder = (draft.branchOrder || []).filter((id) => !removeSet.has(id));
      draft.rootOrder = (draft.rootOrder || ["root"]).filter((id) => !removeSet.has(id));

      removeIds.forEach((id) => {
        delete draft.nodesById[id];
      });

      setSelectedIds((prev) => prev.filter((id) => !removeSet.has(id)));
    });
  };

  const selectedNode = useMemo(() => map.nodesById[selectedPrimaryId] || null, [map, selectedPrimaryId]);

  return {
    map,
    selectedNode,
    selectedIds,
    clipboard,
    undoStack,
    redoStack,
    changeVersion,
    lastSavedAt,
    selectNode,
    addChild,
    addSibling,
    addRootTopic,
    deleteNode,
    toggleAutoAlign,
    setManualPosition,
    setManualPositionsBatch,
    setLayoutMode,
    copySubtree,
    pasteSubtree,
    undo,
    redo,
  };
}
