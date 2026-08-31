# UI Design System

Status: current durable UI authority

This document owns the durable visual and interaction direction for MIVUBI Mosaic Plan / Image2Pixelart.

## Authority

```text
current explicit user direction
→ this UI Foundation + affected product Foundation owners
→ current MIVUBI visual language and approved brand assets
→ current source + rendered behavior
→ reference inventory / raw redesign references
→ generic model taste last
```

## Non-negotiable visual rule

**Keep the current MIVUBI UI style.** User-friendly work is an information-architecture and presentation change, not a visual rebrand.

Preserve unless explicitly changed:

- warm ivory / near-white application surfaces;
- current MIVUBI forest-green primary-action family;
- mustard/gold accent family;
- charcoal/warm-neutral text and border language;
- Poppins + Readex Pro typography relationship;
- current restrained radius, border, shadow, panel, card, button, input, toolbar, palette, and canvas character;
- current MIVUBI logo/brand treatment;
- mosaic colors as content colors, separate from UI-state colors.

Do **not** redesign the application into another product aesthetic. Do not introduce glassmorphism, gradient-heavy treatment, generic SaaS blue/purple, a new component kit, or a different design-system identity merely to make the UX simpler.

```text
same visual language
+ simpler hierarchy
+ friendlier wording
+ better placement
+ progressive disclosure
+ correct role boundary
```

# Product roles

## Admin

Admin owns project structure/configuration, including:

- physical canvas width/height;
- tile size;
- resulting grid dimensions;
- project configuration that defines the player's working canvas;
- other project-level administrative controls when later approved.

These are configuration responsibilities, not ordinary Player choices.

## Player

Player's primary workflow is intentionally simple:

```text
open project
→ upload / replace image when needed
→ position/crop image
→ use generated pixel result
→ edit/build mosaic
→ finish/export through task-oriented actions
```

Player may **read** project dimensions, grid size, and tile size as useful context, but must not be asked to choose or modify them.

### Current architecture gap

The repository currently has `owner / editor / viewer` collaboration roles but no explicit `admin` role.

Therefore:

- do not assume `owner === admin` without an explicit product/permission decision;
- do not claim canvas/tile settings are securely Admin-only merely because a control is visually hidden;
- current Player-facing canvas-size controls are transitional debt until a real Admin capability boundary exists;
- UI work may simplify/hide advanced presentation, but authorization-sensitive Admin separation must be implemented by the correct architecture owner.

# Player-first hierarchy

The Player UI should answer these questions in order:

1. Which project am I working on?
2. Do I need to add or replace an image?
3. Does the image sit correctly in the fixed canvas?
4. Is the generated mosaic acceptable?
5. What do I need to edit on the canvas?
6. Which color is active?
7. Am I saved / can I continue?
8. How do I finish?

The interface should not require the Player to first understand project configuration, storage architecture, realtime internals, palette-library architecture, or export file formats.

# Player Home

Player Home is a **project launcher**, not a canvas-configuration form.

Primary hierarchy:

```text
project list / assigned or available projects
→ project status / simple physical summary
→ Upload image or Continue
```

Useful read-only project facts may include:

```text
240 × 120 cm
48 × 24 grid
5 cm tile
```

They are context, not inputs.

The current Home creation form with editable width/height/tile fields must not be treated as the final Player experience. Removal or relocation of that configuration requires the Admin boundary to be defined first.

Infrastructure terms such as `Neon`, `R2`, `revision`, `realtime`, raw device IDs, and internal cloud architecture must not appear in ordinary Player hierarchy.

# Player image setup

When a project has no source image, lead with one obvious action:

```text
Tambahkan gambar
→ Pilih gambar / drag-and-drop
```

After upload, show a simple positioning step using the existing MIVUBI visual style.

Default controls should focus on:

- image preview;
- drag/reposition;
- `Isi canvas` / `Tampilkan semua`;
- Reset when useful;
- one obvious continue/apply action.

Zoom percentages and detailed crop controls remain available only when needed. They should not dominate the first-use path.

# Pixel-result / reconstruction UX

The underlying reconstruction capability remains intact, but Player-facing language should be task-oriented.

Prefer:

```text
Hasil pixel
Buat ulang hasil
Bentuk tegas
Detail halus
Jumlah warna
Saran warna
```

Avoid requiring the Player to understand implementation concepts such as:

