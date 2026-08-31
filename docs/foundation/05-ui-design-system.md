# UI Design System

Status: current durable UI authority

This document owns the durable visual and interaction-design direction for MIVUBI Mosaic Plan / Image2Pixelart. It exists to keep Home and Editor development coherent across sessions without turning reference mockups, agent taste, or current CSS accidents into hidden product policy.

Implementation detail remains owned by current Svelte source. Visual references remain supporting evidence through `docs/knowledge/frontend-reference-inventory.md`. Current-state audit evidence lives in `docs/knowledge/ui-audit.md`.

## Authority

Use the nearest current authority:

```text
current explicit user direction
→ this Foundation + other affected product Foundation owners
→ approved MIVUBI brand assets / explicitly approved UI decisions
→ current source + rendered behavior
→ frontend reference inventory / raw reference material
→ generic model taste last
```

A polished screenshot is not automatically a requirement. When a reference matters, reason through `OBSERVED / INFERRED / ADOPTED / REJECTED` and preserve only the adopted rule.

## Current direction

The current application is already close to the intended redesign family. Future UI work should normally be **ALIGN**, not a redesign from zero.

```text
Home
→ primary direction: Reference 01 — Quick Start Split
→ supporting influence: Reference 02 — returning-user/project-continuation hierarchy only

Editor
→ primary direction: Reference 03 — Focused Workbench v2
→ supporting influence: Reference 04 — canvas dominance, reduced chrome, and future focus-mode ideas only
```

Do not silently replace the Home with Dashboard First or replace the Editor with a single-inspector architecture unless a later explicit decision changes this Foundation.

## Product UI principles

1. **Task before decoration.** The interface must make the next meaningful action obvious before adding visual flourish.
2. **Canvas is the Editor focal point.** Panels, status, export, and tools support the canvas; they must not visually compete with it.
3. **No feature loss for visual simplicity.** Features may move into tabs, drawers, dialogs, accordions, overflow menus, or contextual controls, but approved capability is not removed solely to reduce chrome.
4. **Progressive disclosure over permanent clutter.** Frequent actions stay immediately available; detailed management and destructive actions move one level deeper when discoverability remains clear.
5. **UI color and mosaic color are different systems.** The application chrome stays restrained so project palette colors remain visually legible.
6. **State must be obvious.** Editable/viewer, saved/saving/error, active tool, selected color, disabled/locked, processing, and panel state must not depend on subtle color alone.
7. **Reference-grounded, not reference-copied.** References solve specific problems; no single mockup is copied as a hidden template.
8. **Desktop authoring first.** The full editor is a dense production workspace. Narrow layouts must remain contained and understandable, but full mobile-authoring parity is not currently a required product promise.

# Application hierarchy

## Global hierarchy

The intended visual order is:

```text
current task / project context
→ primary work surface
→ primary action or active tool
→ supporting controls/status
→ detailed management
→ destructive/rare actions
```

Do not give equal visual weight to all available capabilities.

## Home hierarchy

Home answers, in order:

1. How do I start a mosaic project?
2. What will the physical grid be?
3. Can I continue an existing project?
4. How do I open an exported/project file?
5. What device/cloud context am I currently using?

Device/cloud implementation details must remain subordinate to project tasks.

## Editor hierarchy

Editor answers, in order:

1. What am I editing on the canvas?
2. Which tool and color are active?
3. What reference/reconstruction/palette context do I need now?
4. Is the project editable and saved?
5. How do I adjust view/panels?
6. How do I export or access less-frequent management actions?

# Home

## Adopted structure

Reference 01 — Quick Start Split is the default direction.

Required hierarchy:

```text
compact application header
→ concise project-start orientation
→ creation/setup + live physical-grid preview
→ continue existing projects
```

The current two-column setup/preview model is valid and should be preserved unless evidence proves another structure materially improves the primary flow.

### Creation area

Keep clearly separated starting modes:

- source image;
- blank canvas;
- opening an existing project file is a separate action and must not be confused with source-image import.

Physical dimension inputs, tile size, grid result, and preview belong to one coherent setup responsibility.

The main creation section should have one dominant primary action. Secondary/import/device actions must not compete visually.

### Preview

The preview exists to make physical consequences understandable, not to become decorative empty space.

It should communicate, when available:

- columns × rows;
- physical width/height;
- selected source preview;
- relationship between source image and grid.

Do not make the preview so dominant that the user must scroll to reach creation controls or continuation work.

### Continue projects

Reference 02 contributes only the principle that returning-user continuation must be easy to scan and resume.

Adopt:

- clear project name;
- recognizable thumbnail/grid preview;
- useful grid/palette metadata;
- edited/status metadata;
- obvious continue/open action;
- overflow for rare/destructive project actions.

