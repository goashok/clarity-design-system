import { iconPaths } from './icon-paths.js';
export { iconPaths };
export const iconNames = Object.freeze(Object.keys(iconPaths));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
/** Returns trusted SVG markup. Decorative by default; pass a label for meaningful icons. */
export function icon(name, { label = '', size = 18, className = '' } = {}) {
  if (!Object.hasOwn(iconPaths, name)) throw new RangeError(`Unknown Clarity icon: ${name}`);
  if (!Number.isFinite(size) || size <= 0) throw new RangeError('Icon size must be a positive number');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="cl-icon ${escape(className)}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" ${label ? `role="img" aria-label="${escape(label)}"` : 'aria-hidden="true"'}>${iconPaths[name]}</svg>`;
}
