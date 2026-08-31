# Original UI Baseline

Status: factual baseline for UI/UX planning and owner handoff

## Source of truth

This document maps the **original upstream UI** from:

- Repository: `achmadawdi/image-to-pixel-art`
- Commit: `7904ba38d9ea38eec308c04805041ccd75bd6914`
- Original root tree: `1d507690eb79b60fb1c1e73ac3f070f90a23fcfb`

This baseline intentionally describes the original interface as implemented at that commit. It is **not** a redesign brief, simplification proposal, implementation plan, or description of later experimental UI changes in this fork.

Use it to make future UI instructions precise:

```text
Original UI Baseline
→ identify exact UI ID
→ describe observed problem separately
→ record proposed change separately
→ preserve every unaffected UI ID
```

If current fork code and this document differ, this document still represents the **original upstream UI baseline**. Current implementation truth must be inspected separately.

---

# 1. Original UI surface map

The original application has two primary user-facing surfaces.

| ID | Surface | Route | Primary owner |
| --- | --- | --- | --- |
| `H` | Home / project dashboard | `/` | `src/lib/components/HomeView.svelte` |
| `E` | Mosaic editor | `/project/[id]` | `src/lib/components/EditorView.svelte` |

Supporting UI components:

| ID | Component | Responsibility |
| --- | --- | --- |
| `C` | `MosaicCanvas.svelte` | grid rendering, canvas input, ruler, coordinates, keyboard navigation |
| `CR` | `VisualCropper.svelte` | image crop, positioning, zoom |
| `CO` | `CollaborationBar.svelte` | realtime participants, edit handoff, project link |
| `TH` | `CloudProjectThumbnail.svelte` | Home cloud-project thumbnail |
| `M` | modal surfaces inside `EditorView.svelte` | canvas settings, palette library, keyboard shortcuts |

Other UI-relevant owners:

- `src/routes/+page.svelte` — Home loading, error, device/cloud orchestration.
- `src/routes/project/[id]/+page.svelte` — project loading, deleted state, editor/viewer state, realtime/save state.
- `src/lib/panel-preferences.ts` — default visibility of left/right/quick panels.
- `src/lib/editor-shortcuts.ts` — global editor shortcut mapping.
- `src/lib/styles/global.css` — global colors, body treatment, focus state, base typography.
- `src/routes/+layout.svelte` — fonts, favicon, metadata.

---

# 2. Global visual language

## G-01 — Typography

Primary UI font:

- `Poppins`

Heading / identity font:

- `Readex Pro`

Both are loaded from Google Fonts in `src/routes/+layout.svelte`.

## G-02 — Global color tokens

| Token | Value | Original role |
| --- | --- | --- |
| `--ink` | `#21302f` | main text |
| `--muted` | `#66746f` | secondary text |
| `--line` | `#e4d9b6` | borders/dividers |
| `--paper` | `#fffef9` | paper/card surfaces |
| `--accent` | `#ebb734` | MIVUBI yellow / focus / selected accents |
| `--accent-dark` | `#e4991c` | strong yellow accent |
| `--forest` | `#005a2a` | primary action / active green |
| `--cyan` | `#f0ce61` | legacy token; yellow-toned value in original source |
| `--brand-yellow-50` | `#fefaec` | light brand background |
| `--brand-yellow-100` | `#faf1cb` | light brand surface |
| `--brand-yellow-300` | `#f0ce61` | brand yellow |
| `--brand-yellow-400` | `#ebb734` | brand yellow |
| `--brand-yellow-500` | `#e4991c` | dark brand yellow |
| `--danger` | `#9b472d` | destructive/error |

Body background:

- base `#fefaec`
- radial yellow glow near the upper-left corner

## G-03 — Focus state

`button`, `input`, and `select` use a visible yellow focus ring:

- `3px solid rgba(235, 183, 52, 0.42)`
- `outline-offset: 2px`

This is part of both the visual and accessibility baseline.

## G-04 — Static identity assets

Original static UI assets include:

- `static/mivubi-logo.png`
- `static/favicon.ico`
- `static/og.png`

The MIVUBI logo is reused across Home, Editor, loading/status states, favicon, and social metadata.

## G-05 — General component character

Recurring visual properties:

- cream/off-white surfaces rather than pure-white application chrome
- thin beige/gray borders
- compact rounded corners, usually `6–10px`
- dark forest green for primary/active states
- yellow accent used selectively rather than as the dominant surface color
- soft low-opacity shadows
- compact control density
- simple glyph/icon language already embedded in source

These are baseline visual characteristics. A future simplification task should not treat them as permission to introduce a new design system unless explicitly requested.

---

# 3. Home / Project Dashboard (`H`)

Primary owner: `src/lib/components/HomeView.svelte`

Route/controller: `src/routes/+page.svelte`

## H-01 — Home top bar

Original left-to-right structure:

```text
[MIVUBI logo + PIXEL MOSAIC PLANNER]
[Proyek]
                                    [☁ device name]
                                    [Buka file proyek]
```

### H-01A — Brand

- MIVUBI logo, `36 × 36` visual size.
- Text: `MIVUBI`.
- Subtitle: `PIXEL MOSAIC PLANNER`.
- Brand links to `/`.

### H-01B — Navigation

- Single visible navigation item: `Proyek`.
- Links to `#projects`.
- Active state uses a green bottom border.

### H-01C — Device control

Visible format:

```text
☁ {deviceName}
```

Interaction:

- clicking calls rename-device behavior
- browser prompt copy: `Nama yang ditampilkan pada daftar pengguna aktif:`
- title/tooltip contains the raw Device ID

### H-01D — Open project file

Visible control:

```text
Buka file proyek
```

- includes existing folder-like SVG icon
- accepts `.json`, `.pixelgrid.json`, and JSON MIME input

---

# 4. Home hero

## H-02 — Intro block

Original copy:

```text
MIVUBI · PIXEL MOSAIC PLANNER

Dari gambar ke grid presisi.

Siapkan ukuran dan gambar, lalu buat grid produksi dalam hitungan detik.
```

Visual hierarchy:

- eyebrow uses dark yellow accent
- hero heading uses `Readex Pro`
- `grid presisi.` is green
- supporting sentence uses muted text

---

# 5. Home Quick Start

## H-03 — Quick Start container

Original layout is a single large two-column card:

```text
┌────────────────────────────┬──────────────────────────────┐
│ Setup / creation controls  │ Physical grid preview        │
└────────────────────────────┴──────────────────────────────┘
```

Desktop composition:

- left approximately `40%`
- right consumes remaining width
- shared outer card
- left/right separated by border
- rounded outer corners
- soft shadow

## H-04 — Start mode tabs

Two equal tabs:

### H-04A — From image

```text
▧ Dari gambar
```

- default mode
- internal value: `image`

### H-04B — Blank canvas

```text
▦ Canvas kosong
```

- internal value: `blank`

Active treatment:

- pale green surface
- green border
- green text

Inactive treatment:

- off-white surface
- gray text

---

# 6. Home — From image mode

## H-05 — Image upload dropzone

Only visible in `Dari gambar` mode.

Empty state:

```text
↥
Unggah gambar atau seret ke sini
PNG, JPG, WEBP · Maks. 20 MB
```

Supported:

- PNG
- JPEG/JPG
- WebP
- maximum 20 MB
- click selection
- drag and drop

Selected-file state:

- filename replaces empty-state title
- file size displayed in MB
- helper indicates click to replace

Validation errors:

- invalid MIME → `Gunakan PNG, JPEG, atau WebP.`
- too large → `Ukuran gambar melebihi 20 MB.`

When an image is selected, the source filename is converted into the project-name field value.

---

# 7. Home — Project setup fields

## H-06 — Project name

Original label:

```text
Nama proyek
```

Original default:

```text
Mural lobby utama
```

Maximum length: `200` characters.

## H-07 — Width

Original label:

```text
Lebar
```

Default:

```text
240 cm
```

Numeric input:

- min `0.1`
- max `100000`
- step `0.1`

## H-08 — Height

Original label:

```text
Tinggi
```

Default:

```text
120 cm
```

Same numeric constraints as width.

## H-09 — Square tile size

Original label:

```text
Ukuran tile (persegi)
```

Default:

```text
5 cm
```

Same numeric constraints as width/height.

---

# 8. Home — Grid calculation result

## H-10 — Grid result summary

Original three-cell horizontal summary:

```text
┌──────────────┬──────────────┬──────────────┐
│ ▦ 48 × 24   │ ⠿ 1.152     │ ▥ 5 cm       │
│   grid       │   tile       │   per tile   │
└──────────────┴──────────────┴──────────────┘
```

The values are derived from physical width, height, and cell size.

Invalid state:

- card changes to error styling
- validation reason displayed
- when available, suggested cell sizes are appended with `Coba ... cm.`

---

# 9. Home — Primary create action

## H-11 — `Buat & buka editor`

Original primary button:

```text
Buat & buka editor →
```

During creation:

```text
Menganalisis gambar…
```

Disabled when:

- grid is invalid
- cloud/device initialization is not ready
- project creation is already running
- mode is image but no image file is selected

Original behavior in image mode:

1. create project
2. convert source image
3. suggest palette
4. apply palette
5. apply cells
6. replace source image
7. create cloud project
8. route to `/project/{id}`

Original behavior in blank mode:

1. create empty project
2. create cloud project
3. route to Editor

---

# 10. Home — Physical preview panel

## H-12 — Preview header

Left:

```text
Preview · 48 × 24
```

Right, before selected image:

```text
Grid fisik
```

Right, with selected image:

```text
Gambar siap diproses
```

## H-13 — Width marker

Horizontal dimension treatment above grid:

```text
──────── 240 cm ────────
```

## H-14 — Grid/image preview

- aspect ratio follows calculated columns/rows
- grid overlay remains above image
- source image uses `object-fit: cover`
- selected image opacity about `0.72`
- image saturation reduced
- grid overlay uses thin green-gray lines

## H-15 — Height marker

Vertical physical dimension marker to the right of preview:

```text
120 cm
```

## H-16 — Preview helper text

Image mode:

```text
Gambar akan dianalisis lokal dan dibuat menjadi suggestion 8 warna.
```

Blank mode:

```text
Canvas akan dimulai kosong tanpa tile atau palet.
```

---

# 11. Home — Project list

## H-17 — Section heading

Original:

```text
PROYEK CLOUD
Lanjutkan pekerjaan
{N} proyek terhubung ke perangkat ini
```

## H-18 — Loading state

```text
Memuat proyek cloud…
```

## H-19 — Empty state

```text
Belum ada proyek cloud.
Proyek pertamamu akan muncul di sini dan tersimpan otomatis ke Neon.
```

## H-20 — Project card

Original card structure:

```text
┌────────────────────┬────────────────────────────────────┐
│                    │ Project name                    ⋮  │
│     Thumbnail      │ 48 × 24 grid · 8 warna · owner   │
│                    │ Diubah 31 Agu 2026                 │
│                    │ Lanjutkan →                        │
└────────────────────┴────────────────────────────────────┘
```

Visible metadata:

- project name
- `columns × rows grid`
- palette color count
- raw collaboration role: `owner`, `editor`, `viewer`
- last modified date

Deleted state:

```text
Di tempat sampah
Buka status →
```

## H-21 — Cloud project thumbnail

Owner: `CloudProjectThumbnail.svelte`.

- canvas-rendered preview
- `image-rendering: pixelated`
- based on preview rows/columns/cells and project palette
- no controls inside thumbnail

## H-22 — Project overflow menu

Trigger:

```text
⋮
```

Menu item:

```text
Hapus proyek
```

Delete is disabled unless:

- role is `owner`
- project is not already deleted

Browser confirmation is requested before deletion.

---

# 12. Home route-level states

## H-S01 — Device initialization

```text
Menyiapkan identitas perangkat…
```

## H-S02 — Root error toast

Bottom floating red error surface:

```text
{error message}   ×
```

Examples of route-level error domains include:

- cloud initialization
- project creation
- project deletion
- file import

---

# 13. Editor overall architecture

## E-01 — Desktop workspace

Original Editor is a dense desktop/workspace-first interface:

```text
┌──────────────────────────────────────────────────────────────┐
│ Editor header                                                │
├────────────────┬───────────────────────────────┬─────────────┤
│ Left panel     │ Canvas workspace              │ Right panel │
│ 270 px         │ flexible, minimum ~440 px     │ 290 px      │
└────────────────┴───────────────────────────────┴─────────────┘
```

Original editor shell:

- full viewport height
- minimum height `680px`
- fixed header height `56px`
- body uses CSS grid

## E-02 — Default panel visibility

From `panel-preferences.ts`:

```text
left  = true
right = true
quick = true
```

Panel preference key:

```text
mivubi.editor.panels.v1
```

Preferences persist to `localStorage`.

---

# 14. Editor header

## E-H01 — Back button

```text
←
```

- icon button
- returns to project list/Home through route controller

## E-H02 — Editor brand

```text
[MIVUBI logo]
MIVUBI
EDITOR
```

## E-H03 — Project name input

- editable directly in header
- rename commits on blur
- disabled for viewer/non-editable state

## E-H04 — Canvas metric chip

Visible form:

```text
240 × 120 cm · 48 × 24 sel
```

Important: this is an interactive **button**, not just read-only text.

Original click behavior:

- opens Canvas Size modal

Disabled if user is not editable.

## E-H05 — Collaboration bar

Rendered when collaboration props exist.

Detailed mapping: section `CO` below.

## E-H06 — Panel picker

Visible button:

```text
▦ Panel⌄
```

Popover checkboxes:

```text
☑ Panel referensi
☑ Panel palet
☑ Quick palette
```

## E-H07 — Save state

Possible labels:

```text
Menyimpan…
Gagal simpan
Tersimpan cloud
Tersimpan lokal
```

Normal status dot: green.

Error status dot: danger color.

## E-H08 — Shortcut/help button

```text
?
```

Opens keyboard-shortcut modal.

## E-H09 — Export format select

Original visible choices:

```text
PDF blueprint
PNG transparan
PNG + grid
CSV material
CSV matriks
File proyek
```

## E-H10 — Export action

```text
Ekspor ↓
```

While exporting:

```text
Menyiapkan…
```

Shortcut: `Ctrl/Cmd + E`.

---

# 15. Editor viewer/read-only state

## E-S01 — Viewer banner

When not editable:

```text
Mode viewer · hanya editor aktif yang dapat mengubah proyek
```

Route-level editable condition is:

```text
activeEditorDeviceId === device.id
AND realtimeState === 'connected'
```

UI effects include:

- non-editable controls disabled
- left/right editing panel interactions blocked
- side panels visually desaturated
- tool forced toward pan/picker-compatible behavior

---

# 16. Editor left panel

## E-L01 — Panel title

```text
Referensi gambar                           ‹
```

`‹` closes the panel.

## E-L02 — Tabs

Original three tabs:

```text
Referensi | Rekonstruksi | Properti
```

---

# 17. Left panel — Referensi tab

## E-L-R01 — Source image upload/preview

No-source state:

```text
Klik untuk memilih gambar sumber
```

Source-present state:

- image is displayed with `object-fit: contain`
- overlay copy:

```text
▧ Klik untuk ganti gambar
```

Processing overlay:

```text
▧ Memproses gambar…
```

Accepted input:

- PNG
- JPEG
- WebP

## E-L-R02 — Placement segmented control

```text
Isi bingkai | Tampilkan utuh
```

Internal values:

- `crop`
- `fit`

If placement is `crop`, `VisualCropper` becomes visible.

## E-L-R03 — Stale reconstruction state

Visible only when source/crop/render inputs have changed after the current grid result.

Original copy:

```text
Preview berubah
Grid masih memakai hasil sebelumnya.
```

Action is condition-dependent:

```text
Atur rekonstruksi
```

or:

```text
Perbarui rekonstruksi
```

## E-L-R04 — Reconstruction summary card

```text
Rekonstruksi (ringkas)
Gaya: Photo · gradasi halus
Jumlah warna: 8
[Buka rekonstruksi]
```