Do **not** automatically adopt a Dashboard-First Home, a featured-project hero, or a separate permanent “Mulai proyek” sidebar without usage evidence or explicit approval.

### User-facing terminology

Prefer product language over infrastructure language.

Good examples:

```text
Proyek
Tersimpan
Tersimpan online / tersimpan di perangkat (when distinction matters)
Lanjutkan
Buka file proyek
```

Avoid making `Neon`, `R2`, `Durable Object`, internal revision numbers, or other infrastructure terminology part of ordinary UI hierarchy unless the task is explicitly developer/admin oriented.

# Editor

## Adopted structure

Reference 03 — Focused Workbench v2 is the primary Editor direction.

Current architecture is valid:

```text
compact header
→ optional left contextual panel
→ dominant center canvas/workspace
→ optional right palette/detail panel
→ quick palette + view controls
```

Reference 04 contributes canvas dominance, reduced chrome, compact contextual controls, and potential future focus-mode thinking. It does **not** currently replace the dual-panel workbench with a single permanent contextual inspector.

## Header

Header is project context + high-level status/action, not a second toolbar.

Priority:

```text
back/project identity
→ project name / compact dimensions
→ edit/collaboration/save state
→ export
→ panel/help/format utilities
```

Avoid crowding the header with controls that belong next to the canvas or inside a panel. Export may remain the only strong primary-action treatment in the header.

Panel visibility, help, format selection, and status should be visually quieter than project identity and the primary export action.

## Canvas workspace

The canvas is the dominant visual mass of the Editor.

Rules:

- maximize useful canvas area before adding permanent chrome;
- keep surrounding workspace visually quiet;
- tool rail, context bar, quick palette, and view controls should visually read as support layers;
- avoid large dead-gray frames around a small canvas when fit/zoom can use the area more effectively;
- panels and overlays must not obscure the current editing target unexpectedly;
- when both side panels are hidden, the workspace should feel intentionally focused rather than merely stretched.

## Tool system

Visible tool state must use consistent labels and state treatment.

Current tool concepts include selection, pencil, fill, eraser, picker, and pan. User-facing labels should be consistently Indonesian where the surrounding UI is Indonesian; do not mix `Select` with `Pilih` without a deliberate terminology decision.

Active tool should remain clear through more than color alone where practical, using a combination of background/border/icon/label/state semantics.

The tool rail is for direct manipulation tools. Do not turn it into a dumping ground for reference, export, project settings, cloud, or unrelated management actions.

## Context bar

The context bar communicates the currently actionable editing context, for example:

- active color;
- current tool instruction;
- selection count and selection actions;
- undo/redo.

It should adapt to state rather than permanently showing every possible option.

## Left panel

Canonical top-level responsibilities:

```text
Referensi
Rekonstruksi
Properti
```

These are related but distinct. Do not duplicate full controls across tabs.

### Referensi

Own source-image viewing/replacement, fit/crop context, and compact reconstruction summary.

### Rekonstruksi

Own render style, suggestion count, palette suggestion/adoption, and applying/rasterizing the source into the grid. Keep actions separate when their effects differ; “suggest” must not visually imply “apply to grid” if those are distinct operations.

### Properti

Own physical canvas/grid facts and the entry point to resize/reconfigure dimensions.

## Right panel

Canonical responsibilities:

```text
Palet
Detail
```

### Palet

Fast overview and selection of project colors. It should remain scan-friendly even at larger palette counts.

### Detail

Own selected-color HEX/name/lock and management actions.

Destructive color deletion and save-to-library belong in overflow/contextual actions rather than permanent high-emphasis placement.

## Quick palette

Quick palette is a painting-speed surface, not a second full palette manager.

It remains useful even when the full Palette panel is visible because the responsibilities differ:

```text
quick palette
→ fast color switching

palette/detail panel
→ management and metadata
```

Do not duplicate full color-editing controls into the quick palette.

## Collaboration and viewer state

Cloud/realtime semantics remain owned by collaboration Foundation/source, but their visual representation must be clear.

Differentiate:

- editable;
- viewer/read-only;
- requesting edit;
- disconnected/reconnecting when material;
- saved;
- saving;
- save error.

Viewer mode should not merely desaturate the same interface. Controls that cannot act must be clearly unavailable or reinterpreted, while viewing/navigation/picker/pan behavior that is actually supported remains understandable.

## Dialogs and secondary surfaces

Canvas settings, palette library, shortcuts, and other modal surfaces should use one coherent dialog language:

- clear title and context;
- one primary action when applicable;
- clear secondary/cancel path;
- predictable close behavior;
- intentional focus management;
- content may scroll without making the action row unreachable.