```text
reconstruction pipeline
raster ulang
stale reconstruction
suggestion vs active-palette architecture
```

Advanced reconstruction controls should use progressive disclosure such as `Perbaiki hasil` / `Pengaturan lainnya`.

# Player Editor

## Default state

The default Player Editor is **canvas-first**.

```text
left panel  → closed by default
right panel → closed by default
quick palette → visible
canvas → dominant
```

Side panels remain available and keep the same existing visual style; they simply appear when the Player asks for the related responsibility.

## Basic visible tools

The long-term beginner default should prioritize common direct-edit actions:

```text
Pensil
Hapus
Geser
```

Additional tools such as fill, selection, and picker remain supported and should move behind an `Alat lainnya` or equivalent contextual surface when that implementation slice is approved.

Do not remove the underlying capability.

## Color workflow

For Player, color starts simple:

```text
quick palette
→ choose active color
```

Detailed HEX/name/lock/delete/save/global-library behavior belongs behind `Kelola warna` or another clearly secondary management surface.

Quick palette remains the primary painting-speed surface. The detailed Palette panel is management, not something that must remain open permanently.

## Project dimensions

Player sees canvas/grid/tile dimensions as read-only information.

Player must not receive an editable `Atur ukuran canvas` path once the real Admin boundary is implemented.

Until that role architecture exists, do not pretend the current editable path is securely Admin-only.

# Collaboration

Collaboration is contextual, not primary.

- when one Player is editing normally, collaboration chrome should stay out of the way;
- show collaboration UI when another participant is present, edit access is relevant, or connection state requires attention;
- use user language such as `Kamu mengedit`, `Hanya melihat`, `Minta akses edit`, `Koneksi terputus`;
- do not show revision numbers or device UUIDs in ordinary Player UI;
- permission/realtime semantics remain owned by the collaboration architecture.

# Save state

Player-facing save states should be simple:

```text
Menyimpan…
Tersimpan
Gagal menyimpan
```

Do not expose storage-provider or revision terminology unless the surface is explicitly diagnostic/admin-facing.

# Finish / Export

Player should make a **task decision before a file-format decision**.

Primary direction:

```text
Selesai / Ekspor
→ Panduan build
→ Gambar pixel
→ Export lainnya
```

Advanced formats such as CSV matrices/material files and raw project files remain available under secondary/advanced export choices rather than competing in the primary header.

# Progressive disclosure rules

Keep capability, reduce simultaneous cognitive load.

Default-visible Player concepts:

```text
project
image
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
advanced export formats
keyboard shortcuts
```

Admin-only concepts:

```text
canvas width/height configuration
tile size configuration
grid-definition configuration
administrative project settings
```

# Visual system

The current style remains the authority.

Baseline semantic roles:

```text
primary text          → current --ink family
muted/support text    → current --muted family
primary action        → current --forest family
warm application bg  → current ivory/yellow-50 family
primary surface       → current warm near-white/paper family
border/separator      → current warm neutral --line family
accent/status         → current mustard/gold family
danger/error          → current --danger family
```

Typography:

- preserve Poppins + Readex Pro roles;
- 14 px is the normal explanatory/body baseline;
- 12–13 px is acceptable for compact desktop controls;
- 10–11 px is tertiary metadata only;
- required instructions must not depend on 7–10 px microtype.

Spacing/density:

- retain the existing 8 px-oriented rhythm with 4 px optical adjustments;
- simplify by grouping/hiding controls, not by making everything smaller;
- editor may remain dense, but the first-use state must not present every capability simultaneously.

# Reference policy

Reference 01/03 remain useful evidence for the existing MIVUBI style and layout vocabulary, but the newly approved **Player-first / Admin-configured** role model overrides earlier assumptions that Players create canvas dimensions themselves or must see the full workbench by default.

Reference 04's canvas-dominance principle is now especially relevant to default Player Editor state, while its different visual architecture is **not** adopted as a style replacement.

# Completion boundary

A UI simplification is successful only when:

- the MIVUBI visual identity still clearly looks like the same application;
- Player can identify the next task with less explanation;
- advanced capability remains discoverable rather than deleted;
- Admin-only configuration is not mislabeled as Player functionality;
- implementation details do not leak into ordinary Player wording;
- browser proof is used when actual rendered hierarchy/interaction is claimed.
