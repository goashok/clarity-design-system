import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHTML, safeURL, tablePage, validateDateRange, generationStates } from '../src/component-utils.js';
import { registerClarityElements } from '../src/components.js';
test('component module can be imported and registration called during SSR',()=>assert.doesNotThrow(registerClarityElements));
test('untrusted AI and table strings are escaped; unsafe source schemes rejected',()=>{
 assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
 for(const url of ['javascript:alert(1)','data:text/html,test','file:///etc/passwd']) assert.equal(safeURL(url),'');
 assert.equal(safeURL('https://example.com/source'),'https://example.com/source');
 assert.equal(safeURL('/sources/1'),'/sources/1');
});
test('table filtering, numeric ordering, and page clamping preserve input rows',()=>{
 const rows=Array.from({length:12},(_,i)=>({id:i,name:`Project ${i+1}`,owner:i%2?'Alex':'Sam'}));
 const before=JSON.stringify(rows);
 const first=tablePage(rows);assert.deepEqual(first.rows.map(r=>r.name),['Project 1','Project 2','Project 3','Project 4','Project 5']);
 const filtered=tablePage(rows,{query:'alex',page:99,size:5});assert.equal(filtered.total,6);assert.equal(filtered.page,2);assert.equal(filtered.rows.length,1);
 assert.equal(tablePage(rows,{query:'missing'}).pages,1);assert.equal(tablePage(rows,{query:'missing'}).rows.length,0);
 assert.equal(tablePage(rows,{direction:'desc'}).rows[0].name,'Project 12');assert.equal(JSON.stringify(rows),before);
});
test('date range validity and generation states distinguish incomplete and failed output',()=>{
 assert.equal(validateDateRange('2026-09-20','2026-09-19'),false);assert.equal(validateDateRange('2026-09-20','2026-09-20'),true);assert.equal(validateDateRange('','2026-09-20'),true);
 for(const value of ['waiting','generating','complete','interrupted','incomplete','failed'])assert.ok(generationStates.includes(value));
});
