# UI Design System

Status: current durable UI authority

This document owns the durable visual, copy, access, hierarchy, and interaction direction for MIVUBI Image2Pixelart.

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

The application keeps the existing MIVUBI visual identity. User-friendly work changes hierarchy, placement, wording, default visibility, and access separation; it is not a visual rebrand.

Preserve unless explicitly changed:

- MIVUBI logo and current image/thumbnail assets;
- the existing icon/glyph language;
- warm ivory / near-white surfaces;
- forest-green primary actions;
- mustard/gold accent family;
- charcoal/warm-neutral text and borders;
- Poppins + Readex Pro typography relationship;
- current card, panel, button, input, toolbar, palette, border, radius, and shadow character;
- exact Grid/cell fidelity.

Do not replace approved icons with another icon pack, introduce a generic SaaS component aesthetic, or change the color system merely to modernize the interface.

# UI language

UI copy must be understandable without knowing the implementation.

Rules:

- keep text short, specific, and action-oriented;
- use familiar Indonesian where natural and retain familiar English tool names where already approved;
- `Pipet` remains `Pipet`;
- `Pencil`, `Fill`, `Eraser`, `Select`, and `Pan` remain their approved tool labels;
- a Grid is a collection of `sel`; do not use `tile` as the general ordinary-user cell term;
- `Pixel Art` describes the visual result, not each ordinary Grid cell;
- stored/open/delete items are `File`; artwork naming/creation may use `Karya`;
- do not expose provider, revision, realtime, raw identity, database, or implementation terminology in ordinary UI.

Ordinary Canvas information uses:

```text
Ukuran Fisik
→ 240 × 120 cm

Ukuran Grid
→ 48 × 24
```

`Ukuran Sel`, Grid totals, and structural Canvas controls are not ordinary-user configuration.

# Access model

The application uses one UI language and one MIVUBI visual system with separate authority.

## Akses Umum

Akses Umum can:

- create/open/edit Pixel Art;
- use image conversion, crop, palette, drawing, selection, view, save, and export features;
- read the Canvas physical size and Grid size stored in the file.

Akses Umum cannot:

- change the website Canvas configuration;
- resize an existing file's Canvas structure;
- become Website Admin by owning a file, device identity, or active-editor state.

Project ownership, device identity, active-editor authorization, and revision protection remain separate cloud/persistence concepts.

## Admin Website

Admin Website is application-level authority, not project ownership.

Admin Website:

- authenticates through the dedicated Admin login/session boundary;
- configures the active global Canvas width, height, and cell size;
- receives derived Grid size and total-cell information;
- affects newly created work only.

Each new work snapshots the active Canvas configuration into its project data. Later Admin changes do not mutate existing files.

Current Admin routes:

```text
/admin/login
→ Admin login

/admin
→ Admin dashboard

/admin/settings
→ Pengaturan Website

/admin/settings/canvas
→ Pengaturan Canvas
```

# Home

Home is a direct launcher for creating and continuing work.

Core hierarchy:

```text
PIXEL ART EDITOR
→ Buat Karya Baru
→ Upload Gambar / Buat Baru
→ Nama Karya
→ Ukuran Grid information
→ Buat Karya
→ File Tersimpan
```

Ordinary users do not receive Canvas width/height/cell-size inputs. New work uses the current Website Admin Canvas configuration.

# Editor

The Editor is a workbench. Canvas and the current editing target dominate the screen.

Default workspace:

```text
left panel closed
right panel closed
Palet Cepat visible
Canvas dominant
```

The header prioritizes:

```text
Kembali
→ MIVUBI / Nama Karya
→ Canvas/Grid information when space allows
→ Panel
→ save state
→ Keyboard Shortcuts
→ Ekspor
```

Export format selection is not permanently displayed in the header. `Ekspor` opens the choices when needed.

## Drawing tools

Primary tools are visually dominant:

- Pencil;
- Eraser;
- Pan.

`Alat lainnya` contains the situational tools while keeping them one action away:

- Pipet;
- Fill;
- Select.

All existing shortcuts remain available.

## Image to Pixel Art

Normal image adjustment should not require the user to understand the internal palette pipeline.

Normal `Hasil Pixel Art` flow:

```text
Gaya Pixel Art
Jumlah warna
→ Perbarui Pixel Art dari Gambar
```

Changing image placement/crop, render style, or color count marks the current Pixel Art as needing an update. The primary update action handles the required image analysis/palette work automatically.

`Saran Warna` remains an advanced palette capability through Library Palet; it is not a mandatory step in the normal conversion flow.

## Palette

`Palet Cepat` is the normal color-selection surface while drawing.

The right panel is contextual management for:

- viewing the project palette;
- adding colors;
- editing HEX/name;
- locking/unlocking;
- deleting a color;
- opening Library Palet.

The right panel is not required to remain open during normal drawing.

## Properties

Ordinary `Properti Canvas` shows only the information needed to understand the work:

- `Ukuran Fisik`;
- `Ukuran Grid`.

Do not add total cells, filled/empty-cell statistics, or structural resize controls merely because those values can be calculated.

# Save and read-only state

Save state uses:

```text
Menyimpan…
Tersimpan
Gagal disimpan
```

Read-only/viewer behavior remains enforced by persistence/realtime authorization. UI simplification must not become an authorization owner.

# Export

The header exposes one `Ekspor` entry point.

Primary choices:

- `PDF Blueprint`;
- `PNG Transparan`.

Secondary group `Ekspor lainnya` contains:

- `PNG + Grid`;
- `CSV Material`;
- `CSV Matriks`;
- `File Kerja`.

# Visual and accessibility discipline

- normal explanatory text should generally remain at least 14 px;
- compact desktop controls may use 12–13 px;
- 10–11 px is tertiary metadata only;
- simplify through hierarchy and progressive disclosure, not by shrinking every control;
- preserve focus-visible treatment and native control semantics;
- do not rely on color alone for selected/error/read-only states;
- panel collapse/visibility must not lose project state;
- exact Grid/cell presentation remains product correctness.

# Completion boundary

A UI change is complete only when:

- it remains unmistakably MIVUBI;
- approved icon/glyph identities remain intact;
- the Canvas and current task are visually dominant;
- ordinary users can identify the next action without decoding technical terminology;
- Website Admin configuration stays outside ordinary editing flow;
- advanced capability remains available without dominating first-use experience;
- source authority does not depend on route-specific CSS hacks to hide retired ordinary UI;
- browser proof is used before claiming final rendered acceptance.
