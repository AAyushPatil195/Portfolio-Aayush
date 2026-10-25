import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const output=process.env.CAPTURE_DIR||'screenshots/college/verified';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,layouts:[],accessibility:[],interactions:[],errors:[]};
const chapters=['introduction','education','college','experience','selected-work','beyond-code','contact'];
const roles={community:['Media Club member','Founding team member','Club member','Member'],representation:['Section Representative','Manipur EBSB Representative'],leadership:['Sports Secretary'],events:['Kshitij 2023','Kshitij 2024','Event Management Co-Lead','Content Lead','Corporate/PR Co-Lead']};
async function current(page,id){await page.waitForFunction(id=>document.querySelector('[data-active-chapter]')?.dataset.activeChapter===id,id);}
async function anchor(page,id){await page.waitForFunction(id=>{const el=document.getElementById(id);const padding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;const margin=parseFloat(getComputedStyle(el).scrollMarginTop)||0;const expected=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,el.getBoundingClientRect().top+scrollY-padding-margin));return Math.abs(scrollY-expected)<2;},id);await current(page,id);}
async function navigate(page,id,short=false){if(short)await page.getByRole('combobox',{name:'Choose journey chapter'}).selectOption(id);else await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(chapters.indexOf(id)).click();await anchor(page,id);}
async function scan(page,label){await page.waitForTimeout(250);const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({label,violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}
try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:360,height:844},{width:430,height:844},{width:768,height:1000},{width:1024,height:1000},{width:844,height:430},{width:390,height:480}].filter(()=>!process.env.MOTION_ONLY)){
  const context=await browser.newContext({viewport,reducedMotion:'reduce',isMobile:viewport.width<768,hasTouch:viewport.width<768});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  assert.equal((await page.goto(base,{waitUntil:'networkidle'})).status(),200);await page.evaluate(()=>document.fonts.ready);await page.locator('[data-trail-ready="true"]').waitFor();await page.locator('[data-map-ready="true"]').waitFor();
  const short=viewport.height<=700;assert.equal(await page.locator('[data-journey-chapter]').count(),7);
  const academic=await page.locator('#education dl').innerText();for(const text of['Secondary Education','Higher Secondary Education','Rustomjie International School','Chhatrapati Shivaji Junior College','Among the top 4%','Among the top ~0.6%'])assert.ok(academic.includes(text));
  assert.equal(await page.getByText('10th Standard',{exact:true}).count(),0);assert.equal(await page.getByText('12th Standard',{exact:true}).count(),0);
  assert.deepEqual(await page.locator('#education [data-unit]').evaluateAll(es=>es.map(e=>({value:e.firstChild.textContent,unit:e.dataset.unit}))),[{value:'91',unit:'%'},{value:'93',unit:'%'},{value:'96',unit:'%ile'},{value:'99.4',unit:'%ile'}]);
  const notes=await page.locator('#education small').evaluateAll(es=>es.map(e=>({weight:getComputedStyle(e).fontWeight,size:parseFloat(getComputedStyle(e).fontSize)})));assert.equal(notes.length,4);assert.ok(notes.every(n=>n.weight==='400'&&n.size<=12));
  await navigate(page,'college',short);
  assert.equal(await page.locator('#college details[open]').count(),0);assert.equal(await page.getByText('Founding team member',{exact:true}).isVisible(),false);
  assert.ok((await page.locator('#college').innerText()).includes('1,000+ DSA problems solved.'));
  const titleSize=await page.locator('#college h2').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));const gradeSize=await page.locator('#college [class*="academic"] > span').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert.ok(gradeSize<titleSize*.5);
  const initialHeight=await page.locator('#college').evaluate(e=>e.offsetHeight);
  for(const id of Object.keys(roles)){
   const summary=page.locator(`#college-${id} > summary`);await summary.focus();assert.ok(await summary.evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=2));await page.keyboard.press('Enter');
   await page.waitForFunction(id=>document.getElementById('college-'+id).open,id);assert.equal(await page.locator('#college details[open]').count(),1);
   for(const role of roles[id])assert.ok(await page.locator(`#college-${id} dl`).getByText(role,{exact:true}).first().isVisible());
   assert.ok(await page.locator('#college').evaluate((e,previous)=>e.offsetHeight>previous+40,initialHeight));
   if(id==='events')await scan(page,`events-open-${viewport.width}x${viewport.height}`);
  }
  await page.locator('#college-events > summary').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#college details[open]').count(),0);
  for(const id of chapters)await navigate(page,id,short);for(const id of chapters.toReversed())await navigate(page,id,short);
  await navigate(page,'education',short);await navigate(page,'college',short);await page.goBack();await anchor(page,'education');await page.goForward();await anchor(page,'college');await page.reload({waitUntil:'networkidle'});await page.locator('[data-map-ready="true"]').waitFor();await anchor(page,'college');
  const entry=page.locator('[data-college-entry]');if(short)await entry.scrollIntoViewIfNeeded();await page.waitForTimeout(100);
  const connector=page.locator('[data-chapter-connection]');const cb=await connector.boundingBox();assert.equal(Math.round(cb.height),viewport.height);assert.equal(Math.round(cb.width),viewport.width);assert.equal(cb.x,0);assert.equal(cb.y,0);
  const point=await entry.boundingBox();const nums=(await connector.locator('path').getAttribute('d')).match(/-?\d+(?:\.\d+)?/g).map(Number);assert.ok(Math.abs(nums.at(-2)-(point.x-3))<2);assert.ok(Math.abs(nums.at(-1)-(point.y+point.height/2))<2);assert.ok([nums[0],nums[2],nums[4],nums[6]].every(x=>x<=point.x),'Connection crosses activity content');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const boxes=await page.locator('#college h2,#college h3,#college p,#college dt,#college dd,#education dt,#education dd').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right})));for(const box of boxes)assert.ok(box.x>=0&&box.right<=viewport.width+1,JSON.stringify({viewport,box}));
  const nav=await page.locator('[data-journey-navigator]').boundingBox();assert.ok(nav.y>=0&&nav.y+nav.height<=viewport.height+1);const left=await page.locator('#college h2').evaluate(e=>e.getBoundingClientRect().left);assert.ok(nav.x+nav.width<left-4);
  const targets=await page.locator('#college summary').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));assert.ok(targets.every(r=>r.width>=44&&r.height>=44));
  assert.equal(await page.locator('a[href^="tel:"],a[href$=".pdf"],a[download]').count(),0);
  await scan(page,`overview-${viewport.width}x${viewport.height}`);report.layouts.push({viewport,noOverflow:true,nativeDetails:true,exactRoles:true,compactAcademicHierarchy:true,viewportRail:true,branchConnectsActivityEntry:true,keyboard:true,historyAndReverse:true});
  await context.close();console.log(`Verified ${viewport.width}x${viewport.height}`);
 }
 for(const width of[1440,390]){
  const c=await browser.newContext({viewport:{width,height:width===390?844:1000}});const p=await c.newPage();await p.goto(base,{waitUntil:'networkidle'});await p.locator('[data-map-ready="true"]').waitFor();
  const paths=p.locator('[data-college-map] [class*="connectionTrace"]');
  await p.evaluate(()=>{const e=document.querySelector('[data-college-map]');scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight*.9,behavior:'instant'});});await p.waitForTimeout(150);const before=await paths.evaluateAll(es=>es.map(e=>e.getAttribute('stroke-dasharray')));
  await p.evaluate(()=>{const e=document.querySelector('[data-college-map]');scrollTo({top:e.getBoundingClientRect().top+scrollY+e.offsetHeight-innerHeight*.35,behavior:'instant'});});await p.waitForTimeout(250);const after=await paths.evaluateAll(es=>es.map(e=>e.getAttribute('stroke-dasharray')));assert.notDeepEqual(before,after);assert.ok(after.every(x=>parseFloat(x)>=.999));
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(150);assert.ok((await paths.evaluateAll(es=>es.map(e=>e.getAttribute('stroke-dasharray')))).every(x=>parseFloat(x)>=.999));await p.locator('#college-community > summary').click();assert.equal(await p.locator('#college-community [class*="detailContent"]').evaluate(e=>getComputedStyle(e).animationName),'none');
  report.interactions.push({width,scrollDrawnArrows:true,runtimeReducedMotion:true});await c.close();
 }
 for(const width of[1440,390]){const c=await browser.newContext({viewport:{width,height:width===390?844:1000},javaScriptEnabled:false});const p=await c.newPage();await p.goto(base,{waitUntil:'load'});for(const id of Object.keys(roles)){await p.locator(`#college-${id} > summary`).click();for(const role of roles[id])assert.ok(await p.locator(`#college-${id} dl`).getByText(role,{exact:true}).first().isVisible());}assert.equal(await p.locator('[data-journey-chapter]').count(),7);report.interactions.push({width,noJavaScriptDetailsAndContent:true});await c.close();}
 assert.deepEqual(report.errors,[]);assert.equal(report.accessibility.flatMap(s=>s.violations).length,0,'Accessibility findings in verification.json');
}finally{await browser.close();await writeFile(`${output}/verification.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({layouts:report.layouts.length,axeScans:report.accessibility.length,violations:report.accessibility.flatMap(s=>s.violations).length,interactions:report.interactions,errors:report.errors},null,2));
