---
name: web-accessibility-validation
description: Support skill for Image2Pixelart semantics, keyboard/focus, forms/errors/status, reflow, interaction names/roles/values, and editor accessibility. Apply when affected behavior is material; automation supplements but does not prove complete accessibility conformance.
---

# Web Accessibility Validation

Use when a change materially affects:

- buttons/menus/toolbars/dialogs;
- keyboard shortcuts or focus;
- project creation forms;
- errors, save state, collaboration/presence status;
- palette/tool selection;
- selection/canvas controls;
- responsive/reflow behavior;
- images/media alternatives;
- names, roles, values, or live status.

## Authority

Use native HTML semantics first, then applicable current WCAG/WAI-ARIA guidance, then current source/runtime evidence.

Do not use ARIA to recreate native behavior that a native element already provides.

## Validation path

```text
source semantics
→ keyboard/focus reasoning
→ npm run check
→ real browser keyboard/rendered proof when behavior is claimed
```

Check as applicable:

- control has an accessible name;
- interactive element uses correct native semantics;
- focus is visible and not trapped/lost unexpectedly;
- keyboard path can reach/operate the control;
- dialog open/close restores sensible focus;
- error/save/collaboration states are perceivable beyond color alone where required;
- disabled/read-only/viewer state remains understandable;
- labels and inputs are associated;
- zoom/reflow does not make critical controls unusable;
- color contrast remains appropriate for content/controls;
- pointer-only gestures have an accessible alternative where the product requires keyboard operability.

## Canvas boundary

A complex canvas/pixel editor may not map every individual cell to DOM accessibility semantics efficiently. Do not create thousands of hidden controls by reflex.

Instead identify the actual required alternative interaction/feedback contract for the task and preserve performance. Escalate product-level accessibility decisions when needed rather than inventing them inside a local fix.

## Claims

Automated tools and source inspection are partial evidence. Do not claim formal WCAG conformance or complete assistive-technology acceptance without appropriate human/runtime evaluation.

Return findings to the active owner and STOP.
