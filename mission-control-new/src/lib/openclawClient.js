import { createRequestId, readStore, writeStore } from './missionControlStore';

function ok(data, meta = {}) { return { ok: true, data, meta }; }
function err(message, debugCode = 'MC_ERR', retryable = true, nextAction = 'retry', details = {}) {
  return { ok: false, error: { userMessage: message, debugCode, retryable, nextAction, ...details } };
}

const env = (name, fallback = '') => {
  const v = import.meta.env?.[name];
  return v === undefined || v === null || v === '' ? fallback : String(v);
};

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

function sanitizeBase(baseUrl) {
  return String(baseUrl || '').trim().replace(/\/$/, '');
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

const LIVE_ROUTES = {
  'oc.health.get': [
    { method: 'GET', path: '/health' },
    { method: 'GET', path: '/api/health' },
    { method: 'GET', path: '/api/system/health' },
  ],
  'oc.system.degraded.set': [
    { method: 'POST', path: '/api/system/degraded' },
    { method: 'POST', path: '/api/mission-control/system/degraded' },
  ],
  'oc.board.get': [
    // Prefer board list first; tasks route should be used when board_id is explicitly valid.
    { method: 'GET', path: '/api/v1/boards' },
    { method: 'GET', path: '/api/v1/boards/{board_id}/tasks' },
    { method: 'GET', path: '/api/boards' },
    { method: 'GET', path: '/api/mission-control/boards' },
  ],
  'oc.board.replace': [
    { method: 'PUT', path: '/api/boards' },
    { method: 'PUT', path: '/api/mission-control/boards' },
  ],
  'oc.board.view.setFilters': [
    { method: 'POST', path: '/api/boards/filters' },
    { method: 'POST', path: '/api/mission-control/boards/filters' },
  ],
  'oc.board.card.move': [
    { method: 'PATCH', path: '/api/v1/boards/{board_id}/tasks/{task_id}' },
    { method: 'POST', path: '/api/boards/card/move' },
    { method: 'POST', path: '/api/mission-control/boards/card/move' },
  ],
  'oc.board.archive.task': [
    { method: 'DELETE', path: '/api/v1/boards/{board_id}/tasks/{task_id}' },
  ],
  'oc.board.restore.task': [
    { method: 'POST', path: '/api/v1/boards/{board_id}/tasks' },
  ],
  'oc.agentConfig.draft.save': [
    { method: 'PUT', path: '/api/agent-config/draft' },
    { method: 'PUT', path: '/api/mission-control/agent-config/draft' },
  ],
  'oc.agentConfig.test.prompt': [
    { method: 'POST', path: '/api/agent-config/test' },
    { method: 'POST', path: '/api/mission-control/agent-config/test' },
  ],
  'oc.agent.deploy.fromDraft': [
    { method: 'POST', path: '/api/agents/deploy' },
    { method: 'POST', path: '/api/mission-control/agents/deploy' },
  ],
  'oc.settings.tab.set': [
    { method: 'POST', path: '/api/settings/tab' },
    { method: 'POST', path: '/api/mission-control/settings/tab' },
  ],
  'oc.agentFiles.get': [
    { method: 'GET', path: '/api/agent-files' },
    { method: 'GET', path: '/api/mission-control/agent-files' },
  ],
  'oc.agentFiles.replaceAll': [
    { method: 'PUT', path: '/api/agent-files' },
    { method: 'PUT', path: '/api/mission-control/agent-files' },
  ],
  'oc.agentFiles.file.reset': [
    { method: 'POST', path: '/api/agent-files/file/reset' },
    { method: 'POST', path: '/api/mission-control/agent-files/file/reset' },
  ],
  'oc.agentFiles.agent.resetAll': [
    { method: 'POST', path: '/api/agent-files/agent/reset' },
    { method: 'POST', path: '/api/mission-control/agent-files/agent/reset' },
  ],
  'oc.agent.state.set': [
    { method: 'PATCH', path: '/api/v1/agents/{agent_id}' },
  ],
  'oc.agent.message.send': [
    { method: 'POST', path: '/api/v1/agent/boards/{board_id}/agents/{agent_id}/nudge' },
  ],
};

const GENERIC_RUN_ROUTES = [
  { method: 'POST', path: '/api/mission-control/run' },
  { method: 'POST', path: '/api/openclaw/run' },
  { method: 'POST', path: '/api/run' },
  { method: 'POST', path: '/run' },
];

function normalizeLiveResponse(body, fallbackRequestId) {
  const data = body?.data || body?.result || body || {};
  const requestId = body?.requestId || data?.requestId || fallbackRequestId;
  return {
    data: { ...data, requestId },
    requestId,
    debugCode: body?.debugCode || body?.error?.debugCode || null,
  };
}

function setConnectionStatus(connected, requestId = null, details = null) {
  const store = readStore();
  store.ui = store.ui || {};
  store.ui.openclaw = {
    connected: !!connected,
    lastRequestId: requestId || store.ui.openclaw?.lastRequestId || null,
    checkedAt: new Date().toISOString(),
  };
  if (connected) {
    store.ui.lastSuccess = {
      requestId: requestId || null,
      ...(details || {}),
      at: new Date().toISOString(),
    };
  } else {
    store.ui.lastError = {
      ...(store.ui.lastError || {}),
      ...(details || {}),
      requestId: requestId || details?.requestId || store.ui.lastError?.requestId || null,
      at: new Date().toISOString(),
    };
  }
  writeStore(store);
}

function toApiTaskStatus(colId) {
  const map = {
    backlog: 'inbox',
    ready: 'todo',
    progress: 'in_progress',
    review: 'review',
    done: 'done',
  };
  return map[colId] || 'todo';
}

function interpolateRoute(path, payload = {}) {
  const store = readStore();
  const boardId = payload.boardId || payload.board_id || store.boards?.boardId;
  const taskId = payload.cardId || payload.taskId || payload.task_id;
  const agentId = payload.agentId || payload.agent_id;
  return path
    .replace('{board_id}', encodeURIComponent(boardId || ''))
    .replace('{task_id}', encodeURIComponent(taskId || ''))
    .replace('{agent_id}', encodeURIComponent(agentId || ''));
}

function toApiPriority(priority) {
  const map = {
    P0: 'high',
    P1: 'high',
    P2: 'medium',
    P3: 'low',
  };
  return map[priority] || 'medium';
}

function buildLiveBody(op, routePath, payload, requestId) {
  if (routePath.includes('/api/v1/boards/') && routePath.includes('/tasks/') && op === 'oc.board.card.move') {
    return { status: toApiTaskStatus(payload.toColumnId), requestId };
  }
  if (routePath.includes('/api/v1/agents/') && op === 'oc.agent.state.set') {
    return { status: payload.state === 'active' ? 'active' : 'paused', requestId };
  }
  if (routePath.includes('/nudge') && op === 'oc.agent.message.send') {
    return { message: payload.message, requestId };
  }
  if (routePath.includes('/api/v1/boards/') && routePath.endsWith('/tasks') && op === 'oc.board.restore.task') {
    const task = payload.task || {};
    return {
      title: task.title || payload.title || 'Restored task',
      description: task.description || payload.description || '',
      status: toApiTaskStatus(payload.targetColId || payload.toColumnId || task.sourceColId || 'ready'),
      priority: toApiPriority(task.priority || payload.priority),
      requestId,
    };
  }
  return routePath.includes('/run') ? { op, requestId, payload } : { requestId, ...payload };
}

async function tryFetch(baseUrl, route, payload, headers, timeoutMs) {
  const url = `${baseUrl}${route.path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const init = { method: route.method, headers: { ...headers }, signal: controller.signal };
    if (!['GET', 'DELETE'].includes(route.method)) {
      init.body = JSON.stringify(payload);
    }
    const response = await fetch(url, init);
    const text = await response.text();
    let json;
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
    return { response, json, url };
  } finally {
    clearTimeout(timer);
  }
}

async function runLocal(op, payload, requestId) {
  const store = readStore();

  try {
    if (store.auth.mode === 'degraded' && op.includes('.update')) {
      return err('Running in degraded mode. Write operations are temporarily paused.', 'DEGRADED_MODE', true, 'retry', { requestId });
    }

    switch (op) {
      case 'oc.system.degraded.set': {
        store.auth.mode = payload.degraded ? 'degraded' : 'online';
        store.ui.degraded = !!payload.degraded;
        writeStore(store);
        return ok({ requestId, degraded: store.ui.degraded }, { source: 'local' });
      }
      case 'oc.board.get':
        return ok({ requestId, board: store.boards }, { source: 'local' });
      case 'oc.board.replace':
        store.boards = { ...store.boards, ...payload.board };
        writeStore(store);
        return ok({ requestId, board: store.boards }, { source: 'local' });
      case 'oc.board.view.setFilters':
        store.boards.filters = { ...store.boards.filters, ...payload };
        writeStore(store);
        return ok({ requestId, filters: store.boards.filters }, { source: 'local' });
      case 'oc.board.card.move': {
        const { fromColumnId, toColumnId, cardId, toIndex = 0 } = payload;
        const from = [...(store.boards.tasks[fromColumnId] || [])];
        const idx = from.findIndex((t) => t.id === cardId);
        if (idx < 0) return err('Card not found', 'CARD_NOT_FOUND', false, 'refresh', { requestId });
        const [card] = from.splice(idx, 1);
        const to = [...(store.boards.tasks[toColumnId] || [])];
        to.splice(Math.max(0, Math.min(toIndex, to.length)), 0, card);
        store.boards.tasks[fromColumnId] = from;
        store.boards.tasks[toColumnId] = to;
        writeStore(store);
        return ok({ requestId }, { source: 'local' });
      }
      case 'oc.board.archive.get':
        return ok({ requestId, archived: store.boards.archived || [] }, { source: 'local' });
      case 'oc.board.archive.task': {
        const { task, sourceColId } = payload;
        if (!task?.id) return err('Missing task', 'TASK_NOT_FOUND', false, 'refresh', { requestId });
        const archived = Array.isArray(store.boards.archived) ? [...store.boards.archived] : [];
        archived.unshift({
          ...task,
          sourceColId: sourceColId || payload.originalColumnId || 'ready',
          archivedAt: new Date().toISOString(),
        });
        store.boards.archived = archived;
        writeStore(store);
        return ok({ requestId, archived: store.boards.archived }, { source: 'local' });
      }
      case 'oc.board.restore.task': {
        const { taskId } = payload;
        const archived = Array.isArray(store.boards.archived) ? [...store.boards.archived] : [];
        const idx = archived.findIndex((t) => t.id === taskId);
        if (idx < 0) return err('Archived task not found', 'ARCHIVED_TASK_NOT_FOUND', false, 'refresh', { requestId });
        const [task] = archived.splice(idx, 1);
        store.boards.archived = archived;
        const targetCol = payload.targetColId || task.sourceColId || 'ready';
        const cleaned = { ...task };
        delete cleaned.archivedAt;
        delete cleaned.sourceColId;
        const target = [...(store.boards.tasks[targetCol] || [])];
        target.unshift(cleaned);
        store.boards.tasks[targetCol] = target;
        writeStore(store);
        return ok({ requestId, task: cleaned, targetColId: targetCol, archived: store.boards.archived }, { source: 'local' });
      }
      case 'oc.agentArmy.viewMode.set':
        store.agents.viewMode = payload.viewMode;
        writeStore(store);
        return ok({ requestId, viewMode: store.agents.viewMode }, { source: 'local' });
      case 'oc.agent.get': {
        const found = store.agents.roster.find((a) => a.id === payload.agentId);
        if (!found) return err('Agent not found', 'AGENT_NOT_FOUND', false, 'refresh', { requestId });
        return ok({ requestId, agent: found }, { source: 'local' });
      }
      case 'oc.agent.state.set': {
        const { agentId, state } = payload || {};
        if (!agentId) return err('Missing agentId', 'AGENT_ID_REQUIRED', false, 'refresh', { requestId });
        const nextStatus = state === 'active' ? 'online' : 'offline';
        const ix = store.agents.roster.findIndex((a) => a.id === agentId);
        if (ix >= 0) {
          store.agents.roster[ix] = { ...store.agents.roster[ix], status: nextStatus };
        }
        store.agents.statusOverrides = { ...(store.agents.statusOverrides || {}), [agentId]: nextStatus };
        writeStore(store);
        return ok({ requestId, agentId, status: nextStatus, agent: ix >= 0 ? store.agents.roster[ix] : null }, { source: 'local' });
      }
      case 'oc.agent.message.send': {
        const { agentId, message } = payload || {};
        if (!agentId) return err('Missing agentId', 'AGENT_ID_REQUIRED', false, 'refresh', { requestId });
        if (!String(message || '').trim()) return err('Message cannot be empty', 'AGENT_MESSAGE_EMPTY', false, 'retry', { requestId });
        store.agents.lastMessageByAgent = {
          ...(store.agents.lastMessageByAgent || {}),
          [agentId]: {
            message: String(message).trim(),
            sentAt: new Date().toISOString(),
            requestId,
          },
        };
        writeStore(store);
        return ok({ requestId, agentId, message: String(message).trim() }, { source: 'local' });
      }
      case 'oc.agent.delete': {
        const { agentId } = payload || {};
        if (!agentId) return err('Missing agentId', 'AGENT_ID_REQUIRED', false, 'refresh', { requestId });
        const deleted = new Set(store.agents.deletedIds || []);
        deleted.add(agentId);
        store.agents.deletedIds = Array.from(deleted);
        delete store.agents.statusOverrides?.[agentId];
        delete store.agents.lastMessageByAgent?.[agentId];
        store.agents.roster = (store.agents.roster || []).filter((a) => a?.id !== agentId);
        writeStore(store);
        return ok({ requestId, agentId, deletedIds: store.agents.deletedIds }, { source: 'local' });
      }
      case 'oc.agent.configure.open': {
        const { agentId } = payload || {};
        if (!agentId) return err('Missing agentId', 'AGENT_ID_REQUIRED', false, 'refresh', { requestId });
        store.agents.configTargetAgentId = agentId;
        writeStore(store);
        return ok({ requestId, agentId }, { source: 'local' });
      }
      case 'oc.agentFiles.get': {
        return ok({ requestId, drafts: store.agentFiles?.drafts || {} }, { source: 'local' });
      }
      case 'oc.agentFiles.replaceAll': {
        store.agentFiles = {
          drafts: payload.drafts && typeof payload.drafts === 'object' ? payload.drafts : {},
          updatedAt: new Date().toISOString(),
        };
        writeStore(store);
        return ok({ requestId, drafts: store.agentFiles.drafts, updatedAt: store.agentFiles.updatedAt }, { source: 'local' });
      }
      case 'oc.agentFiles.file.reset': {
        const { agentId, fileKey } = payload;
        if (!agentId || !fileKey) return err('Missing agentId or fileKey', 'AGENT_FILES_INVALID', false, 'refresh', { requestId });
        const nextDrafts = { ...(store.agentFiles?.drafts || {}) };
        if (nextDrafts[agentId]) {
          const nextAgent = { ...nextDrafts[agentId] };
          delete nextAgent[fileKey];
          if (Object.keys(nextAgent).length === 0) delete nextDrafts[agentId];
          else nextDrafts[agentId] = nextAgent;
        }
        store.agentFiles = { drafts: nextDrafts, updatedAt: new Date().toISOString() };
        writeStore(store);
        return ok({ requestId, drafts: store.agentFiles.drafts, updatedAt: store.agentFiles.updatedAt }, { source: 'local' });
      }
      case 'oc.agentFiles.agent.resetAll': {
        const { agentId } = payload;
        if (!agentId) return err('Missing agentId', 'AGENT_FILES_INVALID', false, 'refresh', { requestId });
        const nextDrafts = { ...(store.agentFiles?.drafts || {}) };
        delete nextDrafts[agentId];
        store.agentFiles = { drafts: nextDrafts, updatedAt: new Date().toISOString() };
        writeStore(store);
        return ok({ requestId, drafts: store.agentFiles.drafts, updatedAt: store.agentFiles.updatedAt }, { source: 'local' });
      }
      case 'oc.agent.deploy.fromDraft': {
        const draft = store.configurator.drafts[payload.draftId || store.configurator.activeDraftId];
        if (!draft) return err('Draft not found', 'DRAFT_NOT_FOUND', false, 'refresh', { requestId });
        const id = `agent-${Date.now()}`;
        const agent = {
          id,
          name: draft.identity.name || 'New Agent',
          initials: (draft.identity.name || 'NA').split(' ').map((p) => p[0]).slice(0, 2).join(''),
          color: draft.identity.avatarColor || '#3B82F6',
          model: 'Claude',
          status: 'online',
          queue: 0,
          uptime: '100%',
          tasksCompleted: 0,
          costToday: '$0.00',
          permissions: draft.scope || [],
          description: draft.identity.systemPrompt || '',
          children: [],
        };
        store.agents.roster = [agent, ...store.agents.roster];
        writeStore(store);
        return ok({ requestId, agent }, { source: 'local' });
      }
      case 'oc.agentConfig.draft.get': {
        const id = payload.draftId || store.configurator.activeDraftId;
        return ok({ requestId, draft: store.configurator.drafts[id] }, { source: 'local' });
      }
      case 'oc.agentConfig.draft.save': {
        const draft = {
          ...(store.configurator.drafts[payload.draftId || store.configurator.activeDraftId] || {}),
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        const id = draft.id || payload.draftId || store.configurator.activeDraftId;
        draft.id = id;
        store.configurator.drafts[id] = draft;
        store.configurator.activeDraftId = id;
        writeStore(store);
        return ok({ requestId, draft }, { source: 'local' });
      }
      case 'oc.agentConfig.test.prompt':
        return ok({ requestId, output: `Simulated response for: ${payload.prompt || 'test'}`, telemetry: { model: 'Claude Sonnet', cost: '$0.0032' } }, { source: 'local' });
      case 'oc.settings.tab.set':
        store.system.settings.tabKey = payload.tabKey;
        writeStore(store);
        return ok({ requestId, tabKey: payload.tabKey }, { source: 'local' });
      default:
        return err(`Operation ${op} is not implemented in local mode.`, 'LOCAL_OP_UNSUPPORTED', false, 'configure', { requestId });
    }
  } catch (e) {
    return err(e?.message || 'Unexpected error', 'UNEXPECTED', true, 'retry', { requestId });
  }
}

export function createOpenClawClient() {
  const config = {
    liveEnabled: toBool(env('VITE_OPENCLAW_LIVE_ENABLED', 'true'), true),
    baseUrl: sanitizeBase(env('VITE_OPENCLAW_BASE_URL', '')),
    bearerToken: env('VITE_OPENCLAW_BEARER_TOKEN', ''),
    apiKey: env('VITE_OPENCLAW_API_KEY', ''),
    agentToken: env('VITE_OPENCLAW_AGENT_TOKEN', ''),
    authMode: env('VITE_OPENCLAW_AUTH_MODE', 'bearer').toLowerCase(),
    allowLocalFallback: toBool(env('VITE_OPENCLAW_ALLOW_LOCAL_FALLBACK', 'false'), false),
    requestTimeoutMs: Number(env('VITE_OPENCLAW_REQUEST_TIMEOUT_MS', '8000')) || 8000,
  };

  const buildHeaders = () => {
    const headers = { 'content-type': 'application/json' };
    const hasBearer = !!config.bearerToken;
    const hasApiKey = !!config.apiKey;
    const hasAgentToken = !!config.agentToken;

    if ((config.authMode === 'bearer' || config.authMode === 'both') && hasBearer) {
      headers.Authorization = `Bearer ${config.bearerToken}`;
    }
    if ((config.authMode === 'x-api-key' || config.authMode === 'both') && hasApiKey) {
      headers['x-api-key'] = config.apiKey;
    }
    if ((config.authMode === 'x-agent-token' || config.authMode === 'both') && hasAgentToken) {
      headers['X-Agent-Token'] = config.agentToken;
    }
    if (config.authMode === 'auto' || config.authMode === 'fallback') {
      if (hasBearer) headers.Authorization = `Bearer ${config.bearerToken}`;
      if (hasAgentToken) headers['X-Agent-Token'] = config.agentToken;
      if (!hasBearer && !hasAgentToken && hasApiKey) headers['x-api-key'] = config.apiKey;
    }
    return headers;
  };

  const runLive = async (op, payload, requestId) => {
    if (!config.liveEnabled || !config.baseUrl) {
      return err('OpenClaw live API is not configured.', 'OPENCLAW_LIVE_DISABLED', false, 'configure', { requestId });
    }

    const headers = buildHeaders();
    const hasAuthHeader = !!(headers.Authorization || headers['X-Agent-Token'] || headers['x-api-key']);
    const routes = [...(LIVE_ROUTES[op] || []), ...GENERIC_RUN_ROUTES];
    let lastFailure = null;

    for (const route of routes) {
      try {
        const resolvedPath = interpolateRoute(route.path, payload);
        const resolvedRoute = { ...route, path: resolvedPath };
        const body = buildLiveBody(op, resolvedPath, payload, requestId);
        const { response, json, url } = await tryFetch(config.baseUrl, resolvedRoute, body, headers, config.requestTimeoutMs);
        const normalized = normalizeLiveResponse(json, requestId);

        if (response.ok) {
          setConnectionStatus(true, normalized.requestId || requestId, {
            endpoint: `${route.method} ${resolvedPath}`,
            status: response.status,
          });
          return ok(normalized.data, {
            source: 'live',
            requestId: normalized.requestId || requestId,
            endpoint: `${route.method} ${resolvedPath}`,
          });
        }

        lastFailure = {
          status: response.status,
          debugCode: normalized.debugCode || `HTTP_${response.status}`,
          endpoint: `${route.method} ${resolvedPath}`,
          url,
        };

        if (![404].includes(response.status)) {
          break;
        }
      } catch (e) {
        lastFailure = {
          status: 0,
          debugCode: e?.name === 'AbortError' ? 'NETWORK_TIMEOUT' : 'NETWORK_ERROR',
          endpoint: `${route.method} ${route.path}`,
          detail: e?.message || 'Network error',
        };
        break;
      }
    }

    const failureStatus = lastFailure?.status;
    const failureCode = lastFailure?.debugCode || 'OPENCLAW_LIVE_ERROR';
    const authHint = `Set VITE_OPENCLAW_AUTH_MODE and one of VITE_OPENCLAW_BEARER_TOKEN / VITE_OPENCLAW_AGENT_TOKEN / VITE_OPENCLAW_API_KEY in .env, then restart Mission Control.`;
    const userMessage = !hasAuthHeader
      ? `OpenClaw credentials are missing. ${authHint}`
      : (failureStatus === 401 || failureStatus === 403)
        ? `OpenClaw rejected credentials (${failureStatus}). ${authHint}`
        : 'OpenClaw API request failed.';

    setConnectionStatus(false, requestId, lastFailure || null);
    return err(
      userMessage,
      failureCode,
      true,
      config.allowLocalFallback ? 'fallback' : 'retry',
      {
        requestId,
        status: failureStatus,
        endpoint: lastFailure?.endpoint,
        authMode: config.authMode,
      },
    );
  };

  const run = async (op, payload = {}) => {
    const requestId = payload.requestId || createRequestId(op.replace(/\./g, '-'));
    const { allowLocalFallback: allowLocalFallbackOverride, ...payloadBody } = payload || {};
    const allowLocalFallback = typeof allowLocalFallbackOverride === 'boolean'
      ? allowLocalFallbackOverride
      : config.allowLocalFallback;

    if (op === 'oc.health.get') {
      const health = await runLive(op, payloadBody, requestId);
      if (health.ok) return health;
      if (allowLocalFallback) {
        return ok({ requestId, connected: false, mode: 'fallback-local' }, { source: 'local-fallback' });
      }
      return health;
    }

    const liveFirstOps = new Set([
      'oc.system.degraded.set',
      'oc.board.get',
      'oc.board.card.move',
      'oc.board.archive.task',
      'oc.board.restore.task',
      'oc.agent.state.set',
      'oc.agent.message.send',
      'oc.agentConfig.draft.save',
      'oc.agentConfig.test.prompt',
      'oc.agent.deploy.fromDraft',
      'oc.settings.tab.set',
      'oc.agentFiles.get',
      'oc.agentFiles.replaceAll',
      'oc.agentFiles.file.reset',
      'oc.agentFiles.agent.resetAll',
    ]);

    if (liveFirstOps.has(op)) {
      const liveResp = await runLive(op, payloadBody, requestId);
      if (liveResp.ok) {
        if (op === 'oc.agent.deploy.fromDraft' && liveResp.data?.agent?.id) {
          const store = readStore();
          const existing = Array.isArray(store.agents?.roster) ? store.agents.roster : [];
          if (!existing.some((a) => a.id === liveResp.data.agent.id)) {
            store.agents = { ...(store.agents || {}), roster: [liveResp.data.agent, ...existing] };
            writeStore(store);
          }
        }
        return liveResp;
      }
      if (!allowLocalFallback) return liveResp;
      const localResp = await runLocal(op, payloadBody, requestId);
      if (localResp.ok) {
        return {
          ...localResp,
          meta: {
            ...(localResp.meta || {}),
            source: 'local-fallback',
            fallbackReason: liveResp.error?.debugCode,
            requestId,
          },
        };
      }
      return liveResp;
    }

    return runLocal(op, payloadBody, requestId);
  };

  const checkHealth = async () => {
    const result = await run('oc.health.get', {});
    return {
      connected: !!result.ok,
      requestId: result.ok ? result.data?.requestId : result.error?.requestId || null,
      debugCode: result.ok ? null : result.error?.debugCode || null,
      error: result.ok ? null : result.error,
    };
  };

  const getConnectionState = () => {
    const store = readStore();
    return store.ui?.openclaw || { connected: false, lastRequestId: null, checkedAt: null };
  };

  return {
    run,
    checkHealth,
    getConnectionState,
    config: {
      ...config,
      hasBearerToken: !!config.bearerToken,
      hasApiKey: !!config.apiKey,
      hasAgentToken: !!config.agentToken,
      bearerToken: undefined,
      apiKey: undefined,
      agentToken: undefined,
    },
  };
}
