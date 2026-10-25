import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
const home = process.env.WORK_HOME || base;
const output = process.env.CAPTURE_DIR || 'screenshots/playground-refinement';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, captures: [], layouts: [], accessibility: [], interactions: [], errors: [] };
const projects = ['quickshow', 'telecom-assistant', 'time-capsule-api', 'file-manager'];
const names = ['QuickShow', 'Telecom Support Assistant', 'Time Capsule API', 'File Manager'];
const save = () => writeFile(`${output}/verification.json`, JSON.stringify(report, null, 2));

function observe(page, label) {
  page.on('pageerror', error => report.errors.push({ label, message: error.message }));
  page.on('console', message => { if (message.type() === 'error') report.errors.push({ label, message: message.text() }); });
}

async function scan(page, label) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  report.accessibility.push({ label, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
  await save();
}

try {
  for (const width of [1440, 390, 360, 430, 768, 1024]) {
    const capture = width === 1440 || width === 390;
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1000 }, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    observe(page, `home-${width}`);
    const response = await page.goto(home, { waitUntil: 'networkidle', timeout: 120000 });
    if (process.env.WORK_HOME) await page.locator('details').first().evaluate(el => { el.open = true; });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.direction-dock').count(), 0);
    assert.equal(await page.locator('a[download]').count(), 0, 'No résumé action without the real PDF');
    assert.equal(await page.getByRole('link', { name: /Live Demo/ }).count(), 0, 'No unverified public demos');
    assert.equal(await page.locator('.project-actions').count(), 4);
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= width + 1, `Horizontal overflow at ${width}: ${JSON.stringify(dimensions)}`);
    if (width < 768) {
      const nodes = await page.locator('.system-node').evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { name: el.getAttribute('aria-label'), left: r.left, right: r.right, top: r.top, bottom: r.bottom }; }));
      for (const node of nodes) assert.ok(node.left >= 0 && node.right <= width, `Clipped mobile node: ${JSON.stringify(node)}`);
      for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
        const overlap = nodes[a].left < nodes[b].right && nodes[a].right > nodes[b].left && nodes[a].top < nodes[b].bottom && nodes[a].bottom > nodes[b].top;
        assert.equal(overlap, false, `Overlapping nodes at ${width}: ${nodes[a].name} / ${nodes[b].name}`);
      }
      assert.ok(await page.locator('.node-sub').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize)) >= 9);
    }
    const actionSizes = await page.locator('.project-action').evaluateAll(elements => elements.map(el => ({ height: el.getBoundingClientRect().height, href: el.getAttribute('href'), target: el.getAttribute('target'), rel: el.getAttribute('rel') })));
    for (const action of actionSizes) {
      assert.ok(action.height >= 44);
      if (action.href.startsWith('https:')) { assert.equal(action.target, '_blank'); assert.ok(action.rel.includes('noopener') && action.rel.includes('noreferrer')); }
    }
    report.layouts.push({ width, overflow: false, mobileNodesFit: width < 768 ? true : null, projectActionsAccessible: true });

    if (capture) {
      await page.screenshot({ path: `${output}/home-${width}-hero.png` });
      await page.locator('.system-environment').screenshot({ path: `${output}/home-${width}-architecture.png` });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 650) { await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y); await page.waitForTimeout(90); }
      await page.waitForTimeout(600);
      for (const [label, selector] of [['quickshow', '.playground-work'], ['telecom', '.telecom-section'], ['capsule', '.capsule-section'], ['files', '.file-section']]) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        await page.waitForTimeout(550);
        await page.locator(selector).screenshot({ path: `${output}/home-${width}-${label}.png` });
      }
      // A real reduced-motion state gives the full-page capture a settled layout.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${output}/home-${width}-full-reduced.png`, fullPage: true });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      report.captures.push({ width, view: 'home, architecture, four project previews, reduced-motion full page' });
    }
    await scan(page, `home-${width}`);

    if (capture) {
      await page.getByRole('button', { name: 'Inspect Redis', exact: true }).click();
      await page.locator('.system-inspector').getByText(/SET NX EX 15/).waitFor();
      await page.getByRole('button', { name: 'Simulate booking request', exact: true }).click();
      await page.getByRole('button', { name: 'Simulate booking request', exact: true }).waitFor({ state: 'visible', timeout: 6000 });
      await page.locator('.system-inspector h3').getByText('Response', { exact: true }).waitFor();
      await page.getByRole('link', { name: 'Try seat simulation', exact: true }).click();
      await page.getByRole('button', { name: 'Race for seat E7' }).click();
      await page.getByText('201 / COMMITTED', { exact: true }).waitFor();
      await page.getByText('409 / CONFLICT', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Reset simulation', exact: true }).click();
      await page.getByRole('button', { name: /Resolved tickets/ }).click();
      await page.locator('.retrieval-diagram [id$="-source"] p').getByText(/Resolved support tickets/).waitFor();
      await page.getByRole('button', { name: '03 Unlock', exact: true }).click();
      await page.locator('.capsule-response').getByText('200', { exact: true }).waitFor();
      report.interactions.push({ width, test: 'node selection, request trace, seat simulation/reset, retrieval source selection, capsule lifecycle', passed: true });

      await page.getByRole('link', { name: 'QuickShow: Case Study', exact: true }).click();
      await page.waitForURL('**/work/quickshow');
      await page.locator('h1').getByText('QuickShow', { exact: false }).waitFor();
      await page.goBack({ waitUntil: 'networkidle' });
      report.interactions.push({ width, test: 'Case Study action and return navigation', passed: true });

      for (let i = 0; i < projects.length; i++) {
        const result = await page.goto(`${base}/work/${projects[i]}`, { waitUntil: 'networkidle' });
        assert.equal(result.status(), 200);
        assert.equal(await page.locator('h1').count(), 1);
        assert.ok((await page.locator('h1').innerText()).includes(names[i]));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        assert.equal(await page.locator('#evidence').count(), 1);
        await scan(page, `case-${projects[i]}-${width}`);
        if (i === 0) {
          await page.screenshot({ path: `${output}/quickshow-case-${width}.png` });
          report.captures.push({ width, view: 'QuickShow case-study opening' });
        }
      }
    }
    await context.close();
    await save();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  observe(page, 'reduced-motion');
  await page.goto(home, { waitUntil: 'networkidle' });
  if (process.env.WORK_HOME) await page.locator('details').first().evaluate(el => { el.open = true; });
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'main');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.equal(await page.locator('.system-map').evaluate(el => getComputedStyle(el).transform), 'none');
  await page.getByRole('button', { name: 'Inspect Redis', exact: true }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.getByRole('button', { name: 'Inspect Redis', exact: true }).getAttribute('aria-pressed'), 'true');
  const missing = await page.request.get(`${base}/work/not-a-project`);
  assert.equal(missing.status(), 404);
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await noJs.newPage();
  await staticPage.goto(home, { waitUntil: 'load' });
  assert.ok(await staticPage.locator('h1').isVisible());
  assert.equal(await staticPage.locator('.project-actions a').count(), 8);
  await noJs.close();
  report.interactions.push({ test: 'keyboard skip link, node keyboard activation, reduced motion, 404, server-rendered no-JavaScript content/actions', passed: true });
  await context.close();
} finally {
  await browser.close();
  await save();
}
console.log(JSON.stringify(report, null, 2));
assert.equal(report.errors.length, 0, 'Browser runtime/console errors');
assert.equal(report.accessibility.reduce((count, scan) => count + scan.violations.length, 0), 0, 'Automated accessibility violations');
