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
