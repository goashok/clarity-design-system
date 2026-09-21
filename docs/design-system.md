# Clarity design specification

## Visual principles

Clarity's visual hierarchy is built through spacing, font weight, and lightly tinted surfaces. Blue identifies actions and selections. Teal supports positive outcomes. Amber, red, olive, and purple carry contextual meaning, paired with words. Shadows separate surfaces very subtly; borders do most of the structural work.

Clarity is plain HTML, CSS, and JavaScript with no UI or icon package dependencies. Recurring values are named tokens with a `--cl-` prefix, so projects share one vocabulary instead of copying stylesheets.

## Color foundations

| Role | Value | Usage |
| --- | --- | --- |
| Primary | `#3463df` | Primary buttons, brand mark, selected accents |
| Primary hover | `#2853c5` | Primary button hover |
| Primary soft | `#edf2ff` | Active navigation |
| Supporting teal | `#268b77` | Positive outcomes and secondary accents |
| Canvas | `#f7f8fa` | Application background |
| Surface | `#ffffff` | Sidebar, cards, panels, dialogs |
| Text | `#253249` | Body and page heading |
| Muted | `#7b8596` | Metadata and supporting text |
| Border | `#e6eaf0` | Structural borders and dividers |
| Card shadow | `0 2px 5px #1a304505` | Cards and outlined buttons |
| Selection | `#f6f9ff`, `#bed0fa` | Selected card background and border |

Secondary buttons use white backgrounds, `#dfe4ed` borders, and `#647086` text. They do not use the teal supporting accent. A few component-specific neutral shades sit alongside the semantic tokens. The token JSON is the definitive catalog.

## Typography

DM Sans provides body, labels, controls, metadata, and button text. Manrope provides headings, brand text, and metrics. Preserve variable weights; synthesized browser weights are disabled.

| Role | Size | Typical weight | Notes |
| --- | --- | --- | --- |
| Page title | 27px | 750 | 1.4 line height, −1px tracking |
| Metric | 30px | 650 | 1.4 line height |
| Dialog heading | 23px | 750 | Dialog titles |
| Detail title | 18px | 700 | 1.5 line height, −0.45px tracking |
| Section | 14px | 750 | Compact panel headings |
| Body | 13px | 400 | Default interface text |
| Supporting body | 12px | 400 | Introductions and descriptions |
| Control label | 11px | 500–550 | Buttons, fields, forms |
| Small text | 10px | 400–500 | Descriptions and list metadata |
| Caption | 9px | 400–650 | Labels and metadata |
| Micro | 8px | 400–650 | Dense annotations |

Brand text and very small badge labels are set per component and are not typography roles. The reference site introduces larger 35px promotional type only for its overview hero; this is documentation styling, not the application page-heading token.

## Spacing and shape

Clarity is not a strict 4px grid: component measurements such as 9, 13, 19, and 22px are deliberate. The named spacing palette runs from 0 to 64px, and the larger 40, 48, and 64px steps are for page composition.

Controls: 5–6px radius. Badges: 4px. Navigation: 7px. Cards and nodes: 9px. Library cards: 12px. Dialogs: 14px. Avatars: circular. Borders are generally 1px. Selected records add a 3px inset blue left edge. A selected node gets a pale 3px outer ring.

## Responsive layout

| Width | Behavior |
| --- | --- |
| Above 1200px | 238px sidebar, 73px topbar, 35px horizontal page padding |
| At 1200px | Page insets reduce to 24px |
| At 1000px | Sidebar reduces to 185px |
| At 700px | Sidebar becomes a 64px icon rail, topbar is 60px, page insets are 16px |

