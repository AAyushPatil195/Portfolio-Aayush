import {chromium} from '@playwright/test';import{mkdir,writeFile}from'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';const output=process.env.CAPTURE_DIR||'screenshots/journey-b/deployed';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const recordings=[];
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const context=await browser.newContext({viewport,isMobile:viewport.width<768,hasTouch:viewport.width<768,recordVideo:{dir:`${output}/raw`,size:viewport}});const page=await context.newPage();await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(850);
 const links=page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link');
 await page.evaluate(()=>scrollBy({top:330,behavior:'smooth'}));await page.waitForTimeout(900);
 for(const index of [1,2,3,4]){await links.nth(index).click();await page.waitForTimeout(950);}
 await page.getByRole('button',{name:'Simulate booking request',exact:true}).scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Simulate booking request',exact:true}).click();await page.waitForTimeout(2350);
 await page.getByRole('tab',{name:'Seat contention'}).click();await page.getByRole('button',{name:'Race for seat E7'}).click();await page.locator('.allocation-study').scrollIntoViewIfNeeded();await page.waitForTimeout(1100);
 for(const index of [5,6,3,0]){await links.nth(index).click();await page.waitForTimeout(1000);}
 const video=page.video();await context.close();const file=`journey-${viewport.width}-interaction.webm`;await video.saveAs(`${output}/${file}`);await video.delete();recordings.push({viewport,file,steps:['Intro scroll','Foundations','College','Finixia to BrowserStack','Projects','QuickShow request trace','Seat contention','Beyond Code','Contact final checkpoint','Reverse to Career','Return to Intro']});
}
await browser.close();await writeFile(`${output}/recordings.json`,JSON.stringify({base,recordings},null,2));console.log(JSON.stringify(recordings));
