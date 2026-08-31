# UI Design System

Status: current durable UI authority

This document owns the durable visual and interaction direction for MIVUBI Mosaic Plan / Image2Pixelart.

## Non-negotiable visual rule

**Keep the current MIVUBI UI style.** User-friendly work changes hierarchy, position, wording, default visibility, and progressive disclosure; it is not a visual rebrand.

Preserve:

- warm ivory / near-white surfaces;
- current MIVUBI forest-green primary family;
- mustard/gold accent family;
- charcoal/warm-neutral text and borders;
- Poppins + Readex Pro relationship;
- current card, panel, radius, border, shadow, button, input, toolbar, palette, and canvas character;
- current MIVUBI logo/brand treatment.

Do not introduce a different component-kit identity, SaaS blue/purple, glassmorphism, or gradient-heavy redesign merely to simplify UX.

```text
same visual language
+ simpler hierarchy
+ friendlier wording
+ better placement
+ progressive disclosure
+ correct Admin / Player responsibility
```

# Project roles

## Admin

The existing project `owner` is the **Admin authority for that project**.

Admin owns structural configuration:

- canvas width;
- canvas height;
- tile size;
- resulting columns/rows;
- project creation/deletion and other owner-level management already defined by source.

This is enforced by the project save endpoint. A non-owner active editor must not be able to change the structural canvas contract even by bypassing UI.

## Player

A non-owner participant uses the Player experience.

Primary workflow:

```text
open project
→ upload image OR start build kosong
→ position/crop image when uploaded
→ automatic pixel result
→ edit/build mosaic
→ finish/export
```

Player may read canvas/grid/tile information but cannot configure it.

# Home / project launcher

Home is primarily a **project launcher**.

Default hierarchy:

```text
available projects
→ read-only physical summary
→ Upload gambar / Lanjutkan editor
```

Project cards may show:

```text
physical width × height
grid columns × rows
tile size
Admin / Bisa edit / Hanya lihat
```

Project structural creation remains available through a clearly secondary **Admin** panel. Width/height/tile inputs must not sit in the ordinary Player path.

Opening/importing a project file is a separate utility and must not be confused with uploading source artwork.

# Player image setup

When a Player opens an empty project, the first decision is simple:

```text
Upload gambar
OR
Mulai build kosong
```

When an image is selected:

```text
Atur gambar
→ Isi canvas / Tampilkan semua
→ drag/crop when applicable
→ Gunakan gambar
→ result generated automatically
```

The Player must not first learn reconstruction-pipeline terminology.

# Player Editor

## Default state

Player Editor is canvas-first:

```text
left panel  → closed by default
right panel → closed by default
quick palette → visible
canvas → dominant
```

The panels keep the existing MIVUBI styling and full capability but appear only when the Player asks for advanced responsibility.

## Basic tools

Default visible direct-edit tools:

```text
Pensil
Hapus
Geser
```

Advanced tools remain available through `Alat lainnya`:

```text
Pipet
Isi area
Pilih area
```

Capability is hidden progressively, not deleted.

## Color

Player starts with quick palette selection.

Detailed HEX/name/lock/delete/global-palette operations remain advanced palette-management responsibility and do not need to remain permanently visible.

## Dimensions

Player sees a compact read-only summary. `Atur ukuran canvas` is Admin-only functionality and must not be exposed as a Player action.

# Admin Editor

Admin/project owner may use the full current `EditorView` workbench, including structural canvas configuration and advanced management.

Admin UI still uses the same visual language as Player UI; role separation is about responsibility and cognitive load, not a different theme.

# Reconstruction / result terminology

Player-facing language should prefer task meaning:

```text
Hasil pixel
Buat ulang hasil
Bentuk tegas
Detail halus
Jumlah warna
Saran warna
Perbaiki hasil
```

Technical concepts such as raster pipeline, stale reconstruction, active-palette architecture, or implementation terminology belong in advanced/internal contexts only.

# Collaboration

Collaboration is contextual rather than permanently dominant.

Show it when:

- another participant is present;
- the Player lacks edit access;
- an edit request is active;
- connection state requires attention.

Player language:

```text
Kamu mengedit
<Nama> mengedit
Hanya melihat
Minta akses edit
Koneksi terputus
```

Do not expose raw revision numbers or device UUIDs in ordinary Player UI.

# Save state

Player-facing save states:

```text
Menyimpan…
Tersimpan
Gagal menyimpan
```

Do not expose storage-provider or revision vocabulary in normal UI.

# Finish / export

Player makes a task decision before a format decision:

```text
Selesai
→ Panduan Build
→ Gambar Pixel
→ Export lainnya
```

Advanced PNG-grid, CSV, and project-file exports remain available under secondary disclosure.

# Progressive disclosure

Default-visible Player concepts:

```text
project
image/build choice
canvas
basic tools
active color
save state
finish
```

Contextual/advanced concepts:

```text
crop detail
reconstruction detail
palette management
advanced tools
panel customization
collaboration management
advanced exports
keyboard shortcuts
```

Admin-only concepts:

```text
canvas width/height configuration
tile size configuration
grid-definition configuration
owner-level project management
```

# Visual system

Use current semantic roles rather than introducing a new theme:

```text
primary text          → current --ink family
muted/support text    → current --muted family
primary action        → current --forest family
warm application bg  → current ivory/yellow family
primary surface       → current warm near-white/paper family
border/separator      → current --line family
accent/status         → current mustard/gold family
danger/error          → current --danger family
```

Typography and density:

- preserve Poppins + Readex Pro roles;
- normal explanatory text ~14 px;
- compact desktop controls 12–13 px where readable;
- 10–11 px only for tertiary metadata;
- simplify by grouping/hiding controls, not by shrinking important text;
- retain the existing 8 px-oriented rhythm with small optical adjustments.

# Pixel/canvas correctness

Visual simplification must never alter physical/grid truth:

- cells remain discrete;
- pointer-to-cell mapping remains exact;
- grid/ruler/selection overlays align with the canonical cell model;
- palette swatches retain exact project HEX values;
- Player presentation cannot mutate width/height/tile/grid.

# Accessibility

- preserve native semantics where practical;
- keep visible focus;
- do not rely on color alone for active/error/read-only state;
- Player advanced disclosure must remain keyboard-reachable;
- modal close/actions must be understandable;
- canvas accessibility choices must preserve performance and exact cell semantics.

# Completion

A UI simplification is complete only when:

- it still unmistakably looks like the same MIVUBI application;
- Player can identify the next task with less explanation;
- advanced capability remains discoverable;
- Admin-only structure is enforced by source/server authority, not only hidden visually;
- infrastructure details do not leak into ordinary Player wording;
- rendered/browser proof is obtained before claiming final visual acceptance.