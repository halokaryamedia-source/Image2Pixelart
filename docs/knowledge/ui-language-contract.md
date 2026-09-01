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

## Basic UI information clarity rule

Do not simplify or rewrite functional UI copy merely to make it sound more creative if doing so makes basic information less explicit.

For labels, status text, measurements, input guidance, and other functional information:

- clarity comes before personality;
- preserve direct wording when the original already communicates the state or information well;
- do not hide a useful fact only to reduce text;
- avoid decorative rewriting that makes the user infer what a value or state means;
- creative tone is appropriate for Hero, onboarding, and invitations, while operational UI should remain concise and explicit.

Example: `Gambar siap diproses` is preferable to a more promotional rewrite when the purpose of the text is simply to report the current image state.

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

## 1.11 Approved Home preview title

The Home preview heading is approved as:

```text
Preview Karya
```

It replaces the original visible heading pattern:

```text
Preview · 48 × 24
```

Intent:

- make the preview clearly refer to the artwork;
- avoid repeating Grid dimensions that are already exposed through `Ukuran Grid`;
- keep the preview heading concise and consistent with the approved `Karya` terminology.

This is a copy decision only. Preview behavior, artwork rendering, layout, styling, states, and surrounding controls remain unchanged unless separately approved.

## 1.12 Approved Home image-preview status

For the image-upload path, keep the original preview status:

```text
Gambar siap diproses
```

Reason:

- it clearly reports the current state of the uploaded image;
- it is basic functional information and does not need a more promotional rewrite;
- preserving explicit status information follows the basic UI information clarity rule above.

This is a copy decision only. Status behavior, placement, styling, and surrounding preview behavior remain unchanged unless separately approved.

## 1.13 Approved Home blank-preview status

For the `Buat Baru` path, replace the original status `Grid fisik` with:

```text
Ukuran Grid
```

Reason:

- `Grid fisik` comes from the older physical-mosaic production concept and is unclear in the current user flow;
- `Ukuran Grid` directly states the information being represented;
- do not reintroduce physical-production terminology when it no longer helps the user understand the interface.

This is a copy decision only. Preview behavior, placement, styling, and Grid rendering remain unchanged unless separately approved.

## 1.14 Approved Home blank-preview guidance

For the `Buat Baru` path, the preview guidance is approved as:

```text
Mulai Pixel Art baru dari Canvas kosong.
```

It replaces the original copy:

```text
Canvas akan dimulai kosong tanpa tile atau palet.
```

Intent:

- explain the next working context in a simple, user-oriented sentence;
- avoid mentioning `Tile`, which is no longer a general-user UI information concept;
- keep `Pixel Art` and `Canvas` as the approved terms;
- remain clear without adding unnecessary system or implementation language.

This is a copy decision only. Blank-Canvas behavior, preview rendering, layout, and styling remain unchanged unless separately approved.

## 1.15 Approved Home saved-file label

The saved-item section label is approved as:

```text
File Tersimpan
```

It replaces the original visible label:

```text
PROYEK CLOUD
```

Intent:

- tell the user directly that the section contains saved files;
- avoid exposing storage architecture as the main section name;
- use `File` for stored/openable items so the object being managed is immediately clear.

This does not remove or alter the underlying cloud storage/synchronization behavior. It is a user-facing copy decision only.

## 1.16 Approved Home continuation heading

Keep the original heading:

```text
Lanjutkan pekerjaan
```

Reason:

- it is already natural and immediately understandable;
- it clearly communicates that the items below can be reopened and continued;
- no rewrite is needed merely for stylistic variation.

## 1.17 Approved Home saved-file count

The saved-file count/status should use the pattern:

```text
{count} file tersedia di perangkat ini
```

Example:

```text
3 file tersedia di perangkat ini
```

It replaces the original pattern:

```text
{count} proyek terhubung ke perangkat ini
```

Intent:

- use `file` for the stored items rather than the less-specific system term `proyek`;
- keep the relationship to the current device explicit;
- avoid generic wording such as `data`, which does not identify what is available.

## 1.18 Approved Home file-card summary

The ordinary saved-file card summary should show only the basic artwork information:

```text
48 × 24 Grid · 8 warna
```

Use the actual Grid dimensions and palette count for each file.

Do **not** preview the collaboration/access role (`owner`, `editor`, `viewer`, `Pemilik`, or equivalent) in the ordinary file card summary.

Reason:

- the role label is not needed to identify or continue the file;
- a standalone role preview is easy to misread and adds unnecessary complexity;
- access/permission behavior may remain fully functional internally or in a dedicated collaboration surface without being shown in this card summary.

This is a visibility/copy decision only. Do not remove the underlying role/access model or permissions from the implementation unless separately approved.

## 1.19 Approved Home last-modified information

The file card should show its modification date with the pattern:

```text
Terakhir diubah {date}
```

Example:

```text
Terakhir diubah 1 Sep 2026
```

