# Current Validation Boundary

Status: durable proof interpretation + current handoff proof gaps

Automatic GitHub Actions CI is currently **deferred during active development**. The commands below remain the canonical local verification contracts and may be run when their proof is materially needed. Do not re-enable automatic CI merely as ceremony.

This file does not store chronological CI/run history. It records what each proof level can establish and which important current handoff areas still need evidence.

## Reader summary

A new developer must not treat the current Website Admin / Canvas / Editor work as fully verified merely because the source exists and older tests are present.

Current handoff distinction:

```text
SOURCE/STATIC
→ architecture, source routing, UI decisions, and handoff docs have been reviewed

LOCAL TEST/BUILD
→ still required on the latest handoff HEAD

BROWSER
→ still required for actual Home/Editor/Admin rendering and interaction claims

CLOUD / DATABASE
→ still required for configured Admin session, site_settings persistence, R2/realtime behavior

DEPLOYED TARGET
→ no current deployment acceptance should be inferred from repository state
```

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
- Grid utilities;
- color;
- palette utilities;
- crop geometry;
- RLE;
- CSV;
- PDF;
- cloud permissions;
- cloud project codec/pending upload.

These tests provide useful regression protection for their owners. They do **not** automatically prove the newer Website Admin / global Canvas / simplified image-flow contracts.

## Known targeted coverage gaps for the current handoff

Before calling the current implementation strongly regression-protected, inspect/add focused coverage for these areas where appropriate:

### Website Admin authentication

Primary source:

```text
src/lib/server/admin-auth.ts
src/routes/admin/login/+page.server.ts
```

Important behaviors that deserve targeted proof include:

- accepted/rejected Admin password verification;
- malformed/missing hash configuration;
- session signing/verification;
- expired/invalid Admin session rejection;
- route protection behavior;
- login rate-limit behavior where practical.

### Global Canvas settings

Primary source:

```text
src/lib/server/site-settings.ts
src/lib/site-settings.ts
```

Important behaviors that deserve targeted proof include:

- valid settings normalization/derivation;
- invalid width/height/cell combinations;
- derived columns/rows/total;
- fallback/default behavior when expected;
- database read/upsert contract where a safe test seam exists.

### New-project Canvas authority

Primary source:

```text
src/routes/api/projects/+server.ts
```

Important proof:

```text
matching Canvas payload
→ accepted when other project validation passes

mismatched width / height / cell / columns / rows
→ rejected
```

### Existing-file Canvas immutability

Primary source:

```text
src/routes/api/projects/[id]/+server.ts
```

Important proof:

```text
content-only edit with unchanged structure
→ may continue through normal editor/revision authorization

changed structural Canvas values
→ rejected
```

This guard should be tested independently from Website Admin status because the invariant applies to existing project saves.

### Project-level image conversion automation

Primary source:

```text
src/lib/image-project.ts
```

The newer one-action ordinary image flow depends on rules such as:

```text
empty palette + applyCells
→ automatically generate/apply image palette

changed requested color count
→ regenerate/apply compatible image palette

existing valid manually managed palette
→ preserve palette when automatic replacement is not required
```

Targeted tests should protect these decisions so future converter changes do not silently reintroduce the old mandatory visible `Saran Warna` pipeline.

### UI hierarchy

Source-level unit tests cannot prove the intended Editor hierarchy.

Important UI contracts include:

- left/right panels closed by default;
- Palet Cepat visible;
- Pencil/Eraser/Pan primary hierarchy;
- Pipet/Fill/Select secondary grouping;
- one `Ekspor` menu;
- ordinary Properti Canvas limited to `Ukuran Fisik` + `Ukuran Grid`;
- blank-work guidance;
- image settings marking the result stale.

`npm run check` can detect Svelte/type failures, but actual hierarchy/interaction still needs browser proof.

## Retired-source validation candidate

`src/lib/components/CollaborationBar.svelte` is explicitly marked as a retired ordinary-UI/deletion candidate.

Current handoff evidence indicates it is not part of the ordinary Editor authority, but deletion should happen only after a local usage scan confirms zero imports and Svelte/static proof still passes.

Suggested local sequence:

```sh
rg "CollaborationBar" src
npm run check
```

If there are zero active imports and checks remain clean, removal can be treated as bounded dead-source cleanup. Do not remove the underlying realtime/editor authorization infrastructure merely because this presentation component is retired.

## Browser proof required

Actual browser evidence is required for claims such as:

- rendered Home/Editor/Admin layout/fidelity;
- desktop/mobile responsive behavior;
- Canvas dominance and panel placement;
- pointer painting/dragging/panning;
- crop manipulation;
- image → Pixel Art update behavior;
- palette/detail workflow;
- focus/keyboard interaction;
- dropdown/modal behavior;
- export/download UX;
- console/runtime errors;
- browser network behavior.

`npm run check` or `npm run build` alone cannot upgrade these claims to BROWSER VERIFIED.

## Website Admin runtime proof required

Source/static presence of Admin code is not enough to prove a live Admin system.

Configured evidence is required for:

- valid Admin login;
- invalid login rejection;
- Admin session persistence/expiry;
- direct protected-route rejection without session;
- Canvas settings read/save;
- Home reading the active Canvas setting;
- new work snapshotting the setting;
- later Admin changes leaving an existing file unchanged.

This requires an intentionally configured environment with:

```text
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
DATABASE_URL
002_site_settings.sql applied to the intended database
```

Do not apply migration merely to obtain a green check unless the target database is explicitly intended for that operation.

## Cloud proof required

Actual configured cloud/runtime evidence is required for claims such as:

- Neon connectivity/data persistence;
- migration success in the intended environment;
- R2 PUT/finalize/delete behavior;
- CORS in the target environment;
- Durable Object/WebSocket behavior;
- active-editor/realtime authorization behavior;
- scheduled purge in the target environment;
- Vercel/Worker deployed behavior.

`npm run smoke:cloud` is the current broad integration probe, but its success applies only to the environment actually tested and it may create temporary external state.

## Reader-perspective proof audit

Before handing work to another developer, the proof summary must make these distinctions obvious:

```text
What source was inspected?
What command actually ran?
What interaction was actually observed?
What environment was actually mutated/tested?
What remains only inferred or unproven?
```

Do not use phrases such as “done”, “working”, or “verified” without enough context when a reader could reasonably interpret them as a higher proof level.

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
