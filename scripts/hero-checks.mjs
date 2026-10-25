import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3003';
const output = process.env.CAPTURE_DIR || 'screenshots/hero-refinement';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, layouts: [], motion: [], captures: [], errors: [] };
try {
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1000 }, isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') report.errors.push(msg.text()); });
    assert.equal((await page.goto(base, { waitUntil: 'networkidle' })).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1100);
    const main = page.getByRole('main');
    const hero = page.locator('section').first();
    const cta = main.getByRole('link', { name: 'Explore My Work', exact: true });
    const ctaRect = await cta.boundingBox();
    assert.ok(ctaRect.y + ctaRect.height < 844, `Primary CTA below first viewport at ${width}`);
    assert.equal(await page.getByRole('link', { name: /résumé/i }).count(), 0);
    for (const name of ['Selected work', 'Experience', 'Contact']) assert.ok(await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name, exact: true }).isVisible());
    const diagram = page.locator('.system-environment');
    const diagramRect = await diagram.boundingBox();
    if (width === 1440) {
      assert.ok(diagramRect.width < width * .45);
      assert.ok(await page.locator('#selected-work').evaluate(el => el.getBoundingClientRect().top < innerHeight));
    } else if (width < 768) assert.ok(diagramRect.y > ctaRect.y + ctaRect.height, 'Identity and CTA precede mobile architecture');

    const hitboxes = await page.locator('.system-node').evaluateAll(nodes => nodes.map(el => { const b = el.getBoundingClientRect(); return { name: el.textContent, left: b.left, right: b.right, top: b.top, bottom: b.bottom }; }));
    for (const a of hitboxes) {
      assert.ok(a.left >= 0 && a.right <= width, `Clipped node: ${a.name} at ${width}`);
      for (const b of hitboxes) if (a !== b) assert.equal(a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top, false, `Overlapping nodes at ${width}: ${a.name}, ${b.name}`);
    }
    const inspector = await page.locator('.system-inspector').boundingBox();
    for (const b of hitboxes) assert.equal(b.left < inspector.x + inspector.width && b.right > inspector.x && b.top < inspector.y + inspector.height && b.bottom > inspector.y, false, `Inspector obscures ${b.name} at ${width}`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await cta.focus();
    assert.ok(await cta.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth) >= 2));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(750);
    assert.equal(new URL(page.url()).hash, '#selected-work');
    assert.ok(await page.locator('#selected-work').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 80));
    report.layouts.push({ width, primaryCTAAboveFold: true, navigationVisible: true, diagramSecondary: true, diagramNodesFit: true, noOcclusion: true, keyboardCTA: true, noOverflow: true });

    if ([390,1440].includes(width)) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.mouse.move(0, 0);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${output}/hero-${width}.png` });
      await hero.screenshot({ path: `${output}/hero-${width}-complete.png` });
      const transitionTop = await page.locator('#selected-work').evaluate(el => el.getBoundingClientRect().top + scrollY - 200);
      await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), transitionTop);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${output}/quickshow-transition-${width}.png` });
      report.captures.push(`hero-${width}.png`, `hero-${width}-complete.png`, `quickshow-transition-${width}.png`);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.getByRole('button', { name: 'Inspect Redis', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.locator('.system-inspector p').getByText(/SET NX EX 15/).waitFor();
      assert.equal(await page.locator('.system-map').evaluate(el => getComputedStyle(el).transform), 'none');
      assert.ok((await hero.locator('.hero-entrance').evaluateAll(elements => elements.map(el => getComputedStyle(el).transform))).every(t => t === 'none'));
      const simulate = page.getByRole('button', { name: 'Simulate booking request', exact: true });
      await simulate.click();
      await page.locator('.system-inspector h3').getByText('Response', { exact: true }).waitFor();
      await simulate.waitFor({ state: 'visible', timeout: 2000 });
      assert.equal(await page.locator('.system-connections > path[stroke-width="2.5"], .system-connections > path[stroke-width="2"]').count(), 0);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForTimeout(150);
      await simulate.click();
      await page.locator('.system-connections > path[stroke-width="2.5"]').waitFor({ state: 'attached' });
      await simulate.waitFor({ state: 'visible', timeout: 6000 });
      report.motion.push({ width, keyboardNodes: true, reducedMotion: true, runtimePreferenceChange: true, requestTrace: true });
    }
    await context.close();
  }
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await writeFile(`${output}/hero-verification.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
