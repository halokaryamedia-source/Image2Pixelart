# Ownership

Status: current canonical responsibility map

| Responsibility | Canonical owner |
| --- | --- |
| Task/agent routing | `AGENTS.md` |
| GitHub writes/history/retries/STOP | `GITHUB_RULES.md` |
| Stable project orientation | `CONTEXT.md` |
| Human development workflow | `CONTRIBUTING.md` |
| Security/data handling | `SECURITY.md` |
| Product boundaries | `docs/foundation/00-product-boundaries.md` |
| Service/data architecture | `docs/foundation/01-system-architecture.md` |
| Image/grid/project/export invariants | `docs/foundation/02-image-grid-contract.md` |
| Collaboration/realtime/cloud contract | `docs/foundation/03-cloud-collaboration-contract.md` |
| Deployment/operations | `docs/foundation/04-deployment-operations.md` |
| Active continuation | `docs/knowledge/next-action.md` |
| Code hot-path routing | `docs/knowledge/implementation-map.md` |
| Proof interpretation | `docs/knowledge/current-validation.md` |
| Material decisions | `docs/knowledge/decisions/` |
| Home/dashboard orchestration | `src/routes/+page.svelte` + `src/lib/components/HomeView.svelte` |
| Project editor orchestration | `src/routes/project/[id]/+page.svelte` + `src/lib/components/EditorView.svelte` |
| Canvas rendering/input | `src/lib/components/MosaicCanvas.svelte` |
| Crop UI | `src/lib/components/VisualCropper.svelte` |
| Project model/serialization | `src/lib/project.ts`, `src/lib/types.ts` |
| Image conversion/analysis | `src/lib/image-converter.ts`, `src/lib/image-analysis.ts`, worker |
| Grid/color/palette/RLE utilities | `src/lib/utils/` |
| Undo/redo | `src/lib/history.ts` |
| Browser/local storage | `src/lib/storage.ts`, cloud device/draft helpers |
| Exports | `src/lib/export/`, CSV/download utilities |
| Browser cloud API/realtime client | `src/lib/cloud/` |
| Server trust/persistence helpers | `src/lib/server/` |
| HTTP API | `src/routes/api/` |
| Database schema | `db/migrations/` |
| Realtime Worker | `realtime/src/index.ts` + `realtime/wrangler.jsonc` |
| Static repository contract | `scripts/verify-repository.mjs` |
| Reference/design artifacts | existing `docs/MIVUBI-UI-UX-Redesign/`, `docs/building/` |

## Rule

When a claim has an owner above, update that owner instead of introducing a second current source of truth.

Tests prove implementation contracts; they do not become product policy when they conflict with an explicitly changed requirement.
