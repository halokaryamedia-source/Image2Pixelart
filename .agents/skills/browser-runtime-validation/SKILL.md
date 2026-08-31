---
name: browser-runtime-validation
description: Support skill for Image2Pixelart claims that require a real browser: rendered dashboard/editor quality, responsive/adaptive layout, pointer/keyboard interaction, canvas/crop editing, dialogs/downloads, console/runtime behavior, HTTP/WebSocket requests, or browser performance. Prefer Chrome DevTools or another equivalent real-browser capability when available. Source/check/build evidence is prerequisite context, not a substitute for browser proof.
---

# Browser Runtime Validation

Use only when the acceptance claim materially depends on a real browser.

Typical uses:

- actual dashboard/editor rendering;
- canvas painting, selection, pan, zoom, coordinate feedback;
- crop drag/zoom/fit/reset interaction;
- palette/tool selection and visible states;
- project creation/import flow;
- viewer/read-only and collaboration/edit-request UX;
- dialogs, popovers, focus, keyboard shortcuts;
- responsive/adaptive layout;
- export/download UX;
- console/runtime errors;
- HTTP/WebSocket network behavior;
- browser-side performance investigation;
- screenshot/reference comparison.

This is a support/evidence skill. `web-ui-design-development` owns subjective visual craft; `web-accessibility-validation` owns semantic/operability criteria; `cloud-development-validation` owns service/data correctness. Browser tooling supplies evidence to those owners.

## Tool authority

A browser/DevTools interface is a measurement/debugging surface, not project authority.

```text
current requirement
→ current source/build
→ actual browser evidence
→ interpretation by the active UI/accessibility/cloud/development owner
```

Do not let a DevTools suggestion silently redefine product architecture or visual direction.

## Preconditions

- Identify the exact running target (local, preview, staging, production) and do not confuse them.
- Record the exact route/project/state being tested.
- Ensure test data does not expose unnecessary private production content.
- Use the browser capability actually available; do not claim Chrome/DevTools proof if only source inspection exists.

## Basic workflow

```text
open/navigate target
→ wait for relevant state
→ capture structural snapshot when useful
→ reproduce exact interaction/problem
→ inspect only relevant rendered/console/network/performance evidence
→ capture screenshot when appearance itself is being judged
→ compare against acceptance criteria
```

Refresh/re-snapshot when the DOM/state changed materially rather than interacting with stale element references.

## Visual acceptance

For visual claims:

- inspect the actual rendered application, not only CSS declarations;
- test the viewport sizes that can falsify the current claim rather than an arbitrary device list;
- verify hierarchy, overlap, clipping, whitespace/density, focus visibility, panel behavior, dialogs, and long labels/project names;
- inspect the actual application states affected by the task, not only the ideal default state;
- compare adopted reference rules, not every pixel of a reference that was never approved;
- human/user approval remains authoritative for subjective art direction.

### Application state matrix

Select only states relevant to the task. Useful candidates include:

```text
Home
→ loading / project list / empty or error / create/import state

Editor
→ normal editable / viewer-read-only / requesting-edit
→ saved / saving / error
→ source present / no source / stale reconstruction / processing
→ palette empty / populated / selected color
→ panel open/closed
→ modal/crop/settings/export states
→ deleted/restorable project state when affected
```

Do not manufacture test states the product cannot actually enter.

## Pixel/canvas fidelity proof

When the task affects the mosaic canvas or crop/reference presentation, inspect:

- discrete cell boundaries/scale at relevant zoom levels;
- canvas clipping/overflow/panning behavior;
- pointer-to-cell alignment where interaction is claimed;
- selection/hover/coordinate overlay alignment;
- grid/ruler readability without overwhelming the artwork;
- reference image crop/fit behavior;
- whether browser scaling/smoothing creates misleading visual artifacts;
- whether panels/overlays obscure the editing target unexpectedly.

A screenshot can prove appearance but not pointer coordinate correctness by itself; reproduce the actual interaction when that claim matters.

## Keyboard/focus proof

When applicable:

- tab through the affected controls;
- operate the flow using the required keyboard path;
- verify visible focus and sensible focus restoration for dialogs/overlays;
- confirm global shortcuts do not hijack typing fields;
- verify viewer/read-only controls communicate non-operability correctly.

Interpret accessibility acceptance through `web-accessibility-validation`.

## Runtime and console proof

- reproduce the path that triggers the behavior;
- inspect relevant console errors/warnings;
- distinguish application defects from extension/browser/tool noise;
- absence of console errors is not proof that the feature works;
- validate the actual user-visible outcome too.

## Network and WebSocket proof

Use network inspection when the change may affect browser integrations.

Check only what matters, such as:

- failed/unexpected status codes;
- duplicate/excess requests;
- unexpectedly large assets;
- presigned upload requests;
- project save/revision requests;
- reconnect/token/WebSocket behavior;
- cache/loading behavior when relevant.

Network presence does not prove Neon/R2/Durable Object persistence correctness. Pair with `cloud-development-validation` when service state matters.

## Performance proof

Use performance tooling only when performance is part of the acceptance claim or a reproduced defect.

For this product, diagnose the actual bottleneck rather than inventing arbitrary scores:

```text
main-thread painting/input delay
large cell/canvas rendering cost
layout thrash from panels/resizing
image conversion work leaking onto main thread
large asset/network loading
long tasks
memory growth during repeated editing/export
WebSocket/message churn when relevant
```

Do not create permanent budgets without representative evidence and an approved performance requirement.

## Privacy boundary

Do not open unrelated personal/account pages, reveal localStorage device secrets, expose authorization headers, or inspect production/private project data unless the task explicitly requires and authorizes that environment.

Screenshots/logs used as evidence must not unnecessarily capture secrets/private data.

## Relationship to automated E2E

Browser runtime validation is best for exploratory proof, debugging, visual inspection, network inspection, and performance investigation.

Do not treat it as a substitute for future repeatable E2E tests if critical flows later earn an automated regression responsibility. Likewise, do not add Playwright merely because this skill exists.

Automatic CI is currently deferred.

## Completion output

When materially useful, return:

```text
FINDING
TARGET / STATE
PROOF
ACTION
BLOCKER (only when material)
```

Browser validation is complete when the exact relevant browser state/path was reproduced, the required rendered/runtime/network/performance evidence was inspected, evidence was interpreted by the correct owner, and no source-only claim was mislabeled as browser proof. Then return to the active owner and STOP.