# Visual system

## Brand and semantic color roles

Current MIVUBI brand colors remain the starting authority. Use semantic roles rather than raw-color proliferation.

Current baseline mapping:

```text
ink / primary text        → #21302F
primary action / active   → #005A2A
warm app background       → #FEFAEC
soft warm surface         → #FAF1CB when appropriate
accent / status family    → #F0CE61 / #EBB734 / #E4991C
paper / primary surface   → near-white warm surface such as current --paper
muted text                → current muted neutral family
line / separator          → current warm neutral line family
danger                    → current --danger family
```

Rules:

- forest green is the primary action/selection family;
- mustard/gold is accent, warning/status, focus-support, or small emphasis—not a competing primary CTA color;
- mosaic project colors are content colors and must not be reused casually as application-state colors;
- use red/brown danger styling only for genuinely destructive/error responsibility;
- focus visibility must remain strong on warm, white, green, and mosaic-colored surroundings.

Do not replace the brand palette with reference-specific approximate greens merely because a mockup used them.

## Surface, borders, radius, elevation

Use a small coherent language:

- warm application background;
- near-white working surfaces;
- subtle warm borders for grouping;
- restrained radius family;
- elevation only for layer/overlay/interactive separation;
- no gradient/glass/glow accumulation as default polish.

The pixel mosaic itself can carry visual richness; application chrome should generally remain quieter.

## Typography

Current product uses Poppins plus Readex Pro roles. Preserve the two-family system unless an explicit brand decision changes it.

Semantic intent:

```text
application/body/control text
→ Poppins / readable sans role

project titles / major section titles / compact brand emphasis
→ Readex Pro role
```

Rules:

- body/primary explanatory text should normally be at least 14 px;
- panel labels and compact control text may use 12–13 px when contrast and density remain strong;
- 10–11 px is reserved for tertiary metadata/eyebrows/non-critical annotations, not primary instructions or required control labels;
- avoid 7–10 px brand labels except decorative/brand microtype that is not required to operate the product;
- do not manufacture hierarchy only by making secondary text tiny;
- avoid uncontrolled type-size variety; use role-based repetition.

## Spacing and density

Use an **8 px base rhythm**, with 4 px optical/micro adjustments when needed. Do not require every CSS value to be an exact multiple of 8.

Useful spacing roles:

```text
4   → optical/internal micro-gap
8   → tight control/icon gap
12  → compact control/group gap
16  → standard panel padding/group rhythm
24  → major control-group separation
32+ → section/page-level separation where appropriate
```

Density principles:

- Home may breathe more than Editor;
- Editor is intentionally dense but must not achieve density by shrinking required text or targets excessively;
- group related controls more tightly than unrelated groups;
- prefer whitespace/grouping before adding divider lines everywhere.

## Interaction target baseline

- primary/standalone actions should generally target about 44 px minimum height;
- dense desktop Editor controls may use about 38–42 px when spacing, keyboard access, and clarity remain strong;
- icon-only critical controls should not become tiny hit areas merely to reduce chrome;
- visual icon size and hit target size are separate concerns.

# Component and state discipline

For every affected interactive component, handle only states the product can actually enter.

Common state set:

```text
default
hover
focus-visible
active / pressed
selected / current
disabled
read-only / viewer
loading / processing
saving
success
error
locked
```

Do not invent runtime states inside CSS. Do not render materially different states with identical visual treatment.

Use one coherent icon language when icons are needed. Unicode symbols may be acceptable temporarily, but a mixed collection of unrelated symbol styles should not become the final visual system by accident.

# Pixel and canvas presentation

Pixel fidelity is part of product correctness, not decorative styling.

Rules:

- discrete cells must remain visually discrete at editing zooms;
- UI scaling must not visually imply fractional tile boundaries when the project grid is exact;
- grid lines, numbering/ruler/coordinate feedback must remain subordinate but readable;
- hover/selection/coordinate overlays must align with the actual cell model;
- source/reference image smoothing is separate from pixel-grid rendering; do not apply one rule blindly to both;
- browser/CSS transforms must not create misleading pointer-to-cell alignment;
- selection and active-color overlays should remain visible across both light and dark mosaic colors;
- quick palette swatches must preserve exact project HEX content; application theming must not tint them.

# Responsive and adaptive behavior

## Home

Home should remain compositionally usable from narrow layouts upward.

At narrower widths:

- setup + preview may stack;
- header actions may condense without losing clear file-open/project-start paths;
- project cards may reduce columns;
- labels and project names must not clip silently;
- no essential information may depend on hover.

## Editor

Primary authoring design/acceptance target is desktop/laptop workspace.