Alternative render-mode label:

```text
Contour · shape tegas
```

---

# 18. Visual Cropper (`CR`)

Owner: `VisualCropper.svelte`.

## CR-01 — Crop frame

- draggable image position
- fixed target aspect ratio derived from project columns/rows
- rule-of-thirds overlay
- pointer capture during drag

Normal helper:

```text
Seret untuk mengatur crop
```

When zoom is under 100%:

```text
Ruang transparan akan menjadi sel kosong
```

## CR-02 — Crop zoom

```text
ZOOM                              100%
[range slider]

Reset
```

Reset returns to centered/base crop.

## CR-03 — Zoom helper

```text
Geser ke kiri di bawah 100% untuk mengecilkan gambar dan menambah ruang kosong.
```

## CR-04 — Keyboard crop movement

- Arrow keys move crop approximately 1% of active crop dimensions.
- `Shift + Arrow` moves approximately 3%.

---

# 19. Left panel — Rekonstruksi tab

## E-L-C01 — Heading

```text
Rekonstruksi
```

## E-L-C02 — Helper copy

Original helper introduces internal concepts directly to user:

```text
Suggestion tidak mengubah grid. Saat suggestion digunakan, warna grid langsung disesuaikan; raster ulang hanya diperlukan setelah sumber gambar, crop, atau gaya hasil berubah.
```

## E-L-C03 — Render style

Label:

```text
Gaya hasil
```

Options:

```text
Contour · shape tegas
Photo · gradasi halus
```

Internal values:

- `contour`
- `photo`

## E-L-C04 — Suggestion color count

Label:

```text
Jumlah warna
```

Range:

- minimum `2`
- maximum `32`

## E-L-C05 — Stale warning

```text
Sumber gambar, crop, ukuran, atau gaya hasil berubah. Raster ulang untuk memperbarui bentuk grid.
```

## E-L-C06 — Reconstruction actions

Possible actions:

```text
Buat suggestion
Gunakan suggestion
Raster ulang dari gambar
```

Visibility/availability depends on:

- source image present
- suggested palette present
- active palette differs from suggested palette
- palette lock state
- project palette available
- processing state

## E-L-C07 — Suggested palette strip

When available, suggested colors render as a horizontal/flex swatch strip.

---

# 20. Left panel — Properti tab

## E-L-P01 — Properties

Six original data cards:

```text
Ukuran fisik   240 × 120 cm
Grid           48 × 24
Tile           5 cm
Total          1.152
Terisi         {filled cell count}
Kosong         {empty cell count}
```

## E-L-P02 — Canvas settings action

```text
Atur ukuran canvas
```

Opens Canvas Size modal.

---

# 21. Canvas workspace structure

Original middle workspace order:

```text
Context bar
↓
Tool rail + MosaicCanvas
↓
View controls
↓
Quick palette
```

---

# 22. Context bar

## E-C01 — Active swatch

- square active-color indicator
- falls back to white when no selected color

## E-C02 — Tool instruction

Original context messages:

```text
Picker → Klik sel untuk mengambil warna
Pan    → Drag kanvas untuk menggeser
Select → Drag untuk memilih sel
Other  → Warna aktif
```

## E-C03 — Selection context

When Select tool has active selection:

```text
{N} sel dipilih
[Isi warna]
[Kosongkan]
[×]
```

## E-C04 — Undo / Redo

```text
↶  ↷
```

Undo shortcut:

- `Ctrl/Cmd + Z`

Redo shortcuts:

- `Ctrl/Cmd + Shift + Z`
- `Ctrl/Cmd + Y` is also recognized by shortcut resolver

---

# 23. Drawing tool rail

Original tool rail exposes all six tools simultaneously.

## E-T01 — Picker

```text
⌖
Pipet
```

Shortcut: `I`.

Behavior: selects palette slot from clicked cell.

## E-T02 — Pencil

```text
✎
Pensil
```

Shortcut: `P`.

Disabled when:

- no active palette slot
- user is not editable

## E-T03 — Fill

```text
◩
Isi
```

Shortcut: `F`.

Flood-fills a connected region.

Disabled when:

- no active palette slot
- user is not editable

## E-T04 — Eraser

```text
◇
Hapus
```

Shortcut: `E`.

Writes `EMPTY_CELL`.

## E-T05 — Select

```text
⬚
Select
```

Shortcut: `S`.

Drag creates rectangular cell selection.

## E-T06 — Pan

```text
✣
Geser
```

Temporary pan is also available with Space.

Active tool styling:

- forest-green background
- white glyph/text

Disabled styling:

- reduced opacity

---

# 24. Mosaic Canvas (`C`)

Owner: `MosaicCanvas.svelte`.

## C-01 — Empty cells

Checkerboard colors:

- `#E3E1DA`
- `#F2F0EB`

Represents empty/transparent cells.

## C-02 — Filled cells

Color source:

```text
project.palette[slot].hex
```

Canvas drawing has `imageSmoothingEnabled = false`.

## C-03 — Grid lines

Grid is drawn only when:

- `showGrid` is true
- visual cell size is at least about `3px`

Grid is more visually pronounced at larger cell sizes.

## C-04 — Rulers

- top ruler
- left ruler
- numbering starts at `1`
- ruler-label density automatically reduces when cell size becomes small

## C-05 — Selection overlay

- translucent green fill
- green dashed outline

## C-06 — Keyboard cursor

Focused keyboard cell uses an orange outline.

