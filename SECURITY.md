# Security and Data Handling

MIVUBI Mosaic Plan includes database, object-storage, realtime, and anonymous-device trust boundaries. Repository visibility is not permission to publish credentials or private production data.

## Never commit or publish

Do not commit, paste, echo, or log:

- Neon/PostgreSQL credentials or full production `DATABASE_URL`;
- R2 access keys, secret keys, account credentials, or deployment tokens;
- Cloudflare API tokens;
- Vercel access tokens or protected environment values;
- `REALTIME_TOKEN_SECRET`;
- `REALTIME_INTERNAL_SECRET`;
- `CRON_SECRET`;
- device secrets from browser localStorage;
- private keys, passwords, authorization headers, cookies, or session material;
- production database dumps;
- private source images or client/project files without explicit public-visibility approval;
- temporary encoded transfer payloads used only to move unsupported content through GitHub.

Do not place secret values in `PUBLIC_*` variables.

## Environment files

Committed templates:

```text
.env.example
realtime/.dev.vars.example
```

Local/private files:

```text
.env.local
.env
realtime/.dev.vars
```

Only safe placeholders belong in committed templates.

The root `.env.example` documents application/server/script variable names. `realtime/.dev.vars.example` documents Worker secrets for local Worker development.

## Application trust boundaries

### Anonymous device identity

The application uses an anonymous device ID plus secret. The ID can be used as an administrative/support identifier. The secret is an authentication credential and must not be published.

Do not expose device secrets in logs, public screenshots, issues/PRs, analytics, or error messages.

### Project URLs

A project UUID URL is discoverability capability, not strong authentication. Anyone who knows a valid project URL may be able to view that project according to the current product contract.

Do not describe the URL itself as confidential encryption/authentication.

### Active editor authorization

Only the active editor device should be able to persist project changes. Revision/editor-epoch checks and realtime authorization are security/integrity boundaries.

Do not weaken these checks merely to simplify collaboration behavior or make a test pass.

### Source images

Source images are stored in a private R2 bucket and uploaded through short-lived presigned URLs. Do not make the bucket public as a convenience workaround.

Browser clients must not receive R2 secret credentials.

## Cloud services

### Neon PostgreSQL

- Use least-privilege credentials appropriate to the environment.
- Do not use production credentials for routine local development when a separate development database is available.
- Treat database migration as an explicit operation.
- Never commit database dumps containing live project/device data.

### Cloudflare R2

- Object runtime credentials and CORS/deployment credentials may be separate.
- `scripts/configure-r2-cors.mjs` uses a Cloudflare API token and must not print that token.
- Keep the bucket private.
- Avoid broadening CORS beyond intended origins without an explicit requirement.

### Realtime Worker / Durable Objects

`REALTIME_TOKEN_SECRET` and `REALTIME_INTERNAL_SECRET` are shared trust material between the app and Worker.

- Use sufficiently strong secrets; current server code requires at least 32 characters for realtime token signing.
- Keep app/Worker values synchronized through environment configuration, not source code.
- Do not use GitHub Actions or logs to reveal them.
- `ALLOWED_ORIGINS` should remain intentionally scoped.

### Maintenance cron

`CRON_SECRET` authenticates the purge endpoint. Do not disable the check to simplify manual testing.

## Deployment and operations

These commands can mutate external state:

```text
npm run db:migrate
npm run db:reassign-owner -- ...
npm run realtime:deploy
npm run r2:configure-cors
npm run smoke:cloud
```

They require an intended environment and explicit authority.

`smoke:cloud` creates temporary devices, a project, realtime connections, and an R2 object, then attempts cleanup. Run it only where such temporary state is acceptable.

## Secret discovery

If a secret is discovered in current files or Git history:

1. do not reproduce its value in chat, an issue, PR, or report;
2. identify only the affected location and credential type;
3. stop adding new copies;
4. determine whether rotation/revocation is required;
5. treat history rewriting or repository visibility changes as explicit security operations.

Deleting a current file or adding it to `.gitignore` does not remove historical copies.

## Vulnerability reporting

Report suspected exposures or vulnerabilities directly to the repository owner/maintainer. Do not open a public issue containing sensitive reproduction data.

## Scope

This document owns repository/application data-handling boundaries. Third-party package vulnerabilities, platform incidents, content licensing, trademarks, and asset rights remain subject to their respective owners and policies.
