# GitHub Rules

Canonical GitHub execution policy for AI/ChatGPT working with this repository package.

Repository `AGENTS.md` may narrow product/domain behavior, but it must not weaken safety, integrity, proof, history, security, retry, or STOP boundaries here.

## Branch policy boundary

This package deliberately does **not** prescribe a branch lifecycle or GitHub ruleset.

Before any write, the exact repository and branch/ref must come from the current user instruction or destination repository policy. Never infer a `develop`, `Local`, `main`, release, or protected-branch topology from another project.

```text
PIN
→ READ MINIMUM
→ DIAGNOSE
→ TOOL + TRANSFER GATE
→ WRITE ONCE
→ VERIFY + FAILURE POLICY
→ STOP
```

# Core Rules

## 1. PIN — establish exact current authority

Before a material mutation, know:

```text
repository
exact intended branch/ref
current HEAD when materially relevant
requested scope
whether the target is writable
```

Rules:

- Direct branch/file state is current-state authority; search is discovery.
- Never silently fall back to the default branch.
- Every write explicitly targets the intended ref when supported.
- Treat repository-designated protected/stable/production/release refs as read-only unless the current task or repository policy authorizes the write.
- Re-check HEAD immediately before a ref move when concurrent movement could overwrite newer work.
- Replacement/deletion uses the current content/blob authority from the exact target ref.
- Keep blob SHA, tree SHA, commit SHA, ref, workflow run ID, and other identifiers distinct.

## 2. READ MINIMUM — read only what can change the decision

Default after any required boot:

```text
owner/source reads   1–3
history reads        0
broad scans          0
```

- Prefer direct fetch when the exact path is known.
- Open more only for a concrete unresolved question.
- Truncated, paginated, partial, or capped output is incomplete evidence, not proof of absence.
- Verify exact repository/ref/access once before concluding a known target is missing.
- Do not read old commits, review archives, or adjacent subsystems merely for reassurance.
- History is useful only when rationale/regression origin can change the current decision.

## 3. DIAGNOSE — fix the first wrong owner

Establish actual versus expected behavior before writing.

```text
requirement / meaning wrong
→ semantic owner

implementation wrong
→ implementation owner

implementation correct + test stale
→ test owner

implementation/test correct + CI routing wrong
→ workflow / repository verifier

runtime capability unavailable
→ capability/environment boundary

derived artifact wrong
→ upstream canonical owner
```

- Do not widen Maintenance into redesign.
- Do not bundle unrelated cleanup, refactors, dependency upgrades, compatibility layers, documentation synchronization, or framework creation.
- CI failure is evidence to diagnose, not permission to change the easiest file.
- Historical TODOs and old failures are not active work unless current state reproduces them or the user explicitly reactivates them.
- `No change required` is valid.

## 4. TOOL + TRANSFER GATE — choose a method that natively fits

Use the simplest capability that can safely produce the required final state.

```text
current exact file/ref
→ direct GitHub fetch

one bounded independent UTF-8 file
→ contents-style update may fit

coherent multi-file delivery /
atomic commit matters /
many coordinated hunks /
binary or real Git semantics
→ proper atomic Git capability or local git workspace

browser/runtime claim
→ actual browser capability

cloud/deployment claim
→ actual authorized cloud/runtime capability

final payload cannot be transferred natively
→ Manual Handoff
```

Before the first write establish:

```text
final intended content ready?
exact repo/ref/path known?
complete logical file set known?
hardest artifact can be carried?
method preserves acceptable history?
matching proof boundary known?
```

Any NO means do not start the repository mutation.

### Hard transfer prohibitions

Connector limitations must not change product or repository architecture.

Never create solely as a transfer workaround:

- placeholder final files;
- loaders/bootstrap files;
- artificial fragments;
- base64 stand-ins for ordinary binaries;
- transfer-only manifests;
- temporary workflows;
- temporary branches;
- alternate repository structures;
- scratch commits;
- generated wrappers whose only purpose is carrying unsupported content.

Also:

