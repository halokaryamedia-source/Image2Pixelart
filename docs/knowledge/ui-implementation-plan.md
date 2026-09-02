# UI Implementation Plan

Status: implemented source/static slice; remaining work is validation, not redesign

The current UI direction keeps the original MIVUBI visual language and simplifies hierarchy, wording, default visibility, and Website Admin/Akses Umum responsibility.

Durable direction: `docs/foundation/05-ui-design-system.md`.
Approved ordinary Editor decisions: `docs/knowledge/editor-ui-decisions.md`.

## Implemented: Akses Umum Home

- Home is the ordinary work launcher;
- active Canvas settings are loaded server-side from Website configuration;
- ordinary creation does not expose Canvas width/height/cell-size controls;
- `src/routes/+page.svelte` overwrites creation dimensions with the active Website settings before `createProject()`;
- project-create API independently validates those dimensions;
- ordinary terminology uses Karya for creation/name context and File for stored/open/delete context.

## Implemented: Website Admin

- Website Admin is a separate application-level authority;
- dedicated password login/session is under `/admin/login`;
- `/admin`, `/admin/settings`, and `/admin/settings/canvas` own Website configuration UI;
- global Canvas width/height/cell size persists through `site_settings`;
- Ukuran Grid and Total Sel are derived from the saved configuration;
- changes apply to new work only;
- project ownership/device identity/active-editor state do not grant Website Admin access.

## Implemented: Editor default workspace

- existing `EditorView.svelte` remains the visual/workbench owner;
- Canvas is dominant by default;
- left panel closed;
- right panel closed;
- Palet Cepat visible;
- blank works without a palette receive direct guidance to add a color.

## Implemented: image → Pixel Art flow

Normal flow:

```text
Gaya Pixel Art
Jumlah warna
→ Perbarui Pixel Art dari Gambar
```

- crop/placement/style/color-count changes mark current Pixel Art as needing update;
- normal conversion handles palette preparation internally when required;
- Saran Warna is retained as an advanced Library Palet capability rather than a mandatory ordinary step;
- manually managed palettes remain usable when automatic replacement is not needed.

## Implemented: tools and palette hierarchy

Primary tools:

```text
Pencil
Eraser
Pan
```

`Alat lainnya`:

```text
Pipet
Fill
Select
```

- all shortcuts/capability remain available;
- Palet Cepat is the normal color-selection surface;
- right panel is contextual palette/detail management;
- ordinary `Properti Canvas` is limited to Ukuran Fisik + Ukuran Grid.

## Implemented: Header and Export

- header no longer permanently shows an export-format selector;
- one `Ekspor` entry point opens format choices;
- primary choices: PDF Blueprint, PNG Transparan;
- `Ekspor lainnya`: PNG + Grid, CSV Material, CSV Matriks, File Kerja.

## Implemented: source cleanup

- ordinary Editor Canvas resize state/modal/functions removed;
- route-level CSS hacks used to hide retired ordinary UI removed;
- tool and palette hierarchy moved into `EditorView.svelte` itself;
- current project route owns project load/realtime/autosave only and does not split by project-owner Admin UI;
- retired Player/Admin editor component architecture must not be revived from older commits.

## Do not change next

Do not:

- replace the logo, approved icons/glyphs, fonts, colors, cards, inputs, radius, border, shadow, or general MIVUBI visual system;
- reintroduce ordinary Canvas configuration;
- reinterpret project owner/device identity as Website Admin;
- recreate `PlayerEditorView`, `AdminProjectView`, `AdminEditorView`, `ProjectEditorRoute`, or `/admin/project/[id]` as the current architecture;
- expose Saran Warna pipeline steps as mandatory normal workflow;
- reopen all side panels by default;
- return to a permanent export-format selector;
- add collaboration roster/request/handoff UI without an explicit new requirement;
- restart a whole-app redesign because runtime proof is still missing.

## Remaining proof

When LOCAL_CODE/LIVE_BROWSER becomes available:

1. run `npm run verify:repository`;
2. run `npm run check`;
3. run targeted tests/build only when a concrete issue or acceptance claim requires them;
4. browser-review Home and Editor on desktop/mobile;
5. verify image crop/update, color-count regeneration, palette management, shortcuts, focus, tool interaction, and Export menu;
6. verify Website Admin only after the Admin secrets and migration are intentionally configured in the intended environment;
7. fix concrete validation failures only;
8. stop.

Automatic CI remains deferred; database migration/deployment/cloud mutation are not part of ordinary UI validation.
