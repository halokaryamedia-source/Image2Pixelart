# Implementation Map

Use this as the first routing index for named defects/features in the current `Local` implementation.

## Ordinary Home / work creation

```text
src/routes/+page.server.ts
→ load active global Canvas settings from Website Admin configuration

src/routes/+page.svelte
→ device/project loading
→ create/import/delete orchestration
→ new work explicitly uses server-loaded Canvas settings before creation
→ image-based creation may convert the initial image before opening the Editor

src/lib/components/HomeView.svelte
→ ordinary MIVUBI Home UI
→ Buat Karya Baru / Upload Gambar / Buat Baru
→ read-only Ukuran Fisik / Ukuran Grid information
→ File Tersimpan
```

Akses Umum must not receive width/height/cell-size controls. A manual project-create request is also checked server-side.

## Website Admin authentication

```text
src/routes/admin/login/+page.server.ts
→ Admin password action
→ login rate limit
→ set Website Admin session

src/routes/admin/login/+page.svelte
→ dedicated Admin password UI

src/lib/server/admin-auth.ts
→ password hash verification
→ signed Website Admin session
→ HttpOnly cookie / route protection
```

Environment owners:

```text
.env.example
→ ADMIN_PASSWORD_HASH
→ ADMIN_SESSION_SECRET

scripts/hash-admin-password.mjs
→ generate scrypt password hash for configuration
```

Do not derive Website Admin access from project owner/device identity.

## Website Admin Canvas settings

```text
src/routes/admin/+page.server.ts
src/routes/admin/+page.svelte
→ protected Admin dashboard + current Canvas summary

src/routes/admin/settings/+page.server.ts
src/routes/admin/settings/+page.svelte
→ protected Pengaturan Website index

src/routes/admin/settings/canvas/+page.server.ts
src/routes/admin/settings/canvas/+page.svelte
→ Lebar / Tinggi / Ukuran Sel inputs
→ derived Ukuran Grid / Total Sel
→ save active global Canvas settings

src/lib/site-settings.ts
→ shared Canvas settings types

src/lib/server/site-settings.ts
→ read/validate/upsert active global Canvas settings

db/migrations/002_site_settings.sql
→ persistent `site_settings` table + default Canvas row
```

Current rule:

```text
Website Admin changes active Canvas settings
→ next newly created work snapshots them
→ existing files keep their original Canvas structure
```

The migration exists in source but has not been proven applied in a configured target environment.

## Canvas authority enforcement

```text
src/routes/api/projects/+server.ts
→ authenticate ordinary device
→ validate project payload
→ load active Website Canvas settings
→ reject new work when widthMm / heightMm / cellMm / columns / rows do not match

src/routes/api/projects/[id]/+server.ts
→ existing project PUT reads stored structural values
→ reject any widthMm / heightMm / cellMm / columns / rows change
→ require active-editor device + realtime authorization + revision match
```

Project ownership still controls project-specific actions such as delete/recovery. It does **not** grant Website Admin authority.

## Project Editor routing

```text
src/routes/project/[id]/+page.svelte
→ load/join project
→ active-editor state
→ realtime synchronization
→ draft/autosave/final save orchestration
→ source-image upload/finalization
→ blank-work first-use guidance

src/lib/components/EditorView.svelte
→ single current ordinary Editor workbench
→ Canvas-first UI
→ image/reference panel
→ Hasil Pixel Art flow
→ Palet Cepat + contextual palette/detail management
→ drawing tools / selection / view controls
→ export menu
```

There is no current project-owner Admin Editor split.

## Editor default hierarchy

```text
src/lib/panel-preferences.ts
→ default: left=false, right=false, quick=true
→ preference key v2 avoids carrying the old panel-heavy default forward

src/lib/components/EditorView.svelte
→ primary tools: Pencil / Eraser / Pan
→ Alat lainnya: Pipet / Fill / Select
→ Palet Cepat = normal color selection
→ right panel = palette/detail management
→ Properti Canvas = Ukuran Fisik + Ukuran Grid only
→ one Ekspor menu in header
```

Ordinary Editor no longer owns structural Canvas resize controls.

## Image → Pixel Art

```text
src/lib/components/EditorView.svelte
→ Gaya Pixel Art
→ Jumlah warna
→ Perbarui Pixel Art dari Gambar
→ image/crop/style/color-count changes mark result stale

src/lib/image-project.ts
→ project-level conversion application
→ automatically suggest/apply image palette when normal cell generation needs it
→ preserve manually managed palette when automatic replacement is not needed

src/lib/image-converter.ts
→ file validation
→ bitmap/crop/fit
→ Worker/main-thread routing

src/lib/workers/image-converter.worker.ts
→ Worker conversion path

src/lib/image-analysis.ts
→ contour/photo cell sampling + palette matching

src/lib/utils/color.ts
→ OKLab/color conversion/palette suggestion

src/lib/utils/image-crop.ts
→ crop geometry
```

