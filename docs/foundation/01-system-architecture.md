# System Architecture

Status: current durable architecture boundary

## Runtime topology

```text
Browser
│
├── Svelte 5 / SvelteKit UI
│   ├── Home/dashboard
│   ├── Editor/canvas
│   ├── local image analysis
│   ├── local project draft/global palettes
│   └── local exports
│
└── SvelteKit /api/*
    │
    ├── Neon PostgreSQL
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
             ├── presence
             ├── edit requests
             ├── active editor epoch/state
             └── live project snapshot/patch transport
```

## Responsibility boundaries

### Browser

Owns:

- project editing UX;
- local image reconstruction;
- canvas tools/history;
- local export generation;
- anonymous device identity storage;
- IndexedDB draft/global palette support;
- realtime client connection.

The browser must not own server/cloud credentials.

### SvelteKit server/API

Owns:

- device authentication;
- project/participant authorization;
- revision guards;
- database persistence;
- source-upload presign/finalize flow;
- realtime token creation and internal authorization;
- maintenance purge endpoint.

### Neon

Owns durable structured cloud state.

Database schema changes are migration work. Do not treat an existing shared migration as an ordinary editable source file after it has been applied to shared environments.

### R2

Owns private source-image objects. Project cell/export data remains in its explicit current owners; do not move data between Neon/R2 merely for implementation convenience.

### Realtime Worker

Owns ephemeral/live room state and WebSocket transport. It does not replace Neon as durable project authority.

## Data authority

```text
current editor change
→ local project state
→ revision-guarded cloud save
→ Neon durable state

live peer update
→ realtime transport
→ viewer/editor local projection

source image
→ presigned browser upload
→ R2 object
→ Neon asset metadata/reference
```

Realtime project transport must not become an unguarded durable write path.

## Deployment boundary

Vercel application and Cloudflare Worker are separate deployment surfaces. A successful application build does not prove Worker deployment, and a Worker deploy does not prove Vercel/Neon/R2 correctness.

See `04-deployment-operations.md`.
