import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';const output=process.env.CAPTURE_DIR||'screenshots/college/recordings';await mkdir(output,{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true});const recordings=[];
for(const viewport of[{width:1440,height:1000},{width:390,height:844}]){
 const c=await b.newContext({viewport,reducedMotion:'no-preference',recordVideo:{dir:`${output}/raw`,size:viewport}});const p=await c.newPage();await p.goto(base,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.locator('[data-map-ready="true"]').waitFor();
 const range=await p.locator('[data-college-map]').evaluate(e=>{const y=e.getBoundingClientRect().top+scrollY;return{start:y-innerHeight*.9,end:y+e.offsetHeight-innerHeight*.35};});
 for(const fraction of[0,.3,.62,1]){await p.evaluate(({range,fraction})=>scrollTo({top:range.start+(range.end-range.start)*fraction,behavior:'smooth'}),{range,fraction});await p.waitForTimeout(1050);}
 await p.locator('#college-community > summary').click();await p.waitForTimeout(1200);await p.locator('#college-community > summary').click();await p.locator('#college-events > summary').click();await p.waitForTimeout(1200);await p.locator('#college-events > summary').click();await p.getByRole('navigation',{name:'Journey chapters'}).getByRole('link').nth(2).click();await p.waitForTimeout(1200);
 const video=p.video();await c.close();const file=`${viewport.width}-college-journey.webm`;await video.saveAs(`${output}/${file}`);await video.delete();recordings.push({viewport,file,steps:['Scroll from Foundations into College','Progressively traced thematic connections','Community roles disclosure','Events and festival roles disclosure','Reverse navigation to College entry']});
}
await b.close();await writeFile(`${output}/recordings.json`,JSON.stringify({base,recordings},null,2));console.log(JSON.stringify(recordings));
