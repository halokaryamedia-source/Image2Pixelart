# Next Action

## Current Status

The approved UI review covering decisions **1–170**, Website Admin configuration path, and the Editor simplification pass are implemented at source/static level on the selected `Local` branch while preserving the MIVUBI visual identity.

Implemented direction:

- Akses Umum uses a Canvas-first Editor: left/right panels closed by default and Palet Cepat visible;
- ordinary Canvas information is limited to `Ukuran Fisik` and `Ukuran Grid`;
- structural Canvas resize code is removed from the ordinary Editor surface; existing file dimensions remain immutable through the project API;
- image-to-Pixel-Art flow uses one normal update action after `Gaya Pixel Art` / `Jumlah warna`; internal Saran Warna steps no longer dominate the ordinary panel;
- changing image/crop/style/color-count correctly marks the rendered Pixel Art as needing update;
- Palet Cepat is the normal color-selection surface; the right panel is contextual palette/detail management;
- primary tools are Pencil, Eraser, Pan with Pipet, Fill, Select grouped as `Alat lainnya` without removing shortcuts/capability;
- the Header exposes one `Ekspor` menu, with PDF Blueprint and PNG Transparan first and secondary formats under `Ekspor lainnya`;
- Editor-specific visual hierarchy now lives in `EditorView.svelte` rather than brittle route-level `nth-child` / hidden-element CSS;
- Website Admin is separate from `User-01`, Device ID, project owner, and active-editor authorization;
- `/admin/login`, `/admin`, `/admin/settings`, and `/admin/settings/canvas` are the Website Admin surfaces;
- Website Admin controls global Canvas width/height/cell size for newly created work; old files keep their stored snapshot;
- project creation and project save APIs enforce the Canvas authority boundary server-side;
- migration `002_site_settings.sql` defines persistent website settings, but it has **not** been applied from this execution context;
- Admin secrets remain external through `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`.

Automatic CI, branch architecture, deployment, database migration, and external cloud mutations remain out of scope unless explicitly authorized.

## Active Boundary

Do not restart a redesign. Preserve the approved MIVUBI visual system, exact icon/glyph identities, Akses Umum terminology, and Website Admin separation.

Do not reintroduce ordinary Canvas resize controls, project-owner-based Admin authority, retired collaboration roster/request/handoff UI, technical palette-pipeline steps, or permanently visible export-format selectors.

Current proof level is **SOURCE/STATIC ONLY** in this execution context. No claim is made yet about rendered spacing, menu placement, responsive behavior, focus behavior, crop/pointer interaction, Svelte type/build success, configured Admin secrets, applied database migration, or deployed runtime behavior.

## Next Step

When `LOCAL_CODE` and preferably `LIVE_BROWSER` capability is available:

1. run `npm run verify:repository`;
2. run `npm run check` and fix only concrete Svelte/type issues;
3. use the smallest relevant tests/build proof if checks expose a concrete executable issue;
4. inspect the ordinary Editor in a real browser at desktop and mobile widths;
5. verify Canvas dominance, default panel state, tool hierarchy, Palet Cepat, empty-palette guidance, image crop/update flow, color-count update flow, palette/detail management, save state, shortcuts, and the Export menu;
6. verify focus/keyboard behavior and that menus/panels do not obscure the Canvas unexpectedly;
7. verify `/admin/login` and Canvas settings only after Admin secrets + migration are intentionally configured in the target environment;
8. do not run migration/deploy/cloud mutation without explicit Operations authorization.
