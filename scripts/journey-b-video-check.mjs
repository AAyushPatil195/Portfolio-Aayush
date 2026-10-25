import{chromium}from'@playwright/test';import{writeFile}from'node:fs/promises';
const b=await chromium.launch({channel:'chrome',headless:true});const report=[];
for(const width of [1440,390]){const p=await b.newPage();await p.goto('file:///D:/Portfolio/screenshots/journey-b/deployed/journey-'+width+'-interaction.webm');await p.waitForFunction(()=>document.querySelector('video')?.readyState>=2);report.push(await p.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,readyState:v.readyState})));await p.close();}
console.log(JSON.stringify(report));await writeFile('screenshots/journey-b/deployed/video-verification.json',JSON.stringify(report,null,2));await b.close();
