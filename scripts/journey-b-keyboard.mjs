import{chromium}from'@playwright/test';import assert from'node:assert/strict';import{writeFile}from'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:844,height:430},{width:390,height:480}]){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'});await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:3000',{waitUntil:'networkidle'});
 if(viewport.height>700){const link=page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(3);await link.focus();assert.ok(await link.evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=2));await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('[data-active-chapter]').dataset.activeChapter==='experience');}
 else{const picker=page.getByRole('combobox',{name:'Choose journey chapter'});await picker.focus();assert.ok(await picker.evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=2));await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('[data-active-chapter]').dataset.activeChapter==='education');}
 report.push({viewport,keyboardChapterNavigation:true,visibleFocus:true});await page.close();
}
await browser.close();console.log(JSON.stringify(report));await writeFile('screenshots/journey-b/deployed/keyboard-verification.json',JSON.stringify(report,null,2));
