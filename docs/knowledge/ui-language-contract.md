# UI Language Contract

Status: agreed language and terminology rules for UI planning, copy cleanup, regeneration, and owner handoff

## Purpose

This document defines how language should be handled while the original MIVUBI UI is being cleaned up.

It is intentionally separate from:

- `original-ui-baseline.md` — factual record of the original upstream UI.
- `ui-preservation-contract.md` — mandatory visual preservation rules.
- future UI simplification proposals — structural/visibility/workflow changes that have not yet been approved.

Language cleanup does **not** authorize visual redesign. All icons, glyphs, SVGs, assets, fonts, colors, component styling, states, and visual identity remain governed by `ui-preservation-contract.md`.

---

# 1. Primary language rule

The UI does **not** need to be forced into 100% Indonesian.

Use Indonesian when the result is natural, familiar, and clear.

Keep the original/common English term when an Indonesian translation would sound:

- awkward
- overly formal
- uncommon in creative/software applications
- harder to understand
- translated only for the sake of translation

The goal is **natural, clear product language**, not language purity.

> If the Indonesian wording feels forced, keep the familiar original English term.

Do not alternate between multiple terms for the same concept without a real contextual reason.

## 1.1 Approved Home product descriptor

The original Home eyebrow/product descriptor:

```text
MIVUBI · PIXEL MOSAIC PLANNER
```

is approved to become:

```text
MIVUBI · PIXEL ART EDITOR
```

Reason:

- `Pixel Art` describes the artwork/result more clearly than `Pixel Mosaic`.
- `Editor` is direct and familiar product language.
- This is a copy/terminology decision only; it does not authorize changes to the MIVUBI logo, typography, spacing, color, or surrounding Hero styling.

Use `PIXEL ART EDITOR` consistently wherever this product descriptor is intentionally reused in the cleaned-up UI, unless a specific surface receives a later approved exception.

## 1.2 Approved Home Hero copy

The Home Hero copy is approved as:

```text
Buat dan edit Pixel Art.
Ubah gambarmu menjadi Pixel Art, atau mulai berkarya dari Canvas kosong.
```

Intent:

- direct explanation of the main activity: creating and editing Pixel Art;
- keep the tone inviting and creative rather than system-like;
- communicate both entry paths: converting an image or starting from an empty Canvas;
- keep `Pixel Art` and `Canvas` as the approved product terms.

This is a copy decision only. Preserve the original Hero layout, typography hierarchy, colors, spacing character, and surrounding visual treatment unless a separate visual change is explicitly approved.

## 1.3 Approved Home creation heading

The Home creation-area heading is approved as:

```text
Buat Karya Baru
```

It replaces the system-oriented wording `Buat Proyek Baru` for the user-facing creation section.

Intent:

- make the Home surface feel creative rather than administrative;
- refer to what the user is making as a `Karya` in this entry context;
- keep the underlying project model and technical naming unchanged unless separately approved.

This is a copy decision only. Preserve the original section placement and visual treatment unless a separate structural or visual change is explicitly approved.

## 1.4 Approved Home start-mode labels

The two Home start-mode labels are approved as:

```text
▧ Upload Gambar
▦ Buat Baru
```

They replace the original visible labels:

```text
▧ Dari gambar
▦ Canvas kosong
```

Intent:

- tell the user what action to take instead of only describing a state or source;
- `Upload Gambar` clearly communicates the image-based path;
- `Buat Baru` clearly communicates starting a new work without an uploaded image.

Preservation requirements:

- keep the exact original icons `▧` and `▦`;
- keep the existing mode behavior (`image` and `blank`);
- do not change the tab styling, active treatment, layout, or interaction unless separately approved.

## 1.5 Approved Home start-mode descriptions

The supporting descriptions are approved as:

### Upload Gambar

```text
Ubah gambar menjadi Pixel Art secara otomatis.
```

### Buat Baru

```text
Buat Pixel Art dari Canvas kosong.
```

Intent:

- keep both descriptions short and action-oriented;
- explain the outcome of each mode without exposing implementation details;
- use the approved terms `Pixel Art` and `Canvas` consistently.

These are copy decisions only. They do not authorize changing the original icons, mode behavior, component styling, layout, or interaction.

## 1.6 Approved Home upload-area instruction

The image upload area instruction is approved as:

```text
Klik untuk memilih gambar atau drag & drop ke area ini.
```

Intent:

- clearly communicate both supported input methods;
- keep `drag & drop` in its familiar software terminology instead of forcing an awkward Indonesian translation such as `seret`;
- remain direct and instructional without sounding system-heavy.

The existing upload/drop behavior, accepted formats, size limits, icon, layout, and visual treatment remain unchanged unless separately approved.

## 1.7 Approved Home artwork-name label

The Home artwork-name field label is approved as:

```text
Nama Karya
```

It replaces the original visible label `Nama proyek` for this creation field.

Intent:

- make it explicit that the user is naming the artwork being created;
- stay consistent with the approved `Buat Karya Baru` wording;
- do not shorten this field to `Nama`.

This is a copy decision only. The field behavior, input styling, layout, and data model remain unchanged unless separately approved.

## 1.8 Approved Home artwork-name placeholder

The `Nama Karya` input placeholder is approved as:

```text
Beri nama karyamu
```

Intent:

- keep the instruction concise and immediately understandable;
- use a more inviting creative tone than system-oriented wording such as `Masukkan nama karya`;
- remain consistent with `Buat Karya Baru` and `Nama Karya`.

This is a placeholder-copy decision only. Input behavior, styling, validation, layout, and data model remain unchanged unless separately approved.

## 1.9 Approved Home grid-size information

The ordinary Home creation summary should expose the Grid dimension directly as:

```text
▦ Ukuran Grid 48 × 24
```

Intent:

- use `Ukuran Grid` instead of only `Grid` so the meaning of `48 × 24` is immediately clear;
- show only the Grid dimension that matters to the user;
- do not show the original total Tile count or per-Tile size information in the ordinary user-facing UI.

Preservation requirements:

- keep the exact original Grid icon `▦`;
- preserve the existing visual treatment and information placement unless a separate visual change is explicitly approved;
- internal dimensions or Tile-related implementation data may remain internally and are not removed by this copy/information decision.

## 1.10 Approved Home primary action

The Home creation primary-action button is approved as:

```text
Buat Karya →
```

It replaces the original visible copy:

```text
Buat & buka editor →
```

Intent:

- keep the call to action short and direct;
- stay consistent with the approved `Buat Karya Baru` terminology;
- avoid exposing the navigation step (`buka editor`) when the user only needs to understand the action they are taking.

This is a copy decision only. Preserve the original button icon/arrow, behavior, styling, placement, states, and navigation unless separately approved.

---

# 2. Tool naming rule

Drawing/editing tool names stay in **English**.

The agreed tool labels are:

| Original UI ID | Exact icon from original source | Final tool label | Shortcut |
| --- | --- | --- | --- |
| `E-T01` | `⌖` | `Eyedropper` | `I` |
| `E-T02` | `✎` | `Pencil` | `P` |
| `E-T03` | `◩` | `Fill` | `F` |
| `E-T04` | `◇` | `Eraser` | `E` |
| `E-T05` | `⬚` | `Select` | `S` |
| `E-T06` | `✣` | `Pan` | `Space` temporary pan |

Important:

- only the visible terminology is being standardized here
- icons remain **exactly** the original icons
- shortcuts remain unchanged
- tool behavior remains unchanged
- do not substitute a different icon library or similar-looking glyph

---

# 3. Agreed core terminology

Use the following terminology as the current language baseline.

| Concept | Preferred UI term | Note |
| --- | --- | --- |
| project | `Proyek` | natural Indonesian |
| editor | `Editor` | common software term |
| canvas | `Canvas` | keep English; do not force `Kanvas` |
| grid | `Grid` | keep English; primary visible dimensional concept |
| pixel-art result | `Pixel Art` | use for the visual/artwork result, not as a replacement for `Grid` |
| tile | **not a general-user UI term** | do not surface Tile counts or Tile facts in ordinary UI |
| palette | `Palet` | natural Indonesian |
| color | `Warna` | natural Indonesian |
| source image | `Gambar sumber` | clear Indonesian |
| reference | `Referensi` | natural Indonesian |
| preview | `Preview` | keep familiar software term; do not force `Pratinjau` |
| properties | `Properti` | natural/common UI term |
| detail | `Detail` | natural/common UI term |
| library | `Library` | keep familiar software term |
| palette library | `Library Palet` | preferred over forced `Koleksi palet` |
| shortcut | `Shortcut` | keep familiar software term |
| keyboard shortcuts | `Keyboard Shortcuts` | preferred over forced `Pintasan keyboard` |
| export | `Ekspor` | natural Indonesian |
| blueprint | `Blueprint` | keep production term |
| owner | `Pemilik` | natural Indonesian in role/status copy |
| editor role | `Editor` | keep common role term |
| viewer | `Viewer` | keep common role term; do not force `Hanya lihat` |
| cloud | `Cloud` | keep technical/product term |
| link | `Link` | preferred over forced `tautan` in compact product UI |
| HEX | `HEX` | technical standard; never translate |
| PNG / PDF / CSV | exact format names | never translate format names |

## Grid / Pixel Art / Tile distinction

Keep these concepts separate:

- `Canvas` = working area.
- `Grid` = row/column structure, for example `48 × 24`.
- `Pixel Art` = visual/artwork result produced on the Grid.
- `Tile` = **not displayed as a normal user-facing information concept**.

