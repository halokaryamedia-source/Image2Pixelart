# Current Validation Boundary

Status: durable proof interpretation

Automatic GitHub Actions CI is currently **deferred during active development**. The commands below remain the canonical local verification contracts and may be run when their proof is materially needed. Do not re-enable automatic CI merely as ceremony.

This file does not store per-run IDs or chronological CI results. Current run status belongs to the execution surface that produced it. This owner records what each proof can and cannot establish.

## Deterministic repository/application proof

```text
npm run verify:repository
→ repository structure/governance/env-template/static policy

npm test
→ current Vitest unit/regression contracts

npm run check
→ Svelte/SvelteKit static/type diagnostics

npm run check:realtime
→ realtime Worker TypeScript contract

npm run build
→ production SvelteKit build compatibility

npm run verify:application
→ npm test + check + realtime check + build
```

A PASS means only the contract actually exercised passed.

## Existing regression areas

The source currently contains targeted tests for areas including:

- project serialization/migration;
- storage;
- history;
- editor shortcuts;
- panel preferences;
- image analysis;
- grid;
- color;
- palette;
- crop;
- RLE;
- CSV;
- PDF;
- cloud permissions;
- cloud project codec/pending upload.

Do not assume an untested browser/API/cloud path is covered merely because neighboring unit tests pass.

## Browser proof required

Actual browser evidence is required for claims such as:

- rendered layout/fidelity;
- responsive behavior;
- pointer painting/dragging/panning;
- crop manipulation;
- focus/keyboard interaction;
- modal behavior;
- download UX;
- console/runtime errors;
- browser network behavior.

`npm run check` or `npm run build` alone cannot upgrade these claims to verified.

## Cloud proof required

Actual configured cloud/runtime evidence is required for claims such as:

- Neon connectivity/data persistence;
- production/shared migration success;
- R2 PUT/finalize/delete behavior;
- CORS in the target environment;
- Durable Object/WebSocket behavior;
- multi-client edit request/handoff;
- scheduled purge in the target environment;
- Vercel/Worker deployed behavior.

`npm run smoke:cloud` is the current broad integration probe, but its success applies only to the environment actually tested.

## Evidence labels

Use when material:

```text
SOURCE/STATIC VERIFIED
LOCAL TEST/BUILD VERIFIED
BROWSER VERIFIED
CLOUD INTEGRATION VERIFIED
DEPLOYED TARGET VERIFIED
LOCAL PROOF REQUIRED
CLOUD PROOF REQUIRED
UNKNOWN
```

Never claim a higher evidence level from a lower one.
