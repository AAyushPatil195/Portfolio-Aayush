import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const output=process.env.CAPTURE_DIR||'screenshots/checkpoint-refinement/local';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
for(const width of[1440,390]){
 const c=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});const p=await c.newPage();await p.goto(base+'/#college',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.locator('[data-map-ready="true"]').waitFor();
 await p.mouse.move(width-5,5);await p.screenshot({path:`${output}/${width}-college-viewport.png`});
 const heights=[];for(const id of['community','representation','leadership','events']){await p.locator(`[data-college-choice="${id}"]`).click();await p.waitForTimeout(100);heights.push(await p.locator('#college').evaluate(e=>e.offsetHeight));}await p.locator('[data-college-choice="events"]').click();
 await p.setViewportSize({width,height:Math.max(...heights)+176});
 for(const state of['collapsed','community','representation','leadership','events']){
  if(state!=='collapsed')await p.locator(`[data-college-choice="${state}"]`).click();
  await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(2).click();await p.waitForTimeout(140);await p.mouse.move(width-5,5);assert.ok(await p.locator('#college h2').evaluate(e=>e.getBoundingClientRect().top>=64));
  await p.locator('#college').screenshot({path:`${output}/${width}-college-${state}.png`});report.push({width,state,section:'college',headingVisible:true});
 }
 const experienceHeight=await p.locator('#experience').evaluate(e=>e.offsetHeight);await p.setViewportSize({width,height:experienceHeight+176});await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(3).click();await p.waitForTimeout(160);await p.mouse.move(width-5,5);await p.locator('#experience').screenshot({path:`${output}/${width}-experience.png`});
 for(const company of['finixia','browserstack']){await p.locator(`[data-company-milestone="${company}"]`).screenshot({path:`${output}/${width}-${company}.png`});report.push({width,section:'experience',company});}
 await p.getByRole('button',{name:/Fix the product/}).click();await p.waitForTimeout(120);const expanded=await p.locator('#experience').evaluate(e=>e.offsetHeight);await p.setViewportSize({width,height:expanded+176});await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(3).click();await p.waitForTimeout(120);await p.mouse.move(width-5,5);await p.locator('#experience').screenshot({path:`${output}/${width}-experience-expanded.png`});
 await c.close();
}
await browser.close();await writeFile(`${output}/captures.json`,JSON.stringify({base,captures:report},null,2));console.log(JSON.stringify(report));
