# MIVUBI Image2Pixelart

MIVUBI Image2Pixelart adalah editor Pixel Art berbasis Svelte 5 / SvelteKit / TypeScript. Aplikasi dapat membuat Pixel Art dari Canvas kosong atau gambar sumber, mempertahankan ukuran fisik/Grid yang presisi, mengelola palet, mengedit sel, dan mengekspor hasil ke beberapa format.

UI menggunakan identitas visual MIVUBI yang sudah ada. Penyederhanaan yang sedang aktif adalah penyederhanaan hierarchy, wording, dan akses — **bukan visual rebrand**.

## Status handoff saat ini

Developer baru harus membedakan hal yang **sudah diimplementasikan** dari hal yang **belum dibuktikan di runtime**.

| Area | Status |
| --- | --- |
| Website Admin architecture | **Implemented at source/static level** |
| Global Canvas settings for new work | **Implemented at source/static level** |
| Ordinary-user Canvas resize removal | **Implemented at source/static level** |
| Canvas-first Editor simplification | **Implemented at source/static level** |
| Image → Pixel Art one-action flow | **Implemented at source/static level** |
| Header / Export / tool / palette hierarchy | **Implemented at source/static level** |
| Repository handoff documentation | **Implemented** |
| `npm run verify:repository` on latest handoff HEAD | **Still needs local execution** |
| `npm run check` / tests / build on latest handoff HEAD | **Still needs local execution** |
| Desktop/mobile browser acceptance | **Not yet browser-verified** |
| Admin password/session in configured environment | **Not yet runtime-verified** |
| `002_site_settings.sql` applied to a target database | **Not proven/applied from the handoff session** |
| Deployment update | **Not performed** |

The canonical continuation is [`docs/knowledge/next-action.md`](docs/knowledge/next-action.md). Do not infer completion from this README alone.

## Product access model

There are three separate authority concepts. Do not merge them.

```text
Website Admin
→ website-level configuration authority
→ dedicated password + server-side Admin session
→ controls active global Canvas configuration for NEW work

Project owner / anonymous device identity
→ project-specific ownership/persistence concept
→ may matter for delete/recovery/project membership
→ does NOT grant Website Admin access

Active editor
→ current project editing authorization
→ enforced by active-editor + revision/realtime guards
→ does NOT grant Website Admin access
```

The Canvas lifecycle is:

```text
Website Admin sets active Canvas width / height / cell size
→ ordinary user creates a new work
→ new work snapshots that configuration
→ existing file keeps its original Canvas structure
→ later Admin changes affect future work only
```

Ordinary users may see `Ukuran Fisik` and `Ukuran Grid`, but do not receive structural Canvas controls.

## Current ordinary-user flow

```text
Home
→ Upload Gambar or Buat Baru
→ new work uses active Website Admin Canvas settings
→ server validates the same Canvas contract
→ Editor
→ edit Pixel Art
→ Ekspor
```

Current Editor direction:

```text
Canvas dominant
left panel closed by default
right panel closed by default
Palet Cepat visible

Primary tools:
Pencil / Eraser / Pan

Alat lainnya:
Pipet / Fill / Select

Image flow:
Gaya Pixel Art
Jumlah warna
→ Perbarui Pixel Art dari Gambar
```

`Saran Warna` still exists as an advanced Library Palet capability; it is no longer a mandatory normal conversion step.

## Website Admin routes

```text
/admin/login
→ dedicated Website Admin login

/admin
→ Admin dashboard

/admin/settings
→ Website settings index

/admin/settings/canvas
→ global Canvas configuration for new work
```

Website Admin configuration is protected server-side. It is not implemented as a hidden URL, `localStorage` flag, or project-owner check.

## Start here as the next developer

Read in this order before changing the current UI/Admin work:

1. [`AGENTS.md`](AGENTS.md) — task routing and proof boundary;
2. [`GITHUB_RULES.md`](GITHUB_RULES.md) — exact branch/write/commit discipline;
3. [`CONTEXT.md`](CONTEXT.md) — current stable product/architecture orientation;
4. [`docs/foundation/00-product-boundaries.md`](docs/foundation/00-product-boundaries.md) — access/product contract;
5. [`docs/foundation/05-ui-design-system.md`](docs/foundation/05-ui-design-system.md) — durable UI direction;
6. [`docs/knowledge/editor-ui-decisions.md`](docs/knowledge/editor-ui-decisions.md) — approved ordinary UI decisions;
7. [`docs/knowledge/implementation-map.md`](docs/knowledge/implementation-map.md) — current code hot paths;
8. [`docs/knowledge/next-action.md`](docs/knowledge/next-action.md) — detailed handoff, superseded paths, proof status, and next step;
9. [`docs/knowledge/current-validation.md`](docs/knowledge/current-validation.md) — what each verification level can actually prove.

