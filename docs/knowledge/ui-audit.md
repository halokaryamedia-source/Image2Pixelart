# Current UI Audit

Status: current baseline audit

Scope: static/source and reference audit of current Home + Editor UI against the repository's four MIVUBI redesign references.

This audit is supporting evidence. Durable UI decisions are owned by `docs/foundation/05-ui-design-system.md`.

## Proof boundary

This audit is based on:

- current `HomeView.svelte` structure/styles;
- current `EditorView.svelte` structure/styles;
- current global UI tokens;
- `MIVUBI-REDESIGN-PROMPTS.md`;
- current frontend reference inventory.

It is **not** a live-browser acceptance pass. Layout feel, clipping, actual viewport behavior, focus appearance, pointer-to-cell fidelity, and motion still require browser evidence when implementation work begins.

# Executive result

The current UI is not an old pre-redesign baseline anymore. It already implements much of the intended redesign family.

```text
Home
→ already strongly aligned with Reference 01 — Quick Start Split

Editor
→ already strongly aligned with Reference 03 — Focused Workbench v2
```

Therefore the next UI phase should be **ALIGN + polish**, not a full rewrite.

Reference 02 and Reference 04 remain useful, but only as partial supporting influences.

# Home audit

## Current strengths

Current Home already contains the major Reference 01 structure:

- compact sticky application header;
- clear separation between `Buka file proyek` and source-image upload;
- concise MIVUBI orientation/hero;
- `Dari gambar` / `Canvas kosong` start modes;
- source dropzone;
- physical width/height/tile inputs;
- immediate grid/tile summary;
- one dominant `Buat & buka editor` action;
- live physical-grid preview beside setup;
- continuation-project section below.

The current setup/preview split is therefore a valid working direction rather than something that needs to be replaced by a new concept.

## Home gaps

### P0 — infrastructure terminology leaks into product UI

Current copy includes implementation-facing phrases such as `PROYEK CLOUD`, `proyek terhubung ke perangkat ini`, and explicit Neon wording in empty-state copy.

Why this matters:

- users are trying to create/resume a mosaic, not operate cloud infrastructure;
- backend implementation may change while product meaning remains stable;
- infrastructure language competes with simple project language.

Direction:

- ordinary UI should prefer `Proyek`, `Tersimpan`, `Lanjutkan`, `Buka file proyek`, and only distinguish local/online storage when the user actually needs that distinction.

### P1 — header utility competition

The device/cloud control is a persistent header action beside navigation and file-open actions.

Direction:

- keep device identity available when required for collaboration/device recovery;
- visually subordinate it to project-start/open tasks;
- do not let device identity look like a primary navigation destination.

### P1 — project continuation hierarchy is functional but flat

Current project cards expose useful metadata and continue actions, but all projects have similar hierarchy.

Reference 02 provides a useful principle: returning-user continuation should be exceptionally easy to scan.

Direction:

- improve project-card readability/action hierarchy where useful;
- do not create a featured-project hero unless recency/usage evidence justifies it.

### P1 — mixed icon language

Current Home uses logo imagery, inline SVG, and several text/unicode symbols.

Direction:

- converge toward one coherent icon treatment during future UI polish;
- do not add an icon library solely to solve this unless the current stack cannot represent the small required set cleanly.

### P2 — visual token drift

Global tokens use the actual MIVUBI brand palette, while redesign prompts contain approximate alternate greens/ivories.

Direction:

- keep current MIVUBI brand palette as authority;
- use references for roles/hierarchy, not as a source of replacement brand HEX values.

## Home reference decision

| Reference | Decision | Reason |
| --- | --- | --- |
| 01 Quick Start Split | **ADOPTED PRIMARY** | Closest to current source and best first-use hierarchy |
| 02 Dashboard First | **PARTIAL ADOPT** | Good continuation/project-card principles, but should not replace default start flow |

# Editor audit

## Current strengths

Current Editor already implements most of the recommended Focused Workbench model:

- 56 px compact header;
- project identity/name and physical/grid metadata;
- collaboration/save status;
- panel selector;
- format selector + export action;
- collapsible left/right panels;
- left `Referensi / Rekonstruksi / Properti` tabs;
- right `Palet / Detail` tabs;
- source preview/crop/fit/reconstruction controls;
- central canvas workspace;
- contextual editing bar;
- vertical drawing-tool rail;
- undo/redo;
- grid/zoom/Fit/coordinate controls;
- quick palette separate from detailed palette management;
- selected-color HEX/name/lock/overflow actions;
- viewer/read-only state;
- canvas settings, palette library, shortcuts, notice/error dialogs/status.

This is already structurally much closer to Reference 03 than to the earlier source screenshot.

## Editor gaps

### P0 — header density is too competitive

The current header contains:

```text
back
brand
project name
metric chip
collaboration
panel selector
save state
shortcut help
format selector
export
```

All are legitimate features, but the visual hierarchy risks becoming flat at constrained widths.

Direction:

- project context, edit/save state, and Export remain top-level;
- panel/help/format utilities should be quieter;
- do not add canvas editing tools to the header;
- consider grouping/consolidating low-frequency utilities before reducing canvas space.

### P0 — typography becomes too small in dense areas

