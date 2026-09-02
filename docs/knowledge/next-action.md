# Next Action

## Current Status

The approved UI review covering decisions **1–170** and the first Admin-access path are implemented at source/static level on the selected `Local` branch while preserving the original MIVUBI visual identity.

Implemented direction:

- Home product language uses `PIXEL ART EDITOR`, `Buat Karya Baru`, `File Tersimpan`, and the approved upload/preview/file-management copy;
- ordinary Home no longer exposes Tile totals or editable physical/grid setup controls;
- Akses Umum at `/project/[id]` keeps Canvas physical size and Grid size informational only;
- Editor copy uses the approved `Hasil Pixel Art`, `Saran Warna`, `Library Palet`, tool labels, selection wording, view controls, shortcut wording, and file/export terminology;
- collaboration roster/request/handoff UI is no longer rendered in ordinary or Admin Editor surfaces;
- `/admin` lists files owned by the current device;
- `/admin/project/[id]` is owner-only and reuses the same Editor language/visual system with Admin controls;
- the first Admin-only advanced control is `Ukuran Canvas`, covering Lebar, Tinggi, Ukuran Sel, calculated Ukuran Grid, and Total Sel;
- structural Canvas saves are restricted to the project owner in addition to the existing active-editor and revision guards;
- trash/loading/device/status wording follows the approved File/User terminology;
- original logo, icon/glyph language, fonts, colors, borders, radii, shadows, panel composition, and core canvas interaction remain the visual baseline.

Automatic CI, branch architecture, deployment, database migration, and external cloud mutations remain intentionally out of scope.

## Active Boundary

Do not redesign the application while validating this implementation.

Preserve one UI language and one MIVUBI visual identity across Akses Umum and Akses Admin. Do not reintroduce ordinary-user Canvas resize controls, Tile statistics, collaboration controls, raw collaboration roles, revision text, or infrastructure/provider wording into normal UI.

Admin capability is not permission to weaken cloud/realtime authorization. Owner authority for structural changes is additional to the existing active-editor and revision requirements.

Current proof level is **SOURCE/STATIC ONLY** in this execution context. No claim is made yet about rendered layout, browser interaction, focus behavior, drag/crop behavior, Admin navigation behavior, or deployed cloud runtime behavior.

## Next Step

When `LOCAL_CODE` / `LIVE_BROWSER` capability is available:

1. run `npm run verify:repository`;
2. run `npm run check`;
3. run the smallest relevant tests and `npm run build` if static checks indicate a concrete issue or the final application gate is required;
4. inspect `/`, `/project/[id]`, `/admin`, and `/admin/project/[id]` in a real browser;
5. verify owner-only Admin access, Ukuran Canvas resize, autosave/revision behavior, source-image stale messaging, and return to Akses Umum;
6. inspect ordinary image upload, crop/fit, palette flows, drawing tools, selection, shortcuts, export controls, and trash/loading states;
7. fix only concrete compile/render/interaction/accessibility issues found by that proof;
8. do not restart a redesign or reintroduce removed collaboration UI.
