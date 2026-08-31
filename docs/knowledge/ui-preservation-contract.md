# UI Preservation Contract

Status: mandatory preservation rules for UI planning, regeneration, and owner handoff

## Purpose

This document prevents UI simplification or regeneration work from unintentionally redesigning the original MIVUBI interface.

The factual visual reference is:

- `docs/knowledge/original-ui-baseline.md`
- Upstream repository: `achmadawdi/image-to-pixel-art`
- Upstream commit: `7904ba38d9ea38eec308c04805041ccd75bd6914`

The default rule is simple:

> **If a visual element is not explicitly approved for change, preserve it exactly from the original source.**

This contract applies even when layout hierarchy, visibility, copy, or workflow is being simplified.

---

# 1. Non-negotiable preservation rule

UI simplification does **not** grant permission to redesign the interface.

Unless a change is explicitly approved, preserve:

- icon/glyph/SVG/asset identity
- logo and brand assets
- typography family and hierarchy
- color tokens and established color usage
- button visual treatment
- input/select visual treatment
- borders and divider character
- border radius
- shadow character
- active state
- selected state
- hover state
- focus-visible state
- disabled state
- spacing character and control density
- existing component visual language
- accessibility semantics associated with the control

A request such as `simplify`, `move`, `hide`, `group`, `rename`, or `make clearer` must **not** be interpreted as permission to replace these visual primitives.

---

# 2. Icon Contract

## 2.1 Exact-original rule

Every existing function must keep the **exact icon representation used by the original source**.

Do not replace an original icon with:

- a Lucide equivalent
- a Material icon
- a Font Awesome icon
- a different Unicode glyph
- an emoji
- a newly drawn SVG
- an icon from another design system
- an AI-generated approximation
- a visually similar substitute

If the exact original icon cannot be confidently identified, **stop and inspect the original source**. Do not guess.

## 2.2 Move, hide, or group does not change icon identity

If a function is:

- moved to another position
- placed inside a menu
- hidden behind an advanced control
- conditionally shown
- grouped with other functions

its original icon must move with it unchanged.

## 2.3 New icons

A new icon may only be introduced when:

1. the function itself is genuinely new, and
2. the new icon has explicit approval.

No new icon is implied by a layout or copy change.

---

# 3. Original icon/glyph inventory

This inventory exists to prevent accidental substitution. Source remains authoritative if any conflict is found.

## 3.1 Home

| UI ID | Function | Preserve exactly |
| --- | --- | --- |
| `H-01A` | MIVUBI brand | `static/mivubi-logo.png` |
| `H-01C` | Device control | `☁` prefix |
| `H-01D` | Open project file | existing folder-like inline SVG and its path data |
| `H-04A` | Dari gambar | `▧` |
| `H-04B` | Canvas kosong | `▦` |
| `H-05` | Image upload | `↥` |
| `H-10` | Grid metric | `▦` |
| `H-10` | Tile-count metric | `⠿` |
| `H-10` | Per-tile metric | `▥` |
| `H-11` | Create/open direction | `→` |
| `H-20` | Project continuation direction | `→` |
| `H-22` | Project overflow menu | `⋮` |

## 3.2 Editor header and panels

| UI ID | Function | Preserve exactly |
| --- | --- | --- |
| `E-H01` | Back | `←` |
| `E-H02` | MIVUBI Editor brand | `static/mivubi-logo.png` |
| `E-H06` | Panel picker | `▦` plus existing `Panel⌄` treatment |
| `E-H08` | Keyboard help | `?` |
| `E-H10` | Export direction | `↓` |
| `E-L01` | Close left panel | `‹` |
| `E-R01` | Close right panel | `›` |

## 3.3 Canvas tools

| UI ID | Tool | Preserve exactly | Shortcut |
| --- | --- | --- | --- |
| `E-T01` | Pipet | `⌖` | `I` |
| `E-T02` | Pensil | `✎` | `P` |
| `E-T03` | Isi | `◩` | `F` |
| `E-T04` | Hapus | `◇` | `E` |
| `E-T05` | Select | `⬚` | `S` |
| `E-T06` | Geser | `✣` | `Space` temporary pan |

These pairings are immutable unless explicitly approved for change.

## 3.4 Canvas/context controls

| Function | Preserve exactly |
| --- | --- |
| Undo | `↶` |
| Redo | `↷` |
| Zoom out | `−` |
| Zoom in | `＋` |
| Close/cancel compact actions | existing `×` glyph where used |

## 3.5 Palette/detail controls

| Function | Preserve exactly |
| --- | --- |
| More color actions | `•••` |
| Unlocked indicator | `⌑` |
| Locked indicator | `🔒` |
| Close quick palette/modal/toast | existing `×` treatment |

---

# 4. Brand Asset Contract

The original MIVUBI visual identity must be reused, not recreated.

Preserve:

- `static/mivubi-logo.png`
- original favicon relationship
- original logo pixelated rendering where source applies it
- original MIVUBI / EDITOR / PIXEL MOSAIC PLANNER text treatment

Do not:

- redraw the logo
- vectorize it into a different look without approval
- replace it with generated artwork
- apply a different brand mark
- alter its aspect ratio

---

# 5. Typography Contract

Preserve the original font families:

- `Poppins` — primary UI font
- `Readex Pro` — headings, identity, and emphasized interface text where original source uses it

Do not substitute fonts because another font looks similar.

Typography simplification may change wording or information hierarchy only when approved; it does not implicitly authorize font-family replacement.

---

# 6. Color Contract

The original color system remains authoritative.

Core original tokens include:

```text
--ink: #21302f
--muted: #66746f
--line: #e4d9b6
--paper: #fffef9
--accent: #ebb734
--accent-dark: #e4991c
--forest: #005a2a
--brand-yellow-50: #fefaec
--brand-yellow-100: #faf1cb
--brand-yellow-300: #f0ce61
--brand-yellow-400: #ebb734
--brand-yellow-500: #e4991c
--danger: #9b472d
```

Do not introduce a replacement palette as part of simplification.

A component moved to a different location should retain its original semantic color treatment unless a specific visual change is approved.

---

# 7. Component Appearance Contract

Preserve the established character of original controls:

- cream/off-white application surfaces
- thin beige/gray borders
- compact rounded corners
- forest-green primary/active controls
- restrained yellow accent
- soft low-opacity shadows
- compact workspace density

The following are not allowed as incidental cleanup:

- changing all radii to a new universal radius
- flattening all shadows
- replacing bordered controls with borderless controls
- converting original controls to another component library
- changing button shapes or heights merely for consistency with another design system
- replacing segmented controls with a new tab style
- globally increasing/decreasing spacing without explicit approval

---

# 8. Interaction State Contract

Moving or simplifying controls must preserve their original visual states unless the state itself is explicitly redesigned.

Preserve:

- active
- selected
- hover
- focus-visible
- disabled
- error/danger
- saving/loading
- viewer/read-only

Original focus-visible treatment on `button`, `input`, and `select` is part of the accessibility baseline and must not be silently removed.

---

# 9. Accessibility Preservation

Do not remove existing accessibility behavior during UI regeneration.

Preserve where applicable:

- `aria-label`
- `aria-expanded`
- `aria-selected`
- `aria-keyshortcuts`
- dialog roles and `aria-modal`
- toolbar roles
- status/alert roles
- keyboard-focusable canvas
- canvas keyboard navigation
- cropper keyboard movement
- disabled semantics
- visible focus treatment

Simpler UI must not mean reduced keyboard or assistive-technology access.

---

# 10. Allowed change categories

A proposal may request one or more of these without changing visual identity:

- `KEEP` — preserve exactly
- `MOVE` — same component, different location
- `HIDE` — remove from default visibility, capability remains
- `CONDITIONAL` — show only when relevant
- `GROUP` — place existing controls under an existing/new grouping without changing their individual visual identity
- `RENAME` — change user-facing copy only
- `REMOVE` — remove a UI/capability only when explicitly approved

None of these categories automatically permit icon/style replacement.

---

# 11. Explicit visual change category

Any deliberate change to an icon or visual primitive must be marked separately:

```text
Visual Change: YES — REQUIRES EXPLICIT APPROVAL
```

The proposal must state exactly:

- original element
- proposed replacement
- reason
- affected UI IDs

Without that declaration, visual change is considered **not approved**.

---

# 12. Mandatory proposal format

Every future UI proposal should use this structure:

```text
UI ID: E-T02
Original: Pensil tool with glyph ✎

Action: MOVE / HIDE / CONDITIONAL / GROUP / RENAME / REMOVE / KEEP
Function: KEEP / CHANGE
Icon: KEEP EXACT ORIGINAL
Typography: KEEP EXACT ORIGINAL
Colors: KEEP EXACT ORIGINAL
Component Styling: KEEP EXACT ORIGINAL
Interaction States: KEEP EXACT ORIGINAL
Accessibility: KEEP

Proposed Change:
...

Reason:
...

Visual Change: NO
```

If several UI IDs are affected, list each one explicitly.

---

# 13. Regeneration acceptance rule

A regenerated UI is not accepted merely because it is visually similar.

For every unaffected component, acceptance requires:

1. same original icon/glyph/SVG/asset
2. same brand asset
3. same font family
4. same semantic color treatment
5. same component visual character
6. same important interaction states
7. same accessibility behavior
8. only approved hierarchy/visibility/copy/workflow differences

If regeneration changes an unaffected visual primitive, treat it as a regression and restore the original source treatment.

---

# 14. Conflict rule

When there is uncertainty:

```text
original upstream source
> original-ui-baseline.md
> approved change specification
> generated interpretation
```

For the visual identity of an element that has **not** been approved for change, original upstream source wins.

Never invent a replacement to fill uncertainty.