The documentation also stacks its own two-column samples at 800px. Tables and workflow canvases scroll locally; page layouts should not overflow horizontally. The chat workspace responds to its container width instead (see [components.md](components.md#chat-interface)).

## Component map

| Clarity API | Purpose | Notes |
| --- | --- | --- |
| `.cl-btn` with `--primary`, `--secondary`, `--ghost`, `--danger`, `--compact` | Actions | One primary action per context |
| `.cl-icon-btn` | Icon-only actions | Always give an `aria-label` |
| `.cl-card.cl-stat` | Metrics | Label, value, and note slots |
| `.cl-card` with `__header`, `__body`, `__footer` | Panels | General panel structure |
| `.cl-badge--danger/warning/medium/success/info/purple` | Status | Pair color with a text label |
| `.cl-avatar`, `.cl-icon-tile` | People and categories | |
| `.cl-field`, `.cl-input`, `.cl-select`, `.cl-textarea` | Forms | Explicit native label and control associations |
| `.cl-search` | Search input | Focus-within ring |
| `.cl-tabs`, `.cl-tab[aria-selected]` | Tabs | State expressed semantically |
| `.cl-alert` and variants | Status messages | |
| `.cl-list-item[aria-pressed]` | Selectable records | Selected card with an inset accent |
| `.cl-empty` | Empty states | Helpful message and next action |
| `.cl-table` | Tabular data | Semantic table |
| `<dialog class="cl-dialog">` | Dialogs | Native modal behavior |
| `.cl-toast` | Notifications | Polite live region |
| `.cl-sidebar`, `.cl-topbar`, `.cl-nav-item` | App shell | Independent of product routes |
| `.cl-node`, `.cl-canvas` | Workflow diagrams | Visual building blocks only |
| `.cl-timeline` | Activity and evidence | Semantic ordered list |

Workflow execution, node dragging, edge routing, and persistence are application concerns and not part of the design system. The pattern examples are compositions, not a workflow application.

## Icons

26 inline SVGs: grid, inbox, network, radio, briefcase, layers, sparkles, check, chart, users, clipboard, landmark, globe, mail, search, arrow, chevron, plus, close, play, clock, settings, book, bell, download, trash.

24 × 24 viewBox; no fill by default; currentColor stroke; 1.65 stroke width; rounded caps and joins. The settings icon uses filled circles. Default display size is 18px, buttons use 15px, and metadata often uses 12–14px. The icons are custom SVGs and do not depend on an icon library.

## State, accessibility, and motion

Preserve focus rings, disabled controls, pointer hover, selected states, and invalid state treatment. Status labels must not rely on color alone. Use native input labels and descriptions. Keep keyboard order consistent with reading order. Icon rail links keep accessible labels when their visible text is hidden.

The default 8–11px pale metadata and several status colors have insufficient contrast for normal text, so the default theme is not an accessibility guarantee. `data-contrast="enhanced"` changes muted and badge/status colors; some literal component colors remain, so audit each actual composition. Larger text and touch targets may be appropriate. The CSS foundation uses compact control dimensions and is not a touch-first layout.

Dialogs use `showModal()`, native focus containment, Escape dismissal, and a labeled title. Tabs in the reference site implement roving tabindex, ArrowLeft/Right, Home, and End. Toasts use a polite live region. Component HTML samples with `data-*` behavior hooks require corresponding application handlers; copying CSS alone does not implement state.

Transitions are 150–200ms. Reduced-motion users get no component animations or transitions. Z-order: sidebar 10, dialog 30, toast 60. Native dialogs render in the browser top layer independently of numeric z-index; a toast outside an open dialog stays behind it.

## Packaging and boundaries

CSS rules are scoped under `.clarity` (except the additive `.cl-icon` helper and namespaced root variables). Consumers opt in explicitly. No global body margin reset or font download is forced by the library; the example application resets its own body margin. Portal content must be placed in a scoped container. Tokens are JSON grouped values and generated CSS, without a claim of DTCG compliance.


## v0.2 interaction extensions

The optional `@clarity-design/system/components` module adds ten core custom elements and thirteen HAX-inspired AI elements. Register with `registerClarityElements()` to opt into reusable behaviors. Native switch, radio, date, disclosure, and loading/progress patterns accompany them.

See [core component APIs](components.md), [human–AI patterns](hax.md), and the [standalone interactive example](../examples/interactive.html). Existing CSS-only markup continues to work. AI examples use explicit sample data and events; no external model, upload, or execution service is bundled.