`Saran Warna` remains an advanced Library Palet capability. It is not a mandatory ordinary conversion step.

## Canvas / crop / drawing

```text
src/lib/components/MosaicCanvas.svelte
→ Canvas render
→ pointer painting
→ fill/picker/edit interaction handoff
→ selection
→ pan/zoom/grid

src/lib/components/VisualCropper.svelte
→ source crop/zoom/reposition interaction

src/lib/editor-shortcuts.ts
→ keyboard mapping

src/lib/history.ts
→ patch-based undo/redo
```

Actual pointer/crop/focus behavior still requires browser proof.

## Palette

```text
src/lib/components/EditorView.svelte
→ Palet Cepat
→ add color
→ detail/HEX/name
→ lock/unlock/delete
→ Library Palet entry point

src/lib/storage.ts
→ global palette persistence

src/lib/global-palettes.ts
→ global palette creation helpers

src/lib/utils/palette.ts
→ palette remapping/removal/application
```

Do not reopen the right panel by default merely because palette management exists.

## Project format / serialization

```text
src/lib/types.ts
src/lib/project.ts
→ project/data model
→ serialization/migration

src/lib/cloud/project-codec.ts
→ cloud cell/project encoding
```

## Exports

```text
src/lib/components/EditorView.svelte
→ one header Ekspor entry point
→ PDF Blueprint / PNG Transparan first
→ secondary formats under Ekspor lainnya

src/lib/export/pdf.ts
src/lib/export/pdf-client.ts
src/lib/workers/pdf-export.worker.ts
→ PDF Blueprint

src/lib/export/png.ts
→ PNG Transparan / PNG + Grid

src/lib/utils/csv.ts
→ CSV Material / CSV Matriks

src/lib/project.ts + download utilities
→ File Kerja
```

## Cloud / API / realtime

```text
src/lib/cloud/api.ts
src/lib/cloud/realtime.ts
src/lib/server/**
src/routes/api/**
realtime/src/index.ts
→ persistence, device trust, revision guards, active editor, realtime transport
```

Ordinary UI must not expose provider/infrastructure vocabulary such as Neon, R2, raw revision numbers, or device UUIDs as task language.

`src/lib/components/CollaborationBar.svelte` still exists in the repository, but it is not part of the current ordinary Editor authority. Do not infer current UI requirements from its file existence.

## Retired / superseded paths

Do not route new work through older architecture found in history:

```text
PlayerEditorView.svelte
AdminProjectView.svelte
AdminEditorView.svelte
ProjectEditorRoute.svelte
/admin/project/[id]
project owner → Website Admin
```

Those concepts are superseded by the current Website Admin + single ordinary Editor model.

## Defect index

| Symptom | Start here |
| --- | --- |
| ordinary user can choose Canvas size on Home | `HomeView.svelte` + `src/routes/+page.svelte` |
| manually crafted new project bypasses Website Canvas | `src/routes/api/projects/+server.ts` + `site-settings.ts` |
| existing file Canvas dimensions can change | `src/routes/api/projects/[id]/+server.ts` |
| Website Admin login/session fails | `admin-auth.ts` + `/admin/login` server route + env configuration |
| Admin Canvas setting does not persist | `admin/settings/canvas` + `site-settings.ts` + migration state |
| new work ignores Admin Canvas setting | `+page.server.ts` + `+page.svelte` + project-create API |
| old file changes after Admin setting update | project creation snapshot flow + project PUT immutability guard |
| Editor opens visually crowded | `panel-preferences.ts` + `EditorView.svelte` |
| blank work cannot start drawing | project route start guide + Editor palette management |
| image/color-count update does not refresh result | `EditorView.svelte` stale handling + `image-project.ts` |
| wrong generated colors | `image-analysis.ts` + `utils/color.ts` |
| quick palette competes with large palette cards | `EditorView.svelte` palette hierarchy |
| pointer/grid alignment wrong | `MosaicCanvas.svelte` + browser proof |
| crop interaction wrong | `VisualCropper.svelte` + browser proof |
| export menu/layout wrong | `EditorView.svelte` + browser proof |
| viewer can persist edits | project PUT endpoint + project page + realtime authorization |
| build succeeds but rendered UI is wrong | browser proof; do not edit CI first |