Current Editor CSS uses many 10–12 px labels and some 7 px brand microtype.

Small tertiary metadata can be valid, but critical labels/instructions should not depend on tiny type to preserve density.

Direction:

- 14 px normal explanatory/body role;
- 12–13 px compact panel/control role;
- 10–11 px tertiary metadata only;
- 7–10 px decorative microtype must not carry required operating information.

### P0 — desktop grid has a hard minimum without a clear adaptive policy

Current Editor uses a permanent grid relationship around 270 px left + min 440 px canvas + 290 px right when both panels are visible.

This is valid for a wide desktop, but future constrained layouts need explicit behavior before simply compressing all three regions.

Direction:

- wide desktop: dual panels allowed;
- constrained laptop: panels individually collapse while canvas retains priority;
- narrower/tablet-like: prefer one-panel-at-a-time/overlay treatment before shrinking the canvas below useful working space;
- mobile-width full authoring parity remains deferred.

### P1 — duplicated hierarchy between panel title and tab labels

Example: left panel title `Referensi gambar` sits above tabs including `Referensi`.

Direction:

- reduce redundant naming during polish;
- panel chrome should explain the container only when it adds meaning beyond the active tab.

### P1 — terminology inconsistency

The UI is primarily Indonesian, but `Select`, English-ish reconstruction phrases, and some developer-oriented language remain.

Direction:

- prefer consistent Indonesian user-facing labels where semantics stay clear;
- preserve technical terms only when they are meaningful/intentional to the target user.

### P1 — icon/symbol inconsistency

Tool rail and utility actions use a mixture of arrows, emoji-like lock/cloud symbols, geometric unicode, and SVG.

Direction:

- establish one coherent icon family/treatment over time;
- exact icon set is implementation detail, but visual weight/stroke/active-state behavior should be consistent.

### P1 — viewer state relies partly on disabling/desaturation

Current viewer mode includes a useful banner, but also disables pointer events and applies saturation changes broadly.

Direction:

- preserve the banner and actual permission semantics;
- ensure controls that remain useful for viewing/pan/pick remain understandable;
- unavailable editing controls should communicate state, not merely appear washed out.

### P1 — context/action hierarchy can be stronger

The context bar is a good model, but active color, instruction, selection actions, and undo/redo can become visually crowded depending on state.

Direction:

- context bar remains state-driven;
- selection state should prioritize selection count/actions;
- normal painting state should prioritize active tool/color;
- avoid permanently exposing unrelated commands.

### P2 — visual system is mostly local CSS rather than a deliberate shared token system

Global CSS defines core brand tokens, but many components still use direct HEX values and local radius/spacing choices.

Direction:

- centralize only durable repeated semantic roles;
- do not convert every CSS value into a token;
- first targets should be surface, text, border, primary, accent/status, danger, focus, major spacing/type/control roles.

## Editor reference decision

| Reference | Decision | Reason |
| --- | --- | --- |
| 03 Focused Workbench v2 | **ADOPTED PRIMARY** | Current source already implements the core model and it preserves feature discoverability |
| 04 Canvas-first Studio | **PARTIAL ADOPT / FUTURE OPTION** | Excellent canvas-dominance/focus principles, but single-inspector replacement is not needed now |

# Cross-application findings

## P0 — establish one durable UI authority

Resolved by `docs/foundation/05-ui-design-system.md`.

Before this, references, global CSS, and current component decisions could all appear authoritative in different ways.

## P1 — semantic token cleanup

Current global tokens provide a good brand baseline:

- `--ink`;
- `--muted`;
- `--line`;
- `--paper`;
- `--forest`;
- accent family;
- `--danger`.

Future UI polish should reuse/extend semantic roles rather than introduce unrelated raw colors repeatedly.

## P1 — interaction state consistency

Future component review should compare real applicable states:

```text
default
hover
focus-visible
active/selected
disabled
viewer/read-only
locked
processing
saving
success
error
```

## P1 — rendered acceptance is still missing

No static audit can confirm:

- actual visual hierarchy;
- real overlap/clipping;
- focus appearance;
- responsive behavior;
- panel animation/transition feel;
- pixel-grid visual fidelity;
- pointer-to-cell alignment.

Those become required browser checks only when the corresponding implementation slice is changed.

# Recommended implementation order

Do not redesign everything at once.

```text
1. Home terminology + hierarchy polish
2. shared semantic visual-token cleanup where repeated drift is proven
3. Editor header hierarchy/density
4. Editor typography/control-density cleanup
5. Editor panel/context/terminology/icon consistency
6. adaptive Editor layout behavior
7. viewer/collaboration state polish
8. rendered browser acceptance per changed slice
```

Canvas/math/cloud behavior remains out of scope unless a concrete UI defect proves an implementation-owner issue.

# Acceptance for the next UI implementation phase

A future UI slice should:

1. name the exact surface/state being improved;
2. use `05-ui-design-system.md` as durable direction;
3. identify which reference rule is adopted when a reference matters;
4. preserve product mechanics/features;
5. use `web-ui-design-development` + Svelte validation;
6. add accessibility/browser validation only when the changed claim requires them;
7. stop after the bounded surface meets its visual acceptance criteria.

Do not restart a whole-app redesign merely because this audit lists several independent improvement areas.