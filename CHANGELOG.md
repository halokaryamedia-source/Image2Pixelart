# Changelog

This file tracks meaningful product/repository changes when the destination repository chooses to publish versioned releases.

Branch lifecycle, tag policy, and release automation are intentionally external/deferred in this portable package.

## Unreleased

### Website Admin and Canvas authority

- replace the superseded project-owner-as-Admin concept with a dedicated **Website Admin** authority;
- add `/admin/login`, `/admin`, `/admin/settings`, and `/admin/settings/canvas` using the same MIVUBI visual language as Akses Umum;
- add server-side Admin authentication with `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, a signed HttpOnly session cookie, and login rate limiting;
- add persistent global Canvas settings through `site_settings` migration `002_site_settings.sql`;
- make new work snapshot the active Website Admin Canvas width/height/cell-size configuration while existing files keep their stored dimensions;
- enforce the Canvas boundary server-side: project creation must match active Website settings, while existing project saves cannot mutate structural Canvas values;
- keep project ownership, device identity, active-editor authorization, revision guards, and Website Admin authority as separate concepts.

### Akses Umum and Editor UX

- finalize the approved ordinary UI wording/terminology while preserving the original MIVUBI logo, icons/glyphs, fonts, colors, component treatment, and interaction character;
- make the Editor Canvas-first by default: left/right panels closed and Palet Cepat visible;
- add clear first-use guidance when a blank work has no palette;
- simplify image-to-Pixel-Art flow to `Gaya Pixel Art` + `Jumlah warna` + one `Perbarui Pixel Art dari Gambar` action;
- automatically prepare/apply an image-derived palette when the normal conversion flow needs it, without exposing Saran Warna as a mandatory step;
- keep Saran Warna available as an advanced Library Palet capability;
- simplify the header to one `Ekspor` entry point instead of a permanently visible format selector;
- place `PDF Blueprint` and `PNG Transparan` first, with PNG + Grid, CSV outputs, and File Kerja under `Ekspor lainnya`;
- clarify tool hierarchy with Pencil, Eraser, and Pan as primary tools and Pipet, Fill, and Select under `Alat lainnya`, preserving all shortcuts/capability;
- make Palet Cepat the normal color-selection surface and keep the right panel for contextual palette/detail management;
- reduce ordinary `Properti Canvas` to `Ukuran Fisik` and `Ukuran Grid` only;
- remove obsolete ordinary-Editor Canvas-resize code and remove retired collaboration presentation from the ordinary Editor surface;
- consolidate Editor hierarchy/styling inside `EditorView.svelte` instead of route-level hidden-element/`nth-child` CSS overrides.

### Documentation and handoff

- correct the durable UI Foundation so Website Admin, Akses Umum, Canvas authority, Editor hierarchy, image flow, palette behavior, and export behavior match current source;
- refresh the implementation map and ownership map to current file/routes and remove references to retired `PlayerEditorView`, `AdminProjectView`, owner-as-Admin routing, and `/admin/project/[id]` concepts;
- refresh the current UI audit and implementation-plan documents as implemented source/static state rather than future Player/Admin redesign proposals;
- record the current proof ceiling: source/static checks are available, but local `npm run check`/build and browser acceptance still require a LOCAL_CODE/LIVE_BROWSER environment.

### Repository maintenance

- establish portable development governance without prescribing branch topology or GitHub rulesets;
- add repository/application verification contracts;
- document Svelte, browser, accessibility, cloud, and security proof boundaries;
- add a safe root environment template and repair environment ignore behavior.

Product versions/releases should be added here only when the destination repository explicitly adopts a release/version policy.
