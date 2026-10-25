import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const output=process.env.CAPTURE_DIR||'screenshots/journey-a/after';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const recordings=[];
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<768,hasTouch:viewport.width<768,recordVideo:{dir:`${output}/raw`,size:viewport}});
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'networkidle',timeout:120000});await page.waitForTimeout(1200);
  const checkpoints=page.getByRole('navigation',{name:'Journey chapters'}).getByRole('link');
  await page.evaluate(()=>scrollBy({top:360,behavior:'smooth'}));await page.waitForTimeout(1100);
  await checkpoints.nth(1).click();await page.waitForTimeout(1200);
  await checkpoints.nth(2).click();await page.waitForTimeout(1200);
  await page.getByText('Problem-solving practice',{exact:true}).click();await page.waitForTimeout(1100);
  await page.getByText('Problem-solving practice',{exact:true}).click();await page.waitForTimeout(450);
  await checkpoints.nth(3).click();await page.waitForTimeout(1200);
  await checkpoints.nth(1).click();await page.waitForTimeout(1200);
  await checkpoints.nth(0).click();await page.waitForTimeout(1200);
  const video=page.video();await context.close();
  const file=`journey-${viewport.width}-interaction.webm`;await video.saveAs(`${output}/${file}`);await video.delete();recordings.push({viewport,file,steps:['Scroll from introduction','Foundations checkpoint','College checkpoint','Native detail open and close','Professional transition','Reverse to Foundations','Return to Introduction']});
}
await browser.close();await writeFile(`${output}/recordings.json`,JSON.stringify({base,recordings},null,2));console.log(JSON.stringify(recordings));
