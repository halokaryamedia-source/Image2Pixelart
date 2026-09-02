# Current UI Audit

Status: source/static audit after the implemented Website Admin + Editor simplification pass

The visual style remains the existing MIVUBI style. This audit records the current source state and remaining proof gaps; it is not a proposal to restart redesign work.

## Current result

| Prior problem | Current source/static state |
| --- | --- |
| ordinary user can choose Canvas width/height/cell size | **Resolved** — ordinary Home receives active Website settings read-only; create API enforces them |
| project owner is treated as Website Admin | **Resolved** — Website Admin uses dedicated login/session; project ownership is separate |
| Admin Canvas changes mutate existing files | **Resolved by contract** — new work snapshots settings; existing project PUT rejects structural changes |
| Editor opens with both side panels | **Resolved** — left/right closed by default; Palet Cepat visible |
| blank Canvas appears broken because Pencil has no active color | **Resolved** — direct first-use guidance points to `+ Tambah Warna` |
| image conversion exposes multi-step palette pipeline | **Resolved** — normal flow is Gaya + Jumlah warna + one update action |
| changing color count does not clearly require regeneration | **Resolved** — color-count changes mark current Pixel Art stale |
| user must manually create/apply Saran Warna before conversion | **Resolved** — normal conversion can prepare/apply the required image palette internally |
| six drawing tools compete equally | **Resolved by hierarchy** — Pencil/Eraser/Pan primary; Pipet/Fill/Select under `Alat lainnya` |
| full palette management competes with drawing | **Resolved by hierarchy** — Palet Cepat is normal selection; right panel is contextual management |
| Header permanently exposes export format selector | **Resolved** — one `Ekspor` menu; primary and secondary formats grouped |
| Properti Canvas exposes low-value statistics | **Resolved** — ordinary properties only show Ukuran Fisik + Ukuran Grid |
| ordinary Editor still owns Canvas resize logic | **Resolved** — structural resize state/modal/functions removed from current Editor |
| UI simplification depends on route-level hide/`nth-child` CSS | **Resolved** — hierarchy now lives directly in `EditorView.svelte` |
| older knowledge routes developer to Player/Admin split components | **Resolved in current handoff docs** — implementation/ownership maps point to current source |

## Current access model

```text
Website Admin
→ dedicated password/session authority
→ configures active global Canvas width/height/cell size
→ setting applies to newly created work

Akses Umum
→ creates/opens/edits Pixel Art
→ reads stored Ukuran Fisik / Ukuran Grid
→ cannot choose website Canvas configuration
→ cannot resize existing file Canvas structure

project owner
→ project-specific permission concept (for example delete/recovery)
→ NOT Website Admin

active editor + revision/realtime guards
→ persistence/edit authority for the project
→ NOT Website Admin
```

The Canvas boundary is server-enforced rather than CSS-only.

## Current ordinary journey

```text
Home
→ Buat Karya Baru / File Tersimpan
→ new work uses active Website Canvas settings
→ optional image conversion or blank work
→ Editor opens Canvas-first
→ Palet Cepat for normal color selection
→ Pencil / Eraser / Pan primary
→ image/crop/style/color-count update through one normal Pixel Art action
→ contextual palette/detail management only when needed
→ Ekspor
```

## Visual-style check

No visual rebrand was authorized or introduced by this pass. Current direction preserves:

- MIVUBI logo and existing image assets;
- approved icon/glyph identities;
- warm ivory / near-white surfaces;
- forest-green primary actions;
- current warm border/radius/shadow character;
- Poppins + Readex Pro relationship;
- existing Canvas/Grid visual language.

## Remaining evidence gap

The previous execution environment could not provide a usable LOCAL_CODE checkout or LIVE_BROWSER proof.

Still unproven:

- `npm run verify:repository` execution result on the current handoff HEAD;
- `npm run check` / Svelte type correctness on the current handoff HEAD;
- production build result if later required by a concrete failure;
- actual desktop/mobile spacing and overflow;
- Export menu placement and dismissal behavior;
- focus/keyboard behavior;
- Canvas pointer painting, selection, pan/zoom interaction;
- crop manipulation;
- integrated image update behavior in a real browser;
- configured Website Admin login/session/settings behavior;
- target database migration state;
- deployed runtime behavior.

GitHub Actions verification workflows are intentionally deferred and their jobs are disabled with `if: false`; they are not evidence for the current UI slice.

These are **proof gaps**, not reasons to redesign again.
