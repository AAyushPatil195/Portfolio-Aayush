import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const output=process.env.CAPTURE_DIR||'screenshots/college-stable/local';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,layouts:[],accessibility:[],interactions:[],errors:[]};
const ids=['community','representation','leadership','events'];
const chapters=['introduction','education','college','experience','selected-work','beyond-code','contact'];
const roles={community:['Probe Club','Media Club member','CRISPR','Founding team member','DOTSLASH','Club member','Udyam E-Cell','Member'],representation:['Section Representative','Manipur EBSB Representative'],leadership:['Sports Secretary'],events:['Kshitij 2023','Kshitij 2024','Event Management Co-Lead','Content Lead','Corporate/PR Co-Lead']};
const panel=(page,id)=>page.locator(`[data-panel="${id}"]`);
async function ready(page){assert.equal((await page.goto(base+'/#college',{waitUntil:'networkidle'})).status(),200);await page.evaluate(()=>document.fonts.ready);await page.locator('[data-map-ready="true"]').waitFor();await page.waitForTimeout(120);}
async function geometry(page){return page.locator('[data-college-map]').evaluate(e=>{const box=e.getBoundingClientRect();const round=n=>Math.round(n*100)/100;return{width:box.width,height:box.height,documentTop:round(box.top+scrollY),nodes:[...e.querySelectorAll('[data-college-marker]')].map(n=>{const r=n.getBoundingClientRect();return{id:n.dataset.collegeMarker,x:round(r.x-box.x),y:round(r.y-box.y),width:r.width,height:r.height};}),viewBox:e.querySelector('svg').getAttribute('viewBox'),paths:[...e.querySelectorAll('path[data-connection-base],path[data-connection-index]')].map(p=>p.getAttribute('d'))};});}
async function select(page,id){await page.locator(`#college-${id} label`).click();await page.waitForFunction(id=>document.querySelector(`[data-college-choice="${id}"]`).checked,id);}
async function content(page,id,enhanced=true){await panel(page,id).waitFor({state:'visible'});if(enhanced)await page.waitForFunction(id=>document.querySelector(`[data-panel="${id}"]`).getAttribute('aria-hidden')==='false',id);for(const role of roles[id])await panel(page,id).getByText(role,{exact:true}).first().waitFor({state:'visible'});for(const other of ids.filter(x=>x!==id))assert.equal(await panel(page,other).isVisible(),false);}
async function reset(page){await page.getByRole('button',{name:'Close details',exact:true}).click();await page.waitForTimeout(370);assert.equal(await page.locator('[data-college-choice]:checked').count(),0);}
async function scan(page,label){const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({label,violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}
async function navigate(page,id,short){if(short)await page.getByRole('combobox',{name:'Choose journey chapter'}).selectOption(id);else await page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(chapters.indexOf(id)).click();await page.waitForFunction(id=>document.querySelector('[data-active-chapter]')?.dataset.activeChapter===id,id);}
try{
 for(const viewport of[{width:1440,height:1000},{width:390,height:844},{width:360,height:844},{width:430,height:844},{width:768,height:1000},{width:1024,height:1000},{width:844,height:430},{width:390,height:480}]){
  const c=await browser.newContext({viewport,reducedMotion:'reduce',isMobile:viewport.width<768,hasTouch:viewport.width<768});const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await ready(p);
  const before=await geometry(p),short=viewport.height<=700;assert.equal(await p.locator('[data-journey-chapter]').count(),7);assert.equal(await p.locator('[data-college-choice]:checked').count(),0);
  assert.ok(await p.locator('#college h2').evaluate(e=>e.getBoundingClientRect().top>=64),'College heading clipped on direct anchor');
  const collapsed=await p.locator('#college').evaluate(e=>e.offsetHeight);await scan(p,`collapsed-${viewport.width}x${viewport.height}`);
  const heights=[];
  for(const id of ids){
   await select(p,id);await content(p,id);assert.deepEqual(await geometry(p),before,`${id} moves the map`);heights.push(await p.locator('#college-details').evaluate(e=>e.offsetHeight));
   assert.equal(await panel(p,id).getAttribute('aria-hidden'),'false');assert.equal(await panel(p,id).evaluate(e=>e.inert),false);
   assert.equal(await p.locator(`[data-college-marker="${id}"]`).evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(207, 255, 119)');
   const layout=await p.evaluate(()=>{const map=document.querySelector('[data-college-map]').getBoundingClientRect(),details=document.querySelector('#college-details').getBoundingClientRect();return{mapBottom:map.bottom,panelTop:details.top,overflow:document.documentElement.scrollWidth>innerWidth+1};});assert.ok(layout.mapBottom<=layout.panelTop);assert.equal(layout.overflow,false);
   const texts=await panel(p,id).locator('dt,dd,h4,p').evaluateAll(es=>es.map(e=>({text:e.textContent,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})));for(const text of texts)assert.ok(text.left>=0&&text.right<=viewport.width+1,JSON.stringify({viewport,text}));
   const wordBox=await p.locator(`#college-${id} [class*="threadSummaryText"]`).boundingBox();const action=await p.locator(`#college-${id} a`).boundingBox();assert.ok(action.y>=wordBox.y+wordBox.height-1,`Action overlaps ${id} summary at ${viewport.width}`);
   if(viewport.width===1440||viewport.width===390&&viewport.height===844)await scan(p,`${id}-${viewport.width}`);
   await p.locator(`#college-${id} a`).click();await p.waitForTimeout(120);assert.ok(await p.locator('#college-details').evaluate(e=>e.getBoundingClientRect().top>=64));
   await reset(p);assert.deepEqual(await geometry(p),before);assert.equal(await p.locator('#college').evaluate(e=>e.offsetHeight),collapsed);
   await select(p,id);await content(p,id);assert.deepEqual(await geometry(p),before);await reset(p);
  }
  assert.equal(new Set(heights).size,1,'Shared panel must reserve the same height for every selection');
  for(const id of [...ids,'community']){await select(p,id);await content(p,id);assert.deepEqual(await geometry(p),before);}
  const community=p.locator('[data-college-choice="community"]');await community.focus();await p.keyboard.press('ArrowRight');assert.ok(await p.locator('[data-college-choice="representation"]').isChecked());await content(p,'representation');
  const focused=p.locator('[data-college-choice="representation"]');assert.ok(await focused.evaluate(e=>e.matches(':focus-visible')));assert.ok(await p.locator('[data-college-marker="representation"]').evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=2));
  await p.getByRole('button',{name:'Close details',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForTimeout(80);assert.equal(await p.locator('[data-college-choice]:checked').count(),0);assert.ok(await focused.evaluate(e=>e===document.activeElement));
  await p.keyboard.press('Space');await content(p,'representation');await reset(p);
  for(const id of ['education','college','experience','selected-work','contact','college','education','college'])await navigate(p,id,short);
  await p.goBack();await p.waitForTimeout(120);assert.equal(await p.locator('[data-active-chapter]').getAttribute('data-active-chapter'),'education');await p.goForward();await p.waitForTimeout(120);assert.equal(await p.locator('[data-active-chapter]').getAttribute('data-active-chapter'),'college');
  await p.reload({waitUntil:'networkidle'});await p.locator('[data-map-ready="true"]').waitFor();assert.ok(await p.locator('#college h2').evaluate(e=>e.getBoundingClientRect().top>=64));
  const rail=await p.locator('[data-journey-navigator]').boundingBox();assert.ok(rail.y>=0&&rail.y+rail.height<=viewport.height+1);assert.ok(rail.x+rail.width<await p.locator('#college h2').evaluate(e=>e.getBoundingClientRect().left)-4);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('a[href^="tel:"],a[href$=".pdf"]').count(),0);
  report.layouts.push({viewport,identicalNodePositionsAndSvg:true,individualAndSequentialSelections:true,equalPanelHeights:heights[0],noOverlap:true,headingVisible:true,keyboard:true,historyAndReverse:true});await c.close();console.log(`Verified ${viewport.width}x${viewport.height}`);
 }
 for(const width of[1440,390]){
  const c=await browser.newContext({viewport:{width,height:width===390?844:1000}});const p=await c.newPage();await ready(p);const paths=p.locator('[data-connection-index]');
  await p.evaluate(()=>{const e=document.querySelector('[data-college-map]');scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight*.9,behavior:'instant'});});await p.waitForTimeout(140);const before=await paths.evaluateAll(es=>es.map(e=>e.getAttribute('stroke-dasharray')));
  await p.evaluate(()=>{const e=document.querySelector('[data-college-map]');scrollTo({top:e.getBoundingClientRect().top+scrollY+e.offsetHeight-innerHeight*.35,behavior:'instant'});});await p.waitForTimeout(180);const after=await paths.evaluateAll(es=>es.map(e=>e.getAttribute('stroke-dasharray')));assert.notDeepEqual(before,after);assert.ok(after.every(x=>parseFloat(x)>=.999));
  const geometryBefore=await geometry(p);for(const id of ids){await select(p,id);for(const delay of[40,110,220]){await p.waitForTimeout(delay);assert.deepEqual(await geometry(p),geometryBefore,'Geometry changed during transition');}}
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(120);assert.ok((await paths.evaluateAll(es=>es.map(e=>e.getAttribute('stroke-dasharray')))).every(x=>parseFloat(x)>=.999));assert.ok(await p.locator('[class*="detailsViewport"]').evaluate(e=>parseFloat(getComputedStyle(e).transitionDuration)<.001));
  report.interactions.push({width,scrollDrawnArrows:true,stableDuringMotion:true,runtimeReducedMotion:true});await c.close();
 }
 for(const width of[1440,390]){
  const c=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:false,reducedMotion:'reduce'});const p=await c.newPage();await p.goto(base+'/#college',{waitUntil:'load'});
  for(const id of ids){await select(p,id);await content(p,id,false);await p.locator(`#college-${id} a`).click();await reset(p);}
  report.interactions.push({width,noJavaScriptSelectionAndReset:true});await c.close();
 }
 assert.deepEqual(report.errors,[]);assert.equal(report.accessibility.flatMap(s=>s.violations).length,0,'Accessibility findings in verification.json');
}finally{await browser.close();await writeFile(`${output}/verification.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({layouts:report.layouts.length,axeScans:report.accessibility.length,violations:report.accessibility.flatMap(s=>s.violations).length,interactions:report.interactions,errors:report.errors},null,2));
