# Cloud Smoke Runbook

Use this runbook only when end-to-end cloud integration proof is required and the target environment is explicitly intended for temporary test state.

## Preconditions

- application server is running and reachable through `SMOKE_BASE_URL` (default `http://127.0.0.1:5173`);
- realtime Worker/service is running and the application points to it;
- database migration is already appropriate for the target environment;
- root environment contains the required Neon/R2/realtime values;
- temporary project/device/R2 creation is acceptable.

Do not point this test at production merely because production credentials are available.

## Run

```sh
npm run smoke:cloud
```

The script exercises:

```text
device registration
→ project create
→ second participant join
→ two WebSocket connections
→ revision-guarded save
→ editor handoff
→ save by new editor
→ source image presign
→ R2 PUT
→ finalize
→ soft delete
→ restore
→ cleanup attempt
```

## Pass boundary

A successful command is evidence for the specific configured environment at that time.

It does not by itself prove:

- visual/browser UX;
- long-duration reconnect behavior;
- high concurrency;
- production deployment;
- cron execution;
- all failure/retry paths.

## Failure handling

On failure:

1. identify the first failed request/operation;
2. inspect only the matching API/service owner;
3. do not rerun repeatedly without new evidence;
4. verify cleanup if the script could not complete;
5. never print credentials while debugging.

Use `SECURITY.md` and `.agents/skills/cloud-development-validation/SKILL.md`.
