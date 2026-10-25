import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
const output = process.env.CAPTURE_DIR || 'screenshots/journey';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, layouts: [], accessibility: [], interactions: [], screenshots: [], errors: [] };
const chapters = ['introduction', 'education', 'college', 'professional-next'];

try {
  for (const width of [1440, 390, 360, 430, 768, 1024]) {
    const mobile = width < 768;
    const context = await browser.newContext({ viewport: { width, height: mobile ? 844 : 1000 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') report.errors.push(msg.text()); });
    assert.equal((await page.goto(base, { waitUntil: 'networkidle', timeout: 120000 })).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator('[data-trail-ready]');
    await root.and(page.locator('[data-trail-ready="true"]')).waitFor();
    await page.waitForTimeout(950);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('[data-journey-chapter]').count(), 4);
    assert.equal(await page.locator('.system-environment, #experience, .playground-work').count(), 0, 'Only current journey chapters on home');
    const mainText = await page.locator('main').innerText();
    for (const fact of ['Aayush Patil', 'backend systems', 'applied AI', 'State-level', 'football player', '10th Standard', '12th Standard', '91', '93', 'JEE Main', 'MHT-CET', '0.5', 'IIIT Nagpur', '7.6', '2021', '2025', 'Technical-fest leadership', 'Finixia', 'BrowserStack']) assert.ok(mainText.includes(fact), `Missing fact: ${fact}`);
    const links = page.getByRole('navigation', { name: 'Journey chapters' }).getByRole('link');
    const trail = root.locator(':scope > svg');
    const drawn = trail.locator('path').nth(1);
    const initial = await drawn.getAttribute('stroke-dasharray');

    for (let i = 0; i < chapters.length; i++) {
      const chapter = page.locator(`#${chapters[i]}`);
      await chapter.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .15, behavior: 'instant' }));
      await page.waitForTimeout(180);
      await page.waitForFunction(id => document.querySelector('[data-trail-ready]').dataset.activeChapter === id, chapters[i]);
      assert.equal(await links.nth(i).getAttribute('aria-current'), 'step');
      for (let j = 0; j < i; j++) assert.equal(await links.nth(j).getAttribute('data-state'), 'complete');
    }
    assert.notEqual(await drawn.getAttribute('stroke-dasharray'), initial);
    // Reverse scrolling must restore the active checkpoint and uncomplete later ones.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(180);
    assert.equal(await root.getAttribute('data-active-chapter'), 'introduction');
    assert.equal(await links.nth(2).getAttribute('data-state'), 'upcoming');
    assert.ok((await trail.locator('path').first().getAttribute('d')).split('C').length >= 7, 'A winding multi-curve pathway');

    const rectangles = await root.locator('h1, h2, h3, p, dt, dd, summary').evaluateAll(elements => elements.map(el => { const b = el.getBoundingClientRect(); return { text: el.textContent, left: b.left, right: b.right }; }));
    const trailRight = await trail.evaluate(el => el.getBoundingClientRect().right);
    for (const rect of rectangles) {
      if (rect.right === rect.left) continue;
      assert.ok(rect.left >= trailRight + 5, `Trail obstructs text: ${rect.text} at ${width}`);
      assert.ok(rect.right <= width + 1, `Content clipped at ${width}: ${rect.text}`);
    }
    for (const link of await links.all()) {
      const b = await link.boundingBox();
      assert.ok(b.width >= 44 && b.height >= 44);
      assert.ok(b.x >= 0 && b.x + b.width <= width);
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));

    // A native college expansion changes the following checkpoint's actual
    // position; the trail must remeasure without breaking its continuity.
    const summary = page.locator('summary').filter({ hasText: 'A little more from college' });
    const beforeY = await links.nth(3).getAttribute('style');
    await summary.focus();
    assert.ok(await summary.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth) >= 2));
    await page.keyboard.press('Enter');
    await page.getByText('1,000', { exact: false }).waitFor();
    await page.waitForTimeout(200);
    assert.notEqual(await links.nth(3).getAttribute('style'), beforeY, 'Trail follows expanded chapter geometry');
    await page.keyboard.press('Enter');
    await page.waitForFunction(before => document.querySelector('nav[aria-label="Journey chapters"] a:last-child').getAttribute('style') === before, beforeY);
    const eduLink = links.nth(1);
    await eduLink.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => { const top = document.querySelector('#education').getBoundingClientRect().top; return top >= -2 && top < 100; }, undefined, { timeout: 4000 });
    assert.equal(new URL(page.url()).hash, '#education');
    report.layouts.push({ width, noOverflow: true, trailOutsideContent: true, touchTargets: true, chaptersTrackForwardAndReverse: true });
    report.interactions.push({ width, keyboardCheckpoints: true, keyboardExpansion: true, geometryUpdatesOnExpansion: true, scrollDrawing: true });

    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    report.accessibility.push({ width, violations: scan.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });

    if ([1440,390].includes(width)) {
      // Exercise pointer response on the small personal football illustration.
      await page.locator('#introduction').scrollIntoViewIfNeeded();
      const field = page.locator('svg[viewBox="0 0 160 90"]');
      if (!mobile) {
        const ball = field.locator('g').last();
        const before = await ball.getAttribute('style');
        const box = await field.boundingBox();
        await page.mouse.move(box.x + box.width - 4, box.y + 6);
        await page.waitForTimeout(500);
        assert.notEqual(await ball.getAttribute('style'), before);
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(150);
      assert.equal(await drawn.evaluate(el => getComputedStyle(el).strokeDasharray), 'none');
      assert.equal(await trail.locator('circle').evaluate(el => getComputedStyle(el).display), 'none');
      assert.ok((await root.locator('.hero-entrance, .name-entrance, .section-reveal').evaluateAll(elements => elements.map(el => getComputedStyle(el).transform))).every(t => t === 'none'));
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${output}/journey-${width}-hero.png` });
      for (const id of ['education','college','professional-next']) {
        await page.locator(`#${id}`).evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }));
        await page.waitForTimeout(150);
        await page.screenshot({ path: `${output}/journey-${width}-${id}.png` });
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `${output}/journey-${width}-overview.png`, fullPage: true });
      report.screenshots.push(...['hero','education','college','professional-next','overview'].map(id => `journey-${width}-${id}.png`));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.locator('#college').scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      assert.notEqual(await drawn.evaluate(el => getComputedStyle(el).strokeDasharray), 'none');
      report.interactions.push({ width, reducedMotion: true, runtimeMotionPreference: true, personalPointerDetail: !mobile });
      await page.getByRole('link', { name: 'Jump to Work', exact: true }).click();
      await page.waitForURL('**/work#selected-work');
      assert.ok(await page.getByRole('heading', { name: /QuickShow/ }).isVisible());
      report.interactions.push({ width, jumpToExistingWork: true });
    }
    await context.close();
  }

  for (const width of [1440,390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'load' });
    for (const id of chapters) assert.ok(await page.locator(`#${id} h1, #${id} h2`).isVisible());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.getByText('A little more from college', { exact: true }).click();
    assert.ok(await page.getByText('DSA problems solved.', { exact: false }).isVisible());
    report.interactions.push({ width, contentAndExpansionWorkWithoutJavaScript: true });
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  assert.ok(report.accessibility.every(scan => scan.violations.length === 0), 'Accessibility violations; inspect verification.json');
} finally {
  await browser.close();
  await writeFile(`${output}/verification.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ layouts: report.layouts.length, accessibilityScans: report.accessibility.length, violations: report.accessibility.flatMap(s => s.violations).length, screenshots: report.screenshots.length, errors: report.errors }, null, 2));
