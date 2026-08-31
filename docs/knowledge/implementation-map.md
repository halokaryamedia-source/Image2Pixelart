# Implementation Map

Use this as the first routing index for named defects/features.

## Player Home / project launcher

```text
src/routes/+page.svelte
→ device/project loading
→ import/delete orchestration

src/lib/components/ProjectHomeView.svelte
→ familiar MIVUBI Home header/hero/project cards
→ Player project launcher
→ clear read-only Canvas / Grid Canvas / Ukuran 1 Tile facts
→ Upload gambar / Lanjutkan editor / Lihat status
```

Ordinary Player Home must not own project width/height/tile configuration.

## Admin project creation

```text
src/routes/admin/+page.svelte
→ Admin device initialization + create-project orchestration

src/lib/components/AdminProjectView.svelte
→ separate project-creation form
→ width/height/tile inputs
→ physical grid preview
→ same MIVUBI visual language as the original UI
```

The `/admin` surface is separate from ordinary Player navigation.

## Project editor routing

```text
src/routes/project/[id]/+page.svelte
→ project load/join/realtime/autosave
→ project owner → Admin Editor
→ non-owner participant → Player Editor

src/lib/components/EditorView.svelte
→ full Admin/power-user workbench
→ reconstruction, palette management, canvas settings, advanced export

src/lib/components/PlayerEditorView.svelte
→ familiar original-style empty-project start screen
→ Dari gambar / Build langsung
→ clear read-only project facts
→ upload + image positioning
→ existing Editor with basic tools first
→ task-first Selesai/Export
```

## Admin structural authorization

```text
src/routes/api/projects/[id]/+server.ts
→ project owner (`owner_device_id`) is project Admin authority
→ non-owner active editor may edit mosaic/content
→ non-owner may NOT change widthMm / heightMm / cellMm / columns / rows
```

Do not rely on CSS hiding to enforce Admin-only canvas configuration.

## Canvas / crop

```text
src/lib/components/MosaicCanvas.svelte
→ canvas render/pointer/selection/pan/zoom/grid

src/lib/components/VisualCropper.svelte
→ source crop/zoom/reposition interaction

src/lib/panel-preferences.ts
→ canvas-first default panel visibility
```

## Image → grid

```text
src/lib/image-project.ts
→ project-level conversion application

src/lib/image-converter.ts
→ file validation, bitmap/crop/fit, Worker/main-thread routing

src/lib/workers/image-converter.worker.ts
→ Worker conversion path

src/lib/image-analysis.ts
→ contour/photo cell sampling + palette matching

src/lib/utils/color.ts
→ OKLab/color conversion/palette suggestion

src/lib/utils/image-crop.ts
→ crop geometry

src/lib/utils/grid.ts
→ grid validation/count/resize/fill
```

## Project format / palette / history

```text
src/lib/types.ts
src/lib/project.ts
→ project/data model + serialization/migration

src/lib/utils/palette.ts
→ palette remapping/removal/application

src/lib/history.ts
→ patch-based undo/redo
```

## Exports

```text
src/lib/export/pdf.ts
src/lib/export/pdf-client.ts
src/lib/workers/pdf-export.worker.ts
→ PDF / Player Panduan Build

src/lib/export/png.ts
→ PNG / grid PNG

src/lib/utils/csv.ts
→ advanced material + matrix CSV
```

## Cloud / API / realtime

```text
src/lib/cloud/api.ts
src/lib/cloud/realtime.ts
src/lib/server/**
src/routes/api/**
realtime/src/index.ts
→ persistence, trust, collaboration, realtime transport
```

Ordinary Player copy must not expose provider/infrastructure vocabulary such as Neon, R2, raw revision numbers, or device UUIDs.

## Defect index

| Symptom | Start here |
| --- | --- |
| Player can change canvas/tile/grid | `src/routes/api/projects/[id]/+server.ts` + project editor routing |
| Player Home contains Admin size controls | `ProjectHomeView.svelte` + `/admin` routing |
| Canvas/grid/tile numbers are ambiguous | `ProjectHomeView.svelte` + `PlayerEditorView.svelte` + `05-ui-design-system.md` |
| empty Player project does not resemble familiar UI | `PlayerEditorView.svelte` |
| upload/crop flow confusing | `PlayerEditorView.svelte` + `VisualCropper.svelte` |
| Admin project creation unavailable | `src/routes/admin/+page.svelte` + `AdminProjectView.svelte` |
| wrong generated colors | `image-analysis.ts` + `utils/color.ts` |
| pointer/grid alignment wrong | `MosaicCanvas.svelte` + browser proof |
| viewer can save | server/project endpoint + realtime authorization |
| edit handoff inconsistent | project page + realtime client/Worker |
| build succeeds but rendered UI is wrong | browser proof; do not edit CI first |
