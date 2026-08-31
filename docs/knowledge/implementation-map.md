# Implementation Map

Use this as the first routing index for named defects/features. It is not a full source inventory.

## Home / project creation

```text
src/routes/+page.svelte
→ cloud initialization
→ create/import/delete project orchestration

src/lib/components/HomeView.svelte
→ dashboard/create-project UI
```

## Project editor

```text
src/routes/project/[id]/+page.svelte
→ cloud load/join/realtime/autosave/editor handoff

src/lib/components/EditorView.svelte
→ editing tools, palette, reconstruction, canvas settings, export actions

src/lib/components/MosaicCanvas.svelte
→ canvas render/pointer/selection/pan/zoom/grid interaction

src/lib/components/VisualCropper.svelte
→ source crop/zoom interaction
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
→ project/data types + empty-cell sentinel

src/lib/project.ts
→ create/serialize/deserialize/migrate/clone

src/lib/utils/rle.ts
→ cell RLE

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
→ PDF

src/lib/export/png.ts
→ PNG / grid PNG

src/lib/utils/csv.ts
→ material + matrix CSV

src/lib/utils/download.ts
→ browser download helpers
```

## Browser persistence / cloud client

```text
src/lib/storage.ts
→ IndexedDB project draft/global palettes

src/lib/cloud/device.ts
→ anonymous device identity

src/lib/cloud/api.ts
→ browser HTTP client

src/lib/cloud/project-codec.ts
→ project ⇄ cloud payload

src/lib/cloud/realtime.ts
→ WebSocket connection/project live transport
```

## Server / API hot paths

```text
src/lib/server/auth.ts
→ device authentication

src/lib/server/db.ts
→ Neon client

src/lib/server/project-data.ts
→ project payload persistence/validation

src/lib/server/r2.ts
→ R2 client/object operations

src/lib/server/realtime.ts
→ realtime token/internal Worker authorization

src/lib/server/rate-limit.ts
→ rate limits

src/routes/api/**
→ HTTP endpoints
```

## Cloud storage / realtime / maintenance

```text
db/migrations/
→ durable DB shape

realtime/src/index.ts
→ Durable Object/WebSocket room behavior

realtime/wrangler.jsonc
→ Worker binding/origin/deployment config

src/routes/api/maintenance/purge/+server.ts
→ soft-delete purge

scripts/smoke-cloud.mjs
→ end-to-end cloud integration smoke
```

## Defect index

| Symptom | Start here |
| --- | --- |
| wrong rows/columns/tile compatibility | `src/lib/utils/grid.ts` |
| wrong generated colors | `image-analysis.ts` + `utils/color.ts` |
| crop framing wrong | `VisualCropper.svelte` + `utils/image-crop.ts` + converter |
| project file fails/migrates wrong | `project.ts` + `cloud/project-codec.ts` |
| palette removal corrupts canvas | `utils/palette.ts` |
| undo/redo wrong | `history.ts` |
| export material count wrong | canonical project/grid + export owner |
| viewer can save | server auth/project endpoint/permissions |
| stale overwrite accepted | project save route + revision owner |
| edit handoff inconsistent | project page + server realtime + Worker |
| R2 upload/finalize wrong | source API routes + `server/r2.ts` |
| presence/WebSocket wrong | cloud realtime client + Worker |
| build succeeds but UI broken | browser proof; do not edit CI first |
