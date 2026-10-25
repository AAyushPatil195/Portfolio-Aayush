import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PREVIEW_URL;
assert.ok(base?.startsWith('https://'), 'Set the exact HTTPS preview URL');
const output = process.env.CAPTURE_DIR || 'screenshots/journey-b/deployed';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, publicWithoutAuthentication: true, routes: [], interactions: [], errors: [] };
const projects = ['quickshow', 'telecom-assistant', 'time-capsule-api', 'file-manager'];
try {
  for (const width of [1440,390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce' });
    assert.equal((await context.cookies()).length, 0);
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') report.errors.push(msg.text()); });
    for (const route of ['/', '/work', ...projects.map(p => `/work/${p}`)]) {
      const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 120000 });
      assert.equal(response.status(), 200);
      assert.equal(new URL(page.url()).origin, base);
      assert.equal(await page.locator('h1').count(), 1);
      const headers = await response.request().allHeaders();
      assert.ok(!Object.keys(headers).some(k => /x-vercel.*(bypass|token)/.test(k)));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      report.routes.push({ route, width, status: 200, publicApplicationRendered: true });
      if (route === '/') {
        assert.equal(await page.locator('[data-journey-chapter]').count(), 7);
        assert.ok((await page.locator('#college').innerText()).includes('7.6'));
        assert.equal(await page.getByRole('link', {name:'Jump to Work',exact:true}).getAttribute('href'),'#selected-work');
        for(const id of ['experience','selected-work','beyond-code','contact']) {
          await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link',{name:new RegExp(id==='experience'?'Professional Journey':id==='selected-work'?'Things I':id==='beyond-code'?'Beyond Code':'Contact')}).click();
          await page.waitForFunction(id=>document.querySelector('[data-active-chapter]')?.dataset.activeChapter===id,id);
        }
        assert.ok((await page.locator('#experience').innerText()).indexOf('Finixia')<(await page.locator('#experience').innerText()).indexOf('BrowserStack'));
        assert.equal(await page.locator('.project-actions').count(),4);
        const finixia=page.getByRole('link',{name:'Inside the work',exact:true});await finixia.click();await page.waitForURL('**/work#finixia');assert.ok(await page.locator('#finixia').isVisible());
        await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('link',{name:'Explore the contributions',exact:true}).click();await page.waitForURL('**/work#browserstack');assert.ok(await page.locator('#browserstack').isVisible());
      } else if (route === '/work') {
        assert.equal(await page.locator('.project-actions').count(), 4);
        assert.ok((await page.locator('#experience').innerText()).includes('130'));
        const architecture = page.locator('summary').filter({ hasText: 'Explore QuickShow’s booking architecture' });
        await architecture.focus();
        await page.keyboard.press('Enter');
        await page.getByRole('button', { name: 'Inspect Redis', exact: true }).click();
        await page.locator('.system-inspector p').getByText(/SET NX EX 15/).waitFor();
        const request = page.getByRole('button', { name: 'Simulate booking request', exact: true });
        await request.click();
        await request.waitFor({ state: 'visible', timeout: 4000 });
        await page.locator('.system-inspector h3').getByText('Response', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Race for seat E7' }).click();
        await page.getByText('201 / COMMITTED', { exact: true }).waitFor();
        await page.getByText('409 / CONFLICT', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Reset simulation', exact: true }).click();
        await page.getByRole('button', { name: /Resolved tickets/ }).click();
        await page.locator('.retrieval-diagram [id$="-source"] p').getByText(/Resolved support tickets/).waitFor();
        await page.getByRole('button', { name: '03 Unlock', exact: true }).click();
        await page.locator('.capsule-response').getByText('200', { exact: true }).waitFor();
        report.interactions.push({ width, architectureAndRequestTrace: true, seatSimulation: true, retrievalSources: true, capsuleLifecycle: true, experiencePreserved: true });
      } else {
        assert.equal(await page.getByRole('link', { name: 'Back to selected work' }).getAttribute('href'), '/work#selected-work');
        assert.equal(await page.locator('#evidence').count(), 1);
      }
    }
    await page.getByRole('link', { name: 'Back to selected work' }).click();
    await page.waitForURL('**/work#selected-work');
    await page.getByRole('link', { name: 'Back to my journey' }).click();
    await page.waitForURL(base + '/');
    await page.getByRole('heading', { name: 'Aayush Patil.' }).waitFor();
    report.interactions.push({ width, caseStudyReturnAndJourneyNavigation: true });
    await context.close();
  }
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await writeFile(`${output}/public-verification.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ publicRoutes: report.routes.length, interactions: report.interactions, errors: report.errors }, null, 2));
