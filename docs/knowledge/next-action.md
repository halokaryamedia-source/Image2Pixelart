# Next Action

## Current Status

The current `Local` HEAD containing this file is the handoff anchor for the completed Website Admin + Editor simplification pass.

The approved ordinary UI decisions, Website Admin configuration path, Canvas authority rules, and Editor simplification are implemented at **source/static** level while preserving the MIVUBI visual identity.

### Completed: Akses Umum / Home

- Home remains the ordinary launcher for creating/opening work;
- new work no longer accepts ordinary-user Canvas width/height/cell-size choices;
- Home receives the active Website Admin Canvas configuration from `+page.server.ts`;
- new work snapshots that active configuration before project creation;
- ordinary UI terminology uses `Karya` for creation/name context and `File` for stored/open/delete items;
- ordinary Canvas information is presented as `Ukuran Fisik` and `Ukuran Grid`.

### Completed: Website Admin

- Website Admin is application-level authority and is **not** project ownership, Device ID, `User-01`, or active-editor state;
- dedicated Admin surfaces are `/admin/login`, `/admin`, `/admin/settings`, and `/admin/settings/canvas`;
- Admin authentication uses password-hash verification plus a signed HttpOnly session boundary;
- Admin runtime configuration is external through `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`;
- active global Canvas settings persist through `site_settings` / `002_site_settings.sql`;
- Admin Canvas changes affect newly created work only; existing files keep their original snapshot;
- project creation API rejects Canvas dimensions that do not match current Website settings;
- existing project PUT rejects any structural Canvas change regardless of project ownership.

### Completed: Editor UX simplification

- default workspace is Canvas-first: left panel closed, right panel closed, Palet Cepat visible;
- blank work with no palette gets direct first-use guidance;
- normal image conversion is `Gaya Pixel Art` + `Jumlah warna` + `Perbarui Pixel Art dari Gambar`;
- image/crop/style/color-count changes mark the current Pixel Art as needing update;
- automatic palette preparation is handled internally when normal image conversion needs it;
- Saran Warna remains an advanced Library Palet capability rather than a mandatory normal step;
- header exposes one `Ekspor` menu instead of a permanently visible format selector;
- PDF Blueprint and PNG Transparan are first, with PNG + Grid / CSV / File Kerja under `Ekspor lainnya`;
- primary tools are Pencil, Eraser, Pan; Pipet, Fill, Select are grouped as `Alat lainnya` while retaining shortcuts;
- Palet Cepat is the normal color-selection surface;
- right panel is contextual management for palette/detail work;
- ordinary `Properti Canvas` contains only `Ukuran Fisik` and `Ukuran Grid`;
- ordinary Editor structural Canvas-resize code has been removed;
- Editor hierarchy/styling is owned by `EditorView.svelte`, not route-level hidden-element/`nth-child` overrides;
- retired collaboration roster/request/handoff presentation is not part of the current ordinary Editor surface.

### Completed: documentation alignment

- `docs/foundation/05-ui-design-system.md` now reflects Website Admin and the current Editor model;
- `docs/knowledge/implementation-map.md` routes to current source paths;
- `docs/knowledge/ownership.md` separates Website Admin, project ownership, active editor, and persistence responsibilities;
- `docs/knowledge/ui-audit.md` and `ui-implementation-plan.md` describe the implemented source/static state instead of the older project-owner Admin proposal;
- `CHANGELOG.md` records the meaningful Unreleased product/repository improvements.

## Handoff Reading Order

Before changing the current UI/Admin work, read:

1. `docs/foundation/00-product-boundaries.md`;
2. `docs/foundation/05-ui-design-system.md`;
3. `docs/knowledge/editor-ui-decisions.md`;
4. `docs/knowledge/implementation-map.md`;
5. this file;
6. `docs/knowledge/current-validation.md`.

## Superseded Architecture Warning

Do **not** revive older history that modeled `project owner = Admin Website` or split the current editor into Player/Admin editor components.

Retired/superseded concepts include:

```text
PlayerEditorView.svelte
AdminProjectView.svelte
AdminEditorView.svelte
ProjectEditorRoute.svelte
/admin/project/[id]
project owner → Website Admin
```

Project ownership still matters for project-specific permissions such as delete/recovery. Active-editor/revision/realtime guards still matter for project persistence. Neither grants Website Admin authority.

## Active Boundary

Do not restart a redesign. Preserve the approved MIVUBI visual system, exact icon/glyph identities, Akses Umum terminology, and Website Admin separation.

Do not reintroduce:

- ordinary Canvas resize controls;
- project-owner-based Website Admin authority;
- technical palette-pipeline steps in the normal conversion UI;
- permanently visible export-format selectors;
- route-level CSS hacks used only to hide retired ordinary UI;
- collaboration roster/request/handoff UI without a new explicit requirement.

The database migration, deployment, cloud configuration, and Admin secrets must not be changed merely to perform UI verification.

## Proof Status

Current proof level is **SOURCE/STATIC VERIFIED for the handoff structure**, with an important ceiling:

- current `Local` branch and source files were re-read after the cleanup;
- required repository owners/canonical skills remain present in the HEAD tree;
- the current Editor source no longer contains ordinary Canvas-resize state/modal logic or route-level hiding hacks;
- current UI Foundation/knowledge owners are aligned with the Website Admin model;
- `npm run verify:repository` and `npm run check` were **not executed** in the previous execution environment because no usable local checkout could be obtained;
- GitHub Actions verification workflows are intentionally deferred and their jobs are `if: false`, so they do not substitute for local proof;
- no browser/rendered acceptance has been claimed;
- `002_site_settings.sql` has not been proven applied in a target database;
- no deployment/cloud mutation was performed.

## Next Step

When `LOCAL_CODE` and preferably `LIVE_BROWSER` capability is available:

1. run `npm run verify:repository`;
2. run `npm run check` and fix only concrete Svelte/type issues;
3. if needed, run the smallest relevant unit/build proof, escalating to `npm run verify:application` only when materially justified;
4. inspect the ordinary Home and Editor at desktop and mobile widths;
5. verify Canvas dominance, default panels, Palet Cepat, blank-work guidance, tool hierarchy, crop/image update, color-count update, palette/detail management, save state, shortcuts, and Export menu;
6. verify keyboard/focus and that menus/panels do not obscure the Canvas unexpectedly;
7. verify Website Admin login/settings only after `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, and the migration are intentionally configured in the intended environment;
8. do not run migration/deploy/cloud mutation without explicit Operations authorization.
