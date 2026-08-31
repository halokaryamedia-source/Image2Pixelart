# Deployment and Operations

Status: current operations boundary

## Principle

Development completion and deployment completion are separate states.

No test/build success automatically authorizes:

- database migration;
- production data mutation;
- R2 CORS change;
- Cloudflare Worker deployment;
- project-owner reassignment;
- stable/release publication.

Those require explicit operational intent.

## Safe deterministic verification

```sh
npm run verify:repository
npm test
npm run check
npm run check:realtime
npm run build
npm run verify:application
```

These commands should not require production secrets.

## External/environment-dependent commands

### Database migration

```sh
npm run db:migrate
```

Requires `DATABASE_URL` and changes the configured database.

Use the intended environment explicitly. Shared/production migration requires explicit authorization.

### Owner reassignment

```sh
npm run db:reassign-owner -- <project-id> <device-id-baru>
```

Administrative data mutation. Use only for the intended project/device after verifying exact identifiers.

### Realtime development

```sh
npm run realtime:dev
```

Runs the Worker locally with `realtime/.dev.vars` and current `wrangler.jsonc`.

### Realtime deployment

```sh
npm run realtime:deploy
```

Publishes Worker code/config. It is deployment, not verification.

### R2 CORS configuration

```sh
npm run r2:configure-cors
```

Uses `CLOUDFLARE_API_TOKEN`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, and optional `R2_ALLOWED_ORIGINS`.

It changes bucket configuration.

### Cloud smoke

```sh
npm run smoke:cloud
```

Requires both local services (or another intended application target) and cloud configuration.

The script creates temporary devices/project, connects realtime clients, saves/handoffs editor state, uploads/finalizes a small R2 object, exercises delete/restore, and attempts cleanup.

Use only against an environment where those side effects are acceptable.

## Environment ownership

Root application/server/script variables are documented in `.env.example`.

Worker local secrets are documented in:

```text
realtime/.dev.vars.example
```

Current Worker non-secret origin config lives in:

```text
realtime/wrangler.jsonc
```

Real credentials remain outside Git.

## Migration discipline

For a migration that has been applied to shared environments:

- preserve historical migration meaning;
- add a new numbered migration for subsequent schema changes;
- review compatibility with existing data;
- keep deployment order explicit;
- do not edit old applied SQL merely to make a clean install look simpler.

## Evidence language

Use accurate state labels:

```text
source/static verified
local build/test verified
browser verified
cloud integration verified
deployed environment verified
```

Do not upgrade a lower proof level into a higher one without executing it.
