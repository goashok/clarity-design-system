# Human–AI interaction patterns

Clarity v0.2 adds all thirteen AI patterns proposed during the design-system review. They follow the existing SigPro-derived light theme and use ordinary controls with explicit state and behavior.

Microsoft's HAX Toolkit provides research-backed interaction guidelines and UI-independent design patterns. It is not a prescribed widget library or a certification. These components are **Clarity's interpretation**. Product teams must still evaluate appropriateness, model behavior, data quality, permissions, accessibility, social norms, and bias for their use case.

References:

- [Microsoft HAX Guidelines](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/)
- [18-guideline reference](https://www.microsoft.com/en-us/research/uploads/prod/2019/03/AI_Guidelines_Poster_PrintQuality.pdf)
- [HAX design patterns and implementation scope](https://www.microsoft.com/en-us/haxtoolkit/design-patterns/)

## Inventory and interaction contracts

| Element | HAX mapping | States, user control, and event |
| --- | --- | --- |
| `cl-ai-capability` | G1–2 | Capabilities, limitations, quality caveat, prompt examples; `cl-invoke {prompt}` |
| `cl-ai-suggestion` | G3–4, G7–9 | Review → editing / accepted / dismissed; undo returns to review; `cl-suggestion {action,text}` |
| `cl-ai-clarification` | G2, G10 | Ambiguity explanation, choices or free text, validation, skip; `cl-clarify {answer}`, `cl-dismiss {}` |
| `cl-ai-evidence` | G11 | Explanation, expandable inputs, provided / conflicting / unavailable sources, empty evidence state |
| `cl-ai-correction` | G9 | Original and editable revision; apply, restore, undo last change; `cl-correction {action,text}` |
| `cl-ai-feedback` | G15–16 | Claim-level reasons, optional detail, validation, effect disclosure; `cl-feedback {claimId,reasons,detail}` |
| `cl-ai-context` | G12 | Recent requests and selected documents; reference, remove, clear, empty state; `cl-reference {id}`, `cl-context-change {items}` |
| `cl-ai-preferences` | G13, G17 | Assistance, personalization, context scope; `cl-preferences {assistance,personalize,scope}` |
| `cl-ai-change-notice` | G14, G18 | Change and impact disclosure; acknowledge once; `cl-acknowledge {id}` |
| `cl-ai-composer` | Practical extension | Suggested prompts, required input, 4000-character limit, selected context, files; `cl-request {prompt,context,files}` |
| `cl-ai-generation` | Practical extension | idle / waiting / generating / complete / interrupted / incomplete / failed; `cl-stop {}`, `cl-retry {}` |
| `cl-ai-action-review` | Practical extension | Pending, approved, rejected; adjustable action scope, reject, review again; `cl-decision {decision,ids}` |
| `cl-ai-execution` | Practical extension | Application-supplied pending / running / complete / failed / skipped steps; `cl-retry-step {id}` only for retryable failures |

The HAX numbers identify relevant guidelines; they do not assert complete implementation of every guideline. G5–6 (social norms and bias) need content, research, evaluation, and model practices in addition to interface controls. Evidence explanations summarize relevant inputs and sources; do not display private model reasoning or present generated explanations as proof.

## Configure and connect

Load the styles and register components as described in [components.md](components.md). Full property types are in `src/components.d.ts`. The reference site's sample fixtures are in `docs/extended.js` and are not default application data.

```js
const generation = document.querySelector('cl-ai-generation');
generation.data = { state: 'waiting', note: 'Processing the documents you selected.' };
// Update from actual service events, rather than a timer:
generation.data = { state: 'generating', text: partialOutput };
generation.data = { state: 'complete', text: finalOutput };
generation.addEventListener('cl-stop', () => requestController.abort());
```

Use a request identifier to ignore late output after cancellation or after a newer request starts. Preserve prompt, partial output, and attachments across recoverable failures. Avoid announcing every streamed token: the component announces status while output remains a separate inspectable region. Replacing `.data` rerenders; batch streaming updates and avoid moving focus while users inspect output. The demo uses labeled, local timers to show state transitions; the library does not simulate a service automatically.

```js
const review = document.querySelector('cl-ai-action-review');
review.data = {
  title: 'Review proposed actions',
  consequence: 'Publishing makes the draft visible to all workspace members.',
  actions: [{ id: 'publish', label: 'Publish draft', detail: 'Destination: selected workspace' }]
};
review.addEventListener('cl-decision', ({ detail }) => {
  if (detail.decision === 'approve') {
    // Validate identity, permissions, approved scope, and idempotency in your service.
    // Execute only the selected IDs; report results through cl-ai-execution.
  }
});
```

Approval and execution are separate. The review component never claims an approved action succeeded. Retrying should not repeat already-completed external actions. Treat application event handlers as requests and independently validate authorization at the service boundary.

## Data and state requirements

- **Capability:** supply accurate capabilities and measured limitations. Default copy is illustrative. Do not invent accuracy percentages.
- **Suggestion:** use `.data {title,text,context}`; local edits and decision state are retained. Undo emits an event; your app must undo any resulting application change.
- **Clarification:** supply `{title,reason,options}`. A free-text response takes precedence over a selected option. No answer is silently inferred.
- **Evidence:** supply `{title,summary,inputs,sources}`. Each source may include `{title,url,excerpt,state,date}`. Missing sources produce an explicit unverified state. An unavailable source has no active link. Source relationships and conflicts must come from your data, not UI guesswork.
- **Correction:** supply `{original,proposed,title}`. The comparison is side-by-side text, not a token-level diff engine. Undo is one step; keep version history in the application when needed.
- **Feedback:** supply `{claimId,claim,title,consequence}`. Explain the real retention/use policy in `consequence`. The built-in demo truthfully says no model is trained.
- **Context:** supply `{items:[{id,label,detail}]}` with unique IDs. Removing a displayed context item is not deletion of backend data. Apply exclusions to the next model request.
- **Preferences:** supply `{assistance,personalize,scope}`. Changes emit a save request; persistence and access restrictions must be enforced by the application.
- **Change notice:** supply `{id,title,description,impact}`. Store acknowledgment in the application if it should persist.
- **Composer:** supply `{context:string[],suggestions:string[]}`. Attachments are local `File` objects. Validate them and use your upload policy before including content in model requests.
- **Generation:** controlled `.data {state,text,error,note}`. Do not report complete until the request actually completes. The interrupted and incomplete states preserve useful partial text.
- **Action review:** supply the specific affected items, destinations, and consequences. The component emits selected action IDs; never execute unchecked actions. Use a new instance for a new proposal.
- **Execution:** supply `{title,note,steps:[{id,label,state,detail,retryable}]}`. Display factual service events and outcomes; do not substitute speculative reasoning traces.

Editable components maintain session-local state. Configure them before mounting; replace the element for an unrelated record to avoid carrying over local edits. None of these components stores content, persists preferences, or sends data automatically.

## Accessibility and review

Components use native buttons, form labels, fieldsets, focusable disclosures, status messages, and text labels alongside color. The default SigPro palette has known small-text contrast limitations; AI body/help text uses stronger neutral colors, but downstream combinations still need review. Test keyboard order, zoom, screen reader announcements, error recovery, and touch target sizes in the actual product.

Pattern coverage is not a claim of HAX or WCAG compliance. The reference examples demonstrate component behavior using invented project data, with all external execution clearly labeled as simulation.
