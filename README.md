# Clarity Design System

A reusable, framework-independent design system extracted from **SigPro**. Cool, pale surfaces; cobalt actions; teal accents; compact typography; fine borders; and quiet elevation.

## Preview

```sh
npm run dev
# http://localhost:4173
```

The reference site includes twelve sections: overview, colors, typography, spacing and shape, components, core controls, AI interactions, chat interface, patterns, icons, tokens, and integration. No dependencies or installation are needed to run this repository. Node 20+ is required for the local server and build scripts. Set `PORT` to change the preview port.

## Use in another project

From your application's directory:

```sh
npm install /home/nexus/Projects/clarity-design-system
```

With a CSS-capable bundler:

```js
import '@clarity-design/system/styles.css';
import '@clarity-design/system/fonts.css'; // Optional Google Fonts request
import { icon } from '@clarity-design/system';
```

```html
<div class="clarity">
  <section class="cl-card cl-card__body cl-stack">
    <h2>A clearer starting point.</h2>
    <p class="cl-muted">Shared foundations for your next project.</p>
    <div><button class="cl-btn cl-btn--primary">Create project</button></div>
  </section>
</div>
```

In React use `className` in place of `class`; in Vue and Svelte use normal `class`. There is no framework component runtime. Native markup and your application's state determine behavior. SVG files can be used as assets; the optional `icon()` helper returns an SVG string, not a React element.

For plain HTML, copy `dist/clarity.css` and the desired `src/icons/*.svg` assets into your project. Link the stylesheet and put `.clarity` on the application root. See [examples/basic.html](examples/basic.html). The core CSS makes no network requests. `src/fonts.css` is optional and loads DM Sans and Manrope from Google Fonts; omit it and self-host the fonts (with their license files) or use the provided system fallbacks.

For a portable package, run `npm pack`; install the resulting `.tgz` in the destination project. This package has not been published to npm. The local package name is `@clarity-design/system`.

## Included

- **102 tokens** in editable JSON and generated CSS: semantic colors, typography, spacing, radii, shadows, layout, motion, and layer order.
- **26 original icons**, preserving SigPro's paths, 24px viewBox, 1.65 stroke, round caps, and round joins. Available as individual SVGs, a sprite, and a typed ES module helper.
- **Scoped CSS components**: buttons, icon buttons, cards, metrics, badges, avatars, icon tiles, form fields, search, checkboxes, tabs, alerts, selectable list items, empty states, tables, native dialogs, toasts, sidebar, navigation, breadcrumbs, workflow nodes, and timelines.
- **25 optional web components**: ten core interactive controls, thirteen HAX-inspired AI patterns, and a chat thread, input, and workspace layout with step trails, citations, clarification, and inline approvals. Searchable selection, menus, drawers, tables, file selection, stepper forms, suggestions, evidence, correction, feedback, context, preferences, generation, and action review.
- **Native patterns** for switches, radios, dates, accordions, skeletons, loading states, and progress.
- **Reference site** with live samples, copyable markup, icon and token search, optional enhanced text contrast, and integration instructions.
- **Design documentation** describing source measurements, extraction choices, states, accessibility, and responsive behavior.

## Customize

Load overrides after Clarity's stylesheet. Override tokens on the scope itself, since `.clarity` declares its own defaults:

```css
.my-app.clarity {
  --cl-color-primary: #3463df;
  --cl-color-primary-hover: #2853c5;
  --cl-color-primary-soft: #edf2ff;
  --cl-font-size-body: 14px;
}
```

The original theme is light only. The teal secondary **color** is distinct from the white secondary **button**. No invented dark theme is included.

To make muted and status text darker:

```html
<div class="clarity" data-contrast="enhanced">…</div>
```

The default preserves the source's pale text and small metadata. Enhanced contrast adjusts selected semantic colors; it does not guarantee that every component or downstream composition meets WCAG. Increase small type and target sizes where necessary and verify final combinations.

## Icons

```js
import { icon, iconNames } from '@clarity-design/system';
icon('search'); // Decorative, aria-hidden SVG
icon('search', { label: 'Search', size: 24 }); // Meaningful, named image
```

Give icon-only buttons an `aria-label`; keep their inner icon decorative. The helper escapes labels and custom class names and rejects unknown icon names. It is safe to render its returned markup through your framework's trusted-markup API; do not substitute arbitrary untrusted SVG data.

For the sprite, serve `dist/icons.svg` at a public URL:

```html
<svg class="cl-icon" width="18" height="18" aria-hidden="true">
  <use href="/assets/icons.svg#cl-search"></use>
</svg>
```

## Behaviors

This package supplies styles, icons, and an optional web-component behavior layer. It does not silently attach handlers to your application. To use the interactive components:

```js
import { registerClarityElements } from '@clarity-design/system/components';
registerClarityElements();
```

```html
<div class="clarity">
  <cl-combobox label="Choose a team"></cl-combobox>
  <cl-ai-action-review></cl-ai-action-review>
</div>
```

Configure elements through `.data`, and connect their `cl-*` events to your application. The library does not call models, upload files, execute actions, or persist preferences. See [core component APIs](docs/components.md) (including the [chat interface](docs/components.md#chat-interface)) and [AI interaction contracts](docs/hax.md). Modern browsers with Custom Elements, native dialog, and Popover API support are required.

For the existing CSS-only primitives: Native controls provide input, select, checkbox, validation, and disabled behavior. Use `dialog.showModal()` for dialogs, supply `aria-labelledby`, and retain a visible close action. Keep dialogs and portal mounts inside a `.clarity` ancestor. Tabs need selected state, roving tabindex, arrow/Home/End handling, and linked tab panels. The site demonstrates these in `docs/site.js`; copy/adapt the handlers or use your framework's accessible primitives.

`[aria-pressed="true"]` selects list items and workflow nodes. `[aria-selected="true"]` marks active tabs. `[aria-current="page"]` marks navigation. Use `[aria-invalid="true"]` and `aria-describedby` for errors, `role="status"` for toast announcements, and text labels alongside status colors.

## Maintain & verify

```sh
npm run build  # JSON → src/tokens.css, dist/clarity.css, dist/icons.svg
npm test       # Source fidelity, artifact integrity, safe icon API, package exports
npm pack       # Rebuild and package reusable assets
```

Edit `src/tokens.json` for token changes and `src/components.css` for components, then build. The generated `dist/` assets are included so consuming projects do not need this project's build tooling. Token JSON is a plain grouped key/value format, not a DTCG interchange schema.

See [the design specification](docs/design-system.md) for provenance and the component map.

## Provenance & licensing

Source: `/home/nexus/Projects/SigPro/public/styles.css` and the icon map in `public/app.js`, extracted September 20, 2026. SigPro was read only; no application business logic, data, or workflows are included. `docs/source-inventory.json` records the source hashes used for extraction. No third-party icon dependency is declared by SigPro, so this package does not invent one or claim an icon license. The package is marked `UNLICENSED` for private reuse; establish rights before public distribution. Font binaries are not bundled.

Optional browser regression checks are in `scripts/check-browser.js`. With the preview running on port 4173 and an isolated Chromium debugging session on port 9222, run `node scripts/check-browser.js`. It opens a separate tab, checks all nine pages at 1440/768/390/320px, exercises keyboard tabs, Escape dismissal, notification and filter behavior, and writes screenshots to `/tmp/clarity-desktop.png` and `/tmp/clarity-mobile.png`.

Run `node scripts/check-extended.js` against the same preview/browser ports to verify the new core and AI components, including keyboard controls, validation, cancellation, scoped approvals, and injection resistance.
