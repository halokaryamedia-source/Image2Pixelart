---
name: web-ui-design-development
description: Image2Pixelart visual/frontend specialist for dashboard and editor UI. Use when visual hierarchy, reference analysis, workspace composition, typography, spacing, color/tokens, responsive behavior, interaction states, motion, pixel-grid presentation, or rendered acceptance materially determine correctness. Use with development-brief for substantial UI work. Do not redefine image/grid math, project semantics, persistence, cloud architecture, or product behavior merely to simplify the interface.
---

# Web UI Design Development

Own the recurring visual-design and frontend-craft boundary for MIVUBI Mosaic Plan / Image2Pixelart.

This skill exists so the product UI is not improvised from generic model defaults. It translates approved product behavior, MIVUBI visual identity, current source, and relevant references into a coherent application surface, then judges the result in the rendered browser when visual correctness is claimed.

`AGENTS.md` owns routing. `development-brief` owns the bounded implementation contract. Foundation owns product meaning. Current source owns implemented behavior. This skill owns visual judgment and rendered visual acceptance only.

## Use when

Use this specialist when the active task materially involves one or more of:

- dashboard/home hierarchy or project-card presentation;
- editor workspace composition and canvas prominence;
- panel density, control grouping, progressive disclosure, or information hierarchy;
- analysis/reconciliation of MIVUBI redesign screenshots or other UI references;
- typography, spacing, layout grid, color, surface, borders, elevation, icon treatment, or durable visual tokens;
- palette/tool appearance and visible interaction states;
- responsive/adaptive composition across materially different viewport sizes;
- crop/editor/modal presentation;
- collaboration/presence/read-only visual states;
- motion, feedback, transitions, or micro-interactions;
- visual accessibility such as contrast, focus visibility, and state distinction;
- rendered visual review, regression diagnosis, or reference comparison.

## Do not use when

Do not use this specialist to decide:

- physical canvas or tile math;
- palette slot semantics or project schema;
- image-analysis/conversion algorithms;
- autosave/revision/editor authorization behavior;
- Neon/R2/Worker architecture;
- API contracts;
- export content correctness;
- deployment/provider choices;
- new product flows that are not already approved.

If a cleaner layout would require changing one of those, return the decision to its canonical owner instead of hiding the behavior change inside UI work.

## Authority and reference precedence

Use the nearest current authority for each claim:

1. current explicit user direction;
2. durable product/UI decisions in Foundation;
3. approved MIVUBI brand assets and explicitly approved visual references;
4. current source + rendered behavior for the existing application;
5. `docs/knowledge/frontend-reference-inventory.md`;
6. external design-system/pattern references for bounded evidence only;
7. generic model taste last.

A reference is evidence, not policy. The existing `docs/MIVUBI-UI-UX-Redesign/` package contains useful alternatives, but no screenshot becomes a current requirement merely because it is polished, newer-looking, or labeled recommended inside an old prompt.

## Core principle: reference-grounded, not reference-copied

When references matter, classify every material visual rule as:

```text
OBSERVED
→ directly visible/verifiable in the reference

INFERRED
→ likely design intent, but not directly proven

ADOPTED
→ intentionally chosen because it serves the current product goal

REJECTED
→ deliberately not carried over because it conflicts with current behavior, usability, accessibility, performance, MIVUBI identity, or scope
```

Do not average conflicting references into a vague middle design. Decide which reference solves which problem.

## Two working modes

### ESTABLISH

Use only when the affected application surface has no coherent approved visual language and the user has authorized visual-direction work.

```text
product meaning + MIVUBI identity + current constraints + relevant references
→ compact visual thesis
→ minimum shared rules/tokens
→ implementation/prototype
→ rendered review
```

Do not invent product structure while establishing visual language.

### ALIGN

Use when the current application already has a coherent direction.

```text
current visual owner + current problem/reference
→ preserve identity
→ correct hierarchy/consistency/responsiveness
→ minimum complete implementation
→ rendered review
```

Most bounded editor/dashboard work should be `ALIGN`. Do not redesign the whole application because one panel or dialog is weak.

## Visual thesis

Before a material visual-system change, establish the smallest useful thesis internally. Cover only dimensions that can change the result:

```text
Hierarchy
→ what the user must notice first, second, third

Composition
→ canvas/workspace proportion, panel placement, rhythm, whitespace, density

Typography
→ semantic roles, scale relationships, readability, label density

Color/material
→ MIVUBI neutral/accent roles, surfaces, borders, elevation, selected/active states

Data/media
→ pixel grid, reference image, thumbnails, palette swatches, previews

Interaction
→ hover/focus/pressed/selected/loading/saving/error/read-only feedback and motion character
```

Do not turn this into a questionnaire when the current source and references already answer the question.

## Product-specific composition priorities

### Editor

The editor is a workbench, not a marketing page.

Prioritize:

1. the mosaic canvas / current editing target;
2. the active tool/color and immediate editing feedback;
3. controls needed for the current task;
4. project/save/collaboration state;
5. secondary configuration/export/reference management;
6. decorative polish.

Guards:

- do not let persistent chrome consume the workspace without a demonstrated reason;
- do not hide a primary editing action behind multiple menus merely to make the screen look minimal;
- do not show every secondary setting permanently merely because space exists;
- panel collapse/visibility must not cause unexpected canvas jumps or lost state;
- read-only/viewer mode must look intentionally non-editable rather than merely disabled at random;
- collaboration status should be visible enough to prevent mistaken ownership without dominating normal editing;
- selection, active tool, active palette color, stale reconstruction state, processing, save state, and errors must remain distinguishable when those states actually exist.

### Dashboard / project entry

Prioritize:

1. starting or continuing a project;
2. project identity and meaningful preview;
3. physical/grid summary needed to choose correctly;
4. secondary device/import/delete actions.

Do not create a giant decorative hero that pushes the actual project task below the fold without a current reason.

## Pixel-grid fidelity boundary

The UI surrounds project data; it must not visually falsify that data.

- Preserve crisp/discrete cell presentation where the canvas intends pixel fidelity.
- A visual effect must not make one cell appear to span multiple logical cells or obscure cell boundaries when grid accuracy is needed.
- Zoom/fit styling must not change project dimensions or tile math.
- Palette swatches must represent the actual project color values; styling may frame them but must not silently alter the stored color.
- Reference-image smoothing/cropping treatment is separate from the resulting mosaic cell data.
- Grid overlays, rulers, coordinates, selection rectangles, and hover states must remain legible without becoming stronger than the artwork itself.

## Design-system discipline without bureaucracy

Separate three useful dimensions:

```text
MEASURABLE SYSTEM
→ semantic color roles, type roles, spacing rhythm, layout, shape, elevation, motion, component states

QUALITATIVE STYLE
→ calm/dense/editorial/technical character, MIVUBI identity, canvas-first composition, imagery treatment

SPECIAL EFFECTS
→ unusual blur, animated textures, heavy motion, shader/WebGL effects, custom cursors, decorative canvas effects
```

Create durable shared tokens only when a repeated responsibility justifies them. Do not centralize every one-off pixel value.

Prefer semantic role names over arbitrary names, for example:

```text
surface-canvas
surface-panel
text-muted
accent-primary
state-warning
focus-ring
```

Do not copy exact token values from Material, Primer, Carbon, Spectrum, or another design system as project defaults. Use mature systems only to study state completeness, semantics, spacing discipline, and accessibility.

## Composition and density

The application should communicate before it decorates.

- Group controls by user task, not by implementation file.
- Use spacing to clarify groups; do not compensate for weak hierarchy with excessive borders/cards.
- Dense tool areas may be compact, but labels, selected states, and targets still need to be usable.
- Repetition is correct only when the underlying relationship repeats.
- Avoid nesting card inside card inside card when simple grouping is enough.
- Avoid turning every option into a pill/chip if a normal control communicates more clearly.
- Keep destructive actions visually subordinate until the user is actually in a destructive decision.

## Typography

Typography is functional infrastructure in an editor.

- establish semantic roles instead of arbitrary one-off sizes;
- preserve readable label/body text at normal browser zoom;
- keep numeric dimensions/coordinates easy to scan without turning the whole UI into monospace;
- support real Indonesian/English label lengths and project names rather than idealized short copy;
- do not mix font families merely to manufacture personality;
- verify actual loading/weights/rendering before treating a font choice as production-ready;
- avoid oversized headings that compete with the canvas or project task.

## Color, surface, shape, elevation

Use a small coherent language.

- Forest/brand green remains the primary action family unless current authority changes it.
- Mustard/gold is an accent/status family, not a second competing primary action by default.
- Surface elevation should communicate layering such as panel/dialog/popover, not generic polish.
- Radius/border/shadow patterns should be consistent enough to communicate relationships.
- Do not stack glow + blur + gradient + border + shadow + noise on routine controls.
- Important state differences must survive without color alone when semantics require another cue.

## Components and visible states

Create a shared component only when there is a real reusable visual/interaction responsibility.

For each affected interactive component, handle only states that can actually occur, such as:

```text
default
hover
focus-visible
active / pressed
selected / current
loading / processing
saving / saved
success
warning / stale
error
disabled
read-only / viewer
requesting-edit
```

State appearance must match real behavior. This skill does not invent runtime states merely to complete a design-system checklist.

Use one coherent icon language when icons are needed. Do not add decorative icons where text/color/position already communicates clearly.

## Responsive/adaptive craft

Responsive design is composition, not a desktop layout squeezed smaller.