## C-07 — Workspace/scroller background

- gray/cream background
- 18px dotted radial pattern
- canvas itself has drop shadow

---

# 25. Canvas pointer interactions

## C-I01 — Pencil stroke

- click/drag paints
- line interpolation between successive cells prevents holes during fast drag

## C-I02 — Eraser stroke

Same stroke model as Pencil but writes empty sentinel.

## C-I03 — Fill

Single click flood-fills connected matching region.

## C-I04 — Picker

- clicking filled cell selects its palette slot
- clicking empty cell changes tool to Eraser

## C-I05 — Select

Pointer drag creates rectangular selection.

## C-I06 — Pan

Pan is activated by:

- Pan tool
- middle mouse button
- `Alt`
- non-editable/viewer state

## C-I07 — Wheel zoom

Requires `Ctrl` or `Meta` + wheel.

Zoom is clamped to approximately:

```text
35% – 600%
```

---

# 26. Canvas keyboard interaction

The `<canvas>` is focusable with `tabindex="0"`.

## C-K01 — Movement

```text
Arrow Left/Right/Up/Down → move active keyboard cell
Home                    → first column
End                     → last column
```

## C-K02 — Apply active tool

```text
Enter
```

Applies active tool to keyboard-focused cell.

## C-K03 — Pan keyboard behavior

When Pan tool is active, Arrow keys scroll by approximately `64px`.

## C-K04 — Auto-centering

Keyboard navigation scrolls the scroller to keep focused cell near viewport center.

## C-K05 — Canvas accessibility label

Original canvas aria-label communicates:

- number of columns/rows
- Arrow-key navigation
- Enter to use active tool
- Space to pan

---

# 27. Canvas hover / coordinate chip

## C-H01 — Filled cell hover

Displays:

```text
■ C{column} / R{row} #HEX
```

## C-H02 — Empty cell hover

Displays:

```text
C{column} / R{row}
SEL KOSONG
```

## C-H03 — Keyboard focus state

Adds:

```text
FOKUS KEYBOARD
```

---

# 28. View controls

## E-V01 — Grid toggle

```text
☑ Grid
```

Shortcut: `G`.

## E-V02 — Zoom out

```text
−
```

## E-V03 — Zoom value

```text
100%
```

## E-V04 — Zoom in

```text
＋
```

## E-V05 — Fit

```text
Fit
```

Shortcut: `0`.

Resets zoom to 1 and asks canvas to re-center.

## E-V06 — Current coordinates

No hover:

```text
X — · Y —
```

Hover:

```text
X {column} · Y {row}
```

---

# 29. Quick Palette

## E-Q01 — Active color

```text
Aktif
■
```

## E-Q02 — Palette slots

- every project color is displayed horizontally
- each button shows slot number and swatch
- selected slot gets accent-yellow border
- slots 1–9 map to keyboard keys `1–9`

## E-Q03 — Empty state

When palette is empty:

```text
+ Tambah warna
```

Click:

- ensures right panel is open
- switches right panel to Palette tab

## E-Q04 — Close

```text
×
```

Closes Quick Palette via persisted panel preference.

---

# 30. Editor right panel

## E-R01 — Panel title

```text
Palet · {N} warna                         ›
```

`›` closes right panel.

## E-R02 — Tabs

```text
Palet | Detail
```

---

# 31. Right panel — Palet tab

## E-R-P01 — Palette overview

- two-column color-card grid
- each card contains:
  - large swatch
  - slot number
  - name or HEX
  - lock indicator if locked
- selected card uses accent-yellow border

## E-R-P02 — Empty state

Original copy:

```text
Belum ada warna. Tambah HEX atau ambil suggestion dari gambar.
```

## E-R-P03 — Manual HEX input

```text
[#000000] [+ Tambah warna]
```

Maximum project palette size: `32` colors.

## E-R-P04 — Palette library action

```text
Buka library palet
```

---

# 32. Right panel — Detail tab

## E-R-D01 — Color detail header

For selected color:

```text
[large swatch]
WARNA {slot}
{name or HEX}
{N} tile
[lock state]
```

## E-R-D02 — HEX input

- editable when unlocked
- duplicate HEX rejected
- disabled when locked

## E-R-D03 — Optional color name

Label:

```text
Nama opsional
```

Placeholder:

```text
Tanpa nama
```

Max length: `80`.

## E-R-D04 — Native color picker

`<input type="color">` updates selected color HEX.

## E-R-D05 — More menu

Trigger:

```text
•••
```

Actions:

```text
Simpan sebagai palet
Hapus warna
```

## E-R-D06 — Lock state

Unlocked/locked indicators:

```text
⌑
🔒
```

Locked color remains usable for painting, but cannot be edited or deleted.

---

# 33. Global Palette Library modal

## M-P01 — Header

Eyebrow:

```text
GLOBAL PALETTE LIBRARY
```

Main title is either:

```text
Pilih palet
```

or:

```text
Simpan palet
```

## M-P02 — Library helper

Original copy explains that applying another palette can remap current grid colors without re-rasterizing.

## M-P03 — Current project palette

When available:

```text
Palet proyek saat ini
AKTIF · {N} warna
[swatches]
✓ Sedang digunakan
```

## M-P04 — Suggested palette

```text
Suggestion proyek
SUGGESTION PROYEK · {N} warna
```

Possible status/action:

```text
✓ Sama dengan palet aktif
```

or:

```text
Gunakan palet
```

