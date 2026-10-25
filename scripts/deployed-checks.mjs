import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PREVIEW_URL;
assert.ok(base?.startsWith('https://'), 'Set PREVIEW_URL to the exact HTTPS preview deployment');
const output = 'screenshots/hero-refinement/deployed';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, publicAccess: true, routes: [], accessibility: [], interactions: [], errors: [] };
const routes = [
  ['/', 'Aayush Patil'],
  ['/work/quickshow', 'QuickShow'],
  ['/work/telecom-assistant', 'Telecom Support Assistant'],
  ['/work/time-capsule-api', 'Time Capsule API'],
  ['/work/file-manager', 'File Manager'],
];
try {
  for (const width of [1440, 390]) {
    // A clean browser context: no Vercel session, stored auth, or bypass headers.
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce' });
    assert.equal((await context.cookies()).length, 0);
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') report.errors.push(msg.text()); });
    for (const [path, title] of routes) {
      const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle', timeout: 120000 });
      assert.equal(response.status(), 200, `${path} must be publicly accessible`);
      assert.equal(new URL(page.url()).origin, base);
      assert.ok((await page.locator('h1').innerText()).includes(title));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      report.routes.push({ path, width, status: 200, applicationRendered: true, noAuthentication: true, noOverflow: true });
      if (path === '/' || width === 1440) {
        const scan = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        report.accessibility.push({ path, width, violations: scan.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) });
      }
      if (path === '/') {
        assert.ok((await page.locator('main').innerText()).includes('experience at BrowserStack'));
        assert.ok((await page.locator('main').innerText()).includes('Finixia Dedecons'));
        assert.equal(await page.locator('.project-actions').count(), 4);
        assert.equal(await page.locator('a[download]').count(), 0);
        const responseHeaders = await response.request().allHeaders();
        assert.ok(!Object.keys(responseHeaders).some(k => /x-vercel.*(bypass|token)/.test(k)));
        await page.locator('.race-button').click();
        await page.getByText('201 / COMMITTED', { exact: true }).waitFor();
        await page.getByText('409 / CONFLICT', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Reset simulation', exact: true }).click();
        await page.getByRole('button', { name: /Tickets Resolved cases/ }).click();
        await page.locator('.rag-context p').getByText(/Resolved support tickets/).waitFor();
        await page.getByRole('button', { name: '03 Unlock', exact: true }).click();
        await page.locator('.capsule-response').getByText('200', { exact: true }).waitFor();
        await page.getByRole('link', { name: 'QuickShow: Case Study', exact: true }).click();
        await page.waitForURL('**/work/quickshow');
        await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Experience', exact: true }).click();
        await page.waitForURL('**/#experience');
        await page.getByRole('heading', { name: /release cycle/ }).waitFor();
        report.interactions.push({ width, seatSimulationAndReset: true, retrievalSources: true, capsuleLifecycle: true, caseStudyNavigation: true, experienceNavigation: true });
      }
    }
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  assert.ok(report.accessibility.every(s => s.violations.length === 0));
} finally {
  await browser.close();
  await writeFile(`${output}/public-verification.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ publicRoutes: report.routes.length, accessibilityScans: report.accessibility.length, violations: report.accessibility.flatMap(s => s.violations).length, interactions: report.interactions, errors: report.errors }, null, 2));
