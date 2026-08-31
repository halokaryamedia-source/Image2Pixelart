# Frontend Reference Inventory

Status: current-use catalog

This file records the visual references already present in the repository so UI work can use them deliberately without turning old mockups into hidden requirements.

## Authority boundary

```text
current explicit user direction
→ durable Foundation / approved UI decisions
→ current source + rendered application
→ this reference inventory
→ raw reference files/prompts
```

A reference may influence visual reasoning. It does **not** redefine product mechanics, current feature scope, or application architecture by itself.

When a reference is materially used, classify the relevant rule as:

```text
OBSERVED
INFERRED
ADOPTED
REJECTED
```

Do not combine conflicting alternatives automatically. Pick the reference that solves the current problem.

## Current MIVUBI redesign package

Root: `docs/MIVUBI-UI-UX-Redesign/`

| Reference | Current use | Authority note |
| --- | --- | --- |
| `images/01-home-quick-start-split.png` | **REFERENCE — HIGH** for first-time project creation, immediate dimensions/grid preview, and compact task-first home hierarchy | Alternative Home direction, not automatic current layout requirement |
| `images/02-home-dashboard-first.png` | **REFERENCE — HIGH** for returning-user project continuation, project-card hierarchy, and dashboard density | Alternative to Quick Start Split; do not merge both blindly |
| `images/03-editor-focused-workbench-v2-panel-selector.png` | **REFERENCE — HIGH** for focused editor workbench, canvas priority, panel organization, and dense-but-controlled tool UI | Strong editor reference, but current source/approved behavior remains authority |
| `images/04-editor-canvas-first-studio.png` | **REFERENCE — MEDIUM/HIGH** for canvas-first focus, reduced chrome, and alternative workspace composition | Useful alternative/focus-mode evidence; not permission to hide required tools |
| `references/source-home.jpg` | **SOURCE SNAPSHOT / EVIDENCE** of an earlier Home UI | Historical/reference state, not current source authority |
| `references/source-editor.jpg` | **SOURCE SNAPSHOT / EVIDENCE** of an earlier Editor UI | Historical/reference state, not current source authority |
| `MIVUBI-REDESIGN-PROMPTS.md` | **RATIONALE / REFERENCE** containing design intent and alternative prompts | Treat its old recommendations as evidence unless explicitly re-approved |

## Additional UI/reference images

| Reference | Current use | Authority note |
| --- | --- | --- |
| `docs/home.jpg` | Legacy/current-context visual reference for Home | Supporting evidence only |
| `docs/editor.jpg` | Legacy/current-context visual reference for Editor | Supporting evidence only |
| `docs/building/` | Mosaic/pixel-art construction and output references | Useful for understanding pixel/grid presentation, not application layout authority |

## Principles already adopted into the UI skill

The canonical visual specialist is:

```text
.agents/skills/web-ui-design-development/SKILL.md
```

It adopts these durable reasoning principles from the stronger Hellocraft UI skill while translating them to this application:

1. reference-grounded design instead of generic model taste;
2. `OBSERVED / INFERRED / ADOPTED / REJECTED` reference discipline;
3. `ESTABLISH` versus `ALIGN` visual work modes;
4. compact visual thesis before material visual-system work;
5. design-system discipline without importing another system's identity;
6. explicit component/state coverage;
7. responsive/adaptive composition rather than simple desktop shrinking;
8. purposeful motion and reduced-motion behavior;
9. anti-generic/anti-AI-slop review;
10. rendered browser acceptance for actual visual claims.

Image2Pixelart-specific additions include canvas-first editor density, pixel-grid fidelity, palette/data presentation, collaboration/read-only states, and strict separation between UI presentation and image/grid/project semantics.

## Reference selection by problem

Use only the smallest relevant set:

```text
Home first-use / create-project hierarchy
→ 01 Quick Start Split

Home returning-user/project continuation
→ 02 Dashboard First

Editor panel organization / full workbench
→ 03 Focused Workbench

Editor focus / reduced chrome / canvas priority
→ 04 Canvas-first Studio

Pixel/grid visual fidelity
→ docs/building/ + current MosaicCanvas behavior

Current implementation truth
→ current source + rendered application
```

If two references conflict, record which rule is adopted and which is rejected. Do not use one screenshot as a complete template.

## Do not create reference debt

- Do not add every internet screenshot encountered during a task to the repository.
- Do not install a component/design system merely because a reference resembles it.
- Do not create duplicate redesign packages for each iteration; Git history owns ordinary iterations.
- Promote a reference into durable Foundation policy only when the owner explicitly approves the underlying decision.

Update this inventory only when the current reference set or its authority classification materially changes.
