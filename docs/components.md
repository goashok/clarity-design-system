# Clarity core components — v0.2

Clarity now provides optional, explicitly registered **light-DOM web components**, in addition to its CSS and native HTML patterns. They use the existing light theme, fonts, borders, radii, and icon assets.

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

## Chat interface

Two elements and two layout classes build an assistant workspace. They render what your application gives them and emit events. They never call a model, run an action, upload files, or store history.

```html
<div class="cl-chat-app" style="height: 720px">
  <aside class="cl-chat-app__history" aria-label="Conversations">…</aside>
  <div class="cl-chat">
    <div class="cl-chat__header"><div><h2 class="cl-chat__title">Publication plan</h2><p class="cl-chat__subtitle">2 documents in context</p></div></div>
    <cl-chat-thread></cl-chat-thread>
    <div class="cl-chat__footer"><cl-chat-input></cl-chat-input></div>
  </div>
  <aside class="cl-chat-app__panel" aria-label="Context and sources">…</aside>
</div>
```

- **`.cl-chat`** is the conversation column: header, scrolling thread, and composer on the canvas background. It fills its container, so give the container a height. Use it alone for a single-pane chat.
- **`.cl-chat-app`** adds a history column (`.cl-chat-app__history`, with `.cl-chat-history` and `.cl-chat-history__item[aria-current="true"]`) and a context panel (`.cl-chat-app__panel`, with `.cl-chat-docs` and `.cl-chat-panel-sources`). It responds to its own width through a container query. Below 1000px the panel becomes an overlay shown with `data-panel="open"`. Below 680px the history column hides. `data-panel="closed"` hides the panel at any width. Your application renders the history and panel content and handles toggling.

```js
const thread = document.querySelector('cl-chat-thread');
const input = document.querySelector('cl-chat-input');
let messages = [];

input.addEventListener('cl-request', async ({ detail }) => {
  const id = crypto.randomUUID();
  messages = [...messages, { id: `u-${id}`, role: 'user', content: detail.prompt }, { id, role: 'assistant', state: 'waiting' }];
  thread.data = { messages };
  input.data = { generating: true };
  for await (const text of streamFromYourService(detail.prompt, detail.context)) { // your code
    messages = messages.map(m => (m.id === id ? { ...m, state: 'generating', content: text } : m));
    thread.data = { messages };
  }
  messages = messages.map(m => (m.id === id ? { ...m, state: 'complete' } : m));
  thread.data = { messages };
  input.data = { generating: false };
});
input.addEventListener('cl-stop', () => controller.abort());
```

### `cl-chat-thread`

`.data`: `{ label?, assistantName?, messages, empty? }`. Each message is `{ id, role, content?, state?, name?, time?, error?, rating?, files?, sources?, steps?, clarify?, action?, editable?, regenerable?, rateable? }`.

- **`id`** must be unique and stable. Messages are reconciled by `id`, so a streaming update rewrites only the message that changed. Focus, selection, open step trails, and scroll position elsewhere are preserved.
- **`role`** is `user`, `assistant`, or `system`. User messages are cobalt bubbles. Assistant messages carry the gradient mark, the assistant name in Manrope, and a white answer card. The mark pulses while the response is in progress.
- **`state`** uses the generation states: `waiting` (“Thinking…”, typing dots), `generating` (“Working…” while a step runs, then “Writing…” with a pulsing cursor), `complete` (or omitted), `interrupted`, `incomplete`, and `failed` (shows `error` with Retry). Set `content` to the full text so far on each update.
- **`steps`** `[{label, state, detail?}]` render a collapsible trail at the top of the card. While a step is `running`, the summary shows it with a spinner. Afterwards it reads “Worked through 3 steps”. Show factual activity (documents read, tools called), not speculative reasoning.
- **`sources`** `[{title, url?}]` render as numbered pills. Markers `[1]`…`[n]` in the text become citation buttons, where `n` is the number of sources. Hovering or focusing a citation highlights its source, and clicking it moves focus there. Only `http:` and `https:` URLs become links. Citations are not linked while text is streaming.
- **`clarify`** `{question, options, answer?}` renders choice chips. Choosing one emits `cl-message-action {action:'clarify', id, answer}` and locks the chips. Set `answer` in your data to keep the choice.
- **`action`** `{id, title, detail?, consequence?, state, statusText?, approveLabel?, declineLabel?}` renders an approval card. Approve or decline emits `cl-message-action {action:'approve'|'decline', id, actionId}` and disables both buttons. Nothing runs by itself: set `state` to `running`, then `done`, `declined`, or `failed` as your service reports. Validate authorization on the server.
- **`time`** is display text. **`empty`** `{title?, description?, prompts?}` shows when there are no messages. Choosing a prompt emits `cl-invoke {prompt}`.

Content is escaped, then formatted for paragraphs, line breaks, bullet and numbered lists, `**bold**`, `` `inline code` ``, `#` heading lines (rendered as bold lines), citations, and fenced code blocks with a language label and a copy button. Links, images, tables, and raw HTML are not rendered. `formatMessage(text, { citations })` is exported. To render Markdown, set `thread.renderContent = (text, message) => html` before assigning data. The result is inserted as trusted HTML, so it must come from a sanitizing renderer.

**Actions.** Icon buttons (copy, edit for `editable` user messages, regenerate, good/poor response) and `time` sit under each message. They appear on hover or keyboard focus, and are always visible for the latest assistant message and on touch devices.

**Scrolling.** The thread follows new output while the reader is at the bottom. If they scroll up, it stops and shows Jump to latest. Sending a message always scrolls to the bottom. `thread.scrollToEnd()` does the same on demand.

**Screen readers.** The conversation is a `role="log"` region with live announcements off, so streamed tokens are not read aloud. A status region announces that a response started, reads the finished response, and reports failures and stops.

**Events.** `cl-message-action {action, id, rating?, actionId?, answer?}` with `action` of `copy`, `regenerate`, `retry`, `edit`, `rate`, `approve`, `decline`, or `clarify`. Copy writes to the clipboard and still emits. Rating toggles locally; persist it yourself.

### `cl-chat-input`

`.data`: `{ label?, placeholder?, maxLength?, context?, suggestions?, generating?, disabled?, disabledReason?, attachments?, accept?, maxFileSize? }`.

- Enter sends. Shift+Enter inserts a new line. Enter during IME composition never sends. Send is a round icon button, disabled while the draft is empty.
- **`context`** `[{id, label}]` shows as chips in the composer. Removing one emits `cl-context-change {items}`. `cl-request` includes the remaining IDs as `context`.
- **`suggestions`** show as chips above the composer. Choosing one fills the draft for editing. It does not send.
- While `generating` is true, Send becomes Stop and emits `cl-stop`. Typing stays enabled, but sending is blocked.
- `input.value` reads or replaces the draft. Use it to restore text after a failed request or to edit a previous message.
- `cl-request {prompt, context, files}` fires on send. The draft and attachments clear afterwards. Attachments are local `File` objects, and `maxFileSize` is a convenience check only.

`cl-ai-composer` is a full form panel for review workflows. Use `cl-chat-input` for conversation.

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
