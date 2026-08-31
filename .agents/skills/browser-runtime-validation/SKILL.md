---
name: browser-runtime-validation
description: Support skill for Image2Pixelart claims that require a real browser: rendered layout, responsive behavior, pointer/keyboard interaction, crop/canvas editing, downloads, console errors, network requests, or browser performance. Source/build checks are prerequisites, not substitutes.
---

# Browser Runtime Validation

Use only when the acceptance claim requires a real browser.

Examples:

- canvas painting, selection, pan, zoom;
- crop drag/zoom/fit;
- project-create/upload flow;
- palette/tool interaction;
- editor viewer/read-only behavior;
- dialogs/keyboard shortcuts/focus;
- responsive layout;
- export/download UX;
- console/runtime errors;
- browser HTTP/WebSocket network behavior;
- performance investigation.

## Preconditions

Use the correct running application target and record the path/state being tested.

Static source and `npm run build` do not prove rendered behavior.

## Procedure

1. run/identify the intended application target;
2. reproduce the exact user flow/state;
3. inspect only evidence relevant to acceptance:
   - screenshot/rendered state;
   - DOM/accessibility snapshot;
   - keyboard/pointer interaction;
   - console;
   - network/WebSocket;
   - performance trace when performance is the claim;
4. compare to explicit acceptance criteria;
5. return exact finding and remaining proof gap.

## Network/cloud boundary

A browser request reaching an endpoint does not automatically prove database/R2/Durable Object correctness. Pair with `cloud-development-validation` when service state is material.

## Completion output

```text
FINDING
TARGET/STATE
PROOF
ACTION
BLOCKER
```

Omit `BLOCKER` when none. Do not broaden the product or architecture from browser observations alone.
