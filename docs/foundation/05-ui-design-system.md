# UI Design System

Status: current durable UI authority

This document owns the durable visual, copy, role, and interaction direction for MIVUBI Mosaic Plan / Image2Pixelart.

## Authority

```text
current explicit user direction
→ this UI Foundation + affected product Foundation owners
→ current MIVUBI visual language and approved brand assets
→ current source + rendered behavior
→ reference inventory / raw references
→ generic model taste last
```

# Non-negotiable visual baseline

The application must keep the **existing MIVUBI UI style**. User-friendly work changes hierarchy, placement, wording, default visibility, and role separation; it is not a visual rebrand.

Preserve unless explicitly changed:

- MIVUBI logo and current image/thumbnail assets;
- the icon/symbol language already used by the application;
- warm ivory / near-white surfaces;
- forest-green primary actions;
- mustard/gold accent family;
- charcoal/warm-neutral text and borders;
- Poppins + Readex Pro typography relationship;
- existing card, panel, button, input, toolbar, palette, border, radius, and shadow character;
- current physical-grid preview language;
- mosaic colors as project content colors, separate from UI-state colors.

Do not replace existing icons/assets with a new icon pack merely to modernize the interface. Do not introduce another component-kit aesthetic, generic SaaS styling, glassmorphism, or a new color system.

The approved baseline is the familiar original composition:

```text
MIVUBI header
→ concise hero
→ large two-column task card when starting a project
   left: action / project information
   right: physical-grid or image-position preview
→ project continuation cards
```

# UI copy quality

Indonesian UI text is **product copy**, not literal translation.

Rules:

- use wording a non-technical Indonesian user can understand without knowing the implementation;
- prefer a familiar term when translating it would make the meaning less clear;
- keep text short, specific, and action-oriented;
- do not leak developer notes, prompt instructions, design rationale, permission rationale, or implementation explanations into UI text;
- do not expose `Neon`, `R2`, `revision`, `realtime`, raw device IDs, pipeline terminology, or provider details in ordinary Player UI;
- do not use a vague numeric summary when the meaning can be labeled explicitly.

Examples of approved user-facing language:

```text
Dari gambar
Build langsung
Upload gambar
Gunakan gambar
Mulai build
Lanjutkan editor
Kelola warna
Selesai
Panduan Build
Gambar pixel
Ekspor lainnya
```

Project-size information must use these meanings:

```text
Canvas
→ 240 × 120 cm
→ overall physical canvas size

Grid Canvas
→ 48 kolom × 24 baris
→ arrangement of grid cells

Ukuran 1 Tile
→ 5 × 5 cm
→ physical size of one square tile
```

Do not show total tile count merely because it can be calculated; it has no current Player task responsibility.

# Product roles

## Project Admin

The current project owner (`owner_device_id`) is the structural Admin authority for that project.

Admin owns:

- canvas width;
- canvas height;
- tile size;
- resulting grid dimensions;
- project-level structural configuration.

The save API rejects structural canvas changes from a non-owner active editor. Admin-only configuration must therefore remain a real server boundary, not CSS hiding.

The dedicated project-creation surface is `/admin`. It is not linked as a normal Player action.

This is a project-scoped Admin model in the current anonymous-device architecture, not a global account/organization role system.

## Player

Player's primary workflow is:

```text
open project
→ Dari gambar OR Build langsung
→ if image: upload + position image
→ generate/use pixel result
→ edit/build mosaic
→ finish/export
```

Player may read canvas/grid/tile information but must not choose or modify it.

# Player Home

Player Home is a project launcher using the familiar MIVUBI header/hero/card style.

Hierarchy:

```text
Dari gambar ke grid presisi.
→ Lanjutkan pekerjaan
→ project cards
```

Each project card should make these facts understandable rather than compressing them into an unlabeled number string:

- Canvas;
- Grid Canvas;
- Ukuran 1 Tile;
- access state only when useful;
- updated/deleted state;
- one clear action: `Upload gambar`, `Lanjutkan editor`, or `Lihat status`.

Player Home must not contain canvas width/height/tile inputs or an Admin project-creation control.

# Player project start

When Player opens an empty project, use the familiar original two-column composition rather than a new modal/dashboard aesthetic.

Left side:

```text
[Dari gambar] [Build langsung]
→ upload area or direct-build explanation
→ project name
→ Canvas / Grid Canvas / Ukuran 1 Tile
→ one primary action
```

Right side:

```text
physical grid preview
OR
image-position preview after a source image is selected
```

Use the existing icons/symbols already associated with image, grid, upload, and tile concepts. Do not introduce replacement icons for this flow.

## Dari gambar

Default action:

```text
Unggah gambar atau seret ke sini
PNG, JPG, WEBP · Maks. 20 MB
```

After selection, show simple image positioning:

- `Isi canvas`;
- `Tampilkan semua`;
- existing crop interaction when applicable;
- `Gunakan gambar`.

Supporting copy should say what will happen to the user's work, for example:

`Gambar akan disesuaikan dengan grid proyek dan diubah menjadi pixel art.`

Do not explain internal conversion/suggestion pipelines here.

## Build langsung

Explain the action, not the architecture:

```text
Mulai dari canvas kosong
Langsung isi tile satu per satu di editor.
```

Primary action: `Mulai build`.

# Player Editor

The Player Editor remains the existing MIVUBI editor, simplified by default rather than visually replaced.

Default:

```text
canvas dominant
left panel closed
right panel closed
quick palette visible
```

Primary tools:

- Pensil;
- Hapus;
- Geser.

`Alat lainnya` may reveal:

- Pipet;
- Isi;
- Pilih;
- panel customization where needed.

Do not remove underlying capability.

The structural canvas control is not part of Player UI. Detailed palette management remains contextual; quick palette is the normal color-selection surface.

# Collaboration and save state

Collaboration is contextual, not primary.

Use clear states such as:

```text
Kamu mengedit
Hanya melihat
Minta akses edit
Koneksi terputus
```

Do not show revision numbers or raw device identifiers.

Save state:

```text
Menyimpan…
Tersimpan
Gagal menyimpan
```

# Finish / Export

Player chooses an outcome before a file format.

Primary `Selesai` choices:

```text
Panduan Build
→ PDF grid/build output

Gambar pixel
→ PNG result
```

Secondary section: `Ekspor lainnya` for PNG + grid, CSV, and project file formats.

# Admin creation surface

`/admin` owns project creation using the same original MIVUBI form/preview style.

Admin fields must be explicit:

- Nama proyek;
- Lebar canvas;
- Tinggi canvas;
- Ukuran tile (persegi).

Admin preview and summary use the same clear labels:

- Canvas;
- Grid Canvas;
- Ukuran 1 Tile.

Do not use UI text such as `Admin configuration`, `Player only receives this`, or other implementation/design notes.

# Visual and accessibility discipline

- normal explanatory text should generally remain at least 14 px;
- compact desktop controls may use 12–13 px;
- 10–11 px is tertiary metadata only;
- use the existing spacing rhythm and simplify by grouping/hiding controls, not shrinking everything;
- keep focus-visible treatment and native control semantics;
- do not rely on color alone for read-only/error/selected states;
- exact cell/grid fidelity remains part of product correctness.

# Completion boundary

A UI change is complete only when:

- it still looks unmistakably like the existing MIVUBI application;
- existing icon/asset language is preserved;
- Player can identify the next task without decoding technical terminology;
- Canvas / Grid Canvas / Ukuran 1 Tile are unambiguous;
- Admin configuration stays out of ordinary Player flow;
- no prompt/developer rationale leaks into visible copy;
- advanced capability remains available without dominating the first-use experience;
- browser proof is used before claiming rendered acceptance.
