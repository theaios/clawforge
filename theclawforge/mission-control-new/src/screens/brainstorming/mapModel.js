export const VIEW_STATE_KEY = "cf-brainstorming-view";
export const CUSTOM_THEME_SLOT_KEY = "cf-brainstorming-custom-theme-slot-1";

const BRANCH_SEEDS = [
  {
    id: "product", label: "Product & Platform", icon: "🛠", x: -320, y: -200,
    nodes: [
      { id: "p1", label: "Multi-tenant dashboard", tag: "Feature", status: "active", votes: 5 },
      { id: "p2", label: "Agent marketplace", tag: "Future", status: "idea", votes: 8 },
      { id: "p3", label: "Mobile companion app", tag: "Future", status: "idea", votes: 3 },
      { id: "p4", label: "White-label for agencies", tag: "Revenue", status: "exploring", votes: 12 },
      { id: "p5", label: "One-click WordPress plugin", tag: "Integration", status: "idea", votes: 6 },
    ],
  },
  {
    id: "marketing", label: "Marketing & Growth", icon: "📣", x: 280, y: -200,
    nodes: [
      { id: "m1", label: '"Build in public" Twitter series', tag: "Content", status: "active", votes: 7 },
      { id: "m2", label: "YouTube agent demo videos", tag: "Content", status: "exploring", votes: 9 },
      { id: "m3", label: "Local business Meetup talks", tag: "Community", status: "idea", votes: 4 },
      { id: "m4", label: "AI newsletter sponsorships", tag: "Paid", status: "exploring", votes: 6 },
      { id: "m5", label: "Case study: first 10 clients", tag: "Social Proof", status: "idea", votes: 11 },
    ],
  },
  {
    id: "sales", label: "Sales & Revenue", icon: "💰", x: 340, y: 140,
    nodes: [
      { id: "s1", label: "Tiered membership pricing", tag: "Pricing", status: "active", votes: 8 },
      { id: "s2", label: "Annual plan discount (20%)", tag: "Pricing", status: "exploring", votes: 5 },
      { id: "s3", label: "Reseller/agency partner program", tag: "Channel", status: "exploring", votes: 10 },
      { id: "s4", label: "Done-for-you premium tier", tag: "Service", status: "idea", votes: 14 },
    ],
  },
  {
    id: "community", label: "Community & Support", icon: "🤝", x: -340, y: 140,
    nodes: [
      { id: "c1", label: "Weekly Zoom office hours", tag: "Engagement", status: "active", votes: 6 },
      { id: "c2", label: "Discord templates gallery", tag: "Resource", status: "idea", votes: 7 },
      { id: "c3", label: "Customer success playbook", tag: "Docs", status: "exploring", votes: 4 },
      { id: "c4", label: "Agent config sharing hub", tag: "Community", status: "idea", votes: 9 },
    ],
  },
  {
    id: "tech", label: "Technical & Security", icon: "🔒", x: 0, y: 280,
    nodes: [
      { id: "t1", label: "SOC 2 compliance roadmap", tag: "Security", status: "exploring", votes: 3 },
      { id: "t2", label: "Multi-region deployment", tag: "Infra", status: "idea", votes: 5 },
      { id: "t3", label: "Real-time agent monitoring", tag: "Feature", status: "active", votes: 7 },
      { id: "t4", label: "Automatic scaling per client", tag: "Infra", status: "idea", votes: 8 },
    ],
  },
];

export const IDEAS_INBOX = [
  { id: "i1", text: "Integrate with Zapier for non-dev users", from: "Sales CEO", time: "10m ago" },
  { id: "i2", text: "AI-generated weekly client reports", from: "CX CEO", time: "25m ago" },
  { id: "i3", text: "Prompt template marketplace", from: "Marketing CEO", time: "1h ago" },
  { id: "i4", text: "Competitor comparison landing page", from: "Content Writer", time: "2h ago" },
];

export function createInitialMap(colors) {
  const map = {
    nodesById: {
      root: {
        id: "root",
        type: "root",
        label: "ClawForge",
        subtitle: "Ideas",
        icon: "⚡",
        childrenIds: BRANCH_SEEDS.map((b) => `branch-${b.id}`),
        manualPosition: { x: 0, y: 0 },
        autoAlign: false,
      },
    },
    rootOrder: ["root"],
    branchOrder: BRANCH_SEEDS.map((b) => `branch-${b.id}`),
    nextId: 100,
  };

  BRANCH_SEEDS.forEach((branch) => {
    const branchId = `branch-${branch.id}`;
    const childIds = branch.nodes.map((n) => `node-${n.id}`);
    map.nodesById[branchId] = {
      id: branchId,
      type: "branch",
      branchId,
      label: branch.label,
      icon: branch.icon,
      color: colors[branch.id],
      parentId: "root",
      childrenIds: childIds,
      layoutMode: "mind",
      autoAlign: true,
      detached: false,
      collapsed: false,
      manualPosition: { x: branch.x, y: branch.y },
    };

    branch.nodes.forEach((node) => {
      map.nodesById[`node-${node.id}`] = {
        id: `node-${node.id}`,
        type: "idea",
        parentId: branchId,
        branchId,
        childrenIds: [],
        label: node.label,
        tag: node.tag,
        status: node.status,
        votes: node.votes,
        detached: false,
        collapsed: false,
        autoAlign: true,
        manualPosition: null,
      };
    });
  });

  return map;
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function newIdeaNode(id, parentId, branchId, label = "New idea") {
  return {
    id,
    type: "idea",
    parentId,
    branchId,
    childrenIds: [],
    label,
    tag: "Idea",
    status: "idea",
    votes: 0,
    detached: false,
    collapsed: false,
    autoAlign: true,
    manualPosition: null,
  };
}

export function newBranchNode(id, parentId, color, label = "New branch", icon = "🌱") {
  return {
    id,
    type: "branch",
    branchId: id,
    label,
    icon,
    color,
    parentId,
    childrenIds: [],
    layoutMode: "mind",
    autoAlign: true,
    detached: false,
    collapsed: false,
    manualPosition: null,
  };
}

export function newRootNode(id, label = "New topic", subtitle = "Ideas", icon = "🧠", manualPosition = { x: 0, y: 0 }) {
  return {
    id,
    type: "root",
    label,
    subtitle,
    icon,
    childrenIds: [],
    manualPosition,
    autoAlign: false,
  };
}

export function nodeBranchRoot(map, nodeId) {
  let cursor = map.nodesById[nodeId];
  while (cursor && cursor.parentId) {
    if (cursor.type === "branch") return cursor;
    cursor = map.nodesById[cursor.parentId];
  }
  return null;
}

export function collectSubtreeIds(map, rootId) {
  const out = [];
  const walk = (id) => {
    out.push(id);
    (map.nodesById[id]?.childrenIds || []).forEach(walk);
  };
  walk(rootId);
  return out;
}
