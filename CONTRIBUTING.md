# Contributing

This repository is maintained as an internal MIVUBI development project. Public repository visibility does not automatically grant permission to publish secrets, private project data, or production credentials.

## Reader-first handoff rule

Before changing code, read the repository as if you are a developer joining the project for the first time.

You should be able to answer:

```text
What is current?
What is retired/superseded?
What has already been implemented?
What is still unverified?
What is the next bounded action?
```

If those answers are unclear, update the canonical documentation owner instead of creating another parallel handoff file.

Current continuation owner:

```text
docs/knowledge/next-action.md
```

Current source-routing owner:

```text
docs/knowledge/implementation-map.md
```

## Branch/ref boundary

This portable repository package intentionally does not prescribe a branch lifecycle.

Before working:

1. use the exact branch/ref selected by the maintainer;
2. verify the branch has not moved before a write;
3. do not silently switch to a default/familiar branch;
4. follow any server-side protection/PR policy configured by the destination repository.

`AGENTS.md` owns task routing. `GITHUB_RULES.md` owns GitHub execution and commit discipline.

## Current product boundary to preserve

Do not confuse these concepts:

```text
Website Admin
→ website-level settings authority
→ dedicated Admin session

Project owner / device identity
→ project-specific persistence/ownership concept

Active editor
→ current project editing authorization
```

Project owner or active editor does not automatically become Website Admin.

Ordinary users do not receive structural Canvas controls. New work uses active Website Admin Canvas settings; existing work retains its stored Canvas snapshot.

For the full current model, read:

```text
docs/foundation/00-product-boundaries.md
docs/foundation/05-ui-design-system.md
docs/knowledge/next-action.md
```

## Development workflow

Use the smallest path that can prove the requested result.

```text
understand requirement
→ read current handoff/owner
→ inspect first relevant source owner
→ define acceptance
→ implement smallest complete change
→ run cheapest relevant proof
→ audit the result from the next reader/user perspective
→ state what passed vs remains unproven
→ one logical commit
→ stop
```

For non-trivial work, use `.agents/skills/development-brief/SKILL.md`.

## Local setup — do not mutate first

Prerequisite: Node.js 22.12 or newer.

For source/repository work, start with dependency install and deterministic checks. Do **not** make database migration the default first step.

```sh
npm install
npm run verify:repository
npm run check
```

Add targeted tests/build only when they can materially falsify the current change:

```sh
npm test
npm run check:realtime
npm run build
npm run verify:application
```

## Configured browser/cloud runtime

Only when the task actually requires a configured runtime:

```sh
cp .env.example .env.local
```

Configure the minimum services needed for that task using an intentionally selected development environment.

### Database

`npm run db:migrate` changes the configured database. It is **not** a harmless setup command.

Run it only when:

1. the task needs a database schema that is not already present;
2. `DATABASE_URL` has been checked and points to the intended development/test database;
3. external mutation is authorized for that environment.

Then:

```sh
npm run db:migrate
```

Do not migrate a shared/production database as routine local setup.

### Realtime

When the task requires realtime behavior, run Worker and SvelteKit in separate terminals:

```sh
npm run realtime:dev
npm run dev
```

A task that only changes source/docs does not require starting every cloud service.

## Verification

Automatic GitHub Actions CI is intentionally **deferred during active development**. Do not re-enable CI merely as ceremony.

### Repository/governance

```sh
npm run verify:repository
```

Proves repository structure/governance/env-template/static policy only.

### Unit/regression

```sh
npm test
```

Use targeted tests while iterating when possible.

### Svelte/SvelteKit static validation

```sh
npm run check
```

Run when `.svelte`, route, SvelteKit, or TypeScript behavior is materially affected.

### Realtime Worker static validation

```sh
npm run check:realtime
```

### Production build

```sh
npm run build
```

### Full deterministic application gate

```sh
npm run verify:application
```

This runs tests + Svelte check + realtime check + production build.

### Browser proof

Actual browser evidence is required for claims about:

- layout/visual hierarchy;
- desktop/mobile responsive behavior;
- pointer painting/panning;
- crop manipulation;
- focus/keyboard interaction;
- dropdown/modal/panel placement;
- download behavior;
- console/runtime/network errors.

Do not call a UI “verified” from source review alone.

### Cloud/runtime proof

Configured runtime evidence is required for claims about:

- Admin login/session;
- persisted Website Canvas settings;
- Neon persistence;
- R2 upload/finalize;
- realtime multi-client behavior;
- deployed application/Worker behavior.

## Svelte development

When `.svelte` or SvelteKit behavior changes:

- use current declared Svelte/SvelteKit versions;
- prefer the Svelte 5/runes patterns already used by the project;
- do not mechanically modernize unrelated source;
- preserve the approved MIVUBI visual identity unless a visual change is explicitly requested;
- run `npm run check` when static Svelte proof is material;
- obtain browser evidence before claiming interaction/visual acceptance.

See `.agents/skills/svelte-development-validation/SKILL.md`.

## UI work

Current UI work is a simplification of the existing MIVUBI interface, not permission for a visual redesign.

Before editing UI, read:

```text
docs/foundation/05-ui-design-system.md
docs/knowledge/editor-ui-decisions.md
docs/knowledge/ui-preservation-contract.md
docs/knowledge/ui-language-contract.md
```

Do not revive retired concepts simply because they remain in Git history.

Superseded architecture includes:

```text
project owner = Website Admin
PlayerEditorView.svelte
AdminProjectView.svelte
AdminEditorView.svelte
ProjectEditorRoute.svelte
/admin/project/[id]
ordinary-user Canvas resize controls
```

## Cloud and data development

Changes involving `src/lib/server/`, `src/routes/api/`, `db/`, `realtime/`, R2, revision/editor authorization, Website Admin authentication, Canvas settings, or deployment configuration must preserve trust boundaries.

Use `.agents/skills/cloud-development-validation/SKILL.md` for non-trivial cloud work.

Do not run these as completion ceremony:

```text
npm run db:migrate
npm run db:reassign-owner
npm run realtime:deploy
npm run r2:configure-cors
npm run smoke:cloud
```

External mutation requires an intended target environment and explicit authority.

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

Do not create checkpoint commits, transfer experiments, temporary workflows, placeholder files, or one commit per file for one logical change.

## Pull requests

When the destination repository uses PRs, use `.github/PULL_REQUEST_TEMPLATE.md` and keep one PR scoped to one logical delivery.

The template intentionally does not prescribe source/base branches or merge method because branch architecture is external/deferred.

## Generated/reference files

- `.svelte-kit/`, build output, Vercel/Cloudflare local state, coverage, and local env files are not repository source;
- `docs/MIVUBI-UI-UX-Redesign/` and `docs/building/` are reference/evidence, not automatic product authority;
- fix canonical source rather than hand-editing generated output to make a check pass;
- use Git history for retired versions instead of parallel backup/current copies.

## Security

Never commit real `.env.local`, `.dev.vars`, database URLs, R2 credentials, Cloudflare/Vercel tokens, realtime secrets, Website Admin secrets/hashes/session material, private keys, device secrets, client/source data that is not approved for public visibility, or production database exports.

See `SECURITY.md`.

## Handoff quality checklist

Before handing a slice to the next developer, audit the repository from their perspective:

```text
[ ] entry-point README/CONTEXT describe the current architecture
[ ] current vs retired behavior is explicit
[ ] implemented vs unverified behavior is explicit
[ ] source owners are listed, not guessed
[ ] next-action contains exactly one next meaningful step
[ ] proof level is stated without exaggeration
[ ] no deployment/migration is implied as already complete when it is not
[ ] no stale component/doc is presented as current authority
[ ] commands distinguish read/check work from external mutation
```

If a reader would reasonably misunderstand the current state, the handoff is not finished yet.

## Completion

When requested behavior and matching proof are complete, stop. Deployment, migration, R2 configuration, release publication, branch policy, and GitHub rulesets are separate explicit work.
