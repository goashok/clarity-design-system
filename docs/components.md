# Clarity core components — v0.2

Clarity now provides optional, explicitly registered **light-DOM web components**, in addition to its CSS and native HTML patterns. They use the existing light theme, fonts, borders, radii, and icon assets. The new controls are Clarity extensions; they are not claimed to have existed in SigPro.

## Start

```js
import '@clarity-design/system/styles.css';
import { registerClarityElements } from '@clarity-design/system/components';
registerClarityElements(); // Safe to call more than once
```

```html
<div class="clarity">
  <cl-combobox label="Choose a team"></cl-combobox>
  <cl-ai-suggestion></cl-ai-suggestion>
</div>
```

Module import is safe during server rendering; registration does nothing outside a browser. Components render client-side. They use light DOM, so they inherit the `.clarity` scope and are inspectable with standard browser tools. Modern browsers with Custom Elements, native dialog, and Popover API support are required. The package does not ship legacy-browser polyfills.

Assign configuration through the element's `.data` property, preferably before inserting it into the document. All displayed text is escaped; evidence links permit only HTTP(S) and relative web URLs. Give every component instance its own data object. Do not insert untrusted HTML into slots or bypass escaping.

Configuration updates rerender the component; avoid replacing `.data` while the user is typing. Editable components retain their local interaction state. To start an unrelated record, replace the element with a newly configured instance. Generation and execution components are application-controlled: replace `.data` to update their displayed states. Changes to attributes after mounting are not automatically observed; configure before mounting or call `render()` to refresh attributes.

Events bubble, are composed, and use the `cl-` prefix. Components perform no network requests, storage writes, model calls, or external actions. Applications decide what events mean and handle permissions, persistence, failures, and retries. Do not interpret an emitted request as a successful backend operation.

## Core inventory

| Component | Configuration | Events / behavior |
| --- | --- | --- |
| `cl-menu` | `label`; `.data.items: {id,label,disabled?}[]` | `cl-menu-select {value}`; keyboard arrows, Home/End, Escape; native light dismissal |
| `cl-popover` | `label`; `.data {title,text}` | Native toggle, close, Escape, outside dismissal; centered contextual panel |
| `cl-tooltip` | `label`, `text` | Focus/hover disclosure; Escape dismisses; no interactive content |
| `cl-combobox` | `label`; `.data.options: string[]` | `cl-change {value}`; editable search, listbox navigation, Enter selection; Escape/blur restores last selection |
| `cl-multiselect` | `label`; `.data.options: string[]` | `cl-change {values}`; checkbox choices, search, removable chips |
| `cl-date-range` | `label`; `.data {start,end}` in YYYY-MM-DD | `cl-change {start,end,valid}`; rejects end before start using native validity |
| `cl-drawer` | `label`; `.data {title,text,name}` | `cl-save {name}`; native modal focus containment, cancel, Escape, required input |
| `cl-upload` | `label`, `accept`, `max-size` in bytes (default 10 MB) | `cl-files {files,errors}`; local files only, drop zone, extension/MIME and size validation, removal |
| `cl-data-table` | `label`; `.data {rows,columns?}` | Sorting, search, removable filter, five-row pagination; `cl-selection {ids}`, `cl-bulk-action {ids}` |
| `cl-stepper` | `.data.steps: {title,name?,label?}[]` | Required named fields, review steps without a name, back navigation; `cl-complete {values}` |

Rows need unique stable `id` values. Table sorting is string/numeric-aware comparison, not locale-specific date parsing or server pagination. Selection survives pagination and filtering; the count explicitly includes hidden rows. “Select current page” only affects visible rows. Bulk actions emit IDs and never mutate your dataset.

These custom elements are not form-associated elements: the values of their internal native controls are not automatically included in an outer form's `FormData`. Subscribe to their events and integrate with your application's form state. Do not nest components containing forms inside another `<form>`.

## Native HTML patterns

The Core controls reference page includes copyable markup for:

- Date input (`input type="date"`) and browser calendar.
- Switch (`.cl-switch` wrapping `input type="checkbox" role="switch"` and `.cl-switch-track`).
- Radio groups (`fieldset`, `legend`, shared `name`).
- Accordion/disclosure (`details.cl-disclosure`, `summary`; shared `name` for exclusive groups).
- Loading spinner (`.cl-spinner`), skeleton (`.cl-skeleton`), native progress (`progress.cl-progress`), and a disabled/busy loading button.
- Filter chips (`.cl-chip`), including an accessible remove label.

Loading animation is decorative. Put the meaningful status in text or a live region. Mark a loading region `aria-busy`, disable repeated submissions, and preserve form inputs when a request fails. Progress must reflect actual measured progress; the reference page's 65% is explicitly a sample.

## Example: dataset and events

```js
const table = document.createElement('cl-data-table');
table.data = {
  columns: [{ key: 'name', label: 'Project' }, { key: 'owner', label: 'Owner' }],
  rows: [{ id: 'p1', name: 'Research workspace', owner: 'Alex Lee' }]
};
table.addEventListener('cl-bulk-action', ({ detail }) => {
  console.log('Selected IDs:', detail.ids);
});
document.querySelector('.clarity').append(table);
```

In React/Vue/Svelte, register once and assign `.data` via a DOM ref or your framework's custom-element property binding. Attach native event listeners and remove application listeners on unmount. No framework wrappers are bundled. TypeScript DOM tag declarations are supplied by the components module.

## Files and persistence

File validation is client-side convenience, not server validation. Validate type, content, and size again at the receiving service. The upload component emits `File` objects; upload progress/failure/retry can be composed with the progress, alert, and button patterns using actual request state. No fictitious upload completion is displayed by the library.

## Verification

Run `npm run build` and `npm test`. `scripts/check-extended.js` exercises real browser interactions when the preview runs on 4173 and an isolated Chromium remote-debugging session runs on 9222. This complements `scripts/check-browser.js` for the original reference pages.