## M-P05 — Global palettes

Includes:

- built-in palettes
- user-created palettes

Built-in original default palette:

```text
Arsitektur Pixel Default
```

Built-in colors:

1. Hitam gelap — `#101418`
2. Abu-abu gelap — `#343B40`
3. Abu-abu sedang — `#737C80`
4. Putih tulang — `#E8ECE8`
5. Biru cyan — `#2AA6B4`
6. Hijau — `#397A20`
7. Cokelat — `#744126`
8. Kuning-tan — `#B78850`

## M-P06 — User palette actions

- apply user palette
- delete user palette
- built-in palettes cannot be deleted

## M-P07 — Create palette action

```text
+ Buat palet sendiri
```

---

# 34. Save Palette form

## M-P-C01 — Palette name

```text
Nama palet
```

Maximum `80` characters.

## M-P-C02 — Color row

Each row contains:

```text
[color picker] [#HEX] [Nama opsional] [×]
```

## M-P-C03 — Constraints

- minimum 1 color
- maximum 32 colors
- all HEX values valid
- duplicate HEX values rejected

## M-P-C04 — Add color

```text
+ Tambah warna
```

## M-P-C05 — Footer actions

```text
Kembali
Simpan palet
```

---

# 35. Canvas Size modal

## M-C01 — Heading

```text
PROPERTI CANVAS
Ukuran dan grid
```

## M-C02 — Helper

```text
Grid dihitung otomatis. Isi canvas lama disesuaikan jika resolusi berubah.
```

## M-C03 — Inputs

```text
Lebar       Tinggi
[240 cm]    [120 cm]

Ukuran tile
[5 cm]
```

## M-C04 — Result summary

```text
GRID BARU
48 × 24

TOTAL SEL
1.152
```

## M-C05 — Invalid state

- validation reason visible
- apply button disabled

## M-C06 — Actions

```text
Batal
Terapkan ukuran
```

Applying a changed grid may resize old cells and mark source-image reconstruction stale.

---

# 36. Keyboard Shortcuts modal

## M-K01 — Heading

```text
EDITOR
Keyboard shortcuts
```

Helper:

```text
Shortcut dinonaktifkan ketika kamu sedang mengetik pada input atau form.
```

## M-K02 — Tool shortcuts

```text
P       Pensil
F       Isi area
E       Hapus
I       Pipet
S       Select
Space   Tahan untuk geser
```

## M-K03 — Project shortcuts

```text
Ctrl/Cmd Z       Undo
Ctrl/Cmd ⇧ Z     Redo
Ctrl/Cmd S       Simpan sekarang
Ctrl/Cmd E       Ekspor format terpilih
Esc              Tutup atau batalkan
```

Shortcut resolver additionally recognizes `Ctrl/Cmd + Y` for Redo.

## M-K04 — View/color shortcuts

```text
1–9     Pilih warna palet
G       Tampilkan/sembunyikan grid
+       Perbesar
−       Perkecil
0       Fit canvas
?       Buka bantuan
```

---

# 37. Export behavior

## E-X01 — PDF Blueprint

Filename:

```text
{name}-blueprint.pdf
```

If predicted page count exceeds 100, browser confirmation is shown before export.

## E-X02 — PNG transparent

Exports project PNG without grid.

## E-X03 — PNG + grid

Exports project PNG with grid.

## E-X04 — CSV material

Exports material-list CSV.

## E-X05 — CSV matrix

Exports grid-matrix CSV.

## E-X06 — Project file

Filename extension:

```text
.pixelgrid.json
```

Export success/failure uses Editor toast feedback.

---

# 38. Collaboration (`CO`)

Owner: `CollaborationBar.svelte`.

## CO-01 — Roster trigger

Example editable state:

```text
● 1 aktif · Kamu editor
```

Other possible forms:

```text
● 2 aktif · Editor: {displayName}
● 2 aktif · Tanpa editor
```

Connection dot:

- connected → green
- disconnected/connecting → brown/orange warning

## CO-02 — Request edit

Visible when current user is not active editor:

```text
Minta edit
```

or while already requesting:

```text
Batalkan request
```

## CO-03 — Roster popover heading

```text
Kolaborasi
Revision {N} · {connectionState}
[Salin link]
```

After successful copy:

```text
Tersalin
```

## CO-04 — Participant row

Contains:

- single-letter avatar
- display name
- `· kamu` when current device
- role/status label

Possible original role/status labels:

```text
Pemilik · Editor aktif
Pemilik
Editor aktif
Meminta akses edit
Viewer
```

## CO-05 — Grant editor

Owner/current editor can see:

```text
Berikan
```

or:

```text
Jadikan editor
```

## CO-06 — Device footer

Original popover footer exposes:

```text
Device kamu: {deviceId}
```

---

# 39. Save and realtime state model

Original project route defines editable state as:

```text
current device is active editor
AND realtime state is connected
```

Timing behavior in original route:

- local/cloud draft save debounce ~`350ms`
- realtime project broadcast debounce ~`150ms`
- durable cloud save debounce ~`2000ms`

Save-state UI values:

```text
saved
saving
error
```

When user is not active editor, incoming realtime project state can replace current viewer state.

---

# 40. Project route loading/deleted/error states

## E-S02 — Deleted project

```text
[MIVUBI logo]
Proyek berada di tempat sampah
Data akan dihapus permanen {purge date / dalam tujuh hari}
```

If current device is owner:

```text
Pulihkan proyek
```

