import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
const output = 'screenshots/work-experience';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, layouts: [], accessibility: [], captures: [], interactions: [], errors: [] };
const stages = ['diagnose', 'build', 'verify', 'release'];

try {
  for (const width of [1440, 390, 360, 430, 768, 1024]) {
    const mobile = width < 768;
    const context = await browser.newContext({ viewport: { width, height: mobile ? 844 : 1000 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
    assert.equal((await page.goto(base, { waitUntil: 'networkidle' })).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#experience');
    const map = section.getByRole('navigation');
    assert.equal(await map.getByRole('link').count(), 4);
    const text = await section.innerText();
    for (const fact of ['BrowserStack', 'Software Development Engineer', 'June 2025', 'April 2026', '17 RBAC', '25+', '11+', '130', 'Jira', 'Jenkins', 'Kubernetes', 'Finixia Dedecons', 'January 2025', 'Wens Force', 'Melo Films', 'PactumJS', 'NightwatchJS', 'Percy', 'REST APIs']) assert.ok(text.includes(fact), `Missing fact: ${fact}`);

    for (const stage of stages) {
      await page.locator(`#experience-${stage}`).evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .25, behavior: 'instant' }));
      await page.waitForTimeout(180);
      await page.waitForFunction(id => document.querySelector(`[href="#experience-${id}"][aria-current="step"]`), stage);
    }
    const bounds = await section.locator('a, h2, h3, h4, p').evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { text: el.textContent, left: r.left, right: r.right }; }));
    for (const bound of bounds) assert.ok(bound.left >= -1 && bound.right <= width + 1, `Clipped at ${width}: ${JSON.stringify(bound)}`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const mapPosition = await map.locator('..').evaluate(el => getComputedStyle(el).position);
    if (mobile) assert.equal(mapPosition, 'static', 'No sticky mobile experience UI');
    for (const link of await map.getByRole('link').all()) {
      const box = await link.boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44, 'Contribution links have touch-sized targets');
    }
    report.layouts.push({ width, noOverflow: true, readableContent: true, activeStagesTrackScroll: true, touchTargets: true, mobileMapInFlow: mobile ? true : null });

    if ([1440, 390].includes(width)) {
      // Visit every row before capturing: entrance motion never leaves content hidden.
      for (const stage of stages) { await page.locator(`#experience-${stage}`).scrollIntoViewIfNeeded(); await page.waitForTimeout(120); }
      await page.waitForTimeout(800);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const top = await section.evaluate(el => Math.round(el.getBoundingClientRect().top + scrollY));
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top);
      await page.waitForTimeout(200);
      const prefix = `experience-${width}`;
      await page.screenshot({ path: `${output}/${prefix}-entrance.png` });
      const height = await section.evaluate(el => Math.ceil(el.getBoundingClientRect().height));
      await page.screenshot({ path: `${output}/${prefix}-overview.png`, fullPage: true, clip: { x: 0, y: top, width, height } });
      await page.locator('#experience-verify').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${output}/${prefix}-verification.png` });
      await section.locator('article').last().screenshot({ path: `${output}/${prefix}-finixia.png` });
      report.captures.push(...['entrance', 'overview', 'verification', 'finixia'].map(name => `${prefix}-${name}.png`));

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      report.accessibility.push({ width, violations: results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, message: n.failureSummary })) })) });

      // Keyboard activation must move to real content, with a visible focus outline.
      const verifyLink = map.getByRole('link', { name: /03 Verify/ });
      await verifyLink.focus();
      assert.ok(await verifyLink.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth) >= 2));
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#experience-verify');
      await page.waitForTimeout(150);
      const targetTop = await page.locator('#experience-verify').evaluate(el => el.getBoundingClientRect().top);
      assert.ok(targetTop >= 0 && targetTop < 100, 'Anchor content visible and unobscured');
      const transforms = await section.locator('.section-reveal').evaluateAll(elements => elements.map(el => getComputedStyle(el).transform));
      assert.ok(transforms.every(transform => transform === 'none'), 'Reduced motion removes entrance transforms');
      if (!mobile) assert.equal(await map.locator('svg path').last().evaluate(el => getComputedStyle(el).strokeDasharray), 'none', 'Reduced motion shows a static complete path');
      report.interactions.push({ width, keyboardAnchors: true, focusVisible: true, reducedMotion: true });

      if (!mobile) {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        const firstLink = map.getByRole('link').first();
        const number = firstLink.locator('span').first();
        await firstLink.focus();
        await page.keyboard.press('Tab');
        const color = await number.evaluate(el => getComputedStyle(el).color);
        await firstLink.hover();
        await page.waitForTimeout(300);
        assert.notEqual(await number.evaluate(el => getComputedStyle(el).color), color, 'Hover feedback');
        const progressPath = map.locator('svg path').last();
        await page.locator('#experience-diagnose').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 300, behavior: 'instant' }));
        await page.waitForTimeout(200);
        const before = await progressPath.getAttribute('stroke-dasharray');
        await page.locator('#experience-release').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }));
        await page.waitForTimeout(200);
        assert.notEqual(await progressPath.getAttribute('stroke-dasharray'), before, 'Scroll draws the engineering path');
        report.interactions.push({ desktopHover: true, scrollDrawnPath: true });
      }
    }
    await context.close();
  }

  const staticPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await staticPage.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await staticPage.locator('#experience [data-contribution]').count(), 4);
  assert.ok((await staticPage.locator('#experience').innerText()).includes('Melo Films'));
  assert.ok(await staticPage.locator('#experience h4').first().isVisible());
  report.interactions.push({ contentAvailableWithoutJavaScript: true });
  await staticPage.close();
  assert.deepEqual(report.errors, []);
  assert.ok(report.accessibility.every(scan => scan.violations.length === 0), 'Accessibility violations: see verification.json');
} finally {
  await writeFile(`${output}/verification.json`, JSON.stringify(report, null, 2));
  await browser.close();
}

await writeFile(`${output}/index.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Work Experience — visual review</title><style>body{margin:0;padding:40px;background:#141b1c;color:#edf2e7;font:16px/1.7 system-ui}main{max-width:1400px;margin:auto}h1{font-weight:500;letter-spacing:-1px}p{color:#adb9bb;max-width:700px}a{color:#8badd0}nav{display:flex;gap:24px;flex-wrap:wrap;margin:30px 0}section{margin:60px 0}h2{font-size:20px;font-weight:500}img{display:block;width:100%;height:auto;border:1px solid #adb9bb33}section.mobile img{max-width:390px}figure{margin:24px 0}figcaption{font-size:13px;margin:10px 0;color:#adb9bb}a:focus-visible{outline:3px solid #cfff77;outline-offset:5px}</style><main><h1>Inside the release cycle.</h1><p>Work Experience milestone. BrowserStack leads with a scroll-linked engineering loop; Finixia follows as a compact editorial entry. The stages group contributions, rather than claiming a measured or chronological delivery pipeline.</p><nav><a href="${base}/#experience">Open interactive preview ↗</a><a href="#desktop">1440px desktop</a><a href="#mobile">390px mobile</a><a href="verification.json">Verification report</a></nav>${[1440,390].map(width => `<section id="${width === 1440 ? 'desktop' : 'mobile'}" class="${width === 390 ? 'mobile' : ''}"><h2>${width}px / ${width === 1440 ? 'Desktop' : 'Mobile'}</h2>${['entrance','verification','finixia','overview'].map(name => `<figure><figcaption>${name}</figcaption><a href="experience-${width}-${name}.png"><img loading="lazy" src="experience-${width}-${name}.png" alt="Work Experience ${name} at ${width} pixels"></a></figure>`).join('')}</section>`).join('')}</main></html>`);
console.log(JSON.stringify({ layouts: report.layouts.length, captures: report.captures.length, accessibilityViolations: report.accessibility.flatMap(a => a.violations).length, interactions: report.interactions, errors: report.errors }, null, 2));
