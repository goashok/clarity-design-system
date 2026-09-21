# Clarity design specification

## Visual principles

Clarity is an extraction of the implemented SigPro interface, not a redesign. Its visual hierarchy is built through spacing, font weight, and lightly tinted surfaces. Blue identifies actions and selections. Teal supports positive outcomes. Amber, red, olive, and purple carry contextual meaning, paired with words. Shadows separate surfaces very subtly; borders do most of the structural work.

The source is a vanilla HTML/CSS/JavaScript application with no UI or icon package dependencies. Its stylesheet holds five named variables (`--blue`, `--muted`, `--border`, `--teal`, `--shadow`) and many literal component values. Clarity promotes recurring values to a prefixed vocabulary instead of carrying the whole application stylesheet into other projects.

## Exact source foundations

| Role | Value | Source usage |
| --- | --- | --- |
| Primary | `#3463df` | Primary buttons, brand mark, selected accents |
| Primary hover | `#2853c5` | Primary button hover |
| Primary soft | `#edf2ff` | Active navigation |
| Supporting teal | `#268b77` | Source `--teal` variable |
| Canvas | `#f7f8fa` | Application background |
| Surface | `#ffffff` | Sidebar, cards, panels, dialogs |
| Text | `#253249` | Body and page heading |
| Muted | `#7b8596` | Source `--muted` variable |
| Border | `#e6eaf0` | Source `--border` variable |
| Card shadow | `0 2px 5px #1a304505` | Cards and outlined buttons |
| Selection | `#f6f9ff`, `#bed0fa` | Selected inbox card background and border |

Secondary buttons use white backgrounds, `#dfe4ed` borders, and `#647086` text. They do not use the teal supporting accent. The source contains many nearby neutral shades; Clarity preserves important component-specific shades while consolidating semantic uses. The token JSON is the definitive catalog.

## Typography

DM Sans provides body, labels, controls, metadata, and button text. Manrope provides headings, brand text, and metrics. Preserve variable weights; synthesized browser weights are disabled.

| Role | Size | Typical weight | Notes |
| --- | --- | --- | --- |
| Page title | 27px | 750 | 1.4 line height, −1px tracking |
| Metric | 30px | 650 | 1.4 line height |
| Dialog heading | 23px | 750 | Source dialog size |
| Detail title | 18px | 700 | 1.5 line height, −0.45px tracking |
| Section | 14px | 750 | Compact panel headings |
| Body | 13px | 400 | Original body size |
| Supporting body | 12px | 400 | Introductions and descriptions |
| Control label | 11px | 500–550 | Buttons, fields, forms |
| Small text | 10px | 400–500 | Descriptions and list metadata |
| Caption | 9px | 400–650 | Labels and metadata |
| Micro | 8px | 400–650 | Dense source annotations |

The source also uses isolated 7px badges and 29px brand text. These are not promoted into universal typography roles. The reference site introduces larger 35px promotional type only for its overview hero; this is documentation styling, not the application page-heading token.

## Spacing and shape

The original is not a strict 4px grid: 9, 13, 19, 21, 22, 23, 33, and 35px values are common. Do not describe it as one. Clarity offers a practical named spacing palette from 0 to 64px, preserves component-specific measurements, and reserves larger steps for composition. 40/48/64px spacing steps are reusable extensions rather than assertions that SigPro used a systematic scale.

Controls: 5–6px radius. Badges: 4px. Navigation: 7px. Cards and nodes: 9px. Library cards: 12px. Dialogs: 14px. Avatars: circular. Borders are generally 1px. Selected records add a 3px inset blue left edge. A selected node gets a pale 3px outer ring.

## Responsive layout

| Width | Behavior |
| --- | --- |
| Above 1200px | 238px sidebar, 73px topbar, 35px horizontal page padding |
| At 1200px | Page insets reduce to 24px |
| At 1000px | Sidebar reduces to 185px |
| At 700px | Sidebar becomes a 64px icon rail, topbar is 60px, page insets are 16px |

These thresholds follow the source. The documentation additionally stacks its own two-column samples at 800px. Tables and workflow canvases scroll locally; page layouts should not overflow horizontally. The source has additional page-specific breakpoints and responsive details that were not generalized into the library.

## Component extraction map

