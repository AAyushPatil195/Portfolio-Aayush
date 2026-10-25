import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
const output = process.env.CAPTURE_DIR || 'screenshots/journey-a/after';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, layouts: [], accessibility: [], interactions: [], captures: [], errors: [] };
const chapters = ['introduction','education','college','professional-next'];
async function current(page, id) {
  await page.waitForFunction(id => document.querySelector('[data-active-chapter]')?.dataset.activeChapter === id, id);
}
async function settledAnchor(page, id) {
  await page.waitForFunction(id => {
    const el = document.getElementById(id);
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const expected = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, el.getBoundingClientRect().top + scrollY - padding - margin));
    return Math.abs(scrollY - expected) < 2;
  }, id);
  await current(page, id);
}
async function inspectRail(page, viewport) {
  const nav = page.locator('[data-journey-navigator]');
  const box = await nav.boundingBox();
  assert.ok(box.y >= -1 && box.y + box.height <= viewport.height + 1, `Rail outside viewport: ${JSON.stringify({ viewport, box })}`);
  const contentLeft = await page.locator('#introduction h1').evaluate(el => el.getBoundingClientRect().left);
  const nodes = await page.getByRole('navigation', { name: 'Journey chapters' }).getByRole('link').evaluateAll(elements => elements.map(el => { const r=el.getBoundingClientRect(); return { x:r.x,y:r.y,width:r.width,height:r.height }; }));
  for (let i=0;i<nodes.length;i++) {
    const a=nodes[i];
    assert.ok(a.width>=44 && a.height>=44);
    assert.ok(a.x>=-1 && a.y>=-1 && a.y+a.height<=viewport.height+1);
    assert.ok(a.x+a.width<contentLeft-4, 'Rail target overlaps chapter content');
    for(let j=i+1;j<nodes.length;j++){const b=nodes[j];assert.equal(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y,false,'Checkpoint hit areas overlap');}
  }
  const footer = await page.locator('footer').boundingBox();
  assert.ok(box.y+box.height<=footer.y+1,'Rail overlaps footer boundary');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  return box;
}

