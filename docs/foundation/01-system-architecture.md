# System Architecture

Status: current durable architecture boundary

## Reader summary

The current architecture has **two user-facing access surfaces** and **separate project-persistence authorization**:

```text
Akses Umum
→ Home + Editor
→ creates/edits Pixel Art
→ reads Canvas/Grid information
→ cannot configure website Canvas structure

Website Admin
→ dedicated Admin login/session
→ configures global Canvas settings for NEW work

Project owner / active editor
→ project persistence/authorization concepts
→ independent from Website Admin
```

Do not treat `ownerDeviceId` or active-editor state as Website Admin authentication.

## Runtime topology

```text
Browser
│
├── Svelte 5 / SvelteKit UI
│   ├── ordinary Home
│   ├── ordinary Editor / Canvas
│   ├── Website Admin pages
│   ├── local image analysis/conversion
│   ├── IndexedDB draft/global palettes
│   └── local exports
│
└── SvelteKit server /api/* + server loads/actions
    │
    ├── Website Admin auth/session
    │   ├── ADMIN_PASSWORD_HASH
    │   ├── ADMIN_SESSION_SECRET
    │   └── signed HttpOnly Admin cookie
    │
    ├── Website Canvas settings service
    │   └── site_settings / `canvas`
    │
    ├── Neon PostgreSQL
    │   ├── site_settings
    │   ├── devices
    │   ├── projects
    │   ├── participants
    │   ├── project assets metadata
    │   └── rate-limit buckets
    │
    ├── Cloudflare R2
    │   └── private active source image objects
    │
    └── Realtime authorization/token
         │
         └── Cloudflare Worker + Durable Object
             ├── presence/live room state
             ├── active editor epoch/state
             └── live project snapshot/patch transport
```

## Responsibility boundaries

### Ordinary browser UI

Owns:

- Home/project launcher UX;
- project editing UX;
- local image reconstruction;
- Canvas tools/history;
- local export generation;
- anonymous device identity storage;
- IndexedDB draft/global palette support;
- realtime client connection.

Ordinary UI does **not** own structural Website Canvas configuration.

The ordinary Home receives the active Canvas setting from server load and uses it when creating new work. The ordinary Editor treats each project's stored structural Canvas values as fixed information.

### Website Admin browser UI

Owns the user interaction for website-level settings only.

Current route surface:

```text
/admin/login
/admin
/admin/settings
/admin/settings/canvas
```

The browser form is not the security boundary. Server-side Admin session validation is authoritative.

### Website Admin server boundary

Primary owner:

```text
src/lib/server/admin-auth.ts
```

Owns:

- Admin password-hash verification;
- Admin session signing/verification;
- Admin cookie creation/removal;
- route protection through `requireAdminSession()`.

Website Admin authentication is separate from anonymous device/project authentication.

### Website Canvas settings service

Primary owners:

```text
src/lib/site-settings.ts
src/lib/server/site-settings.ts
db/migrations/002_site_settings.sql
```

Owns:

- current global Canvas width;
- current global Canvas height;
- current cell size;
- derived Grid columns/rows/total;
- persistent `site_settings` value for key `canvas`.

Current default source value is 2400 × 1200 mm with 50 mm cells, but runtime authority comes from persisted configured settings once the migration/environment is active.

### Project creation API

Primary owner:

```text
src/routes/api/projects/+server.ts
```

The POST path:

```text
authenticate ordinary device
→ validate project payload
→ load current Website Canvas settings
→ require widthMm / heightMm / cellMm / columns / rows to match
→ create project
```

This prevents an ordinary browser from bypassing Website settings with a manually crafted request.

### Existing project save API

Primary owner:

```text
src/routes/api/projects/[id]/+server.ts
```

Before durable save, the PUT path compares incoming structural values to the stored project:

```text
widthMm
heightMm
cellMm
columns
rows
```

Any structural difference is rejected.

Normal persistence authorization then remains:

```text
active editor device
→ realtime editor authorization
→ revision guard
→ durable save
```

Project ownership does not override Canvas immutability and does not grant Website Admin authority.

### Neon

Owns durable structured cloud state.

Current relevant schema groups include:

```text
site_settings
→ website-level persistent configuration

devices / projects / project_participants
→ anonymous project identity/access state

project assets metadata
→ source-image metadata/reference
```

Database schema changes are migration work. Do not treat migration as routine source verification.

### R2

Owns private source-image objects.

Project cells and ordinary export output remain in their existing owners; do not move them into R2 for implementation convenience.

### Realtime Worker

Owns ephemeral/live room transport and active-editor coordination.

It does not replace Neon as durable project authority and does not grant Website Admin access.

The current ordinary Editor does not show the retired collaboration roster/request/handoff UI, but the underlying realtime/editor authorization infrastructure remains a project integrity boundary.

## Data authority flows

### Website Canvas configuration

```text
Website Admin authenticated session
→ /admin/settings/canvas
→ server validation
→ site_settings.canvas
```

### New work

```text
ordinary Home server load
→ read current site_settings.canvas
→ ordinary user creates work
→ client project uses those values
→ POST /api/projects validates same values again
→ project stores Canvas snapshot
```

### Existing work

```text
stored project Canvas snapshot
→ Editor reads width / height / cell / Grid
→ user edits image/palette/cells
→ PUT /api/projects/[id]
→ structural values must equal stored snapshot
→ active-editor + revision/realtime guards
→ Neon durable state
```

### Live peer update

```text
current editor local project state
→ realtime transport
→ other client's local projection
```

Realtime transport must not become an unguarded durable write path.

### Source image

```text
authorized project device
→ presign request
→ browser PUT to private R2
→ finalize metadata
→ Neon asset metadata/reference
```

## Configuration authority

Private runtime configuration includes, among others:

```text
DATABASE_URL
DEVICE_TOKEN_PEPPER
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
R2 credentials
REALTIME_TOKEN_SECRET
REALTIME_INTERNAL_SECRET
CRON_SECRET
```

Do not expose these to public browser bundles or logs.

## Current proof boundary

Source architecture currently documents the Website Admin/Canvas model, but this does not prove:

- that `002_site_settings.sql` has been applied to a target database;
- that real Admin secrets are configured;
- that Admin login/session works in a browser;
- that Home/Editor render correctly at desktop/mobile sizes;
- that current Svelte source passes `npm run check` on the latest handoff HEAD;
- that any deployed target contains the current branch state.

Those require the proof level described in `docs/knowledge/current-validation.md`.

## Deployment boundary

Vercel application, Neon database, R2, and Cloudflare Worker are distinct operational surfaces.

A successful application build does not prove database migration, Worker deployment, R2 configuration, or Website Admin runtime configuration.

See `04-deployment-operations.md`.