| SigPro pattern | Clarity API | Notes |
| --- | --- | --- |
| `.btn.primary`, `.secondary`, `.compact` | `.cl-btn` plus `--primary`, `--secondary`, `--compact` | Exact primary proportions and appearance |
| `.btn.danger`, `.subtle` | `--danger`, `--ghost` | Adapted with explicit danger tint and hover treatment |
| `.icon-button` | `.cl-icon-btn` | Label icon-only buttons |
| `.stat` | `.cl-card.cl-stat` | Label/value/note slots |
| `.signal-panel`, `.story-detail` | `.cl-card`, `__header`, `__body`, `__footer` | Generalized panel structure |
| `.badge.critical/high/medium/low` | `.cl-badge--danger/warning/medium/success` | Same original status colors |
| `.avatar`, `.node-icon` | `.cl-avatar`, `.cl-icon-tile` | Profile and category treatments |
| `.form-label` | `.cl-field`, `.cl-input`, `.cl-select`, `.cl-textarea` | Explicit native label/control associations |
| `.search-field` | `.cl-search` | Added focus-within ring |
| `.tabs`, `.tab.active` | `.cl-tabs`, `.cl-tab[aria-selected]` | State expressed semantically |
| `.info-banner`, result panels | `.cl-alert` and variants | Generalized status messages |
| `.signal-card.selected` | `.cl-list-item[aria-pressed]` | Selected card with inset accent |
| `.empty-state` | `.cl-empty` | Helpful message and next action |
| `.action-row` | `.cl-table` | New semantic table derived from visual row treatment |
| `.modal`, `.modal-backdrop` | Native `<dialog class="cl-dialog">` | Styling retained; native modal behavior replaces custom backdrop |
| `#toast` | `.cl-toast` | Centered reusable status message |
| `.sidebar`, `.topbar`, `.nav-item` | `.cl-sidebar`, `.cl-topbar`, `.cl-nav-item` | App shell independent of product routes |
| `.flow-node`, `.canvas-scroll` | `.cl-node`, `.cl-canvas` | Visual building blocks only |
| `.evidence-item` | `.cl-timeline` | Semantic ordered list for evidence/activity |

Workflow execution, node dragging, edge routing, business-state persistence, domain-specific evidence, and SigPro application logic are intentionally not part of a generic visual system. The pattern examples are compositions, not a replacement workflow application.

## Icons

26 inline SVGs: grid, inbox, network, radio, briefcase, layers, sparkles, check, chart, users, clipboard, landmark, globe, mail, search, arrow, chevron, plus, close, play, clock, settings, book, bell, download, trash.

24 × 24 viewBox; no fill by default; currentColor stroke; 1.65 stroke width; rounded caps and joins. The settings icon has original filled circles. Default display size is 18px, buttons use 15px, and metadata often uses 12–14px. Paths are exact copies of SigPro's inline dictionary. No installed icon library or upstream attribution is asserted.

## State, accessibility, and motion

Preserve focus rings, disabled controls, pointer hover, selected states, and invalid state treatment. Status labels must not rely on color alone. Use native input labels and descriptions. Keep keyboard order consistent with reading order. Icon rail links keep accessible labels when their visible text is hidden.

The original 8–11px pale metadata and several status colors have insufficient contrast for normal text. Default source fidelity is not an accessibility guarantee. `data-contrast="enhanced"` changes muted and badge/status colors; some literal component colors remain, so audit each actual composition. Larger text and touch targets may be appropriate. The CSS foundation preserves small source control dimensions and does not claim a universal touch-first layout.

Dialogs use `showModal()`, native focus containment, Escape dismissal, and a labeled title. Tabs in the reference site implement roving tabindex, ArrowLeft/Right, Home, and End. Toasts use a polite live region. Component HTML samples with `data-*` behavior hooks require corresponding application handlers; copying CSS alone does not implement state.

Transitions are 150–200ms. Reduced-motion users get no component animations or transitions. Z-order follows the source: sidebar 10, dialog 30, toast 60. Native dialogs render in the browser top layer independently of numeric z-index; a toast outside an open dialog stays behind it.

## Packaging and boundaries

CSS rules are scoped under `.clarity` (except the additive `.cl-icon` helper and namespaced root variables). Consumers opt in explicitly. No global body margin reset or font download is forced by the library; the example application resets its own body margin. Portal content must be placed in a scoped container. Tokens are JSON grouped values and generated CSS, without a claim of DTCG compliance.

The light theme, source icon data, and key visual measurements are extracted facts. `cl-` naming, structured token groups, typed icon helper, enhanced contrast colors, semantic table, native-dialog implementation, documentation site, and generic behavior demos are Clarity adaptations. Documentation branding is new; SigPro brand assets and product copy are not required by consuming applications.


## v0.2 interaction extensions

The optional `@clarity-design/system/components` module adds ten core custom elements and thirteen HAX-inspired AI elements. Register with `registerClarityElements()` to opt into reusable behaviors. Native switch, radio, date, disclosure, and loading/progress patterns accompany them. These additions are Clarity extensions, not original SigPro components.

See [core component APIs](components.md), [human–AI patterns](hax.md), and the [standalone interactive example](../examples/interactive.html). Existing CSS-only markup continues to work. AI examples use explicit sample data and events; no external model, upload, or execution service is bundled.