Guidance:

```text
wide desktop
→ dual panels may remain visible

medium desktop / constrained laptop
→ panels must be individually collapsible; canvas keeps priority

narrow/tablet-like viewport
→ side content may need overlay/drawer/one-panel-at-a-time treatment before the canvas is squeezed below useful editing space

mobile-width
→ avoid catastrophic overflow and preserve project/view navigation, but full production-authoring parity is currently deferred unless explicitly required
```

Do not preserve desktop panel widths at the cost of making the canvas unusable. Do not automatically remove features on smaller layouts; change presentation first.

# Motion

Motion needs a job:

```text
feedback
orientation
continuity
state transition
attention to important state
```

If it serves none of these, omit it.

Rules:

- tool/palette/button feedback should feel immediate;
- panels/dialogs may use restrained transitions that clarify layer/state;
- do not animate the pixel artwork or workspace ambiently merely to make the app feel “modern”;
- save/reconnect/processing indicators may use motion when it improves comprehension;
- respect reduced-motion preferences for non-essential motion;
- prefer native CSS/Svelte capabilities before adding a motion dependency.

# Accessibility baseline

Accessibility is part of UI quality, not a later visual polish pass.

- use native controls/semantics where practical;
- keep visible focus strong;
- do not rely on color alone for active/error/read-only/locked state;
- dialog focus behavior must be intentional;
- global shortcuts must not hijack text input;
- viewer/read-only state must remain understandable;
- inherent canvas panning is distinct from accidental page-level overflow;
- do not create thousands of hidden controls as a fake per-cell accessibility solution;
- dragging/crop interactions require an accepted alternative only when the applicable product/accessibility contract requires it;
- avoid hover-only essential information.

Detailed validation belongs to `web-accessibility-validation`.

# Reference decisions

## Reference 01 — Home Quick Start Split

**ADOPTED as primary Home direction.**

Adopt:

- compact application header;
- concise hero/orientation;
- 40/60-like setup + preview relationship as a useful baseline, not a rigid numeric contract;
- one clear primary create action;
- continuation projects below;
- warm MIVUBI surface language;
- image import versus project-file terminology separation.

Reject as rigid requirement:

- exact mockup copy/text;
- exact numeric colors where they conflict with current MIVUBI brand tokens;
- exact card widths/column math independent of real viewport/content.

## Reference 02 — Home Dashboard First

**PARTIAL ADOPT.**

Adopt:

- returning-user project continuation must be prominent and scan-friendly;
- project cards should expose meaningful thumbnail + project metadata + continue action;
- starting modes should remain clearly understandable.

Reject/defer:

- Dashboard First as the default Home architecture;
- mandatory featured-project card;
- permanent right-side “Mulai proyek” card.

These require usage evidence or explicit later approval.

## Reference 03 — Editor Focused Workbench v2

**ADOPTED as primary Editor direction.**

Adopt:

- left/reference + center/canvas + right/palette model;
- panel selection/collapse;
- canvas dominance;
- contextual tool/action bar;
- quick palette + detailed palette-management separation;
- compact export/status header;
- progressive disclosure instead of feature deletion.

Current implementation already follows much of this structure; future work should align/polish rather than rebuild it reflexively.

## Reference 04 — Editor Canvas-first Studio

**PARTIAL ADOPT / FUTURE OPTION.**

Adopt now as principles:

- stronger canvas dominance;
- reduced unnecessary chrome;
- compact contextual controls near the work surface;
- focus-mode thinking when panels are hidden;
- one clear visual hierarchy instead of duplicated toolbars.

Reject/defer as immediate architecture:

- replacing the current dual-panel model with one permanent contextual inspector;
- moving all feature categories into a single inspector by default;
- hiding discoverable reference/palette responsibilities merely to increase canvas size.

# Acceptance model

For future UI changes:

```text
Foundation requirement
→ current reference decision when relevant
→ web-ui-design-development
→ Svelte implementation
→ Svelte/static proof when applicable
→ accessibility proof when applicable
→ rendered browser proof for visual/interaction claims
```

Static source can prove ownership and declared styling. It cannot prove hierarchy quality, responsive composition, visual fidelity, focus appearance, motion feel, or pointer-to-cell correctness.

Human/user approval remains authoritative for subjective final art direction.

## STOP boundary

Do not use this Foundation as permission to:

- redesign unrelated screens during a bounded task;
- remove features to simplify the UI;
- refactor image/grid/cloud logic for visual reasons;
- install a component/design/motion library without a demonstrated need;
- create another UI specialist without a new distinct recurring responsibility;
- treat old reference prompts as current product facts.

When a bounded UI result matches this Foundation and the required proof, stop.