# Next Action

## Current Status

This file is the canonical handoff for the completed **Website Admin + Akses Umum + Editor simplification** pass on branch `Local`.

The source has already been changed. The next developer should **not restart the UI redesign or reinterpret the Admin model**. The remaining work is primarily local/static/browser validation and fixing only concrete defects found by that proof.

### Executive summary

The product now has three separate authority concepts that must not be mixed:

```text
Website Admin
→ website-level configuration authority
→ authenticated with dedicated Admin password/session
→ controls global Canvas configuration for NEW work

Project owner / device identity
→ project-specific ownership/persistence concept
→ may matter for delete/recovery and project membership
→ does NOT grant Website Admin access

Active editor
→ project editing authorization at a point in time
→ enforced by activeEditorDeviceId + revision/realtime guards
→ does NOT grant Website Admin access
```

The key product rule is:

```text
Website Admin chooses active Canvas configuration
→ ordinary user creates a new work
→ the new work snapshots that Canvas configuration
→ the work keeps that snapshot permanently
→ later Website Admin changes affect future work only
```

Existing files are therefore structurally immutable through the ordinary project-save path.

---

### 1. Akses Umum / Home — completed behavior

Ordinary users create and continue Pixel Art from the normal Home route.

Current flow:

```text
/
→ +page.server.ts loads current Website Canvas settings
→ +page.svelte initializes device + project list
→ HomeView.svelte renders ordinary Home
→ user chooses Upload Gambar or Buat Baru
→ createNew() replaces any client dimensions with server-loaded Canvas settings
→ POST /api/projects validates the dimensions again server-side
→ new project is created
→ user enters /project/[id]
```

Important consequences:

- ordinary users do not choose Canvas width;
- ordinary users do not choose Canvas height;
- ordinary users do not choose cell size;
- ordinary users may see `Ukuran Fisik` and `Ukuran Grid` as information;
- the server rejects a manually crafted new-project payload whose structural Canvas values do not match active Website settings;
- project creation cannot bypass the Website Admin setting merely by modifying the browser request.

Current primary files:

```text
src/routes/+page.server.ts
→ reads active Canvas settings

src/routes/+page.svelte
→ device/project orchestration
→ force new work to use server-loaded Canvas settings

src/lib/components/HomeView.svelte
→ ordinary Home UI

src/routes/api/projects/+server.ts
→ final server-side Canvas match enforcement for new work
```

Terminology decisions to preserve:

```text
Karya
→ creation / artwork naming context

File
→ stored/open/delete item

Ukuran Fisik
→ physical Canvas size

Ukuran Grid
→ Grid columns × rows

sel
→ individual Grid cell
```

Do not reintroduce `tile` as the general ordinary-user term for a Grid cell.

---

### 2. Website Admin — completed architecture

Website Admin means the administrator/operator of the website. It does **not** mean owner of a file, owner of a Device ID, or current editor of a project.

Current Admin routes:

```text
/admin/login
→ dedicated Admin password login

/admin
→ protected Admin dashboard

/admin/settings
→ Website settings index

/admin/settings/canvas
→ Canvas configuration
```

Current Admin authentication model:

```text
ADMIN_PASSWORD_HASH
→ password verification source

ADMIN_SESSION_SECRET
→ signs/verifies Website Admin session

mivubi_admin_session
→ signed HttpOnly session cookie
```

Implementation details:

- password hashing uses scrypt;
- password comparison uses timing-safe comparison;
- session token uses `jose` signing/verification;
- Admin session cookie is HttpOnly;
- SameSite is Strict;
- Secure is enabled outside development;
- session lifetime is finite;
- Admin login is rate-limited;
- no username/account system was introduced;
- no `localStorage.isAdmin` or hidden-client-only Admin check is authoritative;
- no `ownerDeviceId` → Admin shortcut exists.

Primary files:

```text
src/lib/server/admin-auth.ts
→ password verification
→ Admin session creation/verification
→ requireAdminSession()

src/routes/admin/login/+page.server.ts
→ login action + rate limit + session creation

src/routes/admin/login/+page.svelte
→ Admin login UI

src/routes/admin/+page.server.ts
src/routes/admin/+page.svelte
→ protected Admin dashboard

src/routes/admin/settings/+page.server.ts
src/routes/admin/settings/+page.svelte
→ settings index

src/routes/admin/settings/canvas/+page.server.ts
src/routes/admin/settings/canvas/+page.svelte
→ Canvas form + validation + save
```

Admin Canvas UI currently owns:

```text
Lebar
Tinggi
Ukuran Sel

Derived automatically:
Ukuran Grid
Total Sel
```

Do not add ordinary-user Canvas controls just because the Admin form has them.

---

### 3. Website Canvas settings lifecycle — completed behavior

Persistent Website Canvas settings are stored separately from projects.

Primary source:

```text
db/migrations/002_site_settings.sql
→ creates site_settings
→ initial `canvas` row

src/lib/site-settings.ts
→ shared Canvas settings types

src/lib/server/site-settings.ts
→ read / validate / derive / upsert active Canvas settings
```

The stored setting contains the structural input:

```text
widthMm
heightMm
cellMm
```

Grid columns/rows and total cells are derived from validation rather than manually trusted as independent configuration.

The migration exists in source but has **not** been proven applied in a configured target database from this work session.

Do not claim live Admin settings work until the migration and required environment secrets are intentionally configured and tested.

---

### 4. Existing project Canvas immutability — completed enforcement

Existing project dimensions are a snapshot from project creation. Ordinary project saves may update project content, but must not alter Canvas structure.

Current server rule in:

```text
src/routes/api/projects/[id]/+server.ts
```

On PUT, the endpoint compares incoming project values against the stored document:

```text
widthMm
heightMm
cellMm
columns
rows
```

If any differ, save is rejected with:

```text
Ukuran Canvas file tidak dapat diubah.
```

This guard is independent from Website Admin authentication and independent from project ownership.

After the structural check, the normal project persistence guards still apply:

```text
active editor device
→ realtime editor authorization
→ If-Match revision
→ save
```

Do not replace this server boundary with CSS hiding or client-only validation.

---

### 5. Project ownership vs Website Admin — preserve this separation

Project ownership still exists in the cloud/project model.

Examples of project-owner-specific behavior may include:

- deleting a project;
- restoring/recovering a deleted project;
- historical participant/ownership metadata.

But the following is invalid and must not return:

```text
project.ownerDeviceId === currentDevice.id
→ Website Admin
```

Website Admin authentication is its own website-level session.

The current architecture intentionally allows these states to exist independently:

```text
A device may own a project but not be Website Admin.
A Website Admin may configure the website without being the owner of a specific project.
An active editor may edit project content without being Website Admin.
```

---

### 6. Editor default workspace — completed UX simplification

The ordinary Editor now uses a Canvas-first default.

Expected initial workspace:

```text
left panel = closed
right panel = closed
Palet Cepat = visible
Canvas = dominant
```

Primary owner:

```text
src/lib/panel-preferences.ts
```

The preference key was versioned so older panel-heavy preferences do not silently restore the previous cluttered default.

Primary Editor source:

```text
src/lib/components/EditorView.svelte
```

The project route should stay mostly orchestration/persistence:

```text
src/routes/project/[id]/+page.svelte
→ project load/join
→ realtime
→ active editor state
→ autosave/draft/final save
→ source image upload
→ blank-work start guidance
```

Do not move visual Editor ownership back into route-level CSS hacks.

---

### 7. Blank Canvas first-use state — completed

A newly created blank work may initially have no palette.

Previously this was confusing because Pencil could appear selected while no active color existed.

Current behavior:

```text
project.palette.length === 0
→ route shows first-use guidance
→ user is directed to `+ Tambah Warna` in Palet Cepat
```

