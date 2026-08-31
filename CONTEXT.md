# MIVUBI Mosaic Plan — Repository Context

Status: active application  
Product: physical pixel-mosaic planning and collaborative editing  
Primary stack: Svelte 5 / SvelteKit / TypeScript / Vite  
Cloud stack: Vercel + Neon PostgreSQL + Cloudflare R2 + Cloudflare Worker/Durable Objects

## Branch policy

Branch lifecycle, promotion topology, protected branches, merge policy, version tags, and GitHub rulesets are intentionally **external/deferred** in this portable repository package.

Every session must use the exact branch/ref selected by the user or destination repository policy. Do not import another repository's `develop`, `Local`, or `main` assumptions.

## Product summary

MIVUBI Mosaic Plan converts physical dimensions and source images into an exact tile grid for real-world mosaic assembly.

Core product capabilities:

- exact physical canvas/tile sizing stored in millimeters;
- blank or image-based project creation;
- crop/fit image placement;
- contour/photo reconstruction;
- project-local palettes and global palette library;
- editable canvas with drawing, fill, picker, eraser, selection, pan, zoom, grid, shortcuts, undo/redo;
- local exports for project, PNG, grid PNG, PDF blueprint, material CSV, and matrix CSV;
- anonymous device identity;
- cloud project persistence and revision guarding;
- one active editor with viewers, edit requests, handoff, and realtime presence/project updates;
- private source-image storage in R2;
- soft delete and recovery window.

Detailed durable invariants live in `docs/foundation/`.

## Architecture boundary

```text
Browser / SvelteKit UI
├── local image conversion + exports
├── IndexedDB draft/global palette support
└── /api/*
    ├── Neon PostgreSQL — project/document/revision/participants
    ├── R2 — private source image object
    └── Realtime authorization/token
         └── Cloudflare Worker + Durable Object — presence/live project transport
```

The browser does not receive database or R2 credentials.

The public project UUID is a discoverability boundary, not a secret credential. Device secrets and server/cloud credentials remain private.

## Canonical owners

| Responsibility | Owner |
| --- | --- |
| Agent/task routing | `AGENTS.md` |
| GitHub execution discipline | `GITHUB_RULES.md` |
| Stable orientation | `CONTEXT.md` |
| Human developer workflow | `CONTRIBUTING.md` |
| Security/data handling | `SECURITY.md` |
| Durable product/architecture contracts | `docs/foundation/` |
| Active continuation | `docs/knowledge/next-action.md` |
| Source ownership map | `docs/knowledge/ownership.md` |
| Hot-path implementation map | `docs/knowledge/implementation-map.md` |
| Durable proof boundaries | `docs/knowledge/current-validation.md` |
| Source implementation | `src/`, `db/`, `realtime/`, configuration |
| Repository static verifier | `scripts/verify-repository.mjs` |
| Unit/regression contracts | `*.test.ts` |
| UI redesign/building references | existing `docs/MIVUBI-UI-UX-Redesign/` and `docs/building/` |

Reference images/prompts do not silently override current product/source contracts.

## Current technical contracts

- Node.js `>=22.12.0`.
- Project serialization schema is version 3; earlier supported schemas migrate to the current model.
- Empty cells use a dedicated sentinel rather than a palette color.
- Project palette contains at most 32 colors.
- Image input is PNG/JPEG/WebP with current source limits of 20 MB and 25 megapixels.
- Browser image analysis uses OKLab-based color matching and current contour/photo behavior.
- Source image upload is private and presigned.
- Realtime token/internal secrets are private server/Worker configuration.
- Cloud operations are explicit; ordinary code verification must not mutate production state.

See `docs/foundation/02-image-grid-contract.md` and `docs/foundation/03-cloud-collaboration-contract.md`.

## Proof model

```text
repository contract
→ npm run verify:repository

unit behavior
→ npm test

Svelte/SvelteKit static compatibility
→ npm run check

Realtime Worker static compatibility
→ npm run check:realtime

production bundle
→ npm run build

deterministic application gate
→ npm run verify:application
```

These do not prove real browser UX or deployed cloud behavior.

Browser interaction/visual/network claims require `LIVE_BROWSER`. Neon/R2/Durable Object/deployment claims require an authorized `CLOUD_RUNTIME`.

## Operations boundary

The following are not ordinary verification:

```text
npm run db:migrate
npm run db:reassign-owner -- <project-id> <device-id>
npm run realtime:deploy
npm run r2:configure-cors
npm run smoke:cloud
```

They require explicit intent and correctly scoped credentials/environment.

## Working principle

```text
identify intent
→ identify proof context
→ find first wrong owner
→ make smallest complete change
→ run matching proof
→ stop
```

Do not create branch/ruleset architecture from this package unless explicitly requested for the destination repository.
