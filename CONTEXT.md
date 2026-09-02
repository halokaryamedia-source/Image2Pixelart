# MIVUBI Image2Pixelart — Repository Context

Status: active application / current `Local` handoff orientation  
Primary stack: Svelte 5 / SvelteKit / TypeScript / Vite  
Cloud stack: Vercel + Neon PostgreSQL + Cloudflare R2 + Cloudflare Worker/Durable Objects

## Reader-first orientation

A developer opening this repository should be able to answer four questions before editing anything:

```text
1. What is the current product/access model?
2. What has already been implemented?
3. What is still unverified or environment-dependent?
4. Which older architecture must not be revived?
```

If an entry-point document does not make those distinctions clear, fix the canonical owner rather than adding a parallel handoff note.

For the most detailed current continuation, read `docs/knowledge/next-action.md`.

## Branch policy

Branch lifecycle, promotion topology, protected branches, merge policy, version tags, and GitHub rulesets are intentionally external/deferred in this portable repository package.

Every session must use the exact branch/ref selected by the maintainer. Do not silently switch to `main`, `develop`, `Local`, or another familiar branch.

## Current product summary

MIVUBI Image2Pixelart creates and edits exact Pixel Art grids from a blank Canvas or source image. Projects can retain physical Canvas dimensions for production/installation planning while exposing a simpler ordinary-user editing experience.

Current core capabilities include:

- exact physical Canvas dimensions stored in millimeters;
- exact Grid dimensions derived from width / height / cell size;
- blank or image-based work creation;
- crop/fit image placement;
- Contour / Photo reconstruction;
- project-local palettes and global Library Palet;
- drawing, fill, Pipet, Eraser, selection, Pan, zoom, Grid, shortcuts, undo/redo;
- local PDF / PNG / CSV / project-file export;
- anonymous device identity;
- cloud project persistence and revision guarding;
- single active editor authorization with realtime transport;
- private source-image storage in R2;
- soft delete and recovery window;
- dedicated Website Admin authentication and global Canvas settings for new work.

The ordinary collaboration roster/request/handoff presentation has been retired from the current Editor UI. Realtime/editor authorization infrastructure still exists as a persistence/integrity boundary.

## Current access model

The repository has three different authority concepts.

### Website Admin

```text
Website Admin
→ administrator/operator of the website
→ dedicated password authentication
→ signed server-side Admin session
→ controls active global Canvas settings for NEW work
```

Website Admin is **not**:

```text
project owner
ownerDeviceId
User-01
anonymous device identity
active editor
```

### Project owner / device identity

Project ownership remains a project-specific persistence concept. It may matter for actions such as delete/recovery, but it does not grant Website Admin access.

### Active editor

Only the currently authorized editor may persist project edits. Active-editor/revision/realtime checks are independent from Website Admin authentication.

## Canvas lifecycle

The current durable rule is:

```text
Website Admin sets width / height / cell size
→ Grid is derived
→ ordinary user creates new work
→ project snapshots that configuration
→ existing project keeps its stored Canvas structure
→ later Admin changes affect future work only
```

Ordinary users may read `Ukuran Fisik` and `Ukuran Grid`, but do not receive structural Canvas controls.

Project creation is validated against current Website settings server-side. Existing project PUT rejects structural changes to:

```text
widthMm
heightMm
cellMm
columns
rows
```

## Current ordinary UI state

### Home

Home is a direct launcher for new or saved work.

```text
Upload Gambar / Buat Baru
→ Nama Karya
→ read-only Canvas/Grid information
→ Buat Karya
→ File Tersimpan
```

New work uses Canvas settings loaded server-side from Website configuration.

### Editor

Default Editor hierarchy:

```text
Canvas dominant
left panel closed
right panel closed
Palet Cepat visible
```

Primary tools:

```text
Pencil
Eraser
Pan
```

Secondary group:

```text
Alat lainnya
→ Pipet
→ Fill
→ Select
```

Normal image flow:

```text
Gaya Pixel Art
Jumlah warna
→ Perbarui Pixel Art dari Gambar
```

Internal palette suggestion/application is automated when required. `Saran Warna` remains an advanced Library Palet capability rather than a mandatory ordinary step.

Header exposes one `Ekspor` menu. `Properti Canvas` is informational only (`Ukuran Fisik` + `Ukuran Grid`).

## Current Website Admin routes

```text
/admin/login
→ dedicated Website Admin login

/admin
→ protected Admin dashboard

/admin/settings
→ settings index

/admin/settings/canvas
→ active global Canvas configuration
```

Primary Admin owners:

```text
src/lib/server/admin-auth.ts
src/lib/server/site-settings.ts
src/lib/site-settings.ts
src/routes/admin/**
db/migrations/002_site_settings.sql
```

## Current architecture boundary

```text
Browser / SvelteKit UI
├── ordinary Home + Editor
├── Website Admin UI
├── local image conversion
├── local exports
├── IndexedDB draft/global palette support
└── SvelteKit server /api/*
    ├── Website Admin auth/session
    ├── Canvas settings service
    ├── Neon PostgreSQL
    │   ├── site_settings
    │   ├── devices
    │   ├── projects
    │   ├── participants
    │   └── project assets metadata
    ├── Cloudflare R2
    │   └── private source image objects
    └── realtime authorization/token
         └── Cloudflare Worker + Durable Object
             ├── presence/live room state
             ├── active editor epoch/state
             └── live project transport
```

The browser never owns database, R2, Website Admin signing, or realtime service credentials.

## Canonical owners

| Responsibility | Owner |
| --- | --- |
| Agent/task routing | `AGENTS.md` |
| GitHub execution discipline | `GITHUB_RULES.md` |
| Stable orientation | `CONTEXT.md` |
| Human development workflow | `CONTRIBUTING.md` |
| Security/data handling | `SECURITY.md` |
| Product/access boundaries | `docs/foundation/00-product-boundaries.md` |
| System architecture | `docs/foundation/01-system-architecture.md` |
| Image/Grid/project/export invariants | `docs/foundation/02-image-grid-contract.md` |
| Realtime/cloud project contract | `docs/foundation/03-cloud-collaboration-contract.md` |
| Deployment/operations | `docs/foundation/04-deployment-operations.md` |
| Durable UI direction | `docs/foundation/05-ui-design-system.md` |
| Detailed current handoff | `docs/knowledge/next-action.md` |
| Source ownership | `docs/knowledge/ownership.md` |
| Hot-path routing | `docs/knowledge/implementation-map.md` |
| Proof interpretation | `docs/knowledge/current-validation.md` |
| Source implementation | `src/`, `db/`, `realtime/`, configuration |

Reference images/prompts do not silently override current product/source contracts.

## Superseded architecture warning

Do not revive these older ideas from Git history:

```text
project owner = Website Admin
PlayerEditorView.svelte
AdminProjectView.svelte
AdminEditorView.svelte
ProjectEditorRoute.svelte
/admin/project/[id]
ordinary-user structural Canvas controls
mandatory visible palette-suggestion pipeline
```

Git history may contain experiments or superseded commits. Current source + Foundation + `next-action.md` are authoritative.

## Current technical contracts

- Node.js `>=22.12.0`;
- project serialization schema version 3;
- empty cells use a dedicated sentinel;
- project palette contains 0–32 colors;
- image input: PNG/JPEG/WebP, maximum 20 MB / 25 megapixels;
- image analysis uses the current OKLab-based matching and Contour/Photo behavior;
- source image upload is private/presigned;
- existing file Canvas structure is immutable through ordinary project PUT;
- Admin/realtime/server secrets remain private runtime configuration;
- cloud operations are explicit and must not be triggered as routine verification.

## Current proof status

Implemented source does not equal runtime acceptance.

Current handoff state:

```text
SOURCE/STATIC
→ current architecture/docs/source have been reviewed

LOCAL TEST/BUILD
→ still needs execution on the latest handoff HEAD

BROWSER
→ desktop/mobile interaction and visual acceptance not yet proven

ADMIN/CLOUD RUNTIME
→ Admin secrets + migration + target environment not yet proven

DEPLOYED TARGET
→ no deployment update was performed during this handoff
```

See `docs/knowledge/current-validation.md` for exact proof meanings.

## Proof commands

```text
repository contract
→ npm run verify:repository

unit behavior
→ npm test

Svelte/SvelteKit static compatibility
→ npm run check

Realtime Worker TypeScript
→ npm run check:realtime

production bundle
→ npm run build

combined deterministic application proof
→ npm run verify:application
```

These do not prove real browser UX or deployed cloud behavior.

## Operations boundary

The following are not ordinary verification:

```text
npm run db:migrate
npm run db:reassign-owner -- <project-id> <device-id>
npm run realtime:deploy
npm run r2:configure-cors
npm run smoke:cloud
```

They require an intended target environment and explicit authority.

## Working principle

```text
understand intent
→ read current handoff/owner
→ audit from a new reader's perspective
→ identify first wrong owner
→ make smallest complete change
→ run matching proof
→ clearly state what passed vs remains unproven
→ stop
```

A handoff is not ready merely because code was changed. A new developer should be able to identify current behavior, retired behavior, proof gaps, and the next action without reconstructing chat history.
