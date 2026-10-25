import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await mkdir('research/references', { recursive: true });
const references = [
  ['dennis-snellenberg', 'https://dennissnellenberg.com/'],
  ['rauno-freiberg', 'https://rauno.me/'],
  ['flowfest', 'https://www.flowfest.co.uk/'],
];
const report = [];
for (const [name, url] of references) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `research/references/${name}.png` });
    report.push({ name, url, title: await page.title(), captured: true });
  } catch (error) { report.push({ name, url, captured: false, error: error.message }); }
}
await writeFile('research/references/capture-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
