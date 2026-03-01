import { readStore, writeStore } from './missionControlStore';

export const START_HERE_STORAGE_KEY = 'clawforge.startHere.state.v1';
const LEGACY_KB_TITLE_MATCHERS = ['Company Knowledge Base', 'Shared Knowledge Base'];
const KB_STABLE_RESOURCE_ID = 'kb-shared';

export function blocksFromMarkdown(markdown = '') {
  const lines = String(markdown || '').split('\n');
  return lines.map((line, idx) => {
    const id = `kbblk-${Date.now()}-${idx}`;
    if (line.startsWith('# ')) return { id, type: 'h1', content: line.slice(2) };
    if (line.startsWith('## ')) return { id, type: 'h2', content: line.slice(3) };
    if (line.startsWith('### ')) return { id, type: 'h3', content: line.slice(4) };
    if (line.startsWith('- ')) return { id, type: 'bullet', content: line.slice(2) };
    if (line.trim() === '---') return { id, type: 'divider', content: '' };
    return { id, type: 'paragraph', content: line };
  });
}

export function markdownFromBlocks(blocks = []) {
  return (blocks || []).map((b) => {
    const content = b?.content || '';
    switch (b?.type) {
      case 'h1': return `# ${content}`;
      case 'h2': return `## ${content}`;
      case 'h3': return `### ${content}`;
      case 'bullet': return `- ${content}`;
      case 'numbered': return `1. ${content}`;
      case 'todo': return `- [${b?.checked ? 'x' : ' '}] ${content}`;
      case 'quote': return `> ${content}`;
      case 'divider': return '---';
      case 'code': return `\`\`\`\n${content}\n\`\`\``;
      default: return content;
    }
  }).join('\n');
}

function readStartHereLocal() {
  try {
    const raw = localStorage.getItem(START_HERE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStartHereKnowledge(knowledgeMarkdown) {
  try {
    const current = readStartHereLocal() || {};
    const next = { ...current, knowledge: knowledgeMarkdown };
    localStorage.setItem(START_HERE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // noop
  }
}

export function getKnowledgeLinkInfo() {
  const store = readStore();
  const pageId = store?.docs?.knowledgeBasePageId || null;
  return { pageId, resourceId: KB_STABLE_RESOURCE_ID };
}

export function ensureKnowledgeMapping(pages = [], fallbackMarkdown = '') {
  const store = readStore();
  const docs = store.docs || {};
  const mappedPageId = docs.knowledgeBasePageId;
  const byMappedId = mappedPageId ? pages.find((p) => p.id === mappedPageId) : null;

  if (byMappedId) {
    return { pages, pageId: byMappedId.id, missingLink: false, created: false };
  }

  const legacyMatch = pages.find((p) =>
    p?.knowledgeResourceId === KB_STABLE_RESOURCE_ID
    || LEGACY_KB_TITLE_MATCHERS.includes((p?.title || '').trim())
  );

  if (legacyMatch) {
    store.docs = { ...docs, knowledgeBasePageId: legacyMatch.id, updatedAt: new Date().toISOString() };
    writeStore(store);
    return { pages, pageId: legacyMatch.id, missingLink: !!mappedPageId && mappedPageId !== legacyMatch.id, created: false };
  }

  const id = `pg-kb-${Date.now()}`;
  const newPage = {
    id,
    title: 'Company Knowledge Base',
    emoji: '🧠',
    cover: null,
    parentId: null,
    createdAt: 'Today',
    updatedAt: 'Just now',
    tags: ['knowledge-base', 'start-here'],
    knowledgeResourceId: KB_STABLE_RESOURCE_ID,
    blocks: blocksFromMarkdown(fallbackMarkdown),
  };

  const nextPages = [...pages, newPage];
  store.docs = { ...docs, knowledgeBasePageId: id, updatedAt: new Date().toISOString() };
  writeStore(store);
  return { pages: nextPages, pageId: id, missingLink: true, created: true };
}

export function upsertKnowledgePageFromStartHere(pages = [], knowledgeMarkdown = '') {
  const ensured = ensureKnowledgeMapping(pages, knowledgeMarkdown);
  const nextPages = ensured.pages.map((p) => {
    if (p.id !== ensured.pageId) return p;
    return {
      ...p,
      title: p.title || 'Company Knowledge Base',
      emoji: p.emoji || '🧠',
      tags: Array.from(new Set([...(p.tags || []), 'knowledge-base', 'start-here'])),
      knowledgeResourceId: KB_STABLE_RESOURCE_ID,
      updatedAt: 'Just now',
      blocks: blocksFromMarkdown(knowledgeMarkdown),
    };
  });
  return { ...ensured, pages: nextPages };
}

export function syncKnowledgeToStoreAndStartHere(pages = [], pageId) {
  const page = (pages || []).find((p) => p.id === pageId);
  if (!page) return null;
  const markdown = markdownFromBlocks(page.blocks || []);
  writeStartHereKnowledge(markdown);
  return markdown;
}