This replaces the less explicit original pattern `Diubah {date}`.

## 1.20 Approved Home continue button

Keep the existing file-card action:

```text
Lanjutkan →
```

The exact original arrow and visual treatment remain unchanged.

## 1.21 Approved Home trash visibility

Files that have been moved to trash must **not** remain mixed into the ordinary `File Tersimpan` list.

Therefore, the ordinary saved-file list should not show the original deleted-item states:

```text
Di tempat sampah
Buka status →
```

If restore or permanent-delete management is needed, use a separate `Sampah` surface rather than mixing deleted files with active saved files.

This is a visibility/workflow decision. It does not authorize removing the underlying `deletedAt`, restore-window, or trash data model.

## 1.22 Approved Home delete-file action

The file menu delete action is approved as:

```text
Hapus File
```

It replaces `Hapus proyek`.

The action continues to move the file to trash rather than immediately deleting it permanently.

## 1.23 Approved Home delete confirmation

The confirmation message is approved as:

```text
Pindahkan file “Nama File” ke Sampah? File dapat dipulihkan selama 7 hari.
```

Use the actual file name in place of `Nama File`.

Intent:

- clearly state that the file moves to `Sampah`;
- make the 7-day recovery window explicit;
- avoid referring to the stored item as a `Karya` or `Proyek` in this file-management context.

## 1.24 Approved Home saved-file loading status

While the saved-file list is being prepared, use:

```text
Membuka daftar file tersimpan…
```

It replaces `Memuat proyek cloud…`.

## 1.25 Approved Home saved-file empty state

When there are no saved files, show only:

```text
Belum ada file tersimpan.
```

Do not expose backend/storage terminology in this message.

## 1.26 Approved Home empty-state helper removal

Remove the original secondary empty-state sentence:

```text
Proyek pertamamu akan muncul di sini dan tersimpan otomatis ke Neon.
```

Do not replace it with another sentence about files appearing or being saved automatically. The empty state is intentionally complete with only `Belum ada file tersimpan.`

## 1.27 Approved Home image-processing state

While the image-based creation flow is running, use:

```text
Memproses gambar…
```

It replaces `Menganalisis gambar…` because it more directly communicates that the image is currently being processed.

## 1.28 Approved Home upload-format information

Keep the existing upload-format and size information:

```text
PNG, JPG, WEBP · Maks. 20 MB
```

Technical format names remain exact.

## 1.29 Approved Home selected-file information

After a file is selected, keep the existing information pattern:

```text
{size} MB · klik untuk mengganti
```

Example:

```text
1.2 MB · klik untuk mengganti
```

The actual file size remains dynamic.

## 1.30 Approved Home initial artwork name

Do not prefill the `Nama Karya` field with the original example value `Mural lobby utama`.

The field should begin empty and use the already approved placeholder:

```text
Beri nama karyamu
```

After an image is uploaded, the image file name may still be used automatically as the initial artwork name.

## 1.31 Approved Home unsupported-format message

The unsupported-format message is approved as:

```text
Gunakan Format File.
```

This is the exact approved visible wording for this state unless later revised.

## 1.32 Approved Home oversized-file message

The oversized-file message is approved as:

```text
Ukuran file melebihi 20 MB.
```

It replaces `Ukuran gambar melebihi 20 MB.` so the message refers directly to the uploaded file.

## 1.33 Approved Home physical-size information

Keep the physical dimensions visible in Preview, but present them strictly as informational reference rather than editable setup fields.

Use the label:

```text
Ukuran Fisik
```

The existing physical dimension values remain visible on the Preview measurement guides, for example:

```text
240 cm × 120 cm
```

Requirements:

- do not turn the Preview measurement values into inputs or controls;
- do not imply that the user must configure the physical dimensions in the ordinary Home flow;
- keep the measurement guides and original visual treatment unless separately approved.

## 1.34 Approved Home image-preview guidance

For the `Upload Gambar` path, use:

```text
Gambar akan diproses menjadi Pixel Art dengan palet 8 warna.
```

It replaces the original mixed/technical wording:

```text
Gambar akan dianalisis lokal dan dibuat menjadi suggestion 8 warna.
```

Intent:

- describe the visible outcome directly;
- avoid exposing implementation detail such as local analysis;
- use the approved terms `Pixel Art` and `palet`.

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
| project | `Proyek` | natural Indonesian where the project concept itself is intentionally exposed |
| stored item | `File` | preferred for saved/open/delete item management on Home |
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
| owner | `Pemilik` | natural Indonesian when a dedicated role/status surface intentionally exposes it |
| editor role | `Editor` | keep common role term |
| viewer | `Viewer` | keep common role term; do not force `Hanya lihat` |
| cloud | `Cloud` | keep technical/product term when the storage architecture itself must be exposed |
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
- if saved items are called `File` on Home, do not switch the same saved-item controls back to `Proyek` or `Karya`
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