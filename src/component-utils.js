export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value) {
  try { const url = new URL(value, 'https://clarity.invalid/'); return ['http:', 'https:'].includes(url.protocol) ? String(value) : ''; } catch { return ''; }
}
export function tablePage(rows, { query = '', sort = 'name', direction = 'asc', page = 1, size = 5 } = {}) {
  const filtered = rows.filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(query.toLowerCase())));
  filtered.sort((a,b) => String(a[sort] ?? '').localeCompare(String(b[sort] ?? ''), undefined, { numeric:true }) * (direction === 'desc' ? -1 : 1));
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(Math.max(1,page), pages);
  return { rows:filtered.slice((current-1)*size,current*size), total:filtered.length, pages, page:current };
}
export const generationStates = Object.freeze(['idle','waiting','generating','complete','interrupted','incomplete','failed']);
export function validateDateRange(start, end) { return !start || !end || start <= end; }
/** Formats untrusted chat text as safe markup: paragraphs, line breaks, bullet and numbered lists, **bold**, `inline code`, heading lines, and fenced code blocks. With `citations: n`, markers [1] to [n] become citation buttons. No links, images, or raw HTML. Tolerates unterminated fences while output streams. */
export function formatMessage(text, { citations = 0 } = {}) {
  const cite = html => citations > 0 ? html.replace(/\[(\d{1,2})\]/g, (match, n) => Number(n) >= 1 && Number(n) <= citations ? `<button type="button" class="cl-cite" data-cite="${Number(n)}" aria-label="Source ${Number(n)}">${Number(n)}</button>` : match) : html;
  const inline = value => String(value).split(/(`[^`\n]+`)/).map(part => part.length > 2 && part.startsWith('`') && part.endsWith('`') ? `<code>${escapeHTML(part.slice(1, -1))}</code>` : cite(escapeHTML(part).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>'))).join('');
  const prose = value => {
    const out = []; let para = [], list = null;
    const flush = () => {
      if (para.length) { out.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; }
      if (list) { out.push(`<${list.tag}${list.start > 1 ? ` start="${list.start}"` : ''}>${list.items.map(item => `<li>${inline(item)}</li>`).join('')}</${list.tag}>`); list = null; }
    };
    for (const line of value.split('\n')) {
      if (!line.trim()) { flush(); continue; }
      const heading = line.match(/^#{1,6}\s+(.+)$/), bullet = line.match(/^\s*[-*•]\s+(.*)$/), numbered = line.match(/^\s*(\d{1,9})[.)]\s+(.*)$/);
      if (heading) { flush(); out.push(`<p class="cl-chat-heading"><strong>${inline(heading[1])}</strong></p>`); continue; }
      if (bullet || numbered) {
        const tag = bullet ? 'ul' : 'ol';
        if (para.length || (list && list.tag !== tag)) flush();
        list ??= { tag, start: numbered ? Number(numbered[1]) : 1, items: [] };
        list.items.push(bullet ? bullet[1] : numbered[2]);
        continue;
      }
      if (list) flush();
      para.push(line);
    }
    flush();
    return out.join('');
  };
  return String(text ?? '').split('```').map((part, index) => {
    if (!(index % 2)) return prose(part);
    const newline = part.indexOf('\n');
    const language = (newline < 0 ? part : part.slice(0, newline)).trim();
    const code = newline < 0 ? '' : part.slice(newline + 1).replace(/\n$/, '');
    return `<pre class="cl-code" tabindex="0"${/^[\w+#.-]{1,20}$/.test(language) ? ` data-lang="${escapeHTML(language)}"` : ''}><code>${escapeHTML(code)}</code></pre>`;
  }).join('');
}
