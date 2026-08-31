# UI Implementation Plan

Status: current bounded sequence

This plan translates the current UI audit and UI Foundation into a safe implementation order. It is not a promise to execute every item automatically.

Durable direction is owned by `docs/foundation/05-ui-design-system.md`. Current evidence is owned by `docs/knowledge/ui-audit.md`.

## Sequence

### Slice 1 — Home language and hierarchy

Goal:

- remove infrastructure-facing terminology from ordinary project UI;
- visually subordinate device/cloud utility context;
- preserve current Quick Start Split structure.

Likely owners:

- `src/lib/components/HomeView.svelte`;
- supporting Home/project-card components only if needed.

Do not change project/cloud behavior.

### Slice 2 — shared UI role cleanup

Goal:

- reduce repeated raw visual values only where a durable semantic role is proven;
- preserve MIVUBI brand palette;
- clarify typography/control-size roles.

Likely owners:

- `src/lib/styles/global.css`;
- affected component-local styles.

Do not create a large token framework or theme registry.

### Slice 3 — Editor header hierarchy

Goal:

- preserve all existing header capability;
- reduce competition among project context, collaboration, panel/help utilities, format selection, and Export;
- keep Export as the strongest header action.

Likely owner:

- `src/lib/components/EditorView.svelte`.

### Slice 4 — Editor density and terminology

Goal:

- improve critical type/control readability;
- reserve tiny text for non-critical metadata;
- normalize Indonesian user-facing tool terminology;
- reduce redundant panel naming.

Likely owner:

- `src/lib/components/EditorView.svelte`.

### Slice 5 — Editor panel/context consistency

Goal:

- strengthen active/selected/disabled/locked states;
- keep quick palette as fast switching only;
- keep right panel as management/detail;
- keep context bar state-driven.

Likely owners:

- `EditorView.svelte`;
- `CollaborationBar.svelte` only if collaboration presentation is affected.

### Slice 6 — adaptive Editor layout

Goal:

- preserve canvas usability on constrained laptop/tablet-like widths;
- prefer panel collapse/one-panel-at-a-time/overlay behavior before squeezing the canvas below useful size.

This slice requires real browser viewport validation.

### Slice 7 — viewer/collaboration visual states

Goal:

- make editable/viewer/requesting-edit/disconnected/saving/error state visibly distinct and understandable;
- preserve actual authorization behavior as server/source authority.

This slice requires browser proof and may require cloud/realtime proof only if behavior, not presentation, changes.

## Execution rule

Implement one bounded slice at a time.

```text
explicit user approval / requested slice
→ development-brief
→ UI Foundation
→ current owner
→ smallest complete source change
→ Svelte validation
→ accessibility/browser proof when the changed claim requires it
→ STOP
```

Do not start the next slice automatically after completing one.