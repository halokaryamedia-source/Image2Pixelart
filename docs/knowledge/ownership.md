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
| Durable UI / familiar MIVUBI visual + Player/Admin direction | `docs/foundation/05-ui-design-system.md` |
| Active continuation | `docs/knowledge/next-action.md` |
| Code hot-path routing | `docs/knowledge/implementation-map.md` |
| Proof interpretation | `docs/knowledge/current-validation.md` |
| Frontend reference classification | `docs/knowledge/frontend-reference-inventory.md` |
| Current UI audit | `docs/knowledge/ui-audit.md` |
| Current UI implementation sequence | `docs/knowledge/ui-implementation-plan.md` |
| Player Home / project launcher | `src/routes/+page.svelte` + `src/lib/components/ProjectHomeView.svelte` |
| Admin project creation surface | `src/routes/admin/+page.svelte` + `src/lib/components/AdminProjectView.svelte` |
| Admin project editor | `src/routes/project/[id]/+page.svelte` + `src/lib/components/EditorView.svelte` |
| Player project start/editor shell | `src/routes/project/[id]/+page.svelte` + `src/lib/components/PlayerEditorView.svelte` |
| Project Admin structural authorization | `src/routes/api/projects/[id]/+server.ts` (`owner_device_id`) |
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
| Raw reference/design artifacts | `docs/MIVUBI-UI-UX-Redesign/`, `docs/building/` |

## Rule

When a claim has an owner above, update that owner rather than introducing a competing source of truth.

Project `owner` is the current **Admin authority for that project**. `editor/viewer` remain collaboration roles, not Admin roles. Admin project creation is a separate authoring surface and must not be mixed into ordinary Player Home.
