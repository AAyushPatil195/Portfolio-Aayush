import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const output=process.env.CAPTURE_DIR||'screenshots/college/captures';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
for(const width of[1440,390]){
 const normal={width,height:width===390?844:1000};const c=await browser.newContext({viewport:normal,reducedMotion:'reduce'});const p=await c.newPage();await p.goto(base,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.locator('[data-map-ready="true"]').waitFor();
 for(const id of['education','college']){await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(id==='education'?1:2).click();await p.waitForTimeout(180);await p.mouse.move(width-5,5);await p.screenshot({path:`${output}/${width}-${id}-boundary.png`});}
 for(const [state,thread] of[['overview',null],['community','community'],['events','events']]){
  if(thread)await p.locator(`#college-${thread} > summary`).click();
  await p.waitForTimeout(180);const height=await p.locator('#college').evaluate(e=>Math.ceil(e.getBoundingClientRect().height));
  // A full-section artifact must paint its footer as well as its first viewport.
  await p.setViewportSize({width,height:height+128});await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(2).click();await p.waitForTimeout(220);await p.mouse.move(width-5,5);
  await p.locator('#college').screenshot({path:`${output}/${width}-college-${state}.png`});report.push({width,state,height});
 }
 await c.close();
}
await browser.close();await writeFile(`${output}/captures.json`,JSON.stringify({base,captures:report},null,2));console.log(JSON.stringify(report));