- treat the current editor as desktop/workspace-first unless product requirements explicitly require full mobile editing parity;
- preserve hierarchy and critical actions across the viewport ranges that are actually supported;
- use content-driven breakpoints where practical;
- prevent horizontal overflow, clipped labels, inaccessible off-screen actions, and accidental panel overlap;
- reconsider panel behavior when width changes instead of only stacking columns mechanically;
- test long project names, long labels, empty states, full palette states, and modal content;
- do not assume hover exists on touch input;
- preserve logical reading/focus order when visual layout changes;
- do not claim mobile support beyond what was actually accepted and tested.

## Accessibility is part of visual quality

For affected surfaces:

- keep focus visibly distinguishable;
- maintain readable text/background contrast;
- do not use color alone for critical selection/error/read-only distinctions;
- keep interactive targets understandable and practically operable;
- preserve semantic reading order independent of visual rearrangement;
- do not hide critical information only behind hover;
- respect reduced-motion preferences for non-essential motion.

`web-accessibility-validation` owns semantic/operability acceptance when that boundary is material.

## Motion and interaction craft

Motion needs a job. Valid purposes include:

```text
feedback
orientation
attention
continuity
state transition
```

If it serves none of these, omit it.

- editing feedback should feel immediate;
- panel/dialog transitions should orient without delaying the task;
- saving/processing motion must not imply progress that is not real;
- avoid moving the canvas or controls gratuitously while the user is aiming/painting;
- ambient motion must never compete with the mosaic artwork;
- reduced-motion behavior must preserve comprehension and operation;
- use native CSS/Svelte capabilities before adding a motion library.

## Stack and dependency neutrality

Use the current Svelte/SvelteKit stack and existing dependencies first.

Do not silently introduce Tailwind, a component kit, icon package, animation library, canvas framework, or design-system dependency merely because a reference demonstrates it.

Before adding any UI dependency, establish:

```text
what concrete recurring problem does it solve?
why is current Svelte/CSS insufficient?
what bundle/maintenance/accessibility cost does it add?
can the same accepted result be achieved directly?
```

## Anti-generic / anti-AI-slop review

Challenge common model defaults before accepting a visual change:

- generic purple/blue gradients or glows with no MIVUBI reason;
- glassmorphism used as shorthand for modern;
- excessive pills, cards, rounded boxes, soft shadows, and badges;
- bento layouts where the tasks do not naturally form cards;
- decorative metrics/status chips with no user decision attached;
- huge hero typography in a productivity application;
- random serif/mono mixing for fake creative personality;
- animation on every hover;
- hiding useful controls to manufacture minimalism;
- duplicating the same action in several visual treatments;
- copying one redesign mockup so literally that current behavior is lost;
- inventing labels/content/features to fill visual space;
- installing a large component kit instead of designing the few controls actually needed.

A conventional solution is acceptable when it is the clearest solution. Anti-generic does not mean forcing novelty.

## Procedure

1. **Ground the boundary.** Read the development brief when non-trivial, affected Foundation owner, current component/source, and only relevant reference material.
2. **Choose ESTABLISH or ALIGN.** Do not broaden local polish into application-wide redesign.
3. **Recover reference evidence.** Use `docs/knowledge/frontend-reference-inventory.md` to select only references that can change the current decision.
4. **Classify material rules.** Use `OBSERVED / INFERRED / ADOPTED / REJECTED`.
5. **Form the smallest visual thesis.** Cover hierarchy, composition, typography, material/color, data/media, and interaction only as needed.
6. **Reuse before adding.** Preserve valid components/tokens/patterns; add a shared owner only for real repeated responsibility.
7. **Implement the minimum complete slice.** Keep project semantics, data, algorithms, and cloud behavior unchanged unless separately approved.
8. **Check real states.** Include the states that can occur in the affected flow, not only the ideal/default screenshot.
9. **Check adaptive behavior.** Test only the viewport/input ranges relevant to the accepted product surface.
10. **Render and inspect.** Use `browser-runtime-validation` for visual claims. Source/CSS declarations are not visual proof.
11. **Compare against acceptance, not taste alone.** Verify hierarchy, density, clarity, reference adoption, state readability, responsiveness, and absence of obvious generic contamination.
12. **STOP.** Return to the development brief/current owner; do not redesign adjacent surfaces automatically.

## Rendered acceptance

Static/source inspection can prove:

- component/style/token ownership;
- semantic markup intent;
- responsive declarations;
- motion declarations;
- dependency usage;
- absence of duplicate style systems.

It cannot by itself prove:

- that the workspace hierarchy feels correct;
- that the canvas receives the intended visual priority;
- that a reference was interpreted appropriately;
- that responsive/adaptive behavior works at actual sizes;
- that state distinctions are visually clear;
- that grid/pixel presentation looks crisp at the tested zoom;
- that motion feels coherent;
- that browser rendering contains no overlap/clipping defects.

Those claims require rendered browser inspection. Human/user approval remains authoritative for subjective final art direction.

## STOP boundary

When the bounded visual result and required rendered proof/approval are satisfied, stop.

Do not automatically redesign another screen, create a new theme system, install a UI/motion library, create another specialist, refactor unrelated frontend architecture, or start a new UI milestone.
