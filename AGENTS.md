# Workspace Agent Routing

This repository is the development memory and source authority for MIVUBI Mosaic Plan / Image2Pixelart. Current user instruction owns task intent; current source plus matching proof owns implemented behavior.

## Branch policy boundary

This portable governance package intentionally does **not** define a repository-wide branch lifecycle, promotion topology, release branch, or GitHub ruleset.

- Work only on the exact branch/ref explicitly selected by the user or repository host.
- Never silently fall back to the default branch.
- Do not invent `develop → Local → main` or another topology from conventions used in other repositories.
- Branch promotion, protected-branch policy, merge method, tags, and server-side rulesets remain external/deferred until explicitly defined for the destination repository.

Material GitHub work follows `GITHUB_RULES.md`.

## Smallest sufficient boot

Choose the smallest boot that can materially change the decision.

### Observe / recover context

For `amati`, inspect, understand, audit, study, or context recovery:

```text
AGENTS.md
→ GITHUB_RULES.md Core Rules when GitHub work is material
→ CONTEXT.md
→ docs/knowledge/next-action.md only when continuation matters
→ smallest current owner needed
→ report understanding
→ STOP
```

Observe mode is read-only. Do not edit source, advance continuation, run cloud mutations, start a recorded next step, create GitHub objects, or "helpfully" fix adjacent issues unless the user also requests a change.

### Bounded Maintenance

A concrete defect with a clear owner may start from the exact failing owner.

```text
actual behavior
→ expected behavior
→ first wrong owner
→ smallest complete correction
→ cheapest matching proof
→ STOP
```

Do not turn Maintenance into redesign or repository-wide cleanup.

### Non-trivial Development

Before a feature, cross-owner change, architecture change, substantial UI work, or behavior whose acceptance is not obvious:

```text
AGENTS.md
→ GITHUB_RULES.md Core Rules
→ CONTEXT.md
→ docs/knowledge/next-action.md when material
→ .agents/skills/development-brief/SKILL.md
→ smallest affected owner/source
→ only useful support skills
```

Do not ask the user to repeat information recoverable from current repository owners.

## Execution context

Classify by actual capability before making proof claims.

```text
REMOTE_GITHUB
→ repository source, GitHub metadata, and CI evidence only

LOCAL_CODE
→ local checkout + Node/npm + tests/check/build + filesystem

LIVE_BROWSER
→ LOCAL_CODE + running application + real browser interaction/render/network evidence

CLOUD_RUNTIME
→ authorized environment with the relevant Vercel/Neon/R2/Cloudflare services
```

A context label does not create capability.

Proof ceilings:

- `REMOTE_GITHUB` can prove repository/static/CI contracts only.
- `LOCAL_CODE` can additionally prove local test/type/build behavior.
- `LIVE_BROWSER` is required for rendered layout, interaction, focus, drag/crop/canvas behavior, download UX, console, and browser network claims.
- `CLOUD_RUNTIME` is required for real database, R2, deployed API, Durable Object, production/staging WebSocket, migration, CORS, cron, and other external-service claims.
- CI is not a substitute for a live browser or cloud runtime unless that CI actually executes the relevant runtime contract.

When requested acceptance exceeds the current proof ceiling, deliver only what is complete in the current context and label remaining proof accurately.

## Work modes

| Intent | Mode | Primary route |
| --- | --- | --- |
| Understand / recover / decide before editing | Plan | inspect evidence; no write |
| Clear bug / stale test / bounded correction | Maintenance | first wrong owner |
| Feature / behavior / multi-file implementation | Development | `development-brief` |
| Architecture / schema / cross-service redesign | Complex Development | `development-brief` + matching specialist(s) |
| DB migration / deploy / CORS / owner reassignment / production mutation | Operations | explicit authorization + operation owner |

Operations are never implied by Development completion.

## Authority

Use the nearest owner for the claim:

```text
current explicit user instruction
→ durable product/architecture contract in docs/foundation/
→ current source + tests
→ current environment/runtime proof
→ docs/knowledge current routing/evidence
→ reference/design artifacts
→ Git history/chat as supporting evidence only
```

Important boundaries:

- `docs/foundation/` owns durable product and architecture meaning.
- `src/`, `db/`, `realtime/`, and configuration own implementation.
- `docs/knowledge/next-action.md` owns active continuation only.
- `docs/knowledge/current-validation.md` owns durable proof boundaries, not run-by-run logs.
- `docs/MIVUBI-UI-UX-Redesign/` and `docs/building/` are reference/design material unless explicitly promoted into a Foundation decision.
- Generated/exported output is not source of truth.

When continuity prose disagrees with current implementation, inspect the current owner and reconcile the stale owner rather than blindly continuing.

## First wrong owner

Diagnose before writing:

```text
product meaning / invariant wrong
→ docs/foundation owner

image/grid/color behavior wrong
→ image/project/grid/color implementation owner

editor interaction wrong
→ component/editor owner

persistence/API/auth wrong
→ cloud/server/API owner

realtime presence/editor handoff wrong
→ realtime owners on both app and Worker sides

DB shape wrong
→ migration + data contract owner

test stale while implementation is correct
→ test

CI routing or repository contract wrong
→ workflow / verifier / repository policy

derived artifact wrong
→ canonical upstream source
```

`No change required` is valid.

## Domain routing

Use `docs/knowledge/ownership.md` and `docs/knowledge/implementation-map.md` for detailed paths.

Default proof routing:

| Change | Minimum relevant proof |
| --- | --- |
| Pure utility / project model | targeted Vitest |
| Image analysis / palette / grid / crop | targeted Vitest; browser only for visual interaction |
| `.svelte` / SvelteKit source | Svelte validation + `npm run check`; build when public/runtime surface can be affected |
| Visual/interactive editor behavior | Svelte validation + browser proof; accessibility when semantics/keyboard/focus are affected |
| API/server code | tests where available + `npm run check` + build |
| Realtime Worker | `npm run check:realtime`; cloud/live proof for WebSocket/Durable Object claims |
| Export logic | deterministic export/unit proof; browser proof for download UX |
| DB/R2/realtime integration | local static proof first; `npm run smoke:cloud` only in an explicitly authorized configured environment |
| Deployment/config mutation | source proof + explicit Operations execution; never infer deployment success |

## Skill routing

Canonical repository skills:

```text
development-brief
svelte-development-validation
web-ui-design-development
web-accessibility-validation
browser-runtime-validation
cloud-development-validation
```

Rules:

- Non-trivial Development uses `development-brief`.
- Use `svelte-development-validation` when Svelte/SvelteKit source materially changes.
- Use `web-ui-design-development` only when visual hierarchy/composition/craft is material.
- Use `web-accessibility-validation` when semantics, keyboard, focus, forms, status, reflow, or media alternatives are materially affected.
- Use `browser-runtime-validation` only when browser/runtime evidence is needed.
- Use `cloud-development-validation` for database, R2, API trust boundaries, realtime, cloud smoke, or deployment-sensitive work.
- Do not invoke every skill by habit.
- Support skills return evidence to the active development owner; they do not autonomously broaden scope.

## Persistent-owner gate

Before adding a persistent file/module/layer/skill, ask:

```text
what distinct current responsibility needs an owner?
why can the existing owner not represent it cleanly?
who consumes it now?
what realistic recurring ambiguity/error does it prevent?
```

If the responsibility is not earned, do not create it.

Git history owns ordinary history. Do not create `_old`, `_new`, `legacy`, `backup`, `copy`, or `v2` current files without an external contract that genuinely requires parallel versions.

## Operations boundary

These existing commands are externally mutating or environment-dependent:

```text
npm run db:migrate
npm run db:reassign-owner -- ...
npm run realtime:deploy
npm run r2:configure-cors
npm run smoke:cloud
```

- Do not execute them merely because source changes are complete.
- `smoke:cloud` creates temporary cloud records/assets and performs cleanup; use only against an intended configured environment.
- Never substitute production mutations for missing tests.
- Never print or expose credentials to prove configuration.

Safe ordinary verification is:

```text
npm run verify:repository
npm test
npm run check
npm run check:realtime
npm run build
```

## Execution channel

`GITHUB_RULES.md` owns exact-ref pinning, read economy, tool fit, transfer safety, one-logical-commit discipline, verification, retry ceilings, recovery, high-impact GitHub actions, and STOP behavior.

Repository-specific narrowing:

- No branch topology or ruleset is defined by this package.
- Do not create temporary workflows/branches/files to bypass a tool limitation.
- Browser and cloud claims require matching capability.
- External deployment mutations require explicit authority.
- Secrets and production data are never committed.

## User-facing communication

For non-trivial repository Development, a compact brief may use:

```text
Tujuan:
Batas:
Owner:
Bukti yang diperlukan:
Tidak diubah:
```

Final repository report:

```text
Status:
Hasil:
Bukti:
Batasan:
Next step:
```

Expose decisions and real proof, not private scratch reasoning.

## Product boundaries

MIVUBI Mosaic Plan is a physical pixel-mosaic planning application, not a generic raster editor or account platform.

Durable boundaries live in `docs/foundation/`. In particular:

- physical canvas/tile dimensions remain exact and grid-compatible;
- project schema, palette slots, empty cells, and exports must remain internally consistent;
- source images and project/cloud data follow their explicit size/security limits;
- viewer/editor authorization and revision semantics must not be weakened accidentally;
- browser-local conversion/export behavior and cloud persistence are distinct responsibility layers;
- production/database/storage/deployment state must not be mutated as a side effect of ordinary development.

## Completion

Stop when the requested scope and matching proof are satisfied.

Do not automatically:

- start the next recorded task;
- audit another subsystem;
- synchronize unrelated docs;
- refactor adjacent code;
- create another verifier;
- deploy;
- migrate a database;
- configure R2;
- publish a release;
- create GitHub branches/rulesets merely because they may be useful later.

Completion is a valid terminal state.