- Never full-replace a file from partial context.
- Never split a contents update into chunks; it replaces a whole file.
- Low-level Git objects are valid only for a genuinely atomic Git delivery that is already fully prepared, not as an iterative scratch editor.
- Do not force-push, rewrite shared history, destructive-reset remote refs, or alter branch policy to recover from a connector limitation or messy attempt.
- GitHub Actions is verification/deployment infrastructure, not a remote shell or substitute development environment.

### Manual Handoff

If direct GitHub transfer does not fit:

1. Stop the unsupported write path.
2. Finish and validate the exact final artifact/package locally.
3. Provide the file/ZIP to the user.
4. Give an exact placement contract.
5. State repository state accurately.
6. Do not claim GitHub contains an artifact that has not been uploaded.

Placement contract:

```text
repository:
branch/ref:
repo root:
destination:
action: upload | replace | merge | extract
expected result:
repo state:
```

## 5. WRITE ONCE — one meaningful logical state

Prepare the complete intended logical result before repository mutation.

- One intentional write per file is the default.
- One coherent requested outcome is one logical commit by default.
- Same-file and overlapping writes are serial.
- Do not split one coherent change by file, directory, technical layer, tool call, or discovery order.
- For coordinated multi-file work, know the full file set and the hardest required artifact before moving the target ref.
- If target HEAD moves materially, refetch affected state and rebuild from current authority.
- Preserve lockfiles, runtime/version constraints, and pinned/trusted action references unless they are the actual owner of the requested change.
- New files, workflows, abstractions, branches, PRs, issues, comments, labels, tags, releases, and other persistent side effects default to zero unless the task proves a need.
- Keep one canonical owner for durable state where practical.

### Commit discipline

A commit is a categorized logical delivery, not a save point, checkpoint, reasoning step, CI trigger, transfer experiment, or proof marker.

Default format:

```text
<type>(<optional-scope>): <concise logical outcome>
```

Categories:

```text
feat:      new user/repository capability
fix:       wrong behavior or regression
docs:      documentation/policy-only outcome
refactor:  internal restructuring without intended behavior change
test:      test-contract-only outcome
ci:        CI/workflow change
build:     dependency/toolchain/build-system change
release:   explicit versioned publish/release state
chore:     bounded maintenance that fits none above; use sparingly
```

Rules:

- Tests/docs supporting the same fix may live in the same `fix:` commit.
- Split commits only for independently reviewable/revertible outcomes.
- Never split because a tool can only update one file at a time; choose an atomic method or handoff.
- Vague messages such as `update`, `changes`, `fix again`, `try`, `sync`, `final`, or `misc` are not acceptable history.
- Do not rewrite published/shared history merely to make it prettier without explicit authority.

## 6. VERIFY + FAILURE POLICY — prove only what matters

Validation is evidence, not ceremony.

- Use the cheapest check capable of falsifying the changed claim.
- Targeted tests are preferred during iteration.
- Use broader final verification only when the changed contract can actually be affected.
- Only a completed successful run is PASS. Queued, running, cancelled, skipped, neutral, or superseded is not PASS.
- On CI failure, inspect the failing job/step and relevant error before editing.
- Do not weaken/delete/bypass a valid verifier merely to obtain green status.
- Change a test/workflow only when evidence shows it is the first wrong owner.
- Static/CI proof does not prove browser rendering, interaction, deployment, DB state, R2 behavior, WebSocket behavior, or cloud configuration unless those contracts actually executed.

Repository proof surfaces:

```text
repository/governance
→ npm run verify:repository

unit/application
→ npm test

Svelte/SvelteKit static
→ npm run check

Realtime Worker TypeScript
→ npm run check:realtime

production build compatibility
→ npm run build

full deterministic application gate
→ npm run verify:application

browser claims
→ real browser evidence

cloud integration
→ explicitly authorized configured npm run smoke:cloud or equivalent live proof
```

### Retry matrix

Retry budgets are ceilings, not quotas.