Always available:

```text
Kembali ke dashboard
```

## E-S03 — Loading project

```text
[MIVUBI logo]
Memuat proyek cloud…
```

## E-S04 — Project-route error

- error text
- `Kembali ke dashboard`

## E-S05 — Search indexing

Project route sets:

```html
<meta name="robots" content="noindex,nofollow" />
```

---

# 41. Toast / feedback system

## E-F01 — Success toast

```text
✓ {message}
```

## E-F02 — Error toast

```text
! {message}   ×
```

Feedback domains include:

- save
- export
- palette operations
- undo/redo
- image conversion
- canvas resize
- source-image upload/change

---

# 42. Original UI state matrix

| State | Original visible consequence |
| --- | --- |
| Home device not ready | device initialization screen |
| Home cloud error | root error toast |
| Home projects loading | project-list loading state |
| Home no projects | cloud empty state |
| Home image selected | filename + image grid preview |
| Home invalid grid | invalid grid summary + reason |
| Project loading | project status screen |
| Project deleted | trash status screen |
| Project load error | project error status |
| Editable | full edit controls enabled |
| Viewer | viewer banner + edit UI disabled/desaturated |
| Collaboration connected | green online dot |
| Collaboration disconnected | warning/offline dot |
| Requesting edit | request button changes to cancel state |
| Saving | `Menyimpan…` |
| Saved | cloud/local saved text |
| Save error | `Gagal simpan` |
| No source image | source empty state |
| Source image present | source preview + placement controls |
| Crop placement | VisualCropper visible |
| Fit placement | VisualCropper hidden |
| Reconstruction stale | warning/update card visible |
| Processing image | source/conversion controls disabled or processing text |
| Palette empty | Pencil/Fill unavailable; empty palette actions shown |
| Palette populated | drawing tools and swatches available |
| Selected color | Detail panel populated |
| Locked color | color editing/deletion disabled |
| Selection active | selection actions in context bar |
| Exporting | export controls disabled/loading |
| Left panel hidden | canvas expands left |
| Right panel hidden | canvas expands right |
| Both panels hidden | canvas occupies body width |
| Quick palette hidden | bottom quick palette removed |

---

# 43. Original UI vocabulary exposed to user

Original source directly exposes the following concepts in visible UI/copy:

```text
Project
Device
Cloud
Owner / Editor / Viewer
Revision
Realtime connection
Canvas physical size
Grid
Cell / tile count
Source image
Crop
Fit
Reconstruction
Render mode
Suggestion
Palette
HEX
Locked color
Global palette
Drawing tools
Selection
Coordinates
PDF blueprint
PNG
CSV
Project file
```

This vocabulary list is factual. Whether each term should remain exposed is a separate future UX decision.

---

# 44. Responsive behavior

## R-H01 — Home tablet/narrow layout

At narrower widths:

- Quick Start changes from two columns to one
- setup moves above preview
- project cards change to one column

## R-H02 — Home small mobile

At small widths:

- brand subtitle hidden
- main nav hidden
- open-file control becomes compact/icon-oriented
- width/height fields stack
- grid result cards stack vertically
- right-side vertical height dimension marker can disappear

## R-E01 — Collaboration responsive behavior

Around `900px` and below:

- roster trigger collapses to status-dot-sized control
- request-edit button is hidden from header
- collaboration popover width becomes viewport constrained

## R-E02 — Shortcut modal

Below approximately `700px`:

- shortcut sections change from three columns to one

## R-E03 — Palette library action layout

At very narrow widths, palette library actions stack/widen.

## R-E04 — Editor product posture

Despite selected responsive accommodations, the original Editor remains a **desktop/workspace-first UI**, not a mobile-first editor.

---

# 45. Accessibility baseline

The original source already includes accessibility behavior that should not be lost accidentally during regeneration.

## A-01 — Visible keyboard focus

Global focus-visible ring for button/input/select.

## A-02 — Icon-only accessible names

Examples:

- Back button has aria-label.
- Close buttons have aria-label.
- panel close controls have aria-label.
- color/lock actions include accessible names.

## A-03 — Expanded-state semantics

`aria-expanded` is used for popovers/dropdowns including:

- Panel picker
- Collaboration roster
- color menu

## A-04 — Toolbar semantics

Drawing tool rail uses:

```text
role="toolbar"
```

with label `Alat gambar`.

## A-05 — Modal semantics

Keyboard shortcut modal uses:

- `role="dialog"`
- `aria-modal="true"`
- labelled heading

## A-06 — Feedback semantics

- success toast uses `role="status"`
- error feedback uses `role="alert"`

## A-07 — Canvas keyboard accessibility

Canvas:

- is focusable
- supports arrow navigation
- supports Enter to use active tool
- provides `aria-keyshortcuts`
- has descriptive `aria-label`
- uses visible orange focus cell cursor

## A-08 — Crop keyboard accessibility

Crop frame can be moved using Arrow keys and has an accessible label.

## A-09 — Disabled states

Unavailable actions use actual `disabled` state in many core controls, including export, conversion, palette actions, and non-editable operations.

---

# 46. Source ownership map for UI handoff

