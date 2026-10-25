import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';const output=process.env.CAPTURE_DIR||'screenshots/checkpoint-refinement/local';await mkdir(output,{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true});const recordings=[];
for(const viewport of[{width:1440,height:1000},{width:390,height:844}])for(const section of['college','experience']){
 const c=await b.newContext({viewport,recordVideo:{dir:`${output}/raw`,size:viewport}});const p=await c.newPage();await p.goto(base+'/#'+section,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.locator('[data-map-ready="true"]').waitFor();await p.waitForTimeout(650);
 const scrollTo=async(selector,offset=130)=>{await p.locator(selector).evaluate((e,offset)=>scrollTo({top:e.getBoundingClientRect().top+scrollY-offset,behavior:'smooth'}),offset);await p.waitForTimeout(850);};
 if(section==='college'){
  await scrollTo('[data-college-map]',110);
  for(const id of['community','representation','leadership','events']){
   if(viewport.width<1024)await scrollTo(`[data-college-choice="${id}"]`,130);
   await p.locator(`[data-college-choice="${id}"]`).click();await p.waitForTimeout(viewport.width<1024?1100:850);
  }
  if(viewport.width>=1024){for(const id of['community','representation','leadership','events','community']){await p.locator(`[data-college-choice="${id}"]`).click();await p.waitForTimeout(100);}await p.waitForTimeout(700);await p.locator('[data-college-choice="community"]').click();}
  else await p.locator('[data-college-choice="events"]').click();
  await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(2).click();await p.waitForTimeout(800);
 }else{
  await scrollTo('[data-company-milestone="finixia"]');await p.waitForTimeout(800);await scrollTo('[data-company-milestone="browserstack"]');await p.waitForTimeout(800);
  for(const title of[/Fix the product/,/Make confidence/,/Follow the work/]){await p.getByRole('button',{name:title}).click();await p.waitForTimeout(1100);}
  await scrollTo('[data-company-milestone="finixia"]');await p.waitForTimeout(700);
 }
 const video=p.video();await c.close();const file=`${viewport.width}-${section}.webm`;await video.saveAs(`${output}/${file}`);await video.delete();recordings.push({viewport,section,file,base});
}
await b.close();await writeFile(`${output}/recordings.json`,JSON.stringify(recordings,null,2));console.log(JSON.stringify(recordings));
