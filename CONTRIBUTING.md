# Contributing

This repository is currently maintained as an internal MIVUBI development project. Public repository visibility does not automatically grant permission to publish secrets, private project data, or production credentials.

## Branch/ref boundary

This portable repository package intentionally does not prescribe a branch lifecycle.

Before working:

1. use the exact branch/ref selected by the maintainer or destination repository;
2. do not silently switch to a default or familiar branch;
3. follow any server-side protection/PR policy configured by that destination repository.

`AGENTS.md` owns task routing. `GITHUB_RULES.md` owns GitHub execution and commit discipline.

## Development workflow

Use the smallest path that can prove the requested result.

```text
understand requirement
→ inspect first owner
→ define acceptance
→ implement smallest complete change
→ run cheapest relevant proof
→ one logical commit
→ stop
```

For non-trivial work, use `.agents/skills/development-brief/SKILL.md`.

## Local setup

Prerequisite: Node.js 22.12 or newer.

```sh
npm install
cp .env.example .env.local
npm run db:migrate
npm run realtime:dev
npm run dev
```

`db:migrate` changes the configured database. Use a dedicated local/development database unless the task explicitly authorizes another environment.

Run the Worker and SvelteKit application in separate terminals.

## Verification

Repository/governance only:

```sh
npm run verify:repository
```

Targeted unit iteration:

```sh
npm test
```

Svelte/SvelteKit static validation:

```sh
npm run check
```

Realtime Worker static validation:

```sh
npm run check:realtime
```

Production build:

```sh
npm run build
```

Full deterministic application gate:

```sh
npm run verify:application
```

Cloud integration smoke:

```sh
npm run smoke:cloud
```

`smoke:cloud` requires a configured environment and running application + realtime service. It creates temporary project/device/R2 state and then attempts cleanup. It is not an ordinary per-commit test.

## Svelte development

When `.svelte` or SvelteKit behavior changes:

- use current declared Svelte/SvelteKit versions;
- prefer modern Svelte 5/runes patterns used by the project;
- do not mechanically modernize unrelated source;
- run `npm run check`;
- run build when public/runtime compatibility can be affected;
- obtain actual browser evidence for interaction/visual claims.

See `.agents/skills/svelte-development-validation/SKILL.md`.

## Cloud and data development

Changes involving `src/lib/server/`, `src/routes/api/`, `db/`, `realtime/`, R2, revision/editor authorization, or deployment configuration must preserve trust boundaries and use `.agents/skills/cloud-development-validation/SKILL.md` when non-trivial.

Do not run these merely as completion ceremony:

```text
npm run db:migrate
npm run db:reassign-owner
npm run realtime:deploy
npm run r2:configure-cors
```

External mutation requires explicit authority.

## Commit discipline

One coherent outcome should normally be one reviewable commit.

```text
feat:      new capability
fix:       behavior correction
docs:      documentation/policy-only change
refactor:  behavior-preserving restructuring
test:      test-contract-only change
ci:        CI/workflow change
build:     dependency/toolchain/build-system change
release:   explicit versioned publish/release state
chore:     bounded maintenance when no better category fits
```

Preferred format:

```text
<type>(<optional-scope>): <concise logical outcome>
```

Examples:

```text
fix(converter): preserve transparent cells in contour mode
feat(editor): add selection fill workflow
fix(realtime): reject stale editor epoch updates
docs(repo): establish portable development governance
ci(app): verify Svelte and Worker builds
```

Do not create checkpoint commits, transfer experiments, temporary workflows, placeholder files, or one commit per file for one logical change.

## Pull requests

When the destination repository uses PRs, use `.github/PULL_REQUEST_TEMPLATE.md` and keep one PR scoped to one logical delivery.

The template intentionally does not prescribe source/base branches or merge method because branch architecture is external/deferred.

## Generated/reference files

- `.svelte-kit/`, build output, Vercel/Cloudflare local state, coverage, and local env files are not repository source.
- Existing `docs/MIVUBI-UI-UX-Redesign/` and `docs/building/` material is reference/evidence, not automatic product authority.
- Fix canonical source rather than hand-editing generated output to make a check pass.
- Use Git history for retired versions instead of parallel backup/current copies.

## Security

Never commit real `.env.local`, `.dev.vars`, database URLs, cloud tokens, R2 credentials, realtime secrets, private keys, client/source data that is not approved for public visibility, or production database exports.

See `SECURITY.md`.

## Completion

When requested behavior and matching proof are complete, stop. Deployment, migration, R2 configuration, release publication, branch policy, and GitHub rulesets are separate explicit work.
