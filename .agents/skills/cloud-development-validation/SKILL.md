---
name: cloud-development-validation
description: Support skill for Image2Pixelart Neon, SvelteKit API trust boundaries, R2, anonymous device auth, revision/editor authorization, Cloudflare realtime/Durable Objects, migrations, cloud smoke, and deployment-sensitive changes. Separate source/static proof from external mutation and live cloud proof.
---

# Cloud Development Validation

Use for non-trivial work involving:

- `src/lib/server/`;
- `src/routes/api/`;
- `src/lib/cloud/` protocol/codec/auth-sensitive behavior;
- `db/migrations/`;
- R2 upload/finalize/delete;
- realtime tokens/internal authorization;
- `realtime/` Worker/Durable Object behavior;
- soft-delete/purge;
- Vercel/Cloudflare configuration;
- cloud smoke/deployment operations.

This support skill does not authorize deployment or production mutation.

## Authority

```text
current product/security Foundation
→ current source/schema/config
→ exact declared package/platform versions
→ official provider/framework docs when version-sensitive
→ local/static proof
→ authorized cloud/runtime proof
```

## Trust-boundary checks

When relevant verify:

- browser receives no database/R2/server secret;
- device ID and device secret are not conflated;
- viewer/editor authorization remains enforced;
- revision guard prevents stale durable overwrite;
- editor epoch/handoff semantics remain coherent between app and Worker;
- presigned upload is bounded to intended project/device/asset;
- R2 bucket privacy is preserved;
- internal Worker endpoints require internal authorization;
- origin/CORS changes are intentional;
- purge remains cron-secret protected;
- rate-limit/security failures are not bypassed for convenience.

## Database changes

For schema changes:

1. inspect current migration/schema consumers;
2. determine whether a new migration is required;
3. preserve applied migration history;
4. consider existing data compatibility;
5. test source/static behavior first;
6. run migration only with explicit intended-environment authority.

Do not edit an applied shared migration as routine cleanup.

## Proof ladder

```text
unit/static
→ npm test / npm run check / npm run check:realtime / npm run build

cloud integration
→ explicitly configured focused runtime test or npm run smoke:cloud

deployment target
→ actual deployed environment evidence when deployment behavior is claimed
```

A lower rung cannot prove a higher rung.

## Operations

Externally mutating commands:

```text
npm run db:migrate
npm run db:reassign-owner -- ...
npm run realtime:deploy
npm run r2:configure-cors
npm run smoke:cloud
```

Require explicit environment/authority. Never print credentials.

## Cloud smoke

Use `docs/knowledge/operations/cloud-smoke.md`.

Do not rerun repeatedly without new evidence after a known failure. Confirm cleanup/remaining temporary state when a smoke run aborts.

## Completion

Return:

```text
FINDING
AUTHORITY
ACTION
PROOF LEVEL
BLOCKER / OPERATION REQUIRED
```

Do not execute the operation unless it was explicitly authorized.
