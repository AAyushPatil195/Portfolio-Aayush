import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const output=process.env.CAPTURE_DIR||'screenshots/college-stable/local';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
for(const width of[1440,390]){
 const normal={width,height:width===390?844:1000};const c=await browser.newContext({viewport:normal,reducedMotion:'reduce'});const p=await c.newPage();await p.goto(base+'/#college',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.locator('[data-map-ready="true"]').waitFor();
 await p.mouse.move(width-5,5);await p.screenshot({path:`${output}/${width}-college-viewport.png`});
 await p.locator('#college-events label').click();await p.waitForTimeout(100);const maxHeight=await p.locator('#college').evaluate(e=>Math.ceil(e.getBoundingClientRect().height));await p.getByRole('button',{name:'Close details',exact:true}).click();
 await p.setViewportSize({width,height:maxHeight+176});
 for(const state of['collapsed','community','representation','leadership','events']){
  if(state!=='collapsed')await p.locator(`#college-${state} label`).click();
  await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(2).click();await p.waitForTimeout(160);await p.mouse.move(width-5,5);
  assert.ok(await p.locator('#college h2').evaluate(e=>e.getBoundingClientRect().top>=64));
  await p.locator('#college').screenshot({path:`${output}/${width}-college-${state}.png`});
  report.push({width,state,viewportHeight:maxHeight+176,sectionHeight:await p.locator('#college').evaluate(e=>e.offsetHeight),headingVisible:true});
 }
 await c.close();
}
await browser.close();await writeFile(`${output}/captures.json`,JSON.stringify({base,captures:report},null,2));console.log(JSON.stringify(report));
