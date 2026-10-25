import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';const output=process.env.CAPTURE_DIR||'screenshots/college-stable/recordings';await mkdir(output,{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true});const recordings=[];
for(const viewport of[{width:1440,height:1000},{width:390,height:844}]){
 const c=await b.newContext({viewport,reducedMotion:'no-preference',recordVideo:{dir:`${output}/raw`,size:viewport}});const p=await c.newPage();await p.goto(base+'/#college',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.locator('[data-map-ready="true"]').waitFor();await p.waitForTimeout(700);
 const range=await p.locator('[data-college-map]').evaluate(e=>{const y=e.getBoundingClientRect().top+scrollY;return{start:y-innerHeight*.9,end:y+e.offsetHeight-innerHeight*.4};});
 for(const fraction of[0,.45,1]){await p.evaluate(({range,fraction})=>scrollTo({top:range.start+(range.end-range.start)*fraction,behavior:'smooth'}),{range,fraction});await p.waitForTimeout(800);}
 for(const id of['community','representation','leadership','events']){
  await p.locator(`#college-${id} label`).click();await p.waitForTimeout(600);
  await p.locator(`#college-${id} a`).click();await p.waitForTimeout(900);
 }
 await p.getByRole('button',{name:'Close details',exact:true}).click();await p.waitForTimeout(450);await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(2).click();await p.waitForTimeout(900);
 const video=p.video();await c.close();const file=`${viewport.width}-college-stable.webm`;await video.saveAs(`${output}/${file}`);await video.delete();recordings.push({viewport,file,steps:['College heading and scroll tracing','Community','Representation','Leadership','Events','Close and return to chapter']});
}
await b.close();await writeFile(`${output}/recordings.json`,JSON.stringify({base,recordings},null,2));console.log(JSON.stringify(recordings));
