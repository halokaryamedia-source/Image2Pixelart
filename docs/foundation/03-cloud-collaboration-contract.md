# Cloud Collaboration Contract

Status: current durable collaboration/security contract

## Identity

The application has no email/password account system.

A browser device stores:

- anonymous device ID;
- device secret;
- display name.

The ID can be used as an administrative/support identifier. The secret authenticates the device and must remain private.

## Project access

A user who knows a valid project UUID URL may be able to view/join the project according to the current public-link model.

The project URL is not a substitute for the device secret or editor authorization.

## Single active editor

A project has at most one active editor device in the current collaboration model.

Viewers may receive live updates. A viewer can request edit access. Authorized editor handoff changes the active editor state/epoch.

Only the currently authorized editor may persist project changes.

Do not weaken this invariant to make collaboration UX simpler.

## Revision guard

Durable project saves use revision guarding.

A stale client must not silently overwrite a newer durable revision. Conflict handling may evolve, but bypassing revision checks is not an acceptable fallback.

## Realtime

Cloudflare Worker/Durable Object provides:

- presence snapshot;
- edit-request state;
- active editor room state;
- project snapshot/patch distribution;
- save/delete notifications.

Realtime is transport/current-room state, not the canonical durable database.

A realtime-connected editor still requires server authorization for durable saves.

## Source image storage

The active project source image is stored in a private R2 bucket.

Browser upload flow:

```text
authorized device
→ presign request
→ short-lived R2 PUT URL
→ browser PUT
→ finalize metadata
```

Server/cloud credentials are never sent to the browser.

## Delete / restore

Projects use soft deletion with a current seven-day purge window. The owner may restore during that window according to current server behavior.

The scheduled purge endpoint requires `CRON_SECRET` and deletes expired project data/assets.

## Failure semantics

Cloud/realtime unavailability must not be disguised as successful persistence.

Browser drafts may provide recovery support, but a local draft is not proof that Neon/R2/realtime state was successfully persisted.

## Proof

Static/type/build evidence can prove contracts that are encoded in source. Actual multi-client WebSocket, database, R2 upload, and end-to-end handoff claims require an authorized cloud/runtime proof such as the current `smoke:cloud` flow or focused live validation.

See `SECURITY.md` and `04-deployment-operations.md`.
