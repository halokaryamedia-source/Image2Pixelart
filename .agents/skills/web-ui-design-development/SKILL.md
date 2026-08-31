---
name: web-ui-design-development
description: Image2Pixelart visual/frontend specialist for editor and dashboard hierarchy, canvas-first composition, interaction states, responsive layout, typography, and MIVUBI visual consistency. Use only when visual craft is material; do not redefine product mechanics or cloud architecture.
---

# Web UI Design Development

Use when the task materially depends on visible hierarchy, composition, spacing, typography, responsive behavior, interaction states, editor focus, or fidelity to an approved visual direction.

## Authority

```text
explicit current user direction
→ durable product/UI boundaries
→ current implemented UI
→ explicitly approved design/reference
→ other reference mockups as evidence only
```

Existing `docs/MIVUBI-UI-UX-Redesign/` files are reference material. They do not become current requirements simply because they are polished or newer-looking.

## Current product visual principles

Preserve unless explicitly changed:

- canvas/editor work area is the primary visual focus inside the editor;
- controls should remain discoverable without overwhelming the canvas;
- green is the primary action family; mustard/gold is accent/status rather than competing primary action;
- MIVUBI brand assets/palette remain intentional;
- physical grid dimensions and mosaic content must remain readable;
- destructive actions should not dominate normal workflows;
- dense editor controls still require usable targets, readable labels, and clear states.

## Workflow

1. identify the exact user task and affected screen/state;
2. distinguish product behavior from visual presentation;
3. inspect current component/layout and approved reference if one is explicitly in scope;
4. define 2–5 visible acceptance criteria;
5. implement through current Svelte/component owners;
6. use `svelte-development-validation`;
7. use `web-accessibility-validation` when semantics/keyboard/focus/reflow are affected;
8. use `browser-runtime-validation` for rendered acceptance.

## Guards

Do not:

- invent new product flows, service architecture, persistence behavior, or project semantics to make the layout cleaner;
- remove a feature solely because the current UI is crowded;
- add UI libraries/dependencies without normal architecture review;
- copy generated reference text/controls blindly;
- declare visual completion from source inspection alone when rendered acceptance matters;
- change image/grid math while styling the editor.

## Completion

A visual change is complete only when the scoped visual criteria are satisfied in actual rendered evidence when that evidence is available/required, while product semantics remain owned by their canonical source.
