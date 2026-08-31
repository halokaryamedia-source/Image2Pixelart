# UI Implementation Plan

Status: player-first implementation applied at source/static level

The current MIVUBI visual style remains unchanged. The implementation changes role separation, hierarchy, wording, default visibility, and progressive disclosure.

## Completed

### Admin structural authority

- project `owner` is now the project Admin authority;
- width/height/tile/columns/rows changes are rejected server-side for non-owner editors;
- Admin configuration is therefore not presentation-only.

### Player Home

- Home is now a project launcher;
- project cards show fixed physical dimensions read-only;
- CTA is `Upload gambar` when no source exists and `Lanjutkan editor` otherwise;
- project creation dimensions moved into a collapsed `Buat proyek · Admin` surface;
- legacy `HomeView.svelte` was retired in favor of `ProjectHomeView.svelte`.

### Player image flow

```text
open empty project
→ Upload gambar OR Mulai build kosong
→ Atur gambar
→ Isi canvas / Tampilkan semua
→ crop/reposition
→ Gunakan gambar
→ pixel result + palette generated automatically
```

### Player Editor

- canvas-first default remains active;
- left/right panels closed, quick palette visible;
- default visible tools are Pensil/Hapus/Geser;
- Pipet/Isi/Pilih appear through `Alat lainnya`;
- structural `Properti` tab and canvas resize entry are not exposed in Player shell;
- advanced palette/reconstruction capability remains in contextual panels;
- collaboration is contextual rather than permanent;
- save wording is simple;
- `Selesai` offers Panduan Build and Gambar Pixel first, with advanced exports under `Export lainnya`.

### Admin Editor

Project owner continues to receive the full existing `EditorView` workbench with the same MIVUBI style and structural configuration capability.

## Remaining proof

Automatic CI remains deferred by explicit project direction.

Before claiming final runtime/visual completion, obtain when a LOCAL_CODE/LIVE_BROWSER environment is available:

1. `npm run check`;
2. targeted tests / `npm test` for affected contracts where available;
3. browser inspection of Home launcher, Player upload/crop flow, Player Editor basic/advanced tools, Admin Editor, and Finish dialog;
4. server integration proof that a non-owner active editor receives 403 when attempting structural canvas changes.

Do not reactivate CI solely for this proof.

## Future refinement only if evidence requires it

- further simplify wording inside the deliberately advanced reconstruction panel;
- tune Player shell placement at constrained widths after real browser inspection;
- refine icon consistency without replacing the visual system;
- add repeatable E2E only after critical flows earn that maintenance responsibility.