try {
  for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:360,height:844},{width:430,height:844},{width:768,height:1000},{width:1024,height:1000},{width:844,height:430},{width:390,height:480}]) {
    const short = viewport.height<600;
    const context = await browser.newContext({viewport,isMobile:viewport.width<768,hasTouch:viewport.width<768});
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
    assert.equal((await page.goto(base,{waitUntil:'networkidle',timeout:120000})).status(),200);
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('[data-trail-ready="true"]').waitFor();
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('[data-journey-chapter]').count(),4,'Milestone B remains unbuilt');
    const metrics=await page.locator('#education [data-unit]').evaluateAll(els=>els.map(el=>({value:el.firstChild.textContent,unit:el.dataset.unit})));
    assert.deepEqual(metrics,[{value:'91',unit:'%'},{value:'93',unit:'%'},{value:'96',unit:'%ile'},{value:'99.4',unit:'%ile'}]);
    const notes=await page.locator('#education small').evaluateAll(els=>els.map(el=>({text:el.textContent,weight:getComputedStyle(el).fontWeight,size:parseFloat(getComputedStyle(el).fontSize)})));
    assert.deepEqual(notes.map(n=>n.text),['Among the top 4%','Among the top ~0.6%']);
    for(const note of notes){assert.equal(note.weight,'400');assert.ok(note.size<=12);}
    assert.equal(await page.locator('#college').getByText('2021',{exact:true}).count(),1);
    assert.equal(await page.locator('#college').getByText('2025',{exact:true}).count(),1);
    assert.ok(await page.getByRole('link',{name:'Jump to Work',exact:true}).isVisible());
    const rail=page.locator('[data-journey-navigator]');
    const svg=rail.locator('svg[viewBox="0 0 160 520"]');
    const links=page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link');
    assert.equal(await links.count(),4);
    await inspectRail(page,viewport);
    const startPath=await svg.locator('path').nth(1).getAttribute('stroke-dasharray');

    for(let i=0;i<chapters.length;i++){
      await links.nth(i).click();
      await settledAnchor(page,chapters[i]);
      assert.equal(await links.nth(i).getAttribute('aria-current'),'step');
      for(let j=0;j<i;j++)assert.equal(await links.nth(j).getAttribute('data-state'),'complete');
      await inspectRail(page,viewport);
    }
    assert.notEqual(await svg.locator('path').nth(1).getAttribute('stroke-dasharray'),startPath);
    // Direct reload and native browser history must agree with clicked checkpoints.
    await links.nth(1).click();await settledAnchor(page,'education');
    await links.nth(2).click();await settledAnchor(page,'college');
    await page.goBack();await settledAnchor(page,'education');
    await page.goForward();await settledAnchor(page,'college');
    await page.reload({waitUntil:'networkidle'});await page.locator('[data-trail-ready="true"]').waitFor();await settledAnchor(page,'college');

    const summary=page.getByText('Problem-solving practice',{exact:true}).locator('..');
    const beforeBox=await rail.boundingBox();
    const viewBox=await svg.getAttribute('viewBox');
    const nextTop=await page.locator('#professional-next').evaluate(el=>el.getBoundingClientRect().top+scrollY);
    await summary.focus();
    assert.ok(await summary.evaluate(el=>parseFloat(getComputedStyle(el).outlineWidth)>=2));
    await page.keyboard.press('Enter');
    await page.getByText('DSA problems solved.',{exact:true}).waitFor();
    await page.waitForTimeout(100);
    assert.ok(await page.locator('#professional-next').evaluate((el,previous)=>el.getBoundingClientRect().top+scrollY>previous+50,nextTop));
    assert.equal(await svg.getAttribute('viewBox'),viewBox);
    assert.equal((await rail.boundingBox()).height,beforeBox.height,'Expansion must not stretch the navigator');
    await page.keyboard.press('Enter');await page.waitForTimeout(100);

    await links.nth(1).focus();
    assert.ok(await links.nth(1).evaluate(el=>parseFloat(getComputedStyle(el).outlineWidth)>=2));
    await page.keyboard.press('Enter');await settledAnchor(page,'education');
    await page.evaluate(()=>{history.replaceState(null,'',location.pathname);scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});});await current(page,'professional-next');
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await current(page,'introduction');
    // Same map size and viewport position while the content moves underneath.
    const positions=[];
    for(const fraction of [.25,.6]){await page.evaluate(f=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:'instant'}),fraction);await page.waitForTimeout(100);positions.push(await inspectRail(page,viewport));}
    if(!short)assert.ok(Math.abs(positions[0].y-positions[1].y)<2,'Navigator must stay viewport anchored');

    const content=await page.locator('[data-journey-chapter] h1,[data-journey-chapter] h2,[data-journey-chapter] h3,[data-journey-chapter] p,#education dt,#education dd').evaluateAll(els=>els.map(el=>({text:el.textContent,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})));
    for(const box of content)assert.ok(box.left>=0&&box.right<=viewport.width+1,`Clipped text at ${viewport.width}: ${box.text}`);
    const sectionHeights=await page.locator('[data-journey-chapter]').evaluateAll(els=>els.map(el=>({id:el.id,height:el.getBoundingClientRect().height})));
    report.layouts.push({viewport,viewportAnchored:true,targets44px:true,railDoesNotObscureContent:true,noOverflow:true,sectionHeights});
    report.interactions.push({viewport,checkpointNavigation:true,directHashReload:true,historyBackForward:true,fastScrollAndReverse:true,keyboard:true,expansionDoesNotStretchRail:true});
    if(!short){const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({viewport,violations:scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}

    if([1440,390].includes(viewport.width)&&!short){
      await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
      assert.equal(await svg.locator('circle').evaluate(el=>getComputedStyle(el).display),'none');
      const activeNumber=links.filter({has:page.locator('[class*="number"]')}).first();
      assert.ok(await activeNumber.isVisible());
      const animations=await links.locator('span').evaluateAll(els=>els.map(el=>getComputedStyle(el,'::after').animationName));
      assert.ok(animations.every(name=>name==='none'));
      assert.ok((await page.locator('.hero-entrance,.name-entrance,.section-reveal').evaluateAll(els=>els.map(el=>getComputedStyle(el).transform))).every(t=>t==='none'));
      for(let i=0;i<chapters.length;i++){
        if(i===0){await page.evaluate(()=>{history.replaceState(null,'',location.pathname);scrollTo({top:0,behavior:'instant'});});await current(page,'introduction');}
        else{await links.nth(i).click();await settledAnchor(page,chapters[i]);}
        await page.waitForTimeout(100);
        const file=`${viewport.width}-${chapters[i]}.png`;await page.screenshot({path:`${output}/${file}`});report.captures.push(file);
      }
      await page.emulateMedia({reducedMotion:'no-preference'});
      await links.nth(1).click();await settledAnchor(page,'education');
      assert.notEqual(await links.nth(1).locator('span').evaluate(el=>getComputedStyle(el,'::after').animationName),'none');
      report.interactions.push({viewport,reducedMotion:true,runtimePreferenceChange:true});
    }
    await context.close();
  }
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:1000},javaScriptEnabled:false});const page=await context.newPage();
    await page.goto(base,{waitUntil:'load'});for(const id of chapters)assert.ok(await page.locator(`#${id} h1,#${id} h2`).isVisible());
    const link=page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(1);await link.focus();await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash,'#education');
    await page.getByText('Problem-solving practice',{exact:true}).click();assert.ok(await page.getByText('DSA problems solved.',{exact:true}).isVisible());
    await inspectRail(page,{width,height:width===390?844:1000});report.interactions.push({width,noJavaScriptContentAndNavigation:true});await context.close();
  }
  assert.deepEqual(report.errors,[]);
  assert.ok(report.accessibility.every(scan=>scan.violations.length===0),'Automated accessibility violations; see verification.json');
}finally{await browser.close();await writeFile(`${output}/verification.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({layouts:report.layouts.length,accessibilityScans:report.accessibility.length,violations:report.accessibility.flatMap(s=>s.violations).length,captures:report.captures.length,errors:report.errors},null,2));
