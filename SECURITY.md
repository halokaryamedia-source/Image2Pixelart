# Security and Data Handling

MIVUBI Image2Pixelart includes Website Admin authentication, database, object-storage, realtime, and anonymous-device trust boundaries. Repository visibility is not permission to publish credentials, private project data, or production configuration.

## Reader summary

The current security model has two separate authentication domains:

```text
Website Admin authentication
→ dedicated Admin password hash + signed server-side session
→ website-level settings authority

Anonymous device/project authentication
→ device ID + device secret + active-editor/revision guards
→ project-specific persistence authority
```

These domains must not be merged. Project ownership or active-editor state does not grant Website Admin access.

## Never commit or publish

Do not commit, paste, echo, or log:

- Neon/PostgreSQL credentials or a real `DATABASE_URL`;
- R2 access keys, secret keys, account credentials, or deployment tokens;
- Cloudflare API tokens;
- Vercel access tokens or protected environment values;
- `ADMIN_PASSWORD_HASH` from a real configured Admin password;
- `ADMIN_SESSION_SECRET`;
- Website Admin session cookies/tokens;
- `REALTIME_TOKEN_SECRET`;
- `REALTIME_INTERNAL_SECRET`;
- `CRON_SECRET`;
- anonymous device secrets from browser localStorage;
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

The root `.env.example` documents application/server/script variable names. It does not authorize committing real values.

## Website Admin authentication

Current Admin authentication is website-level and independent from project/device identity.

Primary source:

```text
src/lib/server/admin-auth.ts
src/routes/admin/login/+page.server.ts
```

Current expected security properties:

- Admin password is verified against `ADMIN_PASSWORD_HASH`;
- password hashing uses scrypt;
- comparison is timing-safe;
- session signing/verification uses `ADMIN_SESSION_SECRET`;
- the Admin session cookie is HttpOnly;
- SameSite is Strict;
- Secure is enabled outside development;
- session lifetime is finite;
- login attempts are rate-limited;
- protected Admin routes require a valid server-side Admin session.

### Admin password handling

Do not:

- commit the plaintext Admin password;
- store the plaintext password in application source;
- place it in client-side JavaScript/localStorage;
- echo it in terminal logs, CI logs, screenshots, issues, PRs, or chat records;
- weaken hash verification merely to make local setup easier.

`scripts/hash-admin-password.mjs` exists to generate the configured hash outside source.

Treat a real `ADMIN_PASSWORD_HASH` as private runtime configuration because it can be used for offline password guessing if exposed.

### Admin session handling

Treat the `mivubi_admin_session` cookie as an authentication credential.

Do not:

- log its value;
- expose it through browser-visible application state;
- store a duplicate Admin token in localStorage;
- replace server-side route protection with a client-only flag;
- infer Admin status from `ownerDeviceId`, Device ID, project role, or active-editor state.

### Admin authorization boundary

The following is invalid:

```text
project.ownerDeviceId === currentDevice.id
→ Website Admin
```

Website Admin authority must remain backed by the dedicated Admin session.

## Anonymous device identity

The ordinary project system uses an anonymous device ID plus secret.

- the ID can be used as an administrative/support identifier;
- the device secret authenticates the device and must remain private;
- project ownership is project-specific and separate from Website Admin authority.

Do not expose device secrets in logs, public screenshots, issues/PRs, analytics, or error messages.

## Project URLs

A project UUID URL is a discoverability capability, not strong authentication.

Anyone who knows a valid project URL may be able to view/join that project according to the current project-access contract. The URL does not substitute for device-secret, active-editor, revision, or Website Admin authentication.

## Active editor authorization

Only the active editor device should be able to persist project changes.

Current integrity boundaries include:

```text
active editor device
editor epoch / realtime authorization
If-Match revision
stored project structural Canvas contract
```

Do not weaken these checks merely to simplify UI behavior or make a test pass.

Website Admin status does not silently bypass project revision/editor guards unless an explicit separate administrative capability is designed and approved.

## Website Canvas configuration

Global Canvas settings are website-level configuration stored through `site_settings`.

Security/integrity expectations:

- ordinary project creation cannot choose arbitrary structural Canvas values;
- project creation API validates against current Website settings;
- existing project saves cannot mutate stored structural Canvas values;
- Admin Canvas-setting writes require Website Admin session protection;
- client-side hiding alone is not an authorization boundary.

## Source images

Source images are stored in a private R2 bucket and uploaded through short-lived presigned URLs.

Browser upload flow:

```text
authorized project device
→ presign request
→ short-lived R2 PUT URL
→ browser PUT
→ finalize metadata
```

Server/cloud credentials are never sent to the browser.

Do not make the R2 bucket public as a convenience workaround.

## Cloud services

### Neon PostgreSQL

- use least-privilege credentials appropriate to the environment;
- do not use production credentials for routine local development when a separate development database is available;
- treat database migration as an explicit operation;
- never commit database dumps containing live project/device/settings data.

The `002_site_settings.sql` migration is source, not proof that a target database has already been migrated.

### Cloudflare R2

- runtime object credentials and CORS/deployment credentials may be separate;
- `scripts/configure-r2-cors.mjs` uses a Cloudflare API token and must not print that token;
- keep the bucket private;
- avoid broadening CORS beyond intended origins without an explicit requirement.

### Realtime Worker / Durable Objects

`REALTIME_TOKEN_SECRET` and `REALTIME_INTERNAL_SECRET` are shared trust material between the app and Worker.

- keep app/Worker values synchronized through environment configuration, not source;
- use sufficiently strong secrets;
- do not expose them in GitHub Actions or logs;
- keep `ALLOWED_ORIGINS` intentionally scoped.

Realtime project authorization remains independent from Website Admin authentication.

### Maintenance cron

`CRON_SECRET` authenticates the purge endpoint. Do not disable the check to simplify manual testing.

## Local development safety

For source/static verification, database migration is not required by default.

Prefer:

```sh
npm install
npm run verify:repository
npm run check
```

Only configure cloud services needed by the current task.

If a fresh development database must be initialized, first verify `DATABASE_URL` points to the intended disposable/development target before running:

```sh
npm run db:migrate
```

Do not run migrations on a shared or production database as routine setup.

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

`smoke:cloud` may create temporary devices, a project, realtime connections, and an R2 object before attempting cleanup. Run it only where such temporary state is acceptable.

## Secret discovery

If a secret is discovered in current files or Git history:

1. do not reproduce its value in chat, an issue, PR, or report;
2. identify only the affected location and credential type;
3. stop adding new copies;
4. determine whether rotation/revocation is required;
5. treat history rewriting or repository visibility changes as explicit security operations.

Deleting a current file or adding it to `.gitignore` does not remove historical copies.

## Reader-perspective handoff check

Before handing security-sensitive work to another developer, verify the documentation makes these points explicit:

```text
what is a credential?
which authentication domain owns it?
which server boundary enforces it?
what has actually been runtime-verified?
which environment mutations are still pending/not authorized?
```

Do not write a handoff that makes an unconfigured migration/session/deployment sound already live.

## Vulnerability reporting

Report suspected exposures or vulnerabilities directly to the repository owner/maintainer. Do not open a public issue containing sensitive reproduction data.

## Scope

This document owns repository/application data-handling and authentication boundaries. Third-party package vulnerabilities, platform incidents, content licensing, trademarks, and asset rights remain subject to their respective owners and policies.
