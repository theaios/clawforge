const STORE_KEY = 'mc-openclaw-store-v1';

export function createRequestId(prefix = 'req') {
  const rnd = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${Date.now()}-${rnd}`;
}

export const defaultStore = {
  auth: {
    workspaceId: 'clawforge-main',
    token: 'local-dev-token',
    mode: 'online',
  },
  boards: {
    boardId: 'product-launch',
    columns: [
      { id: 'backlog', name: 'Backlog', wip: null, accent: '#5C6370', collapsed: false },
      { id: 'ready', name: 'Ready', wip: 4, accent: '#3B82F6', collapsed: false },
      { id: 'progress', name: 'In Progress', wip: 5, accent: '#8B5CF6', collapsed: false },
      { id: 'review', name: 'Review', wip: 3, accent: '#F59E0B', collapsed: false },
      { id: 'done', name: 'Done', wip: null, accent: '#22C55E', collapsed: false },
    ],
    tasks: {},
    archived: [],
    filters: { search: '', priority: 'all', agent: 'all' },
  },
  agents: {
    viewMode: 'grid',
    roster: [],
    deletedIds: [],
    statusOverrides: {},
    configTargetAgentId: null,
    lastMessageByAgent: {},
  },
  agentFiles: {
    drafts: {},
    updatedAt: null,
  },
  configurator: {
    activeDraftId: 'draft-default',
    drafts: {
      'draft-default': {
        id: 'draft-default',
        stepIndex: 0,
        identity: {
          name: 'Partnership Scout',
          roleTitle: 'Partnerships & Affiliate Manager',
          reportsTo: 'Sales CEO',
          avatarColor: '#06B6D4',
          systemPrompt: 'You are the Partnership Scout for ClawForge.',
        },
        scope: [],
        tools: ['gmail', 'hubspot', 'calendar', 'gdocs', 'slack'],
        modelRouting: [],
        guardrails: {},
        limits: {
          maxDailySpend: 25,
          maxTokens: 8192,
          maxApiCallsPerHour: 500,
          maxConcurrentTasks: 3,
          approvalThreshold: 50,
          sessionTimeout: 30,
        },
        updatedAt: new Date().toISOString(),
      },
    },
  },
  system: {
    security: { incidentActive: false },
    integrations: { category: 'All', records: [] },
    costs: { mode: 'daily', monthlyBudget: 30, alertThresholdPct: 80, hardLimitEnabled: false },
    settings: { tabKey: 'profile' },
  },
  ui: {
    degraded: false,
    lastError: null,
    lastSuccess: null,
    openclaw: {
      connected: false,
      lastRequestId: null,
      checkedAt: null,
    },
  },
};

export function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(defaultStore);
    return { ...structuredClone(defaultStore), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultStore);
  }
}

export function writeStore(nextStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(nextStore));
  window.dispatchEvent(new CustomEvent('mc-store-updated'));
}

export { STORE_KEY };