The goal is that a user understands the first action without assuming the Editor is broken.

Do not remove this guidance unless a replacement provides an equally clear first action.

---

### 8. Image → Pixel Art flow — completed simplification

The normal user should not need to understand the internal palette-generation pipeline.

Normal visible flow:

```text
Gaya Pixel Art
Jumlah warna
→ Perbarui Pixel Art dari Gambar
```

The old visible normal workflow:

```text
Buat Saran Warna
→ Gunakan Saran Warna
→ Perbarui Pixel Art dari Gambar
```

was intentionally removed from the ordinary path because it exposed internal implementation steps as user decisions.

Current implementation behavior in `src/lib/image-project.ts`:

```text
applyCells requested
AND palette is empty
→ automatically generate image palette
→ apply it
→ generate cells

applyCells requested
AND requested color count no longer matches available suggestion count
→ automatically regenerate image palette for the new count
→ apply it
→ generate cells

applyCells requested
AND an existing manually managed palette is still valid for the requested flow
→ preserve the existing palette
→ regenerate cells with that palette
```

The relevant internal decision is implemented through:

```text
autoSuggestForCells
shouldSuggestPalette
shouldApplyPalette
```

Therefore `EditorView.svelte` can call the one normal update action without forcing the user to run a separate palette suggestion step first.

`Saran Warna` still exists as an advanced palette option in Library Palet. It is **not** deleted from capability; it is merely no longer mandatory in the normal image conversion panel.

Changes that should mark the current rendered Pixel Art as needing update include:

- image/source change;
- crop/placement change;
- render-style change;
- color-count change.

Preserve the stale/update indication so the user understands that the visible Pixel Art is still based on older settings.

Primary files:

```text
src/lib/components/EditorView.svelte
src/lib/image-project.ts
src/lib/image-converter.ts
src/lib/image-analysis.ts
src/lib/utils/image-crop.ts
src/lib/utils/color.ts
```

---

### 9. Editor tool hierarchy — completed

All capabilities remain available, but normal drawing tools are visually prioritized.

Primary tools:

```text
Pencil
Eraser
Pan
```

Secondary group:

```text
ALAT LAINNYA
Pipet
Fill
Select
```

Important language rule:

```text
Pipet stays `Pipet`.
Pencil / Fill / Eraser / Select / Pan keep those approved English labels.
```

All existing keyboard shortcuts remain available.

The grouping is now encoded directly in `EditorView.svelte`; it must not depend on route-level `nth-child` reordering.

---

### 10. Palette UX — completed hierarchy

Normal drawing uses **Palet Cepat**.

The right panel is contextual management, not the normal color picker that must stay open all the time.

Current division:

```text
Palet Cepat
→ choose active drawing color quickly

Right panel / Palet
→ see/manage project colors
→ add color
→ open Library Palet

Right panel / Detail
→ HEX
→ optional color name
→ lock/unlock
→ delete
→ save palette to Library
```

The right-panel palette list was made more compact so it behaves like management rather than competing visually with the Canvas.

Do not reopen the right panel by default merely because palette management exists.

---

### 11. Properti Canvas — completed simplification

Ordinary `Properti Canvas` intentionally shows only:

```text
Ukuran Fisik
Ukuran Grid
```

Removed from the ordinary panel:

```text
Pixel Berwarna
Pixel Kosong
structural resize controls
```

Rationale:

- filled/empty counts are not part of the user's main editing task;
- calling Grid-cell counts `Pixel` conflicts with the terminology rule that `Pixel Art` is the result while Grid units are `sel`;
- Canvas structural configuration belongs to Website Admin, not the ordinary Editor.

Do not re-add those fields just because they are easy to calculate.

---

### 12. Header and Export — completed simplification

The previous permanent combination:

```text
format select
+ Ekspor button
```

was replaced with one `Ekspor` entry point.

Current menu hierarchy:

```text
Ekspor
├─ PDF Blueprint
├─ PNG Transparan
└─ Ekspor lainnya
   ├─ PNG + Grid
   ├─ CSV Material
   ├─ CSV Matriks
   └─ File Kerja
```

This preserves every export capability while removing the need to choose a format before the user has decided to export.

Primary source:

```text
src/lib/components/EditorView.svelte
src/lib/export/
src/lib/utils/csv.ts
src/lib/utils/download.ts
```

Do not restore a permanently visible export-format selector without a new explicit requirement.

---

### 13. Collaboration presentation — current boundary

Realtime/project persistence infrastructure still exists and still matters.

However, the old collaboration roster/request/handoff presentation is not part of the current ordinary Editor surface.

`src/lib/components/CollaborationBar.svelte` may still exist in the repository as historical/unused source. Its existence does not make it current Editor UI authority.

Do not delete cloud/realtime authorization merely because the collaboration presentation was simplified.

Do not reintroduce the old visible collaboration UI unless a new explicit product requirement asks for it.

---

### 14. UI visual preservation — mandatory

This work is a hierarchy/usability cleanup, not a visual rebrand.

Preserve unless explicitly approved otherwise:

- MIVUBI logo;
- existing icon/glyph identities;
- fonts;
- warm ivory / near-white surfaces;
- forest-green primary actions;
- mustard/gold accent family;
- borders/radii/shadows;
- button/input/select treatment;
- hover/focus/selected/disabled behavior;
- spacing character;
- exact Grid/cell fidelity.

Relevant authority:

```text
docs/foundation/05-ui-design-system.md
docs/knowledge/ui-preservation-contract.md
docs/knowledge/editor-ui-decisions.md
```

Do not replace existing icons with a new icon library or redesign the app into a generic SaaS UI.

---

### 15. Important source map for continuation

If the next defect is about Home or project creation, start here:

```text
src/routes/+page.server.ts
src/routes/+page.svelte
src/lib/components/HomeView.svelte
src/routes/api/projects/+server.ts
```

If the next defect is about Website Admin login/session, start here:

```text
src/lib/server/admin-auth.ts
src/routes/admin/login/+page.server.ts
src/routes/admin/login/+page.svelte
```

If the next defect is about Website Canvas settings, start here:

```text
src/lib/server/site-settings.ts
src/lib/site-settings.ts
src/routes/admin/settings/canvas/+page.server.ts
src/routes/admin/settings/canvas/+page.svelte
db/migrations/002_site_settings.sql
```

If the next defect is about ordinary Editor layout/tools/palette/export, start here:

```text
src/lib/components/EditorView.svelte
src/lib/panel-preferences.ts
src/lib/editor-shortcuts.ts
```

If the next defect is about image conversion/palette generation, start here:

```text
src/lib/image-project.ts
src/lib/image-converter.ts
src/lib/image-analysis.ts
src/lib/utils/color.ts
src/lib/utils/image-crop.ts
```

If the next defect is about Canvas drawing/crop behavior, start here:

```text
src/lib/components/MosaicCanvas.svelte
src/lib/components/VisualCropper.svelte
```

If the next defect is about persistence/editor authorization, start here:

```text
src/routes/project/[id]/+page.svelte
src/routes/api/projects/[id]/+server.ts
src/lib/cloud/
src/lib/server/realtime.ts
realtime/src/index.ts
```

For a broader routing index, use:

```text
docs/knowledge/implementation-map.md
```

---

### 16. Important commit timeline

Use Git history for exact diff details, but these commits explain the progression of the current implementation:

```text
8635460c5fbffd3c828fd707c3e04f792ab1ba53
→ finalize approved Editor UI decisions through item 170

fb2cfbb2b4914490006721c7924e6ccc5d7c4460
→ implement approved ordinary/general UI review

78c55db648541aea982c7f136921ba421169b5a2
→ SUPERSEDED / WRONG MODEL
→ temporarily treated project owner as Admin
→ do not cherry-pick or use as authority

6703834d807c9805eca733ffc1a13c212abaadee
→ correct architecture to Website Admin + global Canvas settings
→ add Admin auth/session/settings + server-side Canvas enforcement

32202de0d8d20b94bf3beb382d044a91f1409cae
→ Canvas-first Editor default workspace

9e44f1a0beb578e9e0126e79216b8fefd14f0246
→ simplify normal image-to-Pixel-Art flow

c468437aaf8999fddf0ce3649065d9f4f99c9241
→ initialize palette correctly for blank/image flow edge case

b347b3840f2fbd7944997ab383aadb746aadf329
→ simplify Header / Export menu

7fe7bc8cd28b3a349f3d1b69adb933b718ea99a4
→ clarify drawing-tool hierarchy

7f0a0c915b03d7fc0145e2463320797f6e4b1eeb
→ simplify palette management + ordinary Canvas information

698849f16167b2e75d2e88856753aa1f42e9ed24
→ final source cleanup/consolidation
→ remove ordinary resize dead code and brittle route CSS ownership

e936ec6b6033c6f5b20f16f506ed367a23823f6f
→ align repository handoff/docs to current architecture
```

Any commit after the last entry may be documentation/validation continuation. Always use current `Local` source as authority over an older commit.

---

### 17. Superseded architecture warning

Do **not** revive older history that modeled `project owner = Website Admin` or split the current Editor into Player/Admin editor implementations.

Retired/superseded concepts include:

```text
PlayerEditorView.svelte
AdminProjectView.svelte
AdminEditorView.svelte
ProjectEditorRoute.svelte
/admin/project/[id]
project owner → Website Admin
ownerDeviceId → Website Admin
```

The wrong owner-as-Admin implementation may still appear in Git history because history was not rewritten. That historical presence is not current product authority.

Do not force-push/rewrite history merely to remove that old commit.

---

### 18. Handoff reading order

Before modifying this area, the next developer should read these in order:

1. `AGENTS.md` — repository work/STOP rules;
2. `GITHUB_RULES.md` — exact GitHub write discipline;
3. `docs/foundation/00-product-boundaries.md` — product/access boundary;
4. `docs/foundation/05-ui-design-system.md` — durable UI authority;
5. `docs/knowledge/editor-ui-decisions.md` — approved ordinary Editor decisions;
6. `docs/knowledge/implementation-map.md` — current source routing;
7. this file — current handoff/status;
8. `docs/knowledge/current-validation.md` — proof ceilings.

Do not infer current architecture from old screenshots, old planning docs, or superseded commits when the current owners above say otherwise.

## Active Boundary

Do not restart a redesign. Preserve the approved MIVUBI visual system, exact icon/glyph identities, Akses Umum terminology, and Website Admin separation.

Do not reintroduce:

- ordinary Canvas resize controls;
- project-owner-based Website Admin authority;
- Device ID based Website Admin authority;
- technical palette-pipeline steps in the normal conversion UI;
- permanently visible export-format selectors;
- route-level CSS hacks used only to hide retired ordinary UI;
- collaboration roster/request/handoff UI without a new explicit requirement;
- new visual/icon libraries without explicit approval;
- a second parallel handoff/roadmap/status document when this owner can be updated.

Do not perform these operations merely to verify the UI:

```text
database migration
deployment
Worker deployment
R2 configuration
production/cloud mutation
```

Those require explicit Operations intent and the correct target environment.

---

### 19. Proof status at handoff

Current proof level is **SOURCE/STATIC VERIFIED for the handoff structure**, with a strict ceiling.

Verified from current repository source:

- current `Local` branch contains the Website Admin architecture;
- Website Admin is separated from project ownership/device/active-editor concepts;
- ordinary new project creation is tied to active Website Canvas settings;
- project-create API checks Canvas settings server-side;
- existing project PUT prevents structural Canvas changes;
- ordinary Editor no longer contains the old structural Canvas resize modal/state path;
- default panel preferences are Canvas-first;
- current normal Hasil Pixel Art UI is one-step update oriented;
- image conversion contains internal automatic palette logic for empty/mismatched color-count cases;
- Tool hierarchy, compact palette management, basic Properties, and single Export menu are present in source;
- current Foundation/Knowledge docs now describe the Website Admin model rather than the old project-owner Admin model;
- required repository owners/canonical skills remained present in the HEAD tree during the previous static validation.

Not yet proven:

```text
npm run verify:repository
npm run check
npm test
npm run build
npm run verify:application
```

These were not executed in the previous environment because a usable local checkout could not be obtained from that runtime.

GitHub Actions does not fill this proof gap:

- `repository-verify.yml` is intentionally deferred;
- `application-verify.yml` is intentionally deferred;
- the jobs are configured with `if: false`;
- the relevant HEAD had no successful status checks to reuse as build/type proof.

Also not yet proven:

- desktop rendered spacing;
- mobile rendered spacing;
- Export menu placement/overflow;
- Panel menu placement/overflow;
- focus-visible behavior;
- keyboard interaction in the final rendered UI;
- pointer painting;
- Pan behavior;
- Select behavior;
- crop drag/zoom behavior;
- actual downloaded files from each export option;
- live Website Admin login/session;
- live Canvas setting persistence;
- `002_site_settings.sql` applied in an intended database;
- deployed target behavior.

Do not report these as verified until the matching proof is actually run.

---

### 20. What the next developer should NOT spend time on first

Do not start by:

- redesigning Home again;
- redesigning Editor again;
- adding another Admin concept;
- splitting Editor into Player/Admin components;
- adding another palette workflow;
- moving Canvas controls back to ordinary users;
- replacing icons;
- rewriting realtime/cloud architecture;
- enabling CI just to create a green badge;
- migrating/deploying before local proof identifies a need.

The current highest-value work is to **validate the implementation that already exists**.

## Next Step

When `LOCAL_CODE` and preferably `LIVE_BROWSER` capability is available, perform this continuation in order:

1. confirm the exact branch is `Local` and read the handoff owners above;
2. install/use the repository's locked dependencies with the required Node version (`>=22.12.0`);
3. run `npm run verify:repository`;
4. run `npm run check`;
5. if either command fails, fix only the concrete reported issue and rerun the smallest matching proof;
6. if static checks pass, inspect ordinary Home and Editor in a real browser at desktop and mobile widths;
7. verify Home creation uses the displayed Website Canvas configuration without exposing structural inputs;
8. verify blank-work guidance and `+ Tambah Warna` path;
9. verify default Editor state: Canvas dominant, left/right closed, Palet Cepat visible;
10. verify Pencil / Eraser / Pan plus Pipet / Fill / Select behavior and shortcuts;
11. verify image source, crop/fit, style change, color-count change, stale indication, and one-button Pixel Art update;
12. verify manual palette editing remains preserved when it should be, while empty/mismatched color-count image flows auto-prepare a palette;
13. verify right-panel palette/detail management does not need to remain open for normal drawing;
14. verify Properti Canvas shows only Ukuran Fisik + Ukuran Grid;
15. verify Export menu and each required export path;
16. verify keyboard focus and that Header/Panel/Export menus do not obscure the Canvas unexpectedly;
17. only after local/browser proof is clean, test Website Admin login/settings in an intentionally configured environment;
18. configure `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` outside source;
19. apply `002_site_settings.sql` only with explicit Operations authorization for the intended database;
20. verify Admin Canvas changes affect the next new work while existing work remains unchanged;
21. verify a manually crafted mismatched project-create request is rejected;
22. verify an existing project's structural Canvas values cannot be changed through PUT;
23. do not deploy or mutate production/cloud state unless that operation is separately and explicitly authorized.
