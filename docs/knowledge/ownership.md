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
| Approved ordinary Editor decisions | `docs/knowledge/editor-ui-decisions.md` |
| Active continuation / handoff | `docs/knowledge/next-action.md` |
| Code hot-path routing | `docs/knowledge/implementation-map.md` |
| Proof interpretation | `docs/knowledge/current-validation.md` |
| Frontend reference classification | `docs/knowledge/frontend-reference-inventory.md` |
| Original upstream UI baseline + stable UI IDs | `docs/knowledge/original-ui-baseline.md` |
| Original visual preservation contract for UI planning/regeneration | `docs/knowledge/ui-preservation-contract.md` |
| UI language and terminology contract | `docs/knowledge/ui-language-contract.md` |
| Current source/static UI audit | `docs/knowledge/ui-audit.md` |
| Implemented UI slice / remaining proof | `docs/knowledge/ui-implementation-plan.md` |
| Ordinary Home orchestration | `src/routes/+page.server.ts` + `src/routes/+page.svelte` |
| Ordinary Home UI | `src/lib/components/HomeView.svelte` |
| Current project editor orchestration | `src/routes/project/[id]/+page.svelte` |
| Current project editor surface | `src/lib/components/EditorView.svelte` |
| Canvas rendering/input | `src/lib/components/MosaicCanvas.svelte` |
| Crop UI | `src/lib/components/VisualCropper.svelte` |
| Panel default visibility | `src/lib/panel-preferences.ts` |
| Editor shortcut mapping | `src/lib/editor-shortcuts.ts` |
| Website Admin authentication | `src/lib/server/admin-auth.ts` + `src/routes/admin/login/` |
| Website Admin dashboard/settings UI | `src/routes/admin/` + `src/routes/admin/settings/` |
| Global Canvas settings model/persistence | `src/lib/site-settings.ts` + `src/lib/server/site-settings.ts` + `db/migrations/002_site_settings.sql` |
| New-project Canvas authority | `src/routes/api/projects/+server.ts` |
| Existing-file Canvas immutability + active-editor save guard | `src/routes/api/projects/[id]/+server.ts` |
| Project model/serialization | `src/lib/project.ts`, `src/lib/types.ts` |
| Image conversion application | `src/lib/image-project.ts` |
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

## Important separation

Website Admin is **not** project ownership, Device ID, `User-01`, active-editor state, or realtime authority.

Project ownership still matters for project-specific operations such as delete/recovery, while active-editor/revision/realtime guards still control who may persist project edits. Those concepts must not be reused to grant Website Admin access.

`src/lib/components/CollaborationBar.svelte` remains in the repository but is not the authority for the current ordinary Editor surface. Do not reintroduce collaboration roster/request/handoff presentation into ordinary UI without a new explicit requirement.

## Retired architecture

The current source does not use the earlier split concepts/files such as `PlayerEditorView.svelte`, `AdminProjectView.svelte`, `AdminEditorView.svelte`, `ProjectEditorRoute.svelte`, or `/admin/project/[id]` as active architecture. Older commits containing those ideas are historical only.

## Rule

When a claim has an owner above, update that owner rather than introducing a competing source of truth.

`docs/knowledge/original-ui-baseline.md` is intentionally a historical factual baseline for the upstream interface at commit `7904ba38d9ea38eec308c04805041ccd75bd6914`; it does not claim to describe the current fork implementation.

`docs/knowledge/ui-preservation-contract.md` governs visual preservation during future UI planning and regeneration. Unless explicitly approved, existing icon/glyph/SVG/asset identity, logo, fonts, colors, component treatment, interaction states, spacing character, and accessibility behavior must remain unchanged from the original source.

`docs/knowledge/ui-language-contract.md` governs language and terminology cleanup. Use Indonesian where it is natural; retain familiar English software/creative terms when translation would feel forced. Existing visual identity and icons are not affected by terminology changes.