The original `1.152 Tile` value was only the total number of Grid cells (`48 × 24 = 1.152`). It is not a meaningful material or production count for the intended general-user workflow, so it should not be surfaced as a Tile statistic.

Do not replace `1.152 Tile` with another redundant total-cell label unless a real user need is later approved. Showing `Ukuran Grid 48 × 24` is sufficient when the Grid dimensions are the information that matters.

This is a user-facing information decision. Internal data fields or Admin configuration needed by the implementation are a separate concern and are not renamed or removed by this language contract unless separately approved.

## Device / Perangkat

`Device` and `Perangkat` may be chosen contextually instead of forcing one translation everywhere.

Guideline:

- compact technical label may use `Device`
- natural explanatory sentence may use `perangkat`
- do not mix both words inside the same short control or status unless needed for clarity

This term can be tightened later during page-by-page copy review.

---

# 4. Terms that should not be translated mechanically

Avoid translations that are technically correct but feel unnatural in this application.

Current examples:

| Avoid forced wording | Prefer |
| --- | --- |
| `Pratinjau` | `Preview` |
| `Kanvas` | `Canvas` |
| `Koleksi palet` | `Library Palet` |
| `Pintasan keyboard` | `Keyboard Shortcuts` |
| `Hanya lihat` as a role | `Viewer` |
| `Salin tautan` | `Salin link` |
| `Sesuaikan kanvas` when referring to the familiar view action | `Fit Canvas` or the exact approved contextual copy |

These examples establish the principle. They do not authorize unrelated copy changes.

---

# 5. Indonesian wording that remains natural

Use Indonesian normally where it is clearer and does not sound forced.

Examples:

- `Nama`
- `Gambar sumber`
- `Jumlah warna`
- `Ukuran`
- `Tambah warna`
- `Hapus warna`
- `Simpan`
- `Batal`
- `Perbarui`
- `Minta akses edit`
- `Terhubung`
- `Gagal simpan`
- `Properti`
- `Referensi`
- `Ekspor`

The presence of English product terms does not mean the entire sentence should become English.

---

# 6. Mixed-language sentence rule

Mixed Indonesian/English copy is acceptable when the English word is the natural product term.

Good pattern:

```text
Perbarui Grid dari gambar
Buka Library Palet
Fit Canvas
Salin link
Minta akses edit
```

Avoid awkward half-translations where both words are unfamiliar or redundant.

The sentence should read naturally to an Indonesian user familiar with creative/software tools.

---

# 7. Technical format and data labels

Never translate or creatively rename standardized technical values.

Preserve:

- `HEX`
- `PNG`
- `PDF`
- `CSV`
- file extensions
- numeric dimensions
- coordinates
- keyboard keys
- shortcut notation

Examples:

```text
#000000
PNG + Grid
PDF blueprint
CSV material
Ctrl/Cmd + Z
X 21 · Y 8
```

A later page-by-page copy decision may refine the surrounding Indonesian words, but the technical token itself stays exact.

---

# 8. Copy consistency rule

Once a term is approved for one concept, reuse it consistently across:

- Home
- Editor
- tabs
- panels
- modal headings
- tooltips
- empty states
- error/success states
- collaboration UI
- export UI
- keyboard help

Do not introduce synonyms simply to make copy look varied.

Examples:

- if the concept is called `Canvas`, do not call the same concept `Kanvas` elsewhere
- if the concept is called `Grid`, do not use `Pixel Art` to mean the Grid structure
- if the role is `Viewer`, do not alternate with `Hanya lihat`
- if the surface is `Library Palet`, do not alternately call it `Koleksi Palet`
- do not reintroduce `Tile` statistics into ordinary user-facing UI without explicit approval

---

# 9. Relationship to the original UI baseline

`original-ui-baseline.md` remains unchanged as the factual record of what the upstream UI originally said.

This language contract is the **agreed language direction** for future cleanup.

When reviewing a specific UI element, use this structure:

```text
UI ID: E-T01
Original copy: Pipet
Approved terminology: Eyedropper
Icon: KEEP EXACT ORIGINAL (`⌖`)
Function: KEEP
Visual treatment: KEEP
```

For ordinary copy:

```text
UI ID: ...
Original copy: ...
Proposed copy: ...
Reason: clarity / consistency / natural terminology
Visual: KEEP EXACT ORIGINAL
Function: KEEP unless separately approved
```

---

# 10. Decision boundary

This document records language rules already agreed for the cleanup process.

It does **not** mean every original string has already been rewritten or approved.

Remaining copy must be reviewed page by page:

1. Home / Project Dashboard
2. Project Editor

For each string, preserve the existing UI structure and visual identity unless a separate structural change is explicitly approved.
