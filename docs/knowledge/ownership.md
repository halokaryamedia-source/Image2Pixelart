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
| Durable UI direction | `docs/foundation/05-ui-design-system.md` |
| Active continuation | `docs/knowledge/next-action.md` |
| Code hot-path routing | `docs/knowledge/implementation-map.md` |
| Proof interpretation | `docs/knowledge/current-validation.md` |
| Frontend reference classification | `docs/knowledge/frontend-reference-inventory.md` |
| Original upstream UI baseline + stable UI IDs | `docs/knowledge/original-ui-baseline.md` |
| Original visual preservation contract for UI planning/regeneration | `docs/knowledge/ui-preservation-contract.md` |
| Current UI audit | `docs/knowledge/ui-audit.md` |
| Current UI implementation sequence | `docs/knowledge/ui-implementation-plan.md` |
| Current Home / project dashboard | `src/routes/+page.svelte` + `src/lib/components/HomeView.svelte` |
| Current project editor surface | `src/routes/project/[id]/+page.svelte` + `src/lib/components/EditorView.svelte` |
| Collaboration UI | `src/lib/components/CollaborationBar.svelte` |
| Cloud project thumbnail | `src/lib/components/CloudProjectThumbnail.svelte` |
| Canvas rendering/input | `src/lib/components/MosaicCanvas.svelte` |
| Crop UI | `src/lib/components/VisualCropper.svelte` |
| Panel default visibility | `src/lib/panel-preferences.ts` |
| Editor shortcut mapping | `src/lib/editor-shortcuts.ts` |
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

`docs/knowledge/original-ui-baseline.md` is intentionally a historical factual baseline for the upstream interface at commit `7904ba38d9ea38eec308c04805041ccd75bd6914`; it does not claim to describe the current fork implementation.

`docs/knowledge/ui-preservation-contract.md` governs visual preservation during future UI planning and regeneration. Unless explicitly approved, existing icon/glyph/SVG/asset identity, logo, fonts, colors, component treatment, interaction states, spacing character, and accessibility behavior must remain unchanged from the original source.

Future Player/Admin separation or UI simplification decisions must be recorded as proposals/decisions separately. They are not current source ownership until implemented and verified.
