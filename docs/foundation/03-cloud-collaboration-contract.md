# Cloud Collaboration Contract

Status: current durable project-cloud/security contract

## Reader summary

This document describes **project cloud/realtime integrity infrastructure**, not the current ordinary collaboration UI.

Important distinction:

```text
backend/project collaboration capability
→ still contains single-active-editor, presence, edit-authorization, revision, realtime transport

ordinary Editor presentation
→ collaboration roster/request/handoff UI is currently retired
```

Do not reintroduce the retired UI merely because supporting endpoints/state still exist.

Website Admin is a separate website-level authentication domain and is not part of project collaboration identity.

## Identity

The ordinary project system has no email/password account model.

A browser device stores:

- anonymous device ID;
- device secret;
- display name.

The ID can be used as an administrative/support identifier. The secret authenticates the device and must remain private.

Anonymous device identity does **not** grant Website Admin access.

Website Admin uses a dedicated Admin password/session boundary owned by `src/lib/server/admin-auth.ts`.

## Project access

A user who knows a valid project UUID URL may be able to view/join the project according to the current public-link model.

The project URL is not a substitute for:

- device secret;
- active-editor authorization;
- revision guard;
- Website Admin authentication.

## Single active editor

A project has at most one active editor device in the current project-persistence model.

Only the currently authorized editor may persist project changes.

The backend/realtime model may retain presence, edit-request/grant, handoff/epoch, and related coordination state. Those capabilities are infrastructure and do not imply that ordinary Editor UI must display a collaboration management surface.

Do not weaken the single-active-editor invariant to simplify UI behavior.

## Revision guard

Durable project saves use revision guarding.

A stale client must not silently overwrite a newer durable revision. Conflict handling may evolve, but bypassing revision checks is not an acceptable fallback.

Existing project saves also preserve the stored structural Canvas contract. Project/editor authorization does not grant structural resize authority.

## Website Admin separation

Website Admin controls website-level settings such as the active global Canvas configuration for new work.

Project collaboration concepts do not grant Website Admin authority:

```text
project owner
active editor
viewer/participant
device ID
editor epoch
```

None of these should be interpreted as an Admin session.

Website Admin settings also do not silently bypass project active-editor/revision guards for ordinary project saves.

## Realtime

Cloudflare Worker/Durable Object provides project-room transport/state such as:

- presence snapshot;
- edit-request/authorization coordination where still used by backend flows;
- active editor room state/epoch;
- project snapshot/patch distribution;
- save/delete notifications.

Realtime is transport/current-room state, not the canonical durable database.

A realtime-connected editor still requires server authorization for durable saves.

The ordinary Editor may use realtime state internally without displaying a collaboration roster/request/handoff UI.

## Source image storage

The active project source image is stored in a private R2 bucket.

Browser upload flow:

```text
authorized project device
→ presign request
→ short-lived R2 PUT URL
→ browser PUT
→ finalize metadata
```

Server/cloud credentials are never sent to the browser.

## Delete / restore

Projects use soft deletion with a current seven-day purge window.

Current server behavior may restrict delete/restore to the project owner. That is a project-specific permission and does not make the owner Website Admin.

The scheduled purge endpoint requires `CRON_SECRET` and deletes expired project data/assets.

## Failure semantics

Cloud/realtime unavailability must not be disguised as successful persistence.

Browser drafts may provide recovery support, but a local draft is not proof that Neon/R2/realtime state was successfully persisted.

Likewise, source/static presence of Website Admin code is not proof that Admin secrets/migration/runtime are configured.

## Current UI boundary

Current ordinary Editor direction is intentionally simpler:

```text
Canvas-first Editor
→ project edit tools
→ Palet Cepat
→ image/palette/export workflows
```

Do not add back:

- participant roster;
- edit request button;
- handoff management UI;
- raw revision/device/editor-epoch status;

unless a new explicit product requirement approves that presentation.

The backend may remain because it still protects persistence/live transport.

## Proof

Static/type/build evidence can prove contracts encoded in source.

Actual claims about:

- multi-client WebSocket behavior;
- active-editor transfer/grant behavior;
- database persistence;
- R2 upload/finalize;
- target-environment realtime behavior;

require authorized cloud/runtime proof such as the current focused smoke/live validation.

Ordinary Editor visual/presentation claims require browser proof separately.

See `SECURITY.md`, `01-system-architecture.md`, `04-deployment-operations.md`, and `docs/knowledge/current-validation.md`.
