// Optional integration check: run the preview on 4173 and Chromium debugging on 9222.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const target=await fetch('http://localhost:9222/json/new?http://localhost:4173',{method:'PUT'}).then(r=>r.json());
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map();const errors=[];
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
await send('Runtime.enable');await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://localhost:4173'});await delay(1200);
for(let i=0;i<30;i++){if(await evaluate('!!document.querySelector(".hero")'))break;await delay(100);}
assert.equal(await evaluate('document.querySelector("h1").textContent'),'Less noise. More clarity.');
await fs.writeFile('/tmp/clarity-desktop.png',Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
for(const width of [1440,768,390,320]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
 for(const route of ['overview','colors','typography','spacing','components','patterns','icons','tokens','start']){
  await evaluate(`location.hash=${JSON.stringify(route)}`);await delay(70);
  assert.ok(await evaluate('document.querySelector("h1")?.textContent.length>0'),route);
  const dimensions=await evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})');
  assert.ok(dimensions.scroll<=dimensions.client,`${route} ${width}: ${JSON.stringify(dimensions)}`);
 }
}
await evaluate('location.hash="components"');await delay(100);
await evaluate('document.querySelector("#tab-overview").focus()');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});
assert.equal(await evaluate('document.activeElement.id'),'tab-activity');
assert.equal(await evaluate('document.querySelector("#panel-activity").hidden'),false);
await evaluate('document.querySelector("[data-open-dialog]").click()');
assert.equal(await evaluate('document.querySelector("dialog").open'),true);
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await delay(100);
assert.equal(await evaluate('document.querySelector("dialog").open'),false);
await evaluate('document.querySelector("[data-demo-toast]").click()');assert.equal(await evaluate('document.querySelector("#toast").hidden'),false);
await evaluate('location.hash="icons"');await delay(70);
await evaluate('document.querySelector("#icon-search").value="search";document.querySelector("#icon-search").dispatchEvent(new Event("input",{bubbles:true}))');
assert.equal(await evaluate('document.querySelectorAll("[data-copy-icon]:not([hidden])").length'),1);
await evaluate('location.hash="tokens"');await delay(70);
await evaluate('document.querySelector("#token-search").value="--cl-color-primary-hover";document.querySelector("#token-search").dispatchEvent(new Event("input",{bubbles:true}))');
assert.equal(await evaluate('document.querySelectorAll("[data-token-row]:not([hidden])").length'),1);
await evaluate('location.hash="patterns"');await delay(70);
await evaluate('document.querySelectorAll("[data-select-item]")[1].click()');assert.equal(await evaluate('document.querySelector("#pattern-detail h2").textContent'),'Familiar patterns for everyday work');
await evaluate('location.hash="overview"');await delay(100);
await send('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:false});
await fs.writeFile('/tmp/clarity-mobile.png',Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
assert.deepEqual(errors,[]);
console.log('Passed: 9 pages at 4 viewport widths; tabs, dialog, toast, icon/token filtering, master–detail selection; no runtime exceptions.');
ws.close();
