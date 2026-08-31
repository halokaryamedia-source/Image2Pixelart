---
name: web-accessibility-validation
description: Support skill for validating Image2Pixelart semantics, keyboard/focus, dialogs/toolbars/tabs, forms/errors/status, palette and editor operability, zoom/reflow, dragging alternatives, reduced motion, and accessible state communication. Use current WCAG 2.2 and WAI-ARIA/APG as primary guidance, prefer native HTML, and combine source review with real browser/manual proof. Do not make formal compliance claims from automation alone.
---

# Web Accessibility Validation

Use when a bounded change materially affects:

- buttons, toolbars, menus, tabs, popovers, dialogs, or disclosure controls;
- keyboard shortcuts or focus behavior;
- project creation/import forms and validation;
- errors, processing, save state, collaboration/presence, edit-request, or read-only status;
- palette/tool selection and selected/current state;
- canvas selection/edit controls or pointer/drag interactions;
- crop drag/zoom controls;
- responsive/reflow/zoom operability;
- images/icons/media alternatives;
- names, roles, values, states, or live feedback;
- non-essential animation/motion.

This is a support skill, not the visual-art-direction owner. `web-ui-design-development` owns visual craft; this skill owns semantic/operability accessibility and accessibility proof.

## Authority

Use current primary standards/guidance:

```text
W3C WCAG 2.2
→ W3C Understanding/Techniques when clarification is needed
→ WAI-ARIA / ARIA Authoring Practices for custom widget behavior
→ native HTML platform semantics
→ current rendered/browser behavior
```

Third-party checklists are supporting references only.

Do not claim formal WCAG conformance merely because this skill was used or automated checks passed.

## Core rule: native semantics first

Use the native HTML element that already carries the intended meaning and behavior whenever practical.

Examples:

```text
action
→ <button>

navigation
→ <nav> / links

form input
→ <label> + native input/select/textarea

simple disclosure
→ native disclosure pattern when it fits
```

Do not build clickable `<div>`/`span` controls and then recreate native keyboard behavior without a real reason. Use ARIA to fill semantic gaps, not to replace correct HTML.

When a custom widget is genuinely required, follow the relevant APG interaction/state model rather than inventing keyboard behavior ad hoc.

## Keyboard and focus

For affected interactions:

- every required operation must have the accepted keyboard path when keyboard operability is part of the product contract;
- focus order must follow meaningful interaction/read order;
- visible focus must remain clear over the actual surface/background;
- fixed/sticky panels must not hide focused controls;
- avoid positive `tabindex` ordering hacks;
- modal/dialog open and close must manage focus deliberately when the interaction requires it;
- temporary overlays/popovers must not strand focus;
- shortcut handling must not hijack normal typing in inputs/textareas/contenteditable controls;
- viewer/read-only mode must not expose focusable controls that appear operable but cannot act without explanation.

## Editor/tool/palette state

The editor has many stateful controls. Preserve meaning beyond color alone.

As applicable:

- active tool should expose an actual selected/pressed/current semantic that matches the widget pattern;
- selected palette color should remain identifiable by more than swatch color when the UI needs a textual/semantic label;
- disabled versus read-only versus unavailable should not be represented as the same ambiguous grey state;
- destructive actions need clear labels/confirmation where the existing product flow requires it;
- save/processing/error/collaboration transitions that matter to the user should be perceivable without requiring vision of a color change only.

Do not add ARIA state values that do not match real application state.

## Forms and feedback

- visible labels/instructions should describe inputs clearly;
- required/error state must not rely on color alone;
- validation errors should identify the affected field/problem;
- dynamic success/error/save/collaboration status should be announced appropriately when assistive-technology notification is materially required;
- do not disable a submit/action path as a substitute for understandable error guidance unless the existing interaction intentionally requires it.

## Canvas and high-density grid boundary

A pixel editor can contain tens or hundreds of thousands of cells. Do **not** create thousands of hidden DOM controls by reflex merely to claim accessibility.

Instead:

1. identify which canvas operations are actually required for the scoped task;
2. preserve performant canvas rendering;
3. provide/maintain the accepted keyboard/status/coordinate/tool alternatives where they exist or are required;
4. expose meaningful editor state outside the raw cell surface when practical;
5. escalate product-level accessibility decisions if full per-cell navigation would materially change product architecture.

Accessibility does not justify falsifying tile coordinates or degrading core editor performance beyond the accepted product requirement.

## Dragging, pointer, and crop interaction

Where the applicable accessibility contract requires an alternative to dragging/precise pointer movement:

- do not assume mouse drag is the only possible path;
- inspect whether existing buttons, keyboard controls, numeric controls, reset/fit actions, or equivalent operation already provide the needed alternative;
- if no acceptable alternative exists, treat it as a product/interaction requirement rather than inventing a hidden workaround inside styling code;
- do not claim touch/keyboard support that was not actually implemented and tested.

## Reflow, zoom, and responsive operability

- critical controls must remain reachable at the viewport/zoom ranges the product claims to support;
- normal text/control UI should avoid accidental two-dimensional scrolling caused by layout defects;
- inherent canvas panning is distinct from accidental page-level overflow;
- zooming the browser must not make dialogs/actions unreachable;
- visual rearrangement should preserve meaningful reading and focus order;
- do not assume hover exists on touch input.

## Content/media

- content-bearing images require useful alternatives when their content is necessary;
- decorative images/icons should not create redundant screen-reader noise;
- icon-only controls require an accessible name;
- do not fabricate alt text that claims details not known from the actual image/reference.

## Motion

Respect `prefers-reduced-motion` for non-essential motion. Reduced motion must preserve understanding, editing feedback, and task completion.

## Validation workflow

1. Identify the exact semantics/interactions affected.
2. Prefer native HTML before ARIA/custom behavior.
3. Check applicable WCAG 2.2 and APG guidance when needed.
4. Review source names/roles/states, labels, focus logic, status handling, and motion/reflow behavior.
5. Run `npm run check` only when Svelte/static diagnostics can falsify the change.
6. Validate rendered keyboard/focus/reflow/interaction behavior through `browser-runtime-validation` when that behavior is claimed.
7. Use automated accessibility tooling only as supplemental evidence when already available/justified; do not install a test stack merely because this skill exists.
8. Record remaining screen-reader/assistive-technology/human evaluation limits instead of pretending automation proves them.

Automatic CI is currently deferred; accessibility completion depends on the evidence actually gathered, not a workflow badge.

## Do not use this skill to

- create a legal accessibility statement without a real product/legal requirement;
- claim WCAG conformance from source inspection or automated scans alone;
- redesign the visual language merely from personal preference;
- add ARIA where correct native semantics already solve the problem;
- install axe/Pa11y/Playwright or another dependency before a recurring responsibility earns it;
- create thousands of invisible cell controls by default;
- invent labels, states, captions, or behaviors unsupported by the actual product.

## Completion

Accessibility validation is complete for the bounded change when applicable native semantics, names/roles/states, keyboard/focus, forms/status, reflow/dragging/motion requirements are addressed; rendered evidence was used when behavior is claimed; unproven assistive-technology limits are stated; and no unsupported formal conformance claim was made.

Then return to the active development owner and STOP.
