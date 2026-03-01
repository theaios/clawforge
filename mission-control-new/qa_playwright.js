import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8088';
const outDir = process.env.OUT_DIR || 'qa_artifacts';
const exe = process.env.CHROME_BIN || '/usr/bin/google-chrome-stable';

fs.mkdirSync(outDir, { recursive: true });

function slug(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
}

async function snap(page, name){
  const fp = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  return fp;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: exe,
    headless: true,
    args: ['--no-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleEvents = [];
  page.on('console', (msg) => {
    const type = msg.type();
    if (['error', 'warning'].includes(type)) {
      consoleEvents.push({ type, text: msg.text() });
    }
  });
  page.on('pageerror', (err) => consoleEvents.push({ type: 'pageerror', text: String(err) }));

  const results = [];

  async function clickNav(label){
    await page.click(`header a:has-text("${label}")`);
    await page.waitForTimeout(150);
  }

  // Load app
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('header');
  results.push({ step: 'load', screenshot: await snap(page, '00-load') });

  // Global smoke: click each route
  for (const label of ['Kanban', 'Agent Army', 'Skills']) {
    await clickNav(label);
    results.push({ step: `nav-${label}`, screenshot: await snap(page, `01-nav-${slug(label)}`) });
  }

  // Kanban CRUD + drag
  await clickNav('Kanban');
  // Create
  await page.fill('input[placeholder="Title"]', 'QA: new task');
  await page.fill('textarea[placeholder="Description"]', 'Created by automated QA script');
  await page.selectOption('select >> nth=0', { value: 'backlog' });
  await page.selectOption('select >> nth=1', { value: 'P0' });
  await page.click('button:has-text("Create Task")');
  await page.waitForTimeout(150);
  results.push({ step: 'kanban-created', screenshot: await snap(page, '10-kanban-created') });

  // Edit first matching card
  const card = page.locator('article', { hasText: 'QA: new task' }).first();
  await card.locator('button:has-text("Edit")').click();
  await page.fill('input[placeholder="Title"]', 'QA: edited task');
  await page.click('button:has-text("Save Task")');
  await page.waitForTimeout(150);
  results.push({ step: 'kanban-edited', screenshot: await snap(page, '11-kanban-edited') });

  // Drag to Done (HTML5 drag/drop can be flaky; use mouse)
  const source = page.locator('article', { hasText: 'QA: edited task' }).first();
  const doneCol = page.locator('div', { hasText: 'Done' }).first();
  const sbb = await source.boundingBox();
  const dbb = await doneCol.boundingBox();
  if (sbb && dbb) {
    await page.mouse.move(sbb.x + 10, sbb.y + 10);
    await page.mouse.down();
    await page.mouse.move(dbb.x + 50, dbb.y + 80);
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
  results.push({ step: 'kanban-drag-attempt', screenshot: await snap(page, '12-kanban-drag-attempt') });

  // Delete
  const card2 = page.locator('article', { hasText: 'QA: edited task' }).first();
  await card2.locator('button:has-text("Delete")').click();
  await page.waitForTimeout(150);
  results.push({ step: 'kanban-deleted', screenshot: await snap(page, '13-kanban-deleted') });

  // Agent Army CRUD
  await clickNav('Agent Army');
  await page.fill('input[placeholder="Name"]', 'QA Agent');
  await page.fill('input[placeholder="Role (Marketing, Ops...)"]', 'QA');
  await page.fill('input[placeholder="Skills comma-separated"]', 'Testing, Playwright');
  await page.fill('input[type="number"]', '1');
  await page.selectOption('select', { value: 'online' });
  await page.click('button:has-text("Add Agent")');
  await page.waitForTimeout(150);
  results.push({ step: 'agent-created', screenshot: await snap(page, '20-agent-created') });

  // Edit QA Agent to reduce capacity 0
  const agentCard = page.locator('article', { hasText: 'QA Agent' }).first();
  await agentCard.locator('button:has-text("Edit")').click();
  await page.fill('input[type="number"]', '0');
  await page.click('button:has-text("Save Agent")');
  await page.waitForTimeout(150);
  results.push({ step: 'agent-edited', screenshot: await snap(page, '21-agent-edited') });

  // Delete
  const agentCard2 = page.locator('article', { hasText: 'QA Agent' }).first();
  await agentCard2.locator('button:has-text("Delete")').click();
  await page.waitForTimeout(150);
  results.push({ step: 'agent-deleted', screenshot: await snap(page, '22-agent-deleted') });

  // Skills page renders
  await clickNav('Skills');
  results.push({ step: 'skills', screenshot: await snap(page, '30-skills') });

  // Reload persistence check: should keep default agents/tasks count stable and not crash
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('header');
  results.push({ step: 'reload', screenshot: await snap(page, '40-reload') });

  await browser.close();

  const report = { baseURL, outDir, results, consoleEvents };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

  if (consoleEvents.length) {
    console.error('Console issues detected:', consoleEvents);
    process.exitCode = 2;
  }
})();
