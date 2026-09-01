# UI Implementation Plan

Status: familiar-baseline Player/Admin alignment

The current UI direction is no longer a visual redesign. The approved goal is to keep the original MIVUBI visual language and make role, wording, hierarchy, and information clearer.

Durable direction: `docs/foundation/05-ui-design-system.md`.

## Source/static implementation completed

### Player Home

- familiar MIVUBI header and `Dari gambar ke grid presisi.` hero retained;
- Home is project-launcher-first;
- Admin size controls are absent from ordinary Player Home;
- project cards should surface the Grid information that is actually useful to users;
- Tile counts/statistics such as `1.152 Tile` are not Player-facing information because they only duplicate total Grid-cell count and are not an intended material/production metric;
- existing project thumbnail and menu/icon language retained.

### Player project start

- empty projects use the familiar original two-column card composition;
- tabs are `Dari gambar` and `Build langsung`;
- upload icon, grid symbols, project styling, physical preview, borders, and button language remain consistent with the original UI;
- canvas information is read-only and explicitly labeled;
- selected images move into a simple `Isi canvas / Tampilkan semua` positioning step;
- no developer/design rationale is visible in Player copy.

### Player Editor

- existing Editor remains the visual owner;
- basic tools are shown first;
- advanced tools/panels remain progressively available;
- save presentation is simple;
- Finish begins with `Panduan Build` and `Gambar pixel`;
- `Ekspor lainnya` owns advanced file formats.

### Admin

- project creation is moved to `/admin`;
- Admin creation uses the same familiar MIVUBI form + grid-preview language;
- width/height/tile remain Admin inputs;
- project owner remains server-enforced structural authority after creation.

## Do not change next

Do not:

- replace the logo, icons, thumbnails, palette style, grid visual, fonts, colors, cards, inputs, radius, border, or shadow system;
- add new decorative navigation/sidebar concepts;
- reintroduce Admin configuration into Player Home;
- compress project dimensions into ambiguous unlabeled number strings;
- put implementation/provider/prompt terminology in UI copy;
- restart a whole-app redesign.

## Remaining proof

When LOCAL_CODE/LIVE_BROWSER becomes available:

1. `npm run check`;
2. targeted tests/build only if required by concrete failures;
3. browser review of Home, empty-project start, image positioning, Player Editor, Finish, and `/admin`;
4. fix exact compile/layout/interaction failures only;
5. stop.

Automatic CI remains deferred.
