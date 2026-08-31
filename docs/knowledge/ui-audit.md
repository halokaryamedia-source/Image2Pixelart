# Current UI Audit

Status: current player-friendliness audit

This audit reviews the current Home + Editor as they exist now, with the approved constraint that the **visual style stays the same** while hierarchy, placement, wording, default state, and progressive disclosure become friendlier for non-technical Players.

Durable direction is owned by `docs/foundation/05-ui-design-system.md`.

## Core finding

The application is technically mature but currently exposes too much power-user structure too early.

The problem is not primarily the MIVUBI visual style. The problem is simultaneous cognitive load.

```text
current experience
→ feature-oriented

approved direction
→ task-oriented
```

Player should think:

```text
open project
→ upload image
→ position image
→ use/edit pixel result
→ build
→ finish
```

not:

```text
configure canvas
→ understand reconstruction
→ understand palette architecture
→ understand collaboration/revision
→ choose export format
→ edit
```

# Role mismatch

## P0 — canvas/tile configuration is exposed to Player

Current Home allows direct input of width, height, and tile size. Current Editor also exposes canvas resizing.

Approved requirement:

- canvas width/height = Admin responsibility;
- tile size = Admin responsibility;
- resulting grid = Admin-defined consequence;
- Player sees these values only as read-only project context.

Current repository does not yet define an explicit `admin` role. Existing `owner/editor/viewer` roles must not be silently reinterpreted as Admin authorization.

This is an architecture/permission gap, not something that should be "fixed" only by hiding controls in CSS.

# Home

## Current strengths

- MIVUBI visual identity is appropriate and should remain;
- upload/blank-project concepts are visually understandable;
- preview makes physical grid consequences visible;
- project continuation cards are already usable;
- infrastructure wording was reduced in the previous Home cleanup.

## Current mismatch

The Home creation form still behaves like an Admin project configurator because it asks for:

- width;
- height;
- tile size;
- derived grid/tile counts.

That is not the approved Player journey.

Future Player Home should become primarily a project launcher:

```text
available project
→ read-only size/grid/tile summary
→ Upload image / Continue
```

The current form remains transitional until an Admin configuration surface/capability exists.

# Editor

## Main problem

The Editor previously opened with:

```text
left panel  = open
right panel = open
quick palette = open
```

This immediately exposed reference, reconstruction, properties, palette management, detail controls, canvas tools, collaboration, export, and status together.

A source-level first simplification has now been applied:

```text
left panel  = closed by default
right panel = closed by default
quick palette = open
```

This preserves the same MIVUBI UI components while making the canvas the first visual focus.

## P0 — advanced concepts appear too early

Current advanced concepts include:

- reconstruction;
- contour/photo mode;
- suggestion/adoption;
- raster re-application;
- palette detail/HEX/lock/global library;
- selection/fill/picker tools;
- panel customization;
- collaboration/editor transfer;
- multiple export formats.

These capabilities are useful and should remain, but most should not be simultaneous first-level Player UI.

## P0 — collaboration was too technical

The previous collaboration popover exposed revision and device-ID information and always occupied header space even in simple solo editing.

A source-level simplification has now been applied:

- collaboration UI stays hidden during normal single-user editable work;
- it appears when another participant, edit-access state, or connection problem makes it relevant;
- revision and device UUID are removed from ordinary presentation;
- wording now uses `Kamu mengedit`, `Hanya melihat`, `Minta akses edit`, and connection language.

Underlying collaboration behavior is unchanged.

## P0 — canvas configuration in Editor

`Atur ukuran canvas` remains available in the current Editor source.

Approved direction says this must eventually be Admin-only. It should not be removed until a real Admin authorization route/capability exists, otherwise the configuration capability would simply disappear rather than move to the correct owner.

## P1 — tools

Current tool rail exposes picker, pencil, fill, eraser, selection, and pan together.

Approved beginner direction:

```text
primary visible
→ Pensil
→ Hapus
→ Geser

secondary / Alat lainnya
→ Isi
→ Pilih
→ Pipet
```

Do not remove advanced tools.

## P1 — palette

Current Player can see quick palette plus detailed palette management.

Approved direction:

```text
quick palette
→ primary color-selection surface

Kelola warna
→ detailed HEX/name/lock/delete/library actions
```

Detailed palette panels should be contextual rather than permanently open.

## P1 — reconstruction language

Current terms such as `Rekonstruksi`, `Suggestion`, `Raster ulang`, `Contour`, and `Photo` are too implementation-oriented for first-use Player flow.

Prefer task language such as:

```text
Hasil pixel
Perbaiki hasil
Bentuk tegas
Detail halus
Saran warna
Buat ulang hasil
```

Underlying behavior can stay unchanged.

## P1 — Export

Current header asks the user to choose among PDF, PNG variants, CSV variants, and project file formats.

Player should first choose the outcome:

```text
Selesai / Ekspor
→ Panduan build
→ Gambar pixel
→ Export lainnya
```

File-format detail belongs one level deeper.

# Style boundary

The approved simplification is **not** a redesign of visual identity.

Keep:

- current MIVUBI colors;
- Poppins + Readex Pro;
- warm panels/cards;
- current button/input language;
- current canvas/palette appearance;
- current restrained borders/radius/shadows.

Change:

- what is visible by default;
- where controls live;
- which concepts are grouped together;
- wording;
- task hierarchy;
- Player/Admin separation.

# Current source-level progress

Completed safely without inventing Admin authorization:

1. Home infrastructure wording cleanup;
2. default Editor panels changed to canvas-first;
3. collaboration presentation simplified/contextualized.

Still unresolved:

1. explicit Admin capability/route/role;
2. remove width/height/tile editing from Player surfaces;
3. task-oriented upload/position/result flow;
4. basic-vs-advanced tool disclosure;
5. palette management disclosure;
6. simplified finish/export flow;
7. Player-friendly reconstruction wording.

## Proof boundary

This is a source/static audit. Actual rendered hierarchy and interaction still require browser proof when those implementation slices are changed.