| Failure class | Required action |
| --- | --- |
| Known capability mismatch / unsupported transfer | STOP method; 0 retries; choose fitting path |
| Permission/safety denial | STOP; 0 retries unless condition changes |
| Capability genuinely uncertain | At most 1 bounded probe |
| Valid method but malformed/422 request | Correct once |
| Missing/inaccessible/404 | Verify exact repo/ref/target once |
| Conflict/stale state/409 | Refetch current state once; retry only from it |
| Rate limit/429 | Respect retry/reset guidance |
| Timeout/5xx/unknown mutation outcome | Inspect target state before retry |
| Same-cause valid-method failure with new evidence | Maximum 2 attempts |

Changing endpoints, encodings, Git-object types, tools, or helper representations does not reset the ceiling.

### Interrupted delivery

If current-task repository writes already occurred before a block, perform at most one bounded recovery pass:

1. stop new experiments;
2. identify exact current-task changes;
3. remove only accidental current-task artifacts when safe;
4. preserve legitimate durable changes;
5. avoid history rewrite;
6. disclose any remaining partial state;
7. hand off if needed;
8. STOP.

## 7. STOP — completion is terminal

Stop when:

```text
requested outcome + matching proof satisfied
→ STOP

capability mismatch + valid handoff delivered
→ STOP

permission/safety/policy boundary blocks the operation
→ report boundary → STOP
```

Do not automatically:

- audit another layer;
- fix adjacent issues;
- synchronize unrelated docs;
- create proof-of-proof;
- start deployment;
- run DB migrations;
- configure R2;
- publish a release;
- create branches/rulesets;
- continue merely because more tooling exists.

## Default efficiency budget

```text
owner/source reads              1–3 after boot
history reads                   0
broad scans                     0
uncertain-capability probe      <= 1
same-cause retry                <= 2
capability-denial retry         0
transfer strategies             1 default; 2 maximum only when root limitation changes
intentional writes/file         1
logical commits/task            1 by default
relevant CI                     0–1 per proof surface
placeholder/transfer hacks      0
adjacent cleanup                0
high-impact mutations           0 unless explicitly authorized
```

# Conditional GitHub Surfaces

## Pull requests, merge actions, branch protection, and rulesets

Only apply when the task actually involves them.

- Refresh PR head/base/mergeability/checks/reviews before a merge decision.
- Repository protection and required reviews/checks are authority, not errors to bypass.
- Branch/tag deletion, PR merge/close, release publication/deletion, environment bypass, repository settings, permissions, and ruleset changes require explicit task authority and an exact target.
- This repository package does not define the destination repository's branch topology or rulesets.

## GitHub Actions

- Workflows run only on events/paths their checks can falsify.
- A correctly skipped irrelevant workflow is not missing proof.
- Verification workflows are read-only by default.
- Do not create one-shot workflows to compensate for missing local/browser/cloud capability.
- Use least-privilege token permissions.
- Preserve trusted/pinned action versions unless the action version is the actual owner of a change.
- Treat event-derived strings as untrusted input.
- Never execute untrusted PR code with secrets/write tokens through privileged contexts merely to make CI convenient.
- Cloud credentials should not be required by ordinary repository/application verification.

## Special files and generated artifacts

Distinguish normal UTF-8 text from binaries, Git LFS pointers, symlinks, submodules, generated artifacts, and files outside tool limits.

- Never hand-edit an LFS pointer as content.
- Generated output follows its canonical source and generator.
- Compression does not make an unsupported transfer method valid.
- Existing binary-heavy `docs/` reference material is not automatically product authority.

## Secrets, data, cloud, and deployment

- Never commit, paste, echo, log, or move real credentials into source, workflows, issues, PRs, comments, docs, or test fixtures.
- If a secret is discovered, report location/type without reproducing the value.
- Never place secrets in `PUBLIC_*` variables.
- Production DB migrations, R2 CORS mutation, Worker deployment, owner reassignment, cron changes, and equivalent external operations require explicit authority.
- `npm run smoke:cloud` is integration evidence with external side effects, not an ordinary unit test.
- Environment/release/deployment approval gates are authoritative constraints, not failures to bypass.
