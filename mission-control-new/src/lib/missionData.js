import { readStore, writeStore } from './missionControlStore';

const KEY = 'mission-control-kanban-v1';
const RUN_HISTORY_KEY = 'mission-control-run-history-v1';
const RUN_HISTORY_LIMIT = 200;

export const DEFAULT_TASKS = {
  backlog: [], ready: [], progress: [], review: [], done: [],
};

const statusFromTask = (task, colId) => {
  if (task?.blocked) return 'blocked';
  if (task?.approval) return 'approval';
  if (colId === 'progress') return 'running';
  if (colId === 'done') return 'success';
  if (colId === 'review') return 'review';
  return 'queued';
};

const timeStamp = () => {
  const d = new Date();
  return {
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    createdAt: d.toISOString(),
  };
};

const taskAgentLabel = (task) => `Agent ${Number.isFinite(task?.agent) ? task.agent + 1 : 'Unknown'}`;

function mapByTaskId(tasks) {
  const map = new Map();
  Object.entries(tasks || {}).forEach(([colId, list]) => {
    (list || []).forEach((task) => map.set(task.id, { task, colId }));
  });
  return map;
}

function buildRunDelta(previousTasks, nextTasks, source = 'board') {
  const prevMap = mapByTaskId(previousTasks || {});
  const nextMap = mapByTaskId(nextTasks || {});
  const entries = [];

  for (const [taskId, current] of nextMap.entries()) {
    const prev = prevMap.get(taskId);
    const prevStatus = prev ? statusFromTask(prev.task, prev.colId) : null;
    const nextStatus = statusFromTask(current.task, current.colId);

    if (!prev) {
      const { time, createdAt } = timeStamp();
      entries.push({
        id: `run-${Date.now()}-${taskId}-new`,
        time,
        createdAt,
        source,
        agent: taskAgentLabel(current.task),
        action: `Created task: ${current.task.title}`,
        taskId: current.task.id,
        taskTitle: current.task.title,
        status: 'Queued',
        cost: '$0.00',
      });
      continue;
    }

    if (prevStatus !== nextStatus || prev.colId !== current.colId) {
      const { time, createdAt } = timeStamp();
      const actionByStatus = {
        running: `Started OpenClaw run: ${current.task.title}`,
        approval: `Awaiting approval: ${current.task.title}`,
        blocked: `Execution blocked: ${current.task.title}`,
        success: `Completed run: ${current.task.title}`,
        review: `Moved to review: ${current.task.title}`,
        queued: `Queued run: ${current.task.title}`,
      };
      const statusLabel = {
        running: 'Running',
        approval: 'Approval',
        blocked: 'Blocked',
        success: 'Success',
        review: 'Review',
        queued: 'Queued',
      };

      entries.push({
        id: `run-${Date.now()}-${taskId}-${nextStatus}`,
        time,
        createdAt,
        source,
        agent: taskAgentLabel(current.task),
        action: actionByStatus[nextStatus] || `Updated task: ${current.task.title}`,
        taskId: current.task.id,
        taskTitle: current.task.title,
        status: statusLabel[nextStatus] || 'Queued',
        cost: '$0.00',
      });
    }
  }

  return entries;
}

export function readKanbanTasks(fallback = DEFAULT_TASKS) {
  try {
    const store = readStore();
    const storeTasks = store?.boards?.tasks;
    if (storeTasks && typeof storeTasks === 'object' && Object.keys(storeTasks).length) {
      return storeTasks;
    }

    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      store.boards = { ...(store.boards || {}), tasks: parsed };
      writeStore(store);
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function readRunHistory(fallback = []) {
  try {
    const raw = localStorage.getItem(RUN_HISTORY_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeRunHistory(runs) {
  try {
    localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify((runs || []).slice(0, RUN_HISTORY_LIMIT)));
    window.dispatchEvent(new CustomEvent('mission-run-history-updated'));
  } catch {
    // noop
  }
}

export function appendRunHistory(entries) {
  const list = Array.isArray(entries) ? entries : [entries];
  if (!list.length) return;
  const current = readRunHistory([]);
  writeRunHistory([...list, ...current]);
}

export function writeKanbanTasks(tasks, options = {}) {
  try {
    const previous = readKanbanTasks(DEFAULT_TASKS);

    const store = readStore();
    store.boards = { ...(store.boards || {}), tasks: tasks || DEFAULT_TASKS };
    writeStore(store);

    // keep legacy key in sync for older pages/scripts
    localStorage.setItem(KEY, JSON.stringify(tasks));

    if (!options.skipRunSync) {
      const runDelta = buildRunDelta(previous, tasks, options.source || 'board');
      if (runDelta.length) appendRunHistory(runDelta);
    }

    window.dispatchEvent(new CustomEvent('mission-data-updated'));
  } catch {
    // noop
  }
}

export function flattenTasks(tasks) {
  return Object.entries(tasks || {}).flatMap(([colId, list]) => (list || []).map((t) => ({ ...t, colId })));
}

export function getApprovalsAndBlockers(tasks) {
  const all = flattenTasks(tasks);
  return {
    approvals: all.filter((t) => t.approval),
    blockers: all.filter((t) => !!t.blocked),
    all,
  };
}

export { KEY as MISSION_KANBAN_STORAGE_KEY, RUN_HISTORY_KEY as MISSION_RUN_HISTORY_STORAGE_KEY };