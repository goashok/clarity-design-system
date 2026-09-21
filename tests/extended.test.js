import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHTML, safeURL, tablePage, validateDateRange, generationStates, formatMessage } from '../src/component-utils.js';
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
test('chat text is escaped and only safe formats (paragraphs, lists, bold, inline code, fences) are rendered',()=>{
 assert.equal(formatMessage('Hello\n\nWorld'),'<p>Hello</p><p>World</p>');
 assert.equal(formatMessage('a\nb'),'<p>a<br>b</p>');
 assert.equal(formatMessage('Use `x < y` here'),'<p>Use <code>x &lt; y</code> here</p>');
 const hostile=formatMessage('<img src=x onerror=alert(1)> [x](javascript:alert(1)) **<b>bold</b>**');
 assert.ok(!hostile.includes('<img')&&!hostile.includes('<a ')&&!hostile.includes('<b>'));
 assert.ok(hostile.includes('<strong>&lt;b&gt;bold&lt;/b&gt;</strong>'));
 assert.equal(formatMessage('Steps:\n- one\n- `two`'),'<p>Steps:</p><ul><li>one</li><li><code>two</code></li></ul>');
 assert.equal(formatMessage('3. c\n4. d'),'<ol start="3"><li>c</li><li>d</li></ol>');
 assert.equal(formatMessage('Use `**x**`'),'<p>Use <code>**x**</code></p>');
 assert.equal(formatMessage('## Plan'),'<p class="cl-chat-heading"><strong>Plan</strong></p>');
 assert.equal(formatMessage('Run:\n\n```js\nif (a < b) {}\n```\nDone'),'<p>Run:</p><pre class="cl-code" tabindex="0" data-lang="js"><code>if (a &lt; b) {}</code></pre><p>Done</p>');
 assert.equal(formatMessage('```js\nlet a'),'<pre class="cl-code" tabindex="0" data-lang="js"><code>let a</code></pre>');
 assert.equal(formatMessage('```js'),'<pre class="cl-code" tabindex="0" data-lang="js"><code></code></pre>');
 assert.ok(!formatMessage('```"><script>\ncode\n```').includes('<script'));
 assert.equal(formatMessage(null),'');
 assert.equal(formatMessage('See [1] and [3]',{citations:2}),'<p>See <button type="button" class="cl-cite" data-cite="1" aria-label="Source 1">1</button> and [3]</p>');
 assert.equal(formatMessage('See [1]'),'<p>See [1]</p>');
 assert.equal(formatMessage('`a[1]`',{citations:1}),'<p><code>a[1]</code></p>');
});