Reference/mockup folders such as `docs/MIVUBI-UI-UX-Redesign/` and `docs/building/` are **reference only**. They do not override current source/Foundation decisions.

## Important retired concepts

Do not revive these older/superseded architecture ideas merely because they appear in Git history:

```text
project owner → Website Admin
PlayerEditorView.svelte
AdminProjectView.svelte
AdminEditorView.svelte
ProjectEditorRoute.svelte
/admin/project/[id]
ordinary-user Canvas resize controls
mandatory visible Saran Warna pipeline
permanently visible export-format selector
```

Git history owns retired versions. Current source + Foundation + handoff docs own current behavior.

## Repository verification

Node.js requirement:

```text
>= 22.12.0
```

Install dependencies:

```sh
npm install
```

Cheapest current handoff verification:

```sh
npm run verify:repository
npm run check
```

Additional deterministic proof when materially required:

```sh
npm test
npm run check:realtime
npm run build
npm run verify:application
```

`npm run verify:application` runs tests, Svelte check, realtime TypeScript check, and production build. None of these substitute for real browser validation of layout, pointer/crop interaction, focus, menus, downloads, or responsive behavior.

Automatic GitHub Actions verification is intentionally deferred during active development; do not re-enable CI merely as ceremony.

## Local runtime setup

Do **not** treat database migration as a default first command just to inspect or validate source.

For repository/static work, start with:

```sh
npm install
npm run verify:repository
npm run check
```

If the task actually requires a configured browser/cloud runtime:

```sh
cp .env.example .env.local
```

Then configure only the services needed by that task using an intentionally selected development environment.

If a fresh dedicated development database must be initialized, migration is an explicit operation:

```sh
npm run db:migrate
```

Run it only after confirming the `DATABASE_URL` points to the intended development database. Do not run migration against a shared/production database as routine setup.

Realtime development, when the task requires it:

```sh
npm run realtime:dev
npm run dev
```

Run Worker and SvelteKit in separate terminals.

## Cloud architecture summary

```text
Browser / SvelteKit UI
├── ordinary Home + Editor
├── Website Admin UI
├── local image conversion
├── local exports
├── IndexedDB draft/global palette support
└── /api/*
    ├── Website Admin auth/session boundary
    ├── Neon PostgreSQL
    │   ├── site_settings
    │   ├── devices
    │   ├── projects
    │   ├── participants
    │   └── project asset metadata
    ├── Cloudflare R2 — private source image
    └── Realtime authorization/token
         └── Cloudflare Worker + Durable Object
```

The collaboration/realtime backend still protects single-active-editor persistence and live transport. The retired roster/request/handoff presentation is not part of the current ordinary Editor UI.

## Operations boundary

These commands may mutate external state and are **not** ordinary completion checks:

```sh
npm run db:migrate
npm run db:reassign-owner -- <project-id> <device-id-baru>
npm run realtime:deploy
npm run r2:configure-cors
npm run smoke:cloud
```

Use them only for an explicitly intended environment and with appropriate authorization.

## Security

Committed templates contain placeholders only:

```text
.env.example
realtime/.dev.vars.example
```

Never commit real database URLs, R2 credentials, Cloudflare/Vercel tokens, realtime secrets, Admin secrets, session cookies, device secrets, private source images, or production data.

Website Admin uses runtime configuration including:

```text
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
```

Treat both as private runtime configuration. See [`SECURITY.md`](SECURITY.md).

## Current technical limits

- maximum project Grid: 250,000 cells;
- maximum 2,000 cells on either side;
- project palette: 0–32 colors;
- source image: PNG/JPEG/WebP;
- source image: maximum 20 MB / 25 megapixels;
- project schema: version 3;
- PDF output is a blueprint/install guide, not a 1:1 physical print sheet.

Durable technical invariants are owned by [`docs/foundation/`](docs/foundation/), not by examples in this README.