| UI responsibility | Original source owner |
| --- | --- |
| Global colors/fonts/focus | `src/lib/styles/global.css` |
| Font imports/favicon/metadata | `src/routes/+layout.svelte` |
| Home header | `src/lib/components/HomeView.svelte` |
| Home hero | `src/lib/components/HomeView.svelte` |
| Home Quick Start | `src/lib/components/HomeView.svelte` |
| Home image upload | `src/lib/components/HomeView.svelte` |
| Home dimension inputs | `src/lib/components/HomeView.svelte` |
| Home grid result | `src/lib/components/HomeView.svelte` |
| Home physical preview | `src/lib/components/HomeView.svelte` |
| Home project cards | `src/lib/components/HomeView.svelte` |
| Home cloud thumbnail | `src/lib/components/CloudProjectThumbnail.svelte` |
| Home loading/error orchestration | `src/routes/+page.svelte` |
| Editor header | `src/lib/components/EditorView.svelte` |
| Left panel | `src/lib/components/EditorView.svelte` |
| Reconstruction UI | `src/lib/components/EditorView.svelte` |
| Properties UI | `src/lib/components/EditorView.svelte` |
| Context bar | `src/lib/components/EditorView.svelte` |
| Drawing tool rail | `src/lib/components/EditorView.svelte` |
| View controls | `src/lib/components/EditorView.svelte` |
| Quick Palette | `src/lib/components/EditorView.svelte` |
| Right palette panel | `src/lib/components/EditorView.svelte` |
| Color Detail | `src/lib/components/EditorView.svelte` |
| Export controls | `src/lib/components/EditorView.svelte` |
| Canvas-size modal | `src/lib/components/EditorView.svelte` |
| Global palette modal | `src/lib/components/EditorView.svelte` |
| Shortcut modal | `src/lib/components/EditorView.svelte` |
| Editor success/error toasts | `src/lib/components/EditorView.svelte` |
| Canvas render | `src/lib/components/MosaicCanvas.svelte` |
| Canvas pointer interaction | `src/lib/components/MosaicCanvas.svelte` |
| Canvas keyboard interaction | `src/lib/components/MosaicCanvas.svelte` |
| Canvas ruler/coordinate chip | `src/lib/components/MosaicCanvas.svelte` |
| Crop UI | `src/lib/components/VisualCropper.svelte` |
| Collaboration UI | `src/lib/components/CollaborationBar.svelte` |
| Project loading/trash/error | `src/routes/project/[id]/+page.svelte` |
| Project editor/viewer authority wiring | `src/routes/project/[id]/+page.svelte` |
| Panel default visibility | `src/lib/panel-preferences.ts` |
| Global editor shortcut mapping | `src/lib/editor-shortcuts.ts` |
| Global palette built-in content | `src/lib/global-palettes.ts` |

---

# 47. Stable UI ID convention for future proposals

Future UI planning should reference these IDs rather than broad ambiguous areas.

Prefixes:

```text
G-*       global visual system
H-*       Home
H-S*      Home states
E-H*      Editor header
E-L*      Editor left panel
E-C*      Editor context bar
E-T*      Editor tools
E-V*      Editor view controls
E-Q*      Quick Palette
E-R*      Editor right panel
E-X*      Export
E-S*      Editor/route states
E-F*      Feedback
C-*       MosaicCanvas rendering
C-I*      Canvas pointer interaction
C-K*      Canvas keyboard interaction
C-H*      Canvas hover/coordinate
CR-*      VisualCropper
CO-*      Collaboration
M-C*      Canvas modal
M-P*      Palette modal
M-K*      Keyboard shortcut modal
R-*       responsive behavior
A-*       accessibility baseline
```

Preferred proposal format:

```text
UI ID: E-L-R03

Original:
Preview berubah
Grid masih memakai hasil sebelumnya.
[Atur rekonstruksi]

Problem:
<separate UX observation>

Decision:
KEEP / SIMPLIFY / MOVE / HIDE / CONDITIONAL / ADMIN / REMOVE

Proposed:
<precise new structure/copy>

Visual:
KEEP unless explicitly approved otherwise

Function:
KEEP / CHANGE

Affected source owner:
src/lib/components/EditorView.svelte

Unaffected IDs:
<explicit neighboring areas that must remain unchanged>
```

---

# 48. Handoff rule

For regeneration by the original repository owner:

1. Treat upstream commit `7904ba38d9ea38eec308c04805041ccd75bd6914` as the original visual/interaction baseline.
2. Preserve original logo, assets, icon/glyph language, typography, colors, borders, radii, shadows, and visual identity unless a later approved proposal explicitly says otherwise.
3. Apply changes only to explicitly named UI IDs.
4. Do not interpret a UX simplification request as permission for a visual redesign.
5. Do not expose planning notes, implementation prompts, developer rationale, or internal instructions as visible UI text.
6. Preserve original accessibility and keyboard behavior unless an approved proposal explicitly replaces it with an equivalent or better interaction.
7. Preserve product capability when a proposal says `SIMPLIFY`, `MOVE`, `HIDE`, `CONDITIONAL`, or `ADMIN`; those decisions change exposure/hierarchy, not automatically the underlying feature.
8. Keep proposed changes in a document separate from this baseline so original facts and future decisions never become ambiguous.

---

# 49. Non-goals of this document

This document does **not** decide:

- which original controls are too advanced
- which controls should be Player-only or Admin-only
- which labels should be rewritten
- which tools should be hidden by default
- how export should be simplified
- how palette/reconstruction should be simplified
- whether collaboration should be hidden in ordinary use
- whether Home or Editor should be reorganized

Those belong in a separate approved UI simplification specification.

This separation is intentional:

```text
original-ui-baseline.md
= what the original UI is

future UI simplification specification
= what should change
```
