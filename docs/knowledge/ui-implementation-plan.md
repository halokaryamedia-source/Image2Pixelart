# UI Implementation Plan

Status: current player-first sequence

This plan preserves the current MIVUBI visual style and changes only role separation, information hierarchy, default state, wording, placement, and progressive disclosure.

Durable direction: `docs/foundation/05-ui-design-system.md`.
Current evidence: `docs/knowledge/ui-audit.md`.

## Current progress

Completed at source/static level:

- Home infrastructure wording cleanup;
- Editor default workspace changed to canvas-first (`left=false`, `right=false`, `quick=true`);
- collaboration UI hidden during normal solo editable work and stripped of revision/device-ID presentation.

Automatic CI remains deferred. Local Svelte/browser proof remains required when available before claiming rendered completion.

# New sequence

## Phase 0 — define real Admin capability boundary

Goal:

- establish how the application knows a user is Admin;
- do not infer `owner === admin` without explicit approval;
- provide the correct owner for canvas width/height/tile configuration.

This is required before removing configuration capability from Player UI.

Affected areas may include project permission/data/API routing in addition to UI. Treat it as architecture, not CSS hiding.

## Phase 1 — Player Home becomes project launcher

Goal:

```text
project card
→ read-only physical summary
→ Upload image / Continue
```

Remove width/height/tile editing from the Player path once Admin configuration exists.

Preserve the same Home card/button/input visual language.

Admin configuration moves to the explicit Admin surface rather than being deleted.

## Phase 2 — image setup flow

Goal:

```text
Upload image
→ position/crop
→ continue
```

Default Player controls:

- image preview;
- drag/reposition;
- `Isi canvas` / `Tampilkan semua`;
- Reset;
- clear continue/apply action.

Detailed zoom/crop controls become secondary when not needed.

## Phase 3 — pixel result / reconstruction simplification

Goal:

```text
Hasil pixel
→ Gunakan hasil
→ Perbaiki hasil
```

Primary Player wording avoids implementation jargon.

Advanced reconstruction remains behind `Perbaiki hasil` / `Pengaturan lainnya`.

Suggested terminology:

```text
Contour → Bentuk tegas
Photo → Detail halus
Suggestion → Saran warna
Raster ulang → Buat ulang hasil
```

Do not change image-processing behavior unless a separate functional requirement exists.

## Phase 4 — basic Editor tools

Goal:

Primary visible tools:

```text
Pensil
Hapus
Geser
```

Secondary `Alat lainnya`:

```text
Isi
Pilih
Pipet
```

Keep all current tool behavior and shortcuts.

## Phase 5 — Player color workflow

Goal:

```text
quick palette
→ choose active color

Kelola warna
→ detailed palette panel/library
```

Right panel stays contextual/closed by default.

Do not remove HEX/name/lock/delete/global-library capability.

## Phase 6 — Header + save + collaboration simplification

Already started through contextual collaboration presentation.

Remaining goal:

- project identity + read-only dimensions remain easy to scan;
- save state uses simple Player language;
- low-frequency panel/help controls are visually quieter;
- collaboration appears only when relevant;
- no revision/device UUID/provider terminology in normal Player UI.

## Phase 7 — Finish / Export

Goal:

Primary task-oriented action:

```text
Selesai / Ekspor
```

Then:

```text
Panduan build
Gambar pixel
Export lainnya
```

Keep CSV/raw project formats under advanced export rather than deleting them.

## Phase 8 — Admin configuration UI

Goal:

Admin-only project configuration with the same MIVUBI visual language:

- width;
- height;
- tile size;
- resulting grid;
- other approved project-level settings.

Player sees these values read-only.

The authorization boundary must be real, not presentation-only.

# Execution rule

Implement one bounded phase/slice at a time.

```text
explicit user direction
→ development-brief
→ UI Foundation
→ correct product/permission owner
→ smallest complete change
→ Svelte/static proof
→ browser/accessibility proof when claimed
→ STOP
```

Do not visually restyle the product while simplifying it.
